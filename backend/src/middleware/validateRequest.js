const Joi = require('joi');

/**
 * Middleware to validate request data against Joi schemas
 * @param {Object} schemas - Object containing Joi schemas for body, query, and/or params
 */
const validateRequest = (schemaOrSchemas) => {
  return (req, res, next) => {
    // Support both single schema (legacy) and object with sources
    const schemas = schemaOrSchemas.validate ? { body: schemaOrSchemas } : schemaOrSchemas;
    
    const sources = ['body', 'query', 'params'];
    const errors = [];

    sources.forEach((source) => {
      if (schemas[source]) {
        const { error, value } = schemas[source].validate(req[source], {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: source === 'query'
        });

        if (error) {
          const sourceErrors = error.details.map((detail) => ({
            source,
            message: detail.message.replace(/"/g, ''),
            field: detail.path[0]
          }));
          errors.push(...sourceErrors);
        } else {
          // Update request with validated and sanitized values
          req[source] = value;
          // Maintain backward compatibility for body validation
          if (source === 'body') {
            req.validatedBody = value;
          }
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    next();
  };
};

module.exports = validateRequest;
