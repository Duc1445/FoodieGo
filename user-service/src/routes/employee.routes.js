import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { EmployeeModel } from '../models/employee.model.js';

const router = Router();

// GET all employees
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employees = await EmployeeModel.findAll();
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
});

// POST create employee
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employee = await EmployeeModel.create(req.body);
    res.status(201).json({ success: true, message: 'Employee created', data: employee });
  } catch (err) {
    next(err);
  }
});

// PUT update employee
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employee = await EmployeeModel.update(req.params.id, req.body);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee updated', data: employee });
  } catch (err) {
    next(err);
  }
});

// DELETE employee
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const deleted = await EmployeeModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
