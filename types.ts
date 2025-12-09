export enum AppState {
  MENU = 'MENU',
  LOBBY = 'LOBBY',
  MATCHMAKING = 'MATCHMAKING',
  GAME = 'GAME',
  GAME_OVER = 'GAME_OVER'
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  skinColor: string;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GameStats {
  score: number;
  opponentHealth: number;
  playerHealth: number;
  timeLeft: number;
}

export type HandSide = 'Left' | 'Right';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
}