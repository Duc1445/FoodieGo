const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.js')) {
      callback(dirPath);
    }
  });
}

const targetDir = path.join(__dirname, 'order-service', 'src');

walkDir(targetDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Replace foods table queries and references
  newContent = newContent.replace(/\bfood_id\b/g, 'menu_id');
  newContent = newContent.replace(/\bfoodId\b/g, 'menuId');
  newContent = newContent.replace(/\bfoods\b/g, 'menus');
  newContent = newContent.replace(/\bfood_name\b/g, 'menu_name');
  newContent = newContent.replace(/\bfood_price\b/g, 'menu_price');
  newContent = newContent.replace(/\bfood_image_url\b/g, 'menu_image_url');
  
  // Test specific things (if any strings explicitly used 'food-1' we might want 'menu-1' but we can just leave values as is or change 'food-' to 'menu-')
  newContent = newContent.replace(/'food-1'/g, "'menu-1'");
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});

console.log('Done!');
