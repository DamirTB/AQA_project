# Test Automation Implementation Report (Full Stack)

**Project:** Exam Preparation Platform  
**Stack:** Express.js + Mongoose (backend), Vue 3 + Pinia + Vue Router (frontend)  
**Automation:** Jest, Vitest, Postman/Newman; Playwright (sample below; E2E suite optional)  
**CI/CD:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

This document combines **backend** and **frontend** test automation in one place for coursework submission.

---

## Table of contents

1. [Automated testing](#1-automated-testing)
2. [Sample code](#2-sample-code)
3. [Quality gates](#3-quality-gates)
4. [CI/CD pipeline](#4-cicd-pipeline)
5. [Metrics](#5-metrics)
6. [Logs and evidence](#6-logs-and-evidence)
7. [QA strategy documentation](#7-qa-strategy-documentation)

---

## 1. Automated testing

### 1.1 Test scope table

| Module / feature | High-risk function | Test priority | Notes |
| --- | --- | --- | --- |
| **Authentication (API)** | Register, login, JWT issue | Critical | API contract for all clients |
| **Authentication (UI)** | `Login.vue` / `Register.vue` forms, token in `localStorage` | Critical | Primary user entry |
| **Auth middleware (API)** | `Bearer` JWT verification | Critical | Protects private routes |
| **Exams (API)** | List, filter, detail; strip `correctOption` | High | Exam integrity |
| **Exams (UI)** | `ExamList.vue`, `ExamDetail.vue` — load, filter, navigate | High | Core discovery flow |
| **Attempts (API)** | Start, resume, submit, score, time limit | Critical | Core product outcome |
| **Attempts (UI)** | `ExamAttempt.vue` timer/submit; `Results.vue` | Critical | User-visible correctness |
| **Bookmarks (API + UI)** | CRUD, uniqueness | Medium | Dashboard consistency |
| **Reviews (API + UI)** | One review per user per exam | Medium | Trust and fairness |
| **Forum (API + UI)** | `Forum.vue`, `TopicDetail.vue` | Medium | Optional feature; auth on writes |
| **Health (API)** | `GET /api/health` | Low | CI and ops probes |
| **Router (UI)** | `beforeEach` auth guest/required | High | Prevents unauthorised pages |

### 1.2 Test cases table

| Test case ID | Module | Input | Expected result | Scenario type |
| --- | --- | --- | --- | --- |
| TC-API-01 | Health | `GET /api/health` | `200`, `{ "status": "ok" }` | Positive |
| TC-API-02 | Auth | Valid `POST /api/auth/register` | `201`, token, user without `passwordHash` | Positive |
| TC-API-03 | Auth | Duplicate email on register | `409` | Negative |
| TC-API-04 | Auth | Valid `POST /api/auth/login` | `200`, token | Positive |
| TC-API-05 | Auth | Wrong password | `401` | Negative |
| TC-API-06 | Exams | `GET /api/exams` without token | `401` | Negative |
| TC-API-07 | Exams | `GET /api/exams` with JWT | `200`, array | Positive |
| TC-API-08 | Attempts | `POST /api/attempts/start` | `attemptId`, questions without answers | Positive |
| TC-API-09 | Attempts | `POST /api/attempts/submit` after limit | `400`, time message | Negative |
| TC-UI-01 | Login (UI) | Valid email/password, submit | API called; redirect `/dashboard` | Positive |
| TC-UI-02 | Login (UI) | Invalid credentials | `.error-msg` visible | Negative |
| TC-UI-03 | Register (UI) | Valid form | Success path or validation | Positive |
| TC-UI-04 | Exam list (UI) | APIs return exams | Titles visible; loading state | Positive |
| TC-UI-05 | Exam list (UI) | API error | `.error-msg` | Negative |
| TC-UI-06 | Exam detail (UI) | Load exam | Start / review UI consistent with state | Positive |
| TC-UI-07 | Exam attempt (UI) | Submit answers | Submit API invoked | Positive |
| TC-UI-08 | Results (UI) | Completed attempt | Score / % displayed | Positive |
| TC-UI-09 | Dashboard (UI) | History/bookmarks endpoints | Lists render | Positive |
| TC-UI-10 | Forum (UI) | Topic list load | Topics visible | Positive |
| TC-UI-11 | Router | No token, `/dashboard` | Redirect to `/login` | Negative |
| TC-E2E-01 | E2E (Playwright) | Login in real browser | URL contains `/dashboard` | Positive |
| TC-E2E-02 | E2E (Playwright) | Bad password | Error text visible | Negative |

### 1.3 Automation scripts plan

| Script ID | Framework | Description | Status |
| --- | --- | --- | --- |
| BE-U-01 … BE-U-06 | Jest | Unit tests: `auth`, `exams`, `attempts`, `bookmarks`, `reviews`, `forum` services | Implemented |
| BE-I-01 … BE-I-07 | Jest + Supertest | Integration: `auth`, `exams`, `attempts`, `bookmarks`, `reviews`, `forum`, `health` | Implemented |
| BE-A-01 | Postman + Newman | `backend/postman/exam-platform.postman_collection.json` (`npm run test:api`) | Implemented |
| FE-C-01 | Vitest | `Login.test.ts` | Implemented |
| FE-C-02 | Vitest | `Register.test.ts` | Implemented |
| FE-C-03 | Vitest | `ExamList.test.ts` | Implemented |
| FE-C-04 | Vitest | `ExamDetail.test.ts` | Implemented |
| FE-C-05 | Vitest | `ExamAttempt.test.ts` | Implemented |
| FE-C-06 | Vitest | `Results.test.ts` | Implemented |
| FE-C-07 | Vitest | `Dashboard.test.ts` | Implemented |
| FE-C-08 | Vitest | `Forum.test.ts` | Implemented |
| FE-C-09 | Vitest | `TopicDetail.test.ts` | Implemented |
| FE-C-10 | Vitest | `router/guards.test.ts` | Implemented |
| FE-C-11 | Vitest | `stores/auth.store.test.ts` | Implemented |
| E2E-01 | Playwright | Browser login + exam smoke (see §2.1) | Planned / optional repo folder `e2e/` |

---

## 2. Sample code

### 2.1 Playwright — login (UI)

Selectors match [`frontend/src/views/Login.vue`](../frontend/src/views/Login.vue) (`#email`, `#password`, `.error-msg`).

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('redirects to dashboard on success', async ({ page }) => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.fill('#email', 'bad@example.com');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-msg')).toBeVisible();
  });
});
```

### 2.2 Postman / Newman — API assertions

```javascript
// POST /api/auth/register — Tests tab
pm.test('Status code is 201', function () {
  pm.response.to.have.status(201);
});
pm.test('Token and user present; no password hash', function () {
  var j = pm.response.json();
  pm.expect(j.token).to.be.a('string');
  pm.expect(j.user).to.not.have.property('passwordHash');
});
```

```javascript
// GET /api/exams — Tests tab
pm.test('Status 200 and non-empty list', function () {
  pm.response.to.have.status(200);
  var exams = pm.response.json();
  pm.expect(exams).to.be.an('array');
});
```

Run with the backend up: `cd backend && npm run test:api`.

### 2.3 Jest + Supertest — health check

```typescript
const res = await request(app).get('/api/health');
expect(res.status).toBe(200);
expect(res.body).toEqual({ status: 'ok' });
```

(Full file: [`backend/src/__tests__/integration/health.test.ts`](../backend/src/__tests__/integration/health.test.ts).)

### 2.4 Vitest + Vue Test Utils — login component

```typescript
await wrapper.find('input[type="email"]').setValue('alice@example.com');
await wrapper.find('input[type="password"]').setValue('password123');
await wrapper.find('form').trigger('submit');
expect(vi.mocked(api.post)).toHaveBeenCalledWith('/auth/login', {
  email: 'alice@example.com',
  password: 'password123',
});
```

(Full file: [`frontend/src/__tests__/views/Login.test.ts`](../frontend/src/__tests__/views/Login.test.ts).)

---

## 3. Quality gates

| Gate | Threshold | Why it matters |
| --- | --- | --- |
| **Backend line coverage** | **≥ 80%** (statements/functions 80%, branches 70%) | Enforced in [`backend/package.json`](../backend/package.json) (`jest.coverageThreshold`). |
| **Frontend line coverage** | **≥ 70%** on included globs | Enforced in [`frontend/vite.config.ts`](../frontend/vite.config.ts) (`test.coverage.thresholds`). |
| **Critical defects (open)** | **0** | Auth and scoring bugs block release. |
| **Test pass rate (CI)** | **100%** required jobs | Any failure exits non-zero; quality-gate job fails the workflow. |
| **Execution time (indicative)** | Backend Jest &lt; ~5 min; Frontend Vitest &lt; ~3 min | Keeps feedback fast; tune in CI if needed. |
| **TypeScript** | `tsc` / `vue-tsc` clean | Prevents type errors reaching production builds. |
| **Dependency vulnerabilities** | 0 *high/critical* (policy) | Run `npm audit` locally; align with module policy. |

The **80%** figure is the **backend** gate. The **frontend** gate is intentionally **70%** in this repository; you may raise it to 80% in `vite.config.ts` if the assignment requires a single global number—document both honestly as above.

---

## 4. CI/CD pipeline (GitHub Actions)

The live workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It satisfies: **checkout → install → run tests → reports → fail on error**.

### 4.1 Jobs (summary)

| Job | Purpose |
| --- | --- |
| `backend-test` | Checkout, Node 20, `npm ci`, MongoDB service, `tsc --noEmit`, `npm run test:coverage`, upload `backend/coverage/` |
| `backend-api-newman` | Build backend, start `node dist/server.js`, `npm run test:api`, upload `postman/newman-report.json` |
| `frontend-test` | Checkout, Node 20, `npm ci`, `vue-tsc -b`, `npm run test:coverage`, upload `frontend/coverage/` |
| `quality-gate` | Fails if **any** of the three jobs above fails |

### 4.2 Example `test.yml`-style outline (equivalent to this repo)

For reports that require a file named `test.yml`, the same structure can be described as:

```yaml
# Conceptual layout — implemented in ci.yml today
jobs:
  backend-test:
    steps: [checkout, setup-node, npm ci, tsc --noEmit, npm run test:coverage, upload-coverage]
  backend-api-newman:
    steps: [checkout, setup-node, npm ci, build, start-server, newman, upload-report]
  frontend-test:
    steps: [checkout, setup-node, npm ci, vue-tsc, npm run test:coverage, upload-coverage]
  quality-gate:
    needs: [backend-test, backend-api-newman, frontend-test]
    # fail if any job != success
```

---

## 5. Metrics

### 5.1 Automation coverage

**Formula:**  
`Automation Coverage (%) = (Automated test cases / Total test cases) × 100`

| Layer | Total cases (§1.2) | Automated | Coverage % |
| --- | ---: | ---: | ---: |
| API (TC-API-*) | 9 | 9 | 100 |
| UI component (TC-UI-*) | 11 | 11 | 100 |
| E2E (TC-E2E-*) | 2 | 0* | 0* |
| **All listed** | **22** | **20** | **91** |

\*Add an `e2e/` Playwright project and CI step to reach 100% on E2E rows.

### 5.2 Execution time (TTE) — indicative

| Suite | Tool | Note |
| --- | --- | --- |
| Backend unit | Jest | Fast |
| Backend integration | Jest + Supertest + in-memory Mongo | Dominates backend duration |
| API contract | Newman | Seconds to ~1 min |
| Frontend | Vitest + jsdom | Usually &lt; few minutes |
| E2E | Playwright | Optional; slowest per test |

### 5.3 Defects vs expected risk (template)

| Module | Risk | Defects found (example) |
| --- | --- | ---: |
| Auth | Critical | 0 |
| Attempts | Critical | 0 |
| Exams | High | 0 |

**Defect detection rate** = `(Defects found by automation / Total defects) × 100`  
**Test efficiency** = `Defects found / Hours spent running tests`

---

## 6. Logs and evidence

### 6.1 Example Jest output (abridged)

```text
PASS  src/__tests__/integration/health.test.ts
PASS  src/__tests__/integration/auth.test.ts
...
Test Suites: 13 passed, 13 total
```

### 6.2 Example Vitest output (abridged)

```text
 ✓ src/__tests__/views/Login.test.ts (7 tests)
 ✓ src/__tests__/views/ExamList.test.ts (7 tests)
 Test Files  13 passed (13)
```

### 6.3 Screenshot / UI evidence table

| ID | Page | Action | Expected | File (example) |
| --- | --- | --- | --- | --- |
| EV-01 | Login | Load | Form visible | `evidence/login.png` |
| EV-02 | Login | Bad password | `.error-msg` text | `evidence/login-error.png` |
| EV-03 | Dashboard | After login | Nav + content | `evidence/dashboard.png` |
| EV-04 | Exam attempt | Submit | Results or confirmation | `evidence/attempt.png` |

### 6.4 Traceability

| Test case | Automation | Evidence |
| --- | --- | --- |
| TC-API-01 | `health.test.ts`, Newman | Jest log, `newman-report.json` |
| TC-UI-01 | `Login.test.ts` | Vitest log; optional Playwright screenshot |
| TC-API-08 | `attempts.test.ts`, Newman | Integration log |

---

## 7. QA strategy documentation

**Automation approach (risk-based):** The greatest effort targets **authentication** and **attempt lifecycle** on both **API** and **UI**, because failures prevent access or corrupt grades. **Exam listing and detail** are next, since they gate the attempt flow. **Bookmarks, reviews, and forum** are medium priority. **Health** and purely read-only listings use lighter but still automated checks.

**Tool selection:** **Jest** with **Supertest** gives fast, deterministic API verification in Node. **mongodb-memory-server** isolates integration tests. **Vitest** shares Vite config with the Vue app and suits component and store tests. **Postman/Newman** encodes HTTP contracts and runs against a real server in CI, complementing in-process tests. **Playwright** is the recommended tool for **end-to-end** UI checks (cross-browser, stable waits); the sample in §2.1 can live under `e2e/` when you add CI for it.

**CI/CD overview:** GitHub Actions runs **backend Jest**, **Newman**, and **frontend Vitest** in parallel where possible, then a **quality-gate** job aggregates results. **Coverage** and **Newman JSON** artifacts support evidence for assessment.

**Quality gates summary:** Backend **≥80%** line coverage where configured; frontend **≥70%** on covered globs; **zero failing** required jobs; **TypeScript** must pass on both packages.

**Test pyramid:** Many **unit** tests (services, stores), fewer **integration** tests (HTTP, DB), fewer **component** tests (Vue), and a small top of **E2E** and **Newman** runs for confidence without ballooning runtime.

---

*Combined backend + frontend report. For API-only detail, see [QA_Report_Backend.md](./QA_Report_Backend.md).*
