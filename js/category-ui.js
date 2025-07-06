// 類別管理 UI 系統
class CategoryUI {
  constructor() {
    this.isModalOpen = false;
    this.editingCategoryId = null;
    
    // 預設圖示選項
    this.availableIcons = [
      '🦴', '❤️', '💊', '🏥', '🔬', '🩺', '📚', '📝', '🧠', '🫀',
      '🫁', '🦷', '👁️', '👂', '🖐️', '🦵', '💉', '🧬', '⚗️',
      '📊', '📈', '📉', '📋', '📌', '📍', '🎯', '💡', '⭐', '✨',
      '🌟', '💫', '🔥', '⚡', '💎', '🎪', '🎨', '🌸', '🍃', '☀️'
    ];
    
    // 預設顏色選項
    this.availableColors = [
      '#FFB3AB', '#F8C8DC', '#D5E8D4', '#81C4E7', '#A3D9B1', 
      '#F28B82', '#D8D8D8', '#FFE4B5', '#E6E6FA', '#98FB98',
      '#87CEEB', '#DDA0DD', '#F0E68C', '#FF69B4', '#20B2AA'
    ];
  }

  // 初始化 UI
  initialize() {
    this.createCategoryModal();
    this.bindEvents();
    console.log('CategoryUI 初始化完成');
  }

  // 建立類別管理 Modal
  createCategoryModal() {
    // 檢查是否已經存在 Modal
    if (document.getElementById('categoryModal')) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'categoryModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    
    modal.innerHTML = 
      '<div class="modal-content category-modal">' +
        '<div class="modal-header">' +
          '<h2>🗂️ 管理類別</h2>' +
          '<button class="close-btn" onclick="window.categoryUI.closeModal()">&times;</button>' +
        '</div>' +
        
        '<div class="modal-body">' +
          '<!-- 新增/編輯類別表單 -->' +
          '<div class="category-form">' +
            '<h3 id="formTitle">新增類別</h3>' +
            '<div class="form-row">' +
              '<label>類別名稱</label>' +
              '<input type="text" id="categoryName" placeholder="輸入類別名稱..." maxlength="20">' +
            '</div>' +
            
            '<div class="form-row">' +
              '<label>選擇圖示</label>' +
              '<div class="icon-selector">' +
                '<div class="selected-icon" id="selectedIcon">📝</div>' +
                '<div class="icon-grid" id="iconGrid">' +
                  this.availableIcons.map(icon => 
                    '<div class="icon-option" data-icon="' + icon + '">' + icon + '</div>'
                  ).join('') +
                '</div>' +
              '</div>' +
            '</div>' +
            
            '<div class="form-row">' +
              '<label>選擇顏色</label>' +
              '<div class="color-selector">' +
                '<div class="selected-color" id="selectedColor" style="background-color: #D8D8D8;"></div>' +
                '<div class="color-grid" id="colorGrid">' +
                  this.availableColors.map(color => 
                    '<div class="color-option" data-color="' + color + '" style="background-color: ' + color + ';"></div>'
                  ).join('') +
                '</div>' +
              '</div>' +
            '</div>' +
            
            '<div class="form-actions">' +
              '<button class="btn btn-success" onclick="window.categoryUI.saveCategory()">' +
                '<span id="saveButtonText">新增類別</span>' +
              '</button>' +
              '<button class="btn btn-secondary" onclick="window.categoryUI.cancelEdit()">取消</button>' +
            '</div>' +
          '</div>' +
          
          '<!-- 現有類別列表 -->' +
          '<div class="categories-list">' +
            '<h3>現有類別</h3>' +
            '<div id="categoriesContainer">' +
              '<!-- 類別項目會在這裡動態生成 -->' +
            '</div>' +
            
            '<div class="list-actions">' +
              '<button class="btn btn-info btn-small" onclick="window.categoryUI.exportCategories()">' +
                '📤 匯出類別' +
              '</button>' +
              '<button class="btn btn-info btn-small" onclick="window.categoryUI.importCategories()">' +
                '📥 匯入類別' +
              '</button>' +
              '<button class="btn btn-warning btn-small" onclick="window.categoryUI.resetCategories()">' +
                '🔄 重設預設' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(modal);
    
    // 建立隱藏的檔案輸入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'categoryFileInput';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = (e) => this.handleFileUpload(e);
    document.body.appendChild(fileInput);
  }

  // 綁定事件
  bindEvents() {
    // 圖示和顏色選擇事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('icon-option')) {
        this.selectIcon(e.target.dataset.icon);
      }
      
      if (e.target.classList.contains('color-option')) {
        this.selectColor(e.target.dataset.color);
      }
    });

    // 鍵盤事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
  }

  // 開啟類別管理 Modal
  openModal() {
    const modal = document.getElementById('categoryModal');
    if (!modal) {
      console.error('找不到類別管理 Modal');
      return;
    }
    
    modal.style.display = 'flex';
    this.isModalOpen = true;
    this.refreshCategoriesList();
    this.resetForm();
    
    // 聚焦到名稱輸入框
    setTimeout(() => {
      const nameInput = document.getElementById('categoryName');
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  }

  // 關閉 Modal
  closeModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.isModalOpen = false;
    this.cancelEdit();
  }

  // 重新整理類別列表
  refreshCategoriesList() {
    const container = document.getElementById('categoriesContainer');
    if (!container || !window.categoryManager) {
      return;
    }
    
    const categories = window.categoryManager.getAllCategories();
    
    container.innerHTML = categories.map(category => 
      '<div class="category-item" data-id="' + category.id + '">' +
        '<div class="category-info">' +
          '<span class="category-icon" style="color: ' + category.color + ';">' + category.icon + '</span>' +
          '<span class="category-name">' + category.name + '</span>' +
        '</div>' +
        '<div class="category-actions">' +
          '<button class="btn btn-small btn-edit" onclick="window.categoryUI.editCategory(' + category.id + ')">' +
            '✏️ 編輯' +
          '</button>' +
          '<button class="btn btn-small btn-delete" onclick="window.categoryUI.deleteCategory(' + category.id + ')">' +
            '🗑️ 刪除' +
          '</button>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  // 選擇圖示
  selectIcon(icon) {
    const selectedIcon = document.getElementById('selectedIcon');
    if (selectedIcon) {
      selectedIcon.textContent = icon;
    }
    
    // 更新選中狀態
    document.querySelectorAll('.icon-option').forEach(el => {
      el.classList.remove('selected');
    });
    const iconOption = document.querySelector('[data-icon="' + icon + '"]');
    if (iconOption) {
      iconOption.classList.add('selected');
    }
  }

  // 選擇顏色
  selectColor(color) {
    const selectedColor = document.getElementById('selectedColor');
    if (selectedColor) {
      selectedColor.style.backgroundColor = color;
    }
    
    // 更新選中狀態
    document.querySelectorAll('.color-option').forEach(el => {
      el.classList.remove('selected');
    });
    const colorOption = document.querySelector('[data-color="' + color + '"]');
    if (colorOption) {
      colorOption.classList.add('selected');
    }
  }

  // 重設表單
  resetForm() {
    const nameInput = document.getElementById('categoryName');
    if (nameInput) {
      nameInput.value = '';
    }
    
    this.selectIcon('📝');
    this.selectColor('#D8D8D8');
    
    const formTitle = document.getElementById('formTitle');
    const saveButtonText = document.getElementById('saveButtonText');
    
    if (formTitle) formTitle.textContent = '新增類別';
    if (saveButtonText) saveButtonText.textContent = '新增類別';
    
    this.editingCategoryId = null;
  }

  // 編輯類別
  editCategory(categoryId) {
    if (!window.categoryManager) return;
    
    const category = window.categoryManager.getCategoryById(categoryId);
    if (!category) return;

    this.editingCategoryId = categoryId;
    
    const nameInput = document.getElementById('categoryName');
    if (nameInput) {
      nameInput.value = category.name;
    }
    
    this.selectIcon(category.icon);
    this.selectColor(category.color);
    
    const formTitle = document.getElementById('formTitle');
    const saveButtonText = document.getElementById('saveButtonText');
    
    if (formTitle) formTitle.textContent = '編輯類別';
    if (saveButtonText) saveButtonText.textContent = '更新類別';
    
    // 滾動到表單
    const categoryForm = document.querySelector('.category-form');
    if (categoryForm) {
      categoryForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 儲存類別
  saveCategory() {
    const nameInput = document.getElementById('categoryName');
    const selectedIcon = document.getElementById('selectedIcon');
    const selectedColor = document.getElementById('selectedColor');
    
    if (!nameInput || !selectedIcon || !selectedColor) {
      this.showMessage('表單元素不存在', 'error');
      return;
    }
    
    const name = nameInput.value.trim();
    const icon = selectedIcon.textContent;
    const color = selectedColor.style.backgroundColor;
    
    if (!name) {
      this.showMessage('請輸入類別名稱', 'error');
      return;
    }

    if (!window.categoryManager) {
      this.showMessage('類別管理器未初始化', 'error');
      return;
    }

    try {
      if (this.editingCategoryId) {
        // 編輯現有類別
        window.categoryManager.editCategory(this.editingCategoryId, name, icon, color);
        this.showMessage('類別已更新', 'success');
      } else {
        // 新增類別
        window.categoryManager.addCategory(name, icon, color);
        this.showMessage('類別已新增', 'success');
      }
      
      this.refreshCategoriesList();
      this.resetForm();
      window.categoryManager.updateCategorySelect();
      
      // 更新篩選按鈕
      if (typeof window.updateFilterButtons === 'function') {
        window.updateFilterButtons();
      }
      
      // 更新筆記顯示
      if (typeof renderNotes === 'function') {
        renderNotes();
      }
      
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  // 刪除類別
  deleteCategory(categoryId) {
    if (!window.categoryManager) return;
    
    const category = window.categoryManager.getCategoryById(categoryId);
    if (!category) return;

    if (confirm('確定要刪除「' + category.name + '」類別嗎？\n使用此類別的筆記將改為「其他」類別。')) {
      try {
        window.categoryManager.deleteCategory(categoryId);
        this.showMessage('類別已刪除', 'success');
        this.refreshCategoriesList();
        window.categoryManager.updateCategorySelect();
        
        // 更新篩選按鈕
        if (typeof window.updateFilterButtons === 'function') {
          window.updateFilterButtons();
        }
        
        // 更新筆記顯示
        if (typeof renderNotes === 'function') {
          renderNotes();
        }
        
      } catch (error) {
        this.showMessage(error.message, 'error');
      }
    }
  }

  // 取消編輯
  cancelEdit() {
    this.resetForm();
  }

  // 重設類別
  resetCategories() {
    if (confirm('確定要重設為預設類別嗎？這將刪除所有自訂類別。')) {
      if (window.categoryManager) {
        window.categoryManager.resetToDefault();
        this.refreshCategoriesList();
        window.categoryManager.updateCategorySelect();
        
        if (typeof window.updateFilterButtons === 'function') {
          window.updateFilterButtons();
        }
        
        this.showMessage('已重設為預設類別', 'success');
        
        // 更新筆記顯示
        if (typeof renderNotes === 'function') {
          renderNotes();
        }
      }
    }
  }

  // 匯出類別
  exportCategories() {
    if (window.categoryManager) {
      window.categoryManager.exportCategories();
      this.showMessage('類別設定已匯出', 'success');
    }
  }

  // 匯入類別
  importCategories() {
    const fileInput = document.getElementById('categoryFileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  // 處理檔案上傳
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      this.showMessage('請選擇 JSON 格式的檔案', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const success = window.categoryManager.importCategories(data);
        
        if (success) {
          this.refreshCategoriesList();
          this.showMessage('類別設定匯入成功', 'success');
          
          // 更新筆記顯示
          if (typeof renderNotes === 'function') {
            renderNotes();
          }
        } else {
          this.showMessage('匯入失敗，請檢查檔案格式', 'error');
        }
      } catch (error) {
        this.showMessage('檔案格式錯誤', 'error');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  }

  // 顯示訊息
  showMessage(message, type) {
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      // 備用提示方式
      console.log(type.toUpperCase() + ':', message);
      if (type === 'error') {
        alert('錯誤: ' + message);
      }
    }
  }
}