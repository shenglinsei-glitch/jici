import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder as FolderIcon, FolderPlus, ChevronRight, MoreVertical, ArrowLeft, Edit2, Trash2, FolderPlus as AddSubFolder, Database, Download, Upload } from 'lucide-react';
import { Word, Folder } from '../types';

interface WordListScreenProps {
  words: Word[];
  folders: Folder[];
  onAddFolder: (name: string, parentId: string | null) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRemoveWordFromFolder: (wordId: string, folderId: string) => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UNCATEGORIZED_FOLDER_ID = 'uncategorized';

export function WordListScreen({ words, folders, onAddFolder, onUpdateFolder, onDeleteFolder, onRemoveWordFromFolder, onExportData, onImportData }: WordListScreenProps) {
  const navigate = useNavigate();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(() => {
    const savedFolderId = sessionStorage.getItem('selectedFolderId');
    if (savedFolderId) {
      sessionStorage.removeItem('selectedFolderId');
      return savedFolderId;
    }
    return null;
  });
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [showWordContextMenu, setShowWordContextMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [editFolderName, setEditFolderName] = useState('');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showSyncMenu, setShowSyncMenu] = useState(false);

  // Handle export with debug log
  const handleExport = () => {
    console.log('========== WordListScreen: エクスポートボタンがクリックされました ==========');
    console.log('onExportData関数:', onExportData);
    console.log('onExportData関数の型:', typeof onExportData);
    try {
      onExportData();
      console.log('onExportData()呼び出し成功');
    } catch (error) {
      console.error('エクスポートエラー:', error);
    }
    setShowSyncMenu(false);
  };

  // Handle import with debug log
  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('========== WordListScreen: インポートファイルが選択されました ==========');
    console.log('ファイル:', e.target.files);
    console.log('onImportData関数:', onImportData);
    console.log('onImportData関数の型:', typeof onImportData);
    try {
      onImportData(e);
      console.log('onImportData()呼び出し成功');
    } catch (error) {
      console.error('インポートエラー:', error);
    }
    setShowSyncMenu(false);
  };

  // 現在のフォルダの階層を取得
  const getCurrentDepth = (folderId: string | null): number => {
    if (!folderId) return 0;
    let depth = 1;
    let currentFolder = folders.find(f => f.id === folderId);
    while (currentFolder?.parentId) {
      depth++;
      currentFolder = folders.find(f => f.id === currentFolder!.parentId);
    }
    return depth;
  };

  // 現在のフォルダパスを取得
  const getFolderPath = (folderId: string | null): Folder[] => {
    if (!folderId) return [];
    const path: Folder[] = [];
    let currentFolder = folders.find(f => f.id === folderId);
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parentId ? folders.find(f => f.id === currentFolder!.parentId) : undefined;
    }
    return path;
  };

  // 現在のフォルダの子フォルダを取得
  const getChildFolders = (parentId: string | null): Folder[] => {
    return folders.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
  };

  // フォルダ内の単語数を取得（サブフォルダ含む）
  const getFolderWordCount = (folderId: string): number => {
    const directWords = words.filter(w => w.folders?.includes(folderId));
    const childFolders = getChildFolders(folderId);
    const childWords = childFolders.reduce((sum, folder) => sum + getFolderWordCount(folder.id), 0);
    return directWords.length + childWords;
  };

  // 未整理フォルダの単語数を取得
  const getUncategorizedWordCount = (): number => {
    return words.filter(w => !w.folders || w.folders.length === 0).length;
  };

  // 現在のフォルダの直接の単語を取得
  const getCurrentFolderWords = (): Word[] => {
    if (currentFolderId === UNCATEGORIZED_FOLDER_ID) {
      return words.filter(w => !w.folders || w.folders.length === 0);
    }
    if (!currentFolderId) return [];
    return words.filter(w => w.folders?.includes(currentFolderId));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const depth = getCurrentDepth(currentFolderId);
      if (depth >= 5) {
        alert('フォルダの階層は最大5階層までです');
        return;
      }
      onAddFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleEditFolder = (folderId: string) => {
    if (editFolderName.trim()) {
      onUpdateFolder(folderId, editFolderName.trim());
      setEditFolderName('');
      setShowEditModal(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && window.confirm(`「${folder.name}」を削除しますか？\nフォルダ内の単語は「未整理」に移動されます。`)) {
      onDeleteFolder(folderId);
      setShowContextMenu(null);
    }
  };

  const handleLongPressStart = (folderId: string) => {
    const timer = setTimeout(() => {
      setShowContextMenu(folderId);
    }, 500); // 500ms長押し
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleWordLongPressStart = (wordId: string) => {
    const timer = setTimeout(() => {
      setShowWordContextMenu(wordId);
    }, 500); // 500ms長押し
    setLongPressTimer(timer);
  };

  const handleWordLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleRemoveWord = (wordId: string) => {
    if (currentFolderId && currentFolderId !== UNCATEGORIZED_FOLDER_ID) {
      onRemoveWordFromFolder(wordId, currentFolderId);
    }
    setShowWordContextMenu(null);
  };

  const currentPath = getFolderPath(currentFolderId);
  const childFolders = getChildFolders(currentFolderId);
  const currentWords = getCurrentFolderWords();
  const totalWords = words.length;

  // デバッグ用：総単語数をコンソールに出力
  console.log('========== デバッグ情報 ==========');
  console.log('総単語数:', totalWords);
  console.log('単語リスト:');
  words.forEach((word, index) => {
    console.log(`  ${index + 1}. ${word.word} (ID: ${word.id})`);
  });
  console.log('================================');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 rounded-t-[0px] rounded-b-[10px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {!currentFolderId && (
                <div className="relative">
                  <button
                    onClick={() => setShowSyncMenu(!showSyncMenu)}
                    className="p-2 text-[rgb(42,59,93)] hover:bg-gray-100 rounded-lg transition-colors"
                    title="データ同期"
                  >
                    <Database size={24} />
                  </button>
                  
                  {/* データ同期メニュー */}
                  {showSyncMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden w-48">
                      <button
                        onClick={handleExport}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                      >
                        <Download size={18} className="text-[#2AC69E]" />
                        <span>データをエクスポート</span>
                      </button>
                      <label className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100 cursor-pointer">
                        <Upload size={18} className="text-[#53BEE8]" />
                        <span>データをインポート</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setShowSyncMenu(false)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-center border-t border-gray-100 text-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
              )}
              {currentFolderId ? (
                <button
                  onClick={() => {
                    const currentFolder = folders.find(f => f.id === currentFolderId);
                    setCurrentFolderId(currentFolder?.parentId || null);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={24} />
                </button>
              ) : null}
              <h1 className="text-2xl">
                {currentFolderId === UNCATEGORIZED_FOLDER_ID ? '未整理' : currentPath.length > 0 ? currentPath[currentPath.length - 1].name : ''}
              </h1>
            </div>
            {currentFolderId !== UNCATEGORIZED_FOLDER_ID && (
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors border-none"
              >
                <FolderPlus size={20} />
                <span className="text-sm">フォルダ</span>
              </button>
            )}
          </div>

          {/* パンくずリスト */}
          {currentPath.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 overflow-x-auto">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="hover:text-[#53BEE8]"
              >
                ホーム
              </button>
              {currentPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-1">
                  <ChevronRight size={16} />
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={`hover:text-[#53BEE8] ${index === currentPath.length - 1 ? 'text-[#53BEE8]' : ''}`}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* ルートレベルのみ：未整理フォルダ */}
          {!currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(UNCATEGORIZED_FOLDER_ID)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(255,255,255,0.15)] rounded-lg">
                    <FolderIcon size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-700">未整理</h3>
                    <p className="text-xs text-gray-500">フォルダに未分類の単語</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{getUncategorizedWordCount()}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </button>
          )}

          {/* 子フォルダリスト */}
          {childFolders.map((folder) => (
            <div key={folder.id} className="relative">
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                onTouchStart={() => handleLongPressStart(folder.id)}
                onTouchEnd={handleLongPressEnd}
                onMouseDown={() => handleLongPressStart(folder.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[rgb(255,255,255)] rounded-lg">
                      <FolderIcon size={24} className="text-[#53BEE8]" />
                    </div>
                    <h3 className="text-gray-700">{folder.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{getFolderWordCount(folder.id)}</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              </button>

              {/* コンテキストメニュー */}
              {showContextMenu === folder.id && (
                <div className="absolute top-0 right-0 mt-2 mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setEditFolderName(folder.name);
                      setShowEditModal(folder.id);
                      setShowContextMenu(null);
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                  >
                    <Edit2 size={18} className="text-gray-600" />
                    <span>名前を編集</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentFolderId(folder.id);
                      setShowNewFolderModal(true);
                      setShowContextMenu(null);
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                  >
                    <AddSubFolder size={18} className="text-[#53BEE8]" />
                    <span>サブフォルダを追加</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="w-full px-4 py-3 hover:bg-[#F7893F]/10 transition-colors flex items-center gap-3 text-left border-t border-gray-100 text-[#F7893F]"
                  >
                    <Trash2 size={18} />
                    <span>削除</span>
                  </button>
                  <button
                    onClick={() => setShowContextMenu(null)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-center border-t border-gray-100 text-gray-600"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 現在のフォルダの単語リスト */}
          {currentWords.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-600 px-2 mt-4">単語 ({currentWords.length})</h3>
              {currentWords.map((word) => (
                <div key={word.id} className="relative">
                  <button
                    onClick={() => navigate(`/detail/${word.id}`)}
                    onTouchStart={() => handleWordLongPressStart(word.id)}
                    onTouchEnd={handleWordLongPressEnd}
                    onMouseDown={() => handleWordLongPressStart(word.id)}
                    onMouseUp={handleWordLongPressEnd}
                    onMouseLeave={handleWordLongPressEnd}
                    className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-lg">{word.word}</span>
                        <span className="text-sm text-gray-600 ml-2">({word.katakana})</span>
                      </div>
                      {word.tags && word.tags.length > 0 && (
                        <span className="text-xs bg-[#53BEE8]/10 text-[#53BEE8] px-2 py-1 rounded whitespace-nowrap">
                          {word.tags[0]}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* 単語のコンテキストメニュー */}
                  {showWordContextMenu === word.id && (
                    <div className="absolute top-0 right-0 mt-2 mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <button
                        onClick={() => handleRemoveWord(word.id)}
                        className="w-full px-4 py-3 hover:bg-[#F7893F]/10 transition-colors flex items-center gap-3 text-left"
                      >
                        <Trash2 size={18} />
                        <span>フォルダから削除</span>
                      </button>
                      <button
                        onClick={() => setShowWordContextMenu(null)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-center border-t border-gray-100 text-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 空の状態 */}
          {childFolders.length === 0 && currentWords.length === 0 && currentFolderId !== null && (
            <div className="text-center py-12 text-gray-500">
              <FolderIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>このフォルダは空です</p>
              <p className="text-sm mt-2">単語を追加するか、サブフォルダを作成してください</p>
            </div>
          )}
        </div>

        {/* 下部：総単語数 */}
        <div className="fixed bottom-16 left-0 right-0 p-2 pointer-events-none">
          <div className="max-w-4xl mx-auto text-center text-xs text-gray-500">
            総単語数: {totalWords}
          </div>
        </div>

        {/* 新規フォルダ作成モーダル */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" onClick={() => setShowNewFolderModal(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl mb-4">新しいフォルダ</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="フォルダ名"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 py-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 border-none"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* フォルダ名編集モーダル */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" onClick={() => setShowEditModal(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl mb-4">フォルダ名を編集</h3>
              <input
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditFolder(showEditModal)}
                placeholder="フォルダ名"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(null);
                    setEditFolderName('');
                  }}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleEditFolder(showEditModal)}
                  className="flex-1 py-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 border-none"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* コンテキストメニュー背景 */}
        {(showContextMenu || showWordContextMenu || showSyncMenu) && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => {
              setShowContextMenu(null);
              setShowWordContextMenu(null);
              setShowSyncMenu(false);
            }}
          />
        )}
      </div>
    </div>
  );
}