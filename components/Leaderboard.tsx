
import React from 'react';
import { EntryCount } from '../types';

interface LeaderboardProps {
  data: EntryCount[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return (a.lastWonAt || 0) - (b.lastWonAt || 0);
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
        <span className="text-xl">🏆</span> Bảng Xếp Hạng
      </h2>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạng</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thành phần</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Lượt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedData.map((item, index) => (
              <tr key={item.name} className={`transition-colors ${index === 0 ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-4 font-black text-slate-400 text-sm">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className={`px-4 py-4 text-sm font-bold ${item.isRemoved ? 'line-through text-slate-300' : 'text-slate-700'}`}>
                  {item.name}
                  {item.isRemoved && <span className="ml-2 text-[8px] font-normal uppercase italic bg-slate-100 px-1 rounded">Đã xóa</span>}
                </td>
                <td className={`px-4 py-4 text-sm font-black text-right ${item.isRemoved ? 'text-slate-300' : 'text-indigo-600'}`}>
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
