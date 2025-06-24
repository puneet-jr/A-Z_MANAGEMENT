import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import HealthData from '../models/healthModel.js';
import User from '../models/userModel.js';

// @desc    Create health data entry
// @route   POST /api/health-data/create
// @access  Public
export const createHealthData = asyncHandler(async (req, res) => {
    const { title, category, data, notes, dateRecorded, isPrivate, userId } = req.body;

    if (!title || !category || !userId) {
        res.status(400);
        throw new Error("Title, category, and userId are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const healthData = await HealthData.create({
        title,
        category,
        data: data || {},
        notes,
        dateRecorded: dateRecorded || new Date(),
        isPrivate: isPrivate !== undefined ? isPrivate : true,
        user: userId
    });

    await healthData.populate('user', 'username email');

    res.status(201).json({
        message: "Health data created successfully",
        healthData
    });
});

// @desc    Get health data by user
// @route   GET /api/health-data/user/:userId
// @access  Public
export const getHealthDataByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { category, startDate, endDate } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    let query = { user: userId };

    if (category && category !== 'all') {
        query.category = category;
    }

    if (startDate && endDate) {
        query.dateRecorded = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const healthData = await HealthData.find(query)
        .populate('user', 'username email')
        .sort({ dateRecorded: -1 });

    res.status(200).json({
        message: "Health data retrieved successfully",
        count: healthData.length,
        healthData
    });
});

// @desc    Get all health data
// @route   GET /api/health-data/get
// @access  Public
export const getAllHealthData = asyncHandler(async (req, res) => {
    const { userId, category } = req.query;

    let query = {};

    if (userId) query.user = userId;
    if (category && category !== 'all') query.category = category;

    const healthData = await HealthData.find(query)
        .populate('user', 'username email')
        .sort({ dateRecorded: -1 });

    res.status(200).json({
        message: "Health data retrieved successfully",
        count: healthData.length,
        healthData
    });
});

// @desc    Update health data
// @route   PUT /api/health-data/update/:id
// @access  Public
export const updateHealthData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const healthData = await HealthData.findById(id);

    if (!healthData) {
        res.status(404);
        throw new Error("Health data not found");
    }

    const updatedHealthData = await HealthData.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.status(200).json({
        message: "Health data updated successfully",
        healthData: updatedHealthData
    });
});

// @desc    Delete health data
// @route   DELETE /api/health-data/delete/:id
// @access  Public
export const deleteHealthData = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const healthData = await HealthData.findById(id);

    if (!healthData) {
        res.status(404);
        throw new Error("Health data not found");
    }

    await HealthData.findByIdAndDelete(id);

    res.status(200).json({
        message: "Health data deleted successfully"
    });
});

// @desc    Get health data stats
// @route   GET /api/health-data/stats/:userId
// @access  Public
export const getHealthDataStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const totalEntries = await HealthData.countDocuments({ user: userId });
    
    // Count by category
    const categoryStats = await HealthData.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryCount = {};
    categoryStats.forEach(stat => {
        categoryCount[stat._id] = stat.count;
    });

    res.status(200).json({
        message: "Health data statistics retrieved successfully",
        stats: {
            totalEntries,
            categoryCount
        }
    });
});