import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Volume2, Tag, Folder, Languages, BookOpen, Globe, Brain, Calendar, TrendingUp } from 'lucide-react';
import { Word, Folder as FolderType } from '../types';

interface WordDetailScreenProps {
  words: Word[];
  folders: FolderType[];
}

export function WordDetailScreen({ words, folders }: WordDetailScreenProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const word = words.find((w) => w.id === id);

  if (!word) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">単語が見つかりません</p>
          <button
            onClick={() => navigate('/list')}
            className="text-[#53BEE8] hover:text-[#53BEE8]/80"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      alert('お使いのブラウザは音声再生に対応していません');
    }
  };

  const handleFolderClick = (folderId: string) => {
    sessionStorage.setItem('selectedFolderId', folderId);
    navigate('/list');
  };

  const getFolderName = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : folderId;
  };

  // Get difficulty badge color and label
  const getDifficultyInfo = (difficulty: 'hard' | 'good' | 'easy' | 'completed') => {
    switch (difficulty) {
      case 'hard':
        return { color: '#F7893F', label: '難しい', bgColor: 'bg-[#F7893F]/10', textColor: 'text-[#F7893F]' };
      case 'good':
        return { color: '#53BEE8', label: '普通', bgColor: 'bg-[#53BEE8]/10', textColor: 'text-[#53BEE8]' };
      case 'easy':
        return { color: '#2AC69E', label: '簡単', bgColor: 'bg-[#2AC69E]/10', textColor: 'text-[#2AC69E]' };
      case 'completed':
        return { color: '#9CA3AF', label: '学習完了', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return '今日復習可能';
    } else if (diffDays === 0) {
      return '今日';
    } else if (diffDays === 1) {
      return '明日';
    } else {
      return `${diffDays}日後`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl">単語詳細</h1>
          </div>
          <button
            onClick={() => navigate(`/edit/${word.id}`)}
            className="p-2 text-[#53BEE8] hover:text-[#53BEE8]/80 transition-colors"
          >
            <Edit size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 日本語と片仮名 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-3">
  <div className="flex-1">
    <p className="text-4xl mb-2">{word.word}</p>
    {word.katakana && (
      <p className="text-base text-gray-600">{word.katakana}</p>
    )}
  </div>

  <button
    onClick={() => handleSpeak(word.word, 'ja-JP')}
    className="p-2 text-[#53BEE8] hover:bg-[#53BEE8]/10 rounded-lg transition-colors flex-shrink-0"
    aria-label="日本語発音"
  >
    <Volume2 size={24} />
  </button>
</div>

          </div>

          {/* 中国語翻訳 */}
          {word.chinese && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3">
  {/* 中文标识 中 */}
  <div className="flex-shrink-0 mt-1 text-[rgb(83,190,232)] font-semibold text-lg">
    中
  </div>

  <p className="text-xl">{word.chinese}</p>
</div>

            </div>
          )}

          {/* 英語翻訳と音標 */}
          {word.english && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3">
  {/* 英文标识 En */}
  <div className="flex-shrink-0 mt-1 text-[rgb(83,190,232)] font-semibold text-lg">
    En
  </div>

  <div className="flex-1">
    <p className="text-xl mb-1">{word.english}</p>
    {word.phonetic && (
      <p className="text-sm text-gray-500">{word.phonetic}</p>
    )}
  </div>

  <button
    onClick={() => handleSpeak(word.english, 'en-US')}
    className="p-2 text-[rgb(83,190,232)] hover:bg-[#2AC69E]/10 rounded-lg transition-colors flex-shrink-0 text-[9px]"
    aria-label="英語発音"
  >
    <Volume2 size={24} />
  </button>
</div>

            </div>
          )}

          {/* その他の翻訳 */}
          {word.otherTranslations && word.otherTranslations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3">
  {/* 替换图标为书本 */}
  <BookOpen size={24} className="text-[#53BEE8] flex-shrink-0 mt-1" />

  <div className="flex-1 space-y-2">
    {word.otherTranslations.map((translation, index) => (
      <p key={index} className="text-base text-gray-700">{translation}</p>
    ))}
  </div>
</div>

            </div>
          )}

          {/* 画像 */}
          {word.imageUrl && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={word.imageUrl}
                alt={word.word}
                className="w-full aspect-square object-cover"
              />
            </div>
          )}

          {/* タグ */}
          {word.tags && word.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Tag size={16} />
                タグ
              </h2>
              <div className="flex flex-wrap gap-2">
                {word.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#53BEE8]/10 text-[#53BEE8] rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 所属フォルダ */}
          {word.folders && word.folders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Folder size={16} />
                所属フォルダ
              </h2>
              <div className="space-y-2">
                {word.folders.map((folder, index) => (
                  <button
                    key={index}
                    onClick={() => handleFolderClick(folder)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left flex items-center gap-2"
                  >
                    <Folder size={18} className="text-gray-600" />
                    <span className="text-gray-700">{getFolderName(folder)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 学習状態 */}
          {word.studyState && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Brain size={16} />
                学習状態
              </h2>
              
              <div className="space-y-3">
                {/* Difficulty status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">現在のレベル</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyInfo(word.studyState.difficulty).bgColor} ${getDifficultyInfo(word.studyState.difficulty).textColor}`}>
                    {getDifficultyInfo(word.studyState.difficulty).label}
                  </span>
                </div>

                {/* Next review date */}
                {word.studyState.difficulty !== 'completed' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">次回復習</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(word.studyState.nextReviewDate)}
                    </span>
                  </div>
                )}

                {/* Next review full date */}
                {word.studyState.difficulty !== 'completed' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-500">復習予定日</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(word.studyState.nextReviewDate).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Last review date */}
                {word.studyState.lastReviewDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">前回復習日</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(word.studyState.lastReviewDate).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Progress indicators */}
                {(word.studyState.consecutiveEasyCount > 0 || word.studyState.consecutiveGoodCount > 0) && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">進捗状況</p>
                    {word.studyState.consecutiveEasyCount > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-1">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < word.studyState!.consecutiveEasyCount
                                  ? 'bg-[#2AC69E]'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          連続「簡単」: {word.studyState.consecutiveEasyCount}/2
                        </span>
                      </div>
                    )}
                    {word.studyState.consecutiveGoodCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < word.studyState!.consecutiveGoodCount
                                  ? 'bg-[#53BEE8]'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          連続「普通」: {word.studyState.consecutiveGoodCount}/2
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 登録日時（右下固定） */}
        <div className="fixed bottom-20 right-4 text-xs text-gray-400">
          {new Date(word.createdAt).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}