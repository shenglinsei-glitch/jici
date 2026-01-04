import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder as FolderIcon,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Upload,
  Plus,
  ChevronLeft,
  Settings,
  GripVertical,
} from 'lucide-react';
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

type SortMode = 'manual' | 'alpha';
const LS_SORT_MODE = 'wordlist_folder_sort_mode_v2';

// We persist manual order into folder objects themselves as (orderInParent:number).
// TypeScript: Folder doesn't define orderInParent, so we access it via (folder as any).orderInParent.

type MenuPos = { top: number; left: number; placement: 'down' | 'up' };

export function WordListScreen({
  words,
  folders,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  onRemoveWordFromFolder,
  onExportData,
  onImportData,
}: WordListScreenProps) {
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
  const [contextMenuPos, setContextMenuPos] = useState<MenuPos | null>(null);

  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [editFolderName, setEditFolderName] = useState('');

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    const v = (localStorage.getItem(LS_SORT_MODE) as SortMode | null) ?? 'alpha';
    return v === 'manual' || v === 'alpha' ? v : 'alpha';
  });

  // force re-render when we mutate folders in-place (to persist order into exported data)
  const [, forceRender] = useState(0);

  // drag state
  const dragFromIdRef = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_SORT_MODE, sortMode);
  }, [sortMode]);

  // Close menus on outside click / Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-context-menu="true"]') || target.closest('[data-settings-menu="true"]')) return;
      setShowContextMenu(null);
      setContextMenuPos(null);
      setShowSettingsMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowContextMenu(null);
        setContextMenuPos(null);
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleExport = () => {
    onExportData();
    setShowSettingsMenu(false);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImportData(e);
    setShowSettingsMenu(false);
  };

  const getCurrentDepth = (folderId: string | null): number => {
    if (!folderId || folderId === UNCATEGORIZED_FOLDER_ID) return 0;
    let depth = 1;
    let currentFolder = folders.find((f) => f.id === folderId);
    while (currentFolder?.parentId) {
      depth++;
      currentFolder = folders.find((f) => f.id === currentFolder!.parentId);
    }
    return depth;
  };

  const getFolderPath = (folderId: string | null): Folder[] => {
    if (!folderId || folderId === UNCATEGORIZED_FOLDER_ID) return [];
    const path: Folder[] = [];
    let currentFolder = folders.find((f) => f.id === folderId);
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parentId
        ? folders.find((f) => f.id === currentFolder!.parentId)
        : undefined;
    }
    return path;
  };

  const getChildFoldersRaw = (parentId: string | null): Folder[] => {
    return folders.filter((f) => f.parentId === parentId);
  };

  const alphaSort = (a: Folder, b: Folder) => a.name.localeCompare(b.name);

  const manualSort = (a: Folder, b: Folder) => {
    const oa = Number((a as any).orderInParent);
    const ob = Number((b as any).orderInParent);
    const aHas = Number.isFinite(oa);
    const bHas = Number.isFinite(ob);
    if (aHas && bHas) return oa - ob;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return alphaSort(a, b);
  };

  const getChildFolders = (parentId: string | null): Folder[] => {
    const raw = getChildFoldersRaw(parentId);
    if (sortMode === 'alpha') return [...raw].sort(alphaSort);
    return [...raw].sort(manualSort);
  };

  const getFolderWordCount = (folderId: string): number => {
    const directWords = words.filter((w) => w.folders?.includes(folderId));
    const childFolders = getChildFoldersRaw(folderId);
    const childWords = childFolders.reduce((sum, folder) => sum + getFolderWordCount(folder.id), 0);
    return directWords.length + childWords;
  };

  const getUncategorizedWordCount = (): number => {
    return words.filter((w) => !w.folders || w.folders.length === 0).length;
  };

  const getCurrentFolderWords = (): Word[] => {
    if (currentFolderId === UNCATEGORIZED_FOLDER_ID) {
      return words.filter((w) => !w.folders || w.folders.length === 0);
    }
    if (!currentFolderId) return [];
    return words.filter((w) => w.folders?.includes(currentFolderId));
  };

  const openCreateFolder = () => {
    setShowNewFolderModal(true);
    setNewFolderName('');
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const parentId = currentFolderId === UNCATEGORIZED_FOLDER_ID ? null : currentFolderId;

    const depth = getCurrentDepth(parentId);
    if (depth >= 5) {
      alert('フォルダの階層は最大5階層までです');
      return;
    }

    onAddFolder(newFolderName.trim(), parentId ?? null);

    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleEditFolder = (folderId: string) => {
    if (editFolderName.trim()) {
      onUpdateFolder(folderId, editFolderName.trim());
      setEditFolderName('');
      setShowEditModal(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (
      folder &&
      window.confirm(`「${folder.name}」を削除しますか？\nフォルダ内の単語は「未整理」に移動されます。`)
    ) {
      onDeleteFolder(folderId);
      setShowContextMenu(null);
      setContextMenuPos(null);
    }
  };

  const applyManualOrderToFolders = (parentId: string | null, orderedIds: string[]) => {
    const indexMap = new Map<string, number>();
    orderedIds.forEach((id, idx) => indexMap.set(id, idx));
    for (const f of folders) {
      if (f.parentId !== parentId) continue;
      const idx = indexMap.get(f.id);
      if (idx !== undefined) (f as any).orderInParent = idx;
    }
    forceRender((x) => x + 1);
  };

  const handleDragStart = (folderId: string) => {
    dragFromIdRef.current = folderId;
  };

  const handleDropOn = (parentId: string | null, targetFolderId: string) => {
    const fromId = dragFromIdRef.current;
    dragFromIdRef.current = null;
    if (!fromId || fromId === targetFolderId) return;

    const visible = getChildFolders(parentId);
    const ids = visible.map((f) => f.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(targetFolderId);
    if (fromIdx < 0 || toIdx < 0) return;

    const next = [...ids];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, fromId);

    applyManualOrderToFolders(parentId, next);
  };

  const openContextMenu = (folderId: string, anchorEl: HTMLElement) => {
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 176; // w-44
    const menuHeight = 92; // two rows
    const gap = 8;
    const padding = 12;

    let top = rect.bottom + gap;
    let placement: MenuPos['placement'] = 'down';

    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - gap - menuHeight;
      placement = 'up';
    }

    let left = rect.right - menuWidth;
    if (left < padding) left = padding;
    if (left + menuWidth > window.innerWidth - padding) left = window.innerWidth - padding - menuWidth;

    setShowContextMenu(folderId);
    setContextMenuPos({ top, left, placement });
  };

  const currentPath = getFolderPath(currentFolderId);
  const childFolders = getChildFolders(currentFolderId === UNCATEGORIZED_FOLDER_ID ? null : currentFolderId);
  const currentWords = getCurrentFolderWords();

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20 overflow-x-hidden flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 flex-1">
        {/* Floating top controls */}
        <div className="relative flex items-center justify-between mt-6 mb-6">
          {/* Left: Settings (root) / Back (inside folder) */}
          <div className="relative">
            {currentFolderId ? (
              <button
                onClick={() => {
                  if (currentFolderId === UNCATEGORIZED_FOLDER_ID) {
                    setCurrentFolderId(null);
                    return;
                  }
                  const currentFolder = folders.find((f) => f.id === currentFolderId);
                  setCurrentFolderId(currentFolder?.parentId || null);
                }}
                className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5 hover:bg-white transition-colors"
                aria-label="戻る"
              >
                <ChevronLeft size={22} className="text-[#53BEE8]" />
              </button>
            ) : (
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5 hover:bg-white transition-colors"
                aria-label="設定"
                title="設定"
              >
                <Settings size={22} className="text-[#53BEE8]" />
              </button>
            )}

            {!currentFolderId && showSettingsMenu && (
              <div
                data-settings-menu="true"
                className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200/80 z-20 overflow-hidden w-72"
              >
                <div className="px-4 py-3 text-[12px] text-gray-500 bg-gray-50 border-b border-gray-100">
                  データ / フォルダ表示
                </div>

                <button
                  onClick={handleExport}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                >
                  <Download size={18} className="text-[#2AC69E]" />
                  <span className="text-[15px]">エクスポート</span>
                </button>

                <label className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100 cursor-pointer">
                  <Upload size={18} className="text-[#53BEE8]" />
                  <span className="text-[15px]">インポート</span>
                  <input type="file" accept=".json" onChange={handleImportChange} className="hidden" />
                </label>

                <div className="border-t border-gray-100">
                  <div className="px-4 py-3 text-[13px] text-gray-700 font-medium">フォルダ並び順</div>

                  <button
                    onClick={() => setSortMode('manual')}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
                  >
                    <span className="text-[15px] text-gray-900">手動（ドラッグ）</span>
                    <span
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        sortMode === 'manual' ? 'border-[#53BEE8]' : 'border-gray-300'
                      }`}
                    >
                      {sortMode === 'manual' && <span className="h-3 w-3 rounded-full bg-[#53BEE8]" />}
                    </span>
                  </button>

                  <button
                    onClick={() => setSortMode('alpha')}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between text-left border-t border-gray-100"
                  >
                    <span className="text-[15px] text-gray-900">A→Z（首字母）</span>
                    <span
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        sortMode === 'alpha' ? 'border-[#53BEE8]' : 'border-gray-300'
                      }`}
                    >
                      {sortMode === 'alpha' && <span className="h-3 w-3 rounded-full bg-[#53BEE8]" />}
                    </span>
                  </button>

                  {sortMode === 'manual' && (
                    <div className="px-4 pb-3 text-[12px] text-gray-500">
                      ※ 並び順はデータに保存され、エクスポート/インポートでも引き継がれます
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowSettingsMenu(false)}
                  className="w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-center border-t border-gray-100 text-gray-500 text-[14px]"
                >
                  キャンセル
                </button>
              </div>
            )}
          </div>

          {/* Right: Add folder */}
          <div className="relative">
            {currentFolderId !== UNCATEGORIZED_FOLDER_ID ? (
              <button
                onClick={openCreateFolder}
                className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5 hover:bg-white transition-colors"
                aria-label="フォルダ追加"
              >
                <Plus size={26} className="text-[#53BEE8]" strokeWidth={2} />
              </button>
            ) : (
              <div className="h-12 w-12" />
            )}
          </div>
        </div>

        <div className="pb-6">
          {/* Breadcrumbs */}
          {currentPath.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-[14px] text-gray-500 overflow-x-auto">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="hover:text-[#53BEE8] transition-colors whitespace-nowrap"
              >
                ホーム
              </button>
              {currentPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight size={14} className="flex-shrink-0" />
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={`hover:text-[#53BEE8] transition-colors whitespace-nowrap ${
                      index === currentPath.length - 1 ? 'text-gray-900 font-medium' : ''
                    }`}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm w-full">
            <div className="overflow-hidden rounded-xl">
              {!currentFolderId && (
                <button
                  onClick={() => setCurrentFolderId(UNCATEGORIZED_FOLDER_ID)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <FolderIcon size={22} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[17px] text-gray-900 truncate">未整理</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[15px] text-gray-400">{getUncategorizedWordCount()}</span>
                      <ChevronRight size={18} className="text-gray-300" strokeWidth={2} />
                    </div>
                  </div>
                </button>
              )}

              {childFolders.map((folder) => (
                <div key={folder.id} className="relative">
                  <div
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    draggable={sortMode === 'manual'}
                    onDragStart={() => handleDragStart(folder.id)}
                    onDragOver={(e) => {
                      if (sortMode !== 'manual') return;
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      if (sortMode !== 'manual') return;
                      handleDropOn(currentFolderId === UNCATEGORIZED_FOLDER_ID ? null : currentFolderId, folder.id);
                    }}
                  >
                    <button
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="flex-shrink-0">
                        <FolderIcon size={22} className="text-[#53BEE8]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] text-gray-900 truncate">{folder.name}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[15px] text-gray-400">{getFolderWordCount(folder.id)}</span>

                      {sortMode === 'manual' && (
                        <span
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-300 cursor-grab active:cursor-grabbing"
                          title="ドラッグで並べ替え"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={16} />
                        </span>
                      )}

                      <ChevronRight size={18} className="text-gray-300" strokeWidth={2} />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = e.currentTarget as HTMLElement;
                      if (showContextMenu === folder.id) {
                        setShowContextMenu(null);
                        setContextMenuPos(null);
                        return;
                      }
                      openContextMenu(folder.id, el);
                    }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="メニュー"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              ))}

              {currentFolderId &&
                currentWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => navigate(`/detail/${word.id}`)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0 text-left pl-9">
                        <p className="text-[17px] text-gray-900 truncate">{word.word}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 flex-shrink-0" strokeWidth={2} />
                    </div>
                  </button>
                ))}

              {!currentFolderId && childFolders.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <FolderIcon size={48} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[15px] text-gray-400">フォルダがありません</p>
                  <p className="text-[13px] text-gray-400 mt-1">右上の + から作成できます</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showContextMenu && contextMenuPos && (
        <div
          data-context-menu="true"
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden w-44"
          style={{ top: contextMenuPos.top, left: contextMenuPos.left }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const folder = folders.find((f) => f.id === showContextMenu);
              if (!folder) return;
              setShowContextMenu(null);
              setContextMenuPos(null);
              setEditFolderName(folder.name);
              setShowEditModal(folder.id);
            }}
            className="w-full px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-left text-[15px]"
          >
            <Edit2 size={16} className="text-gray-600" />
            <span>名前を変更</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(showContextMenu);
            }}
            className="w-full px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-left text-[15px] text-red-500 border-t border-gray-100"
          >
            <Trash2 size={16} />
            <span>削除</span>
          </button>
        </div>
      )}

      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <h2 className="text-[17px] font-semibold text-gray-900 mb-4">新しいフォルダ</h2>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="フォルダ名を入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#53BEE8] focus:border-transparent text-[17px]"
                autoFocus
              />
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 py-3 text-[17px] text-[#53BEE8] hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <div className="w-px bg-gray-200"></div>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-3 text-[17px] text-[#53BEE8] font-semibold hover:bg-gray-50 transition-colors"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <h2 className="text-[17px] font-semibold text-gray-900 mb-4">フォルダ名を変更</h2>
              <input
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditFolder(showEditModal)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#53BEE8] focus:border-transparent text-[17px]"
                autoFocus
              />
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(null);
                  setEditFolderName('');
                }}
                className="flex-1 py-3 text-[17px] text-[#53BEE8] hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <div className="w-px bg-gray-200"></div>
              <button
                onClick={() => handleEditFolder(showEditModal)}
                className="flex-1 py-3 text-[17px] text-[#53BEE8] font-semibold hover:bg-gray-50 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}