const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'provider'],
      default: 'client',
    },
    avatar: { type: String, default: null },
    bio:    { type: String, maxlength: 300, default: '' },
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      address:     { type: String, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);