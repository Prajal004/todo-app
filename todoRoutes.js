const express = require('express');
const router = express.Router();
const TodoController = require('../controllers/todoController');

// CRUD Routes
router.post('/todos', TodoController.createTodo);
router.get('/todos', TodoController.getAllTodos);
router.get('/todos/:id', TodoController.getTodoById);
router.put('/todos/:id', TodoController.updateTodo);
router.delete('/todos/:id', TodoController.deleteTodo);

// Additional Routes
router.patch('/todos/:id/toggle', TodoController.toggleComplete);
router.get('/stats/todos', TodoController.getStats);

module.exports = router;