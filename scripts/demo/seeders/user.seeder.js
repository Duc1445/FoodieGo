import { UserMapper } from '../mappers/user.mapper.js';

export async function seedUsers(pool, data) {
  console.log('[Demo] Seeding Users...');
  for (const user of data) {
    const values = UserMapper.toDb(user);
    await pool.query(
      `INSERT INTO users (id, email, password, full_name, role, approval_status, driver_license, vehicle_type, vehicle_plate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO UPDATE SET 
         password = EXCLUDED.password,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         approval_status = EXCLUDED.approval_status,
         driver_license = EXCLUDED.driver_license,
         vehicle_type = EXCLUDED.vehicle_type,
         vehicle_plate = EXCLUDED.vehicle_plate`,
      values
    );
  }
}
