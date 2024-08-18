const taskFileName = 'tasks.json';

document.addEventListener("DOMContentLoaded", function() {
    // Load tasks on page load
    loadTasks();
});

$('#taskForm').on('submit', function(e) {
    e.preventDefault();
    const task = $('#taskInput').val();
    const priority = $('input[name="priority"]:checked').val(); // Get the selected priority

    addTask({ task, priority });
    $('#taskForm')[0].reset();
    $('#taskModal').modal('hide'); // Close the modal after saving
    loadTasks();
});

$(document).on('click', '.delete-btn', function() {
    const taskId = $(this).data('id');
    deleteTask(taskId);
    loadTasks();
});

$(document).on('click', '.up-btn', function() {
    const taskId = $(this).data('id');
    changeOrder(taskId, 'up');
    loadTasks();
});

$(document).on('click', '.down-btn', function() {
    const taskId = $(this).data('id');
    changeOrder(taskId, 'down');
    loadTasks();
});

function loadTasks() {
    const tasks = getTasks();
    const taskTableBody = $('#taskTableBody');
    taskTableBody.empty();

    if (tasks.length === 0) {
        taskTableBody.append(`
            <tr>
                <td colspan="3" class="text-center">No tasks in the list!</td>
            </tr>
        `);
    } else {
        tasks.forEach((task, index) => {
            const priorityBadge = getPriorityBadge(task.priority);
            taskTableBody.append(`
                <tr>
                    <td class="task-column">${task.task}</td>
                    <td class="priority-column">${priorityBadge}</td>
                    <td class="actions-column">
                        <button class='btn btn-success up-btn action-btn' data-id='${index}'><i class='fas fa-arrow-up'></i></button>
                        <button class='btn btn-warning down-btn action-btn' data-id='${index}'><i class='fas fa-arrow-down'></i></button>
                        <button class='btn btn-danger delete-btn action-btn' data-id='${index}'><i class='fas fa-trash'></i></button>
                    </td>
                </tr>
            `);
        });
    }
}

function getPriorityBadge(priority) {
    let badgeClass;
    switch (priority) {
    case 'High':
        badgeClass = 'badge-high';
        break;
    case 'Medium':
        badgeClass = 'badge-medium';
        break;
    case 'Low':
        badgeClass = 'badge-low';
        break;
    default:
        badgeClass = 'badge-secondary';
    }
    return `<span class="badge ${badgeClass}">${priority}</span>`;
}

function getTasks() {
    const tasksJSON = localStorage.getItem(taskFileName);
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem(taskFileName, JSON.stringify(tasks));
}

function addTask(newTask) {
    const tasks = getTasks();
    tasks.push(newTask);
    saveTasks(tasks);
}

function deleteTask(taskId) {
    let tasks = getTasks();
    tasks = tasks.filter((_, index) => index !== taskId);
    saveTasks(tasks);
}

function changeOrder(taskId, direction) {
    let tasks = getTasks();

    if (direction === 'up' && taskId > 0) {
        [tasks[taskId], tasks[taskId - 1]] = [tasks[taskId - 1], tasks[taskId]];
    } else if (direction === 'down' && taskId < tasks.length - 1) {
        [tasks[taskId], tasks[taskId + 1]] = [tasks[taskId + 1], tasks[taskId]];
    }

    saveTasks(tasks);
}
