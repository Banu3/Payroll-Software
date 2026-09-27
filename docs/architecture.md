# Enterprise Payroll SaaS — System Architecture

```mermaid
graph TD
    Client[React 18 + Vite Frontend] -->|HTTPS / REST API| Server[Node.js / Express Backend]
    Server -->|JWT / Supabase JS Client| DB[(Supabase PostgreSQL Database)]
    Server -->|Storage API| Storage[Supabase Storage Buckets]
    
    subgraph Security Layer
        Server --> Middleware[Tenant Auth Middleware]
        Middleware --> RateLimiter[Rate Limiter & Security Headers]
        Middleware --> RequestTracker[Request Tracker & Anti-CSV Injection]
    end

    subgraph Business Engine Core
        Server --> PayrollEngine[Payroll Processing Engine]
        Server --> AttendanceEngine[Attendance & Overtime Service]
        Server --> LeaveEngine[Leave Management Service]
        Server --> CompensationEngine[Compensation & Tax Calculator]
        Server --> BankEngine[Bank Payment & Statutory Generator]
        Server --> AIEngine[AI Assistant Data Access Layer]
    end

    subgraph Database RLS Protection
        DB --> RLS[Row Level Security Engine]
        RLS --> CompanyIsolatedData[Tenant Isolated Tables]
    end
```

---

## Data Flow Lifecycle

1. **Company & Employee Management**: HR Admin sets up branches, departments, employees, and salary structures.
2. **Time & Leave Processing**: Attendance feeds into daily calculation routines; leaves are validated against accrual ledgers.
3. **Payroll Processing Run**: HR creates a Payroll Period, triggers batch calculation (Gross, Deductions, PF, ESI, PT, TDS, Net Salary).
4. **Approval & Finalization**: Payroll calculation validated, approved by HR/Finance, finalized (snapshotting records).
5. **Document & Payment Processing**: Payslips generated as PDF; Bank transfer files (ICICI, HDFC, SBI, Axis) generated along with statutory reports (EPFO ECR, ESI, Form 16, PT).
6. **Self-Service & AI Support**: Employees view payslips & apply for leaves; HR uses AI assistant for query resolution under strict permission filters.
