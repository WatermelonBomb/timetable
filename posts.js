const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// 投稿一覧の取得
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.username, 
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('投稿一覧の取得エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// 新規投稿の作成
router.post('/', auth, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
            [userId, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('投稿作成エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// いいねの追加/削除
router.post('/:id/like', auth, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const existingLike = await pool.query(
            'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );

        if (existingLike.rows.length > 0) {
            await pool.query(
                'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
                [userId, postId]
            );
            res.json({ liked: false });
        } else {
            await pool.query(
                'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
                [userId, postId]
            );
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('いいね処理エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// コメントの追加
router.post('/:id/comments', auth, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
            [userId, postId, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('コメント追加エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// コメント一覧の取得
router.get('/:id/comments', async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC`,
            [postId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('コメント一覧の取得エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

module.exports = router; 