const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const filesToUpdate = [
  'frontend/admin.js',
  'frontend/api.js',
  'frontend/main.js',
  'frontend/style.css',
  'gateway/src/index.js',
  'infrastructure/postgres/init.sql',
  'order-service/src/modules/cart/repositories/cart.repository.js',
  'order-service/src/modules/checkout/repositories/checkout.repository.js',
  'scripts/k6-load-test.js',
  'scripts/load-test.js'
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(root, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/foods/g, 'menus');
    content = content.replace(/food/g, 'menu');
    content = content.replace(/Foods/g, 'Menus');
    content = content.replace(/Food/g, 'Menu');
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}
console.log("Cross-service renaming complete.");
