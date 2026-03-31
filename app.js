
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'prajalshah',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_db',
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        if (!title) return res.status(400).json({ error: 'Title required' });
        
        const result = await pool.query(
            'INSERT INTO todos (title, description, priority) VALUES ($1, $2, $3) RETURNING *',
            [title, description, priority || 'medium']
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/todos/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const { title, description, completed, priority } = req.body;
        const result = await pool.query(
            'UPDATE todos SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed), priority = COALESCE($4, priority), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [title, description, completed, priority, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json({ success: true, message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/todos/:id/toggle', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE todos SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json({ success: true, message: `Todo marked as ${result.rows[0].completed ? 'completed' : 'pending'}`, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/stats/todos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*)::int as total,
                SUM(CASE WHEN completed THEN 1 ELSE 0 END)::int as completed,
                SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END)::int as pending,
                COUNT(CASE WHEN priority = 'high' THEN 1 END)::int as high_priority,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END)::int as medium_priority,
                COUNT(CASE WHEN priority = 'low' THEN 1 END)::int as low_priority
            FROM todos`
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Todo API is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Todo API',
        version: '1.0.0',
        endpoints: {
            'POST /api/todos': 'Create todo',
            'GET /api/todos': 'Get all todos',
            'GET /api/todos/:id': 'Get todo by id',
            'PUT /api/todos/:id': 'Update todo',
            'DELETE /api/todos/:id': 'Delete todo',
            'PATCH /api/todos/:id/toggle': 'Toggle todo completion',
            'GET /api/stats/todos': 'Get statistics'
        }
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api\n`);
});