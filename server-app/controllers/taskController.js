import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

export const registerTask = asyncHandler(async (req, res) => {
    const { title, description, startDate, dueDate, userId } = req.body;

    if (!title || !description || !startDate || !dueDate || !userId) {
        res.status(400);
        throw new Error("Please include all required fields including userId");
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const task = await Task.create({
        title,
        description,
        startDate,
        dueDate,
        user: userId, 
    });

    
    await task.populate('user', 'username email');

    res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req, res) => {
    const { userId } = req.query; 

    let query = {};
    if (userId) {
        query.user = userId;
    }

    const tasks = await Task.find(query).populate('user', 'username email');
    res.status(200).json(tasks);
});

export const getTasksByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const tasks = await Task.find({ user: userId }).populate('user', 'username email');
    res.status(200).json({
        message: `Tasks for user ${user.username}`,
        count: tasks.length,
        tasks
    });
});

export const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    // Optional: Add user verification
    // if (task.user.toString() !== req.body.userId) {
    //     res.status(403);
    //     throw new Error("Not authorized to delete this task");
    // }

    await Task.findByIdAndDelete(req.params.id); // Fixed deprecated method
    res.status(200).json({ message: "Task deleted successfully" });
});

export const updateTask = asyncHandler(async (req, res) => {
    const { title, description, startDate, dueDate, status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    // Optional: Add user verification
    // if (task.user.toString() !== req.body.userId) {
    //     res.status(403);
    //     throw new Error("Not authorized to update this task");
    // }

    if (title) task.title = title;
    if (description) task.description = description;
    if (startDate) task.startDate = startDate;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;

    const updatedTask = await task.save();
    await updatedTask.populate('user', 'username email');
    
    res.status(200).json(updatedTask);
});