import pkg from 'pg';
import crypto from 'crypto';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: 'postgresql://foodiego:foodiego123@localhost:5432/foodiego'
});

const categories = [
  { id: crypto.randomUUID(), name: 'Phở & Bún', description: 'Các món nước truyền thống' },
  { id: crypto.randomUUID(), name: 'Cơm Tấm & Cơm Thêu', description: 'Cơm đặc sản Việt' },
  { id: crypto.randomUUID(), name: 'Đồ ăn vặt', description: 'Ăn nhẹ, lai rai' },
  { id: crypto.randomUUID(), name: 'Bánh mì truyền thống', description: 'Bánh mì giòn rụm' },
  { id: crypto.randomUUID(), name: 'Đồ uống', description: 'Nước ép, sinh tố, trà, cà phê' },
  { id: crypto.randomUUID(), name: 'Tráng miệng', description: 'Chè, bánh ngọt' }
];

const foods = [
  // Phở & Bún
  { name: 'Phở bò tái nạm', desc: 'Phở bò nước dùng ngọt thanh', price: 45000, img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Phở gà ta', desc: 'Phở gà thịt mềm, da giòn', price: 40000, img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bún chả Hà Nội', desc: 'Bún chả nướng than hoa thơm lừng', price: 50000, img: 'https://images.unsplash.com/photo-1615486171448-4fdcb61db232?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bún bò Huế', desc: 'Bún bò cay nồng đặc trưng Huế', price: 45000, img: 'https://images.unsplash.com/photo-1615486171448-4fdcb61db232?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bún riêu cua', desc: 'Bún riêu chua thanh, tóp mỡ giòn', price: 35000, img: 'https://images.unsplash.com/photo-1615486171448-4fdcb61db232?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bún thịt nướng', desc: 'Bún thịt nướng sả ướp đậm vị', price: 35000, img: 'https://images.unsplash.com/photo-1615486171448-4fdcb61db232?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bún đậu mắm tôm', desc: 'Bún đậu mắm tôm chuẩn vị', price: 55000, img: 'https://images.unsplash.com/photo-1615486171448-4fdcb61db232?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Hủ tiếu Nam Vang', desc: 'Hủ tiếu nước dùng đậm đà', price: 50000, img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Mì Quảng ếch', desc: 'Mì Quảng đặc sản miền Trung', price: 45000, img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },
  { name: 'Bánh canh trảng bàng', desc: 'Bánh canh dai ngon, thịt luộc', price: 40000, img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop', c_idx: 0 },

  // Cơm Tấm
  { name: 'Cơm tấm sườn nướng', desc: 'Cơm tấm sườn nướng mỡ hành', price: 40000, img: 'https://images.unsplash.com/photo-1633478062482-790e3b5dd810?q=80&w=1974&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm tấm sườn bì chả', desc: 'Cơm tấm full topping', price: 55000, img: 'https://images.unsplash.com/photo-1633478062482-790e3b5dd810?q=80&w=1974&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm chiên dưa bò', desc: 'Cơm chiên giòn, thịt bò xào dưa chua', price: 45000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm gà xối mỡ', desc: 'Cơm gà da giòn rụm', price: 40000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1913&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm niêu cá kho tộ', desc: 'Cơm niêu dẻo, cá lóc kho tộ đậm đà', price: 60000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm chiên dương châu', desc: 'Cơm chiên thập cẩm', price: 35000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm heo quay', desc: 'Cơm thịt heo quay bì giòn', price: 45000, img: 'https://images.unsplash.com/photo-1633478062482-790e3b5dd810?q=80&w=1974&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm sườn sụn chua ngọt', desc: 'Sườn sụn rim chua ngọt cực tốn cơm', price: 40000, img: 'https://images.unsplash.com/photo-1633478062482-790e3b5dd810?q=80&w=1974&auto=format&fit=crop', c_idx: 1 },
  { name: 'Cơm chiên hải sản', desc: 'Cơm chiên tôm, mực tươi', price: 50000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop', c_idx: 1 },

  // Đồ ăn vặt
  { name: 'Gỏi cuốn tôm thịt', desc: 'Gỏi cuốn chấm tương đen (3 cuốn)', price: 30000, img: 'https://images.unsplash.com/photo-1585489721665-27660237071d?q=80&w=1964&auto=format&fit=crop', c_idx: 2 },
  { name: 'Nem rán (Chả giò)', desc: 'Nem rán giòn nhân thịt miến', price: 35000, img: 'https://images.unsplash.com/photo-1585489721665-27660237071d?q=80&w=1964&auto=format&fit=crop', c_idx: 2 },
  { name: 'Bánh xèo miền Tây', desc: 'Bánh xèo nhân tôm thịt, vỏ mỏng giòn', price: 45000, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop', c_idx: 2 }, // Using pizza image as placeholder if needed, or proper one
  { name: 'Bánh khọt Vũng Tàu', desc: 'Bánh khọt tôm mực giòn rụm', price: 40000, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop', c_idx: 2 },
  { name: 'Cá viên chiên', desc: 'Cá viên chiên mắm tỏi', price: 20000, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1974&auto=format&fit=crop', c_idx: 2 },
  { name: 'Xúc xích Đức nướng', desc: 'Xúc xích nướng than', price: 15000, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1974&auto=format&fit=crop', c_idx: 2 },
  { name: 'Phô mai que', desc: 'Phô mai que chiên giòn (5 que)', price: 25000, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1974&auto=format&fit=crop', c_idx: 2 },
  { name: 'Khoai tây chiên mắm', desc: 'Khoai tây chiên mắm tỏi', price: 25000, img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1935&auto=format&fit=crop', c_idx: 2 },
  { name: 'Khoai lang kén', desc: 'Khoai lang kén chiên vừng', price: 25000, img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1935&auto=format&fit=crop', c_idx: 2 },
  { name: 'Trứng cút lộn xào me', desc: 'Trứng cút lộn xào me chua ngọt', price: 30000, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop', c_idx: 2 },

  // Bánh mì
  { name: 'Bánh mì thịt chả', desc: 'Bánh mì thịt chả truyền thống', price: 20000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì xíu mại', desc: 'Bánh mì xíu mại trứng muối', price: 25000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì heo quay', desc: 'Bánh mì heo quay giòn da', price: 25000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì ốp la', desc: 'Bánh mì ốp la 2 trứng', price: 15000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì chảo', desc: 'Bánh mì chảo pate, xúc xích, bò né', price: 45000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì que Hải Phòng', desc: 'Bánh mì que pate cay (5 chiếc)', price: 20000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },
  { name: 'Bánh mì pate xúc xích', desc: 'Pate thơm lừng', price: 20000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2070&auto=format&fit=crop', c_idx: 3 },

  // Đồ uống
  { name: 'Cà phê sữa đá', desc: 'Cà phê pha phin truyền thống', price: 20000, img: 'https://images.unsplash.com/photo-1517701550927-30cfcb64ac45?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Bạc xỉu', desc: 'Bạc xỉu sữa nhiều cà phê ít', price: 22000, img: 'https://images.unsplash.com/photo-1517701550927-30cfcb64ac45?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Trà đào cam sả', desc: 'Trà đào thơm nồng vị sả', price: 30000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Trà vải nhiệt đới', desc: 'Trà vải trái cây', price: 30000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Trà sen vàng', desc: 'Trà sen thơm béo hạt sen', price: 35000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Sinh tố xoài', desc: 'Sinh tố xoài cát Hòa Lộc', price: 30000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Sinh tố bơ', desc: 'Sinh tố bơ sáp Đắk Lắk béo ngậy', price: 35000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Nước ép cam', desc: 'Cam vắt nguyên chất', price: 25000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Nước mía sầu riêng', desc: 'Nước mía pha sầu riêng thơm béo', price: 20000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },
  { name: 'Nước dừa tươi', desc: 'Dừa xiêm Bến Tre ngọt lịm', price: 20000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1974&auto=format&fit=crop', c_idx: 4 },

  // Tráng miệng
  { name: 'Chè bưởi', desc: 'Chè bưởi An Giang cốt dừa', price: 20000, img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=2027&auto=format&fit=crop', c_idx: 5 },
  { name: 'Chè thái sầu riêng', desc: 'Chè thái múi sầu riêng to', price: 30000, img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=2027&auto=format&fit=crop', c_idx: 5 },
  { name: 'Bánh flan', desc: 'Bánh flan cốt dừa caramen', price: 15000, img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=2027&auto=format&fit=crop', c_idx: 5 },
  { name: 'Sữa chua hạt đác', desc: 'Sữa chua mix hạt đác rim dứa', price: 25000, img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=2027&auto=format&fit=crop', c_idx: 5 }
];

async function seed() {
  console.log('Seeding Database with 50+ Vietnamese foods...');
  try {
    // Clear out foods & categories
    console.log('Truncating tables...');
    await pool.query('TRUNCATE TABLE categories CASCADE');

    for (const c of categories) {
      await pool.query(
        'INSERT INTO categories (id, name, description, is_active) VALUES ($1, $2, $3, true)',
        [c.id, c.name, c.description]
      );
    }

    for (const f of foods) {
      const catId = categories[f.c_idx].id;
      const fId = crypto.randomUUID();
      await pool.query(
        'INSERT INTO foods (id, name, description, price, image_url, category_id, is_available) VALUES ($1, $2, $3, $4, $5, $6, true)',
        [fId, f.name, f.desc, f.price, f.img, catId]
      );
    }

    // Add some default promotions, employees, expenses
    await pool.query(`INSERT INTO promotions (code, discount_percentage) VALUES ('NEWUSER', 10) ON CONFLICT (code) DO NOTHING;`);
    await pool.query(`INSERT INTO employees (name, role, salary) VALUES ('Nguyễn Văn A', 'Quản lý', 15000000);`);
    await pool.query(`INSERT INTO employees (name, role, salary) VALUES ('Trần Thị B', 'Đầu bếp', 12000000);`);
    await pool.query(`INSERT INTO expenses (description, amount) VALUES ('Tiền điện tháng 6', 5000000);`);
    await pool.query(`INSERT INTO expenses (description, amount) VALUES ('Mua nguyên liệu thịt bò', 10000000);`);

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    pool.end();
  }
}

seed();
