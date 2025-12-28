import { useState, useEffect } from 'react';
// ⭐ 修改点 1：增加 Routes 和 Route 的导入，移除不需要的 Navigate（如果下方没用到的话可以保留）
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { WordListScreen } from './components/WordListScreen';
import { SearchScreen } from './components/SearchScreen';
import { WordAddScreen } from './components/WordAddScreen';
import { WordDetailScreen } from './components/WordDetailScreen';
import { WordEditScreen } from './components/WordEditScreen';
import { FlashcardScreen } from './components/FlashcardScreen';
import { Navigation } from './components/Navigation';
import { Word, Folder } from './types';

// ... 中间的 initialWords, initialFolders 和 App 函数体逻辑保持不变 ...

function App() {
  // ... (保持你原有的 useState, useEffect, handleExport 等函数逻辑)

  return (
    // ⭐ 修改点 2：删掉 <BrowserRouter>，因为它已经在 main.tsx 的 <HashRouter> 里了
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/list" replace />}
        />
        <Route
          path="/list"
          element={
            <>
              <WordListScreen 
                words={words} 
                folders={folders}
                onAddFolder={handleAddFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
                onRemoveWordFromFolder={handleRemoveWordFromFolder}
                onExportData={handleExportData}
                onImportData={handleImportData}
              />
              <Navigation />
            </>
          }
        />
        <Route
          path="/search"
          element={
            <>
              <SearchScreen words={words} />
              <Navigation />
            </>
          }
        />
        <Route
          path="/add"
          element={
            <>
              <WordAddScreen 
                onAddWord={handleAddWord} 
                onAddWords={handleAddWords}
                existingWords={words}
              />
              <Navigation />
            </>
          }
        />
        <Route
          path="/detail/:id"
          element={
            <>
              <WordDetailScreen words={words} folders={folders} />
              <Navigation />
            </>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <>
              <WordEditScreen 
                words={words} 
                folders={folders}
                onUpdateWord={handleUpdateWord} 
                onDeleteWord={handleDeleteWord}
                onAddFolder={handleAddFolder}
                onRemoveWordFromFolder={handleRemoveWordFromFolder}
              />
              <Navigation />
            </>
          }
        />
        <Route
          path="/flashcard"
          element={
            <>
              <FlashcardScreen 
                words={words} 
                folders={folders} 
                onUpdateWord={handleUpdateWord}
              />
              <Navigation />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/list" replace />} />
      </Routes>
    </div>
  );
}

export default App;