const multer = require('multer');
const FileUploadService = require('../utils/fileUpload');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept all file types, validation will be done in the controller
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  }
});

const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size too large. Maximum size is 500MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size too large. Maximum size is 500MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size too large. Maximum size is 500MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields
};