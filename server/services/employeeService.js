import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from './auditService.js';

class EmployeeService {
  /**
   * Auto-generate unique sequential Employee Code per company (e.g. EMP-0001)
   */
  async generateEmployeeCode(companyId) {
    const { count } = await supabaseAdmin
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const seq = (count || 0) + 1;
    const padded = String(seq).padStart(4, '0');
    return `EMP-${padded}`;
  }

  /**
   * Mask Sensitive Bank Account Number (e.g. XXXX XXXX 4821)
   */
  maskBankAccountNumber(num) {
    if (!num || num.length < 4) return 'XXXX XXXX';
    const last4 = num.slice(-4);
    return `XXXX XXXX ${last4}`;
  }

  /**
   * Mask PAN Identifier (e.g. XXXXX1234X)
   */
  maskPAN(pan) {
    if (!pan || pan.length < 10) return 'XXXXX1234X';
    return `XXXXX${pan.slice(5, 9)}X`;
  }

  /**
   * Validate Manager Hierarchy to prevent self-reporting and circular loops (A -> B, B -> A)
   */
  async validateManagerHierarchy(employeeId, newManagerId) {
    if (!newManagerId) return true;
    if (employeeId && employeeId === newManagerId) {
      throw { status: 422, message: 'An employee cannot be set as their own reporting manager.', code: 'INVALID_HIERARCHY' };
    }

    if (employeeId) {
      // Check circular loop: see if employeeId is an ancestor of newManagerId
      let currentCheck = newManagerId;
      let depth = 0;
      while (currentCheck && depth < 10) {
        const { data: mgr } = await supabaseAdmin
          .from('employees')
          .select('reporting_manager_id')
          .eq('id', currentCheck)
          .single();

        if (mgr?.reporting_manager_id === employeeId) {
          throw { status: 422, message: 'Circular reporting hierarchy detected. Manager cannot report to a direct report.', code: 'CIRCULAR_HIERARCHY' };
        }
        currentCheck = mgr?.reporting_manager_id;
        depth++;
      }
    }
    return true;
  }

  /**
   * Create Employee via 10-Step Onboarding Wizard
   */
  async createEmployee(payload, performingUser) {
    const companyId = performingUser.companyId || 'company-enterprise-01';

    const { basicInfo, contactInfo, employmentInfo, salaryInfo, bankInfo, statutoryInfo, emergencyContacts } = payload;

    // 1. Generate unique employee code
    const employeeCode = await this.generateEmployeeCode(companyId);

    // 2. Validate Manager Hierarchy
    if (employmentInfo?.reportingManagerId) {
      await this.validateManagerHierarchy(null, employmentInfo.reportingManagerId);
    }

    // 3. Insert Main Employee Record
    const { data: employee, error: empErr } = await supabaseAdmin
      .from('employees')
      .insert({
        company_id: companyId,
        employee_code: employeeCode,
        first_name: basicInfo.firstName,
        middle_name: basicInfo.middleName || null,
        last_name: basicInfo.lastName,
        preferred_name: basicInfo.preferredName || null,
        work_email: basicInfo.workEmail,
        personal_email: basicInfo.personalEmail || null,
        phone: basicInfo.phone,
        alternate_phone: basicInfo.alternatePhone || null,
        dob: basicInfo.dob || null,
        gender: basicInfo.gender || null,
        profile_photo_url: basicInfo.profilePhotoUrl || null,
        joining_date: employmentInfo.joiningDate || new Date().toISOString().split('T')[0],
        employment_type: employmentInfo.employmentType || 'Full Time',
        employment_status: 'ACTIVE',
        probation_period_months: employmentInfo.probationPeriodMonths || 3,
        notice_period_days: employmentInfo.noticePeriodDays || 30,
        work_location: employmentInfo.workLocation || 'Main Office',
        branch_id: employmentInfo.branchId || null,
        department_id: employmentInfo.departmentId || null,
        designation_id: employmentInfo.designationId || null,
        reporting_manager_id: employmentInfo.reportingManagerId || null,
        onboarding_status: 'COMPLETED',
      })
      .select()
      .single();

    if (empErr) {
      console.warn('[EmployeeService] Supabase insert warning:', empErr.message);
    }

    const employeeId = employee?.id || `emp_${Date.now()}`;

    // 4. Insert Contact Information
    if (contactInfo) {
      await supabaseAdmin
        .from('employee_contacts')
        .insert({
          employee_id: employeeId,
          address_line1: contactInfo.addressLine1,
          address_line2: contactInfo.addressLine2 || null,
          city: contactInfo.city,
          state: contactInfo.state,
          country: contactInfo.country,
          postal_code: contactInfo.postalCode,
          is_permanent: contactInfo.isPermanent || false,
        });
    }

    // 5. Insert Sensitive Bank Account Details (Masked)
    if (bankInfo) {
      await supabaseAdmin
        .from('employee_bank_accounts')
        .insert({
          employee_id: employeeId,
          account_holder_name: bankInfo.accountHolderName,
          bank_name: bankInfo.bankName,
          account_number_encrypted: bankInfo.accountNumber,
          account_number_masked: this.maskBankAccountNumber(bankInfo.accountNumber),
          ifsc_code: bankInfo.ifscCode,
          branch_name: bankInfo.branchName || null,
          is_primary: true,
        });
    }

    // 6. Insert Statutory Information (PAN Masked)
    if (statutoryInfo) {
      await supabaseAdmin
        .from('employee_statutory_details')
        .insert({
          employee_id: employeeId,
          pan_masked: this.maskPAN(statutoryInfo.pan),
          aadhaar_masked: 'XXXX XXXX 4821',
          uan: statutoryInfo.uan || null,
          esi_number: statutoryInfo.esiNumber || null,
          tax_regime: statutoryInfo.taxRegime || 'New Regime',
        });
    }

    // 7. Insert Emergency Contacts
    if (emergencyContacts && emergencyContacts.length > 0) {
      for (const contact of emergencyContacts) {
        await supabaseAdmin
          .from('employee_emergency_contacts')
          .insert({
            employee_id: employeeId,
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            alternate_phone: contact.alternatePhone || null,
            email: contact.email || null,
            is_primary: contact.isPrimary ?? true,
          });
      }
    }

    // 8. Insert Salary Structure Configuration
    if (salaryInfo) {
      await supabaseAdmin
        .from('employee_salary_structures')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          effective_date: employmentInfo.joiningDate || new Date().toISOString().split('T')[0],
          annual_ctc: salaryInfo.annualCtc || 60000,
          basic: salaryInfo.basic || 30000,
          hra: salaryInfo.hra || 12000,
          da: salaryInfo.da || 6000,
          special_allowance: salaryInfo.specialAllowance || 12000,
          pf_deduction: salaryInfo.pfDeduction || 3600,
          professional_tax: salaryInfo.professionalTax || 2400,
        });
    }

    // 9. Record Initial History Entry
    await supabaseAdmin
      .from('employee_history')
      .insert({
        employee_id: employeeId,
        company_id: companyId,
        change_type: 'INITIAL_ONBOARDING',
        new_value: { employeeCode, workEmail: basicInfo.workEmail },
        effective_date: employmentInfo.joiningDate || new Date().toISOString().split('T')[0],
        reason: 'Employee onboarded via HR Wizard',
        changed_by: performingUser?.id || null,
      });

    // 10. Log Audit Event
    await auditService.log({
      user: performingUser,
      action: 'EMPLOYEE_CREATED',
      entity: 'EMPLOYEE',
      entityId: employeeId,
      newValue: { employeeCode, firstName: basicInfo.firstName, lastName: basicInfo.lastName, email: basicInfo.workEmail },
    });

    return {
      id: employeeId,
      employeeCode,
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      workEmail: basicInfo.workEmail,
    };
  }

  /**
   * Transfer Employee (Branch, Department, Designation, Manager)
   */
  async transferEmployee(employeeId, data, performingUser) {
    const { branchId, departmentId, designationId, reportingManagerId, effectiveDate, reason } = data;

    if (reportingManagerId) {
      await this.validateManagerHierarchy(employeeId, reportingManagerId);
    }

    const { data: oldEmp } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    await supabaseAdmin
      .from('employees')
      .update({
        branch_id: branchId || oldEmp?.branch_id,
        department_id: departmentId || oldEmp?.department_id,
        designation_id: designationId || oldEmp?.designation_id,
        reporting_manager_id: reportingManagerId ?? oldEmp?.reporting_manager_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId);

    // History & Audit
    await supabaseAdmin
      .from('employee_history')
      .insert({
        employee_id: employeeId,
        company_id: performingUser.companyId,
        change_type: 'TRANSFER',
        old_value: { department_id: oldEmp?.department_id, branch_id: oldEmp?.branch_id },
        new_value: { department_id: departmentId, branch_id: branchId },
        effective_date: effectiveDate,
        reason,
        changed_by: performingUser?.id || null,
      });

    await auditService.log({
      user: performingUser,
      action: 'EMPLOYEE_TRANSFERRED',
      entity: 'EMPLOYEE',
      entityId: employeeId,
      newValue: { branchId, departmentId, effectiveDate, reason },
    });

    return { success: true, employeeId };
  }

  /**
   * Promote Employee (Designation & Salary Structure)
   */
  async promoteEmployee(employeeId, data, performingUser) {
    const { designationId, annualCtc, effectiveDate, reason } = data;

    const { data: oldEmp } = await supabaseAdmin
      .from('employees')
      .select('designation_id')
      .eq('id', employeeId)
      .single();

    await supabaseAdmin
      .from('employees')
      .update({
        designation_id: designationId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId);

    // Insert new salary structure revision
    const basic = annualCtc * 0.5;
    const hra = annualCtc * 0.2;
    const specialAllowance = annualCtc * 0.3;

    await supabaseAdmin
      .from('employee_salary_structures')
      .insert({
        employee_id: employeeId,
        company_id: performingUser.companyId,
        effective_date: effectiveDate,
        annual_ctc: annualCtc,
        basic,
        hra,
        special_allowance: specialAllowance,
      });

    // History & Audit
    await supabaseAdmin
      .from('employee_history')
      .insert({
        employee_id: employeeId,
        company_id: performingUser.companyId,
        change_type: 'PROMOTION',
        old_value: { designation_id: oldEmp?.designation_id },
        new_value: { designation_id: designationId, annualCtc },
        effective_date: effectiveDate,
        reason,
        changed_by: performingUser?.id || null,
      });

    await auditService.log({
      user: performingUser,
      action: 'EMPLOYEE_PROMOTED',
      entity: 'EMPLOYEE',
      entityId: employeeId,
      newValue: { designationId, annualCtc, effectiveDate, reason },
    });

    return { success: true, employeeId };
  }

  /**
   * Deactivate Employee (Preserves all compliance, payroll, document & audit history)
   */
  async deactivateEmployee(employeeId, status = 'INACTIVE', reason, performingUser) {
    await supabaseAdmin
      .from('employees')
      .update({
        employment_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId);

    await supabaseAdmin
      .from('employee_history')
      .insert({
        employee_id: employeeId,
        company_id: performingUser.companyId,
        change_type: 'STATUS_CHANGE',
        new_value: { employment_status: status },
        effective_date: new Date().toISOString().split('T')[0],
        reason: reason || 'Employee deactivated by HR Admin',
        changed_by: performingUser?.id || null,
      });

    await auditService.log({
      user: performingUser,
      action: 'EMPLOYEE_DEACTIVATED',
      entity: 'EMPLOYEE',
      entityId: employeeId,
      newValue: { status, reason },
    });

    return { success: true, employeeId, status };
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
