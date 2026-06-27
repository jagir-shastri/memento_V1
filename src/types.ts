/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppState = 'WELCOME' | 'PAYMENT' | 'FILTER_SELECT' | 'CAPTURING' | 'PREVIEW';

export interface FilterOption {
  id: string;
  name: string;
  class: string; // Tailwind class or custom canvas manipulation style
  cssFilter: string; // standard CSS filter
  description: string;
  previewColor: string;
}

export interface StripTheme {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentClass: string;
  primaryColor: string; // hex
  secondaryColor: string; // hex
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface GridLayout {
  id: string;
  name: string;
  description: string;
  photoCount: number;
  columns: number;
}

