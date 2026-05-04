/**
 * Recursive walk of a Google Drive folder via service account.
 *
 * Outputs:
 *   tmp/drive-walk-<rootId>.json  — full tree manifest
 *   tmp/drive-walk-<rootId>.tsv   — flat file list (path \t name \t mime \t size \t modifiedTime \t id)
 *
 * Usage:
 *   pnpm tsx scripts/drive-walk.ts <folderId>
 *   pnpm tsx scripts/drive-walk.ts <folderId> --max-depth 3
 *
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY env var pointing to SA JSON file.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '/Users/dknespl/.config/csh-gdrive-sa.json';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  parents?: string[];
}

interface Node {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: number;
  isFolder: boolean;
  children?: Node[];
  path: string;
  depth: number;
}

// ─── Auth via JWT direct ────────────────────────────────────────────────

async function getAccessToken(saKeyPath: string): Promise<string> {
  const raw = readFileSync(saKeyPath, 'utf-8');
  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now,
  };
  // Build JWT manually using crypto
  const { createSign } = await import('node:crypto');
  const header = { alg: 'RS256', typ: 'JWT' };
  const enc = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc(header)}.${enc(claim)}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const jwt = `${unsigned}.${sig}`;

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status} ${await resp.text()}`);
  const data = (await resp.json()) as { access_token: string };
  return data.access_token;
}

// ─── Drive API client ───────────────────────────────────────────────────

async function listFolder(token: string, folderId: string): Promise<DriveFile[]> {
  const all: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id,name,mimeType,modifiedTime,size,parents)',
      pageSize: '1000',
      orderBy: 'name',
    });
    if (pageToken) params.set('pageToken', pageToken);
    // Required for legacy "0B-" style folders + their resourceKey-protected children
    const r = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Goog-API-Client': 'csh-walk/1.0' },
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`list ${folderId}: ${r.status} ${t.slice(0, 200)}`);
    }
    const data = (await r.json()) as { files: DriveFile[]; nextPageToken?: string };
    all.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return all;
}

async function getFolderName(token: string, id: string): Promise<string> {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=name`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok) throw new Error(`getFolderName: ${r.status}`);
  const d = (await r.json()) as { name: string };
  return d.name;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

// ─── Walker ─────────────────────────────────────────────────────────────

interface WalkStats {
  totalFiles: number;
  totalFolders: number;
  totalBytes: number;
  byMime: Record<string, { count: number; bytes: number }>;
  apiCalls: number;
  errors: { folder: string; err: string }[];
}

async function walk(
  token: string,
  rootId: string,
  rootName: string,
  maxDepth = Infinity,
): Promise<{ tree: Node; stats: WalkStats; flatList: Node[] }> {
  const stats: WalkStats = {
    totalFiles: 0,
    totalFolders: 0,
    totalBytes: 0,
    byMime: {},
    apiCalls: 0,
    errors: [],
  };
  const flatList: Node[] = [];

  async function visit(folderId: string, parentPath: string, depth: number): Promise<Node[]> {
    if (depth > maxDepth) return [];
    let entries: DriveFile[];
    try {
      stats.apiCalls++;
      entries = await listFolder(token, folderId);
    } catch (e) {
      stats.errors.push({ folder: parentPath, err: String(e).slice(0, 200) });
      return [];
    }
    const nodes: Node[] = [];
    for (const f of entries) {
      const isFolder = f.mimeType === FOLDER_MIME;
      const path = `${parentPath}/${f.name}`;
      const sizeNum = f.size ? parseInt(f.size, 10) : undefined;
      const node: Node = {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        modifiedTime: f.modifiedTime,
        size: sizeNum,
        isFolder,
        path,
        depth,
      };
      if (isFolder) {
        stats.totalFolders++;
        node.children = await visit(f.id, path, depth + 1);
      } else {
        stats.totalFiles++;
        if (sizeNum) stats.totalBytes += sizeNum;
        const mt = f.mimeType;
        stats.byMime[mt] = stats.byMime[mt] || { count: 0, bytes: 0 };
        stats.byMime[mt].count++;
        if (sizeNum) stats.byMime[mt].bytes += sizeNum;
        flatList.push(node);
      }
      nodes.push(node);
      // Throttle: be polite to Drive API
      await new Promise((r) => setTimeout(r, 30));
    }
    return nodes;
  }

  const tree: Node = {
    id: rootId,
    name: rootName,
    mimeType: FOLDER_MIME,
    isFolder: true,
    path: rootName,
    depth: 0,
    children: [],
  };
  tree.children = await visit(rootId, rootName, 1);
  stats.totalFolders++; // include root

  return { tree, stats, flatList };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

async function main() {
  const args = process.argv.slice(2);
  const folderId = args[0];
  if (!folderId) {
    console.error('Usage: pnpm tsx scripts/drive-walk.ts <folderId> [--max-depth N]');
    process.exit(1);
  }
  const maxDepthIdx = args.indexOf('--max-depth');
  const maxDepth = maxDepthIdx >= 0 ? parseInt(args[maxDepthIdx + 1], 10) : Infinity;

  console.log(`Auth via SA: ${KEY_PATH}`);
  const token = await getAccessToken(KEY_PATH);
  console.log(`✓ Token acquired`);

  console.log(`Resolving root folder ${folderId}...`);
  const rootName = await getFolderName(token, folderId);
  console.log(`✓ Root: ${rootName}\n`);

  const t0 = Date.now();
  const { tree, stats, flatList } = await walk(token, folderId, rootName, maxDepth);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // Output: tree JSON + flat TSV
  const outDir = join(process.cwd(), 'tmp');
  const baseFile = `drive-walk-${folderId.slice(0, 12)}`;
  const treeFile = join(outDir, `${baseFile}.json`);
  const tsvFile = join(outDir, `${baseFile}.tsv`);

  writeFileSync(treeFile, JSON.stringify(tree, null, 2));
  const tsv = ['path\tname\tmime\tsize\tmodifiedTime\tid']
    .concat(
      flatList.map(
        (n) =>
          `${n.path}\t${n.name}\t${n.mimeType}\t${n.size ?? ''}\t${n.modifiedTime ?? ''}\t${n.id}`,
      ),
    )
    .join('\n');
  writeFileSync(tsvFile, tsv);

  // Report
  console.log(`Walk complete in ${elapsed}s (${stats.apiCalls} API calls)`);
  console.log(`  Folders: ${stats.totalFolders}`);
  console.log(`  Files:   ${stats.totalFiles}`);
  console.log(`  Total:   ${formatBytes(stats.totalBytes)}`);
  if (stats.errors.length) {
    console.log(`  ⚠ Errors: ${stats.errors.length}`);
    for (const e of stats.errors.slice(0, 5)) console.log(`    - ${e.folder}: ${e.err}`);
  }
  console.log(`\nBy MIME type (top 15):`);
  const mimeArr = Object.entries(stats.byMime).sort((a, b) => b[1].count - a[1].count);
  for (const [mt, s] of mimeArr.slice(0, 15)) {
    console.log(`  ${mt.padEnd(60)} ${String(s.count).padStart(5)}  ${formatBytes(s.bytes)}`);
  }

  console.log(`\nWritten:`);
  console.log(`  ${treeFile}`);
  console.log(`  ${tsvFile}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
