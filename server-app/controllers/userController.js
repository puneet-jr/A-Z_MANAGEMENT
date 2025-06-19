import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";

export const addUser = asyncHandler(async (req, res) => {
    const {username, password, email} = req.body;
    
    if (!username || !password || !email) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });

    if (existingUser) {
        res.status(400);
        throw new Error("User with this email or username already exists");
    }

    // Create user in database
    const user = await User.create({
        username,
        password,
        email
    });

    res.status(201).json({ 
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
});

export const checkUser = asyncHandler(async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        res.status(400);
        throw new Error("Username is required");
    }

    const user = await User.findOne({ username });
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({ 
        message: "User exists",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclude password from response
    
    res.status(200).json({
        message: "Users retrieved successfully",
        count: users.length,
        users
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({
        message: "User retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
});

export const getUserWithTasks = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const tasks = await Task.find({ user: userId });
    
    res.status(200).json({
        message: "User with tasks retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        tasksCount: tasks.length,
        tasks
    });
});

export const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Check if new username or email already exists (exclude current user)
    if (username || email) {
        const existingUser = await User.findOne({
            _id: { $ne: userId },
            $or: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
            ]
        });

        if (existingUser) {
            res.status(400);
            throw new Error("Username or email already exists");
        }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;

    const updatedUser = await user.save();
    
    res.status(200).json({
        message: "User updated successfully",
        user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email
        }
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }

    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Get count of tasks to be deleted
    const taskCount = await Task.countDocuments({ user: userId });

    // Delete all tasks associated with this user
    await Task.deleteMany({ user: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ 
        message: "User and associated tasks deleted successfully",
        deletedTasksCount: taskCount
    });
});

export const getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Get task statistics
    const totalTasks = await Task.countDocuments({ user: userId });
    const pendingTasks = await Task.countDocuments({ user: userId, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ user: userId, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
    
   

    res.status(200).json({
        message: "User statistics retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        stats: {
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks   
        }
    });
});