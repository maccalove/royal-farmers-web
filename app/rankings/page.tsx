'use client'; // 这是一个交互式页面，必须加这一行

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Trophy, Footprints, Filter, Medal } from 'lucide-react';

// --- 初始化 Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RankingsPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('All-Time');
  const [loading, setLoading] = useState(true);

  // 1. 加载数据
  useEffect(() => {
    async function fetchData() {
      // 联表查询：统计表 -> 关联比赛(获取赛季) -> 关联球员(获取名字头像)
      const { data, error } = await supabase
        .from('match_stats')
        .select(`
          goals,
          assists,
          matches (season),
          players (id, name, avatar_url, jersey_number)
        `);

      if (data) {
        setStats(data);
        
        // 提取所有出现的赛季年份，并去重
        const allSeasons = Array.from(new Set(data.map((item: any) => item.matches?.season))).filter(Boolean).sort().reverse();
        setSeasons(allSeasons as string[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. 核心逻辑：根据选中的赛季计算榜单
  const calculateRankings = () => {
    const playerMap = new Map();

    stats.forEach((record: any) => {
      // 筛选逻辑：如果是 "All-Time" 或者 赛季匹配，才统计
      if (selectedSeason === 'All-Time' || record.matches?.season === selectedSeason) {
        const pid = record.players?.id;
        if (!pid) return;

        if (!playerMap.has(pid)) {
          playerMap.set(pid, {
            ...record.players,
            totalGoals: 0,
            totalAssists: 0
          });
        }
        const p = playerMap.get(pid);
        p.totalGoals += (record.goals || 0);
        p.totalAssists += (record.assists || 0);
      }
    });

    const rankingList = Array.from(playerMap.values());
    
    // 生成射手榜 (进球降序，进球相同看助攻)
    const scorers = [...rankingList]
      .sort((a, b) => b.totalGoals - a.totalGoals || b.totalAssists - a.totalAssists)
      .filter(p => p.totalGoals > 0)
      .slice(0, 10); // 只取前10名

    // 生成助攻榜 (助攻降序，助攻相同看进球)
    const assisters = [...rankingList]
      .sort((a, b) => b.totalAssists - a.totalAssists || b.totalGoals - a.totalGoals)
      .filter(p => p.totalAssists > 0)
      .slice(0, 10);

    return { scorers, assisters };
  };

  const { scorers, assisters } = calculateRankings();

  // --- UI 组件：榜单卡片 ---
  const RankingCard = ({ title, icon, color, data, valueKey }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 头部 */}
      <div className={`p-4 flex items-center justify-between ${color} text-white`}>
        <div className="flex items-center font-bold text-lg">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        <div className="text-xs font-mono bg-white/20 px-2 py-1 rounded">Top 10</div>
      </div>
      
      {/* 列表 */}
      <div className="divide-y divide-gray-50">
        {data.map((player: any, index: number) => (
          <Link key={player.id} href={`/players/${player.id}`} className="flex items-center p-4 hover:bg-gray-50 transition group">
            
            {/* 排名序号 */}
            <div className={`w-8 font-black text-xl italic mr-3 ${index < 3 ? 'text-[#D9232E]' : 'text-gray-300'}`}>
              {index + 1}
            </div>

            {/* 头像 */}
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100 mr-3">
              {player.avatar_url ? (
                <img src={player.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                  {player.jersey_number}
                </div>
              )}
            </div>

            {/* 名字 */}
            <div className="flex-1 font-bold text-gray-700 group-hover:text-[#D9232E] transition">
              {player.name}
            </div>

            {/* 数据值 */}
            <div className={`text-xl font-black ${index < 3 ? 'text-gray-900' : 'text-gray-500'}`}>
              {player[valueKey]}
            </div>
          </Link>
        ))}
        {data.length === 0 && <div className="p-8 text-center text-gray-400">暂无数据</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* 导航 */}
      <nav className="bg-[#D9232E] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center font-bold hover:opacity-80">
            <ArrowLeft className="w-5 h-5 mr-2" /> 皇家农夫数据中心
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 标题与筛选器 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 italic uppercase">Season Rankings</h1>
            <p className="text-gray-500 text-sm mt-1">数据见证传奇</p>
          </div>

          {/* 赛季下拉菜单 */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <select 
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#D9232E]"
            >
              <option value="All-Time">全部赛季 (All-Time)</option>
              {seasons.map(s => <option key={s} value={s}>{s} 赛季</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">计算中...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 射手榜 */}
            <RankingCard 
              title="射手榜 (Golden Boot)" 
              icon={<Trophy className="w-5 h-5" />} 
              color="bg-gradient-to-r from-yellow-500 to-amber-600"
              data={scorers} 
              valueKey="totalGoals" 
            />

            {/* 助攻榜 */}
            <RankingCard 
              title="助攻王 (Assist King)" 
              icon={<Footprints className="w-5 h-5" />} 
              color="bg-gradient-to-r from-blue-500 to-cyan-600"
              data={assisters} 
              valueKey="totalAssists" 
            />
          </div>
        )}

      </div>
    </div>
  );
}