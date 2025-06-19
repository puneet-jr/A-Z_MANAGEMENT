import express from 'express';
import { registerTask, getTasks, deleteTask, updateTask, getTasksByUser } from '../controllers/taskController.js';

const router = express.Router();

router.post('/register', registerTask);

router.get('/get', getTasks); 

router.get('/user/:userId', getTasksByUser); 

router.delete('/delete/:id', deleteTask);

router.put('/update/:id', updateTask);

export default router;