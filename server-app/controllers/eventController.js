import asyncHandler from 'express-async-handler';
import UrgentEvent from '../models/eventModel.js';
import User from '../models/userModel.js';


export const createUrgentEvent = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        eventDate, 
        eventTime, 
        location, 
        priority, 
        reminderSet, 
        reminderTime, 
        contactInfo, 
        userId 
    } = req.body;

    if (!title || !description || !eventDate || !eventTime || !userId) {
        res.status(400);
        throw new Error("Title, description, event date, event time, and userId are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const urgentEvent = await UrgentEvent.create({
        title,
        description,
        eventDate,
        eventTime,
        location,
        priority: priority || 'high',
        reminderSet: reminderSet || false,
        reminderTime,
        contactInfo,
        user: userId
    });

    await urgentEvent.populate('user', 'username email');

    res.status(201).json({
        message: "Urgent event created successfully",
        urgentEvent
    });
});

// @desc    Get urgent events by user
// @route   GET /api/urgent-events/user/:userId
// @access  Public
export const getUrgentEventsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { priority, status, upcoming } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    let query = { user: userId };

    if (priority) {
        query.priority = priority;
    }

    if (status) {
        query.status = status;
    }

    // Get only upcoming events
    if (upcoming === 'true') {
        query.eventDate = { $gte: new Date() };
        query.status = { $ne: 'completed' };
    }

    const urgentEvents = await UrgentEvent.find(query)
        .populate('user', 'username email')
        .sort({ priority: 1, eventDate: 1 }); // Critical first, then by date

    res.status(200).json({
        message: "Urgent events retrieved successfully",
        count: urgentEvents.length,
        urgentEvents
    });
});

// @desc    Get all urgent events
// @route   GET /api/urgent-events/get
// @access  Public
export const getAllUrgentEvents = asyncHandler(async (req, res) => {
    const { userId, priority, status } = req.query;

    let query = {};

    if (userId) query.user = userId;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const urgentEvents = await UrgentEvent.find(query)
        .populate('user', 'username email')
        .sort({ priority: 1, eventDate: 1 });

    res.status(200).json({
        message: "Urgent events retrieved successfully",
        count: urgentEvents.length,
        urgentEvents
    });
});

// @desc    Update urgent event
// @route   PUT /api/urgent-events/update/:id
// @access  Public
export const updateUrgentEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const urgentEvent = await UrgentEvent.findById(id);

    if (!urgentEvent) {
        res.status(404);
        throw new Error("Urgent event not found");
    }

    const updatedEvent = await UrgentEvent.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.status(200).json({
        message: "Urgent event updated successfully",
        urgentEvent: updatedEvent
    });
});

// @desc    Delete urgent event
// @route   DELETE /api/urgent-events/delete/:id
// @access  Public
export const deleteUrgentEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const urgentEvent = await UrgentEvent.findById(id);

    if (!urgentEvent) {
        res.status(404);
        throw new Error("Urgent event not found");
    }

    await UrgentEvent.findByIdAndDelete(id);

    res.status(200).json({
        message: "Urgent event deleted successfully"
    });
});

// @desc    Get urgent events stats
// @route   GET /api/urgent-events/stats/:userId
// @access  Public
export const getUrgentEventsStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const totalEvents = await UrgentEvent.countDocuments({ user: userId });
    const criticalEvents = await UrgentEvent.countDocuments({ user: userId, priority: 'critical' });
    const upcomingEvents = await UrgentEvent.countDocuments({ 
        user: userId, 
        eventDate: { $gte: new Date() },
        status: { $ne: 'completed' }
    });

    res.status(200).json({
        message: "Urgent events statistics retrieved successfully",
        stats: {
            totalEvents,
            criticalEvents,
            upcomingEvents
        }
    });
});