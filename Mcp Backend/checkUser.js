import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

async function checkUser() {
  try {
    await connectDB();
    const user = await User.findOne({email: 'admin4@example.com'}).select('+password');
    console.log('Current user:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
      // Explicitly exclude sensitive fields
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUser();
