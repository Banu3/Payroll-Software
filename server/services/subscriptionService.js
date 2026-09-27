import { supabaseAdmin } from '../config/supabase.js';

class SubscriptionService {
  async getPlans() {
    const { data: plans } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    const fallbackPlans = [
      { id: 'p1', name: 'Starter', code: 'STARTER', price_monthly: 49, employee_limit: 25, storage_limit_gb: 5 },
      { id: 'p2', name: 'Professional', code: 'PROFESSIONAL', price_monthly: 149, employee_limit: 250, storage_limit_gb: 25 },
      { id: 'p3', name: 'Business', code: 'BUSINESS', price_monthly: 299, employee_limit: 1000, storage_limit_gb: 100 },
      { id: 'p4', name: 'Enterprise Unlimited', code: 'ENTERPRISE', price_monthly: 599, employee_limit: 10000, storage_limit_gb: 500 },
    ];

    return plans && plans.length > 0 ? plans : fallbackPlans;
  }

  async checkEmployeeLimit(companyId) {
    const { data: sub } = await supabaseAdmin
      .from('company_subscriptions')
      .select('employee_limit')
      .eq('company_id', companyId)
      .single();

    const limit = sub?.employee_limit || 250;

    const { count } = await supabaseAdmin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const currentCount = count || 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        limit,
        currentCount,
        message: `Employee limit reached for your current plan (${currentCount}/${limit}). Upgrade plan to add more employees.`,
      };
    }

    return { allowed: true, limit, currentCount };
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
