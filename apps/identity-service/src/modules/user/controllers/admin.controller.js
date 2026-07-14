import * as userRepository from '../repositories/user.repository.js';

export const getPendingUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const users = await userRepository.getPendingUsers(role);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const users = await userRepository.getAllUsers({
      role,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const deleted = await userRepository.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete user because related orders or records exist.',
      });
    }
    next(err);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.id;

    const user = await userRepository.updateUserStatus(userId, 'APPROVED', null, adminId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User approved successfully', data: user });
  } catch (err) {
    next(err);
  }
};

export const rejectUser = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const user = await userRepository.updateUserStatus(userId, 'REJECTED', reason.trim(), adminId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User rejected', data: user });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await userRepository.getUserStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
