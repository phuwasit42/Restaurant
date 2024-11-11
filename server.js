// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/restaurant';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));


// Admin Schema & Model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


// Customer Schema & Model
const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);
const Customer = mongoose.model('Customer', customerSchema);


// สร้างบัญชีแอดมิน (รันครั้งเดียวเพื่อเริ่มต้น)
Admin.findOne({ username: 'admin01' }).then((admin) => {
  if (!admin) {
    bcrypt.hash('1234', 10).then((hashedPassword) => {
      new Admin({ username: 'admin01', password: hashedPassword }).save()
        .then(() => console.log('Admin account created'))
        .catch(console.error);
    });
  }
});


// Admin Login
app.post('/api/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      // Admin not found
      console.log('Admin not found:', username);
      return res.status(404).send('Admin not found'); // Use a different status code and message
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Password mismatch
      console.log('Invalid password for admin:', username);
      return res.status(401).send('Invalid password');
    }

    // Successful login
    console.log('Admin login successful:', username);
    res.status(200).json({ message: 'Admin login successful' });
  } catch (error) {
    console.error('Error logging in as admin:', error);
    res.status(500).send('Internal server error');
  }
});




// Routes
// Register Customer
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, email, phoneNumber, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).send('Passwords do not match');
    }

    const userExists = await Customer.findOne({ username });
    if (userExists) {
      console.log('User already exists:', username);
      return res.status(400).send('User already exists');
    }

    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      console.log('Email already in use:', email);
      return res.status(400).send('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    const newCustomer = new Customer({ name, username, email, phoneNumber, password: hashedPassword, role: 'customer' });
    await newCustomer.save();

    console.log('User registered successfully:', newCustomer);
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username });
    if (!customer) {
      console.log('Invalid username:', username);
      return res.status(400).send('Invalid username or password');
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      console.log('Invalid password for user:', username);
      return res.status(400).send('Invalid username or password');
    }
    const token = jwt.sign({ userId: customer._id, role: customer.role, username: customer.username }, 'secretkey', { expiresIn: '1h' });
    console.log('Login successful for user:', username);
    res.status(200).json({ token, username: customer.username, role: customer.role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Order Schema & Model
const orderSchema = new mongoose.Schema({
  items: [
    {
      productName: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'รอดำเนินการ' },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

app.post('/api/order', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const newOrder = new Order({
      items,
      totalAmount,
    });

    await newOrder.save();
    console.log('Order placed successfully:', newOrder);
    res.status(201).send('Order placed successfully');
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find(); // ดึงข้อมูลคำสั่งซื้อทั้งหมดจาก MongoDB
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
});

// API สำหรับอัปเดตสถานะคำสั่งซื้อ
app.get('/api/admin/orders', async (req, res) => {
  try {
      const orders = await Order.find();
      res.json(orders);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Error fetching orders');
  }
});

// API สำหรับอัปเดตสถานะคำสั่งซื้อ
app.put('/api/orders/:id', async (req, res) => {
  try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (order) {
          res.status(200).json(order);
      } else {
          res.status(404).send('Order not found');
      }
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).send('Error updating order status');
  }
});


// Start Server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000/main.html`);
});

