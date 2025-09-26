const mongoose=require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,
    
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
     phoneNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    passwordChangedAt: String,
    passwordResetToken: String,
    passwordResetExpires: String,
    emailVerificationToken: String,
    emailVerificationExpires: String,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: String
}, {
    timestamps: true 
});

module.exports=mongoose.model("user",userSchema)