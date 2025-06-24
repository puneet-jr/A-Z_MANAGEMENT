import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    estimatedTime: {
        type: Number,
        default: null
    },
    actualTime: {
        type: Number,
        default: null
    },
    completedAt: {  // Added missing field
        type: Date,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Add middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});
const Task = mongoose.model('Task', taskSchema);
export default Task;