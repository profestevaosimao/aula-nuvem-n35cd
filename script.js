// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const itemsLeftCount = document.getElementById('items-left-count');
const totalCount = document.getElementById('total-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// Modal Elements
const messageModal = document.getElementById('message-modal');
const modalContent = document.getElementById('modal-content');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

// State Management
let tasks = JSON.parse(localStorage.getItem('modern_tasks')) || [
  {
    id: 1,
    text: 'Configurar ambiente de trabalho',
    category: 'Trabalho',
    priority: 'alta',
    completed: true,
  },
  {
    id: 2,
    text: 'Estudar desenvolvimento web moderno',
    category: 'Estudos',
    priority: 'media',
    completed: false,
  },
  {
    id: 3,
    text: 'Comprar itens para o jantar',
    category: 'Compras',
    priority: 'baixa',
    completed: false,
  },
];
let currentFilter = 'all';

// Helper: Custom Message Box (Replaces alert)
function showMessage(title, message, type = 'success') {
  modalTitle.textContent = title;
  modalMessage.textContent = message;

  if (type === 'success') {
    modalIcon.className =
      'w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl mb-3 bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400';
    modalIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
  } else {
    modalIcon.className =
      'w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl mb-3 bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400';
    modalIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  }

  messageModal.classList.remove('hidden');
  setTimeout(() => {
    messageModal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
  }, 10);
}

function closeModal() {
  messageModal.classList.add('opacity-0');
  modalContent.classList.remove('scale-100');
  modalContent.classList.add('scale-95');
  setTimeout(() => {
    messageModal.classList.add('hidden');
  }, 300);
}

modalCloseBtn.addEventListener('click', closeModal);
messageModal.addEventListener('click', (e) => {
  if (e.target === messageModal) closeModal();
});

// Theme Switcher Initialization
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
});

// Save to LocalStorage
function saveTasks() {
  localStorage.setItem('modern_tasks', JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
  tasksContainer.innerHTML = '';

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
  } else {
    emptyState.classList.remove('flex');
    emptyState.classList.add('hidden');

    filteredTasks.forEach((task) => {
      const taskEl = document.createElement('div');
      taskEl.className = `task-item p-3.5 flex items-center justify-between gap-3 group transition-all hover:bg-gray-50/80 dark:hover:bg-gray-700/30 rounded-xl`;

      // Priority Badge colors
      let priorityColor =
        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
      if (task.priority === 'alta')
        priorityColor =
          'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      if (task.priority === 'media')
        priorityColor =
          'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      if (task.priority === 'baixa')
        priorityColor =
          'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';

      taskEl.innerHTML = `
                   <div class="flex items-center gap-3 flex-1 min-w-0">
                       <button onclick="toggleTask(${
                         task.id
                       })" class="w-5 h-5 rounded-full border-2 ${
        task.completed
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'
      } flex items-center justify-center transition-all flex-shrink-0">
                           ${
                             task.completed
                               ? '<i class="fa-solid fa-check text-[10px]"></i>'
                               : ''
                           }
                       </button>
                       <div class="flex flex-col min-w-0">
                           <span class="text-sm truncate ${
                             task.completed
                               ? 'line-through text-gray-400 dark:text-gray-500'
                               : 'text-gray-700 dark:text-gray-200 font-medium'
                           }">${escapeHtml(task.text)}</span>
                           <div class="flex items-center gap-2 mt-0.5">
                               <span class="text-[10px] px-2 py-0.5 rounded-md font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">${escapeHtml(
                                 task.category
                               )}</span>
                               <span class="text-[10px] px-2 py-0.5 rounded-md font-medium ${priorityColor} capitalize">${
        task.priority
      }</span>
                           </div>
                       </div>
                   </div>
                   <button onclick="deleteTask(${
                     task.id
                   })" aria-label="Excluir tarefa" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-lg transition-all focus:opacity-100">
                       <i class="fa-solid fa-trash-can text-sm"></i>
                   </button>
               `;
      tasksContainer.appendChild(taskEl);
    });
  }

  // Update Counters
  const leftCount = tasks.filter((t) => !t.completed).length;
  itemsLeftCount.textContent = leftCount;
  totalCount.textContent = tasks.length;
}

// Helper to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Add Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    category: taskCategory.value,
    priority: taskPriority.value,
    completed: false,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
});

// Toggle Task Completion
window.toggleTask = function (id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
};

// Delete Task
window.deleteTask = function (id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
};

// Clear Completed Tasks
clearCompletedBtn.addEventListener('click', () => {
  const initialLength = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  if (tasks.length === initialLength) {
    showMessage('Aviso', 'Não há tarefas concluídas para remover.', 'error');
    return;
  }
  saveTasks();
  renderTasks();
  showMessage(
    'Sucesso',
    'Tarefas concluídas foram limpas com sucesso!',
    'success'
  );
});

// Filter Handling
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => {
      b.classList.remove('bg-emerald-500', 'text-white', 'shadow-sm');
      b.classList.add('text-gray-600', 'dark:text-gray-400');
    });
    btn.classList.add('bg-emerald-500', 'text-white', 'shadow-sm');
    btn.classList.remove('text-gray-600', 'dark:text-gray-400');

    currentFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

// Initial Load Render
renderTasks();
