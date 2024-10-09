// O 'electron' já está disponível via preload.js

// Adiciona o listener ao botão de adicionar tarefa
document.getElementById('add-task').addEventListener('click', function () {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }

    addTask(taskText);
    taskInput.value = ''; // Limpa o campo após adicionar
    saveTasks(); // Salva automaticamente as tarefas após adicionar uma nova
});

// Limpa as tarefas
document.getElementById('reset-tasks').addEventListener('click', function () {
    document.getElementById('pending-tasks').innerHTML = '';
    document.getElementById('completed-tasks').innerHTML = '';
    saveTasks(); // Salva automaticamente após resetar as tarefas
});

// Função para adicionar tarefa
function addTask(task) {
    const pendingTasks = document.getElementById('pending-tasks');

    const listItem = document.createElement('li');
    listItem.classList.add('todo-item'); // Adiciona a classe para estilo

    // Cria o checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            completeTask(listItem);
        }
    });

    const taskText = document.createElement('span');
    taskText.textContent = task;

    // Cria o botão de excluir
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '&#129530'; // Ícone de lixeira (🗑️)
    deleteButton.addEventListener('click', function () {
        pendingTasks.removeChild(listItem); // Remove o item da lista correspondente
        saveTasks(); // Salva automaticamente as tarefas após excluir
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
    listItem.appendChild(deleteButton); // Adiciona o botão de excluir
    pendingTasks.appendChild(listItem);
}

function completeTask(taskItem) {
    const completedTasks = document.getElementById('completed-tasks');

    // Move a tarefa para a lista de concluídas
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.disabled = true; // Desabilita o checkbox para tarefas concluídas

    // Remove o botão de excluir existente, se houver
    const existingDeleteButton = taskItem.querySelector('.delete-button');
    if (existingDeleteButton) {
        existingDeleteButton.remove(); // Remove o botão de excluir
    }

    completedTasks.appendChild(taskItem);

    // Adiciona um novo botão de excluir à tarefa concluída
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '&#129530'; // Ícone de lixeira (🗑️)
    deleteButton.addEventListener('click', function () {
        completedTasks.removeChild(taskItem); // Remove a tarefa concluída
        saveTasks(); // Salva automaticamente as tarefas após excluir
    });

    taskItem.appendChild(deleteButton); // Adiciona o botão de excluir à tarefa
    saveTasks(); // Salva automaticamente as tarefas após concluir uma
}

// Função para salvar as tarefas
function saveTasks() {
    const pendingTasks = document.getElementById('pending-tasks').children;
    const completedTasks = document.getElementById('completed-tasks').children;

    const tasks = {
        pending: [],
        completed: []
    };

    // Captura as tarefas pendentes
    for (let task of pendingTasks) {
        tasks.pending.push(task.querySelector('span').textContent.trim());
    }

    // Captura as tarefas concluídas
    for (let task of completedTasks) {
        tasks.completed.push(task.querySelector('span').textContent.trim());
    }

    // Envia as tarefas para serem salvas no main.js
    electron.send('save-tasks', tasks);
}

// Ouvir para carregar as tarefas
electron.on('load-tasks', (tasks) => {
    tasks.pending.forEach(task => addTask(task)); // Adiciona tarefas pendentes
    tasks.completed.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item'); // Adiciona a classe para estilo

        // Cria o checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Marca como concluída
        checkbox.disabled = true; // Desabilita o checkbox para tarefas concluídas

        const taskText = document.createElement('span');
        taskText.textContent = task;

        // Cria o botão de excluir
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '&#129530'; // Ícone de lixeira (🗑️)
        deleteButton.addEventListener('click', function () {
            document.getElementById('completed-tasks').removeChild(listItem); // Remove a tarefa concluída
            saveTasks(); // Salva automaticamente as tarefas após excluir
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(deleteButton); // Adiciona o botão de excluir
        document.getElementById('completed-tasks').appendChild(listItem); // Adiciona à lista de concluídas
    }); // Adiciona tarefas concluídas
});

// Carregar tarefas ao iniciar
window.onload = () => {
    electron.send('load-tasks');
};
