const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');

// 時間割の取得
router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM schedules WHERE user_id = $1 ORDER BY day_of_week, period',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('時間割取得エラー:', error);
        res.status(500).json({ error: '時間割の取得に失敗しました。' });
    }
});

// 授業の追加
router.post('/', auth, async (req, res) => {
    try {
        const { day_of_week, period, subject_name, classroom, color_code } = req.body;
        
        const { rows } = await pool.query(
            'INSERT INTO schedules (user_id, day_of_week, period, subject_name, classroom, color_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, day_of_week, period, subject_name, classroom, color_code]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('授業追加エラー:', error);
        res.status(400).json({ error: '授業の追加に失敗しました。' });
    }
});

// 授業の更新
router.put('/:id', auth, async (req, res) => {
    try {
        const { day_of_week, period, subject_name, classroom, color_code } = req.body;
        
        const { rows } = await pool.query(
            'UPDATE schedules SET day_of_week = $1, period = $2, subject_name = $3, classroom = $4, color_code = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
            [day_of_week, period, subject_name, classroom, color_code, req.params.id, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '授業が見つかりません。' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('授業更新エラー:', error);
        res.status(400).json({ error: '授業の更新に失敗しました。' });
    }
});

// 授業の削除
router.delete('/:id', auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '授業が見つかりません。' });
        }

        res.json({ message: '授業を削除しました。' });
    } catch (error) {
        console.error('授業削除エラー:', error);
        res.status(500).json({ error: '授業の削除に失敗しました。' });
    }
});

module.exports = router; 