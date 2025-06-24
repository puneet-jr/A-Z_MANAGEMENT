import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import AdvancedAnalyticsServices from '../services/analyticsServices.js';

// Analyse task patterns
export const analyseTasks = asyncHandler(async (req, res) => {  // Fixed: changed from 'analyseTask' to 'analyseTasks'
    const { tasks } = req.body;
    const { userId } = req.params;

    if (!tasks && !userId) {
        return res.status(400).json({ message: "No tasks or user ID provided" });
    }

    let tasksToAnalyse = tasks;

    if (userId) {
        const userTasks = await Task.find({ user: userId });
        if (!userTasks.length) {
            return res.status(404).json({ message: "No tasks found for this user" });
        }
        tasksToAnalyse = userTasks;
    }
    
    const analysis = AdvancedAnalyticsServices.analyseTaskPatterns(tasksToAnalyse);

    res.json({ 
        message: "Task patterns analysed successfully", 
        ...analysis 
    });
});

// Analyse day by day productivity
export const analyseProductivityByDay = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { user: userId, status: "completed" };

    if (startDate || endDate) {
        query.updatedAt = {};  // Fixed: changed from 'completedAt' to 'updatedAt' (existing field)
        if (startDate) {
            query.updatedAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.updatedAt.$lte = new Date(endDate);
        }
    }

    const tasks = await Task.find(query);

    if (!tasks.length) {
        return res.status(404).json({ message: "No completed tasks found" });
    }

    const productivityAnalysis = AdvancedAnalyticsServices.analyseProductivityByDay(tasks);  // Fixed: method name

    res.status(200).json({
        message: "Productivity analysis completed",
        ...productivityAnalysis,
        dateRange: {
            start: startDate || 'all time',
            end: endDate || 'all time'
        }
    });
});

// Analyse Task completed times
export const analyseTaskCompletionTimes = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const tasks = await Task.find({
        user: userId,
        estimatedTime: { $exists: true }, 
        actualTime: { $exists: true }
    });

    if (!tasks.length) {
        return res.status(404).json({ message: "No tasks with time estimates found" });
    }

    const timeAnalysis = AdvancedAnalyticsServices.analyseTaskCompletionTime(tasks);
    
    res.status(200).json({
        message: "Task completion time analysis",
        ...timeAnalysis
    });
});

// Full analysis for a user
export const getFullAnalysis = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
        return res.status(404).json({ message: "User not found" });
    }

    const tasks = await Task.find({ user: userId });

    if (!tasks.length) {
        return res.status(404).json({ message: "No tasks found for analysis" });
    }

    const patterns = AdvancedAnalyticsServices.analyseTaskPatterns(tasks);
    const productivity = AdvancedAnalyticsServices.analyseProductivityByDay(  // Fixed: method name
        tasks.filter(task => task.status === 'completed')
    );
    const completionTimes = AdvancedAnalyticsServices.analyseTaskCompletionTime(
        tasks.filter(task => task.estimatedTime && task.actualTime)
    );

    res.status(200).json({
        message: "Full analysis report generated",
        user: userId,
        stats: {
            patterns,
            productivity,
            completionTimes
        },
        totalTasks: tasks.length
    });
});