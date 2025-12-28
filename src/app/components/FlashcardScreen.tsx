import { useState, useEffect } from 'react';
import { Settings, RotateCcw, X } from 'lucide-react';
import { Word, Folder } from '../types';

interface FlashcardScreenProps {
  words: Word[];
  folders: Folder[];
  onUpdateWord: (id: string, wordData: Omit<Word, 'id' | 'createdAt'>) => void;
}

type FrontDisplayType = 'japanese' | 'chinese' | 'english' | 'image';

export function FlashcardScreen({ words, folders, onUpdateWord }: FlashcardScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [frontDisplayType, setFrontDisplayType] = useState<FrontDisplayType>('japanese');

  // Initialize with all folders selected
  useEffect(() => {
    if (folders.length > 0 && selectedFolders.length === 0) {
      setSelectedFolders(folders.map(f => f.id));
    }
  }, [folders]);

  // Calculate next review date based on difficulty
  const getNextReviewDate = (difficulty: 'hard' | 'good' | 'easy'): string => {
    const now = new Date();
    switch (difficulty) {
      case 'hard':
        now.setDate(now.getDate() + 1); // 翌日
        break;
      case 'good':
        now.setDate(now.getDate() + 3); // 3日後
        break;
      case 'easy':
        now.setDate(now.getDate() + 7); // 1週間後
        break;
    }
    return now.toISOString();
  };

  // Check if word should be reviewed today
  const shouldReviewToday = (word: Word): boolean => {
    if (!word.studyState) return true; // 未学習の単語は表示
    if (word.studyState.difficulty === 'completed') return false; // 完了した単語は表示しない
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextReviewDate = new Date(word.studyState.nextReviewDate);
    nextReviewDate.setHours(0, 0, 0, 0);
    
    return nextReviewDate <= today;
  };

  // Filter words based on selected folders and review date
  const getFilteredWords = () => {
    let filtered = words.filter(w => w.word);
    
    // Filter by folders
    if (selectedFolders.length > 0) {
      filtered = filtered.filter(w => {
        if (!w.folders || w.folders.length === 0) {
          return selectedFolders.includes('no-folder');
        }
        return w.folders.some(folderId => selectedFolders.includes(folderId));
      });
    }
    
    // Filter by review date
    filtered = filtered.filter(w => shouldReviewToday(w));
    
    return filtered;
  };

  const studyWords = getFilteredWords();

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedFolders, frontDisplayType]);

  // Get front content based on settings with fallback
  const getFrontContent = (word: Word): { type: string; content: any } => {
    const defaultOrder: FrontDisplayType[] = ['japanese', 'chinese', 'english', 'image'];
    
    const typesToTry = [frontDisplayType, ...defaultOrder.filter(t => t !== frontDisplayType)];
    
    for (const type of typesToTry) {
      switch (type) {
        case 'japanese':
          if (word.word) return { type: 'japanese', content: word.word };
          break;
        case 'chinese':
          if (word.chinese) return { type: 'chinese', content: word.chinese };
          break;
        case 'english':
          if (word.english) return { type: 'english', content: word.english };
          break;
        case 'image':
          if (word.imageUrl) return { type: 'image', content: word.imageUrl };
          break;
      }
    }
    
    return { type: 'japanese', content: word.word || '???' };
  };

  const handleNext = (difficulty: 'hard' | 'good' | 'easy') => {
    const word = studyWords[currentIndex];
    const currentState = word.studyState;
    
    let newDifficulty: 'hard' | 'good' | 'easy' | 'completed' = difficulty;
    let consecutiveEasyCount = 0;
    let consecutiveGoodCount = 0;
    
    if (currentState) {
      consecutiveEasyCount = currentState.consecutiveEasyCount;
      consecutiveGoodCount = currentState.consecutiveGoodCount;
    }
    
    // Handle consecutive selections
    if (difficulty === 'easy') {
      if (currentState?.difficulty === 'easy') {
        consecutiveEasyCount += 1;
        if (consecutiveEasyCount >= 2) {
          newDifficulty = 'completed'; // 連続2回簡単 → 完了
        }
      } else {
        consecutiveEasyCount = 1;
      }
      consecutiveGoodCount = 0; // Reset good count
    } else if (difficulty === 'good') {
      if (currentState?.difficulty === 'good') {
        consecutiveGoodCount += 1;
        if (consecutiveGoodCount >= 2) {
          newDifficulty = 'easy'; // 連続2回普通 → 簡単
          consecutiveGoodCount = 0;
        }
      } else {
        consecutiveGoodCount = 1;
      }
      consecutiveEasyCount = 0; // Reset easy count
    } else {
      // hard resets both counters
      consecutiveEasyCount = 0;
      consecutiveGoodCount = 0;
    }
    
    // Update word study state
    const updatedWord = {
      ...word,
      studyState: {
        difficulty: newDifficulty,
        nextReviewDate: newDifficulty === 'completed' 
          ? new Date('2099-12-31').toISOString() // 完了した単語は遠い未来に設定
          : getNextReviewDate(difficulty),
        consecutiveEasyCount,
        consecutiveGoodCount,
        lastReviewDate: new Date().toISOString(),
      },
    };
    
    onUpdateWord(word.id, updatedWord);
    
    // Move to next card
    if (currentIndex < studyWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const toggleFolder = (folderId: string) => {
    setSelectedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };

  const toggleAllFolders = () => {
    if (selectedFolders.length === folders.length + 1) {
      setSelectedFolders([]);
    } else {
      setSelectedFolders([...folders.map(f => f.id), 'no-folder']);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (studyWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex items-center justify-center pb-20">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">学習する単語がありません</p>
          <p className="text-sm text-gray-500">
            {selectedFolders.length === 0 
              ? 'フォルダを選択するか、単語を追加してから学習を始めましょう' 
              : '今日復習する単語はありません。おめでとうございます！'}
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="mt-4 px-6 py-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors"
          >
            設定を開く
          </button>
        </div>
      </div>
    );
  }

  const currentWord = studyWords[currentIndex];
  const totalWords = studyWords.length;
  const frontContent = getFrontContent(currentWord);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white pb-20 overflow-hidden">
      <div className="max-w-4xl mx-auto h-[95vh] flex flex-col p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm text-gray-700">
              {currentIndex + 1} / {totalWords}
            </span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white/90 transition-colors"
          >
            <Settings size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Card container */}
        <div className="flex-1 flex items-center justify-center perspective-1000">
          <div
            className={`relative w-full h-full max-h-[500px] transition-transform duration-500 transform-style-3d`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front card */}
            <div
              className={`absolute inset-0 backface-hidden ${isFlipped ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="h-full bg-gradient-to-b from-[#53BEE8] to-white rounded-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-8 relative overflow-hidden cursor-pointer"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
                onClick={() => setIsFlipped(true)}
              >
                {frontContent.type === 'image' ? (
                  <img
                    src={frontContent.content}
                    alt="flashcard"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                    }}
                  />
                ) : (
                  <h2
                    className="text-5xl md:text-6xl text-[#5E5E5E] break-words text-center"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
                    }}
                  >
                    {frontContent.content}
                  </h2>
                )}
              </div>
            </div>

            {/* Back card */}
            <div
              className={`absolute inset-0 backface-hidden ${!isFlipped ? 'pointer-events-none' : ''}`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div
                className="h-full bg-gradient-to-b from-[#53BEE8] to-white rounded-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex flex-col p-8 relative overflow-hidden"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Back card content - centered, no titles */}
                <div className="flex-1 flex flex-col justify-center items-center space-y-5 overflow-y-auto">
                  {/* Japanese */}
                  <div className="text-center">
                    <p className="text-4xl text-[#5E5E5E]">{currentWord.word}</p>
                  </div>

                  {/* Katakana */}
                  <div className="text-center">
                    <p className="text-2xl text-white">{currentWord.katakana}</p>
                  </div>

                  {/* Chinese */}
                  {currentWord.chinese && (
                    <div className="text-center">
                      <p className="text-2xl text-[#5E5E5E]">{currentWord.chinese}</p>
                    </div>
                  )}

                  {/* English */}
                  {currentWord.english && (
                    <div className="text-center">
                      <p className="text-2xl text-[#5E5E5E]">{currentWord.english}</p>
                    </div>
                  )}

                  {/* Phonetic */}
                  {currentWord.phonetic && (
                    <div className="text-center">
                      <p className="text-lg text-[rgba(94,94,94,0.7)]">{currentWord.phonetic}</p>
                    </div>
                  )}

                  {/* Other translations */}
                  {currentWord.otherTranslations && currentWord.otherTranslations.length > 0 && (
                    <div className="text-center space-y-1">
                      {currentWord.otherTranslations.map((translation, index) => (
                        <p key={index} className="text-base text-[rgba(94,94,94,0.8)]">
                          {translation}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Image */}
                  {currentWord.imageUrl && (
                    <div className="flex justify-center mt-3">
                      <img
                        src={currentWord.imageUrl}
                        alt={currentWord.word}
                        className="w-40 h-40 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Rating buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleNext('hard')}
                    className="flex-1 py-3 text-white rounded-xl transition-colors bg-[#F7893F] hover:bg-[#F7893F]/90"
                  >
                    難しい
                  </button>
                  <button
                    onClick={() => handleNext('good')}
                    className="flex-1 py-3 text-white rounded-xl transition-colors bg-[#53BEE8] hover:bg-[#53BEE8]/90"
                  >
                    普通
                  </button>
                  <button
                    onClick={() => handleNext('easy')}
                    className="flex-1 py-3 text-white rounded-xl transition-colors bg-[#2AC69E] hover:bg-[#2AC69E]/90"
                  >
                    簡単
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reset button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-700"
          >
            <RotateCcw size={18} />
            最初から
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" 
            onClick={() => setShowSettings(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">学習設定</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Learning range setting */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">学習範囲</label>
                    <button
                      onClick={toggleAllFolders}
                      className="text-xs text-[#53BEE8] hover:text-[#53BEE8]/80 transition-colors"
                    >
                      {selectedFolders.length === folders.length + 1 ? 'すべて解除' : 'すべて選択'}
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {folders.map((folder) => (
                        <label
                          key={folder.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFolders.includes(folder.id)}
                            onChange={() => toggleFolder(folder.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 flex-1">{folder.name}</span>
                          <span className="text-xs text-gray-400">
                            {words.filter(w => w.folders?.includes(folder.id)).length}
                          </span>
                        </label>
                      ))}
                      
                      <label className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFolders.includes('no-folder')}
                          onChange={() => toggleFolder('no-folder')}
                          className="w-4 h-4 rounded border-gray-300 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 flex-1">フォルダなし</span>
                        <span className="text-xs text-gray-400">
                          {words.filter(w => !w.folders || w.folders.length === 0).length}
                        </span>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    選択: {selectedFolders.length}個 / 全{folders.length + 1}個
                  </p>
                </div>

                {/* Front display setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    カード正面の表示
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="frontDisplay"
                        value="japanese"
                        checked={frontDisplayType === 'japanese'}
                        onChange={(e) => setFrontDisplayType(e.target.value as FrontDisplayType)}
                        className="w-4 h-4 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">日本語</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="frontDisplay"
                        value="chinese"
                        checked={frontDisplayType === 'chinese'}
                        onChange={(e) => setFrontDisplayType(e.target.value as FrontDisplayType)}
                        className="w-4 h-4 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">中国語</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="frontDisplay"
                        value="english"
                        checked={frontDisplayType === 'english'}
                        onChange={(e) => setFrontDisplayType(e.target.value as FrontDisplayType)}
                        className="w-4 h-4 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">英語</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="frontDisplay"
                        value="image"
                        checked={frontDisplayType === 'image'}
                        onChange={(e) => setFrontDisplayType(e.target.value as FrontDisplayType)}
                        className="w-4 h-4 text-[#53BEE8] focus:ring-[#53BEE8] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">画像</span>
                    </label>
                  </div>
                  <div className="mt-3 p-3 bg-[#53BEE8]/10 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>フォールバック順序：</strong><br />
                      選択した内容がない場合、日本語 → 中国語 → 英語 → 画像の順で代替表示されます
                    </p>
                  </div>
                </div>

                {/* Study rules info */}
                <div className="p-4 bg-gradient-to-br from-[#53BEE8]/10 to-[#2AC69E]/10 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">復習ルール</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• <strong className="text-[#F7893F]">難しい</strong> → 翌日に再表示</li>
                    <li>• <strong className="text-[#53BEE8]">普通</strong> → 3日後に再表示</li>
                    <li>• <strong className="text-[#2AC69E]">簡単</strong> → 1週間後に再表示</li>
                    <li>• 連続2回「普通」→「簡単」に変換</li>
                    <li>• 連続2回「簡単」→ 学習完了</li>
                  </ul>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors border-none"
                >
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}