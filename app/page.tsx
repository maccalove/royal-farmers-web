"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link'; // 核心：引入跳转组件
import { Users, DollarSign, Trophy, Calendar, Activity } from 'lucide-react';

// --- 1. 初始化 Supabase 客户端 ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 类型定义 ---
type Player = {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  goals?: number;   // 稍后从统计视图获取
  assists?: number; // 稍后从统计视图获取
  rating?: number;  // 稍后从统计视图获取
};

export default function TeamDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 2. 核心：从数据库获取球员数据 ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 从 players 表抓取数据，按号码排序
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('jersey_number', { ascending: true });

        if (error) {
          console.error('Error fetching players:', error);
        } else if (data) {
          setPlayers(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // --- 模拟数据 (用于还未导入的比赛和财务部分) ---
  const MATCHES = [
    { id: 402, date: '2025-08-09', type: '对外友谊赛', venue: '琦逸足球场', opponent: '绿色的队伍', result: '7-8', outcome: 'loss', fees: 800 },
    { id: 401, date: '2025-08-07', type: '对外友谊赛', venue: '台地花园', opponent: '招商银行', result: '21-8', outcome: 'win', fees: 750 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-[#D9232E] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#C59D3F]">
              <span className="text-[#D9232E] font-bold text-xs">RFC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ROYAL FARMERS FC</h1>
              <p className="text-xs text-[#C59D3F] font-medium tracking-wider">EST. 2020</p>
            </div>
          </div>
          <button className="bg-[#C59D3F] hover:bg-[#b08d36] text-white px-4 py-2 rounded-md text-sm font-semibold transition shadow-sm">
            + 记一场
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 w-full md:w-auto inline-flex overflow-x-auto">
          {['overview', 'matches', 'finance', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                ? 'bg-[#D9232E] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && '总览'}
              {tab === 'matches' && '比赛日志'}
              {tab === 'finance' && '财务管理'}
              {tab === 'stats' && '数据榜单'}
            </button>
          ))}
        </div>

        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* 动态统计卡片 */}
            <StatCard title="注册球员" value={players.length.toString()} icon={<Users className="text-blue-600" />} trend="实时" />
            <StatCard title="本赛季场次" value="-" icon={<Calendar className="text-[#D9232E]" />} trend="待导入" />
            <StatCard title="总进球数" value="-" icon={<Activity className="text-[#C59D3F]" />} trend="待导入" />
            <StatCard title="球队基金" value="¥ -" icon={<DollarSign className="text-green-600" />} trend="待导入" />
            
            <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center"><Trophy className="w-5 h-5 text-[#C59D3F] mr-2" /> 球员名单 (点击查看详情)</div>
                {loading && <span className="text-xs text-gray-400">加载中...</span>}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">号码</th>
                      <th className="px-4 py-3">球员姓名</th>
                      <th className="px-4 py-3">位置</th>
                      <th className="px-4 py-3 text-right">进球 (暂无)</th>
                      <th className="px-4 py-3 text-right">助攻 (暂无)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {players.map((p) => (
                      <tr 
                        key={p.id} 
                        className="group hover:bg-red-50 transition-colors cursor-pointer relative"
                      >
                        {/* 这里的 Link 设置了 absolute inset-0，使得点击整行任何地方都会跳转 */}
                        
                        <td className="px-4 py-3 font-medium text-gray-400 relative">
                          <Link href={`/players/${p.id}`} className="absolute inset-0 z-10" />
                          #{p.jersey_number}
                        </td>
                        
                        <td className="px-4 py-3 font-bold text-[#D9232E] relative">
                          <Link href={`/players/${p.id}`} className="absolute inset-0 z-10" />
                          {p.name}
                        </td>
                        
                        <td className="px-4 py-3 text-gray-600 relative">
                          <Link href={`/players/${p.id}`} className="absolute inset-0 z-10" />
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs group-hover:bg-white transition-colors">{p.position || '-'}</span>
                        </td>
                        
                        <td className="px-4 py-3 text-right font-medium text-gray-400 relative">
                          <Link href={`/players/${p.id}`} className="absolute inset-0 z-10" />
                          {p.goals || 0}
                        </td>
                        
                        <td className="px-4 py-3 text-right text-gray-400 relative">
                          <Link href={`/players/${p.id}`} className="absolute inset-0 z-10" />
                          {p.assists || 0}
                        </td>
                      </tr>
                    ))}
                    {!loading && players.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          暂无球员数据，请确认 CSV 导入是否成功
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">下场比赛</h3>
              <div className="bg-gradient-to-br from-[#D9232E] to-[#b01620] text-white rounded-lg p-5 text-center">
                <div className="text-xs opacity-75 mb-1">2025/12/20 周六 20:00</div>
                <div className="text-2xl font-bold mb-2">VS 曼彻斯特红</div>
                <div className="text-sm opacity-90 mb-4">📍 琦逸足球场</div>
                <button className="w-full bg-white text-[#D9232E] py-2 rounded font-bold text-sm hover:bg-gray-100">
                  报名 (12/20)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 其他 Tab 保持模拟展示 */}
        {activeTab === 'finance' && (
          <div className="bg-white p-10 text-center text-gray-500">
             财务模块开发中... <br/>(请在 Supabase 导入 Match Stats 后显示)
          </div>
        )}

        {activeTab === 'matches' && (
           <div className="space-y-4">
           {MATCHES.map((match) => (
             <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-center justify-between">
               <div className="flex items-center space-x-6">
                 <div className="text-center w-16 shrink-0">
                   <div className="text-xs text-gray-400 font-bold uppercase">2025</div>
                   <div className="text-lg font-bold text-gray-800">DEMO</div>
                 </div>
                 <div>
                   <div className="text-xs text-[#C59D3F] font-bold uppercase tracking-wider mb-1">{match.type}</div>
                   <div className="flex items-center space-x-3 text-lg font-bold">
                     <span className="text-[#D9232E]">Royal Farmers</span>
                     <span className="px-3 py-1 bg-gray-100 rounded text-xl">{match.result}</span>
                     <span className="text-gray-600">{match.opponent}</span>
                   </div>
                 </div>
               </div>
             </div>
           ))}
           <div className="text-center text-xs text-gray-400 mt-4">以上为演示数据，真实比赛记录请录入 Supabase</div>
         </div>
        )}

      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-2 inline-block">
          {trend}
        </span>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
}