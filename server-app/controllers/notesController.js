import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Note from '../models/notesModel.js';
import User from '../models/userModel.js';

export const createNote = asyncHandler(async (req, res) => {
    const { title, content, category, tags, isPinned, userId } = req.body;

    if (!title || !content || !userId) {
        res.status(400);
        throw new Error("Title, content, and userId are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const note = await Note.create({
        title,
        content,
        category: category || 'other',
        tags: tags || [],
        isPinned: isPinned || false,
        user: userId
    });

    await note.populate('user', 'username email');

    res.status(201).json({
        message: "Note created successfully",
        note
    });
});


export const getNotesByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { category, isPinned, search } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    let query = { user: userId };

    // Add filters
    if (category && category !== 'all') {
        query.category = category;
    }
    
    if (isPinned !== undefined) {
        query.isPinned = isPinned === 'true';
    }

    // Search in title and content
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const notes = await Note.find(query)
        .populate('user', 'username email')
        .sort({ isPinned: -1, createdAt: -1 }); // Pinned notes first, then by creation date

    res.status(200).json({
        message: "Notes retrieved successfully",
        count: notes.length,
        notes
    });
});


export const getAllNotes = asyncHandler(async (req, res) => {
    const { userId, category, isPinned, search } = req.query;

    let query = {};

    if (userId) {
        query.user = userId;
    }

    if (category && category !== 'all') {
        query.category = category;
    }
    
    if (isPinned !== undefined) {
        query.isPinned = isPinned === 'true';
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const notes = await Note.find(query)
        .populate('user', 'username email')
        .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
        message: "Notes retrieved successfully",
        count: notes.length,
        notes
    });
});

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
export const getNote = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const note = await Note.findById(id).populate('user', 'username email');

    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }

    res.status(200).json({
        message: "Note retrieved successfully",
        note
    });
});

// @desc    Update a note
// @route   PUT /api/notes/update/:id
// @access  Public
export const updateNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, category, tags, isPinned } = req.body;

    const note = await Note.findById(id);

    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }

    // Update fields
    if (title) note.title = title;
    if (content) note.content = content;
    if (category) note.category = category;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updatedNote = await note.save();
    await updatedNote.populate('user', 'username email');

    res.status(200).json({
        message: "Note updated successfully",
        note: updatedNote
    });
});

// @desc    Delete a note
// @route   DELETE /api/notes/delete/:id
// @access  Public
export const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }

    await Note.findByIdAndDelete(id);

    res.status(200).json({
        message: "Note deleted successfully",
        deletedNote: {
            id: note._id,
            title: note.title
        }
    });
});

// @desc    Toggle pin status of a note
// @route   PATCH /api/notes/toggle-pin/:id
// @access  Public
export const togglePinNote = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }

    note.isPinned = !note.isPinned;
    const updatedNote = await note.save();
    await updatedNote.populate('user', 'username email');

    res.status(200).json({
        message: `Note ${updatedNote.isPinned ? 'pinned' : 'unpinned'} successfully`,
        note: updatedNote
    });
});

// @desc    Get notes statistics for a user
// @route   GET /api/notes/stats/:userId
// @access  Public
export const getNotesStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const totalNotes = await Note.countDocuments({ user: userId });
    const pinnedNotes = await Note.countDocuments({ user: userId, isPinned: true });
    
    // Count by category
    const categoryStats = await Note.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryCount = {};
    categoryStats.forEach(stat => {
        categoryCount[stat._id] = stat.count;
    });

    res.status(200).json({
        message: "Notes statistics retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        stats: {
            totalNotes,
            pinnedNotes,
            categoryCount
        }
    });
});