import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function seedEmployees() {
  console.log("Checking for existing employees...");
  const companyId = 'company-enterprise-01'; // Default ID for seeding

  const { count, error } = await supabaseAdmin
    .from('employees')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error("Error querying employees:", error.message);
    process.exit(1);
  }

  if (count && count > 0) {
    console.log(`Database already has ${count} employees. No seeding needed.`);
    process.exit(0);
  }

  console.log("No employees found. Seeding 15 demo employees...");

  // We need a company first
  let { data: company } = await supabaseAdmin.from('companies').select('id').limit(1).single();
  
  if (!company) {
    console.log("Creating default company...");
    const { data: newCompany, error: compErr } = await supabaseAdmin.from('companies').insert({
      name: 'Apex Global Enterprises',
      code: 'APEX',
      domain: 'company.com'
    }).select().single();
    
    if (compErr) {
        console.error("Company creation failed:", compErr.message);
        process.exit(1);
    } else {
        company = newCompany;
    }
  }

  // Create some departments
  const depts = [
    { company_id: company.id, name: 'Engineering', code: 'ENG' },
    { company_id: company.id, name: 'HR', code: 'HR' },
    { company_id: company.id, name: 'Sales', code: 'SLS' }
  ];
  
  const { data: insertedDepts } = await supabaseAdmin.from('departments').insert(depts).select();
  const deptEng = insertedDepts?.find(d => d.code === 'ENG')?.id;
  const deptHr = insertedDepts?.find(d => d.code === 'HR')?.id;

  const employeesToInsert = Array.from({ length: 15 }).map((_, i) => ({
    company_id: company.id,
    employee_code: `EMP-${String(i + 1).padStart(4, '0')}`,
    first_name: `DemoUser${i + 1}`,
    last_name: 'Test',
    work_email: `user${i + 1}@company.com`,
    phone: `+1555000${String(i).padStart(3, '0')}`,
    employment_status: i % 5 === 0 ? 'ON LEAVE' : 'ACTIVE',
    joining_date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
    department_id: i % 2 === 0 ? deptEng : deptHr,
  }));

  const { data: insertedEmployees, error: insertErr } = await supabaseAdmin.from('employees').insert(employeesToInsert).select();
  
  if (insertErr) {
    console.error("Failed to insert employees:", insertErr.message);
    process.exit(1);
  }

  // Seed compensation records for these employees
  console.log("Seeding compensation records...");
  const compensations = insertedEmployees.map((emp) => ({
    company_id: company.id,
    employee_id: emp.id,
    annual_ctc: 120000,
    monthly_ctc: 10000,
    monthly_gross: 10000,
    basic_salary: 5000,
    total_deductions: 1200,
    estimated_net_salary: 8800,
    status: 'ACTIVE',
    effective_from: '2026-01-01'
  }));
  
  const { error: compErr2 } = await supabaseAdmin.from('employee_compensation').insert(compensations);
  if (compErr2) {
      console.warn("Failed to insert compensation:", compErr2.message);
  }

  // Also seed employee_salary_structures as fallback just in case
  const structures = insertedEmployees.map((emp) => ({
    company_id: company.id,
    employee_id: emp.id,
    annual_ctc: 120000,
    basic: 5000,
    hra: 2500,
    special_allowance: 2500,
    effective_date: '2026-01-01'
  }));

  await supabaseAdmin.from('employee_salary_structures').insert(structures);

  console.log("Successfully seeded 15 demo employees with compensation!");
}

seedEmployees();
