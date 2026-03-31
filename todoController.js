const TodoModel = require('../models/todoModel');

class TodoController {
    // Create todo
    static async createTodo(req, res, next) {
        try {
            const { title, description, priority, due_date } = req.body;
            
            // Validation
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: 'Title is required' });
            }

            const todo = await TodoModel.create({
                title: title.trim(),
                description: description || null,
                priority: priority || 'medium',
                due_date: due_date || null
            });

            res.status(201).json({
                success: true,
                message: 'Todo created successfully',
                data: todo
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all todos
    static async getAllTodos(req, res, next) {
        try {
            const { completed, priority } = req.query;
            const filters = {};
            
            if (completed !== undefined) {
                filters.completed = completed === 'true';
            }
            if (priority) {
                filters.priority = priority;
            }

            const todos = await TodoModel.findAll(filters);
            res.status(200).json({
                success: true,
                count: todos.length,
                data: todos
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single todo
    static async getTodoById(req, res, next) {
        try {
            const { id } = req.params;
            const todo = await TodoModel.findById(id);

            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            res.status(200).json({
                success: true,
                data: todo
            });
        } catch (error) {
            next(error);
        }
    }

    // Update todo
    static async updateTodo(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, completed, priority, due_date } = req.body;

            // Check if todo exists
            const existingTodo = await TodoModel.findById(id);
            if (!existingTodo) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            const updatedTodo = await TodoModel.update(id, {
                title,
                description,
                completed,
                priority,
                due_date
            });

            res.status(200).json({
                success: true,
                message: 'Todo updated successfully',
                data: updatedTodo
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete todo
    static async deleteTodo(req, res, next) {
        try {
            const { id } = req.params;

            // Check if todo exists
            const existingTodo = await TodoModel.findById(id);
            if (!existingTodo) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            await TodoModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Todo deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Toggle todo completion
    static async toggleComplete(req, res, next) {
        try {
            const { id } = req.params;

            const todo = await TodoModel.toggleComplete(id);
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            res.status(200).json({
                success: true,
                message: `Todo marked as ${todo.completed ? 'completed' : 'pending'}`,
                data: todo
            });
        } catch (error) {
            next(error);
        }
    }

    // Get statistics
    static async getStats(req, res, next) {
        try {
            const stats = await TodoModel.getStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TodoController;