'use strict';

module.exports = function(app) {
    let todoList = require('../controllers/todoListController');
    let userHandles = require('../controllers/userController');

    // todoList Routes
    app.route('/tasks')
        .get(userHandles.loginRequired,todoList.list_all_tasks)
        .post(userHandles.loginRequired,todoList.create_a_task);

    app.route('/tasks/:taskId')
        .get(userHandles.loginRequired,todoList.read_a_task)
        .put(userHandles.loginRequired,todoList.update_a_task)
        .delete(userHandles.loginRequired,todoList.delete_a_task);

    app.route('/auth/register')
        .post(userHandles.register);


    app.route('/auth/:email')
        .put(userHandles.update_active);

    app.route('/auth/sign_in')
        .post(userHandles.sign_in);
};