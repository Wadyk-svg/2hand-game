import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { HandLandmarker } from "@mediapipe/tasks-vision";
import { VisionService } from '../services/visionService';
import { GameStats } from '../types';

interface GameArenaProps {
  onGameOver: (result: 'win' | 'loss') => void;
}

export const GameArena: React.FC<GameArenaProps> = ({ onGameOver }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const requestRef = useRef<number>();
  
  // Physics Bodies Refs
  const leftHandBody = useRef<Matter.Body | null>(null);
  const rightHandBody = useRef<Matter.Body | null>(null);
  const leftHandConstraint = useRef<Matter.Constraint | null>(null);
  const rightHandConstraint = useRef<Matter.Constraint | null>(null);
  const opponentBody = useRef<Matter.Body | null>(null);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    opponentHealth: 100,
    playerHealth: 100,
    timeLeft: 90
  });

  const [gameState, setGameState] = useState<'loading' | 'active'>('loading');

  // Initialize Physics
  const initPhysics = (width: number, height: number) => {
    const engine = Matter.Engine.create();
    engine.gravity.y = 0; // Top-down-ish view for hands, but objects fall? Let's do 0 gravity for "Air Hockey" style or weak gravity.
    engine.gravity.scale = 0.001; // Weak gravity

    // Walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#111', strokeStyle: '#00f0ff', lineWidth: 2 } };
    const walls = [
      Matter.Bodies.rectangle(width / 2, 0, width, 50, wallOptions), // Top
      Matter.Bodies.rectangle(width / 2, height, width, 50, wallOptions), // Bottom
      Matter.Bodies.rectangle(0, height / 2, 50, height, wallOptions), // Left
      Matter.Bodies.rectangle(width, height / 2, 50, height, wallOptions) // Right
    ];

    // Interactable Objects (Cubes, Spheres)
    const objects: Matter.Body[] = [];
    for (let i = 0; i < 5; i++) {
      objects.push(
        Matter.Bodies.polygon(width / 2 + (Math.random() - 0.5) * 200, height / 2 + (Math.random() - 0.5) * 200, Math.floor(Math.random() * 5) + 3, 30, {
          restitution: 0.9,
          render: {
            fillStyle: 'transparent',
            strokeStyle: '#ff00ff',
            lineWidth: 2
          },
          label: 'projectile'
        })
      );
    }

    // Opponent (Simple Target for now)
    const opponent = Matter.Bodies.circle(width / 2, 100, 40, {
      isStatic: false,
      frictionAir: 0.05,
      render: { fillStyle: '#ff003c' },
      label: 'opponent'
    });
    opponentBody.current = opponent;

    // Player Hand Interactors (Kinematic bodies moved by webcam)
    const handOptions = {
      isSensor: true, // Don't physically collide, just trigger events or act as anchors
      isStatic: true, // We manually move position
      render: { visible: false },
      label: 'hand_anchor'
    };

    leftHandBody.current = Matter.Bodies.circle(0, 0, 20, handOptions);
    rightHandBody.current = Matter.Bodies.circle(0, 0, 20, handOptions);

    Matter.Composite.add(engine.world, [...walls, ...objects, opponent, leftHandBody.current, rightHandBody.current]);

    engineRef.current = engine;
  };

  const handleHandInteraction = (handResults: any, width: number, height: number) => {
    if (!handResults.landmarks || !engineRef.current) return;

    const engine = engineRef.current;
    
    // Process up to 2 hands
    for (const landmarks of handResults.landmarks) {
      // Determine if left or right (simple heuristic or from handedness data)
      // For simplicity, we just use the first hand found for Left, second for Right (or swap based on X)
      // A better way is using handResults.handedness
      
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      const wrist = landmarks[0];

      // Convert normalized coords to canvas coords
      // MediaPipe coords: x (0-1), y (0-1). Camera is mirrored usually.
      const x = (1 - indexTip.x) * width; 
      const y = indexTip.y * height;

      // Distance between thumb and index for "Grab" pinch gesture
      const pinchDist = Math.hypot(
        (1 - thumbTip.x) * width - x,
        thumbTip.y * height - y
      );
      
      const isPinching = pinchDist < 50;

      // Assign to closest physics body anchor
      // In a real robust implementation, we'd map handedness strictly.
      // Here, we'll just use the leftHandBody for the first hand detected.
      
      const handBody = leftHandBody.current; // Simplified for demo
      const constraintRef = leftHandConstraint;

      if (handBody) {
        Matter.Body.setPosition(handBody, { x, y });

        // Grabbing Logic
        if (isPinching) {
          if (!constraintRef.current) {
            // Check for bodies nearby to grab
            const bodies = Matter.Composite.allBodies(engine.world);
            const closeBody = bodies.find(b => 
              b !== handBody && 
              b.label !== 'wall' && 
              b.label !== 'opponent' &&
              Matter.Vector.magnitude(Matter.Vector.sub(b.position, {x, y})) < 60
            );

            if (closeBody) {
              const constraint = Matter.Constraint.create({
                bodyA: handBody,
                bodyB: closeBody,
                stiffness: 0.1,
                length: 0,
                render: {
                  strokeStyle: '#00f0ff',
                  lineWidth: 4
                }
              });
              Matter.Composite.add(engine.world, constraint);
              constraintRef.current = constraint;
            }
          }
        } else {
          // Release
          if (constraintRef.current) {
             // Add a little throw impulse if releasing
             if (constraintRef.current.bodyB) {
                // Velocity is handled by the physics engine automatically via the constraint movement,
                // but we can boost it.
             }
             Matter.Composite.remove(engine.world, constraintRef.current);
             constraintRef.current = null;
          }
        }
      }
    }
  };

  const drawSkeletons = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';

    const connections = HandLandmarker.HAND_CONNECTIONS;

    for (const hand of landmarks) {
      for (const conn of connections) {
        const p1 = hand[conn.start];
        const p2 = hand[conn.end];
        
        // Mirror X
        ctx.beginPath();
        ctx.moveTo((1 - p1.x) * width, p1.y * height);
        ctx.lineTo((1 - p2.x) * width, p2.y * height);
        ctx.stroke();
      }
      
      // Draw joints
      ctx.fillStyle = '#fff';
      for (const lm of hand) {
        ctx.beginPath();
        ctx.arc((1 - lm.x) * width, lm.y * height, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const gameLoop = useCallback(() => {
    if (!engineRef.current || !canvasRef.current || !videoRef.current) return;
    
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const vision = VisionService.getInstance();

    if (!ctx) return;

    // 1. Detect Hands
    const results = vision.detectHands();

    // 2. Update Physics Inputs
    if (results) {
      handleHandInteraction(results, canvas.width, canvas.height);
    }

    // 3. AI Opponent Logic (Simple follow)
    if (opponentBody.current) {
        // Move somewhat randomly or towards center to stay in arena
        const force = { 
            x: (canvas.width / 2 - opponentBody.current.position.x) * 0.0001,
            y: (canvas.height / 2 - opponentBody.current.position.y) * 0.0001
        };
        Matter.Body.applyForce(opponentBody.current, opponentBody.current.position, force);
    }

    // 4. Step Physics
    Matter.Engine.update(engine, 1000 / 60);

    // 5. Render
    // Clear background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    // Render Physics Bodies manually for custom neon look
    const bodies = Matter.Composite.allBodies(engine.world);
    
    bodies.forEach(body => {
      if (body.label === 'hand_anchor') return; // Don't draw anchors

      ctx.beginPath();
      const vertices = body.vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);

      ctx.lineWidth = 2;
      if (body.label === 'opponent') {
        ctx.strokeStyle = '#ff003c';
        ctx.fillStyle = 'rgba(255, 0, 60, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff003c';
      } else if (body.label === 'projectile') {
        ctx.strokeStyle = '#ae00ff';
        ctx.fillStyle = 'rgba(174, 0, 255, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ae00ff';
      } else { // Walls
        ctx.strokeStyle = '#00f0ff';
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00f0ff';
      }
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw Constraints (The "Force Beam")
    const constraints = Matter.Composite.allConstraints(engine.world);
    constraints.forEach(cons => {
       if (cons.bodyB) { // Only draw active grabs
          const start = cons.bodyA ? cons.bodyA.position : cons.pointA;
          const end = cons.bodyB.position;
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
       }
    });

    // Draw Hands
    if (results && results.landmarks) {
      drawSkeletons(ctx, results.landmarks, canvas.width, canvas.height);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Initialization Effect
  useEffect(() => {
    const init = async () => {
      try {
        const vision = VisionService.getInstance();
        await vision.initialize();
        if (videoRef.current) {
          await vision.startCamera(videoRef.current);
        }
        
        if (canvasRef.current && videoRef.current) {
           canvasRef.current.width = window.innerWidth;
           canvasRef.current.height = window.innerHeight;
           initPhysics(window.innerWidth, window.innerHeight);
           setGameState('active');
           requestRef.current = requestAnimationFrame(gameLoop);
        }
      } catch (e) {
        console.error("Failed to start game", e);
      }
    };
    init();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      VisionService.getInstance().stop();
    };
  }, [gameLoop]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden Video for processing */}
      <video ref={videoRef} className="absolute top-0 left-0 opacity-0 pointer-events-none" playsInline autoPlay muted />
      
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Loading Overlay */}
      {gameState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-[#00f0ff] text-2xl cyber-font animate-pulse">
            INITIALIZING NEURAL LINK...
          </div>
        </div>
      )}

      {/* HUD */}
      {gameState === 'active' && (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             {/* Player Stats */}
             <div className="w-64">
                <div className="text-sm text-gray-400 mb-1 cyber-font">PLAYER INTEGRITY</div>
                <div className="h-4 w-full bg-gray-900 border border-gray-700 skew-x-[-15deg]">
                  <div 
                    className="h-full bg-[#00f0ff] transition-all duration-300"
                    style={{ width: `${stats.playerHealth}%` }}
                  />
                </div>
                <div className="mt-2 text-[#00f0ff] font-bold text-xl">{stats.score} PTS</div>
             </div>

             {/* Timer */}
             <div className="text-center">
               <div className="text-4xl font-bold text-white cyber-font neon-text">
                 {Math.floor(stats.timeLeft / 60)}:{(stats.timeLeft % 60).toString().padStart(2, '0')}
               </div>
             </div>

             {/* Opponent Stats */}
             <div className="w-64 text-right">
                <div className="text-sm text-gray-400 mb-1 cyber-font">OPPONENT INTEGRITY</div>
                <div className="h-4 w-full bg-gray-900 border border-gray-700 skew-x-[15deg]">
                  <div 
                    className="h-full bg-[#ff003c] float-right transition-all duration-300"
                    style={{ width: `${stats.opponentHealth}%` }}
                  />
                </div>
                <div className="mt-2 text-[#ff003c] font-bold text-xl">TARGET: BOT_ALPHA</div>
             </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mb-2">
            PINCH INDEX & THUMB TO GRAB OBJECTS • THROW AT RED TARGET
          </div>
        </div>
      )}
    </div>
  );
};