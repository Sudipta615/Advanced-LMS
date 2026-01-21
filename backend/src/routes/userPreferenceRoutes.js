const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const UserPreferenceController = require('../controllers/userPreferenceController');
const { updatePreferencesSchema } = require('../validators/userPreferenceValidators');

router.use(authenticateToken);

router.get('/preferences', UserPreferenceController.getPreferences);
router.put('/preferences', validateRequest(updatePreferencesSchema), UserPreferenceController.updatePreferences);

module.exports = router;
