// 筆記管理系統
class NotesManager {
  constructor() {
    this.notes = [];
    this.filteredNotes = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.editId = null;
    this.storageKey = 'miruku-notes';
  }

  // 初始化筆記數據
  initialize() {
    this.loadNotes();
    if (this.notes.length === 0) {
      this.loadDefaultNotes();
    }
    this.filteredNotes = [...this.notes];
  }

  // 載入預設筆記
  loadDefaultNotes() {
    const defaultNotes = [
      {
        id: 1,
        title: "心臟解剖結構",
        content: "心臟位於胸腔中縱膈內，由四個腔室組成：\n- 左心房（Left Atrium）\n- 右心房（Right Atrium）\n- 左心室（Left Ventricle）\n- 右心室（Right Ventricle）\n\n重要結構：\n• 二尖瓣（Mitral Valve）\n• 三尖瓣（Tricuspid Valve）\n• 主動脈瓣（Aortic Valve）\n• 肺動脈瓣（Pulmonary Valve）",
        category: "解剖學",
        date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        title: "血壓調節機制",
        content: "血壓調節是維持循環系統穩定的重要機制：\n\n1. 短期調節：\n   - 壓力感受器反射\n   - 化學感受器反射\n\n2. 長期調節：\n   - 腎臟調節機制\n   - 腎素-血管緊張素-醛固酮系統（RAAS）\n   - 抗利尿激素（ADH）",
        category: "生理學",
        date: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 3,
        title: "β-阻斷劑作用機制",
        content: "β-阻斷劑（Beta-blockers）是心血管疾病的重要用藥：\n\n作用機制：\n• 競爭性拮抗β-腎上腺素受體\n• 降低心率和心收縮力\n• 減少心肌耗氧量\n\n臨床應用：\n- 高血壓\n- 心律不整\n- 心絞痛\n- 心肌梗塞後預防\n\n注意事項：\n⚠️ 氣喘患者慎用\n⚠️ 不可突然停藥",
        category: "藥理學",
        date: new Date().toISOString()
      }
    ];
    this.notes = defaultNotes;
    this.saveNotes();
  }

  // 載入筆記
  loadNotes() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.notes = JSON.parse(saved);
      }
    } catch (error) {
      console.error('載入筆記失敗:', error);
      this.notes = [];
    }
  }

  // 儲存筆記
  saveNotes() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    } catch (error) {
      console.error('儲存筆記失敗:', error);
    }
  }

  // 新增筆記
  addNote(title, content, category) {
    const note = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category: category,
      date: new Date().toISOString()
    };
    
    this.notes.unshift(note);
    this.saveNotes();
    this.applyFilters();
    return note;
  }

  // 更新筆記
  updateNote(id, title, content, category) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        title: title.trim(),
        content: content.trim(),
        category: category,
        date: new Date().toISOString()
      };
      this.saveNotes();
      this.applyFilters();
      return this.notes[index];
    }
    return null;
  }

  // 刪除筆記
  deleteNote(id) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      const deletedNote = this.notes.splice(index, 1)[0];
      this.saveNotes();
      this.applyFilters();
      return deletedNote;
    }
    return null;
  }

  // 取得筆記
  getNote(id) {
    return this.notes.find(note => note.id === id);
  }

  // 搜尋筆記
  searchNotes(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  // 依分類篩選
  filterByCategory(category) {
    this.currentFilter = category;
    this.applyFilters();
  }

  // 套用所有篩選條件
  applyFilters() {
    let filtered = [...this.notes];

    // 分類篩選
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(note => note.category === this.currentFilter);
    }

    // 搜尋篩選
    if (this.searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(this.searchQuery) ||
        note.content.toLowerCase().includes(this.searchQuery) ||
        note.category.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredNotes = filtered;
  }

  // 取得篩選後的筆記
  getFilteredNotes() {
    return this.filteredNotes;
  }

  // 取得統計資料
  getStats() {
    const total = this.notes.length;
    const today = new Date().toDateString();
    const todayCount = this.notes.filter(note => 
      new Date(note.date).toDateString() === today
    ).length;

    const categoryCount = {};
    this.notes.forEach(note => {
      categoryCount[note.category] = (categoryCount[note.category] || 0) + 1;
    });

    const favoriteCategory = Object.keys(categoryCount).length > 0 
      ? Object.keys(categoryCount).reduce((a, b) => 
          categoryCount[a] > categoryCount[b] ? a : b
        )
      : '-';

    return {
      total,
      today: todayCount,
      favorite: favoriteCategory
    };
  }

  // 匯出筆記
  exportNotes() {
    const data = {
      notes: this.notes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miruku-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 匯入筆記
  importNotes(data) {
    try {
      let importData;
      if (typeof data === 'string') {
        importData = JSON.parse(data);
      } else {
        importData = data;
      }

      // 檢查資料格式
      if (importData.notes && Array.isArray(importData.notes)) {
        // 新格式
        this.notes = [...importData.notes];
      } else if (Array.isArray(importData)) {
        // 舊格式，直接是筆記陣列
        this.notes = [...importData];
      } else {
        throw new Error('不支援的檔案格式');
      }

      // 確保每筆記錄都有必要的欄位
      this.notes = this.notes.map(note => ({
        id: note.id || Date.now() + Math.random(),
        title: note.title || '未命名筆記',
        content: note.content || '',
        category: note.category || '其他',
        date: note.date || new Date().toISOString()
      }));

      this.saveNotes();
      this.applyFilters();
      return true;
    } catch (error) {
      console.error('匯入筆記失敗:', error);
      return false;
    }
  }

  // 快速新增筆記（用於批次新增）
  batchAddNotes(notesArray) {
    const newNotes = notesArray.map(note => ({
      id: Date.now() + Math.random(),
      title: note.title,
      content: note.content,
      category: note.category || '其他',
      date: new Date().toISOString()
    }));

    this.notes = [...newNotes, ...this.notes];
    this.saveNotes();
    this.applyFilters();
    return newNotes;
  }

  // 清空所有筆記
  clearAllNotes() {
    this.notes = [];
    this.filteredNotes = [];
    this.saveNotes();
  }
}

// 分類圖示對應
const categoryIcons = {
  "解剖學": "🦴",
  "生理學": "❤️",
  "藥理學": "💊",
  "臨床醫學": "🏥",
  "病理學": "🔬",
  "影像診斷學": "🩺",
  "診斷學": "🩺",
  "其他": "📚"
};

// 取得分類圖示
function getCategoryIcon(category) {
  return categoryIcons[category] || "📝";
}