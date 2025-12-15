import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';

// --- 视频配置清单 ---
const videos = [
  {
    id: 'BV1uemqBrE6f',  // <--- 您刚才提供的视频
    title: '皇家农夫球队精彩时刻', // 标题 (您可以手动修改)
    date: '2025-12-15',      // 日期 (您可以手动修改)
  },
  // 如果要加第2个视频，复制下面这段并修改 id 即可：
  /* {
    id: 'BV1xxxxxxxxx', 
    title: '另一场比赛录像', 
    date: '2025-11-20'
  },
  */
];

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gray-900 font-sans pb-20">
      
      {/* 顶部导航 */}
      <nav className="bg-black/50 text-white p-4 sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link href="/" className="flex items-center hover:text-[#D9232E] transition font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回首页
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white italic uppercase mb-2">Match Highlights</h1>
          <p className="text-gray-400">精彩瞬间 & 完整回放</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl hover:scale-[1.02] transition duration-300 border border-gray-700">
              
              {/* Bilibili 播放器容器 */}
              <div className="aspect-video w-full bg-black relative">
                 <iframe 
                   src={`//player.bilibili.com/player.html?bvid=${video.id}&page=1&high_quality=1&danmaku=0`} 
                   scrolling="no" 
                   frameBorder="0" 
                   allowFullScreen={true}
                   className="w-full h-full absolute inset-0"
                 ></iframe>
              </div>

              {/* 视频信息 */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                  {video.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <PlayCircle className="w-4 h-4 mr-1 text-[#D9232E]" />
                  <span>{video.date}</span>
                  <span className="mx-2">•</span>
                  <span>Bilibili</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 底部按钮：跳转到您的B站频道 */}
        <div className="mt-12 text-center">
          <a 
            href="https://www.bilibili.com/" 
            target="_blank" 
            className="inline-block bg-[#FB7299] text-white px-8 py-3 rounded-full font-bold hover:bg-[#E46387] transition shadow-lg"
          >
            去 Bilibili 观看更多
          </a>
        </div>

      </div>
    </div>
  );
}