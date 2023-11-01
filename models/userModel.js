import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import slugify from 'slugify';

const userSchema = new mongoose.Schema({
  //
  name: {
    type: String,
    required: [true, 'A user must have name'],
    unique: [true, 'this name already exist'],
    maxlength: [40, 'A user name must have less or equal then 40 characters'],
    minlength: [8, 'A user name must have more or equal then 8 characters'],
  },
  //
  email: {
    type: String,
    required: [true, 'A user must have email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  //
  photo: {
    type: String,
    default: 'default.jpg',
  },
  //
  //
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    message: 'Role is either:user, guide, lead-guide, admin',
    default: 'user',
  },
  //
  password: {
    type: String,
    required: [true, 'A user must have password'],
    minlength: 8,
    select: false,
  },
  //
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // THIS only works on Save adn CREATE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!!',
    },
  },
  //
  passwordChangedAt: Date,
  //
  passwordResetToken: String,
  //
  passwordResetExpires: Date,
  //
  active: {
    type: Boolean,
    default: true,
  },
  //
  slug: String,
});

//
//hash password
userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;

  //
  next();
});
//
//change passwordChangedAt when  reset password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});
//
//this points to the current query
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//
//compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//
//
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means not changed
  return false;
};
//
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString('hex');

  this.passwordResetToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 600000;

  return resetToken;
};
//

userSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
