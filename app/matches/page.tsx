import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, Trophy, Footprints, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// --- 初始化 Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 强制动态渲染 (保证每次看到最新比赛)
export const dynamic = 'force-dynamic';

export default async function MatchLog() {
  
  // 1. 三表联查：查询比赛 -> 关联统计 -> 关联球员名
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      date,
      venue,
      result,
      opponent,
      match_stats (
        goals,
        assists,
        players (
          name
        )
      )
    `)
    .order('date', { ascending: false }); // 最近的比赛排前面

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 顶部导航 */}
      <nav className="bg-[#D9232E] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-white/80 hover:text-white transition font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> 皇家农夫比赛日志
          </Link>
          <div className="text-xs opacity-60 uppercase tracking-widest">Match Logs</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 标题区 */}
        <div className="mb-8 ml-2">
          <h1 className="text-3xl font-black text-gray-900 italic uppercase">Season Timeline</h1>
          <p className="text-gray-500 text-sm mt-1">记录每一场战斗与荣耀</p>
        </div>

        {/* 比赛列表 */}
        <div className="space-y-6">
          {matches?.map((match) => {
            // 2. 数据处理：筛选进球者和助攻者
            // match.match_stats 可能会包含所有出场球员，我们需要过滤
            const scorers = match.match_stats?.filter((s: any) => s.goals > 0) || [];
            const assisters = match.match_stats?.filter((s: any) => s.assists > 0) || [];

            return (
              <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
                
                {/* 卡片头部：日期与场地 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-700 font-bold">
                      <Calendar className="w-4 h-4 mr-2 text-[#D9232E]" />
                      {match.date || '日期未知'}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.venue || '未知球场'}
                    </div>
                  </div>
                  
                  {/* 比分结果 (如果有) */}
                  <div className="mt-2 md:mt-0 font-black text-xl tracking-tighter text-gray-800">
                    {match.result ? (
                      <span className={match.result.includes('赢') ? 'text-[#D9232E]' : ''}>
                        {match.result}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">VS {match.opponent || '对手'}</span>
                    )}
                  </div>
                </div>

                {/* 卡片主体：进球与助攻数据 */}
                <div className="px-6 py-5 space-y-4">
                  
                  {/* 进球行 */}
                  {scorers.length > 0 ? (
                    <div className="flex items-start">
                      <div className="shrink-0 w-24 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1 flex items-center">
                        <Trophy className="w-3 h-3 mr-1 text-[#D9232E]" /> Goals
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scorers.map((stat: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-[#D9232E]/5 text-[#D9232E] text-sm font-bold border border-[#D9232E]/10">
                            {stat.players?.name}
                            {/* 如果进了超过1个球，显示 xN */}
                            {stat.goals > 1 && <span className="ml-1 text-[10px] bg-[#D9232E] text-white px-1 rounded-full">x{stat.goals}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // 如果没进球
                    <div className="flex items-start opacity-30">
                       <div className="shrink-0 w-24 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                        <Trophy className="w-3 h-3 mr-1" /> Goals
                      </div>
                      <span className="text-xs text-gray-400">-</span>
                    </div>
                  )}

                  {/* 分隔线 */}
                  <div className="h-px bg-gray-50 w-full" />

                  {/* 助攻行 */}
                  {assisters.length > 0 ? (
                     <div className="flex items-start">
                      <div className="shrink-0 w-24 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1 flex items-center">
                        <Footprints className="w-3 h-3 mr-1 text-[#C59D3F]" /> Assists
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assisters.map((stat: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-[#C59D3F]/10 text-gray-700 text-sm border border-[#C59D3F]/20">
                            {stat.players?.name}
                            {stat.assists > 1 && <span className="ml-1 text-[10px] bg-[#C59D3F] text-white px-1 rounded-full">x{stat.assists}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                     <div className="flex items-start opacity-30">
                       <div className="shrink-0 w-24 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                        <Footprints className="w-3 h-3 mr-1" /> Assists
                      </div>
                      <span className="text-xs text-gray-400">-</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
          
          {(!matches || matches.length === 0) && (
            <div className="text-center py-20 text-gray-400">
              暂无比赛记录，请先导入数据。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}