import * as userRepository from '../repositories/user.repository.js';

export const getPendingMerchants = async (req, res, next) => {
  try {
    const merchants = await userRepository.getPendingMerchants();
    res.json({ success: true, data: merchants });
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

export const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    const user = await userRepository.updateUserRole(userId, role);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User role updated successfully', data: user });
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
    next(err);
  }
};

export const approveMerchant = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const merchantId = req.params.id;
    
    const merchant = await userRepository.updateMerchantStatus(merchantId, 'APPROVED', null, adminId);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found or not in merchant role' });
    }
    
    res.json({ success: true, message: 'Merchant approved successfully', data: merchant });
  } catch (err) {
    next(err);
  }
};

export const rejectMerchant = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const merchantId = req.params.id;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    const merchant = await userRepository.updateMerchantStatus(merchantId, 'REJECTED', reason.trim(), adminId);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found or not in merchant role' });
    }
    
    res.json({ success: true, message: 'Merchant rejected', data: merchant });
  } catch (err) {
    next(err);
  }
};
