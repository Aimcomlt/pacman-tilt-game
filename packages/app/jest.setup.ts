import '@testing-library/jest-dom';

const mockCanvasContext = {
  fillStyle: '',
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext as unknown as CanvasRenderingContext2D);

Object.defineProperty(global, 'requestAnimationFrame', {
  value: (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16),
});
