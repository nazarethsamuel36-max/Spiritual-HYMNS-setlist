export interface PageFlipSettings {
  width: number;
  height: number;
  size?: 'fixed' | 'stretch';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startPage?: number;
  startZIndex?: number;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  swipeDistance?: number;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  showPageCorners?: boolean;
}

export interface FlipEvent {
  data: number;
  object: PageFlip;
}

export interface ChangeStateEvent {
  data: 'user_fold' | 'fold_corner' | 'flipping' | 'read';
  object: PageFlip;
}

export interface ChangeOrientationEvent {
  data: 'portrait' | 'landscape';
  object: PageFlip;
}

export declare class PageFlip {
  constructor(element: HTMLElement, settings: PageFlipSettings);
  destroy(): void;
  update(): void;
  loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
  updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
  turnToPrevPage(): void;
  turnToNextPage(): void;
  turnToPage(page: number): void;
  flipNext(corner?: 'top' | 'bottom'): void;
  flipPrev(corner?: 'top' | 'bottom'): void;
  flip(page: number, corner?: 'top' | 'bottom'): void;
  getPageCount(): number;
  getCurrentPageIndex(): number;
  getOrientation(): 'portrait' | 'landscape';
  getState(): 'user_fold' | 'fold_corner' | 'flipping' | 'read';
  getBoundsRect(): { left: number; top: number; width: number; height: number; pageWidth: number };
  on(event: 'flip', callback: (e: FlipEvent) => void): this;
  on(event: 'changeState', callback: (e: ChangeStateEvent) => void): this;
  on(event: 'changeOrientation', callback: (e: ChangeOrientationEvent) => void): this;
  on(event: 'init', callback: (e: { data: { page: number; mode: string }; object: PageFlip }) => void): this;
  off(event: string): void;
}
