import mongoose from 'mongoose';

const urgentEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['critical', 'high', 'medium'],
        default: 'high'
    },
    status: {
        type: String,
        enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    reminderSet: {
        type: Boolean,
        default: false
    },
    reminderTime: {
        type: Date
    },
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true 
});

// Index for better performance
urgentEventSchema.index({ user: 1, eventDate: 1 });
urgentEventSchema.index({ user: 1, priority: 1 });

const UrgentEvent = mongoose.model('UrgentEvent', urgentEventSchema);
export default UrgentEvent;