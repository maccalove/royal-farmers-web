import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, ArrowLeft, Disc } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const dynamic = 'force-dynamic';

export default async function MatchLog() {
  // 联表查询：比赛 -> 关联进球详情 -> 关联球员名字
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, date, venue, result, opponent,
      match_goals (
        side,
        team_name,
        scorer: players!match_goals_scorer_id_fkey (name),
        assister: players!match_goals_assister_id_fkey (name)
      )
    `)
    .order('date', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <nav className="bg-[#D9232E] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center font-bold hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> 皇家农夫比赛报告
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 italic uppercase mb-8 ml-2">Match Reports</h1>

        <div className="space-y-8">
          {matches?.map((match) => {
            const homeGoals = match.match_goals?.filter((g: any) => g.side === 'home') || [];
            const awayGoals = match.match_goals?.filter((g: any) => g.side === 'away') || [];

            // 智能提取队名
            let homeTeamName = homeGoals[0]?.team_name || match.opponent?.split('vs')[0] || '主队';
            let awayTeamName = awayGoals[0]?.team_name || match.opponent?.split('vs')[1] || '客队';

            return (
              <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                
                {/* 1. 顶部比分栏 */}
                <div className="bg-gray-800 text-white p-4 text-center">
                  <div className="text-xs text-gray-400 mb-2 flex justify-center items-center gap-4">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {match.date}</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {match.venue}</span>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <div className="text-right w-5/12 font-bold text-lg truncate">{homeTeamName}</div>
                    <div className="bg-[#D9232E] px-3 py-1 rounded text-xl font-black tracking-widest min-w-[80px]">
                      {match.result || 'VS'}
                    </div>
                    <div className="text-left w-5/12 font-bold text-lg truncate">{awayTeamName}</div>
                  </div>
                </div>

                {/* 2. 左右分栏进球详情 */}
                <div className="flex divide-x divide-gray-100 min-h-[60px]">
                  
                  {/* 左侧 (Home) */}
                  <div className="w-1/2 p-4">
                    {homeGoals.length > 0 ? (
                      <div className="space-y-3">
                        {homeGoals.map((goal: any, idx: number) => (
                          <div key={idx} className="flex flex-col items-end text-right">
                            <div className="font-bold text-gray-800 flex items-center">
                              {goal.scorer?.name}
                              <span className="ml-2 w-2 h-2 rounded-full bg-[#D9232E]"></span>
                            </div>
                            {goal.assister && (
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                (助攻: {goal.assister.name})
                                <Disc className="w-3 h-3 ml-1 text-gray-300" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-200 text-sm italic">-</div>
                    )}
                  </div>

                  {/* 右侧 (Away) */}
                  <div className="w-1/2 p-4">
                     {awayGoals.length > 0 ? (
                      <div className="space-y-3">
                        {awayGoals.map((goal: any, idx: number) => (
                          <div key={idx} className="flex flex-col items-start text-left">
                            <div className="font-bold text-gray-800 flex items-center">
                              <span className="mr-2 w-2 h-2 rounded-full bg-[#D9232E]"></span>
                              {goal.scorer?.name}
                            </div>
                            {goal.assister && (
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <Disc className="w-3 h-3 mr-1 text-gray-300" />
                                (助攻: {goal.assister.name})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-200 text-sm italic">-</div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
          
          {matches?.length === 0 && (
            <div className="text-center py-20 text-gray-400">暂无比赛记录</div>
          )}
        </div>
      </div>
    </div>
  );
}