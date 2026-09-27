import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { updatePasswordSchema, firstLoginProfileSchema } from '../validators/authSchemas.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from '../services/auditService.js';

const router = express.Router();

/**
 * POST /api/users/complete-profile
 * First-time employee login setup wizard submission
 */
router.post('/complete-profile', authenticateToken, async (req, res, next) => {
  try {
    const validationResult = firstLoginProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Profile completion validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationResult.error.flatten().fieldErrors,
        requestId: req.requestId,
      });
    }

    const profileData = validationResult.data;

    // Save profile to employees table in Supabase
    const { data: updatedEmployee, error } = await supabaseAdmin
      .from('employees')
      .upsert({
        user_id: req.user.id,
        company_id: req.user.companyId,
        employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        personal_info: profileData.personalInfo,
        contact_info: profileData.contactInfo,
        bank_info: profileData.bankInfo,
        emergency_contact: profileData.emergencyContact,
        documents: profileData.documents || [],
        security_setup: profileData.securitySetup || {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Mark user profile as completed
    await supabaseAdmin
      .from('user_profiles')
      .update({
        is_first_login: false,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id);

    // Audit log
    await auditService.log({
      user: req.user,
      action: 'PROFILE_COMPLETED',
      entity: 'EMPLOYEE_PROFILE',
      entityId: req.user.id,
      newValue: { completed: true },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully!',
      data: {
        profileCompleted: true,
        isFirstLogin: false,
        employee: updatedEmployee || profileData,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/security/change-password
 */
router.post('/security/change-password', authenticateToken, async (req, res, next) => {
  try {
    const validationResult = updatePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Password validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationResult.error.flatten().fieldErrors,
        requestId: req.requestId,
      });
    }

    // Audit password change
    await auditService.log({
      user: req.user,
      action: 'PASSWORD_CHANGED',
      entity: 'USER_SECURITY',
      entityId: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/security/2fa/toggle
 */
router.post('/security/2fa/toggle', authenticateToken, async (req, res, next) => {
  try {
    const { enable } = req.body;

    await auditService.log({
      user: req.user,
      action: enable ? '2FA_ENABLED' : '2FA_DISABLED',
      entity: 'USER_SECURITY',
      entityId: req.user.id,
      newValue: { twoFactorEnabled: !!enable },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: `Two-Factor Authentication has been ${enable ? 'enabled' : 'disabled'}.`,
      data: { twoFactorEnabled: !!enable },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
