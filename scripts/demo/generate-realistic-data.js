import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const V1_DIR = path.join(__dirname, 'data', 'v1');

if (!fs.existsSync(V1_DIR)) {
  fs.mkdirSync(V1_DIR, { recursive: true });
}

function writeJson(filename, data) {
  fs.writeFileSync(path.join(V1_DIR, filename), JSON.stringify(data, null, 2));
}

// Deterministic UUID generator based on prefix and index
function generateId(prefix, index) {
  const paddedIndex = String(index).padStart(12, '0');
  return `00000000-0000-4000-${prefix}-${paddedIndex}`;
}

const numCustomers = 10;
const numMerchants = 6;
const numDrivers = 3;
const numOrders = 100;

// All users have password '123456'
const HASHED_PASSWORD = '$2a$10$rZmZ5abiDRSK/2Ol6jNg0ecfY9ehk.FWkvCSglmnAivxWCFLE3DHq';

const users = [];

// 1. Admin
users.push({
  id: generateId('0000', 1),
  email: 'admin@foodiego.com',
  password: HASHED_PASSWORD,
  full_name: 'FoodieGo Admin',
  role: 'admin',
  approval_status: 'APPROVED',
  is_active: true,
});

// 2. Customers
for (let i = 1; i <= numCustomers; i++) {
  users.push({
    id: generateId('1111', i),
    email: `customer${i}@foodiego.com`,
    password: HASHED_PASSWORD,
    full_name: `Customer ${i}`,
    role: 'customer',
    approval_status: 'APPROVED',
    is_active: true,
    phone: `09000000${String(i).padStart(2, '0')}`,
  });
}

// 3. Merchants
for (let i = 1; i <= numMerchants; i++) {
  users.push({
    id: generateId('2222', i),
    email: `merchant${i}@foodiego.com`,
    password: HASHED_PASSWORD,
    full_name: `Merchant ${i}`,
    role: 'merchant',
    approval_status: 'APPROVED',
    is_active: true,
    phone: `09100000${String(i).padStart(2, '0')}`,
  });
}

// 4. Drivers
const driverNames = ['Nguyễn Văn An', 'Trần Minh Khoa', 'Lê Quốc Huy'];
for (let i = 1; i <= numDrivers; i++) {
  users.push({
    id: generateId('3333', i),
    email: `driver${i}@foodiego.com`,
    password: HASHED_PASSWORD,
    full_name: driverNames[i - 1],
    role: 'driver',
    approval_status: 'APPROVED',
    is_active: true,
    phone: `09200000${String(i).padStart(2, '0')}`,
  });
}
writeJson('users.json', users);

// Addresses (required by identity-service / user_addresses)
const addresses = [];
for (let i = 1; i <= numCustomers; i++) {
  addresses.push({
    id: generateId('111a', i),
    user_id: generateId('1111', i),
    address: `12${i} Bạch Đằng, Hải Châu, Đà Nẵng`,
    phone: `09000000${String(i).padStart(2, '0')}`,
    is_default: true,
  });
}
writeJson('addresses.json', addresses);

// 5. Restaurants (Exactly 6 in Da Nang mapped to 6 merchants)
const restaurants = [
  {
    id: generateId('4444', 1),
    name: 'Cơm Gà Nhà Mộc',
    description: 'Cơm thố, cơm gà xối mỡ chuẩn vị gia đình.',
    latitude: 16.068803,
    longitude: 108.217166,
    address: '123 Lê Lợi, Hải Châu',
    district: 'Hải Châu',
    city: 'Da Nang',
  },
  {
    id: generateId('4444', 2),
    name: 'Mì Quảng Bếp Trang',
    description: 'Đặc sản Mì Quảng ếch trứ danh.',
    latitude: 16.0371,
    longitude: 108.2435,
    address: '12 Ngũ Hành Sơn, Ngũ Hành Sơn',
    district: 'Ngũ Hành Sơn',
    city: 'Da Nang',
  },
  {
    id: generateId('4444', 3),
    name: 'Hải Sản Biển Đông',
    description: 'Hải sản tươi sống bình dân.',
    latitude: 16.0718,
    longitude: 108.2393,
    address: '99 Võ Nguyên Giáp, Sơn Trà',
    district: 'Sơn Trà',
    city: 'Da Nang',
  },
  {
    id: generateId('4444', 4),
    name: 'Bún Bò Bà Diệu',
    description: 'Bún bò Huế đậm đà truyền thống.',
    latitude: 16.0611,
    longitude: 108.1824,
    address: '45 Điện Biên Phủ, Thanh Khê',
    district: 'Thanh Khê',
    city: 'Da Nang',
  },
  {
    id: generateId('4444', 5),
    name: 'Bê Thui Cầu Mống',
    description: 'Bê thui chính gốc 100%.',
    latitude: 16.0125,
    longitude: 108.2045,
    address: '456 Ông Ích Đường, Cẩm Lệ',
    district: 'Cẩm Lệ',
    city: 'Da Nang',
  },
  {
    id: generateId('4444', 6),
    name: 'Bánh Xèo Tôm Nhảy',
    description: 'Bánh xèo giòn rụm tôm đất.',
    latitude: 16.0825,
    longitude: 108.1508,
    address: '78 Tôn Đức Thắng, Liên Chiểu',
    district: 'Liên Chiểu',
    city: 'Da Nang',
  },
];

const mappedRestaurants = restaurants.map((r, i) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  cover_image: `https://picsum.photos/seed/restaurant${i}/800/400`,
  logo: `https://picsum.photos/seed/logo${i}/200/200`,
  rating: (4.0 + (i % 10) / 10).toFixed(1),
  total_reviews: 100 + i * 10,
  delivery_fee: 15000,
  minimum_order: 30000,
  opening_time: '06:00',
  closing_time: '23:00',
  status: 'APPROVED',
  latitude: r.latitude,
  longitude: r.longitude,
  address: r.address,
  district: r.district,
  city: r.city,
  owner_id: generateId('2222', i + 1), // Merchant mapped
  is_active: true,
}));
writeJson('restaurants.json', mappedRestaurants);

const userRestaurants = mappedRestaurants.map((r, i) => ({
  user_id: generateId('2222', i + 1), // Assign to merchant 1-6
  restaurant_id: r.id,
  role: 'owner',
}));
writeJson('user_restaurants.json', userRestaurants);

// 6. Categories (Global Master Data)
const categories = [
  {
    id: generateId('5555', 1),
    name: 'Đồ ăn',
    description: 'Các món ăn chính',
    display_order: 1,
    is_active: true,
  },
  {
    id: generateId('5555', 2),
    name: 'Đồ uống',
    description: 'Nước giải khát',
    display_order: 2,
    is_active: true,
  },
  {
    id: generateId('5555', 3),
    name: 'Combo',
    description: 'Combo tiết kiệm',
    display_order: 3,
    is_active: true,
  },
  {
    id: generateId('5555', 4),
    name: 'Ăn vặt',
    description: 'Đồ ăn nhẹ',
    display_order: 4,
    is_active: true,
  },
  {
    id: generateId('5555', 5),
    name: 'Món thêm',
    description: 'Các món gọi thêm',
    display_order: 5,
    is_active: true,
  },
];
writeJson('categories.json', categories);

const CAT_DO_AN = categories[0].id;
const CAT_DO_UONG = categories[1].id;
const CAT_COMBO = categories[2].id;
const CAT_AN_VAT = categories[3].id;
const CAT_MON_THEM = categories[4].id;

const menuItems = [];
const menuTemplates = {
  'Cơm Gà Nhà Mộc': [
    { name: 'Cơm Gà Xối Mỡ', desc: 'Gà chiên giòn rụm', price: 45000, cat: CAT_DO_AN },
    { name: 'Cơm Gà Xé', desc: 'Cơm gà xé phay', price: 40000, cat: CAT_DO_AN },
    { name: 'Cơm Gà Quay', desc: 'Cơm gà quay tiêu', price: 50000, cat: CAT_DO_AN },
    { name: 'Gỏi Gà', desc: 'Gỏi gà hành tây', price: 35000, cat: CAT_AN_VAT },
    { name: 'Canh Gà', desc: 'Canh gà lá giang', price: 15000, cat: CAT_MON_THEM },
    { name: 'Nước Lọc', desc: 'Nước suối tinh khiết', price: 10000, cat: CAT_DO_UONG },
  ],
  'Bún Bò Bà Diệu': [
    { name: 'Bún Bò Đặc Biệt', desc: 'Đầy đủ bắp bò, gân, sụn', price: 60000, cat: CAT_DO_AN },
    { name: 'Bún Bò Tái Nạm', desc: 'Thịt bò tái mềm', price: 45000, cat: CAT_DO_AN },
    { name: 'Bún Bò Gân', desc: 'Bún bò gân', price: 50000, cat: CAT_DO_AN },
    { name: 'Bánh Mì', desc: 'Bánh mì giòn rụm', price: 5000, cat: CAT_MON_THEM },
    { name: 'Sting Vàng', desc: 'Nước tăng lực', price: 15000, cat: CAT_DO_UONG }, // Replaced Chả cua thêm
    { name: 'Nước Lọc', desc: 'Nước suối tinh khiết', price: 10000, cat: CAT_DO_UONG },
  ],
  'Hải Sản Biển Đông': [
    { name: 'Mực Hấp Hành Gừng', desc: 'Mực tươi roi rói', price: 120000, cat: CAT_DO_AN },
    { name: 'Tôm Sú Nướng Mọi', desc: 'Tôm sú nướng', price: 150000, cat: CAT_DO_AN },
    { name: 'Ốc Hương Xào Bơ Tỏi', desc: 'Ốc hương size lớn', price: 95000, cat: CAT_DO_AN },
    { name: 'Nghêu Hấp Sả', desc: 'Nghêu hấp sả ớt', price: 65000, cat: CAT_DO_AN },
    { name: 'Bia Heineken', desc: 'Bia ướp lạnh', price: 20000, cat: CAT_DO_UONG },
  ],
  'Mì Quảng Bếp Trang': [
    { name: 'Mì Quảng Ếch', desc: 'Đặc sản ếch om', price: 55000, cat: CAT_DO_AN },
    { name: 'Mì Quảng Gà', desc: 'Gà quê dai ngon', price: 40000, cat: CAT_DO_AN },
    { name: 'Mì Quảng Tôm Thịt', desc: 'Tôm đất và thịt', price: 40000, cat: CAT_DO_AN },
    { name: 'Ram', desc: 'Chả ram giòn', price: 15000, cat: CAT_AN_VAT },
    { name: 'Bánh Tráng Mè', desc: 'Bánh tráng mè giòn rụm', price: 10000, cat: CAT_MON_THEM },
    { name: 'Nước Lọc', desc: 'Nước suối tinh khiết', price: 10000, cat: CAT_DO_UONG },
  ],
  'Bánh Xèo Tôm Nhảy': [
    { name: 'Bánh Xèo Tôm Đất', desc: 'Tôm đất xèo xèo', price: 30000, cat: CAT_DO_AN },
    { name: 'Bánh Xèo Bò', desc: 'Thịt bò xào giá', price: 35000, cat: CAT_DO_AN },
    { name: 'Bánh Xèo Mực', desc: 'Mực ống tươi', price: 40000, cat: CAT_DO_AN },
    { name: 'Nem Lụi', desc: 'Nem lụi nướng sả', price: 10000, cat: CAT_AN_VAT },
    { name: 'Sting Vàng', desc: 'Nước tăng lực', price: 15000, cat: CAT_DO_UONG },
  ],
  'Bê Thui Cầu Mống': [
    { name: 'Bê Thui (Lạng)', desc: 'Bê thui 100g', price: 60000, cat: CAT_DO_AN },
    { name: 'Bún Mắm Bê Thui', desc: 'Bún mắm nêm', price: 45000, cat: CAT_DO_AN },
    { name: 'Lẩu Bê Thui', desc: 'Lẩu sườn bê nấu măng', price: 150000, cat: CAT_DO_AN },
    {
      name: 'Bánh Tráng Đại Lộc',
      desc: 'Bánh tráng cuốn thịt bê',
      price: 15000,
      cat: CAT_MON_THEM,
    },
    { name: 'Bia Heineken', desc: 'Bia ướp lạnh', price: 20000, cat: CAT_DO_UONG },
  ],
};

mappedRestaurants.forEach((r, idx) => {
  const items = menuTemplates[r.name] || menuTemplates['Cơm Gà Nhà Mộc'];
  items.forEach((item, j) => {
    menuItems.push({
      id: generateId('6666', idx * 10 + j + 1), // ensure unique
      restaurant_id: r.id,
      category_id: item.cat,
      name: item.name,
      description: item.desc,
      price: item.price,
      image: `https://picsum.photos/seed/food${idx}${j}/400/400`,
      is_available: true,
    });
  });
});
writeJson('menu_items.json', menuItems);

// 7. Promotions
const promotions = [];
promotions.push({
  id: generateId('7777', 1),
  code: 'WELCOME10',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_value: 50000,
  valid_from: new Date().toISOString(),
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true,
  promotion_type: 'platform',
  approval_status: 'APPROVED',
});
promotions.push({
  id: generateId('7777', 2),
  code: 'GIAM50K',
  discount_type: 'fixed',
  discount_value: 50000,
  min_order_value: 200000,
  valid_from: new Date().toISOString(),
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true,
  promotion_type: 'platform',
  approval_status: 'APPROVED',
});
promotions.push({
  id: generateId('7777', 3),
  code: 'COMGA15',
  discount_type: 'percentage',
  discount_value: 15,
  min_order_value: 80000,
  valid_from: new Date().toISOString(),
  valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true,
  promotion_type: 'merchant',
  restaurant_id: restaurants[0].id,
  approval_status: 'APPROVED',
});
writeJson('promotions.json', promotions);

// 8. Orders, Payments, Deliveries, Promo Usages
const orders = [];
const deliveries = [];
const payments = [];
const promoUsages = [];

const statuses = ['CREATED', 'PAID', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED'];

for (let i = 1; i <= numOrders; i++) {
  const customerIdx = ((i - 1) % numCustomers) + 1; // 1 to 10
  const restaurantIdx = ((i - 1) % 6) + 1; // 1 to 6

  // Distribute statuses logically
  // Orders 1-10 are CREATED
  // Orders 11-20 are PAID
  // Orders 21-30 are CONFIRMED
  // Orders 31-40 are PREPARING
  // Orders 41-50 are READY
  // Orders 51-60 are DELIVERING
  // Orders 61-100 are COMPLETED
  let status = 'COMPLETED';
  if (i <= 10) status = 'CREATED';
  else if (i <= 20) status = 'PAID';
  else if (i <= 30) status = 'CONFIRMED';
  else if (i <= 40) status = 'PREPARING';
  else if (i <= 50) status = 'READY';
  else if (i <= 60) status = 'DELIVERING';

  const orderId = generateId('7777', i);
  const restaurantId = generateId('4444', restaurantIdx);
  const totalAmount = 50000 + i * 1000;

  // Find a menu item for this restaurant to make it realistic
  const restMenuItems = menuItems.filter((m) => m.restaurant_id === restaurantId);
  const selectedItem = restMenuItems[i % restMenuItems.length];

  orders.push({
    id: orderId,
    user_id: generateId('1111', customerIdx),
    restaurant_id: restaurantId,
    merchant_id: generateId('2222', restaurantIdx),
    status: status,
    subtotal: selectedItem.price,
    total: selectedItem.price + 15000,
    delivery_fee: 15000,
    delivery_address: JSON.stringify({
      street: `12${customerIdx} Bạch Đằng`,
      city: 'Da Nang',
      lat: 16.0,
      lng: 108.2,
    }),
    items: [
      {
        id: generateId('8888', i),
        order_id: orderId,
        menu_item_id: selectedItem.id,
        quantity: 1,
        name: selectedItem.name,
        unit_price: selectedItem.price,
      },
    ],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    updated_at: new Date(Date.now() - i * 3600000).toISOString(),
  });

  // Apply promotion to every 10th order
  if (i % 10 === 0 && status !== 'CREATED') {
    promoUsages.push({
      id: generateId('9900', i),
      promotion_id: promotions[0].id,
      user_id: generateId('1111', customerIdx),
      order_id: orderId,
      discount_value: (selectedItem.price * 10) / 100,
      used_at: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }

  // Payment
  if (status !== 'CREATED') {
    payments.push({
      id: generateId('8888', i),
      order_id: orderId,
      amount: selectedItem.price + 15000,
      method: 'CASH',
      status: 'COMPLETED',
      idempotency_key: `pay_${i}_${Date.now()}`,
    });
  }

  // Delivery
  if (status === 'DELIVERING' || status === 'COMPLETED') {
    const driverIdx = ((i - 1) % numDrivers) + 1; // 1 to 3
    deliveries.push({
      id: generateId('9999', i),
      order_id: orderId,
      driver_id: generateId('3333', driverIdx),
      status: status === 'COMPLETED' ? 'delivered' : 'delivering',
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
}

writeJson('orders.json', orders);
writeJson('payments.json', payments);
writeJson('deliveries.json', deliveries);
writeJson('promotion_usages.json', promoUsages);

// 9. Support Tickets (Organically tied to real users)
const supportTickets = [];
supportTickets.push({
  id: generateId('5001', 1),
  ticket_number: 'TCK-0001',
  customer_id: generateId('1111', 1), // customer1
  issue_type: 'ORDER_ISSUE',
  description: 'Không nhận được món',
  priority: 'HIGH',
  status: 'OPEN',
  created_at: new Date().toISOString(),
});
supportTickets.push({
  id: generateId('5001', 2),
  ticket_number: 'TCK-0002',
  merchant_id: generateId('2222', 2), // merchant2
  issue_type: 'APP_ISSUE',
  description: 'Không cập nhật được menu',
  priority: 'MEDIUM',
  status: 'IN_PROGRESS',
  created_at: new Date().toISOString(),
});
supportTickets.push({
  id: generateId('5001', 3),
  ticket_number: 'TCK-0003',
  driver_id: generateId('3333', 1), // driver1
  issue_type: 'ACCOUNT_ISSUE',
  description: 'Không nhận được delivery',
  priority: 'HIGH',
  status: 'RESOLVED',
  created_at: new Date().toISOString(),
});
writeJson('support_tickets.json', supportTickets);

console.log('Successfully generated deterministic demo data.');
