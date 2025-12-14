"use client";

import React, { useState } from 'react';
import { Users, DollarSign, Trophy, Calendar, ChevronRight, Activity, PlusCircle } from 'lucide-react';

// --- 模拟数据 (基于您的截图) ---
const PLAYERS = [
  { id: 1, name: '姜珂', number: 10, position: '前锋', matches: 360, goals: 783, assists: 1034, rating: 9.8 },
  { id: 2, name: '金辉', number: 81, position: '前锋', matches: 285, goals: 435, assists: 179, rating: 8.5 },
  { id: 3, name: '陶骏', number: 7, position: '中场', matches: 278, goals: 285, assists: 252, rating: 8.2 },
  { id: 4, name: '鲍梁剑', number: 22, position: '后卫', matches: 184, goals: 73, assists: 59, rating: 7.5 },
];

const MATCHES = [
  { id: 402, date: '2025-08-09', type: '对外友谊赛', venue: '琦逸足球场', opponent: '绿色的队伍', result: '7-8', outcome: 'loss', fees: 800 },
  { id: 401, date: '2025-08-07', type: '对外友谊赛', venue: '台地花园', opponent: '招商银行', result: '21-8', outcome: 'win', fees: 750 },
  { id: 400, date: '2025-08-02', type: '队内赛', venue: '台地花园', opponent: '老刘红队', result: '4-0', outcome: 'win', fees: 600 },
];

const FINANCE = [
  { name: '姜珂', balance: 200, history: [-64, -70, -70, 2000, -70, -70] },
  { name: '严俊', balance: -140, history: [0, 0, -70, 0, -70, -75] },
  { name: '鲍梁剑', balance: 50, history: [-68, 0, -70, -70, -70, -70] },
];

// --- 组件部分 ---

export default function TeamDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      {/* Header / Banner - 皇家农夫红金配色 */}
      <header className="bg-[#D9232E] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* 模拟Logo位置 */}
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
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 w-full md:w-auto inline-flex">
          {['overview', 'matches', 'finance', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
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
            <StatCard title="本赛季场次" value="42" icon={<Calendar className="text-[#D9232E]" />} trend="+4" />
            <StatCard title="总进球数" value="189" icon={<Activity className="text-[#C59D3F]" />} trend="+12%" />
            <StatCard title="球队基金" value="¥ 3,240" icon={<DollarSign className="text-green-600" />} trend="正常" />
            <StatCard title="注册球员" value="42" icon={<Users className="text-blue-600" />} trend="活跃" />
            
            <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-[#C59D3F] mr-2" /> 
                名人堂 (Top Stats)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">排名</th>
                      <th className="px-4 py-3">球员</th>
                      <th className="px-4 py-3 text-right">总进球</th>
                      <th className="px-4 py-3 text-right">总助攻</th>
                      <th className="px-4 py-3 text-right">效率值</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PLAYERS.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-red-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-400">#{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#D9232E]">{p.name} <span className="text-xs text-gray-400 font-normal">#{p.number}</span></td>
                        <td className="px-4 py-3 text-right font-medium">{p.goals}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{p.assists}</td>
                        <td className="px-4 py-3 text-right text-[#C59D3F] font-bold">{p.rating}</td>
                      </tr>
                    ))}
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

        {/* VIEW: FINANCE */}
        {activeTab === 'finance' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700">费用缴纳记录 (RMB)</h3>
              <span className="text-xs text-gray-500">红色为支出(-)，绿色为充值(+)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-gray-100 z-10 shadow-sm">姓名</th>
                    <th className="px-2 py-3 w-20">当前余额</th>
                    <th className="px-2 py-3 text-xs">10/25</th>
                    <th className="px-2 py-3 text-xs">10/29</th>
                    <th className="px-2 py-3 text-xs">11/01</th>
                    <th className="px-2 py-3 text-xs">11/05</th>
                    <th className="px-2 py-3 text-xs">11/08</th>
                    <th className="px-2 py-3 text-xs">11/12</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FINANCE.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-left font-bold text-gray-800 sticky left-0 bg-white z-10 shadow-sm">{f.name}</td>
                      <td className={`px-2 py-3 font-mono font-bold ${f.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {f.balance}
                      </td>
                      {f.history.map((amt, idx) => (
                        <td key={idx} className="px-2 py-3">
                          {amt === 0 ? (
                            <span className="text-gray-200">-</span>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${amt > 0 ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}>
                              {amt}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: MATCH LOG */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {MATCHES.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-center justify-between hover:border-[#C59D3F] transition-all cursor-pointer group">
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="text-center w-16 shrink-0">
                    <div className="text-xs text-gray-400 font-bold uppercase">{match.date.split('-')[0]}</div>
                    <div className="text-lg font-bold text-gray-800">{match.date.slice(5)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#C59D3F] font-bold uppercase tracking-wider mb-1">{match.type}</div>
                    <div className="flex items-center space-x-3 text-lg font-bold">
                      <span className="text-[#D9232E]">Royal Farmers</span>
                      <span className="px-3 py-1 bg-gray-100 rounded text-xl">{match.result}</span>
                      <span className="text-gray-600">{match.opponent}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <span className="mr-3">🏟 {match.venue}</span>
                      <span>💰 场费: ¥{match.fees}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3 w-full md:w-auto justify-end">
                   <div className="flex -space-x-2 mr-4">
                     {/* 模拟出场头像 */}
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500">P{i}</div>
                     ))}
                     <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+9</div>
                   </div>
                   <ChevronRight className="text-gray-300 group-hover:text-[#D9232E]" />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

// 简单组件封装
function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-2 inline-block">
          {trend}
        </span>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
}