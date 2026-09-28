---
name: Eagle Kidz Rota
description: The children's ministry rota sheet pinned on the cork board, marked the way the lead marks it.
colors:
  cork: "#b5835a"
  cork-deep: "#8c603c"
  paper: "#fbfaf6"
  paper-shade: "#f1ede3"
  ink: "#1b1a17"
  ink-soft: "#5d564c"
  rule: "#d9d3c6"
  hl-sic: "#f7e27a"
  hl-new: "#c3d7f5"
  ballpoint: "#1f3a93"
  brand: "#c8401a"
  brand-deep: "#9e3013"
  lined: "#c9d6ea"
  margin-line: "#e2a497"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.875rem, 7vw, 3rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.01em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  name:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  role:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.04em"
  hand:
    fontFamily: "Kalam, Bradley Hand, cursive"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "normal"
rounded:
  none: "0px"
  hairline: "1px"
spacing:
  2xs: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    typography: "{typography.title}"
    rounded: "{rounded.hairline}"
    padding: "10px 18px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.brand-deep}"
  button-primary-disabled:
    backgroundColor: "{colors.rule}"
    textColor: "{colors.ink-soft}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    padding: "10px 18px"
    height: "46px"
  button-quiet-hover:
    backgroundColor: "{colors.paper-shade}"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "44px"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
    height: "44px"
  segmented-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pick:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "44px"
  pick-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 2px"
    height: "44px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "22px 16px 18px"
  table-header:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "10px 12px 8px"
  group-row:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "6px 12px 5px"
  tab-bottom-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "64px"
---

# Design System: Eagle Kidz Rota

## Overview

**Creative North Star: "The Corkboard Rota"**

The app is the rota sheet pinned outside the children's hall. A cork board carries photocopy-white sheets; each sheet is a printed grid of services by names with hard black rules and condensed printed headers, and it is marked by hand the way the ministry lead already marks the spreadsheet: highlighter yellow for the Service in Charge, highlighter blue for a new minister, ballpoint blue for handwritten notes and for the viewer's own name. Eagle red-orange appears as pins and as the one primary action.

Density is that of a working document, not a dashboard. Names sit in ruled cells at reading size, role labels are small condensed caps in the left column, and age groups break the table with solid ink bars. Everything that is paper lies flat on the cork with one shared paper drop; a few pinned objects (the logo card, the A/B week stamp, the action-plan slip) sit slightly askew, and nothing else tilts. The world rejects the SaaS dashboard vocabulary of rounded cards, avatars and status chips.

Motion is paper being pinned: a sheet settles in from slightly above and rotated, editor sheets rise from the bottom, and choosing yourself sweeps a ballpoint ring around your name. Hover states only change paper tone.

**Key Characteristics:**
- Cork texture ground (`/cork.jpg`, blended in luminosity over the cork color), paper sheets on top.
- Hard ink grid rules (1px inner, 1.5px outer) on every table; square corners throughout.
- Three pen-and-marker marks with fixed meanings: SIC yellow, new-minister blue, ballpoint.
- Condensed uppercase print for structure, Barlow for names and prose, Kalam for anything written by hand.
- One shadow (the paper drop) and one accent (Eagle red-orange for pins and the primary action).

## Colors

A warm cork and photocopy palette: nearly-black ink on warm off-white, with meaning carried by marker and pen colors rather than by UI chrome.

### Primary
- **Eagle Red-Orange** (brand): the logo's color. Used for red pins, the logo card's pin head, and the primary action button ("Write report", "Save"). Nowhere else at rest.
- **Deep Eagle Red** (brand-deep): primary button hover, and the stroke and text of errors (form error box and the error bar).

### Secondary
- **Highlighter Yellow** (hl-sic): the SIC mark behind a name, the SIC legend swatch, and text selection.
- **Highlighter Blue** (hl-new): the new-minister mark behind a name. A person who is both gets yellow with a blue underswipe.

### Tertiary
- **Ballpoint Blue** (ballpoint): handwritten text (the viewer's roles line, action plans, notes, report answers), the ring around the viewer's name, the text caret, and the focus outline.

### Neutral
- **Cork** (cork): the board behind everything and the browser theme color. **Cork Deep** (cork-deep) is the scrollbar thumb.
- **Photocopy Paper** (paper): every sheet, table cell, tab and paper button.
- **Paper Shade** (paper-shade): table header cells, the SIC row label, and every hover on paper.
- **Ink** (ink): text, grid rules, the age-group bars, the selected state of segmented and pick controls, and the active tab underline.
- **Soft Ink** (ink-soft): secondary text, small caps labels, fill counts, role sub-parts.
- **Pencil Rule** (rule): the light dividers in the Access list and disabled button fill.
- **Lined-Paper Blue** (lined) and **Margin Red** (margin-line): the ruled lines and left margin of report writing areas and report previews.

### Named Rules
**The Marks Mean Things Rule.** Yellow is SIC, blue is new minister, ballpoint is handwriting or "you". These colors never decorate, never mark status, and never appear without that meaning.

**The Pins-And-One-Action Rule.** Eagle red-orange is used for pins and the single primary action on a sheet. Errors use the deeper red as outline and text, never as a filled banner.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 600 and 700
**Body Font:** Barlow (with system-ui, sans-serif), weights 400, 500, 600
**Handwriting Font:** Kalam 400 (with Bradley Hand, cursive)

All three are self-hosted through @fontsource.

**Character:** Barlow Condensed is the printed header of the photocopied sheet, always uppercase; Barlow is the typed name in the cell; Kalam is the lead's pen. Each face belongs to one layer of the paper and they do not swap jobs.

### Hierarchy
- **Display** (700, clamp(1.875rem, 7vw, 3rem), 0.95, uppercase): the sheet title, e.g. "Sunday 4 October", "Reports". One per sheet.
- **Headline** (700, 1.375rem, 1.05, uppercase): service column heads in the schedule table ("9 AM"), the phone service caption, the month label on the cork.
- **Title** (700, 1.25rem, 1.1, uppercase): section heads, report field labels ("What went well"), group heads in the grouping sheet, report card service names.
- **Body** (400, 1rem, 1.5): prose and sub-lines; sheet subtitles cap at 62ch.
- **Name** (500, 1.0625rem): minister names in cells, picks, chips and checkboxes. Names are always set in Barlow, never condensed.
- **Role** (700, 0.9375rem, 0.04em, uppercase): the left-column role labels of every rota table.
- **Label** (600, 0.8125rem, 0.06 to 0.1em, uppercase): field labels, fill counts, week numbers on tabs, table header labels in Access, bottom tab labels. At 0.75rem it serves role sub-parts and age tags.
- **Hand** (Kalam 400, 1.0625rem, 1.35, ballpoint blue): notes and action plans. The viewer's roles line on a sheet runs at 1.25rem; lined report textareas at 1.1875rem on a 2rem ruled line.

### Named Rules
**The Three Hands Rule.** Print (condensed caps) for structure, type (Barlow) for names and prose, pen (Kalam in ballpoint) for what a person wrote. If a string was typed by an editor as a free note, it is set in Kalam.

**The Tabular Dates Rule.** Dates, day numbers and fill counts use tabular numerals.

## Layout

A single centered board up to 1320px wide. The cork bar (logo card, main tabs on desktop, the "You are" picker or sign-in) sits on the cork with 16px side padding, 24px from 960px. Below it, a month label flanked by arrows and a row of week tabs (one equal column per Sunday), then the sheet.

The sheet pads 22px/16px on phones, 30px/28px from 640px, 34px/36px from 960px. Within it the rhythm is small and document-like: 8px and 12px between related items, 16 to 18px between blocks (fields, sheet foot, table spacing), 28px between report days.

Responsive behavior:
- **Below 640px:** a fixed bottom tab bar (paper, 2px ink top rule, 64px targets, icon over label) replaces top tabs; the logo card shrinks; dialog primary actions go full width.
- **640px up:** grouping and report rows go two columns; editors become centered 540px sheets instead of bottom sheets.
- **960px up:** top paper tabs appear on the cork and the bottom bar goes; the grouping sheet becomes one shared 8-column ruled grid so every service's rows align.
- **1100px up:** the schedule shows the whole Sunday at once: one fixed-layout table with roles down the side and 9 AM / 11 AM / 1 PM as equal-width columns, VT as its own table beside it (about 3.3 : 1.35). Action-plan slips sit below the tables, each under its own service column. Report rows run four across.
- **Below 1100px:** a segmented service switch (9 AM / 11 AM / 1 PM / VT) shows one two-column role table at a time, headed "9 AM · A week" with its fill count.

Touch targets are at least 44px everywhere, including slot cells, picks, chips, text links and summary toggles.

## Elevation & Depth

Depth is physical and has exactly one level: paper on cork. Sheets, tabs, the month label, the "You are" select, paper buttons, the error bar, the logo card and the action-plan slip all carry the same paper drop. Everything inside a sheet is flat; separation inside paper comes from ink rules and paper-shade fills, never from shadow.

### Shadow Vocabulary
- **Paper drop** (`box-shadow: 0 1px 1px rgb(40 22 8 / 0.18), 0 10px 22px -10px rgb(40 22 8 / 0.55)`): any paper object lying on the cork, and the active week tab and active top tab.
- **Resting tab** (`box-shadow: 0 1px 1px rgb(40 22 8 / 0.2)`): inactive, semi-transparent paper tabs (72% and 60% paper) that are not yet lifted.
- **Pin shadow** (`filter: drop-shadow(1px 3px 2px rgb(40 22 8 / 0.45))`): push pins only.

### Named Rules
**The One Drop Rule.** Paper on cork gets the paper drop; nothing on paper gets a shadow. There are no ambient card shadows, glows or hard offset shadows.

**The Askew Pin Rule.** Only pinned objects tilt: the logo card (-2.5deg), the week stamp (3deg) and the action-plan slip (-0.6deg). Sheets and tables stay square.

## Shapes

Square paper, square rules. Sheets, tables, cells, inputs, segmented controls and picks have no radius; buttons carry a hairline 1px corner that reads as square. The only curves are made by hand or by hardware: the irregular highlighter swipe behind a name (`border-radius: 3px 9px 4px 10px / 9px 3px 10px 4px`, cloned across line breaks), the round push pins, and the hand-drawn ballpoint ring.

Borders do structural work. Table outer frames are 1.5px ink and inner rules 1px ink; the week stamp is a 2.5px ink box; age tags and the day's A/B letter are 1.5px ink boxes. Dashed borders mean "not yet": a missing report slot and a minister not yet placed in the grouping.

## Components

### Buttons
Printed and plain: condensed caps on square paper.
- **Shape:** hairline corner (1px), 46px minimum height, 10px 18px padding, Barlow Condensed 700 at 1.0625rem, 0.05em tracking, uppercase, optional 18px line icon.
- **Primary:** Eagle red-orange fill with white text and a 1px resting drop. One per sheet or dialog.
- **Hover / Focus / Active:** hover deepens to brand-deep; active nudges down 1px; focus is the global 2.5px ballpoint outline at 2px offset. Disabled is pencil-rule fill with soft ink text.
- **Quiet:** transparent with underlined ink text; paper-shade on hover. Used for Cancel, Copy from last week, Access actions.
- **Danger:** ink fill with paper text (for destructive confirms). No red fill.
- **Paper button:** a paper scrap on the cork (sign in, sign out) with the paper drop; hover goes to pure white.

### Chips
- **Pick** (slot editor): 1.5px ink box, Barlow 500 name, 44px tall; selected inverts to ink fill with paper text; hover is paper-shade.
- **Loose chip** (unplaced ministers in the grouping): the same box drawn dashed; hover turns the border solid.
- **Age tag:** a tiny 1.5px ink box around LE / AS / ST / VT in label type, with the full name as its title.

### Cards / Containers
- **Sheet:** paper, no radius, paper drop, two red pins at the top corners, padding per Layout. Sheets settle in with the pin-in motion.
- **Report slot:** 1.5px ink box on paper, 12px 16px padding, lined with lined-paper blue at 1.75rem; filled reports clamp each answer to three lines and go paper-shade on hover; a missing report is dashed in soft ink with a "Write one" text link.

### Inputs / Fields
- **Style:** underline only: transparent ground, 1.5px ink bottom rule, no radius, 44px tall, 1.125rem text, with a label-type caption above in soft ink. Free-note inputs switch to Kalam in ballpoint.
- **Lined textarea:** report answers are written on lined paper: 1.5px ink top rule, blue lines every 2rem, a red margin line at 2.1rem, Kalam in ballpoint.
- **Focus:** the global ballpoint outline; the caret is ballpoint blue.
- **Error:** a 1.5px deep red outline box with deep red text above the actions.
- **Segmented:** adjoining 1.5px ink boxes in condensed caps; the chosen option inverts to ink.

### Navigation
- **Top tabs (960px up):** paper tabs on the cork, condensed caps 1.0625rem; inactive at 60% paper, hover full paper; active is full paper with the paper drop and a 4px ink underline.
- **Bottom tabs (below 960px):** fixed paper bar with a 2px ink top rule; 22px line icon over a label; active is ink text with a 4px ink bar on top.
- **Week tabs:** one per Sunday in the month: week number in label type, the date in condensed 700, and the A/B letter in a small ink box. The selected Sunday lifts with the drop and a 3px ink underline; the current Sunday carries a small ink "This Sunday" tag hanging over its top edge.

### Rota Table (signature)
The schedule, week-prep and VT tables: collapsed borders, 1.5px ink frame, 1px ink rules, 8px 12px cells. Role labels sit in the left column (9.5rem, 7.5rem on phones) in role type with an optional small sub-part (Production, Crowd); the SIC row label is paper-shade. Service heads are paper-shade headline cells with a fill count beneath. Age groups break the table with a solid ink row in reversed label type ("LE · Little Eagle"). For editors each cell is a full-bleed slot button that goes paper-shade on hover and whispers "assign" over an empty dash.

### Marked Name and Ballpoint Ring (signature)
Names render as marked on the sheet: a yellow or blue highlighter swipe behind the name, or yellow with a blue underswipe for both. When the viewer picks themself (or signs in), a hand-drawn ballpoint ring surrounds their name everywhere it appears, and on picking it sweeps in left to right over 650ms.

### Action-Plan Slip (signature)
Last time's action plans for a service come back as a small pinned slip: warmer paper (#fffdf2), paper drop, rotated -0.6deg, a red pin at top centre, a label-type head ("Action plans from 27 Sep") and the plans in ballpoint Kalam. On desktop the slips sit in a row under the tables, aligned to their service columns.

### Week Stamp
The A/B letter as a rubber stamp at the sheet's top right: 2.5px ink box, 3rem condensed letter over "Odd week" / "Even week", rotated 3deg.

## Do's and Don'ts

### Do:
- **Do** put every new surface on a paper sheet over the cork, with two red pins and the paper drop.
- **Do** rule every grid of people and roles in ink: 1.5px outer frame, 1px inner rules, square corners.
- **Do** mark names only with their meaning: yellow for SIC, blue for new minister, the ballpoint ring for the viewer.
- **Do** set anything a person wrote (notes, action plans, report answers) in Kalam in ballpoint blue.
- **Do** keep Eagle red-orange to pins and one primary action per sheet or dialog.
- **Do** use condensed uppercase print for structure (titles, role labels, headers, tabs, buttons) and Barlow for names and prose.
- **Do** keep touch targets at 44px or more and give focus the 2.5px ballpoint outline.
- **Do** keep motion to paper settling (pin-in 420ms, editor sheet rising 360ms, ring sweep 650ms) plus tonal hovers, and honor reduced motion by removing it.

### Don't:
- **Don't** use rounded cards, avatars, status chips or dashboard tiles; this is a sheet, not a SaaS panel.
- **Don't** add shadows inside a sheet, or any shadow other than the paper drop, resting tab and pin shadow.
- **Don't** tilt sheets, tables or form controls; only pinned objects sit askew.
- **Don't** use highlighter yellow or blue as decoration or status color.
- **Don't** fill a banner or button with red for errors or destructive actions; errors are deep-red outlines, destructive confirms are ink.
- **Don't** redraw or recolor the Eagle Kidz logo; it sits as-is on its pinned white card.
