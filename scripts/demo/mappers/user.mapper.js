export const UserMapper = {
  toDb: (json) => [
    json.id,
    json.email,
    json.password,
    json.full_name,
    json.role,
    json.approval_status || 'PENDING',
    json.driver_license || null,
    json.vehicle_type || null,
    json.vehicle_plate || null,
  ],
};
