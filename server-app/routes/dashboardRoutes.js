import express from 'express';
import {
    getUserDashboard,
    getTaskCompletionStats,
    getTaskCompletionTrends
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/user/:userId', getUserDashboard);
router.get('/tasks/:userId', getTaskCompletionStats);
router.get('/trends/:userId', getTaskCompletionTrends);

export default router;