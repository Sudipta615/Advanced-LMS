const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminAnalyticsRoutes = require('./src/routes/adminAnalyticsRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(generalLimiter);

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api', communicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
