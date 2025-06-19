import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import Note from '../models/notesModel.js';
import UrgentEvent from '../models/eventModel.js';
import HealthData from '../models/healthModel.js';
import User from '../models/userModel.js';

// @desc    Get complete dashboard data for a user
// @route   GET /api/dashboard/user/:userId
// @access  Public
export const getUserDashboard = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { timeframe } = req.query; // 'week', 'month', 'year', 'all'

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Calculate date range based on timeframe
    let dateFilter = {};
    const now = new Date();
    
    switch(timeframe) {
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: weekAgo } };
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = { createdAt: { $gte: monthAgo } };
            break;
        case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            dateFilter = { createdAt: { $gte: yearAgo } };
            break;
        default:
            dateFilter = {}; // All time
    }

    // TASK STATISTICS
    const taskQuery = { user: userId, ...dateFilter };
    
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    
    // Calculate completion percentage
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task status distribution
    const taskStatusData = [
        { status: 'completed', count: completedTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
        { status: 'pending', count: pendingTasks, percentage: totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0 },
        { status: 'in-progress', count: inProgressTasks, percentage: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0 }
    ];

    // OTHER STATISTICS
    const totalNotes = await Note.countDocuments({ user: userId, ...dateFilter });
    const totalUrgentEvents = await UrgentEvent.countDocuments({ user: userId, ...dateFilter });
    const totalHealthEntries = await HealthData.countDocuments({ user: userId, ...dateFilter });

    // RECENT ACTIVITY (Last 5 items)
    const recentTasks = await Task.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status updatedAt');

    const recentNotes = await Note.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('title updatedAt');

    // UPCOMING EVENTS
    const upcomingEvents = await UrgentEvent.find({
        user: userId,
        eventDate: { $gte: now },
        status: { $ne: 'completed' }
    })
    .sort({ eventDate: 1 })
    .limit(5)
    .select('title eventDate eventTime priority');

    res.status(200).json({
        message: "Dashboard data retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        timeframe: timeframe || 'all',
        taskStats: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completionPercentage,
            statusDistribution: taskStatusData
        },
        overallStats: {
            totalNotes,
            totalUrgentEvents,
            totalHealthEntries
        },
        recentActivity: {
            tasks: recentTasks,
            notes: recentNotes
        },
        upcomingEvents
    });
});

// @desc    Get task completion statistics only
// @route   GET /api/dashboard/tasks/:userId
// @access  Public
export const getTaskCompletionStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { timeframe } = req.query;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Date filter logic (same as above)
    let dateFilter = {};
    const now = new Date();
    
    switch(timeframe) {
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: weekAgo } };
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = { createdAt: { $gte: monthAgo } };
            break;
        case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            dateFilter = { createdAt: { $gte: yearAgo } };
            break;
        default:
            dateFilter = {};
    }

    const taskQuery = { user: userId, ...dateFilter };
    
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
    const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

    res.status(200).json({
        message: "Task completion statistics retrieved successfully",
        timeframe: timeframe || 'all',
        stats: {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            completionPercentage,
            pendingPercentage,
            inProgressPercentage
        },
        chartData: {
            labels: ['Completed', 'Pending', 'In Progress'],
            data: [completedTasks, pendingTasks, inProgressTasks],
            percentages: [completionPercentage, pendingPercentage, inProgressPercentage]
        }
    });
});

// @desc    Get monthly task completion trend
// @route   GET /api/dashboard/trends/:userId
// @access  Public
export const getTaskCompletionTrends = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { months = 6 } = req.query; // Default to 6 months

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const monthsBack = parseInt(months);
    const trends = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const totalTasks = await Task.countDocuments({
            user: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const completedTasks = await Task.countDocuments({
            user: userId,
            status: 'completed',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        trends.push({
            month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            monthKey: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
            totalTasks,
            completedTasks,
            completionRate
        });
    }

    res.status(200).json({
        message: "Task completion trends retrieved successfully",
        trends
    });
});