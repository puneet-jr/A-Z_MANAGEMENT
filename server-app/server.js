import express from 'express';
import mongoose from 'mongoose';
import dbconnect from './config/dbConnection.js';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/notesRoutes.js';
import urgentEventRoutes from './routes/eventRoutes.js';
import healthDataRoutes from './routes/healthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'; 
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

dbconnect();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/urgent-events', urgentEventRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/dashboard', dashboardRoutes); // Add this

// Error handling middleware (should be last)
app.use(errorHandler);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API is running!',
        version: '1.0.0',
        features: ['Tasks', 'Users', 'Notes', 'Urgent Events', 'Health Data', 'Dashboard']
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});