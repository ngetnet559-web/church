import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { ALL_ROLES } from '../constants/roles.js';

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  return user.toSafeObject();
};

export const createUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Name, email, password, and role are required');
  }

  if (!ALL_ROLES.includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Email already exists');
  }

  const user = await User.create({ name, email, password, role });
  return user.toSafeObject();
};

export const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map((user) => user.toSafeObject());
};

export const updateUser = async (userId, updates, currentUser) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user._id.toString() === currentUser._id.toString() && updates.isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  const allowedFields = ['name', 'email', 'role', 'isActive'];
  const sanitized = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  if (sanitized.role && !ALL_ROLES.includes(sanitized.role)) {
    throw new ApiError(400, 'Invalid role');
  }

  if (sanitized.password) {
    throw new ApiError(400, 'Use a dedicated password reset flow to change passwords');
  }

  Object.assign(user, sanitized);
  await user.save();

  return user.toSafeObject();
};

export const deactivateUser = async (userId, currentUser) => {
  if (userId === currentUser._id.toString()) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = false;
  await user.save();

  return user.toSafeObject();
};
