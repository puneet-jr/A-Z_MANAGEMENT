import express from 'express';

import {
    analyseTasks,  
    analyseProductivityByDay,
    analyseTaskCompletionTimes,
    getFullAnalysis
} from '../controllers/analysisController.js';

const router = express.Router();

// POST /api/analytics/analyse-tasks/:userId - Analyse task patterns
router.post('/analyse-tasks/:userId', analyseTasks);

// GET /api/analytics/productivity/:userId - Analyse productivity by day
router.get('/productivity/:userId', analyseProductivityByDay);

// GET /api/analytics/completion-times/:userId - Analyse task completion times
router.get('/completion-times/:userId', analyseTaskCompletionTimes);

// GET /api/analytics/full-analysis/:userId - Get full analysis report
router.get('/full-analysis/:userId', getFullAnalysis);

export default router;

/*

POST   http://localhost:3000/api/users/addUser
POST   http://localhost:3000/api/users/checkUser
GET    http://localhost:3000/api/users/getAllUsers
GET    http://localhost:3000/api/users/getUserById/:userId
GET    http://localhost:3000/api/users/getUserWithTasks/:userId
GET    http://localhost:3000/api/users/getUserStats/:userId
PUT    http://localhost:3000/api/users/updateUser/:userId
DELETE http://localhost:3000/api/users/deleteUser/:userId

*/
