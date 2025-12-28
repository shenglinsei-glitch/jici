import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Word } from '../types';
import * as XLSX from 'xlsx';

interface WordAddScreenProps {
  onAddWord: (word: Omit<Word, 'id' | 'createdAt'>) => void;
  onAddWords: (words: Omit<Word, 'id' | 'createdAt'>[]) => void;
  existingWords: Word[];
}

interface ParsedWord {
  word: string;
  katakana: string;
  chinese?: string;
  english?: string;
  error?: string;
  isDuplicate?: boolean;
  isExisting?: boolean;
}

interface ImportResult {
  total: number;
  success: number;
  errors: number;
}

export function WordAddScreen({ onAddWord, onAddWords, existingWords }: WordAddScreenProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
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

  const [importData, setImportData] = useState<ParsedWord[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.word) {
      onAddWord({
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
      navigate('/list');
    }
  };

  const parseTextLine = (line: string): ParsedWord | null => {
    // Skip empty lines
    const trimmed = line.trim();
    if (!trimmed) return null;

    let parts: string[] = [];
    
    // Try different delimiters in order: comma (CSV), tab, space
    if (trimmed.includes(',')) {
      // CSV format
      parts = trimmed.split(',').map(p => p.trim());
    } else if (trimmed.includes('\t')) {
      // Tab-separated
      parts = trimmed.split('\t').map(p => p.trim());
    } else {
      // Space-separated (support both single and multiple spaces)
      parts = trimmed.split(/\s+/).map(p => p.trim());
    }
    
    // Filter out empty parts
    parts = parts.filter(p => p !== '');
    
    // Check if we have at least Japanese word
    if (parts.length === 0 || !parts[0] || parts[0] === '-') {
      return {
        word: '',
        katakana: '',
        error: '日本語が必要です'
      };
    }

    // Check for insufficient columns (at least 2 fields recommended)
    const hasInsufficientColumns = parts.length < 2;
    
    // Map fields to word object, treating "-" as empty
    const result: ParsedWord = {
      word: parts[0] === '-' ? '' : parts[0],
      katakana: parts[1] && parts[1] !== '-' ? parts[1] : '',
      chinese: parts[2] && parts[2] !== '-' ? parts[2] : undefined,
      english: parts[3] && parts[3] !== '-' ? parts[3] : undefined,
    };

    // Mark as warning if columns are insufficient
    if (hasInsufficientColumns && result.word) {
      result.error = '列が不足しています（カタカナ以降が空です）';
    }

    return result;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: ParsedWord[] = [];

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

        jsonData.forEach((row) => {
          if (row.length === 0) return;
          
          const word = row[0]?.toString().trim() || '';
          const katakana = row[1]?.toString().trim() || '';
          const chinese = row[2]?.toString().trim() || undefined;
          const english = row[3]?.toString().trim() || undefined;

          // Skip if no Japanese word
          if (!word || word === '-') return;

          const hasInsufficientColumns = row.length < 2;

          const item: ParsedWord = {
            word,
            katakana: katakana === '-' ? '' : katakana,
            chinese: chinese === '-' ? undefined : chinese,
            english: english === '-' ? undefined : english,
          };

          // Mark as warning if columns are insufficient
          if (hasInsufficientColumns) {
            item.error = '列が不足しています（カタカナ以降が空です）';
          }

          parsedData.push(item);
        });
      } else {
        // Handle text/CSV files
        const text = await file.text();
        const lines = text.split('\n');

        lines.forEach((line) => {
          const parsed = parseTextLine(line);
          if (parsed) {
            parsedData.push(parsed);
          }
        });
      }

      // Check for duplicates and existing words
      const seenWords = new Set<string>();
      parsedData.forEach((item, index) => {
        // Check if this word appears earlier in the list (duplicate within import)
        const isDuplicateInImport = seenWords.has(item.word);
        if (item.word) {
          seenWords.add(item.word);
        }
        
        // Check if word already exists in database
        const isExisting = existingWords.some(e => e.word === item.word);
        
        item.isDuplicate = isDuplicateInImport;
        item.isExisting = isExisting;
        
        if (isDuplicateInImport) {
          item.error = '重複しています（インポートデータ内）';
        } else if (isExisting) {
          item.error = '既に存在します（データベース内）';
        }
      });

      // Calculate results
      const validData = parsedData.filter(d => d.word && !d.error);
      const errorData = parsedData.filter(d => !d.word || d.error);

      setImportData(parsedData);
      setImportResult({
        total: parsedData.length,
        success: validData.length,
        errors: errorData.length,
      });
      setShowPreview(true);
    } catch (error) {
      alert('ファイルの読み込みに失敗しました: ' + (error as Error).message);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    const validWords = importData
      .filter(d => d.word && !d.error)
      .map(d => ({
        word: d.word,
        katakana: d.katakana || '',
        chinese: d.chinese,
        english: d.english,
      }));

    if (validWords.length > 0) {
      onAddWords(validWords);
      alert(`${validWords.length}件の単語をインポートしました！`);
      setShowPreview(false);
      setImportData([]);
      setImportResult(null);
      navigate('/list');
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setImportData([]);
    setImportResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 rounded-t-[0px] rounded-b-[10px]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl">単語を追加</h1>
          </div>

          {/* 主要なボタン（タブ切り替え） */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-[#53BEE8] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus size={18} />
              手動入力
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'import'
                  ? 'bg-[#53BEE8] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload size={18} />
              インポート
            </button>
          </div>
        </div>

        {/* 主要な情報エリア */}
        <div className="p-4">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    日本語<span className="text-[#F7893F]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) =>
                      setFormData({ ...formData, word: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                    placeholder="例: 友達"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    カタカナ
                  </label>
                  <input
                    type="text"
                    value={formData.katakana}
                    onChange={(e) =>
                      setFormData({ ...formData, katakana: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                    placeholder="例: トモダチ"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    中国語
                  </label>
                  <input
                    type="text"
                    value={formData.chinese}
                    onChange={(e) =>
                      setFormData({ ...formData, chinese: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                    placeholder="例: 朋友"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    英語
                  </label>
                  <input
                    type="text"
                    value={formData.english}
                    onChange={(e) =>
                      setFormData({ ...formData, english: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#53BEE8] focus:border-[#53BEE8] outline-none"
                    placeholder="例: friend"
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  ※ 詳細な情報は追加後に編集画面で設定できます
                </p>
              </div>

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
                  <Plus size={20} />
                  追加する
                </button>
              </div>
            </form>
          ) : showPreview ? (
            // Preview mode
            <div className="space-y-4">
              {/* Import Results */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#53BEE8]" />
                  インポート結果
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{importResult?.total || 0}</div>
                    <div className="text-sm text-gray-600">総データ数</div>
                  </div>
                  <div className="text-center p-3 bg-[#2AC69E]/10 rounded-lg">
                    <div className="text-2xl mb-1 text-[#2AC69E] flex items-center justify-center gap-1">
                      <CheckCircle size={20} />
                      {importResult?.success || 0}
                    </div>
                    <div className="text-sm text-gray-600">成功</div>
                  </div>
                  <div className="text-center p-3 bg-[#F7893F]/10 rounded-lg">
                    <div className="text-2xl mb-1 text-[#F7893F] flex items-center justify-center gap-1">
                      <XCircle size={20} />
                      {importResult?.errors || 0}
                    </div>
                    <div className="text-sm text-gray-600">エラー</div>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg mb-4">プレビュー</h3>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">日本語</th>
                        <th className="px-2 py-2 text-left">カタカナ</th>
                        <th className="px-2 py-2 text-left">中国語</th>
                        <th className="px-2 py-2 text-left">英語</th>
                        <th className="px-2 py-2 text-left">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((item, index) => (
                        <tr key={index} className={`border-t ${item.error ? 'bg-red-50' : ''}`}>
                          <td className="px-2 py-2">{item.word || '-'}</td>
                          <td className="px-2 py-2">{item.katakana || '-'}</td>
                          <td className="px-2 py-2">{item.chinese || '-'}</td>
                          <td className="px-2 py-2">{item.english || '-'}</td>
                          <td className="px-2 py-2">
                            {item.error ? (
                              <div className="flex flex-col">
                                <span className="text-[#F7893F] text-xs flex items-center gap-1">
                                  <XCircle size={14} />
                                  スキップ
                                </span>
                                <span className="text-xs text-gray-500 mt-1">{item.error}</span>
                              </div>
                            ) : (
                              <span className="text-[#2AC69E] text-xs flex items-center gap-1">
                                <CheckCircle size={14} />
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelPreview}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={!importResult || importResult.success === 0}
                  className="flex-1 py-3 px-6 bg-[#2AC69E] text-white rounded-lg hover:bg-[#2AC69E]/90 transition-colors flex items-center justify-center gap-2 border-none disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={20} />
                  インポート実行
                </button>
              </div>
            </div>
          ) : (
            // Import file selection mode
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg mb-2">ファイルからインポート</h3>
                <p className="text-sm text-gray-600">
                  TXT、CSV、XLSXファイルから一括で単語を追加できます
                </p>
              </div>

              <label className="block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#53BEE8] hover:bg-[#53BEE8]/5 transition-colors">
                  <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700 mb-1">
                    ファイルを選択またはドラッグ＆ドロップ
                  </p>
                  <p className="text-sm text-gray-500">
                    対応形式: TXT, CSV, XLSX
                  </p>
                </div>
              </label>

              <div className="bg-[#53BEE8]/10 border border-[#53BEE8]/20 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-[#53BEE8]" />
                  インポート形式
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium">対応フォーマット：</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>テキストファイル (.txt)</li>
                    <li>CSVファイル (.csv)</li>
                    <li>Excelファイル (.xlsx)</li>
                  </ul>
                  
                  <p className="font-medium mt-3">データ形式：</p>
                  <div className="bg-white rounded p-2 border border-gray-200 font-mono text-xs">
                    <div className="text-[#53BEE8] mb-1">日本語 カタカナ 中国語 英語</div>
                    <div className="text-gray-500">例: 犬 イヌ 狗 dog</div>
                  </div>
                  
                  <p className="mt-2 text-xs">
                    • スペース または タブ で区切る<br />
                    • 空欄は「-」で表す<br />
                    • 各列のデータは自動的に対応するフィールドに配置されます
                  </p>
                  
                  <div className="mt-3 p-2 bg-white rounded border border-[#2AC69E]/30">
                    <p className="text-xs font-medium text-[#2AC69E] mb-1">✓ 自動マッピング：</p>
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">第1列 →</span>
                        <span className="text-[#53BEE8]">日本語</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">第2列 →</span>
                        <span className="text-[#53BEE8]">カタカナ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">第3列 →</span>
                        <span className="text-[#F7893F]">中国語</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">第4列 →</span>
                        <span className="text-[#2AC69E]">英語</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}