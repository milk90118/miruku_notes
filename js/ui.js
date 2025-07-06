// UI 互動管理系統
class UIManager {
  constructor() {
    this.currentTheme = 'default';
    this.isDarkMode = false;
    this.themes = ['default', 'milktea', 'lavender', 'matcha', 'peach', 'cloud'];
  }

  // 初始化 UI
  initialize() {
    this.loadUISettings();
    this.createThemeSelector();
    this.bindUIEvents();
    this.setupTooltips();
  }

  // 載入 UI 設定
  loadUISettings() {
    const savedTheme = localStorage.getItem('miruku-ui-theme');
    const savedDarkMode = localStorage.getItem('miruku-theme');
    
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.setTheme(savedTheme);
    }
    
    if (savedDarkMode === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  // 建立主題選擇器
  createThemeSelector() {
    const header = document.querySelector('header');
    if (!header) return;

    const themeSelector = document.createElement('div');
    themeSelector.className = 'theme-selector';
    themeSelector.innerHTML = `
      <div class="theme-controls">
        <span style="color: white; margin-right: 1rem;">🎨 選擇主題：</span>
        ${this.themes.map(theme => `
          <button class="theme-btn ${theme} ${theme === this.currentTheme ? 'active' : ''}" 
                  onclick="uiManager.setTheme('${theme}')"
                  title="${this.getThemeName(theme)}"
                  aria-label="切換到${this.getThemeName(theme)}">
          </button>
        `).join('')}
      </div>
    `;

    header.appendChild(themeSelector);
  }

  // 取得主題名稱
  getThemeName(theme) {
    const names = {
      default: '櫻花粉主題',
      milktea: '奶茶拿鐵',
      lavender: '薰衣草奶昔',
      matcha: '抹茶奶霜',
      peach: '蜜桃奶昔',
      cloud: '雲朵米色'
    };
    return names[theme] || theme;
  }

  // 設定主題
  setTheme(themeName) {
    if (!this.themes.includes(themeName)) return;

    // 移除舊主題
    this.themes.forEach(theme => {
      document.body.classList.remove(`theme-${theme}`);
    });

    // 套用新主題
    if (themeName !== 'default') {
      document.body.classList.add(`theme-${themeName}`);
    }

    this.currentTheme = themeName;
    localStorage.setItem('miruku-ui-theme', themeName);

    // 更新主題按鈕狀態
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.theme-btn.${themeName}`)?.classList.add('active');

    // 顯示主題切換通知
    showNotification(`已切換到${this.getThemeName(themeName)}`, 'info');
  }

  // 綁定 UI 事件
  bindUIEvents() {
    // 表單驗證
    this.setupFormValidation();
    
    // 鍵盤導航
    this.setupKeyboardNavigation();
    
    // 拖拽排序（未來功能）
    this.setupDragAndDrop();
    
    // 自動儲存
    this.setupAutoSave();
  }

  // 設定表單驗證
  setupFormValidation() {
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    if (titleInput) {
      titleInput.addEventListener('blur', () => {
        this.validateField(titleInput, '請輸入筆記標題');
      });
    }

    if (contentInput) {
      contentInput.addEventListener('blur', () => {
        this.validateField(contentInput, '請輸入筆記內容');
      });
    }
  }

  // 驗證欄位
  validateField(field, message) {
    const value = field.value.trim();
    const isValid = value.length > 0;

    field.classList.toggle('error', !isValid);
    
    // 移除現有錯誤訊息
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // 顯示錯誤訊息
    if (!isValid) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = message;
      errorElement.style.cssText = `
        color: var(--danger);
        font-size: 0.85rem;
        margin-top: 0.25rem;
      `;
      field.parentNode.appendChild(errorElement);
    }

    return isValid;
  }

  // 設定鍵盤導航
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab 導航增強
      if (e.key === 'Tab') {
        this.highlightFocusedElement();
      }

      // 快捷鍵
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
            break;
          case 'n':
            e.preventDefault();
            document.getElementById('noteTitle')?.focus();
            break;
          case 'e':
            if (e.shiftKey) {
              e.preventDefault();
              exportNotes();
            }
            break;
        }
      }
    });
  }

  // 高亮聚焦元素
  highlightFocusedElement() {
    document.querySelectorAll('.focus-highlight').forEach(el => {
      el.classList.remove('focus-highlight');
    });

    setTimeout(() => {
      const focused = document.activeElement;
      if (focused && focused !== document.body) {
        focused.classList.add('focus-highlight');
      }
    }, 10);
  }

  // 設定拖拽排序（預留功能）
  setupDragAndDrop() {
    // 未來可以實現筆記拖拽排序
    console.log('拖拽排序功能待實現');
  }

  // 設定自動儲存
  setupAutoSave() {
    let autoSaveTimer;
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    const autoSave = () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        const title = titleInput?.value.trim();
        const content = contentInput?.value.trim();
        
        if (title && content && notesManager.editId) {
          // 自動儲存編輯中的筆記
          const category = document.getElementById('noteCategory').value;
          notesManager.updateNote(notesManager.editId, title, content, category);
          this.showAutoSaveIndicator();
        }
      }, 3000); // 3秒後自動儲存
    };

    titleInput?.addEventListener('input', autoSave);
    contentInput?.addEventListener('input', autoSave);
  }

  // 顯示自動儲存指示器
  showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.textContent = '✓ 已自動儲存';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: var(--success);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(indicator);

    setTimeout(() => {
      indicator.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }

  // 設定工具提示
  setupTooltips() {
    // 為按鈕新增工具提示
    const tooltips = {
      '#noteTitle': '輸入筆記標題（Ctrl+N 快速聚焦）',
      '#noteContent': '輸入筆記內容，支援多行文字',
      '#searchInput': '搜尋筆記標題或內容（Ctrl+F 快速聚焦）',
      '.btn-dark-mode': '切換深色/淺色模式',
      '.btn[onclick="exportNotes()"]': '匯出所有筆記為 JSON 檔案（Ctrl+Shift+E）',
      '.btn[onclick="importNotes()"]': '從 JSON 檔案匯入筆記'
    };

    Object.entries(tooltips).forEach(([selector, text]) => {
      const element = document.querySelector(selector);
      if (element) {
        element.title = text;
      }
    });
  }

  // 顯示載入狀態
  showLoading(element, text = '載入中...') {
    const originalText = element.textContent;
    element.textContent = text;
    element.disabled = true;
    element.classList.add('loading');

    return () => {
      element.textContent = originalText;
      element.disabled = false;
      element.classList.remove('loading');
    };
  }

  // 確認對話框
  confirm(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>確認操作</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="btn btn-delete" onclick="this.closest('.modal-overlay').remove(); (${onCancel || (() => {})})()">取消</button>
          <button class="btn btn-success" onclick="this.closest('.modal-overlay').remove(); (${onConfirm})()">確認</button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;

    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    if (document.body.classList.contains('dark-mode')) {
      content.style.background = 'var(--dark-card)';
      content.style.color = 'var(--dark-text)';
    }

    document.body.appendChild(modal);
  }

  // 取得使用者偏好設定
  getUserPreferences() {
    return {
      theme: this.currentTheme,
      darkMode: this.isDarkMode,
      autoSave: localStorage.getItem('miruku-auto-save') !== 'false',
      notifications: localStorage.getItem('miruku-notifications') !== 'false'
    };
  }

  // 設定使用者偏好
  setUserPreference(key, value) {
    localStorage.setItem(`miruku-${key}`, value);
  }
}

// 建立 UI 管理器實例
let uiManager;

// 在 DOM 載入完成後初始化 UI 管理器
document.addEventListener('DOMContentLoaded', function() {
  uiManager = new UIManager();
  uiManager.initialize();
});

// 增強原有的切換深色模式功能
function toggleDarkMode() {
  uiManager.isDarkMode = !uiManager.isDarkMode;
  document.body.classList.toggle("dark-mode", uiManager.isDarkMode);
  
  // 儲存設定
  localStorage.setItem('miruku-theme', uiManager.isDarkMode ? 'dark' : 'light');
  
  showNotification(`已切換至${uiManager.isDarkMode ? '深色' : '淺色'}模式`, "info");
}

// CSS 樣式補充
const additionalStyles = `
<style>
.focus-highlight {
  box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.4) !important;
}

.error {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.2) !important;
}

.error-message {
  animation: fadeIn 0.3s ease-out;
}

.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: fadeIn 0.3s ease-out 0.1s both;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
`;

// 將額外樣式加入頁面
document.head.insertAdjacentHTML('beforeend', additionalStyles);