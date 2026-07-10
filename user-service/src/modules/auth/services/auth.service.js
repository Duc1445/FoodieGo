import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, createUser, updateUser } from '../../user/repositories/user.repository.js';
import { generateToken } from '../../../config/jwt.js';

export const register = async ({ email, password, full_name, phone, address, role }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password: hashed, full_name, phone, address, role });

  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken({ id: user.id, role: user.role });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

export const getProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const updateProfile = async (userId, data) => {
  const user = await updateUser(userId, data);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};
