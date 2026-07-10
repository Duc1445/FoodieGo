import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registered successfully', data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
