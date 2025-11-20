import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Lecture title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    videoUrl: {
        type: String // Mux playback ID or video URL
    },
    muxAssetId: {
        type: String // Mux asset ID for management
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    videoSize: {
        type: Number // in bytes
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number, // Order in course
        required: true
    },
    resources: [{
        name: String,
        url: String,
        type: String // pdf, zip, etc.
    }]
}, { timestamps: true });

const curriculumSchema = new mongoose.Schema({
    sectionTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    lectures: [lectureSchema],
    position: {
        type: Number,
        required: true
    }
});

const courseSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    learningObjectives: [{
        type: String,
        maxlength: [150, 'Objective cannot be more than 150 characters']
    }],
    requirements: [{
        type: String,
        maxlength: [150, 'Requirement cannot be more than 150 characters']
    }],
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    subcategory: {
        type: String
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all'
    },
    language: {
        type: String,
        default: 'English'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        validate: {
            validator: function (value) {
                return value <= this.price;
            },
            message: 'Discount price cannot be higher than regular price'
        }
    },
    thumbnail: {
        type: String,
        required: [true, 'Please add a thumbnail']
    },
    promoVideo: {
        type: String // Mux asset ID for promo video
    },
    curriculum: [curriculumSchema],
    totalLectures: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number, // in seconds
        default: 0
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            maxlength: [1000, 'Review cannot be more than 1000 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalStudents: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'rejected'],
        default: 'draft'
    },
    rejectionReason: {
        type: String
    },
    tags: [String],
    welcomeMessage: {
        type: String,
        maxlength: [1000, 'Welcome message cannot be more than 1000 characters']
    },
    congratulationsMessage: {
        type: String,
        maxlength: [1000, 'Congratulations message cannot be more than 1000 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for average rating
courseSchema.virtual('averageRating').get(function () {
    if (this.ratings.length === 0) return 0;
    const total = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    return (total / this.ratings.length).toFixed(1);
});

// Virtual for total ratings count
courseSchema.virtual('ratingsCount').get(function () {
    return this.ratings.length;
});

// Virtual for current price (considering discount)
courseSchema.virtual('currentPrice').get(function () {
    return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Index for search functionality
courseSchema.index({
    title: 'text',
    description: 'text',
    'learningObjectives': 'text'
});

// Update total lectures and duration before save
courseSchema.pre('save', function (next) {
    this.totalLectures = this.curriculum.reduce((total, section) => {
        return total + section.lectures.length;
    }, 0);

    this.totalDuration = this.curriculum.reduce((total, section) => {
        return total + section.lectures.reduce((sectionTotal, lecture) => {
            return sectionTotal + (lecture.duration || 0);
        }, 0);
    }, 0);

    next();
});

export default mongoose.model('Course', courseSchema);