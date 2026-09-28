# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

`web/` is a Vite + React + TypeScript app plus a small Node API (`web/server/`), deployed as one service on **Railway** with Railway Postgres. In local development the API uses a JSON file. The previous `frontend/` (CRA + Ant Design) and the Go `backend/` are left untouched as reference.

## Users

Volunteer ministers who serve in a church's children's ministry (Eagle Kidz). They use the app often, and many use it on their phones before or during services. They are not professional administrators.

## Product Purpose

EagleKidz is the internal management tool for the Eagle Kidz children's ministry. It does two jobs: **scheduling** (the rota) and **weekly reports**. Scheduling matters most: it should always be clear who is serving at which service on a given Sunday, and who is the Service in Charge (SIC). The ministry lead adjusts the grouping by hand, so it has to be easy to edit.

Success: a volunteer opens the app and sees at a glance who is serving when, without asking a coordinator.

## Positioning

A tool built for one children's ministry and the way it actually runs: weeks, services with a named Service in Charge, ministers and children grouped by age group and role, and weekly reflection. It is not a generic church management suite.

## Operating Context

- **Services:** there are four each Sunday: **VT** (Voltage), **9 AM**, **11 AM** and **1 PM**.
- **Age groups:** the children's church has four. **LE** is Little Eagle, **AS** is All Stars and **ST** is Super Trooper. **VT** (Voltage) has its own service, on a different floor. A minister can be assigned to an age group, written like "Kevin T (ST)".
- **Grouping (the rota):** each service has an **A team (odd weeks)** and a **B team (even weeks)**. The week is decided by week of the month: the 1st, 3rd and 5th Sundays are A, and the 2nd and 4th are B. A minister who serves both weeks spans A and B. The lead keeps this grouping in a spreadsheet today and adjusts it by hand.
- **Markers in the grouping:** SIC is highlighted yellow, new ministers are highlighted blue, and a free-text note can hold an exception (for example "Yenny: 1st week only, Sept–Dec"). A service can have more than one SIC in a week.
- **Minister list:** some ministers are on the list without a current grouping slot (for example Vhionel).
- **Weekly schedule (monthly sheet):** each Sunday assigns people to role slots, drawn mainly from that service's A or B team.
  - 9 AM, 11 AM and 1 PM each have SIC, PAW, Host, Mulmed and Usher, then Sermon, Activity and Ka' Pendamping for each of LE, AS and ST.
  - VT runs at 11.00 on its own floor, with SIC, Host, Sermon, Mulmed, SM, Usher and several Ka' Pendamping.
  - Per week there is also "Prepare activity LE/AS" and "Prepare activity ST".
  - Guests who aren't on the list can fill a slot (for example "PS Inge").
- **Weekly report:** written per service and Sunday, with *What went well*, *What can be improved* and *Action plans*. There is no AI summary.
- **Permissions:** only the ministry lead and the SICs sign in, and they edit the schedule, grouping and reports. Everyone else reads the monthly schedule without signing in. The lead sets SIC passwords.
- Volunteers often use it on a phone around the time of a service.

## Capabilities and Constraints

- Stack in place: React 19 + TypeScript (Create React App), Ant Design 5, TipTap editor, React Router 7; Go (Gorilla Mux) REST API; MongoDB; Docker and nginx deployment.
- The new app covers only scheduling and weekly reports. People management beyond the minister list, and attendance, are out of scope for now.
- Terminology to keep: Service (VT / 9 AM / 11 AM / 1 PM), A week / B week, Grouping, SIC (Service in Charge), New minister, Age group (LE, AS, ST, VT), Report.
- The Go backend's models (weeks with a single SIC per service, AI summaries) don't match this structure. The new app uses its own Node API instead.

## Brand Commitments

- Name: **Eagle Kidz** (app title "EagleKidz").
- The official logo is binding: the red-orange winged "Eagle kids" wordmark at `frontend/public/eagle-kidz.jpg`. Keep it and don't redraw it.

## Evidence on Hand

- Logo: `frontend/public/eagle-kidz.jpg`.
- The real grouping (shared by the lead as a spreadsheet screenshot), with ministers per service and A/B week, SIC and new-minister markers, and notes. It is used as the app's seed data.
- There are no testimonials, usage metrics, photos of the ministry or real past reports. Don't make any up; label any sample content as a sample.

## Product Principles

1. **Who's serving, when, comes first.** Schedule and SIC information must be quickest to reach and easiest to read.
2. **Built for the volunteer on a phone.** Every core flow has to work one-handed on a small screen, under time pressure around a service.
3. **Plain ministry language.** Use the ministry's own terms, not admin or database jargon.
4. **Reflection leads to action.** Reviews exist to improve the next week, so action plans stay visible and easy to follow up on.
