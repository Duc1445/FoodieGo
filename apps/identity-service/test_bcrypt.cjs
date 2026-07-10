const bcrypt = require('bcryptjs');
const hash = '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a';
console.log('Admin@123', bcrypt.compareSync('Admin@123', hash));
console.log('admin123', bcrypt.compareSync('admin123', hash));
console.log('admin', bcrypt.compareSync('admin', hash));
console.log('admin@123', bcrypt.compareSync('admin@123', hash));
