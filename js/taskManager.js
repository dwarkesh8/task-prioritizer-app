const taskFileName = 'tasks.json';
const completedTaskFileName = 'completedTasks.json';

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

$(document).on('change', '.complete-checkbox', function() {
    const taskId = $(this).data('id');
    markTaskAsCompleted(taskId);
});

function loadTasks() {
    const tasks = getTasks();
    const taskTableBody = $('#taskTableBody');
    taskTableBody.empty();

    tasks.forEach((task, index) => {
        const priorityBadge = getPriorityBadge(task.priority);
        if (!task.completed) {
            taskTableBody.append(`
                <tr>
                    <td><input type="checkbox" class="complete-checkbox" data-id="${index}" onchange="playMarkCompleteSound()" /> ${task.task}</td>
                    <td>${priorityBadge}</td>
                    <td>
                        <button class='btn btn-success up-btn action-btn' data-id='${index}'><i class='fas fa-arrow-up'></i></button>
                        <button class='btn btn-warning down-btn action-btn' data-id='${index}'><i class='fas fa-arrow-down'></i></button>
                        <button class='btn btn-danger delete-btn action-btn' data-id='${index}'><i class='fas fa-trash'></i></button>
                    </td>
                </tr>
            `);
        }
    });
}

function markTaskAsCompleted(index) {
    const tasks = getTasks();
    const completedTasks = getCompletedTasks();

    const task = tasks.splice(index, 1)[0];
    task.completed = true;  // Mark the task as completed
    completedTasks.push(task);

    saveTasks(tasks);
    saveCompletedTasks(completedTasks);
    loadTasks();  // Reload the task list
}

function loadCompletedTasks() {
    const completedTasks = getCompletedTasks();
    console.log("Loading Completed Tasks", completedTasks);  // Debugging line
    const completedTasksTableBody = $('#completedTasksTableBody');
    completedTasksTableBody.empty();

    if (completedTasks.length === 0) {
        completedTasksTableBody.append(`
            <tr>
                <td colspan="3" class="text-center">No completed tasks found!</td>
            </tr>
        `);
    } else {
        completedTasks.forEach((task, index) => {
            const priorityBadge = getPriorityBadge(task.priority);
            completedTasksTableBody.append(`
                <tr>
                    <td>${task.task}</td>
                    <td>${priorityBadge}</td>
                    <td>
                        <button class='btn btn-sm btn-success undo-btn' data-id='${index}'>
                            <i class='fas fa-undo'></i> Undo
                        </button>
                    </td>
                </tr>
            `);
        });
    }
}

$(document).on('click', '.undo-btn', function() {
    const taskId = $(this).data('id');
    undoCompletedTask(taskId);
    loadTasks();
    loadCompletedTasks();
});

$('#clearHistoryBtn').on('click', function() {
    clearCompletedTasks();
    loadCompletedTasks();
});

function undoCompletedTask(index) {
    const completedTasks = getCompletedTasks();
    const task = completedTasks.splice(index, 1)[0];
    const tasks = getTasks();
    
    task.completed = false;  // Mark the task as not completed
    tasks.push(task);

    saveTasks(tasks);
    saveCompletedTasks(completedTasks);
    loadTasks();
    loadCompletedTasks();
    playClickSound();
}

function clearCompletedTasks() {
    const completedTasks = getCompletedTasks();
    if (completedTasks.length > 0) {
        saveCompletedTasks([]);  // Clear completed tasks
        playDeleteSound();
    }
}

function getCompletedTasks() {
    return JSON.parse(localStorage.getItem(completedTaskFileName)) || [];
}

function saveCompletedTasks(completedTasks) {
    localStorage.setItem(completedTaskFileName, JSON.stringify(completedTasks));
}

$('#historyModal').on('show.bs.modal', function () {
    loadCompletedTasks();
});

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
        playClickSound();
    } else if (direction === 'down' && taskId < tasks.length - 1) {
        [tasks[taskId], tasks[taskId + 1]] = [tasks[taskId + 1], tasks[taskId]];
        playClickSound();
    }

    saveTasks(tasks);
}
