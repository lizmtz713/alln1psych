/**
 * Type declarations for react-native-pager-view (no @types package).
 */
declare module 'react-native-pager-view' {
  import { Component } from 'react';
  import type { ViewProps } from 'react-native';

  export interface PagerViewProps extends ViewProps {
    initialPage?: number;
    scrollEnabled?: boolean;
    onPageScroll?: (e: { nativeEvent: { position: number; offset: number } }) => void;
    onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
    onPageScrollStateChanged?: (state: 'idle' | 'dragging' | 'settling') => void;
  }

  export default class PagerView extends Component<PagerViewProps> {
    setPage(offset: number): void;
    setPageWithoutAnimation(offset: number): void;
  }
}
