import express from 'express';
import {
    createUrgentEvent,
    getUrgentEventsByUser,
    getAllUrgentEvents,
    updateUrgentEvent,
    deleteUrgentEvent,
    getUrgentEventsStats
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/create', createUrgentEvent);
router.get('/get', getAllUrgentEvents);
router.get('/user/:userId', getUrgentEventsByUser);
router.get('/stats/:userId', getUrgentEventsStats);
router.put('/update/:id', updateUrgentEvent);
router.delete('/delete/:id', deleteUrgentEvent);

export default router;