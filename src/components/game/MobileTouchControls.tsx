import { useRef, useCallback, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Mobile touch controls for the racing game.
 * - Left side: virtual joystick (WASD)
 * - Right side: gas/paddle button (Shift)
 * Dispatches real KeyboardEvents so the Boat component picks them up unchanged.
 */

const dispatchKey = (key: string, type: 'keydown' | 'keyup') => {
  window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
};

export const MobileTouchControls = () => {
  const isMobile = useIsMobile();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const joystickRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());

  const updateKeys = useCallback((newKeys: Set<string>) => {
    const prev = activeKeysRef.current;
    // Release keys no longer active
    prev.forEach(k => {
      if (!newKeys.has(k)) dispatchKey(k, 'keyup');
    });
    // Press newly active keys
    newKeys.forEach(k => {
      if (!prev.has(k)) dispatchKey(k, 'keydown');
    });
    activeKeysRef.current = new Set(newKeys);
    setActiveKeys(new Set(newKeys));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeKeysRef.current.forEach(k => dispatchKey(k, 'keyup'));
    };
  }, []);

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    originRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!originRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - originRef.current.x;
    const dy = touch.clientY - originRef.current.y;
    const deadzone = 15;
    const keys = new Set<string>();

    if (dy < -deadzone) keys.add('w');
    if (dy > deadzone) keys.add('s');
    if (dx < -deadzone) keys.add('a');
    if (dx > deadzone) keys.add('d');

    // Keep gas if it was held
    if (activeKeysRef.current.has('shift')) keys.add('shift');
    updateKeys(keys);
  }, [updateKeys]);

  const handleJoystickEnd = useCallback(() => {
    originRef.current = null;
    const keys = new Set<string>();
    if (activeKeysRef.current.has('shift')) keys.add('shift');
    updateKeys(keys);
  }, [updateKeys]);

  const handleGasStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const keys = new Set(activeKeysRef.current);
    keys.add('shift');
    updateKeys(keys);
  }, [updateKeys]);

  const handleGasEnd = useCallback(() => {
    const keys = new Set(activeKeysRef.current);
    keys.delete('shift');
    updateKeys(keys);
  }, [updateKeys]);

  if (!isMobile) return null;

  const isMoving = activeKeys.has('w') || activeKeys.has('s') || activeKeys.has('a') || activeKeys.has('d');
  const isGas = activeKeys.has('shift');

  // Compute joystick nub offset
  let nubX = 0, nubY = 0;
  if (activeKeys.has('a')) nubX = -18;
  if (activeKeys.has('d')) nubX = 18;
  if (activeKeys.has('w')) nubY = -18;
  if (activeKeys.has('s')) nubY = 18;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none" style={{ touchAction: 'none' }}>
      {/* Joystick area — bottom right */}
      <div
        ref={joystickRef}
        className="absolute pointer-events-auto"
        style={{
          right: 20,
          bottom: 30,
          width: 130,
          height: 130,
          touchAction: 'none',
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(68, 255, 136, 0.1)',
            border: `2px solid rgba(68, 255, 136, ${isMoving ? 0.5 : 0.25})`,
            boxShadow: isMoving ? '0 0 20px rgba(68,255,136,0.2)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        {/* Inner nub */}
        <div
          className="absolute rounded-full"
          style={{
            width: 50,
            height: 50,
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${nubX}px), calc(-50% + ${nubY}px))`,
            background: isMoving
              ? 'radial-gradient(circle, rgba(68,255,136,0.6), rgba(68,255,136,0.2))'
              : 'radial-gradient(circle, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
            border: `2px solid rgba(68,255,136, ${isMoving ? 0.7 : 0.3})`,
            transition: 'transform 0.1s ease-out, background 0.15s',
          }}
        />
        {/* Direction arrows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.3, fontSize: 10, fontFamily: 'Bangers', color: '#44ff88' }}>
          <span className="absolute" style={{ top: 8, left: '50%', transform: 'translateX(-50%)' }}>▲</span>
          <span className="absolute" style={{ bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>▼</span>
          <span className="absolute" style={{ left: 8, top: '50%', transform: 'translateY(-50%)' }}>◀</span>
          <span className="absolute" style={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}>▶</span>
        </div>
      </div>

      {/* Gas / Paddle button — bottom left */}
      <div
        className="absolute pointer-events-auto flex items-center justify-center"
        style={{
          left: 25,
          bottom: 40,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: isGas
            ? 'radial-gradient(circle, rgba(255,170,0,0.5), rgba(255,100,0,0.2))'
            : 'rgba(255,255,255,0.08)',
          border: `3px solid ${isGas ? 'rgba(255,170,0,0.7)' : 'rgba(255,255,255,0.2)'}`,
          boxShadow: isGas ? '0 0 30px rgba(255,170,0,0.4)' : 'none',
          transition: 'all 0.15s',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleGasStart}
        onTouchEnd={handleGasEnd}
        onTouchCancel={handleGasEnd}
      >
        <div className="text-center pointer-events-none select-none">
          <div style={{
            fontSize: 28,
            lineHeight: 1,
          }}>
            🔥
          </div>
          <div style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 11,
            color: isGas ? '#ffcc44' : '#888',
            letterSpacing: '0.05em',
            marginTop: 2,
          }}>
            PADDLE
          </div>
        </div>
      </div>

      {/* Restart button — top right area below exit */}
      <div
        className="absolute pointer-events-auto flex items-center justify-center"
        style={{
          right: 20,
          top: 60,
          width: 44,
          height: 44,
          borderRadius: 10,
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          touchAction: 'none',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          dispatchKey('r', 'keydown');
          setTimeout(() => dispatchKey('r', 'keyup'), 100);
        }}
      >
        <span style={{ fontFamily: 'Bangers', fontSize: 14, color: '#888' }}>↻</span>
      </div>
    </div>
  );
};

