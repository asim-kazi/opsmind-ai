const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const { handleChat } = require('./controllers/chatController');
const { signup, login } = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');

const { processUpload } = require('./controllers/uploadController');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// 1. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!!!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 2. Setup Multer for PDF upload
const upload = multer({ dest: 'uploads/' });

// 3. Setup the Upload Route
app.post('/upload', upload.single('pdf'), processUpload);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.post('/chat', handleChat);
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
