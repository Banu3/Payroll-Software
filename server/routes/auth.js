import express from 'express';
import { authService } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authSchemas.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationResult.error.flatten().fieldErrors,
        requestId: req.requestId,
      });
    }

    const { email, password } = validationResult.data;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const loginResult = await authService.login({ email, password, ip, userAgent });

    // Set secure HTTP-only cookie
    res.cookie('access_token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: loginResult.expiresIn * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: loginResult,
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await authService.logout({
      userId: req.user.id,
      companyId: req.user.companyId,
      token: req.cookies?.access_token,
      ip,
      userAgent,
    });

    res.clearCookie('access_token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        roles: req.user.roles,
        permissions: req.user.permissions,
        company: req.user.company,
        profileCompleted: req.user.profileCompleted,
        isFirstLogin: req.user.isFirstLogin,
      },
    },
    requestId: req.requestId,
  });
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Invalid email address',
        code: 'VALIDATION_ERROR',
        errors: validationResult.error.flatten().fieldErrors,
        requestId: req.requestId,
      });
    }

    const { email } = validationResult.data;
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.forgotPassword({ email, ip, userAgent });

    return res.status(200).json({
      success: true,
      message: result.message,
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', authRateLimiter, async (req, res, next) => {
  try {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Password validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationResult.error.flatten().fieldErrors,
        requestId: req.requestId,
      });
    }

    const { token, newPassword } = validationResult.data;
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.resetPassword({ token, newPassword, ip, userAgent });

    return res.status(200).json({
      success: true,
      message: result.message,
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/login-history
 */
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    const { data: events } = await supabaseAdmin
      .from('login_events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: events || [],
      requestId: req.requestId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve login history',
      code: 'SERVER_ERROR',
      requestId: req.requestId,
    });
  }
});

export default router;
