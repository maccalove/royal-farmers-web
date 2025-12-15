'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
// 【核心修复】引入 useParams，这是 Next.js 15+ 获取 URL 参数的唯一正解
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Trophy, Footprints, Activity, Calendar, Star, ChevronDown, AlertTriangle 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- 初始化 Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PlayerProfilePage() {
  // 1. 【核心修复】使用钩子获取 ID，不再依赖 props
  const params = useParams();
  
  // 处理 ID：确保它是字符串，并且清洗掉可能的空格
  // 注意：params.id 可能是数组，所以要安全处理
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = rawId ? decodeURIComponent(rawId).trim() : '';

  // 2. 定义状态
  const [player, setPlayer] = useState<any>(null);
  const [allStats, setAllStats] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('All-Time');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 3. 数据获取逻辑
  useEffect(() => {
    async function fetchData() {
      // 如果 ID 还没准备好，先不查
      if (!id) return;

      console.log('🔄 正在请求数据库，目标 ID:', id);

      try {
        // A. 查球员基础信息
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // 使用 maybeSingle 避免报错

        if (playerError) throw new Error(`查询球员表失败: ${playerError.message}`);
        
        if (!playerData) {
          setErrorMsg(`数据库里找不到 ID 为 "${id}" 的球员。请检查上传的 CSV 数据。`);
          setLoading(false);
          return;
        }

        setPlayer(playerData);

        // B. 查比赛统计数据 (联表查询)
        const { data: statsData, error: statsError } = await supabase
          .from('match_stats')
          .select(`
            goals, 
            assists, 
            rating, 
            matches (
              id, 
              date, 
              season, 
              opponent, 
              result
            )
          `)
          .eq('player_id', id)
          // 按比赛日期正序排列
          .order('matches(date)', { ascending: true });

        if (statsError) {
          console.warn('⚠️ 比赛数据查询有误:', statsError.message);
        }

        // C. 数据预处理 (Flatten Data)
        if (statsData) {
          const processedStats = statsData.map((item: any) => ({
            ...item,
            matchDate: item.matches?.date || '未知日期',
            season: item.matches?.season || '未知赛季',
            // 截取对手名字的简写，防止图表太挤
            opponentShort: item.matches?.opponent?.split('vs')[1]?.substring(0, 4) || '对手',
            // 确保评分是数字类型
            ratingNum: item.rating ? parseFloat(item.rating) : null
          }));
          
          setAllStats(processedStats);
          
          // 提取所有出现的赛季，去重并倒序
          const seasonSet = new Set(processedStats.map((s: any) => s.season).filter(Boolean));
          setSeasons(Array.from(seasonSet as Set<string>).sort().reverse());
        }

      } catch (err: any) {
        console.error('❌ 严重错误:', err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // 4. 根据赛季筛选数据
  const filteredStats = selectedSeason === 'All-Time'
    ? allStats
    : allStats.filter(s => s.season === selectedSeason);

  // 5. 计算核心指标
  const totalMatches = filteredStats.length;
  const totalGoals = filteredStats.reduce((acc, curr) => acc + (curr.goals || 0), 0);
  const totalAssists = filteredStats.reduce((acc, curr) => acc + (curr.assists || 0), 0);
  
  // 计算平均分
  const validRatings = filteredStats.filter(s => s.ratingNum !== null);
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((acc, curr) => acc + curr.ratingNum, 0) / validRatings.length).toFixed(1)
    : '-';

  // 6. 自定义图表提示框
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-xl text-sm text-gray-900 z-50">
          <p className="font-bold mb-1 border-b pb-1">{data.matchDate}</p>
          <p className="text-gray-600 mb-2">vs {data.matches?.opponent}</p>
          <div className="space-y-1">
            <p className="text-[#D9232E] font-bold">⚽ 进球: {data.goals}</p>
            <p className="text-[#C59D3F] font-bold">👟 助攻: {data.assists}</p>
            {data.rating && <p className="text-blue-600 font-bold">⭐ 评分: {data.rating}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  // --- 界面渲染部分 ---

  // Loading 状态
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-pulse flex flex-col items-center">
        <Activity className="w-10 h-10 mb-4 text-[#D9232E]" />
        <p>Loading Player Data...</p>
      </div>
    </div>
  );

  // Error 状态
  if (errorMsg || !player) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-red-900/40 border border-red-500/50 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl backdrop-blur-sm">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">哎呀，找不到数据</h2>
        <p className="text-red-200 mb-6 font-mono text-sm break-all bg-black/30 p-4 rounded">
          {errorMsg || `ID: ${id || 'Undefined'}`}
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回首页
        </Link>
      </div>
    </div>
  );

  // 正常页面
  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100 pb-20">
      
      {/* 顶部导航 */}
      <nav className="bg-black/40 text-white p-4 sticky top-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/" className="flex items-center hover:text-[#D9232E] transition font-bold group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition" /> 
            Back to Squad
          </Link>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden group">
        {/* 动态背景图 */}
        <div className="absolute inset-0 bg-[url('/field-bg.jpg')] bg-cover bg-center opacity-40 group-hover:scale-105 transition duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end relative z-10 pb-16">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-8 w-full">
            
            {/* 头像 */}
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-[#D9232E] overflow-hidden shadow-[0_0_40px_rgba(217,35,46,0.3)] bg-gray-800 shrink-0 relative">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl font-black text-gray-700 bg-gray-800">
                  {player.jersey_number}
                </div>
              )}
            </div>
            
            {/* 名字与信息 */}
            <div className="flex-1 mb-2">
              <div className="flex items-center gap-4 mb-3">
                 <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
                   {player.name}
                 </h1>
                 {/* 移动端显示的号码标记 */}
                 <div className="md:hidden bg-[#D9232E] text-white text-xl font-black px-3 py-1 rounded skew-x-[-12deg]">
                   #{player.jersey_number}
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-lg text-gray-300 mb-8 font-medium">
                <span className="bg-white/10 px-4 py-1.5 rounded-full uppercase text-sm tracking-wider border border-white/10">
                  {player.position || 'Player'}
                </span>
                <span className="hidden md:inline-block text-gray-600">|</span>
                <span className="hidden md:inline-block font-black text-[#D9232E] text-3xl italic">
                  #{player.jersey_number}
                </span>
                {player.birth_year && (
                  <>
                    <span className="hidden md:inline-block text-gray-600">|</span>
                    <span className="text-gray-400">Born {player.birth_year}</span>
                  </>
                )}
              </div>

              {/* 赛季下拉框 */}
              <div className="relative inline-block group/select">
                <div className="absolute inset-0 bg-[#D9232E]/20 blur-lg rounded-full opacity-0 group-hover/select:opacity-100 transition"></div>
                <select 
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="relative z-10 appearance-none bg-black/60 border border-white/20 text-white pl-6 pr-12 py-3 rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#D9232E] cursor-pointer hover:bg-black/80 transition shadow-lg backdrop-blur-sm"
                >
                  <option value="All-Time">🏆 全部生涯 (All-Time)</option>
                  {seasons.map(s => <option key={s} value={s}>📅 {s} 赛季</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-400 z-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据内容区域 */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 space-y-12">
        
        {/* --- 1. 四大核心指标卡片 --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
            <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-[#D9232E]/10 transition-all duration-500 transform group-hover:scale-110">
              <Calendar className="w-32 h-32"/>
            </div>
            <div className="relative z-10">
              <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center tracking-wider">
                <Activity className="w-3 h-3 mr-2 text-gray-500"/> Matches
              </div>
              <div className="text-4xl md:text-5xl font-black text-white">{totalMatches}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">出场次数</div>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
            <div className="absolute -right-6 -bottom-6 text-[#D9232E]/5 group-hover:text-[#D9232E]/20 transition-all duration-500 transform group-hover:scale-110">
              <Trophy className="w-32 h-32 rotate-12"/>
            </div>
            <div className="relative z-10">
              <div className="text-xs text-[#D9232E] uppercase font-bold mb-2 flex items-center tracking-wider">
                <Trophy className="w-3 h-3 mr-2"/> Goals
              </div>
              <div className="text-4xl md:text-5xl font-black text-[#D9232E]">{totalGoals}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">进球总数</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
             <div className="absolute -right-6 -bottom-6 text-[#C59D3F]/5 group-hover:text-[#C59D3F]/20 transition-all duration-500 transform group-hover:scale-110">
               <Footprints className="w-32 h-32 -rotate-12"/>
             </div>
            <div className="relative z-10">
              <div className="text-xs text-[#C59D3F] uppercase font-bold mb-2 flex items-center tracking-wider">
                <Footprints className="w-3 h-3 mr-2"/> Assists
              </div>
              <div className="text-4xl md:text-5xl font-black text-[#C59D3F]">{totalAssists}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">助攻总数</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
            <div className="absolute -right-6 -bottom-6 text-blue-500/5 group-hover:text-blue-500/20 transition-all duration-500 transform group-hover:scale-110">
              <Star className="w-32 h-32"/>
            </div>
            <div className="relative z-10">
              <div className="text-xs text-blue-400 uppercase font-bold mb-2 flex items-center tracking-wider">
                <Star className="w-3 h-3 mr-2"/> Avg Rating
              </div>
              <div className="text-4xl md:text-5xl font-black text-gray-100">{avgRating}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">场均评分</div>
            </div>
          </div>
        </div>

        {/* --- 2. 可视化图表 --- */}
        {totalMatches > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* 柱状图：进攻分布 */}
            <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-xl border border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center text-gray-100">
                <span className="w-1 h-6 bg-[#D9232E] mr-3 rounded-full"></span>
                进攻火力分布
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="opponentShort" 
                      stroke="#666" 
                      tick={{fontSize: 12, fill: '#888'}} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#666" 
                      tick={{fontSize: 12, fill: '#888'}} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}}/>
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingBottom: '20px'}}/>
                    <Bar dataKey="goals" name="进球" stackId="a" fill="#D9232E" radius={[0, 0, 4, 4]} maxBarSize={40} />
                    <Bar dataKey="assists" name="助攻" stackId="a" fill="#C59D3F" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 面积图：评分走势 */}
            <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-xl border border-white/5">
               <h3 className="text-xl font-bold mb-8 flex items-center text-gray-100">
                 <span className="w-1 h-6 bg-blue-500 mr-3 rounded-full"></span>
                 竞技状态走势
               </h3>
               <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredStats.filter(s => s.ratingNum)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="matchDate" 
                      stroke="#666" 
                      tick={{fontSize: 12, fill: '#888'}} 
                      tickFormatter={(date) => date.slice(5)} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#666" 
                      domain={[5, 10]} 
                      tick={{fontSize: 12, fill: '#888'}} 
                      tickLine={false} 
                      axisLine={false} 
                      tickCount={6}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#ffffff20', strokeWidth: 1}}/>
                    <Area 
                      type="monotone" 
                      dataKey="ratingNum" 
                      name="评分" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRating)" 
                      dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#1f2937' }} 
                      activeDot={{ r: 6, fill: '#fff' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-3xl border border-white/5 border-dashed">
            该赛季暂无比赛数据
          </div>
        )}

        {/* --- 3. 详细比赛日志表格 --- */}
        <div className="bg-[#1a1a1a] rounded-3xl shadow-xl border border-white/5 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center text-gray-100">
              <Calendar className="w-5 h-5 mr-3 text-gray-400"/> 
              比赛日志 (Match Logs)
            </h3>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-400">
              {filteredStats.length} Games
            </span>
          </div>
          
          {filteredStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="bg-black/20 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-5">Date / Opponent</th>
                    <th className="px-6 py-5 text-center">Goals</th>
                    <th className="px-6 py-5 text-center">Assists</th>
                    <th className="px-6 py-5 text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStats.map((stat: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition duration-150 group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-200 text-base mb-1 group-hover:text-[#D9232E] transition">
                          {stat.matches?.result || 'VS'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="font-mono">{stat.matchDate}</span>
                          <span className="mx-2 text-gray-700">|</span>
                          <span className="truncate max-w-[120px] md:max-w-none text-gray-400">
                            {stat.matches?.opponent || 'Unknown Opponent'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block w-8 h-8 leading-8 rounded-full font-black text-lg ${stat.goals > 0 ? 'bg-[#D9232E]/20 text-[#D9232E]' : 'text-gray-700'}`}>
                          {stat.goals > 0 ? stat.goals : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block w-8 h-8 leading-8 rounded-full font-black text-lg ${stat.assists > 0 ? 'bg-[#C59D3F]/20 text-[#C59D3F]' : 'text-gray-700'}`}>
                          {stat.assists > 0 ? stat.assists : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {stat.rating ? (
                          <span className="font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                            {stat.rating}
                          </span>
                        ) : (
                          <span className="text-gray-700">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="p-10 text-center text-gray-600">No records found.</div>
            )}
        </div>

      </div>
    </div>
  );
}