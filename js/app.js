// 全域變數
let notesManager;
let darkMode = false;

// 初始化應用程式
function initializeApp() {
  notesManager = new NotesManager();
  notesManager.initialize();
  
  // 載入主題設定
  loadThemeSettings();
  
  // 渲染初始內容
  renderNotes();
  updateStats();
  
  // 綁定事件監聽器
  bindEventListeners();
  
  console.log('Miruku Notes 應用程式已初始化');
}

// 綁定事件監聽器
function bindEventListeners() {
  // 表單提交事件
  const form = document.querySelector('.note-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      saveNote();
    });
  }

  // 鍵盤快捷鍵
  document.addEventListener('keydown', function(e) {
    // Ctrl+S 儲存筆記
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveNote();
    }
    
    // Escape 取消編輯
    if (e.key === 'Escape') {
      clearForm();
    }
  });

  // 搜尋輸入事件
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      searchNotes();
    }, 300));
  }
}

// 防抖函數
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 儲存筆記
function saveNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const category = document.getElementById("noteCategory").value;
  
  if (!title || !content) {
    showNotification("請輸入標題和內容！", "error");
    return;
  }

  try {
    if (notesManager.editId) {
      // 更新現有筆記
      const updated = notesManager.updateNote(notesManager.editId, title, content, category);
      if (updated) {
        showNotification("筆記已更新！", "success");
      }
      notesManager.editId = null;
      document.getElementById("clearBtn").style.display = "none";
    } else {
      // 新增筆記
      const newNote = notesManager.addNote(title, content, category);
      if (newNote) {
        showNotification("筆記已儲存！", "success");
      }
    }

    clearForm();
    renderNotes();
    updateStats();
  } catch (error) {
    console.error('儲存筆記失敗:', error);
    showNotification("儲存失敗，請重試！", "error");
  }
}

// 刪除筆記
function deleteNote(id) {
  if (confirm("確定要刪除這筆記錄嗎？")) {
    try {
      const deleted = notesManager.deleteNote(id);
      if (deleted) {
        showNotification("筆記已刪除！", "success");
        renderNotes();
        updateStats();
      }
    } catch (error) {
      console.error('刪除筆記失敗:', error);
      showNotification("刪除失敗，請重試！", "error");
    }
  }
}

// 編輯筆記
function editNote(id) {
  const note = notesManager.getNote(id);
  if (!note) return;
  
  document.getElementById("noteTitle").value = note.title;
  document.getElementById("noteContent").value = note.content;
  document.getElementById("noteCategory").value = note.category;
  document.getElementById("clearBtn").style.display = "inline-block";
  notesManager.editId = id;
  
  // 滾動到表單
  document.querySelector('.note-form').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
  
  // 聚焦到標題欄位
  document.getElementById("noteTitle").focus();
}

// 清除表單
function clearForm() {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("noteCategory").value = "解剖學";
  document.getElementById("clearBtn").style.display = "none";
  notesManager.editId = null;
}

// 搜尋筆記
function searchNotes() {
  const query = document.getElementById("searchInput").value;
  notesManager.searchNotes(query);
  renderNotes();
  
  // 更新搜尋結果提示
  const resultsCount = notesManager.getFilteredNotes().length;
  if (query.trim()) {
    showNotification(`找到 ${resultsCount} 筆相關記錄`, "info");
  }
}

// 依分類篩選
function filterByCategory(category) {
  notesManager.filterByCategory(category);
  renderNotes();
  
  // 更新篩選按鈕狀態
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
}

// 更新統計資料
function updateStats() {
  const stats = notesManager.getStats();
  
  document.getElementById("totalNotes").textContent = stats.total;
  document.getElementById("todayNotes").textContent = stats.today;
  document.getElementById("favoriteCategory").textContent = stats.favorite;
}

// 渲染筆記列表
function renderNotes() {
  const container = document.getElementById("notesContainer");
  const notes = notesManager.getFilteredNotes();
  
  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🌸 ${notesManager.searchQuery ? '沒有找到相關筆記' : '還沒有筆記喔！'}</h3>
        <p>${notesManager.searchQuery ? '試試其他關鍵字' : '開始記錄你的第一筆醫學筆記吧～'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(note => createNoteCard(note)).join("");
}

// 建立筆記卡片
function createNoteCard(note) {
  const date = new Date(note.date);
  const formattedDate = date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="note-card" data-id="${note.id}">
      <div class="note-title">${getCategoryIcon(note.category)} ${escapeHtml(note.title)}</div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-meta">
        <span>📅 ${formattedDate}</span>
        <span class="category-badge">${note.category}</span>
      </div>
      <div style="text-align: right;">
        <button class="btn btn-small btn-edit" onclick="editNote(${note.id})">✏️ 編輯</button>
        <button class="btn btn-small btn-delete" onclick="deleteNote(${note.id})">🗑️ 刪除</button>
      </div>
    </div>
  `;
}

// HTML 轉義函數
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 切換深色模式
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  
  // 儲存主題設定
  localStorage.setItem('miruku-theme', darkMode ? 'dark' : 'light');
  
  showNotification(`已切換至${darkMode ? '深色' : '淺色'}模式`, "info");
}

// 載入主題設定
function loadThemeSettings() {
  const savedTheme = localStorage.getItem('miruku-theme');
  if (savedTheme === 'dark') {
    darkMode = true;
    document.body.classList.add("dark-mode");
  }
}

// 顯示通知
function showNotification(message, type = "info") {
  // 移除現有通知
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 建立新通知
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // 通知樣式
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;

  // 根據類型設定顏色
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;

  // 新增到頁面
  document.body.appendChild(notification);

  // 3秒後自動移除
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

// 匯出筆記
function exportNotes() {
  try {
    notesManager.exportNotes();
    showNotification("筆記匯出成功！", "success");
  } catch (error) {
    console.error('匯出失敗:', error);
    showNotification("匯出失敗，請重試！", "error");
  }
}

// 匯入筆記
function importNotes() {
  document.getElementById('fileInput').click();
}

// 處理檔案上傳
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.json')) {
    showNotification("請選擇 JSON 格式的檔案！", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = e.target.result;
      const success = notesManager.importNotes(data);
      
      if (success) {
        renderNotes();
        updateStats();
        showNotification("筆記匯入成功！", "success");
      } else {
        showNotification("匯入失敗，請檢查檔案格式！", "error");
      }
    } catch (error) {
      console.error('匯入失敗:', error);
      showNotification("檔案格式錯誤！", "error");
    }
  };
  
  reader.readAsText(file);
  
  // 清除檔案輸入
  event.target.value = '';
}