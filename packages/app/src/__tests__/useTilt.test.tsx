import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import tiltReducer from '../store/slices/tiltSlice';
import { useTilt } from '../hooks/useTilt';

jest.mock('expo-sensors');

describe('accelerometer-driven tilt controls', () => {
  it('converts accelerometer samples into normalized directions', async () => {
    jest.useFakeTimers();
    const store = configureStore({ reducer: { tilt: tiltReducer } });

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTilt(), { wrapper });

    const sensors = (await import('expo-sensors')) as unknown as {
      __emitAccelerometer: (data: { x?: number; y?: number; z?: number }) => void;
      Accelerometer: { setUpdateInterval: jest.Mock; addListener: jest.Mock };
    };
    const { __emitAccelerometer, Accelerometer } = sensors;

    expect(Accelerometer.setUpdateInterval).toHaveBeenCalled();

    act(() => {
      __emitAccelerometer({ x: 0.8, y: 0 });
      jest.advanceTimersByTime(80);
    });

    expect(result.current.direction).toBe('right');
    jest.useRealTimers();
  });
});
