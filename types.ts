
export type AutoMode = 'none' | 'turns' | 'target';

export interface AutoConfig {
  mode: AutoMode;
  turns: number;
  targetCount: number;
  resultTemplate: string;
  autoResultTemplate: string;
  removeOnWin: boolean;
}

export interface EntryCount {
  name: string;
  count: number;
  lastWonAt?: number;
  isRemoved?: boolean;
}

export const DEFAULT_ENTRIES = "Giải Nhất\nGiải Nhì\nGiải Ba\nKhuyến Khích\nMay Mắn Lần Sau";
export const DEFAULT_RESULT_TEMPLATE = "Bạn đã chọn được [winner]";
export const DEFAULT_AUTO_RESULT_TEMPLATE = "Chúc mừng [winner] đã được chọn với [count] lượt";
