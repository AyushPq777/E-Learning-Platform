import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completedLectures: [{
        lecture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course.curriculum.lectures'
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        progress: {
            type: Number, // percentage watched (0-100)
            default: 0
        },
        lastPosition: {
            type: Number, // last watched position in seconds
            default: 0
        }
    }],
    paymentId: {
        type: String, // Stripe Payment Intent ID
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    certificateGenerated: {
        type: Boolean,
        default: false
    },
    certificateId: {
        type: String // Unique ID for certificate
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    refundRequested: {
        type: Boolean,
        default: false
    },
    refundStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
        default: 'none'
    },
    refundReason: {
        type: String
    }
}, {
    timestamps: true
});

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update completion percentage before save
enrollmentSchema.pre('save', function (next) {
    if (this.course && this.completedLectures) {
        // This will be calculated in the controller based on total lectures
        // For now, we'll set a basic calculation
        const completedCount = this.completedLectures.length;
        // Total lectures count will be populated or fetched separately
        this.completionPercentage = Math.min(100, Math.round((completedCount / (this.course.totalLectures || 1)) * 100));
    }
    next();
});

// Update last accessed timestamp
enrollmentSchema.methods.updateLastAccessed = function () {
    this.lastAccessed = new Date();
    return this.save();
};

// Mark lecture as completed
enrollmentSchema.methods.markLectureCompleted = function (lectureId) {
    const alreadyCompleted = this.completedLectures.some(item =>
        item.lecture.toString() === lectureId.toString()
    );

    if (!alreadyCompleted) {
        this.completedLectures.push({
            lecture: lectureId,
            completedAt: new Date(),
            progress: 100
        });
    }

    return this.save();
};

// Update lecture progress
enrollmentSchema.methods.updateLectureProgress = function (lectureId, progress, position) {
    const lectureIndex = this.completedLectures.findIndex(item =>
        item.lecture.toString() === lectureId.toString()
    );

    if (lectureIndex !== -1) {
        this.completedLectures[lectureIndex].progress = Math.min(100, progress);
        this.completedLectures[lectureIndex].lastPosition = position;
        this.completedLectures[lectureIndex].completedAt = progress === 100 ? new Date() : this.completedLectures[lectureIndex].completedAt;
    } else {
        this.completedLectures.push({
            lecture: lectureId,
            progress: Math.min(100, progress),
            lastPosition: position,
            completedAt: progress === 100 ? new Date() : null
        });
    }

    return this.save();
};

export default mongoose.model('Enrollment', enrollmentSchema);