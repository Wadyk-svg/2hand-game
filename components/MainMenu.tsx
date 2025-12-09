import React, { useState } from 'react';
import { AppState, PlayerProfile } from '../types';
import { Button } from './Button';
import { User, Shield, Zap, Users, LogIn } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  user: PlayerProfile | null;
  onLogin: (name: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, user, onLogin }) => {
  const [nameInput, setNameInput] = useState('');
  const [view, setView] = useState<'LOGIN' | 'MAIN' | 'LOBBY'>('LOGIN');
  const [activeTab, setActiveTab] = useState('PROFILE');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onLogin(nameInput);
      setView('MAIN');
    }
  };

  if (view === 'LOGIN' && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-4">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black -z-10"></div>
         <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ae00ff] neon-text mb-8 text-center italic tracking-tighter">
            HAND BONES<br/>ARENA
         </h1>
         
         <form onSubmit={handleLogin} className="w-full max-w-md bg-black/50 backdrop-blur-md border border-[#00f0ff]/30 p-8 rounded-lg shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <h2 className="text-xl text-[#00f0ff] mb-6 cyber-font flex items-center gap-2">
              <LogIn className="w-5 h-5" /> SYSTEM ACCESS
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">OPERATOR ID</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-[#050505] border border-gray-700 focus:border-[#00f0ff] text-white p-3 outline-none transition-colors"
                placeholder="ENTER NICKNAME"
              />
            </div>
            
            <div className="space-y-4">
              <Button type="submit" className="w-full">Initialize Session</Button>
              <div className="flex gap-2">
                 <button type="button" className="flex-1 py-2 text-xs border border-gray-700 hover:border-white text-gray-400 hover:text-white transition-colors">GOOGLE</button>
                 <button type="button" className="flex-1 py-2 text-xs border border-gray-700 hover:border-white text-gray-400 hover:text-white transition-colors">GUEST</button>
              </div>
            </div>
         </form>
      </div>
    );
  }

  if (view === 'LOBBY') {
     return (
       <div className="flex flex-col h-screen p-6">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl text-[#00f0ff] cyber-font">NETWORK LOBBY</h2>
             <Button variant="secondary" onClick={() => setView('MAIN')}>BACK</Button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="col-span-2 bg-[#050505] border border-[#333] p-4 flex flex-col">
                <div className="border-b border-[#333] pb-4 mb-4 flex justify-between items-center">
                   <span className="text-gray-400">AVAILABLE NODES</span>
                   <span className="text-[#00f0ff] text-sm animate-pulse">SEARCHING...</span>
                </div>
                <div className="space-y-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center justify-between p-3 bg-[#111] hover:bg-[#1a1a1a] cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-green-500"></div>
                           <span className="font-mono text-gray-300 group-hover:text-white">Room #{2040 + i}</span>
                        </div>
                        <span className="text-xs text-gray-500">2/2 [FULL]</span>
                     </div>
                   ))}
                   <div className="flex items-center justify-between p-3 bg-[#111] hover:bg-[#1a1a1a] cursor-pointer group border border-[#00f0ff]/20">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                           <span className="font-mono text-white">Room #2045 [YOU]</span>
                        </div>
                        <span className="text-xs text-[#00f0ff]">WAITING FOR OPPONENT</span>
                     </div>
                </div>
             </div>
             
             <div className="bg-[#050505] border border-[#333] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-white mb-4 cyber-font">CHAT LINK</h3>
                  <div className="h-64 overflow-y-auto space-y-2 mb-4 text-sm font-mono scrollbar-hide">
                    <div className="text-gray-500"><span className="text-[#00f0ff]">&lt;SYSTEM&gt;</span> Connected to local node.</div>
                    <div className="text-gray-400"><span className="text-yellow-500">Player1</span>: anyone ready?</div>
                    <div className="text-gray-400"><span className="text-purple-500">Bot_Alpha</span>: I am always ready.</div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <input className="flex-1 bg-[#111] border border-gray-700 p-2 text-white text-sm outline-none focus:border-[#00f0ff]" placeholder="Type message..." />
                   <button className="px-3 bg-[#333] hover:bg-[#444] text-white">&gt;</button>
                </div>
             </div>
          </div>
          
          <div className="mt-6 flex justify-end">
             <Button onClick={onStartGame} className="w-64 text-xl">START MATCH</Button>
          </div>
       </div>
     )
  }

  // Main Profile View
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-[#050505] border-r border-[#333] flex flex-col">
        <div className="p-6 border-b border-[#333]">
           <span className="text-2xl font-bold text-white tracking-widest hidden md:block">HBA</span>
        </div>
        <nav className="flex-1 p-4 space-y-4">
           {[
             { id: 'PROFILE', icon: User, label: 'PROFILE' },
             { id: 'SKINS', icon: Shield, label: 'SKINS' },
             { id: 'STATS', icon: Zap, label: 'STATS' },
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex items-center gap-4 w-full p-3 rounded transition-all ${activeTab === item.id ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/50' : 'text-gray-500 hover:text-white'}`}
             >
               <item.icon className="w-5 h-5" />
               <span className="hidden md:block font-bold">{item.label}</span>
             </button>
           ))}
        </nav>
        <div className="p-4 border-t border-[#333] text-xs text-gray-600 hidden md:block">
           SERVER: EU-CENTRAL-1<br/>PING: 24ms
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-black relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
         
         <header className="flex justify-between items-end mb-12 relative z-10">
            <div>
               <h2 className="text-4xl text-white font-bold mb-1 cyber-font">{user?.username}</h2>
               <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                  <span>LVL {user?.level}</span>
                  <span className="text-[#00f0ff]">W: {user?.wins}</span>
                  <span className="text-[#ff003c]">L: {user?.losses}</span>
               </div>
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-[#00f0ff] overflow-hidden bg-gray-800">
               <img src={`https://picsum.photos/seed/${user?.username}/200`} alt="avatar" className="w-full h-full object-cover" />
            </div>
         </header>

         {/* Hero Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
               <div className="bg-[#0a0a0a] border border-[#333] p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <h3 className="text-xl text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#00f0ff]" /> QUICK PLAY</h3>
                  <p className="text-gray-400 mb-6 text-sm">Join the global queue. Matchmaking based on skill level.</p>
                  <Button onClick={() => setView('LOBBY')} className="w-full">FIND MATCH</Button>
               </div>
               
               <div className="bg-[#0a0a0a] border border-[#333] p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ae00ff] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <h3 className="text-xl text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#ae00ff]" /> RANKED</h3>
                  <p className="text-gray-400 mb-6 text-sm">Compete for seasonal rewards. Requires Level 10.</p>
                  <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed">LOCKED</Button>
               </div>
            </div>

            {/* Character Preview */}
            <div className="bg-[#050505] border border-[#222] flex items-center justify-center p-8 relative">
               <div className="absolute top-4 left-4 text-xs text-gray-500">SKIN PREVIEW</div>
               <div className="w-64 h-64 border border-[#333] relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
                  {/* Simplified Hand Illustration */}
                  <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-[0_0_10px_#00f0ff]">
                     <path d="M50 80 L50 60 L30 40" stroke="#00f0ff" strokeWidth="2" fill="none" />
                     <path d="M50 60 L70 40" stroke="#00f0ff" strokeWidth="2" fill="none" />
                     <path d="M30 40 L25 25" stroke="#00f0ff" strokeWidth="2" fill="none" />
                     <path d="M70 40 L75 25" stroke="#00f0ff" strokeWidth="2" fill="none" />
                     <circle cx="50" cy="80" r="3" fill="white" />
                     <circle cx="50" cy="60" r="3" fill="white" />
                     <circle cx="30" cy="40" r="3" fill="white" />
                     <circle cx="70" cy="40" r="3" fill="white" />
                  </svg>
               </div>
               <div className="absolute bottom-4 w-full px-8">
                  <div className="flex justify-between text-xs text-gray-400 uppercase">
                     <span>Type: Skeleton v2</span>
                     <span>Rarity: Rare</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};