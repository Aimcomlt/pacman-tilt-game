import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, pauseGame, startGame } from '../store';

export const HUD = () => {
  const dispatch = useDispatch();
  const { score, pacman, levelId, status } = useSelector((state: RootState) => state.game);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, color: '#fff', padding: '8px' }}>
      <div>Level: {levelId}</div>
      <div>Score: {score}</div>
      <div>Lives: {pacman.lives}</div>
      <div>Status: {status}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => dispatch(startGame())} disabled={status === 'running'}>
          Start/Resume
        </button>
        <button onClick={() => dispatch(pauseGame())} disabled={status !== 'running'}>
          Pause
        </button>
      </div>
    </div>
  );
};
