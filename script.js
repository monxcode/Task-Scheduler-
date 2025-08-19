const taskList = document.getElementById('taskList');
const placeholderText = document.getElementById('placeholderText');
const popup = document.getElementById('popup');
const addTaskBtn = document.getElementById('addTaskBtn');
const modal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const removeBtn = document.getElementById('removeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const nameInput = document.getElementById('taskName');
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const descInput = document.getElementById('taskDesc');
const searchInput = document.getElementById('searchTask');
const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');

const praiseMessages = [
  "🌟 Excellent!", "🔥 Amazing!", "👍 Great Job!", "💪 Keep Going!",
  "🎯 Nailed It!", "🏆 Fantastic!", "✨ Superb!", "👏 Wonderful!",
  "🎉 Awesome!", "💥 Brilliant!"
];

let tasks = JSON.parse(localStorage.getItem('customTasks') || '[]');
let editIndex = null;

function saveToStorage() {
  localStorage.setItem('customTasks', JSON.stringify(tasks));
}

function showPopup(msg) {
  popup.textContent = msg;
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 3000);
}
// Reorder tasks: incomplete first, complete last, then by start time
tasks.sort((a, b) => {
    // First: incomplete on top
    if (a.done !== b.done) return a.done - b.done;

    // Then: sort by start time
    const timeA = a.start ? a.start : '99:99'; // agar start time missing ho to last me
    const timeB = b.start ? b.start : '99:99';
    return timeA.localeCompare(timeB);
});
function renderTasks() {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    placeholderText.style.display = "block";
  } else {
    placeholderText.style.display = "none";
  }

  tasks.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'task-card';

    const header = document.createElement('div');
    header.className = 'task-header';

    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done || false;

    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = t.name;
    if (checkbox.checked) text.classList.add('completed');

checkbox.addEventListener('change', (e) => {
    e.stopPropagation();

    // Update done status
    t.done = checkbox.checked;

    if (checkbox.checked) {
        text.classList.add('completed');
        const msg = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
        showPopup(msg);
        successSound.play();
    } else {
        text.classList.remove('completed');
    }

    // Reorder tasks: incomplete on top, complete at bottom
    tasks.sort((a, b) => a.done - b.done);

    saveToStorage();
    renderTasks();
});

    left.appendChild(checkbox);
    left.appendChild(text);

    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = t.end ? `${formatTime(t.start)} - ${formatTime(t.end)}` : formatTime(t.start);

    header.appendChild(left);
    header.appendChild(time);

    const desc = document.createElement('div');
    desc.className = 'task-desc';
    desc.textContent = t.desc;

    card.appendChild(header);
    card.appendChild(desc);

    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        card.classList.toggle('expand');
      }
    });

    card.addEventListener('dblclick', () => {
      openModal('edit', i);
    });

    taskList.appendChild(card);
  });
}

function formatTime(time) {
  if (!time) return '';
  let [hour, minute] = time.split(':');
  hour = parseInt(hour);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function openModal(mode, index=null) {
  modal.style.display = 'flex';
  if (mode === 'add') {
    modalTitle.textContent = 'Add Task';
    saveBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    removeBtn.style.display = 'none';
    nameInput.value = '';
    startInput.value = '';
    endInput.value = '';
    descInput.value = '';
  } else {
    modalTitle.textContent = 'Edit Task';
    saveBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    removeBtn.style.display = 'inline-block';
    const t = tasks[index];
    nameInput.value = t.name;
    startInput.value = t.start;
    endInput.value = t.end || '';
    descInput.value = t.desc;
    editIndex = index;
  }
}

addTaskBtn.addEventListener('click', () => { 
  clickSound.play(); 
  openModal('add'); 
  showPopup("Add Task"); 
});
cancelBtn.addEventListener('click', () => modal.style.display = 'none');

// Save Task
saveBtn.addEventListener('click', () => {
  const taskName = nameInput.value.trim(); // Arrow removed
  const start = startInput.value.trim();
  const end = endInput.value.trim();
  const desc = descInput.value.trim();

  if (!taskName || !start) { 
      showPopup('Please fill Task Name & Start Time'); 
      return; 
  }

  tasks.push({name: taskName, start, end, desc, done: false});
  saveToStorage();
  renderTasks();
  modal.style.display = 'none';
  successSound.play();
  showPopup('✎ Task Added');
});

// Update Task
updateBtn.addEventListener('click', () => {
  const updatedName = nameInput.value.trim(); // Arrow removed
  const start = startInput.value.trim();
  const end = endInput.value.trim();
  const desc = descInput.value.trim();

  if (!updatedName || !start) { 
      showPopup('Please fill Task Name & Start Time'); 
      return; 
  }

  tasks[editIndex].name = updatedName;
  tasks[editIndex].start = start;
  tasks[editIndex].end = end;
  tasks[editIndex].desc = desc;

  saveToStorage();
  renderTasks();
  modal.style.display = 'none';
  successSound.play();
  showPopup('➟ Task Updated');
});

removeBtn.addEventListener('click', () => {
  tasks.splice(editIndex, 1);
  saveToStorage();
  renderTasks();
  modal.style.display = 'none';
  clickSound.play();
  showPopup('✄ Task Removed');
});

window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; }

// Reset tasks at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    tasks.forEach(t => t.done = false);
    saveToStorage();
    renderTasks();
    showPopup('New Day - Tasks Reset');
  }
}, 60000);

renderTasks();

// Search filter
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    const taskText = card.querySelector('.task-text').textContent.toLowerCase();
    card.style.display = taskText.includes(filter) ? 'block' : 'none';
  });
});

// Live time update
function updateTime() {
  const now = new Date();
  document.getElementById("liveTimer").textContent =
    "⏱ᴄᴜʀʀᴇɴᴛ ᴛɪᴍᴇᯓ " + now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();