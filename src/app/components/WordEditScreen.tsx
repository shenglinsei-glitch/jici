import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
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

  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word,
        katakana: word.katakana,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.word) {
      onUpdateWord(word.id, {
        word: formData.word,
        katakana: formData.katakana || '',
        chinese: formData.chinese || undefined,
        english: formData.english || undefined,
        phonetic: formData.phonetic || undefined,
        otherTranslations: formData.otherTranslations.length > 0 ? formData.otherTranslations : undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        folders: formData.folders.length > 0 ? formData.folders : undefined,
      });
      navigate(`/detail/${word.id}`);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`「${word.word}」を削除しますか？\nこの操作は取り消せません。`)) {
      onDeleteWord(word.id);
      navigate('/list');
    }
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

  const availableFolders = folders.filter(f => !formData.folders.includes(f.id));

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl">単語を編集</h1>
          </div>
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
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, katakana: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: トモダチ"
            />
          </div>

          {/* 中国語 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">中国語</label>
            <input
              type="text"
              value={formData.chinese}
              onChange={(e) => setFormData({ ...formData, chinese: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, english: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: friend"
            />
          </div>

          {/* 英語音標 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <label className="block text-sm mb-2 text-gray-700">英語音標</label>
            <input
              type="text"
              value={formData.phonetic}
              onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
              placeholder="例: /frend/"
            />
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
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-[#53BEE8] text-white rounded-lg hover:bg-[#53BEE8]/90 transition-colors flex items-center justify-center gap-2 border-none"
            >
              <Save size={20} />
              保存する
            </button>
          </div>

          {/* 削除ボタン */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-3 px-6 bg-[#F7893F] text-white rounded-lg hover:bg-[#F7893F]/90 transition-colors flex items-center justify-center gap-2 border-none"
            >
              <Trash2 size={20} />
              この単語を削除
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}