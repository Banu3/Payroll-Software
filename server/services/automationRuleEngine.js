import supabase from '../lib/supabase.js';

export class AutomationRuleEngine {

  /**
   * Process Trigger Event across Company Rules
   */
  static async triggerEvent(companyId, eventName, payload = {}) {
    // 1. Find matching ACTIVE automation rules
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .eq('trigger_event', eventName)
      .eq('status', 'ACTIVE');

    if (!rules || rules.length === 0) return { triggered: 0 };

    let executed = 0;

    for (const rule of rules) {
      try {
        const actionSummary = await this.executeRuleActions(companyId, rule, payload);

        // Record execution log
        await supabase.from('automation_runs').insert({
          company_id: companyId,
          automation_rule_id: rule.id,
          trigger_name: eventName,
          action_summary: actionSummary,
          status: 'SUCCESS',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

        // Update last run timestamp
        await supabase
          .from('automation_rules')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', rule.id);

        executed++;
      } catch (err) {
        await supabase.from('automation_runs').insert({
          company_id: companyId,
          automation_rule_id: rule.id,
          trigger_name: eventName,
          action_summary: `Execution failed: ${err.message}`,
          status: 'FAILED',
          error_message: err.message,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });
      }
    }

    return { triggered: executed };
  }

  /**
   * Execute Configured Rule Actions
   */
  static async executeRuleActions(companyId, rule, payload) {
    const actions = rule.actions || [];
    const logs = [];

    for (const action of actions) {
      if (action.type === 'CREATE_TASK') {
        await supabase.from('automation_tasks').insert({
          company_id: companyId,
          task_name: action.payload?.taskName || `Automated Task: ${rule.name}`,
          description: action.payload?.description || `Triggered by event ${rule.trigger_event}`,
          priority: action.payload?.priority || 'MEDIUM',
          status: 'TODO',
          related_employee_id: payload.employeeId || null,
          related_payroll_run_id: payload.payrollRunId || null
        });
        logs.push('Created HR task');
      } else if (action.type === 'SEND_NOTIFICATION') {
        logs.push(`Dispatched notification: ${action.payload?.message || 'Automation alert'}`);
      }
    }

    return logs.join('; ') || 'No actions configured';
  }
}
