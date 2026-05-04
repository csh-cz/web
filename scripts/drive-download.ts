/**
 * Download files from Google Drive via service account credentials.
 *
 * Usage: pnpm tsx scripts/drive-download.ts <fileId> <outputPath> [<fileId> <outputPath> ...]
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const KEY_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
  '/Users/dknespl/.config/csh-gdrive-sa.json';

async function getToken(): Promise<string> {
  const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now,
  };
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc(claim)}`;
  const sig = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(sa.private_key, 'base64url');
  const jwt = `${unsigned}.${sig}`;
  const r = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!r.ok) throw new Error(`Token: ${r.status} ${await r.text()}`);
  return ((await r.json()) as { access_token: string }).access_token;
}

async function download(token: string, fileId: string, outPath: string) {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok) throw new Error(`download ${fileId}: ${r.status} ${await r.text()}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`✓ ${outPath} (${buf.length} bytes)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.length % 2 !== 0) {
    console.error('Usage: pnpm tsx scripts/drive-download.ts <fileId> <outputPath> [<fileId> <outputPath> ...]');
    process.exit(1);
  }
  const token = await getToken();
  for (let i = 0; i < args.length; i += 2) {
    await download(token, args[i], args[i + 1]);
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
