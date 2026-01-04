import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowLeft } from 'lucide-react';
import { Word, SearchHistory } from '../types';
import svgPaths from '../../imports/svg-sku2zuchb5';

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

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
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
    <div className="min-h-screen bg-[#F5F7FA] pb-20 overflow-x-hidden flex flex-col">
      {/* Floating back button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate(-1)}
          className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full max-w-5xl mx-auto mt-24 px-4 sm:px-6 lg:px-10 flex-1">
        {/* 検索ボックス */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            placeholder="単語を検索..."
            className="w-full pl-12 pr-12 py-4 rounded-[15px] bg-white shadow-md border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#53BEE8] focus:border-transparent text-[16px]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 検索結果 */}
        {isSearching && searchQuery.trim() && (
          <div className="bg-white rounded-[26px] shadow-lg overflow-hidden mb-6">
            {filteredWords.length > 0 ? (
              <div className="divide-y divide-[#e6e6e6]">
                {filteredWords.map((word, index) => (
                  <button
                    key={word.id}
                    onClick={() => handleSelectWord(word.id)}
                    className="w-full px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[18px] text-[#404040] mb-1">{word.word}</p>
                        {word.katakana && (
                          <p className="text-[14px] text-[#8E8E93]">{word.katakana}</p>
                        )}
                        {word.chinese && (
                          <p className="text-[14px] text-[#8E8E93] mt-1">{word.chinese}</p>
                        )}
                      </div>
                      <div className="ml-3 text-[#99A1AF]">
                        <svg className="block size-5" fill="none" viewBox="0 0 20 20">
                          <path d={svgPaths.p83a7740} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-[#8E8E93] text-[16px]">検索結果が見つかりません</p>
              </div>
            )}
          </div>
        )}

        {/* 検索履歴 */}
        {!isSearching && searchHistory.length > 0 && (
          <div className="bg-white rounded-[26px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e6e6e6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#8E8E93]" />
                <h3 className="text-[16px] text-[#404040]">検索履歴</h3>
              </div>
              <button
                onClick={handleClearAllHistory}
                className="text-[14px] text-[#53BEE8] hover:text-[#53BEE8]/80"
              >
                すべて削除
              </button>
            </div>
            <div className="divide-y divide-[#e6e6e6]">
              {searchHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleSelectHistory(history.query)}
                    className="flex-1 text-left text-[16px] text-[#404040]"
                  >
                    {history.query}
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(history.id)}
                    className="ml-3 text-[#8E8E93] hover:text-[#F7893F] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空の状態 */}
        {!isSearching && searchHistory.length === 0 && (
          <div className="bg-white rounded-[26px] shadow-lg py-16 text-center">
            <Search size={48} className="mx-auto text-[#d9d9d9] mb-4" />
            <p className="text-[#8E8E93] text-[16px]">検索履歴がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}