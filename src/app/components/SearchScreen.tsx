import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import { Word, SearchHistory } from '../types';

interface SearchScreenProps {
  words: Word[];
}

const HISTORY_KEY = 'vocabulary-search-history';

export function SearchScreen({ words }: SearchScreenProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索履歴をローカルストレージから読み込む
  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  // 検索履歴を保存
  const saveHistory = (history: SearchHistory[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    setSearchHistory(history);
  };

  // 検索結果
  const filteredWords = searchQuery.trim()
    ? words.filter((word) => {
        const query = searchQuery.toLowerCase();
        return (
          word.word.toLowerCase().includes(query) ||
          word.katakana.toLowerCase().includes(query) ||
          (word.chinese && word.chinese.toLowerCase().includes(query)) ||
          (word.english && word.english.toLowerCase().includes(query)) ||
          (word.tags && word.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      })
    : [];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // 検索履歴に追加
      const newHistory: SearchHistory = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date().toISOString(),
      };
      const updatedHistory = [
        newHistory,
        ...searchHistory.filter((h) => h.query !== query.trim()),
      ].slice(0, 10); // 最大10件
      saveHistory(updatedHistory);
    }
  };

  const handleSelectWord = (wordId: string) => {
    handleSearch(searchQuery);
    navigate(`/detail/${wordId}`);
  };

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    inputRef.current?.focus();
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = searchHistory.filter((h) => h.id !== id);
    saveHistory(updatedHistory);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('検索履歴をすべて削除しますか？')) {
      saveHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー・検索入力欄 */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 rounded-t-[0px] rounded-b-[10px]">
          <h1 className="text-2xl mb-4 flex items-center gap-2">
            <Search size={28} className="text-[#53BEE8]" />
            検索
          </h1>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="単語を検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
              onFocus={() => setIsSearching(searchQuery.length > 0)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* 検索結果ドロップダウン（検索入力中のみ表示） */}
          {isSearching && searchQuery.trim() && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4 max-h-96 overflow-y-auto">
              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>「{searchQuery}」に一致する単語が見つかりません</p>
                </div>
              ) : (
                <div>
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      {filteredWords.length}件の結果
                    </p>
                  </div>
                  {filteredWords.map((word) => (
                    <button
                      key={word.id}
                      onClick={() => handleSelectWord(word.id)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-lg">{word.word}</p>
                          <p className="text-sm text-gray-600">{word.katakana}</p>
                        </div>
                        {word.tags && word.tags.length > 0 && (
                          <span className="text-xs bg-[#53BEE8]/10 text-[#53BEE8] px-2 py-1 rounded">
                            {word.tags[0]}
                          </span>
                        )}
                      </div>
                      {word.english && (
                        <p className="text-sm text-gray-500">{word.english}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 検索履歴（検索入力中は非表示） */}
          {!isSearching && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-gray-700">
                  <Clock size={18} />
                  検索履歴
                </h2>
                {searchHistory.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-sm text-[#F7893F] hover:text-[#F7893F]/80"
                  >
                    すべて削除
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>検索履歴はありません</p>
                </div>
              ) : (
                <div>
                  {searchHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <button
                        onClick={() => handleSelectHistory(history.query)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <Clock size={16} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-700">{history.query}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(history.timestamp).toLocaleString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(history.id)}
                        className="p-2 text-gray-400 hover:text-[#F7893F] transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}