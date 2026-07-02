import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';
import { connectDB, disconnectDB, isDbConnected } from '../config/db.js';

dotenv.config();

const seedSuperAdmin = async () => {
  if (!isDbConnected) {
    throw new Error('MongoDB is not connected. Start MongoDB and run seed again.');
  }

  const name = process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin';
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@sundayschool.com';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: ROLES.SUPER_ADMIN,
  });

  console.log(`Super admin created: ${email}`);
  console.log('Change the default password after first login.');
};

const run = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
