import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Word, Folder } from '../types';

interface WordEditScreenProps {
  words: Word[];
  folders: Folder[];
  onUpdateWord: (id: string, word: Omit<Word, 'id' | 'createdAt'>) => void;
  onDeleteWord: (id: string) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onRemoveWordFromFolder: (wordId: string, folderId: string) => void;
}

export function WordEditScreen({ words, folders, onUpdateWord, onDeleteWord, onAddFolder, onRemoveWordFromFolder }: WordEditScreenProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const word = words.find((w) => w.id === id);

  const [formData, setFormData] = useState({
    word: '',
    katakana: '',
    japaneseExplanation: '',
    chinese: '',
    english: '',
    phonetic: '',
    otherTranslations: [] as string[],
    imageUrl: '',
    tags: [] as string[],
    folders: [] as string[],
  });

  const [newOtherTranslation, setNewOtherTranslation] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isGeneratingPhonetic, setIsGeneratingPhonetic] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word,
        katakana: word.katakana,
        japaneseExplanation: word.japaneseExplanation || '',
        chinese: word.chinese || '',
        english: word.english || '',
        phonetic: word.phonetic || '',
        otherTranslations: word.otherTranslations || [],
        imageUrl: word.imageUrl || '',
        tags: word.tags || [],
        folders: word.folders || [],
      });
    }
  }, [word]);

  if (!word) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">単語が見つかりません</p>
          <button
            onClick={() => navigate('/list')}
            className="text-[#53BEE8] hover:opacity-70"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.word) {
      onUpdateWord(word.id, {
        word: formData.word,
        katakana: formData.katakana || '',
        japaneseExplanation: formData.japaneseExplanation || undefined,
        chinese: formData.chinese || undefined,
        english: formData.english || undefined,
        phonetic: formData.phonetic || undefined,
        otherTranslations: formData.otherTranslations.length > 0 ? formData.otherTranslations : undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        folders: formData.folders.length > 0 ? formData.folders : undefined,
      });
      navigate(`/detail/${word.id}`, { replace: true });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`「${word.word}」を削除しますか？\nこの操作は取り消せません。`)) {
      onDeleteWord(word.id);
      navigate('/list');
    }
  };

  const handleGeneratePhonetic = async () => {
    if (!formData.english || !formData.english.trim()) {
      alert('英語を入力してください');
      return;
    }

    const englishWord = formData.english.trim().toLowerCase();
    setIsGeneratingPhonetic(true);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('英標が見つかりませんでした。\n手動で入力してください。');
        } else {
          throw new Error('API request failed');
        }
        return;
      }

      const data = await response.json();
      
      // Extract phonetic from the response
      let phonetic = '';
      if (data && data.length > 0) {
        // Try to get phonetic from main object first
        if (data[0].phonetic) {
          phonetic = data[0].phonetic;
        } 
        // Otherwise try to get from phonetics array
        else if (data[0].phonetics && data[0].phonetics.length > 0) {
          // Find first phonetic with text
          const phoneticObj = data[0].phonetics.find((p: any) => p.text);
          if (phoneticObj) {
            phonetic = phoneticObj.text;
          }
        }
      }

      if (phonetic) {
        // Convert to simplified IPA for learning
        const simplifiedPhonetic = convertToSimplifiedIPA(phonetic);
        const wrapped = simplifiedPhonetic.startsWith('/') ? simplifiedPhonetic : `/${simplifiedPhonetic.replace(/^\/|\/$/g,'')}/`;
        setFormData({ ...formData, phonetic: wrapped });
        alert('英標を自動生成しました！');
      } else {
        alert('英標が見つかりませんでした。\n手動で入力してください。');
      }
    } catch (error) {
      console.error('Error generating phonetic:', error);
      alert('英標の生成に失敗しました。\nインターネット接続を確認してください。');
    } finally {
      setIsGeneratingPhonetic(false);
    }
  };

  // Convert IPA to simplified learning version
  const convertToSimplifiedIPA = (ipa: string): string => {
    let simplified = ipa;

    // Remove slashes and brackets
    simplified = simplified.replace(/[\/\[\]]/g, '');

    // IMPORTANT: Replace longer patterns first to avoid conflicts
    
    // Vowels - long vowels first (double letters)
    simplified = simplified.replace(/ɑː/g, 'aa');
    simplified = simplified.replace(/iː/g, 'ii');
    simplified = simplified.replace(/uː/g, 'uu');
    simplified = simplified.replace(/ɔː/g, 'oo');
    simplified = simplified.replace(/ɜː/g, 'er');
    
    // Diphthongs
    simplified = simplified.replace(/eɪ/g, 'ei');
    simplified = simplified.replace(/aɪ/g, 'ai');
    simplified = simplified.replace(/ɔɪ/g, 'oi');
    simplified = simplified.replace(/aʊ/g, 'au');
    simplified = simplified.replace(/oʊ/g, 'ou');
    
    // Consonant combinations (must come before single consonants)
    simplified = simplified.replace(/tʃ/g, 'ch');
    simplified = simplified.replace(/dʒ/g, 'j');
    
    // Single vowels
    simplified = simplified.replace(/[æʌɑə]/g, 'a');
    simplified = simplified.replace(/[ɛe]/g, 'e');
    simplified = simplified.replace(/ɪ/g, 'i');
    simplified = simplified.replace(/ʊ/g, 'u');
    simplified = simplified.replace(/ɔ/g, 'o');
    
    // Consonants
    simplified = simplified.replace(/ɹ/g, 'r');
    simplified = simplified.replace(/[θð]/g, 'th');
    simplified = simplified.replace(/ʃ/g, 'sh');
    simplified = simplified.replace(/ʒ/g, 'zh');
    simplified = simplified.replace(/ŋ/g, 'ng');

    return simplified;
  };

  const addOtherTranslation = () => {
    if (newOtherTranslation.trim()) {
      setFormData({
        ...formData,
        otherTranslations: [...formData.otherTranslations, newOtherTranslation.trim()],
      });
      setNewOtherTranslation('');
    }
  };

  const removeOtherTranslation = (index: number) => {
    setFormData({
      ...formData,
      otherTranslations: formData.otherTranslations.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const addFolder = () => {
    if (newFolder.trim() && !formData.folders.includes(newFolder.trim())) {
      const existingFolder = folders.find(f => f.name === newFolder.trim());
      if (existingFolder) {
        // 既存のフォルダを使用
        setFormData({
          ...formData,
          folders: [...formData.folders, existingFolder.id],
        });
      } else {
        // 新しいフォルダを作成
        const newFolderId = Date.now().toString();
        onAddFolder(newFolder.trim(), null);
        setFormData({
          ...formData,
          folders: [...formData.folders, newFolderId],
        });
      }
      setNewFolder('');
      setShowFolderDropdown(false);
    }
  };

  const selectExistingFolder = (folderId: string) => {
    if (!formData.folders.includes(folderId)) {
      setFormData({
        ...formData,
        folders: [...formData.folders, folderId],
      });
      setShowFolderDropdown(false);
    }
  };

  const getFolderName = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : folderId;
  };

  // 既存のすべてのタグを取得（重複なし）
  const getAllExistingTags = (): string[] => {
    const allTags = new Set<string>();
    words.forEach(word => {
      word.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const selectExistingTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
      setShowTagDropdown(false);
    }
  };

  const availableFolders = folders.filter(f => !formData.folders.includes(f.id));
  const availableTags = getAllExistingTags().filter(tag => !formData.tags.includes(tag));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。');
        return;
      }

      // ファイルタイプチェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFolder = (index: number) => {
    const folderId = formData.folders[index];
    onRemoveWordFromFolder(word.id, folderId);
    setFormData({
      ...formData,
      folders: formData.folders.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20 overflow-x-hidden flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 flex-1">
        {/* Floating header */}
        <div className="relative flex items-center justify-between mt-6 mb-6">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                if (window.confirm('変更があります。保存しますか？')) {
                  document.getElementById('word-edit-submit')?.click();
                } else {
                  navigate(`/detail/${word.id}`, { replace: true });
                }
              } else {
                navigate(`/detail/${word.id}`, { replace: true });
              }
            }}
            className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full shadow-md ring-1 ring-black/5 text-[#F7893F]"
          >
            <Trash2 size={20} />
          </button>
        </div>

<form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 日本語 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">
              日本語<span className="text-[#F7893F]">*</span>
            </label>
            <input
              type="text"
              value={formData.word}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, word: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              required
            />
          </div>

          {/* 片仮名 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">
              カタカナ
            </label>
            <input
              type="text"
              value={formData.katakana}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, katakana: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: トモダチ"
            />
          </div>

          {/* 日本語説明 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">日本語説明</label>
            <input
              type="text"
              value={formData.japaneseExplanation}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, japaneseExplanation: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: 友人"
            />
          </div>

          {/* 中国語 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">中国語</label>
            <input
              type="text"
              value={formData.chinese}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, chinese: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: 朋友"
            />
          </div>

          {/* 英語 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">英語</label>
            <input
              type="text"
              value={formData.english}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, english: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: friend"
            />
          </div>

          {/* 英語音標 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">英語音標</label>
              <button
                type="button"
                onClick={handleGeneratePhonetic}
                disabled={isGeneratingPhonetic || !formData.english}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed border-none"
              >
                <Wand2 size={16} />
                {isGeneratingPhonetic ? '生成中...' : '自動生成'}
              </button>
            </div>
            <input
              type="text"
              value={formData.phonetic}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, phonetic: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: /frend/"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 英語を入力後、「自動生成」ボタンで英標（IPA）を取得できます（要インターネット接続）<br />
              ※ 学習用簡化IPA（aa/ii/uu/oo = 長音、th/sh/ch等）で表示されます。正確な発音は音声再生を参考にしてください。
            </p>
          </div>

          {/* その他の翻訳 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-3 text-gray-700">その他の翻訳</label>
            <div className="space-y-2 mb-3">
              {formData.otherTranslations.map((translation, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-gray-700">{translation}</span>
                  <button
                    type="button"
                    onClick={() => removeOtherTranslation(index)}
                    className="text-[#F7893F] hover:text-[#F7893F]/80"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOtherTranslation}
                onChange={(e) => setNewOtherTranslation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherTranslation())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                placeholder="翻訳を追加"
              />
              <button
                type="button"
                onClick={addOtherTranslation}
                className="p-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 border-none"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* 画像URL */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} />
              画像URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => { setIsDirty(true); setFormData({ ...formData, imageUrl: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="プレビュー"
                  className="w-full aspect-square object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E画像を読み込めません%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              />
            </div>
          </div>

          {/* タグ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-3 text-gray-700">タグ</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 px-3 py-1 bg-[#53BEE8]/10 text-[#53BEE8] rounded-full">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="hover:text-[#53BEE8]/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 既存タグから選択 */}
            {availableTags.length > 0 && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-gray-700">既存タグから選択</span>
                  <span className={`transform transition-transform ${showTagDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showTagDropdown && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => selectExistingTag(tag)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                placeholder="タグを追加"
              />
              <button
                type="button"
                onClick={addTag}
                className="p-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 border-none"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* 所属フォルダ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-3 text-gray-700">所属フォルダ</label>
            <div className="space-y-2 mb-3">
              {formData.folders.map((folder, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-gray-700">{getFolderName(folder)}</span>
                  <button
                    type="button"
                    onClick={() => removeFolder(index)}
                    className="text-[#F7893F] hover:text-[#F7893F]/80"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 既存フォルダから選択 */}
            {availableFolders.length > 0 && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-gray-700">既存フォルダから選択</span>
                  <span className={`transform transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showFolderDropdown && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                    {availableFolders.map(folder => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => selectExistingFolder(folder.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 新しいフォルダを入力 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFolder())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                placeholder="新しいフォルダを追加"
              />
              <button
                type="button"
                onClick={addFolder}
                className="p-2 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 border-none"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/detail/${word.id}`)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              id="word-edit-submit"
              type="submit"
              className="flex-1 py-3 px-6 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors flex items-center justify-center gap-2 border-none"
            >
              <Save size={20} />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}