/**
 * Security Event Logger
 * Logs security-relevant events for auditing and monitoring
 */

const logSecurityEvent = (event, req, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'SECURITY_EVENT',
    event,
    userId: req.user ? req.user.id : 'anonymous',
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    ...details
  };

  // Log to console - in production this should be captured by a logging system (e.g. CloudWatch, ELK)
  console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
  
  // Potential integration with an external monitoring service or database
};

const securityMiddleware = (req, res, next) => {
  // Capture original res.send to log failed attempts
  const originalSend = res.send;
  
  res.send = function(body) {
    if (res.statusCode >= 400) {
      // Log potential attacks/failures
      if (res.statusCode === 401 || res.statusCode === 403) {
        logSecurityEvent('UNAUTHORIZED_ACCESS', req, { 
          statusCode: res.statusCode,
          message: body && typeof body === 'object' ? body.message : 'Access denied'
        });
      } else if (res.statusCode === 429) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', req);
      }
    }
    return originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = {
  logSecurityEvent,
  securityMiddleware
};
