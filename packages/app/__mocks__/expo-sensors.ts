const listeners: ((data: { x?: number; y?: number; z?: number }) => void)[] = [];

export const Accelerometer = {
  setUpdateInterval: jest.fn(),
  addListener: jest.fn((callback: (data: { x?: number; y?: number; z?: number }) => void) => {
    listeners.push(callback);
    return {
      remove: jest.fn(() => {
        const index = listeners.indexOf(callback);
        if (index >= 0) listeners.splice(index, 1);
      }),
    };
  }),
};

export const __emitAccelerometer = (data: { x?: number; y?: number; z?: number }) => {
  listeners.forEach((listener) => listener(data));
};

export default { Accelerometer };
