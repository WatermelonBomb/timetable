const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// ユーザー登録
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, university = null, department = null } = req.body;
        
        // メールアドレスの重複チェック
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'このメールアドレスは既に登録されています。' });
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // ユーザーの作成
        const { rows } = await pool.query(
            'INSERT INTO users (email, password, username, university, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, university, department',
            [email, hashedPassword, name, university, department]
        );

        // JWTトークンの生成
        const token = jwt.sign(
            { id: rows[0].id },
            process.env.JWT_SECRET || 'your-secret-key-here',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: rows[0].id,
                email: rows[0].email,
                username: rows[0].username,
                university: rows[0].university,
                department: rows[0].department
            }
        });
    } catch (error) {
        console.error('登録エラー:', error);
        res.status(400).json({ error: 'ユーザー登録に失敗しました。' + error.message });
    }
});

// ログイン
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // ユーザーの検索
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
        }

        const user = rows[0];
        
        // パスワードの検証
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
        }

        // JWTトークンの生成
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key-here',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                university: user.university,
                department: user.department
            }
        });
    } catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({ error: 'ログインに失敗しました。' + error.message });
    }
});

module.exports = router; 