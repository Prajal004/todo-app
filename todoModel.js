const pool = require('../config/database');

class TodoModel {
    // Create a new todo
    static async create(todoData) {
        const { title, description, priority, due_date } = todoData;
        const query = `
            INSERT INTO todos (title, description, priority, due_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [title, description, priority, due_date];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get all todos with optional filters
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM todos';
        const values = [];
        const conditions = [];

        if (filters.completed !== undefined) {
            conditions.push(`completed = $${values.length + 1}`);
            values.push(filters.completed);
        }

        if (filters.priority) {
            conditions.push(`priority = $${values.length + 1}`);
            values.push(filters.priority);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, values);
        return result.rows;
    }

    // Get todo by ID
    static async findById(id) {
        const query = 'SELECT * FROM todos WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Update todo
    static async update(id, todoData) {
        const { title, description, completed, priority, due_date } = todoData;
        const query = `
            UPDATE todos 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                completed = COALESCE($3, completed),
                priority = COALESCE($4, priority),
                due_date = COALESCE($5, due_date)
            WHERE id = $6
            RETURNING *
        `;
        const values = [title, description, completed, priority, due_date, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete todo
    static async delete(id) {
        const query = 'DELETE FROM todos WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Toggle todo completion status
    static async toggleComplete(id) {
        const query = `
            UPDATE todos 
            SET completed = NOT completed
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get statistics
    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) as pending,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
                COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
            FROM todos
        `;
        const result = await pool.query(query);
        return result.rows[0];
    }
}

module.exports = TodoModel;