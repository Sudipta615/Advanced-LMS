const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminAnalyticsRoutes = require('./src/routes/adminAnalyticsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const gamificationRoutes = require('./src/routes/gamificationRoutes');
const userPreferenceRoutes = require('./src/routes/userPreferenceRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');

const errorHandler = require('./src/middleware/errorHandler');
const maintenanceMode = require('./src/middleware/maintenanceMode');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { csrfProtection } = require('./src/middleware/csrfProtection');
const { securityMiddleware } = require('./src/middleware/securityLogger');

const corsOptions = require('./src/config/corsConfig');

const app = express();

app.use(securityMiddleware);

// Response time tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log(`⚠️  Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});

// Enhanced Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Block inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React/Tailwind
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  noSniff: true,
  frameguard: {
    action: 'deny'
  }
}));

app.use(compression());

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(generalLimiter);
app.use(maintenanceMode);

// CSRF Protection - apply after cookie-parser
app.use(csrfProtection);


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api', quizRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', certificateRoutes);
app.use('/api', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userPreferenceRoutes);
app.use('/api', communicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
