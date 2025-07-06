// 類別管理系統
class CategoryManager {
  constructor() {
    this.categories = [];
    this.storageKey = 'miruku-categories';
    this.defaultCategories = [
      { id: 1, name: '解剖學', icon: '🦴', color: '#FFB3AB' },
      { id: 2, name: '生理學', icon: '❤️', color: '#F8C8DC' },
      { id: 3, name: '藥理學', icon: '💊', color: '#D5E8D4' },
      { id: 4, name: '臨床醫學', icon: '🏥', color: '#81C4E7' },
      { id: 5, name: '病理學', icon: '🔬', color: '#A3D9B1' },
      { id: 6, name: '影像診斷學', icon: '🩺', color: '#F28B82' },
      { id: 7, name: '其他', icon: '📚', color: '#D8D8D8' }
    ];
  }

  // 初始化類別
  initialize() {
    this.loadCategories();
    if (this.categories.length === 0) {
      this.categories = [...this.defaultCategories];
      this.saveCategories();
    }
    console.log('CategoryManager 初始化完成，載入', this.categories.length, '個類別');
  }

  // 載入類別
  loadCategories() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.categories = JSON.parse(saved);
      }
    } catch (error) {
      console.error('載入類別失敗:', error);
      this.categories = [];
    }
  }

  // 儲存類別
  saveCategories() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
    } catch (error) {
      console.error('儲存類別失敗:', error);
    }
  }

  // 取得所有類別
  getAllCategories() {
    return this.categories;
  }

  // 取得類別（依 ID）
  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  // 取得類別（依名稱）
  getCategoryByName(name) {
    return this.categories.find(cat => cat.name === name);
  }

  // 新增類別
  addCategory(name, icon, color) {
    // 檢查名稱是否已存在
    if (this.getCategoryByName(name)) {
      throw new Error('類別名稱已存在');
    }

    const newCategory = {
      id: Date.now(),
      name: name.trim(),
      icon: icon || '📝',
      color: color || '#D8D8D8'
    };

    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  // 編輯類別
  editCategory(id, name, icon, color) {
    const category = this.getCategoryById(id);
    if (!category) {
      throw new Error('找不到該類別');
    }

    // 檢查新名稱是否與其他類別重複
    const existingCategory = this.getCategoryByName(name);
    if (existingCategory && existingCategory.id !== id) {
      throw new Error('類別名稱已存在');
    }

    category.name = name.trim();
    category.icon = icon || category.icon;
    category.color = color || category.color;

    this.saveCategories();
    return category;
  }

  // 刪除類別
  deleteCategory(id) {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('找不到該類別');
    }

    // 檢查是否有筆記使用此類別
    if (typeof window.notesManager !== 'undefined' && window.notesManager) {
      const categoryName = this.categories[index].name;
      const notesWithCategory = window.notesManager.notes.filter(note => note.category === categoryName);
      
      if (notesWithCategory.length > 0) {
        // 將使用此類別的筆記改為"其他"
        notesWithCategory.forEach(note => {
          note.category = '其他';
        });
        window.notesManager.saveNotes();
      }
    }

    const deletedCategory = this.categories.splice(index, 1)[0];
    this.saveCategories();
    return deletedCategory;
  }

  // 重設為預設類別
  resetToDefault() {
    this.categories = [...this.defaultCategories];
    this.saveCategories();
  }

  // 更新筆記表單的類別選單
  updateCategorySelect() {
    const selectElement = document.getElementById('noteCategory');
    if (!selectElement) {
      console.warn('找不到 noteCategory 選單元素');
      return;
    }

    // 記住目前選中的值
    const currentValue = selectElement.value;

    // 清空選單
    selectElement.innerHTML = '';

    // 重新填入類別
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.icon + ' ' + category.name;
      option.style.color = category.color;
      selectElement.appendChild(option);
    });

    // 恢復選中的值（如果還存在）
    if (this.getCategoryByName(currentValue)) {
      selectElement.value = currentValue;
    } else {
      selectElement.value = this.categories[0] ? this.categories[0].name : '';
    }

    console.log('類別選單已更新，共', this.categories.length, '個選項');
  }

  // 取得類別的圖示
  getCategoryIcon(categoryName) {
    const category = this.getCategoryByName(categoryName);
    return category ? category.icon : '📝';
  }

  // 取得類別的顏色
  getCategoryColor(categoryName) {
    const category = this.getCategoryByName(categoryName);
    return category ? category.color : '#D8D8D8';
  }

  // 匯出類別設定
  exportCategories() {
    const data = {
      categories: this.categories,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'miruku-categories-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 匯入類別設定
  importCategories(data) {
    try {
      let importData;
      if (typeof data === 'string') {
        importData = JSON.parse(data);
      } else {
        importData = data;
      }

      if (importData.categories && Array.isArray(importData.categories)) {
        // 驗證類別資料格式
        const validCategories = importData.categories.filter(cat => 
          cat.name && typeof cat.name === 'string'
        ).map(cat => ({
          id: cat.id || Date.now() + Math.random(),
          name: cat.name,
          icon: cat.icon || '📝',
          color: cat.color || '#D8D8D8'
        }));

        this.categories = validCategories;
        this.saveCategories();
        this.updateCategorySelect();
        return true;
      }
      
      throw new Error('無效的類別資料格式');
    } catch (error) {
      console.error('匯入類別失敗:', error);
      return false;
    }
  }
}