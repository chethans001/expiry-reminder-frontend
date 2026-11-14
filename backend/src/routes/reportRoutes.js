const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/dashboard', reportController.getDashboardOverview);
router.get('/details', reportController.getReportData);
router.get('/export-csv', reportController.exportCSV);

module.exports = router;
