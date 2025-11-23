import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const HUD = () => {
  const score = useSelector((state: RootState) => state.game.level);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, color: '#fff' }}>
      <div>Level: {score}</div>
    </div>
  );
};
