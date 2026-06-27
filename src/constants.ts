/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilterOption, StripTheme, GridLayout } from './types';

export const FILTERS: FilterOption[] = [
  {
    id: 'normal',
    name: 'Normal',
    class: 'filter-none',
    cssFilter: 'none',
    description: 'Pristine, true-to-life studio colors.',
    previewColor: 'from-amber-200 to-yellow-600'
  },
  {
    id: 'vintage-gold',
    name: 'Vintage Gold',
    class: 'sepia contrast-110 brightness-105 saturate-120',
    cssFilter: 'sepia(0.35) contrast(1.1) brightness(1.05) saturate(1.2)',
    description: 'Nostalgic golden-era warmth, perfect for Memento.',
    previewColor: 'from-amber-400 to-amber-700'
  },
  {
    id: 'noir',
    name: 'Noir Mono',
    class: 'grayscale contrast-125 brightness-95',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(0.95)',
    description: 'Dramatic high-contrast monochrome with elegant shadows.',
    previewColor: 'from-zinc-500 to-zinc-900'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    class: 'hue-rotate-[320deg] saturate-150 contrast-110',
    cssFilter: 'hue-rotate(320deg) saturate(1.5) contrast(1.1)',
    description: 'Striking magenta highlights with deep golden contours.',
    previewColor: 'from-fuchsia-500 to-yellow-500'
  },
  {
    id: 'warm-cinematic',
    name: 'Warm Cinema',
    class: 'contrast-115 saturate-110 sepia-[0.12] brightness-102',
    cssFilter: 'contrast(1.15) saturate(1.1) sepia(0.12) brightness(1.02)',
    description: 'Rich amber-lit cinema grades with warm skin tones.',
    previewColor: 'from-orange-400 to-red-700'
  },
  {
    id: 'cool-arctic',
    name: 'Cool Slate',
    class: 'saturate-90 hue-rotate-[15deg] contrast-105 brightness-98',
    cssFilter: 'saturate(0.9) hue-rotate(15deg) contrast(1.05) brightness(0.98)',
    description: 'Chilled silvers, muted blues, and crisp modern grading.',
    previewColor: 'from-sky-300 to-indigo-800'
  }
];

export const STRIP_THEMES: StripTheme[] = [
  {
    id: 'royal-gold',
    name: 'Royal Obsidian & Gold',
    bgClass: 'bg-zinc-950',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/60',
    accentClass: 'bg-amber-500/20',
    primaryColor: '#09090b', // zinc-950
    secondaryColor: '#f59e0b' // amber-500
  },
  {
    id: 'classic-midnight',
    name: 'Midnight Pearl',
    bgClass: 'bg-black',
    textClass: 'text-amber-300',
    borderClass: 'border-zinc-800',
    accentClass: 'bg-zinc-900',
    primaryColor: '#000000',
    secondaryColor: '#fcd34d' // amber-300
  },
  {
    id: 'luxury-ivory',
    name: 'Ivory Cream & Gold',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-800',
    borderClass: 'border-amber-600/30',
    accentClass: 'bg-amber-600/5',
    primaryColor: '#f5f5f4', // stone-100
    secondaryColor: '#b45309' // amber-700
  }
];

export const GRID_LAYOUTS: GridLayout[] = [
  {
    id: 'vertical-4',
    name: 'Classic 4-Cut',
    description: 'Traditional vertical photo booth layout with 4 portraits.',
    photoCount: 4,
    columns: 1
  },
  {
    id: 'grid-2x2',
    name: 'Modern 2×2 Collage',
    description: 'A stylish square format ideal for couples and groups.',
    photoCount: 4,
    columns: 2
  },
  {
    id: 'minimal-3',
    name: 'Elegant Trio',
    description: 'Clean, spacious layout focusing on 3 high-quality shots.',
    photoCount: 3,
    columns: 1
  }
];

