# COR Dashboard RFP Gap Analysis

## Already Satisfied or Well-Aligned

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 1 | Angular frontend (v20+ preferred) | Satisfied | Angular 21.1.2 |
| 2 | Browser-based, Chrome & Edge | Satisfied | Standard Angular SPA |
| 3 | Start page with systems grouped by region | Satisfied | `HomeComponent` with region tables |
| 4 | Search by serial number | Satisfied | Debounced search implemented |
| 5 | Sortable columns per region | Satisfied | MatSort on all columns |
| 6 | Plot page with 2-3 swim lanes (PX + Left/Right) | Partial | 9-lane Gantt structure present, needs refinement to exact 2-3 lane layout |
| 7 | Site time + local time display | Satisfied | Both displayed in toolbar |
| 8 | 10-minute auto-refresh with countdown | Satisfied | `RealTimeUpdateService` with countdown |
| 9 | Manual refresh button | Satisfied | Present in toolbar |
| 10 | Date navigation (prev/next day, calendar picker) | Satisfied | Date picker with prev/next/today |
| 11 | "Most current" vs "specific day" modes | Partial | Date picker with max=today, "Today" button exists |
| 12 | Fit on 1920x1080 without scrollbars | Satisfied | Compact layout designed for this |
| 13 | DD MON YYYY date format | Trivial | date-fns supports this format |
| 14 | BD color palette | Satisfied | Design tokens include BD brand colors |
| 15 | Bookmarkable URLs | Satisfied | Angular Router with `/full/system/:serialNumber` |
| 16 | Click row to navigate to plot page | Satisfied | Row click routing implemented |

## Gaps — Frontend / Data Model

| # | Requirement | Gap | Severity |
|---|------------|-----|----------|
| F1 | JSON message schema conformance | Mock data uses `ServerMetrics`/`ApiEndpoint` models — does not match RFP message schema | **Critical** |
| F2 | Event codes (assayWorkflowStart/End, pxState, alert, boot, etc.) | Mock data uses generic lab test names, not real event codes | **Critical** |
| F3 | Module structure (PX + Left/Right MX/GX) | Hardcoded as "Left GX" / "Right MX" — doesn't handle all 8 configurations | **Moderate** |
| F4 | Assay Workflow display (duration bars with labels, color variants) | Gantt bars exist but lack assayDisplayName/batchId labels and inflight/warning/max color states | **Moderate** |
| F5 | Inflight workflow logic (<4hr gray, 4-12hr warning, >12hr error) | Not implemented | **Moderate** |
| F6 | PX State Transition arrows (arrow from start state to end state) | State transitions shown but not as arrows between state axes | **Moderate** |
| F7 | MX/GX State Transition (duration bar at top of workflow axis) | Not differentiated from PX states | **Moderate** |
| F8 | Instrument Workflow (gray overlay box with dashed lines) | Not implemented as described | **Moderate** |
| F9 | Activity dots (solid black circles on Alerts & Errors axis) | Not implemented | **Minor** |
| F10 | Error Sample dots (solid red circles) | Not implemented as distinct type | **Minor** |
| F11 | Alert dots with labels (red circles with alertType text) | Alerts exist but may not match spec | **Minor** |
| F12 | PX Boot / Power Cycle (circle + vertical guideline spanning all swim lanes) | Not implemented | **Moderate** |
| F13 | MouseOver/tooltip with full event properties | Not fully implemented | **Minor** |
| F14 | Specific day mode disables auto-refresh | Refresh likely runs regardless of mode | **Minor** |
| F15 | "Most current mode" button in specific day mode | "Today" button exists, needs verification | **Minor** |
| F16 | Open in new tab/window from start page | Row click may not support right-click "open in new tab" (needs `<a>` tags with `routerLink`) | **Minor** |
| F17 | Metrics events saved but not displayed | Mock data displays metrics — needs to be excluded per RFP | **Minor** |
| F18 | Reference data (BD-maintained) | Hardcoded in frontend, no external reference data source | **Moderate** |
| F19 | Rebranding support (BD to Waters Corp) | Design tokens exist but no theming switcher | **Low** |
| F20 | Dense event handling (alerts & errors clustering) | No strategy for overlapping/dense events | **Moderate** |

## Gaps — Backend / Infrastructure

| # | Requirement | Gap | Severity |
|---|------------|-----|----------|
| B1 | Azure hosting (dedicated Resource Group) | No cloud infrastructure | Expected for POC |
| B2 | HTTPS with TLS 1.3, BD-provided certs | No deployment config | Expected for POC |
| B3 | Azure AD authentication/authorization | No auth at all | **Must architect for** |
| B4 | Backend in C# / .NET 8 or 10 | No backend exists (mock data only) | **Must architect for** |
| B5 | Azure Event Hub consumption (partitioned, at-least-once, idempotent) | No event ingestion pipeline | **Must architect for** |
| B6 | Data store (TBD, Azure-hosted, exclusive access) | No persistence layer | **Must architect for** |
| B7 | 12-month data retention | No data retention policy | Backend concern |
| B8 | Data available within 30 sec of Event Hub post | No ingestion pipeline | Backend concern |
| B9 | Start page < 3 sec, Plot page < 5 sec | Unmeasured; real data will be the test | Performance concern |
| B10 | CI/CD pipeline scripts (Azure DevOps) | No pipeline config | Expected for POC |
| B11 | Selenium/Cypress functional tests | Only Vitest unit tests | **Gap** |
| B12 | Documentation & training deliverables | None | Expected for POC |
| B13 | Cloud environment setup scripts | None | Expected for POC |

## Summary

**What the prototype proves well:** Angular tech stack, navigation patterns, layout system, date/time handling, regional grouping, search, sort, auto-refresh, and the general Gantt-chart visualization approach.

**Critical gaps for the POC to be credible:**
1. **Data model mismatch** — mock data must conform to the RFP JSON message schema with real event codes
2. **No backend architecture** — RFP expects C#/.NET + Azure Event Hub + data store
3. **Auth placeholder** — needs an auth guard skeleton for Azure AD integration
4. **Event display types** — several specific visualization types (inflight workflows, PX boot lines, state transition arrows, activity dots) aren't implemented
