import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['vitals', 'medication', 'appointment', 'symptom', 'exercise', 'diet', 'mental-health', 'lab-results', 'other'],
        required: true
    },
    data: {
        // For vitals (blood pressure, heart rate, etc.)
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        heartRate: Number,
        weight: Number,
        height: Number,
        temperature: Number,
        
        medicationName: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        
        doctorName: String,
        hospitalClinic: String,
        appointmentDate: Date,
        appointmentTime: String,
        purpose: String,
        
        symptomDescription: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        
        // For exercise
        exerciseType: String,
        duration: Number, // in minutes
        intensity: String,
        
        // For diet
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack']
        },
        calories: Number,
        description: String
    },
    notes: {
        type: String
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String
    }],
    dateRecorded: {
        type: Date,
        default: Date.now
    },
    isPrivate: {
        type: Boolean,
        default: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true 
});


healthDataSchema.index({ user: 1, category: 1, dateRecorded: -1 });

const HealthData = mongoose.model('HealthData', healthDataSchema);
export default HealthData;