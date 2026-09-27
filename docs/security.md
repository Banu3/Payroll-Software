# Enterprise Payroll SaaS — Security Architecture & Guidelines

## 1. Multi-Tenant Architecture & RLS

Every tenant record in the database contains a mandatory `company_id` foreign key.
All Supabase database queries pass through Row Level Security (RLS) policies.

```sql
-- Pattern for tenant isolation policy
CREATE POLICY tenant_isolation_policy ON public.employees
    FOR ALL
    USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));
```

---

## 2. Authentication & 2FA Setup

- **JWT Session Tokens**: Issued via Supabase Auth with short lifespans (1 hour) and refresh token rotation.
- **Two-Factor Authentication (2FA)**: Standard TOTP protocol with 6-digit dynamic codes and single-use emergency recovery keys.
- **Session Termination**: Users can terminate all active sessions via the Security Settings page.

---

## 3. Defense Against Common Vulnerabilities

| Attack Vector | Defense Mechanism |
| :--- | :--- |
| **SQL Injection** | Parameterized queries via Supabase client, input validation via Zod, strict prohibition of `eval()` or raw SQL strings. |
| **XSS** | React default HTML encoding, strict CSP headers, input sanitization middleware. |
| **CSRF** | SameSite cookie policy, CORS origin restricting API access to trusted frontend domain. |
| **CSV Injection** | Automated sanitization of leading formula characters (`=`, `+`, `-`, `@`) in `requestTracker.js`. |
| **IDOR / Privilege Escalation** | Backend re-verifies user role, company context, and explicit granted permissions for every endpoint. |
| **Brute Force** | Express rate limiters applied to auth routes (`/api/auth/login`, `/api/auth/2fa`). |

---

## 4. Sensitive PII Data Protection

- **Field-level Masking**: Aadhaar, PAN, and Bank Account numbers are masked in standard UI listings (e.g. `XXXX-XXXX-1234`).
- **Audit Trails**: Access or export of PII data triggers an entry in `audit_logs`.
- **Zero Raw Secrets Logging**: Passwords, API secret keys, TOTP secrets, and JWT tokens are stripped from server console logs.
