# Test Automation Implementation Report (Backend Only)

**Project:** Exam Preparation Platform — REST API  
**Scope:** This document covers **backend test automation only** (Express.js, Mongoose, Jest, Postman/Newman). End-to-end browser tests (Playwright) and frontend unit tests (Vitest) are **out of scope** for this report; they remain part of the wider product quality strategy.

**Repository paths:** `backend/` (API), [`backend/postman/exam-platform.postman_collection.json`](../backend/postman/exam-platform.postman_collection.json), [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

---

## Table of Contents

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
| Authentication | `POST /api/auth/register` — validation, hashing, duplicates | Critical | Wrong behaviour exposes accounts or blocks onboarding |
| Authentication | `POST /api/auth/login` — credential check, JWT issuance | Critical | Failure blocks all protected routes |
| Authentication | JWT middleware — `Bearer` verification | Critical | Must reject missing, malformed, and invalid tokens |
| Health | `GET /api/health` — liveness | Low | Used by orchestration and smoke checks |
| Exams | List/detail — category filter, strip `correctOption` | High | Leaking answers invalidates exams |
| Attempts | Start / resume in-progress attempt | Critical | State errors cause duplicate or lost attempts |
| Attempts | Submit — scoring, time limit, idempotency | Critical | Incorrect grades are a product failure |
| Attempts | History and result — authorisation | High | Must not expose other users’ data |
| Bookmarks | Add/remove, uniqueness `(userId, examId)` | Medium | Duplicates confuse dashboard UX |
| Reviews | One review per user per exam | Medium | Enforced in service + model |
| Forum | Topics and comments — auth on writes | Medium | Prevents anonymous abuse |

### 1.2 Test cases table (API)

| Test case ID | Module | Input | Expected result | Scenario type |
| --- | --- | --- | --- | --- |
| TC-API-01 | Health | `GET /api/health` | `200`, `{ "status": "ok" }` | Positive |
| TC-API-02 | Auth | Valid register body | `201`, token + user without `passwordHash` | Positive |
| TC-API-03 | Auth | Register with duplicate email | `409`, conflict message | Negative |
| TC-API-04 | Auth | Valid login | `200`, token + user | Positive |
| TC-API-05 | Auth | Wrong password | `401` | Negative |
| TC-API-06 | Auth | Login without password field | `400` | Negative |
| TC-API-07 | Exams | `GET /api/exams` without `Authorization` | `401` | Negative |
| TC-API-08 | Exams | `GET /api/exams` with valid JWT | `200`, array of exams | Positive |
| TC-API-09 | Exams | `GET /api/exams/:id` | `200`, questions have no `correctOption` | Positive |
| TC-API-10 | Attempts | `POST /api/attempts/start` with valid `examId` | `200`/`201`, `attemptId`, questions | Positive |
| TC-API-11 | Attempts | `POST /api/attempts/submit` with answers map | `200`, `score`, `percentage`, `breakdown` | Positive |
| TC-API-12 | Attempts | `POST /api/attempts/submit` on completed attempt | `400` | Negative |
| TC-API-13 | Bookmarks | `POST /api/bookmarks` | `201` (or contract-consistent success) | Positive |
| TC-API-14 | Reviews | Second review same user + exam | `409` | Negative |
| TC-API-15 | Forum | Create topic with JWT | `201` | Positive |

### 1.3 Automation scripts plan

| Script ID | Framework | Description | Status |
| --- | --- | --- | --- |
| BE-U-01 | Jest | `auth.service.test.ts` — register/login unit tests | Implemented |
| BE-U-02 | Jest | `exams.service.test.ts` | Implemented |
| BE-U-03 | Jest | `attempts.service.test.ts` | Implemented |
| BE-U-04 | Jest | `bookmarks.service.test.ts` | Implemented |
| BE-U-05 | Jest | `reviews.service.test.ts` | Implemented |
| BE-U-06 | Jest | `forum.service.test.ts` | Implemented |
| BE-I-01 | Jest + Supertest | `auth.test.ts` — `/api/auth` integration | Implemented |
| BE-I-02 | Jest + Supertest | `exams.test.ts` | Implemented |
| BE-I-03 | Jest + Supertest | `attempts.test.ts` | Implemented |
| BE-I-04 | Jest + Supertest | `bookmarks.test.ts` | Implemented |
| BE-I-05 | Jest + Supertest | `reviews.test.ts` | Implemented |
| BE-I-06 | Jest + Supertest | `forum.test.ts` | Implemented |
| BE-I-07 | Jest + Supertest | `health.test.ts` — `/api/health` | Implemented |
| BE-A-01 | Postman + Newman | `postman/exam-platform.postman_collection.json` — contract/smoke API run | Implemented (`npm run test:api`) |

---

## 2. Sample code

### 2.1 Example integration test (Jest + Supertest) — health

```typescript
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

### 2.2 Example API test (POST / GET) — Postman *Tests* script

**POST /api/auth/register — assertions:**

```javascript
pm.test('Status code is 201', function () {
  pm.response.to.have.status(201);
});
pm.test('Response contains token and user without passwordHash', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.token).to.be.a('string');
  pm.expect(jsonData.user).to.not.have.property('passwordHash');
});
pm.collectionVariables.set('auth_token', pm.response.json().token);
```

**GET /api/exams — authenticated list:**

```javascript
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});
pm.test('Response is a non-empty array of exams', function () {
  var exams = pm.response.json();
  pm.expect(exams).to.be.an('array');
  pm.expect(exams.length).to.be.above(0);
});
```

### 2.3 Newman CLI (run against a running server)

```bash
cd backend
npm run build
MONGODB_URI=mongodb://localhost:27017/exam-platform JWT_SECRET=dev-secret-key node dist/server.js
# separate terminal:
npm run test:api
```

Collection path: `backend/postman/exam-platform.postman_collection.json`. The `base_url` defaults to `http://127.0.0.1:3000` in the `test:api` script.

---

## 3. Quality gates

| Gate | Threshold | Why it matters |
| --- | --- | --- |
| Line coverage (global) | ≥ 80% | Ensures most executable paths in `src/` are exercised; configured in `backend/package.json` under `jest.coverageThreshold`. |
| Branch coverage (global) | ≥ 70% | Reduces risk of untested conditional logic (e.g. error branches) while staying achievable. |
| Critical defects open | 0 | Authentication and scoring bugs are release blockers for an exam platform. |
| Jest test success rate | 100% in CI | Any failing test fails the build; no silent regressions on `main`. |
| Newman run | All collection tests pass | Validates the live HTTP contract against a real server and database. |
| TypeScript | `tsc --noEmit` clean | Catches type errors before runtime in production. |
| Pipeline execution | Fail on error | GitHub Actions steps use non-zero exit codes; merge is blocked by the quality-gate job. |

---

## 4. CI/CD pipeline (GitHub Actions)

The workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) implements the following for the **backend**:

| Step | Purpose |
| --- | --- |
| Checkout | Clone the repository |
| Set up Node.js 20 | Reproducible runtime; npm cache via lockfile |
| `npm ci` (in `backend/`) | Deterministic installs |
| `npx tsc --noEmit` | Static type check (quality gate) |
| `npm run test:coverage` | Jest unit + integration tests; **enforces coverage thresholds** |
| Upload `backend/coverage/` | HTML/lcov artifacts for tutors and reviewers |
| **Job `backend-api-newman`** | Build `dist/`, start `node dist/server.js` with MongoDB service, run `npm run test:api` |
| Upload `postman/newman-report.json` | JSON evidence of API run |
| **Job `quality-gate`** | Fails unless `backend-test`, `backend-api-newman`, and `frontend-test` all succeed |

**Fail on error:** Any failing shell command or test runner exits with a non-zero code; the final `quality-gate` job aggregates results and blocks the pipeline if any required job failed.

---

## 5. Metrics

### 5.1 Automation coverage (test cases)

**Formula:**  
`Automation Coverage (%) = (Automated test cases / Total identified test cases) × 100`

| Module | Total cases (this report) | Automated (Jest + Newman) | Coverage % |
| --- | ---: | ---: | ---: |
| Health | 1 | 1 | 100 |
| Auth | 5 | 5 | 100 |
| Exams | 3 | 3 | 100 |
| Attempts | 3 | 3 | 100 |
| Bookmarks / Reviews / Forum | 3 | 3 (Jest; partial overlap in Newman) | 100* |
| **Total (API table)** | **15** | **15** | **100** |

\*Forum/bookmark/review scenarios are primarily covered by Jest integration suites; Newman focuses on the auth → exam → attempt critical path plus health.

### 5.2 Execution time (TTE) — indicative

| Suite | Tool | Typical duration (indicative) |
| --- | --- | --- |
| Unit tests | Jest | Tens of seconds |
| Integration tests | Jest + Supertest + in-memory MongoDB | ~1–3 minutes (environment-dependent) |
| API collection | Newman | ~10–60 seconds (network + DB) |
| **Total backend CI (Jest + Newman)** | — | Within assignment “minutes” budget |

### 5.3 Defects found vs expected risk (template)

| Module | Expected risk (from scope) | Defects found (example sprint) | Comment |
| --- | --- | ---: | --- |
| Auth | Critical | 0 | Illustrative; replace with project tracking data |
| Attempts | Critical | 0 | |
| Exams | High | 0 | |

**Defect detection rate (example):**  
`(Defects found by automated tests / Total defects) × 100` — report from issue tracker.

**Test efficiency (example):**  
`Defects found / Hours spent running automation`.

---

## 6. Logs and evidence

### 6.1 Example Jest log (abridged)

```text
PASS  src/__tests__/integration/health.test.ts
  GET /api/health
    ✓ returns 200 with status ok (45 ms)

PASS  src/__tests__/integration/auth.test.ts
  POST /api/auth/register
    ✓ returns 201 with token and user on valid input (120 ms)
    ...

Test Suites: 13 passed, 13 total
Tests:       N passed, N total
```

### 6.2 API evidence (Newman JSON)

After `npm run test:api`, see `backend/postman/newman-report.json` (gitignored locally; retained as a CI artifact). It records each request, assertions, and pass/fail for coursework evidence.

### 6.3 Evidence traceability table

| Test case ID | Automation | Evidence |
| --- | --- | --- |
| TC-API-01 | BE-I-07 | Jest output; Newman *Health* folder |
| TC-API-02–06 | BE-I-01, BE-A-01 | Jest `auth.test.ts`; Newman *Auth* folder |
| TC-API-08–09 | BE-I-02, BE-A-01 | Jest `exams.test.ts`; Newman *Exams* |
| TC-API-10–12 | BE-I-03, BE-A-01 | Jest `attempts.test.ts`; Newman *Attempts* |

---

## 7. QA strategy documentation

This backend uses **risk-based test automation**: the highest investment is in **authentication**, **attempt lifecycle**, and **exam integrity** (hiding correct answers, enforcing time limits). Lower risk areas such as the health check and read-heavy listing endpoints still receive automated smoke coverage so regressions are caught early.

**Tooling:** **Jest** with **Supertest** provides fast feedback against the Express `app` instance without manual browser work. **mongodb-memory-server** isolates integration tests from shared databases. **Postman** collections document executable API examples for markers and developers; **Newman** runs the same checks in CI against a **real** Node process and MongoDB, which catches wiring issues that in-memory tests might miss.

**CI overview:** Every push and pull request triggers parallel jobs. Backend quality is gated by TypeScript, Jest coverage thresholds, and Newman. Artifacts (coverage HTML, Newman JSON) support assignment submission and audits.

**Quality gates summary:** Minimum **80%** line coverage on the backend (with branch threshold **70%**), zero tolerance for failing tests in CI, and mandatory Newman success for the published collection.

**Test pyramid (backend view):** A wide base of **unit tests** (services), a middle layer of **integration tests** (HTTP + database), and a thin top of **API contract runs** (Newman) for end-to-end HTTP behaviour. This balance keeps execution time reasonable while protecting the highest-risk behaviours.

---

*End of backend-only report.*
