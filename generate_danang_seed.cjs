const fs = require('fs');

const DISTRICT_1_LAT = 16.0544; // Da Nang - Hai Chau
const DISTRICT_1_LNG = 108.2022;

const restaurantsData = [
  { name: 'Mi Quang Ba Mua', type: 'Vietnamese', rating: 4.8, fee: 15000 },
  { name: 'Banh Xeo Ba Duong', type: 'Vietnamese', rating: 4.9, fee: 10000 },
  { name: 'Bun Cha Ca 109', type: 'Vietnamese', rating: 4.9, fee: 12000 },
  { name: 'Hai San Nam Danh', type: 'Seafood', rating: 4.7, fee: 25000 },
  { name: 'Pizza 4P\'s Indochina', type: 'Italian', rating: 4.8, fee: 30000 },
  { name: 'Burger Bros', type: 'Western', rating: 4.5, fee: 20000 },
  { name: 'Com Ga A Hai', type: 'Vietnamese', rating: 4.6, fee: 15000 },
  { name: 'Quan Be Man', type: 'Seafood', rating: 4.8, fee: 35000 },
  { name: 'Che Lien', type: 'Dessert', rating: 4.7, fee: 10000 },
  { name: 'Bun Bo Hue Ba Thuong', type: 'Vietnamese', rating: 4.5, fee: 15000 },
  { name: 'My Hanh Seafood', type: 'Seafood', rating: 4.6, fee: 40000 },
  { name: 'Fatfish Restaurant', type: 'Fusion', rating: 4.7, fee: 30000 },
];

const foodNames = [
  ['Mi Quang Ga', 'Mi Quang Ech', 'Mi Quang Tom Thit', 'Mi Quang Dac Biet', 'Banh Trang Nuong', 'Sua Bap', 'Tra Da', 'Tra Tac', 'Ram Cuon', 'Banh Beo'],
  ['Banh Xeo Dac Biet', 'Nem Lui', 'Thit Nuong', 'Bun Thit Nuong', 'Tra Da', 'Nuoc Mia', 'Banh Khoai', 'Banh Cuon', 'Sua Dau Nanh', 'Goi Cuon'],
  ['Bun Cha Ca Dac Biet', 'Bun Rieu Cua', 'Bun Cha Ca Nho', 'Cha Ca Them', 'Sua Bap', 'Sua Hat Sen', 'Sua Dau Xanh', 'Nuoc Ep Cam', 'Tra Chanh', 'Tra Dao'],
  ['Muc Hap Hanh', 'Tom Hum Nuong', 'Ngao Hap Thai', 'Chip Chip Hap', 'Oc Huong Rang Muoi', 'Cua Rang Me', 'Ca Mu Hap Xi Dau', 'Lau Hai San', 'Salad Rong Bien', 'Soju'],
];

function makeId(prefix, index) {
  const p = String(prefix).padStart(4, '0');
  const i = String(index).padStart(12, '0');
  return "00000000-0000-4000-" + p + "-" + i;
}

let sql = "-- Seed Data for Da Nang Restaurants\n\n";

const restaurantIds = [];
restaurantsData.forEach((r, idx) => {
  const id = makeId('9999', idx + 1);
  restaurantIds.push(id);
  const lat = (DISTRICT_1_LAT + (Math.random() - 0.5) * 0.03).toFixed(6);
  const lng = (DISTRICT_1_LNG + (Math.random() - 0.5) * 0.03).toFixed(6);
  const logo = "https://picsum.photos/seed/" + id + "/200/200";
  const cover = "https://picsum.photos/seed/cover-" + id + "/800/400";
  
  const escapedName = r.name.replace(/'/g, "''");
  sql += "INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)\n";
  sql += "VALUES ('" + id + "', '" + escapedName + "', 'Best " + r.type + " food in Da Nang.', '" + cover + "', '" + logo + "', " + r.rating + ", " + Math.floor(Math.random() * 500 + 50) + ", " + r.fee + ", 50000, '08:00', '22:00', 'open', " + lat + ", " + lng + ", true)\n";
  sql += "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;\n\n";
});

sql += "\n-- CATEGORIES\n";
const categoryIds = [];
restaurantIds.forEach((rid, idx) => {
  const catId1 = makeId('8888', (idx * 2) + 1);
  const catId2 = makeId('8888', (idx * 2) + 2);
  categoryIds.push([catId1, catId2]);
  
  sql += "INSERT INTO categories (id, restaurant_id, name, display_order) VALUES \n";
  sql += "('" + catId1 + "', '" + rid + "', 'Main Course', 1),\n";
  sql += "('" + catId2 + "', '" + rid + "', 'Drinks & Extras', 2)\n";
  sql += "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n\n";
});

sql += "\n-- MENU ITEMS\n";
let foodCounter = 1;
restaurantIds.forEach((rid, rIdx) => {
  const cats = categoryIds[rIdx];
  const foods = foodNames[rIdx % 4];
  
  for (let i = 0; i < 10; i++) {
    const fId = makeId('7777', foodCounter++);
    const catId = i < 6 ? cats[0] : cats[1];
    const price = Math.floor(Math.random() * 100 + 30) * 1000;
    const img = "https://picsum.photos/seed/" + fId + "/300/300";
    const escapedName = foods[i].replace(/'/g, "''");
    
    sql += "INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)\n";
    sql += "VALUES ('" + fId + "', '" + rid + "', '" + catId + "', '" + escapedName + "', 'Delicious " + escapedName + " prepared fresh.', " + price + ", '" + img + "', true, 15, " + (i + 1) + ")\n";
    sql += "ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;\n\n";
  }
});

sql += "\n-- MERCHANT ACCOUNTS\n";
// Add merchant users. Password is 'Admin@123'
const defaultPasswordHash = '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a';
restaurantsData.forEach((r, idx) => {
  const safeName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = `merchant_${safeName}@foodiego.com`;
  const escapedName = r.name.replace(/'/g, "''");
  sql += `INSERT INTO users (email, password, full_name, role) VALUES ('${email}', '${defaultPasswordHash}', '${escapedName} Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;\n`;
});

fs.writeFileSync('infrastructure/postgres/danang_seed.sql', sql);
console.log('Seed SQL generated at infrastructure/postgres/danang_seed.sql');
