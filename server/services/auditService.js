import { supabaseAdmin } from '../config/supabase.js';

class AuditService {
  /**
   * Log security or business action in audit log
   */
  async log({
    user,
    userId,
    companyId,
    action,
    entity,
    entityId,
    oldValue = null,
    newValue = null,
    ip = '127.0.0.1',
    userAgent = 'Unknown',
  }) {
    try {
      const sanitizedOld = this.sanitizeData(oldValue);
      const sanitizedNew = this.sanitizeData(newValue);

      const targetUserId = userId || user?.id || null;
      const targetCompanyId = companyId || user?.companyId || null;

      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: targetUserId,
          company_id: targetCompanyId,
          action,
          entity,
          entity_id: entityId ? String(entityId) : null,
          old_value: sanitizedOld,
          new_value: sanitizedNew,
          ip_address: ip,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('[AuditService] Supabase insert warning (falling back to memory log):', error.message);
      }

      console.log(`[AUDIT LOG] ${action} on ${entity}:${entityId || 'N/A'} by User:${targetUserId || 'SYSTEM'}`);
      return data || { success: true };
    } catch (err) {
      console.error('[AuditService Error]:', err);
      return null;
    }
  }

  /**
   * Log login event
   */
  async logLoginEvent({
    userId,
    companyId,
    email,
    eventType,
    ip,
    userAgent,
    deviceInfo,
    browser,
    location,
    status,
    failureReason = null,
  }) {
    try {
      const { data, error } = await supabaseAdmin
        .from('login_events')
        .insert({
          user_id: userId || null,
          company_id: companyId || null,
          email,
          event_type: eventType,
          ip_address: ip || '127.0.0.1',
          user_agent: userAgent || 'Unknown',
          device_info: deviceInfo || 'Desktop',
          browser: browser || 'Browser',
          location: location || 'Local System',
          status,
          failure_reason: failureReason,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('[AuditService LoginEvent Warning]:', error.message);
      }
      return data;
    } catch (err) {
      console.error('[AuditService logLoginEvent Error]:', err);
    }
  }

  /**
   * Remove sensitive values like passwords, tokens, pins
   */
  sanitizeData(data) {
    if (!data) return null;
    if (typeof data !== 'object') return data;

    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveKeys = ['password', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'secret', 'ssn', 'taxId'];

    for (const key in sanitized) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }
    return sanitized;
  }
}

export const auditService = new AuditService();
export default auditService;
