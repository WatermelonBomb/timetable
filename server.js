const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// ルートのインポート
const authRoutes = require('./src/routes/auth');
const scheduleRoutes = require('./src/routes/schedule');
const notificationRoutes = require('./src/routes/notification');
const postRoutes = require('./src/routes/posts');

const app = express();

// ミドルウェアの設定
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// APIルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);

// フロントエンドのルート
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404エラーハンドリング
app.use((req, res) => {
    res.status(404).json({ error: 'ページが見つかりません。' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました。http://localhost:${PORT}`);
});
