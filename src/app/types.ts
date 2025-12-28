export interface Word {
  id: string;
  word: string; // 日本語
  katakana: string; // カタカナ
  chinese?: string; // 中国語翻訳
  english?: string; // 英語翻訳
  phonetic?: string; // 英語音標
  otherTranslations?: string[]; // その他の翻訳
  imageUrl?: string; // 画像URL
  tags?: string[]; // タグ
  folders?: string[]; // 所属フォルダ（複数可能）
  createdAt: string;
  studyState?: {
    difficulty: 'hard' | 'good' | 'easy' | 'completed'; // completed = 連続2回簡単
    nextReviewDate: string; // ISO date string
    consecutiveEasyCount: number; // 連続簡単回数
    consecutiveGoodCount: number; // 連続普通回数
    lastReviewDate: string; // 最後の復習日
  };
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = ルートフォルダ
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}