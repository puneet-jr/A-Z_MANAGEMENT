import express from 'express';
import {
    createHealthData,
    getHealthDataByUser,
    getAllHealthData,
    updateHealthData,
    deleteHealthData,
    getHealthDataStats
} from '../controllers/healthController.js';

const router = express.Router();

router.post('/create', createHealthData);
router.get('/get', getAllHealthData);
router.get('/user/:userId', getHealthDataByUser);
router.get('/stats/:userId', getHealthDataStats);
router.put('/update/:id', updateHealthData);
router.delete('/delete/:id', deleteHealthData);

export default router;