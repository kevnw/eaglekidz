---
version: 1
slug: "web-src-app-tsx"
primary_target: "web/src/App.tsx"
related_targets: ["web/index.html"]
---

# Eagle Kidz app: Rota + Reports

Scope: the whole new `web/` app (Rota, Grouping, Reports). Mode: **Operate**. Audience: volunteer ministers on phones, plus the lead who edits the grouping. Task: read the monthly schedule: who fills each role slot at each service on a given Sunday (A/B by week of the month). Signed-in editors (the lead and SICs) also fill slots, edit the grouping, and write a report for each service (went well / can improve / action plans). The lead manages SIC access. Constraints: keep the Eagle Kidz wordmark; Node API + Railway Postgres (JSON file locally); viewers read the schedule only, the lead and SICs edit; keep the sheet's own conventions (yellow = SIC, blue = new minister).

## Direction contract

THESIS: The app is the rota sheet pinned outside the children's hall, not a SaaS dashboard of cards, avatars and status chips. A Sunday is a printed grid of services by names, marked the way the lead already marks it.

OWN-WORLD: A cork board edge (warm #b5835a) carrying photocopy-white sheets with hard black grid rules and condensed printed headers. Highlighter yellow means SIC, highlighter blue means new minister, ballpoint blue marks handwritten notes and the viewer's own name, and Eagle red-orange is used only for pins and the primary action. No rounded cards and no soft shadows: sheets lie flat with a paper drop.

STORY: A volunteer opens it without signing in and sees this month's Sundays. For this Sunday there's the A/B letter and the role sheet (SIC, PAW, Host, Mulmed, Usher, and LE/AS/ST Sermon, Activity and Ka' Pendamping, plus VT). They find their own name circled and read their roles in ballpoint. The lead and SICs sign in and fill slots in place from the service's A/B team. After a service an SIC writes the report on a lined sheet, and its action plans come back pinned on that service next time.

FIRST VIEWPORT: The cork holds the pinned logo, a paper month label and week tabs (Week 1 · 4 Oct · A). Below is the Sunday sheet. On a phone, a service switch (9 / 11 / 1 / VT) shows one ruled role table headed "9 AM · A week". On desktop, one ruled table has roles down the side and 9 / 11 / 1 across, with VT as its own table beside it, like the lead's spreadsheet. The viewer's "You are" pick (or their sign-in) circles their name. For editors, the primary action is "Write report" in red-orange at the sheet foot.

FORM: Corkboard Rota, candidate 1 of 7 on my ordered list (chosen as the pick); seed key 01e1342b. Signature interaction: choosing yourself draws a ballpoint circle around your name wherever it appears. Motion grammar: sheets slide in like paper being pinned, and nothing else moves.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
