import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

beforeAll(() => {
  // Polyfill PointerEvent for jsdom so clientX/clientY/pointerId work on pointer events
  if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 1;
        this.pointerType = params.pointerType ?? 'mouse';
      }
    }
    vi.stubGlobal('PointerEvent', MockPointerEvent);
  }

  // Polyfill HTMLDialogElement methods for jsdom
  if (typeof HTMLDialogElement !== 'undefined') {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }

  // Mock scrollIntoView and scrollTo for jsdom
  if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
  if (typeof window !== 'undefined') {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  }
  if (typeof HTMLMediaElement !== 'undefined') {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.reject(new Error('No media in test')));
    HTMLMediaElement.prototype.pause = vi.fn();
  }
});
