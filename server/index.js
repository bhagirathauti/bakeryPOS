// ...existing code...
// Fetch all users with cashier or shop_owner role

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prisma = require('./prismaClient')
const mysql = require('mysql2/promise')

const app = express();
app.use(cors());
// Increase body size limits to allow base64 profile pictures from the client.
// Keep this reasonable (5-6MB) — for production, prefer multipart file uploads instead of embedding large base64 in JSON.
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: true }));
app.use(morgan('dev'));

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// debug route (safe: does not expose password) to inspect which DB the server thinks it's using
app.get('/api/debug/db', (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl) return res.json({ ok: false, message: 'no DATABASE_URL configured' })
    // parse minimal info
    const url = new URL(dbUrl)
    const user = url.username
    const host = url.hostname
    const port = url.port
    const database = url.pathname ? url.pathname.replace(/^\//, '') : ''
    return res.json({ ok: true, user, host, port, database })
  } catch (err) {
    return res.json({ ok: false, error: String(err) })
  }
})

// Example route that queries a `users` table (adjust to your schema)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true }, take: 10 })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// Ensure Prisma can connect to the database (simple connectivity check)
async function ensurePrismaConnection() {
  try {
    // simple raw query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Prisma connection OK');
  } catch (err) {
    console.error('Prisma connection failed', err);
  }
}


const auth = require('./auth')
const shop = require('./shop')
const product = require('./product')
// Product endpoints
app.post('/api/products', async (req, res) => {
  const { shopId, productName, price, discount, cgst, sgst } = req.body;
  if (!shopId || !productName || !price) return res.status(400).json({ error: 'shopId, productName, price required' });
  try {
    const p = await product.addProduct(shopId, { productName, price, discount, cgst, sgst });
    res.json(p);
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/products', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: 'shopId required' });
  try {
    const products = await product.getProducts(shopId);
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { productName, price, discount, cgst, sgst, stock } = req.body;
  try {
    const updated = await product.updateProduct(productId, { productName, price, discount, cgst, sgst, stock });
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await product.deleteProduct(productId);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Auth endpoints (using auth module)
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('POST /api/auth/signup', { email })
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const u = await auth.createUser(email, password, 'shop_owner')
    res.json(u)
  } catch (err) {
    // user already exists -> client error
    if (err && (err.message === 'user_exists' || err.code === 'P2002')) {
      return res.status(400).json({ error: 'user_exists' })
    }
    // Prisma: table/model not found (DB not migrated)
    if (err && err.code === 'P2021') {
      console.error('Prisma model/table missing:', err)
      return res.status(500).json({ error: 'database_not_migrated', message: 'Run `npx prisma db push` or `npx prisma migrate dev` to create tables.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const u = await auth.verifyUser(email, password)
    if (!u) return res.status(400).json({ error: 'invalid_credentials' })
    res.json(u)
  } catch (err) {
    if (err && err.code === 'P2021') {
      console.error('Prisma model/table missing during login:', err)
      return res.status(500).json({ error: 'database_not_migrated', message: 'Run `npx prisma db push` or `npx prisma migrate dev` to create tables.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

// Create cashier endpoint (shop owner only)
app.post('/api/cashiers', async (req, res) => {
  const { shopId, email, password } = req.body;
  console.log('POST /api/cashiers', { shopId, email });
  
  if (!shopId || !email || !password) {
    return res.status(400).json({ error: 'shopId, email and password required' });
  }
  
  try {
    // Verify shop exists
    const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
    if (!shop) {
      return res.status(404).json({ error: 'shop_not_found' });
    }
    
    // Create cashier user
    const cashier = await auth.createUser(email, password, 'cashier', Number(shopId));
    res.json(cashier);
  } catch (err) {
    if (err && (err.message === 'user_exists' || err.code === 'P2002')) {
      return res.status(400).json({ error: 'user_exists' });
    }
    console.error('Create cashier error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Get cashiers for a shop
app.get('/api/cashiers', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: 'shopId required' });
  
  try {
    const cashiers = await prisma.user.findMany({
      where: {
        shopId: Number(shopId),
        role: 'cashier'
      },
      select: { 
        id: true, 
        email: true, 
        role: true,
        createdAt: true
      }
    });
    res.json(cashiers);
  } catch (err) {
    console.error('Fetch cashiers error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Delete cashier endpoint
app.delete('/api/cashiers/:id', async (req, res) => {
  const cashierId = Number(req.params.id);
  
  try {
    // Verify user is a cashier
    const user = await prisma.user.findUnique({ where: { id: cashierId } });
    if (!user || user.role !== 'cashier') {
      return res.status(404).json({ error: 'cashier_not_found' });
    }
    
    await prisma.user.delete({ where: { id: cashierId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete cashier error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Cashier profile endpoints
app.get('/api/cashier/profile', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  try {
    const profile = await prisma.cashierProfile.findUnique({
      where: { userId: Number(userId) }
    });
    res.json(profile || null);
  } catch (err) {
    console.error('Get cashier profile error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/cashier/profile', async (req, res) => {
  const { userId, cashierName, mobile, profilePic } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  try {
    const profile = await prisma.cashierProfile.upsert({
      where: { userId: Number(userId) },
      update: { cashierName, mobile, profilePic },
      create: { userId: Number(userId), cashierName, mobile, profilePic }
    });
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Upsert cashier profile error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Order endpoints
app.post('/api/orders', async (req, res) => {
  const { shopId, cashierId, customerName, customerMobile, items, paymentMethod } = req.body;
  
  if (!shopId || !cashierId || !customerName || !customerMobile || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check stock availability first
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      });
      
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productName} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const orderItemsData = items.map(item => {
      const itemPrice = item.price * item.quantity;
      const discountAmount = (itemPrice * item.discount) / 100;
      const afterDiscount = itemPrice - discountAmount;
      const cgstAmount = (afterDiscount * item.cgst) / 100;
      const sgstAmount = (afterDiscount * item.sgst) / 100;
      const itemTotal = afterDiscount + cgstAmount + sgstAmount;

      subtotal += itemPrice;
      totalDiscount += discountAmount;
      totalTax += cgstAmount + sgstAmount;

      return {
        productId: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        cgst: item.cgst,
        sgst: item.sgst,
        total: itemTotal
      };
    });

    const total = subtotal - totalDiscount + totalTax;

    // Create order with items and update stock in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          shopId: Number(shopId),
          cashierId: Number(cashierId),
          customerName,
          customerMobile,
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
          total,
          paymentMethod: paymentMethod || 'cash',
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: true
        }
      });

      // Decrement stock for each product
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    res.json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/orders', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: 'shopId required' });

  try {
    const orders = await prisma.order.findMany({
      where: { shopId: Number(shopId) },
      include: {
        orderItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Shop profile endpoints (using shop module)
app.get('/api/shop/profile', async (req, res) => {
  const userId = req.query.userId
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    const s = await shop.getShopByUserId(userId)
    res.json(s || null)
  } catch (err) {
    if (err && err.code === 'P2021') {
      console.error('Prisma model/table missing during get shop profile:', err)
      return res.status(500).json({ error: 'database_not_migrated', message: 'Run `npx prisma db push` or `npx prisma migrate dev` to create tables.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/shop/profile', async (req, res) => {
  const { userId, shopName, mobile, address, ownerName, profilePic } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    await shop.upsertShop(userId, { shopName, mobile, address, ownerName, profilePic })
    res.json({ success: true })
  } catch (err) {
    if (err && err.code === 'P2021') {
      console.error('Prisma model/table missing during upsert shop profile:', err)
      return res.status(500).json({ error: 'database_not_migrated', message: 'Run `npx prisma db push` or `npx prisma migrate dev` to create tables.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }

})
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'cashier' },
          { role: 'shop_owner' }
        ]
      },
      select: { id: true, email: true, role: true }
    });
    res.json(users);
  } catch (err) {
    console.error('Fetch all users error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Ensure Prisma connectivity only
ensurePrismaConnection();

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));

// global error handler to prevent crashes and return JSON errors
app.use((err, req, res, next) => {
  console.error('Unhandled error in request:', err)
  if (res.headersSent) return next(err)
  // Handle large payloads explicitly
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'payload_too_large', message: 'Request body too large. Reduce image size or use file upload endpoints.' })
  }
  res.status(500).json({ error: 'server_error' })
});

// catch unhandled rejections so the process doesn't crash unexpectedly during dev
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // don't exit in dev; in production consider exiting and restarting the process
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // In production you'd likely restart the process. For development keep running.
});
