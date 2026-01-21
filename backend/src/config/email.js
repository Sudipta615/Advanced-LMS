require('dotenv').config();

module.exports = {
  service: process.env.EMAIL_SERVICE || 'smtp',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  from: process.env.EMAIL_FROM || 'noreply@advancedlms.com'
};
