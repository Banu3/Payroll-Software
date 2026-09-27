import { crypto } from 'node:crypto';

/**
 * Enterprise Request Tracking & Input Sanitization Middleware
 * Generates X-Request-ID, tracks latency, and sanitizes input data against CSV Injection.
 */
export const requestTracker = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[SLOW_REQUEST] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) [ID: ${requestId}]`);
    }
  });

  // Anti-CSV Injection Sanitizer for Body parameters
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Sanitizes object values to prevent CSV Formula Injection (=, +, -, @)
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;
  
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      if (/^[=+\-@\t\r]/.test(val)) {
        obj[key] = `'${val}`; // Prefix with single quote to escape formula execution in Excel/CSV
      }
    } else if (typeof val === 'object' && val !== null) {
      sanitizeObject(val);
    }
  }
}
