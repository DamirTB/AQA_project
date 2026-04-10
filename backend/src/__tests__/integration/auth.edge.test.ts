// backend/src/__tests__/integration/auth.edge.test.ts
// NEW TEST CASES — Task 2: Expand Automation & Coverage
// Targets: Authentication (HIGH RISK, RPN=60) & JWT Middleware (HIGH RISK, RPN=30)

import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

const REGISTER_URL = '/api/auth/register';
const LOGIN_URL    = '/api/auth/login';

// ─────────────────────────────────────────────
// 1. FAILURE SCENARIOS
// ─────────────────────────────────────────────

describe('TC-AUTH-FAIL-01 — Tampered JWT token is rejected', () => {
    /**
     * ID:       TC-AUTH-FAIL-01
     * Module:   JWT Auth Middleware (HIGH RISK, RPN=30)
     * Type:     Failure Scenario
     * Input:    Manually crafted JWT with wrong signature
     * Expected: 401 Unauthorized
     */
    it('returns 401 when Authorization header contains a tampered token', async () => {
        // Register a real user so the endpoint is reachable
        await request(app).post(REGISTER_URL).send({
            username: 'realuser',
            email: 'real@example.com',
            password: 'password123',
        });

        // A token whose signature has been replaced with garbage
        const tamperedToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
            '.eyJ1c2VySWQiOiI2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NiJ9' +
            '.INVALIDSIGNATUREXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

        const res = await request(app)
            .get('/api/attempts/history')
            .set('Authorization', `Bearer ${tamperedToken}`);

        expect(res.status).toBe(401);
    });
});

describe('TC-AUTH-FAIL-02 — Malformed Authorization header format', () => {
    /**
     * ID:       TC-AUTH-FAIL-02
     * Module:   JWT Auth Middleware (HIGH RISK, RPN=30)
     * Type:     Failure Scenario
     * Input:    Token sent without "Bearer " prefix
     * Expected: 401 Unauthorized
     */
    it('returns 401 when token is sent without Bearer prefix', async () => {
        const res = await request(app)
            .get('/api/attempts/history')
            .set('Authorization', 'just-a-raw-token-no-prefix');

        expect(res.status).toBe(401);
    });
});

// ─────────────────────────────────────────────
// 2. EDGE CASES
// ─────────────────────────────────────────────

describe('TC-AUTH-EDGE-01 — SQL-injection-like input in username', () => {
    /**
     * ID:       TC-AUTH-EDGE-01
     * Module:   Authentication (HIGH RISK, RPN=60)
     * Type:     Edge Case / Injection Input
     * Input:    username = "'; DROP TABLE users; --"
     * Expected: 400 (validation rejects) OR 201 (safely stored as plain text).
     *           Must NOT cause 500 Internal Server Error.
     */
    it('does not crash and returns 400 or 201 for SQL-injection username', async () => {
        const res = await request(app).post(REGISTER_URL).send({
            username: "'; DROP TABLE users; --",
            email: 'sqli@example.com',
            password: 'password123',
        });

        expect([400, 201]).toContain(res.status);
        expect(res.status).not.toBe(500);
    });
});

describe('TC-AUTH-EDGE-02 — XSS-like input in username', () => {
    /**
     * ID:       TC-AUTH-EDGE-02
     * Module:   Authentication (HIGH RISK, RPN=60)
     * Type:     Edge Case / Special Character Input
     * Input:    username contains <script>alert(1)</script>
     * Expected: 400 (validation rejects) OR 201 (safely stored).
     *           Must NOT cause 500.
     */
    it('does not crash and returns 400 or 201 for XSS-like username', async () => {
        const res = await request(app).post(REGISTER_URL).send({
            username: '<script>alert(1)</script>',
            email: 'xss@example.com',
            password: 'password123',
        });

        expect([400, 201]).toContain(res.status);
        expect(res.status).not.toBe(500);
    });
});

describe('TC-AUTH-EDGE-03 — Extremely long password field', () => {
    /**
     * ID:       TC-AUTH-EDGE-03
     * Module:   Authentication (HIGH RISK, RPN=60)
     * Type:     Edge Case / Large Payload
     * Input:    password = 10 000 character string
     * Expected: 400 (validation rejects) OR 201 (accepted).
     *           Must NOT cause 500 or hang > 5 s.
     */
    it('handles extremely long password without crashing', async () => {
        const longPassword = 'A'.repeat(10_000);

        const res = await request(app).post(REGISTER_URL).send({
            username: 'longpassuser',
            email: 'longpass@example.com',
            password: longPassword,
        });

        expect([400, 201]).toContain(res.status);
        expect(res.status).not.toBe(500);
    }, 10_000); // 10 s timeout — bcrypt on 10k chars can be slow
});

// ─────────────────────────────────────────────
// 3. INVALID USER BEHAVIOR
// ─────────────────────────────────────────────

describe('TC-AUTH-INVALID-01 — Login with empty string credentials', () => {
    /**
     * ID:       TC-AUTH-INVALID-01
     * Module:   Authentication (HIGH RISK, RPN=60)
     * Type:     Invalid User Behavior / Empty Input
     * Input:    email = "", password = ""
     * Expected: 400 Bad Request
     */
    it('returns 400 when email and password are empty strings', async () => {
        const res = await request(app).post(LOGIN_URL).send({
            email: '',
            password: '',
        });

        expect(res.status).toBe(400);
    });
});

describe('TC-AUTH-INVALID-02 — Accessing protected endpoint without any header', () => {
    /**
     * ID:       TC-AUTH-INVALID-02
     * Module:   JWT Auth Middleware (HIGH RISK, RPN=30)
     * Type:     Invalid User Behavior / Skipping Auth Step
     * Input:    No Authorization header at all
     * Expected: 401 and error message present in body
     */
    it('returns 401 with an error body when Authorization header is absent', async () => {
        const res = await request(app).get('/api/bookmarks');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});