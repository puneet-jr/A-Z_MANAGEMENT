import express from 'express';
import {
    createNote,
    getNotesByUser,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote,
    togglePinNote,
    getNotesStats
} from '../controllers/notesController.js';

const router = express.Router();

router.post('/create', createNote);
router.get('/get', getAllNotes);
router.get('/user/:userId', getNotesByUser);
router.get('/stats/:userId', getNotesStats);
router.get('/:id', getNote);
router.put('/update/:id', updateNote);
router.patch('/toggle-pin/:id', togglePinNote);
router.delete('/delete/:id', deleteNote);

export default router;