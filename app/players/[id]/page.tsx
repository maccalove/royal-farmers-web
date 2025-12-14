import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Activity, ArrowLeft, Target, Footprints } from 'lucide-react';
import Link from 'next/link';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 【核心修复】Next.js 15 要求 params 必须定义为 Promise
export default async function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  
  // 【关键一步】等待 params 解析，获取真实的 ID
  const { id } = await params;

  // 1. 获取球员基本信息
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', id) // 使用解析后的 id
    .single();

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
        <div className="text-xl font-bold text-gray-800 mb-2">球员未找到</div>
        <p className="text-gray-500 mb-4">数据库中没有 ID 为 {id} 的记录</p>
        <Link href="/" className="text-[#D9232E] underline">返回首页</Link>
      </div>
    );
  }

  // 2. 获取该球员的统计数据
  const { data: stats } = await supabase
    .from('match_stats')
    .select('goals, assists, rating, is_present')
    .eq('player_id', id);

  // 3. 计算数据
  const totalGoals = stats?.reduce((sum, r) => sum + (r.goals || 0), 0) || 0;
  const totalAssists = stats?.reduce((sum, r) => sum + (r.assists || 0), 0) || 0;
  const totalMatches = stats?.filter(r => r.is_present).length || 0;
  
  const ratedMatches = stats?.filter(r => r.rating && r.rating > 0) || [];
  const avgRating = ratedMatches.length > 0
    ? (ratedMatches.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedMatches.length).toFixed(1)
    : '-';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 顶部导航 */}
      <nav className="bg-black text-white p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回首页
          </Link>
        </div>
      </nav>

      {/* --- 海报区 (Hero) --- */}
      <div className="relative bg-[#D9232E] text-white overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Trophy size={400} />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <div className="text-[120px] md:text-[180px] font-black leading-none opacity-20 text-black select-none absolute top-10 left-4 md:-top-10 md:-left-10 mix-blend-multiply">
              {player.jersey_number}
            </div>
            
            <div className="relative">
              <div className="text-[#C59D3F] font-bold tracking-[0.2em] uppercase mb-2 text-sm md:text-base">
                Royal Farmers First Team
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                {player.name}
              </h1>
              <div className="text-2xl md:text-4xl font-light mt-2 opacity-90 flex items-center justify-center md:justify-start">
                <span className="bg-black/20 px-4 py-1 rounded backdrop-blur-sm border border-white/10">
                  {player.position}
                </span>
                <span className="ml-4 text-[#C59D3F] font-bold text-4xl italic">
                  #{player.jersey_number}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-8 md:space-x-12">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black">{totalMatches}</div>
              <div className="text-xs md:text-sm uppercase tracking-widest opacity-75 mt-1">Appearances <br/>出场</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-[#C59D3F]">{totalGoals}</div>
              <div className="text-xs md:text-sm uppercase tracking-widest opacity-75 mt-1">Goals <br/>进球</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 数据网格 --- */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#D9232E]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Goals</h3>
              <Target className="text-[#D9232E] w-6 h-6" />
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-slate-800">{totalGoals}</span>
              <span className="ml-2 text-sm text-gray-400">粒</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">赛季累计进球</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#C59D3F]">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Assists</h3>
              <Footprints className="text-[#C59D3F] w-6 h-6" />
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-slate-800">{totalAssists}</span>
              <span className="ml-2 text-sm text-gray-400">次</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">关键传球助攻</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-black">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Avg Rating</h3>
              <Activity className="text-black w-6 h-6" />
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-slate-800">{avgRating}</span>
              <span className="ml-2 text-sm text-gray-400">分</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">综合场均表现</p>
          </div>
        </div>
      </div>
    </div>
  );
}