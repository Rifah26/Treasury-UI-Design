# TMS Deal Entry — Angular 17 Application

Treasury Money Market Deal Creation — 3-step wizard built with Angular 17, Reactive Forms, and a shared `DealFormService`.

---

## Quick Start

```bash
cd angular-app
npm install
npm start          # → http://localhost:4200
```

---

## Project Structure

```
src/
├── index.html
├── main.ts
├── styles.scss                          ← All global styles & design tokens
└── app/
    ├── app.module.ts                    ← NgModule declarations
    ├── app-routing.module.ts            ← Route definitions
    ├── app.component.{ts,html}          ← Shell: header, breadcrumb, <router-outlet>
    │
    ├── models/
    │   └── deal-form.model.ts           ← Interfaces, reference data (portfolios, dealers…)
    │
    ├── services/
    │   └── deal-form.service.ts         ← Shared FormGroups, validation, localStorage
    │
    ├── shared/
    │   └── step-progress/
    │       ├── step-progress.component.ts
    │       └── step-progress.component.html   ← Clickable step bar, used on all 3 screens
    │
    └── screens/
        ├── basic-info/                  ← /deal/basic-info
        ├── deposit-dates/               ← /deal/deposit-dates
        ├── interest/                    ← /deal/interest
        └── deal-list/                   ← /deals
```

---

## Routes

| Path                    | Component               | Description              |
|-------------------------|-------------------------|--------------------------|
| `/`                     | redirect                | → `/deal/basic-info`     |
| `/deal/basic-info`      | `BasicInfoComponent`    | Step 1 — Deal details    |
| `/deal/deposit-dates`   | `DepositDatesComponent` | Step 2 — Amount & dates  |
| `/deal/interest`        | `InterestComponent`     | Step 3 — Rate & interest |
| `/deals`                | `DealListComponent`     | Saved deal list          |

Hash-based routing (`useHash: true`) — no server config required.

---

## State Management

All form state lives in **`DealFormService`** (singleton, `providedIn: 'root'`):

```
DealFormService
├── basicInfoForm:    FormGroup   ← Screen 1 reactive form
├── depositDatesForm: FormGroup   ← Screen 2 reactive form
├── interestForm:     FormGroup   ← Screen 3 reactive form
├── persist()                     ← Save draft to localStorage
├── validateStep(n)               ← markAllAsTouched + return valid bool
├── validateAll()                 ← Validate all 3 steps (used by Save & Release)
├── saveOnHold()                  ← Persist deal with status "On Hold"
└── saveAndRelease()              ← Persist deal with status "Released"
```

Draft state is auto-saved to `localStorage` on every form change (debounced 300ms) and restored on page load — navigating back/forward never loses data.

---

## Conditional Logic

### Screen 2 — Deposit Type
| Deposit Type | Maturity Date | Compounding Rule |
|---|---|---|
| **Call** (default) | Disabled + cleared | Disabled + cleared |
| **Term** | Enabled + required | Enabled + required |

Maturity date auto-calculates when a Deposit Period is typed (e.g. `30 Days`, `3 Months`, `1 Year`).

### Screen 3 — Rate Type
| Rate Type | Visible fields | Hidden fields |
|---|---|---|
| **Fixed** (default) | Interest Rate, Interest Rule | Benchmark, Spread, Fixing Frequency |
| **Floating** | Benchmark, Period, Spread, Fixing Freq, Effective Rate (read-only) | Interest Rate input |

Floating effective rate = Benchmark rate + Spread, recalculated live.

---

## Validation Rules

| Screen | Field | Rule |
|---|---|---|
| 1 | Portfolio | Required |
| 1 | Dealer | Required |
| 1 | Instrument | Required |
| 1 | Counterparty | Required |
| 1 | Deal Type | Required |
| 1 | Pricing Type | Required |
| 2 | Currency | Required, must be 3 uppercase letters |
| 2 | Amount | Required |
| 2 | Value Date | Required |
| 2 | Maturity Date | Required when Term selected |
| 2 | Compounding Rule | Required when Term selected |
| 3 (Fixed) | Interest Rate | Required |
| 3 (Fixed) | Interest Rule | Required |
| 3 (Float) | Benchmark | Required |
| 3 (Float) | Benchmark Period | Required |
| 3 (Float) | Fixing Frequency | Required |
| 3 (both) | Settlement Frequency | Required |
| 3 (both) | Rate Setting Date | Required |

Errors appear as red borders + inline messages only after the user attempts to submit (`markAllAsTouched`).

**Save & Release** (`InterestComponent.onSaveAndRelease`) runs `validateAll()` — it validates all 3 FormGroups before allowing submission.

---

## Angular CLI commands

```bash
ng generate component screens/my-screen   # Add a new screen
ng generate service services/my-service   # Add a service
ng build --configuration production       # Production build → dist/
```
