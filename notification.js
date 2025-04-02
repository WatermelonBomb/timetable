const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');

// 通知設定の取得
router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM notification_settings WHERE user_id = $1',
            [req.user.id]
        );

        if (rows.length === 0) {
            // 設定が存在しない場合はデフォルト設定を作成
            const { rows: newRows } = await pool.query(
                'INSERT INTO notification_settings (user_id) VALUES ($1) RETURNING *',
                [req.user.id]
            );
            return res.json(newRows[0]);
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('通知設定取得エラー:', error);
        res.status(500).json({ error: '通知設定の取得に失敗しました。' });
    }
});

// 通知設定の更新
router.put('/', auth, async (req, res) => {
    try {
        const { is_enabled, reminder_minutes } = req.body;
        
        const { rows } = await pool.query(
            'UPDATE notification_settings SET is_enabled = $1, reminder_minutes = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *',
            [is_enabled, reminder_minutes, req.user.id]
        );

        if (rows.length === 0) {
            // 設定が存在しない場合は新規作成
            const { rows: newRows } = await pool.query(
                'INSERT INTO notification_settings (user_id, is_enabled, reminder_minutes) VALUES ($1, $2, $3) RETURNING *',
                [req.user.id, is_enabled, reminder_minutes]
            );
            return res.json(newRows[0]);
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('通知設定更新エラー:', error);
        res.status(400).json({ error: '通知設定の更新に失敗しました。' });
    }
});

// 通知の送信テスト
router.post('/test', auth, async (req, res) => {
    try {
        // TODO: 実際の通知送信処理を実装
        // この部分は、Web Push APIやメール送信などの実装が必要
        res.json({ message: 'テスト通知を送信しました。' });
    } catch (error) {
        console.error('テスト通知送信エラー:', error);
        res.status(500).json({ error: 'テスト通知の送信に失敗しました。' });
    }
});

module.exports = router; 