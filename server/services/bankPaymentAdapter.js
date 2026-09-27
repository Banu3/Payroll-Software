import crypto from 'crypto';
import supabase from '../lib/supabase.js';

export class BankPaymentAdapter {

  /**
   * Helper: Mask Bank Account Number (e.g. "XXXX XXXX 4582")
   */
  static maskAccount(acc) {
    if (!acc) return 'N/A';
    const str = String(acc).trim();
    if (str.length <= 4) return str;
    return `XXXX-XXXX-${str.slice(-4)}`;
  }

  /**
   * Generate Unique Payment Batch Number (e.g. PAY-2026-09-000001)
   */
  static async generateBatchNumber(companyId, year, month) {
    const mm = String(month).padStart(2, '0');
    const prefix = `PAY-${year}-${mm}-`;
    
    const { count } = await supabase
      .from('payment_batches')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const seq = String((count || 0) + 1).padStart(6, '0');
    return `${prefix}${seq}`;
  }

  /**
   * Prepare Payment Batch from Finalized Payroll Run
   */
  static async createPaymentBatch(companyId, payrollRunId, companyBankAccountId, notes, userId) {
    // 1. Verify Payroll Run status = FINALIZED or APPROVED
    const { data: run, error: runErr } = await supabase
      .from('payroll_runs')
      .select('*, payroll_periods(*)')
      .eq('id', payrollRunId)
      .eq('company_id', companyId)
      .single();

    if (runErr || !run) {
      throw new Error('Payroll run not found.');
    }

    if (run.status !== 'FINALIZED' && run.status !== 'APPROVED') {
      throw new Error('Payment batches can ONLY be created from FINALIZED or APPROVED payroll runs.');
    }

    // 2. Fetch Employee Calculation Summaries from Part 7
    const { data: empRuns, error: empErr } = await supabase
      .from('payroll_run_employees')
      .select('*, employees(*)')
      .eq('payroll_run_id', payrollRunId);

    if (empErr || !empRuns || empRuns.length === 0) {
      throw new Error('No employee calculation records found for this payroll run.');
    }

    // 3. Validate employee bank details
    let validCount = 0;
    let invalidCount = 0;
    let totalNet = 0;

    const itemsToInsert = empRuns.map((emp) => {
      const netSalary = Number(emp.net_salary || 0);
      totalNet += netSalary;

      const hasBank = !!(emp.employees?.bank_account_number && emp.employees?.ifsc_code);
      if (hasBank) validCount++;
      else invalidCount++;

      return {
        company_id: companyId,
        employee_id: emp.employee_id,
        payroll_run_employee_id: emp.id,
        employee_name: `${emp.employees?.first_name || ''} ${emp.employees?.last_name || ''}`.trim(),
        bank_name: emp.employees?.bank_name || 'N/A',
        masked_account_number: this.maskAccount(emp.employees?.bank_account_number),
        ifsc_code: emp.employees?.ifsc_code || 'N/A',
        amount: netSalary,
        status: hasBank ? 'READY' : 'REJECTED',
        failure_reason: hasBank ? null : 'Missing Bank Account Number or IFSC Code'
      };
    });

    const year = run.payroll_period?.year || new Date().getFullYear();
    const month = run.payroll_period?.month || (new Date().getMonth() + 1);
    const batchNumber = await this.generateBatchNumber(companyId, year, month);

    // 4. Insert Payment Batch
    const { data: batch, error: batchErr } = await supabase
      .from('payment_batches')
      .insert({
        company_id: companyId,
        payroll_run_id: payrollRunId,
        company_bank_account_id: companyBankAccountId || null,
        batch_number: batchNumber,
        total_employees: empRuns.length,
        valid_bank_count: validCount,
        invalid_bank_count: invalidCount,
        total_net_amount: totalNet,
        status: 'DRAFT',
        notes,
        created_by: userId
      })
      .select()
      .single();

    if (batchErr) throw batchErr;

    // 5. Insert Batch Line Items
    const itemsWithBatch = itemsToInsert.map((item) => ({
      ...item,
      payment_batch_id: batch.id
    }));

    const { error: itemErr } = await supabase
      .from('payment_batch_items')
      .insert(itemsWithBatch);

    if (itemErr) throw itemErr;

    return { batch, validCount, invalidCount, totalNet };
  }

  /**
   * Generate Bank Transfer CSV/TXT File for Bank Portal Upload
   */
  static async generateBankTransferFile(companyId, paymentBatchId, fileFormat = 'CSV', userId) {
    const { data: batch } = await supabase
      .from('payment_batches')
      .select('*, company_bank_accounts(*)')
      .eq('id', paymentBatchId)
      .eq('company_id', companyId)
      .single();

    if (!batch) throw new Error('Payment batch not found.');

    const { data: items } = await supabase
      .from('payment_batch_items')
      .select('*')
      .eq('payment_batch_id', paymentBatchId)
      .eq('status', 'READY');

    if (!items || items.length === 0) {
      throw new Error('No valid ready payment items in this batch to export.');
    }

    // Build standard Corporate NEFT/RTGS CSV Ledger
    const headers = [
      'Transaction Reference',
      'Debit Account',
      'Beneficiary Name',
      'Beneficiary Account',
      'IFSC Code',
      'Amount (INR)',
      'Payment Date',
      'Remarks'
    ];

    const debitAcc = batch.company_bank_accounts?.account_number || 'COMPANY_DEBIT_ACC';
    const rows = items.map((item, idx) => [
      `TXN-${batch.batch_number}-${idx + 1}`,
      debitAcc,
      `"${item.employee_name}"`,
      item.masked_account_number,
      item.ifsc_code,
      item.amount,
      new Date().toISOString().slice(0, 10),
      `Salary Disbursement ${batch.batch_number}`
    ]);

    const csvText = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const fileHash = crypto.createHash('sha256').update(csvText).digest('hex');
    const fileName = `Bank_Transfer_${batch.batch_number}.${fileFormat.toLowerCase()}`;
    const filePath = `payment-files/${companyId}/${fileName}`;

    // Record File Metadata
    const { data: fileRec, error: fErr } = await supabase
      .from('payment_files')
      .insert({
        company_id: companyId,
        payment_batch_id: paymentBatchId,
        file_name: fileName,
        file_format: fileFormat,
        file_path: filePath,
        file_hash: fileHash,
        generated_by: userId
      })
      .select()
      .single();

    if (fErr) throw fErr;

    // Advance Batch status to SUBMITTED
    await supabase
      .from('payment_batches')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString()
      })
      .eq('id', paymentBatchId);

    return { fileRecord: fileRec, csvText, totalItems: items.length };
  }

  /**
   * Reconcile Payment Instructions against Bank Results
   */
  static async reconcilePaymentBatch(companyId, paymentBatchId, userId) {
    const { data: items } = await supabase
      .from('payment_batch_items')
      .select('*')
      .eq('payment_batch_id', paymentBatchId);

    if (!items || items.length === 0) {
      throw new Error('No items found for reconciliation.');
    }

    let matchedCount = 0;
    const reconInserts = [];

    for (const item of items) {
      const netAmount = item.amount;
      const bankAmount = item.status === 'REJECTED' ? 0 : item.amount;
      const diff = netAmount - bankAmount;

      const reconStatus = item.status === 'REJECTED'
        ? 'FAILED_PAYMENT'
        : diff === 0
        ? 'MATCHED'
        : 'AMOUNT_MISMATCH';

      if (reconStatus === 'MATCHED') matchedCount++;

      reconInserts.push({
        company_id: companyId,
        payment_batch_id: paymentBatchId,
        payment_batch_item_id: item.id,
        payroll_net_amount: netAmount,
        instruction_amount: netAmount,
        bank_amount: bankAmount,
        discrepancy_amount: diff,
        status: reconStatus,
        reconciled_by: userId
      });
    }

    await supabase
      .from('payment_reconciliation_records')
      .insert(reconInserts);

    // Update Batch Status
    await supabase
      .from('payment_batches')
      .update({
        status: 'RECONCILED',
        completed_at: new Date().toISOString()
      })
      .eq('id', paymentBatchId);

    return { total: items.length, matchedCount };
  }
}
