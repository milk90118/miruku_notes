// UI 互動管理系統
class UIManager {
  constructor() {
    this.currentTheme = 'default';
    this.currentFont = 'zen';
    this.isDarkMode = false;
    this.themes = ['default', 'milktea', 'lavender', 'matcha', 'peach', 'cloud'];
    this.fonts = [
      { id: 'zen', name: '禪圓體', family: 'Zen Maru Gothic' },
      { id: 'kosugi', name: '小杉圓體', family: 'Kosugi Maru' },
      { id: 'mplus', name: 'M+ 圓體', family: 'M PLUS Rounded 1c' },
      { id: 'sawarabi', name: '早蕨黑體', family: 'Sawarabi Gothic' },
      { id: 'noto-sans', name: '思源黑體', family: 'Noto Sans TC' },
      { id: 'noto-serif', name: '思源宋體', family: 'Noto Serif TC' },
      { id: 'quicksand', name: 'Quicksand', family: 'Quicksand' },
      { id: 'nunito', name: 'Nunito', family: 'Nunito' },
      { id: 'comfortaa', name: 'Comfortaa', family: 'Comfortaa' },
      { id: 'fredoka', name: 'Fredoka', family: 'Fredoka' },
      { id: 'varela', name: 'Varela Round', family: 'Varela Round' },
      { id: 'poppins', name: 'Poppins', family: 'Poppins' }
    ];
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
    const savedFont = localStorage.getItem('miruku-ui-font');
    const savedDarkMode = localStorage.getItem('miruku-theme');
    
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.setTheme(savedTheme);
    }
    
    if (savedFont && this.fonts.some(function(f) { return f.id === savedFont; })) {
      this.setFont(savedFont, false);
    } else {
      // 設定預設字體
      this.setFont('zen', false);
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

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'ui-controls';
    
    const self = this;
    
    controlsContainer.innerHTML = 
      '<div class="theme-controls">' +
        '<span class="control-label">🎨 主題：</span>' +
        this.themes.map(function(theme) {
          return '<button class="theme-btn ' + theme + (theme === self.currentTheme ? ' active' : '') + '" ' +
                 'onclick="uiManager.setTheme(\'' + theme + '\')" ' +
                 'title="' + self.getThemeName(theme) + '" ' +
                 'aria-label="切換到' + self.getThemeName(theme) + '">' +
                 '</button>';
        }).join('') +
      '</div>' +
      '<div class="font-controls">' +
        '<span class="control-label">✨ 字體：</span>' +
        '<select class="font-selector" onchange="uiManager.setFont(this.value)" onfocus="uiManager.showFontPreview()" onblur="uiManager.hideFontPreview()">' +
          this.fonts.map(function(font) {
            return '<option value="' + font.id + '"' + (font.id === self.currentFont ? ' selected' : '') + 
                   ' style="font-family: ' + font.family + '">' +
                   font.name +
                   '</option>';
          }).join('') +
        '</select>' +
        '<div class="font-preview" style="display: none;">' +
          '<span class="preview-text">醫學筆記 Medical Notes ✨</span>' +
        '</div>' +
      '</div>';

    header.appendChild(controlsContainer);
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

  // 設定字體
  setFont(fontId, shouldShowNotification) {
    if (typeof shouldShowNotification === 'undefined') {
      shouldShowNotification = true;
    }
    
    const font = this.fonts.find(function(f) { return f.id === fontId; });
    if (!font) return;

    // 移除所有字體類別
    const self = this;
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    
    // 套用新字體類別
    document.body.classList.add('font-' + fontId);

    this.currentFont = fontId;
    localStorage.setItem('miruku-ui-font', fontId);

    // 更新字體選擇器
    const fontSelector = document.querySelector('.font-selector');
    if (fontSelector) {
      fontSelector.value = fontId;
    }

    // 強制重新渲染
    document.body.style.fontFamily = font.family;
    setTimeout(function() {
      document.body.style.fontFamily = '';
    }, 10);

    // 顯示字體切換通知
    if (shouldShowNotification) {
      setTimeout(function() {
        if (typeof showNotification === 'function') {
          showNotification('已切換到 ' + font.name + ' 字體', 'info');
        }
      }, 100);
    }
  }

  // 設定主題
  setTheme(themeName) {
    if (this.themes.indexOf(themeName) === -1) return;

    // 移除舊主題
    const self = this;
    this.themes.forEach(function(theme) {
      document.body.classList.remove('theme-' + theme);
    });

    // 套用新主題
    if (themeName !== 'default') {
      document.body.classList.add('theme-' + themeName);
    }

    this.currentTheme = themeName;
    localStorage.setItem('miruku-ui-theme', themeName);

    // 更新主題按鈕狀態
    document.querySelectorAll('.theme-btn').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const currentBtn = document.querySelector('.theme-btn.' + themeName);
    if (currentBtn) {
      currentBtn.classList.add('active');
    }

    // 顯示主題切換通知
    if (typeof showNotification === 'function') {
      showNotification('已切換到' + this.getThemeName(themeName), 'info');
    }
  }

  // 顯示字體預覽
  showFontPreview() {
    const preview = document.querySelector('.font-preview');
    if (preview) {
      preview.style.display = 'block';
      preview.style.animation = 'fadeIn 0.3s ease-out';
    }
  }

  // 隱藏字體預覽
  hideFontPreview() {
    const preview = document.querySelector('.font-preview');
    if (preview) {
      preview.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(function() {
        preview.style.display = 'none';
      }, 300);
    }
  }

  // 綁定事件監聽器
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
      titleInput.addEventListener('blur', function() {
        this.validateField(titleInput, '請輸入筆記標題');
      }.bind(this));
    }

    if (contentInput) {
      contentInput.addEventListener('blur', function() {
        this.validateField(contentInput, '請輸入筆記內容');
      }.bind(this));
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
      errorElement.style.cssText = 
        'color: var(--danger);' +
        'font-size: 0.85rem;' +
        'margin-top: 0.25rem;';
      field.parentNode.appendChild(errorElement);
    }

    return isValid;
  }

  // 設定鍵盤導航
  setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
      // Tab 導航增強
      if (e.key === 'Tab') {
        this.highlightFocusedElement();
      }

      // 快捷鍵
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'n':
            e.preventDefault();
            const noteTitle = document.getElementById('noteTitle');
            if (noteTitle) {
              noteTitle.focus();
            }
            break;
          case 'e':
            if (e.shiftKey) {
              e.preventDefault();
              if (typeof exportNotes === 'function') {
                exportNotes();
              }
            }
            break;
        }
      }
    }.bind(this));
  }

  // 高亮聚焦元素
  highlightFocusedElement() {
    document.querySelectorAll('.focus-highlight').forEach(function(el) {
      el.classList.remove('focus-highlight');
    });

    setTimeout(function() {
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

    const autoSave = function() {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(function() {
        const title = titleInput ? titleInput.value.trim() : '';
        const content = contentInput ? contentInput.value.trim() : '';
        
        if (title && content && window.notesManager && window.notesManager.editId) {
          // 自動儲存編輯中的筆記
          const category = document.getElementById('noteCategory').value;
          window.notesManager.updateNote(window.notesManager.editId, title, content, category);
          this.showAutoSaveIndicator();
        }
      }.bind(this), 3000); // 3秒後自動儲存
    }.bind(this);

    if (titleInput) {
      titleInput.addEventListener('input', autoSave);
    }
    if (contentInput) {
      contentInput.addEventListener('input', autoSave);
    }
  }

  // 顯示自動儲存指示器
  showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.textContent = '✓ 已自動儲存';
    indicator.style.cssText = 
      'position: fixed;' +
      'top: 20px;' +
      'left: 20px;' +
      'background: var(--success);' +
      'color: white;' +
      'padding: 0.5rem 1rem;' +
      'border-radius: 20px;' +
      'font-size: 0.85rem;' +
      'z-index: 1000;' +
      'animation: fadeIn 0.3s ease-out;';

    document.body.appendChild(indicator);

    setTimeout(function() {
      indicator.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(function() {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300);
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
      '.btn[onclick*="exportNotes"]': '匯出所有筆記為 JSON 檔案（Ctrl+Shift+E）',
      '.btn[onclick*="importNotes"]': '從 JSON 檔案匯入筆記'
    };

    Object.keys(tooltips).forEach(function(selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.title = tooltips[selector];
      }
    });
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
    localStorage.setItem('miruku-' + key, value);
  }
}

// 建立 UI 管理器實例
let uiManager = null;

// 在 DOM 載入完成後初始化 UI 管理器
document.addEventListener('DOMContentLoaded', function() {
  // 延遲初始化，確保其他組件先載入
  setTimeout(function() {
    if (!uiManager) {
      console.log('初始化 UI 管理器...');
      uiManager = new UIManager();
      uiManager.initialize();
      
      // 確保字體立即應用
      setTimeout(function() {
        const savedFont = localStorage.getItem('miruku-ui-font') || 'zen';
        document.body.className = document.body.className.replace(/font-\w+/g, '');
        document.body.classList.add('font-' + savedFont);
      }, 50);
    }
  }, 100);
});

// 增強原有的切換深色模式功能
function toggleDarkMode() {
  if (uiManager) {
    uiManager.isDarkMode = !uiManager.isDarkMode;
    document.body.classList.toggle("dark-mode", uiManager.isDarkMode);
    
    // 儲存設定
    localStorage.setItem('miruku-theme', uiManager.isDarkMode ? 'dark' : 'light');
    
    if (typeof showNotification === 'function') {
      showNotification('已切換至' + (uiManager.isDarkMode ? '深色' : '淺色') + '模式', "info");
    }
  }
}