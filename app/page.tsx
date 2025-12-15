import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Users, Calendar, ArrowRight, Trophy, PlayCircle, BarChart2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. 获取所有球员
  const { data: rawPlayers } = await supabase
    .from('players')
    .select('*');

  // 2. 自定义排序逻辑
  // 规则：有号码的(>0)排前面，从小到大；没号码的(0或null)排后面
  const sortedPlayers = rawPlayers?.sort((a, b) => {
    // 辅助函数：把无效号码转成一个超级大的数字(9999)，让它沉底
    const getNum = (n: any) => (n && n > 0 ? n : 9999);
    return getNum(a.jersey_number) - getNum(b.jersey_number);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 顶部 Hero 区域 */}
      <div className="bg-[#D9232E] text-white py-16 px-6 shadow-lg relative overflow-hidden">
        <Trophy className="absolute -right-10 -bottom-10 text-white/10 w-80 h-80 rotate-12" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-md">
                Royal Farmers FC
              </h1>
              <p className="text-white/90 text-xl font-medium max-w-lg leading-relaxed">
                荣耀 · 传承 · 热血<br/>
                <span className="text-base opacity-75 font-normal">Since 2025 · The Pride of Pitch</span>
              </p>
            </div>
            
            {/* --- 新增：功能入口按钮组 --- */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              
              {/* 1. 比赛报告 */}
              <Link 
                href="/matches" 
                className="group bg-white text-[#D9232E] px-8 py-4 rounded-xl font-black text-lg flex items-center justify-between shadow-xl hover:bg-gray-50 hover:scale-105 transition duration-200"
              >
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  比赛报告
                </div>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition" />
              </Link>

              {/* 2. 数据排行榜 (新) */}
              <Link 
                href="/rankings" 
                className="group bg-[#B01C25] text-white/90 px-8 py-3 rounded-xl font-bold text-base flex items-center justify-between shadow-md hover:bg-[#961820] transition duration-200"
              >
                <div className="flex items-center">
                  <BarChart2 className="w-5 h-5 mr-3" />
                  数据排行榜
                </div>
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition" />
              </Link>

              {/* 3. 比赛视频 (新) */}
              <Link 
                href="/videos" 
                className="group bg-[#B01C25] text-white/90 px-8 py-3 rounded-xl font-bold text-base flex items-center justify-between shadow-md hover:bg-[#961820] transition duration-200"
              >
                <div className="flex items-center">
                  <PlayCircle className="w-5 h-5 mr-3" />
                  精彩视频
                </div>
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition" />
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* 球员列表区域 */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="flex items-center mb-8 border-b-2 border-gray-100 pb-4">
          <Users className="w-8 h-8 text-[#D9232E] mr-3" />
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wide">First Team Squad</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedPlayers?.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`} className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#D9232E]/30 hover:-translate-y-1 transition duration-300 relative h-full flex flex-col">
                
                {/* --- 核心修改：头像显示逻辑 --- */}
                {/* 这里的 aspect-square 保证正方形，bg-white 防止透明图看着怪 */}
                <div className="aspect-[4/5] bg-gray-50 relative flex items-center justify-center overflow-hidden p-4">
                   {player.avatar_url ? (
                     // 1. 如果有真人照片：全屏填充模式 (cover)
                     <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover absolute inset-0" />
                   ) : (
                     // 2. 如果没照片：显示队徽 (contain模式，保持完整)
                     <div className="w-full h-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition grayscale group-hover:grayscale-0">
                        {/* 请确保 public 文件夹里放了 logo.png */}
                        <img src="/logo.png" alt="Team Logo" className="w-32 h-32 object-contain" />
                     </div>
                   )}
                </div>
                
                {/* 球员信息卡 */}
                <div className="p-4 relative bg-white flex-grow flex flex-col justify-end">
                  {/* 号码徽章：只有号码大于0才显示 */}
                  {player.jersey_number > 0 && (
                    <div className="absolute -top-5 right-3 bg-[#D9232E] text-white w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full border-4 border-white shadow-sm group-hover:scale-110 transition z-10">
                      {player.jersey_number}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D9232E] transition truncate">
                    {player.name}
                  </h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">
                    {player.position || 'PLAYER'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}