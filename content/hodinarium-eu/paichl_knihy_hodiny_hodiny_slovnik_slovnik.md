---
title: "paichl_knihy_hodiny_hodiny_slovnik_slovnik"
slug: "paichl_knihy_hodiny_hodiny_slovnik_slovnik"
category: "zajimavosti"
originalUrl: "https://hodinarium.eu/paichl/knihy/hodiny/hodiny_slovnik/slovnik.htm"
lastModified: "Wed, 05 Mar 2025 20:05:23 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:27.991Z"
tldr: "\"; with (frames\\['frScroll'\\].document) { open(\"text/html\",\"replace\"); write(szHTML); close(); } szHTML = \"\"+ \"A:link,A:visited,A:active {text-decoration:none;\"+\"color:\"+c\\_rgszClr\\[3\\]+\";}\"+ \".clTab…"
---
"+ ""+ ""+ ""+ ""+ ""+ "

"+ "

«

<

\>

»

"; with (frames\['frScroll'\].document) { open("text/html","replace"); write(szHTML); close(); } szHTML = ""+ "A:link,A:visited,A:active {text-decoration:none;"+"color:"+c\_rgszClr\[3\]+";}"+ ".clTab {cursor:hand;background:"+c\_rgszClr\[1\]+";font:9pt Arial;padding-left:3px;padding-right:3px;text-align:center;}"+ ".clBorder {background:"+c\_rgszClr\[2\]+";font:1pt;}"+ ""; var iCellCount=(c\_lTabs+1)\*2; var i; for (i=0;i"; else { if (iRow==0) { for(i=0;i"; } else if (iRow==1) { for(i=0;i"; szHTML+= ""; } szHTML+=""; } else if (iRow==2) { for (i=0;i"; szHTML+=""; } else if (iRow==3) { for (i=0;i0) { for (i=0;ioffsetWidth+scrollLeft) { for (i=0;i\=0) { frames\['frTabs'\].scroll(g\_rglTabX\[iNextTab\],0); return true; } else return false; } function fnFastScrollTabs(fDir) { if (c\_lTabs>16) frames\['frTabs'\].scroll(g\_rglTabX\[fDir?c\_lTabs-1:0\],0); else if (fnScrollTabs(fDir)>0) window.setTimeout("fnFastScrollTabs("+fDir+");",5); } function fnSetTabProps(iTab,fActive) { var iCol=fnTabToCol(iTab); var i; if (iTab>=0) { with (frames\['frTabs'\].document.all) { with (tbTabs) { for (i=0;i<=4;i++) { with (rows\[i\]) { if (i==0) cells\[iCol\].style.background=c\_rgszClr\[fActive?0:2\]; else if (i>0 && i<4) { if (fActive) { cells\[iCol-1\].style.background=c\_rgszClr\[2\]; cells\[iCol\].style.background=c\_rgszClr\[0\]; cells\[iCol+1\].style.background=c\_rgszClr\[2\]; } else { if (i==1) { cells\[iCol-1\].style.background=c\_rgszClr\[2\]; cells\[iCol\].style.background=c\_rgszClr\[1\]; cells\[iCol+1\].style.background=c\_rgszClr\[2\]; } else { cells\[iCol-1\].style.background=c\_rgszClr\[4\]; cells\[iCol\].style.background=c\_rgszClr\[(i==2)?2:4\]; cells\[iCol+1\].style.background=c\_rgszClr\[4\]; } } } else cells\[iCol\].style.background=c\_rgszClr\[fActive?2:4\]; } } } with (aTab\[iTab\].style) { cursor=(fActive?"default":"hand"); color=c\_rgszClr\[3\]; } } } } function fnMouseOverScroll(iCtl) { frames\['frScroll'\].document.all.tdScroll\[iCtl\].style.color=c\_rgszClr\[7\]; } function fnMouseOutScroll(iCtl) { frames\['frScroll'\].document.all.tdScroll\[iCtl\].style.color=c\_rgszClr\[6\]; } function fnMouseOverTab(iTab) { if (iTab!=g\_iShCur) { var iCol=fnTabToCol(iTab); with (frames\['frTabs'\].document.all) { tdTab\[iTab\].style.background=c\_rgszClr\[5\]; } } } function fnMouseOutTab(iTab) { if (iTab>=0) { var elFrom=frames\['frTabs'\].event.srcElement; var elTo=frames\['frTabs'\].event.toElement; if ((!elTo) || (elFrom.tagName==elTo.tagName) || (elTo.tagName=="A" && elTo.parentElement!=elFrom) || (elFrom.tagName=="A" && elFrom.parentElement!=elTo)) { if (iTab!=g\_iShCur) { with (frames\['frTabs'\].document.all) { tdTab\[iTab\].style.background=c\_rgszClr\[1\]; } } } } } function fnSetActiveSheet(iSh) { if (iSh!=g\_iShCur) { fnSetTabProps(g\_iShCur,false); fnSetTabProps(iSh,true); g\_iShCur=iSh; } } window.g\_iIEVer=fnGetIEVer(); if (window.g\_iIEVer>=4) fnBuildFrameset(); //-->

<body><p>Na této stránce jsou použity rámce, prohlížeč je však nepodporuje.</p> </x-turndown>

"+ " ["+c\_rgszSh\[i\]+"](\""+document.all.item\("shLink"\)[i].href+"\")
