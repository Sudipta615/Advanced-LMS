const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000', // Local development
      'http://localhost:3001'
    ].filter(Boolean);

    // Allow requests with no origin in development (like Postman or curl)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, false);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'X-CSRF-Token'
  ],
  maxAge: 3600, // Preflight cache for 1 hour
  optionsSuccessStatus: 204
};

module.exports = corsOptions;
