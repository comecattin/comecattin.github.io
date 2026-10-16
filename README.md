# Personal website

This repository contains the source code of my personal website.
News, projects, publication and paper are regularly updated.
It's build using HTML and CSS. You can find the online deployed version following [this link](https://comecattin.github.io).


## Responsive screen layout

Compact layouts keep each section within a viewport and retain magnetic scroll
snapping. Mobile navigation stays at the top, and each snap screen fits below it.
`screen-layout.js` measures the available height after fonts and images
load, and flows whole list entries or content blocks onto continuation screens
when needed. It rebuilds from the original markup on resize, preserving entries
and anchor IDs. Without JavaScript, the original sections remain readable.

Mobile publication abstracts show only their opening lines; article and PDF
links remain available. Research-profile logos use a smaller size independently
of institution logos. Images are bounded by viewport height, and the animated
scroll cues respect reduced-motion preferences.
