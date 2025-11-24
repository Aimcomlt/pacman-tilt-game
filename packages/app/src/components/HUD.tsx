import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const HUD = () => {
  const { score, pacman, levelId, status } = useSelector((state: RootState) => state.game);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, color: '#fff', padding: '8px' }}>
      <div>Level: {levelId}</div>
      <div>Score: {score}</div>
      <div>Lives: {pacman.lives}</div>
      <div>Status: {status}</div>
    </div>
  );
};
