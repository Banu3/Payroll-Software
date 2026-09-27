import express from 'express';
import crypto from 'crypto';
import supabase from '../lib/supabase.js';
import { requireAuth, requirePermission, getCompanyId } from '../middleware/auth.js';
import { AutomationRuleEngine } from '../services/automationRuleEngine.js';
import { AIDataAccessService } from '../services/aiDataAccessService.js';
import {
  automationRuleSchema,
  hrTaskSchema,
  aiChatQuerySchema,
  webhookSchema,
  apiKeySchema
} from '../validators/automationAiIntegrationSchemas.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/automation/dashboard
 */
router.get('/dashboard', requirePermission('automation.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { count: activeRules } = await supabase
      .from('automation_rules')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'ACTIVE');

    const { count: pendingTasks } = await supabase
      .from('automation_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'TODO');

    const { data: recentRuns } = await supabase
      .from('automation_runs')
      .select('*')
      .eq('company_id', companyId)
      .order('started_at', { ascending: false })
      .limit(10);

    return res.json({
      success: true,
      data: {
        summary: {
          activeRules: activeRules || 0,
          pendingTasks: pendingTasks || 0,
          recentRunCount: recentRuns?.length || 0
        },
        recentRuns: recentRuns || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/automation/rules
 */
router.get('/rules', requirePermission('automation.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/automation/rules
 */
router.post('/rules', requirePermission('automation.manage'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = automationRuleSchema.parse(req.body);

    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        company_id: companyId,
        name: body.name,
        description: body.description,
        trigger_type: body.triggerType,
        trigger_event: body.triggerEvent,
        conditions: body.conditions,
        actions: body.actions,
        schedule: body.schedule,
        status: body.status,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/automation/tasks
 */
router.get('/tasks', requirePermission('automation.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('automation_tasks')
      .select('*, employees(first_name, last_name, employee_code)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/automation/tasks
 */
router.post('/tasks', requirePermission('automation.manage'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = hrTaskSchema.parse(req.body);

    const { data, error } = await supabase
      .from('automation_tasks')
      .insert({
        company_id: companyId,
        task_name: body.taskName,
        description: body.description,
        assigned_to: body.assignedTo || req.user.id,
        priority: body.priority,
        due_date: body.dueDate,
        related_employee_id: body.relatedEmployeeId,
        related_payroll_run_id: body.relatedPayrollRunId,
        status: 'TODO',
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/chat
 * HR AI Assistant Query Interface
 */
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, contextType } = aiChatQuerySchema.parse(req.body);
    const result = await AIDataAccessService.processAIQuery(req.user, message, contextType);

    // Record AI Usage log
    await supabase.from('ai_usage_logs').insert({
      company_id: req.user.company_id,
      user_id: req.user.id,
      query_type: contextType,
      status: 'SUCCESS'
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/integrations/overview
 */
router.get('/integrations/overview', requirePermission('integrations.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('company_id', companyId);

    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, scopes, last_used_at, created_at, status')
      .eq('company_id', companyId);

    const { data: connections } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('company_id', companyId);

    return res.json({
      success: true,
      data: {
        webhooks: webhooks || [],
        apiKeys: apiKeys || [],
        connections: connections || [
          { provider_code: 'SLACK', provider_name: 'Slack Workplace', category: 'COMMUNICATION', status: 'NOT_CONFIGURED' },
          { provider_code: 'MICROSOFT_TEAMS', provider_name: 'Microsoft Teams', category: 'COMMUNICATION', status: 'NOT_CONFIGURED' },
          { provider_code: 'QUICKBOOKS', provider_name: 'QuickBooks Accounting', category: 'ACCOUNTING', status: 'NOT_CONFIGURED' },
          { provider_code: 'BIOMETRIC_DEVICE', provider_name: 'Biometric Attendance Hardware', category: 'BIOMETRIC', status: 'NOT_CONFIGURED' }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/integrations/webhooks
 */
router.post('/integrations/webhooks', requirePermission('webhooks.manage'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { name, endpointUrl, subscribedEvents } = webhookSchema.parse(req.body);

    const rawSecret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const secretHash = crypto.createHash('sha256').update(rawSecret).digest('hex');

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        company_id: companyId,
        name,
        endpoint_url: endpointUrl,
        secret_hash: secretHash,
        subscribed_events: subscribedEvents,
        status: 'ACTIVE',
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data: { ...data, secret: rawSecret } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/integrations/api-keys
 */
router.post('/integrations/api-keys', requirePermission('api_keys.manage'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { name, scopes, expiresInDays } = apiKeySchema.parse(req.body);

    const prefix = 'epy_live_';
    const secretRandom = crypto.randomBytes(24).toString('hex');
    const fullApiKey = `${prefix}${secretRandom}`;
    const keyHash = crypto.createHash('sha256').update(fullApiKey).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        company_id: companyId,
        name,
        key_prefix: prefix,
        key_hash: keyHash,
        scopes,
        expires_at: expiresAt.toISOString(),
        status: 'ACTIVE',
        created_by: req.user.id
      })
      .select('id, name, key_prefix, scopes, expires_at, created_at, status')
      .single();

    if (error) throw error;
    return res.json({
      success: true,
      message: 'API Key created. Copy key secret now — it will not be shown again.',
      data: { ...data, apiKey: fullApiKey }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
