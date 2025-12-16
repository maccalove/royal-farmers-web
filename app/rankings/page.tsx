"use client"; // 必须加这一行，因为使用了 useState

import { useState } from 'react';

// 1. 模拟数据 (通常这里你会从数据库获取)
const rawData = [
  { id: 1, name: "Seven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Seven", season: "2025", goals: 12, assists: 5, matches: 15, ratingTotal: 120.5 },
  { id: 1, name: "Seven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Seven", season: "2024", goals: 20, assists: 10, matches: 25, ratingTotal: 190.0 },
  { id: 2, name: "Tank", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tank", season: "2025", goals: 8, assists: 12, matches: 14, ratingTotal: 115.0 },
  { id: 2, name: "Tank", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tank", season: "2024", goals: 5, assists: 15, matches: 24, ratingTotal: 185.5 },
  { id: 3, name: "Panda", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Panda", season: "2025", goals: 15, assists: 2, matches: 13, ratingTotal: 98.0 },
  { id: 3, name: "Panda", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Panda", season: "2024", goals: 10, assists: 1, matches: 10, ratingTotal: 70.0 },
  { id: 4, name: "Leo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo", season: "2025", goals: 1, assists: 8, matches: 15, ratingTotal: 118.0 },
];

export default function Leaderboard() {
  const [season, setSeason] = useState('2025'); // 默认选中2025
  const [activeTab, setActiveTab] = useState('goals'); // 默认看进球榜

  // 2. 数据处理逻辑
  const processData = () => {
    let playerMap: any = {};

    rawData.forEach(record => {
      // 筛选赛季
      if (season !== 'all' && record.season !== season) return;

      if (!playerMap[record.id]) {
        playerMap[record.id] = {
          ...record,
          goals: 0,
          assists: 0,
          matches: 0,
          ratingTotal: 0
        };
      }
      playerMap[record.id].goals += record.goals;
      playerMap[record.id].assists += record.assists;
      playerMap[record.id].matches += record.matches;
      playerMap[record.id].ratingTotal += record.ratingTotal;
    });

    // 计算场均分并转为数组
    const list = Object.values(playerMap).map((p: any) => ({
      ...p,
      avgRating: p.matches > 0 ? (p.ratingTotal / p.matches).toFixed(1) : "0.0"
    }));

    // 排序
    list.sort((a: any, b: any) => {
      if (activeTab === 'rating') return b.avgRating - a.avgRating;
      return b[activeTab] - a[activeTab];
    });

    return list.slice(0, 10); // 只取前10
  };

  const displayData = processData();

  // 辅助函数：根据榜单类型显示单位
  const getUnit = () => {
    if (activeTab === 'goals') return '球';
    if (activeTab === 'assists') return '助攻';
    if (activeTab === 'matches') return '场';
    return '分';
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* 头部：标题 + 筛选 */}
        <div className="bg-green-900 p-6 flex flex-col md:flex-row justify-between items-center text-white">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">🏆 球队英雄榜</h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-green-200">赛季:</label>
            <select 
              value={season} 
              onChange={(e) => setSeason(e.target.value)}
              className="bg-green-800 text-white border border-green-600 rounded px-3 py-1 text-sm outline-none"
            >
              <option value="all">全部赛季 (All-Time)</option>
              <option value="2025">2025 赛季</option>
              <option value="2024">2024 赛季</option>
            </select>
          </div>
        </div>

        {/* 切换 Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['goals', 'assists', 'matches', 'rating'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition min-w-[80px] ${
                activeTab === tab 
                ? 'bg-green-800 text-white' 
                : 'text-gray-600 hover:text-green-800'
              }`}
            >
              {tab === 'goals' && '⚽ 进球'}
              {tab === 'assists' && '👟 助攻'}
              {tab === 'matches' && '⏱️ 出勤'}
              {tab === 'rating' && '⭐ 评分'}
            </button>
          ))}
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-gray-100">
          {displayData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">该赛季暂无数据</div>
          ) : (
            displayData.map((player: any, index: number) => {
              const rank = index + 1;
              let rankColor = "bg-gray-100 text-gray-500";
              if (rank === 1) rankColor = "bg-yellow-100 text-yellow-600";
              if (rank === 2) rankColor = "bg-gray-200 text-gray-600";
              if (rank === 3) rankColor = "bg-orange-100 text-orange-600";

              return (
                <div key={player.id} className="flex items-center p-4 hover:bg-green-50 transition">
                  {/* 排名 */}
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm mr-4 ${rankColor}`}>
                    {rank}
                  </div>
                  
                  {/* 头像信息 */}
                  <div className="flex items-center flex-grow">
                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm mr-3" />
                    <div>
                      <div className="font-bold text-gray-800">{player.name}</div>
                      <div className="text-xs text-gray-400">Royal Farmers FC</div>
                    </div>
                  </div>

                  {/* 数据数值 */}
                  <div className="text-right">
                    <div className="text-xl font-black text-green-900 leading-none">
                      {activeTab === 'rating' ? player.avgRating : player[activeTab]}
                      <span className="text-xs font-normal text-gray-500 ml-1">{getUnit()}</span>
                    </div>
                    {activeTab === 'rating' && (
                      <div className="text-xs text-gray-400 mt-1">{player.matches} 场比赛</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
           Next.js 版本组件 | 数据统计截止至: 2025-12-16
        </div>
      </div>
    </div>
  );
}