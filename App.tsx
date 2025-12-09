import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameArena } from './components/GameArena';
import { AppState, PlayerProfile } from './types';
import { Button } from './components/Button';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.MENU);
  const [user, setUser] = useState<PlayerProfile | null>(null);

  const handleLogin = (username: string) => {
    // Simulate auth
    setUser({
      id: '123',
      username: username,
      avatar: 'default',
      level: 1,
      wins: 0,
      losses: 0,
      skinColor: '#00f0ff'
    });
  };

  const handleStartGame = () => {
    setAppState(AppState.GAME);
  };

  const handleGameOver = (result: 'win' | 'loss') => {
    setAppState(AppState.GAME_OVER);
    if (user) {
       setUser({
         ...user,
         wins: result === 'win' ? user.wins + 1 : user.wins,
         losses: result === 'loss' ? user.losses + 1 : user.losses
       })
    }
  };

  const handleReturnToMenu = () => {
    setAppState(AppState.MENU);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden">
      {appState === AppState.MENU && (
        <MainMenu 
          onStartGame={handleStartGame} 
          user={user}
          onLogin={handleLogin}
        />
      )}

      {appState === AppState.GAME && (
        <GameArena onGameOver={handleGameOver} />
      )}
      
      {appState === AppState.GAME_OVER && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="text-center p-12 border border-[#333] bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)]">
               <h2 className="text-6xl font-black text-white mb-4 cyber-font">MATCH COMPLETE</h2>
               <div className="text-2xl text-[#00f0ff] mb-8">XP GAINED: +150</div>
               <div className="flex gap-4 justify-center">
                  <Button onClick={() => setAppState(AppState.GAME)}>REMATCH</Button>
                  <Button variant="secondary" onClick={handleReturnToMenu}>MAIN MENU</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}