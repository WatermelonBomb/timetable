const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'schedule_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 接続テスト
pool.connect((err, client, release) => {
    if (err) {
        console.error('データベース接続エラー:', err.stack);
    } else {
        console.log('データベースに接続しました。');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 