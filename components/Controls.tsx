
import React from 'react';
import { AutoConfig, AutoMode, DEFAULT_ENTRIES } from '../types';

interface ControlsProps {
  inputText: string;
  setInputText: (val: string) => void;
  autoConfig: AutoConfig;
  setAutoConfig: (val: AutoConfig) => void;
  onResetLeaderboard: () => void;
  onResetText: () => void;
  onResetAll: () => void;
  isSpinning: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  inputText,
  setInputText,
  autoConfig,
  setAutoConfig,
  onResetLeaderboard,
  onResetText,
  onResetAll,
  isSpinning
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-tight">
          Danh sách thành phần (Mỗi dòng 1 cái)
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập nội dung tại đây..."
          className="w-full h-40 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none shadow-inner"
          disabled={isSpinning}
        />
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Cấu hình quay</h3>
            <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-600 transition-colors uppercase">Xóa khi trúng</span>
                <div className="relative inline-flex items-center">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={autoConfig.removeOnWin}
                        onChange={(e) => setAutoConfig({...autoConfig, removeOnWin: e.target.checked})}
                        disabled={isSpinning}
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
            </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="autoMode"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                checked={autoConfig.mode === 'none'}
                onChange={() => setAutoConfig({ ...autoConfig, mode: 'none' })}
                disabled={isSpinning}
              />
              Quay thủ công
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="autoMode"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                checked={autoConfig.mode === 'turns'}
                onChange={() => setAutoConfig({ ...autoConfig, mode: 'turns' })}
                disabled={isSpinning}
              />
              Số lượt:
              <input
                type="number"
                min="1"
                value={autoConfig.turns}
                onChange={(e) => setAutoConfig({ ...autoConfig, turns: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center ml-auto focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isSpinning || autoConfig.mode !== 'turns'}
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="autoMode"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                checked={autoConfig.mode === 'target'}
                onChange={() => setAutoConfig({ ...autoConfig, mode: 'target' })}
                disabled={isSpinning}
              />
              Mục tiêu:
              <input
                type="number"
                min="1"
                value={autoConfig.targetCount}
                onChange={(e) => setAutoConfig({ ...autoConfig, targetCount: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center ml-auto focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isSpinning || autoConfig.mode !== 'target'}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Thông báo trúng ([winner])</label>
              <input 
                type="text"
                value={autoConfig.resultTemplate}
                onChange={(e) => setAutoConfig({...autoConfig, resultTemplate: e.target.value})}
                className="w-full text-xs p-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Mẫu thông báo..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Thông báo tự động ([winner], [count])</label>
              <input 
                type="text"
                value={autoConfig.autoResultTemplate}
                onChange={(e) => setAutoConfig({...autoConfig, autoResultTemplate: e.target.value})}
                className="w-full text-xs p-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Mẫu kết thúc tự động..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
        <button
          onClick={onResetLeaderboard}
          disabled={isSpinning}
          className="px-2 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-all active:scale-95 text-[10px] uppercase shadow-sm"
        >
          Reset BXH
        </button>
        <button
          onClick={onResetText}
          disabled={isSpinning}
          className="px-2 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 text-[10px] uppercase shadow-sm"
        >
          Reset ND
        </button>
        <button
          onClick={onResetAll}
          disabled={isSpinning}
          className="px-2 py-2 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all active:scale-95 text-[10px] uppercase shadow-sm"
        >
          Mặc Định
        </button>
      </div>
    </div>
  );
};

export default Controls;
