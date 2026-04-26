/* ─── Filter Presets ─── */
import type { FilterPreset, Adjustments } from '@/lib/types';

export const FILTER_PRESETS: FilterPreset[] = [
  // ── Cinematic ──
  {
    id: 'cinema-warm',
    name: 'Amber Hour',
    category: 'Cinematic',
    intensity: 1,
    adjustments: {
      temperature: 30,
      contrast: 15,
      saturation: -10,
      highlights: -15,
      shadows: 10,
      vignette: 25,
    },
  },
  {
    id: 'cinema-teal',
    name: 'Teal Noir',
    category: 'Cinematic',
    intensity: 1,
    adjustments: {
      temperature: -25,
      contrast: 20,
      saturation: -15,
      brightness: -5,
      vignette: 30,
    },
  },
  {
    id: 'cinema-fade',
    name: 'Matte Fade',
    category: 'Cinematic',
    intensity: 1,
    adjustments: {
      contrast: -20,
      brightness: 5,
      saturation: -15,
      gamma: 1.1,
    },
  },

  // ── B&W ──
  {
    id: 'bw-classic',
    name: 'Silver',
    category: 'B&W',
    intensity: 1,
    adjustments: {
      saturation: -100,
      contrast: 10,
    },
  },
  {
    id: 'bw-high',
    name: 'Graphite',
    category: 'B&W',
    intensity: 1,
    adjustments: {
      saturation: -100,
      contrast: 40,
      brightness: -5,
    },
  },
  {
    id: 'bw-film',
    name: 'Darkroom',
    category: 'B&W',
    intensity: 1,
    adjustments: {
      saturation: -100,
      contrast: 20,
      vignette: 35,
      gamma: 0.9,
    },
  },

  // ── Vintage ──
  {
    id: 'vintage-warm',
    name: 'Kodak 64',
    category: 'Vintage',
    intensity: 1,
    adjustments: {
      temperature: 20,
      saturation: -20,
      contrast: -10,
      brightness: 5,
      noise: 8,
      vignette: 20,
    },
  },
  {
    id: 'vintage-cool',
    name: 'Polaroid',
    category: 'Vintage',
    intensity: 1,
    adjustments: {
      temperature: -10,
      saturation: -25,
      contrast: -15,
      brightness: 10,
      vignette: 15,
    },
  },
  {
    id: 'vintage-sepia',
    name: 'Sepia',
    category: 'Vintage',
    intensity: 1,
    adjustments: {
      saturation: -60,
      temperature: 35,
      contrast: 5,
      vignette: 20,
    },
  },

  // ── Mood ──
  {
    id: 'mood-dreamy',
    name: 'Dreamscape',
    category: 'Mood',
    intensity: 1,
    adjustments: {
      brightness: 10,
      contrast: -15,
      saturation: 20,
      blur: 5,
      highlights: 15,
    },
  },
  {
    id: 'mood-moody',
    name: 'Midnight',
    category: 'Mood',
    intensity: 1,
    adjustments: {
      brightness: -15,
      contrast: 25,
      saturation: -20,
      temperature: -15,
      vignette: 40,
    },
  },
  {
    id: 'mood-golden',
    name: 'Golden',
    category: 'Mood',
    intensity: 1,
    adjustments: {
      temperature: 40,
      saturation: 15,
      contrast: 10,
      vibrance: 20,
      vignette: 15,
    },
  },

  // ── Vivid ──
  {
    id: 'vivid-pop',
    name: 'Pop Art',
    category: 'Vivid',
    intensity: 1,
    adjustments: {
      saturation: 50,
      contrast: 30,
      vibrance: 30,
    },
  },
  {
    id: 'vivid-neon',
    name: 'Neon Glow',
    category: 'Vivid',
    intensity: 1,
    adjustments: {
      saturation: 40,
      contrast: 20,
      vibrance: 40,
      brightness: 5,
      sharpness: 20,
    },
  },
  {
    id: 'vivid-chrome',
    name: 'Chrome',
    category: 'Vivid',
    intensity: 1,
    adjustments: {
      contrast: 35,
      saturation: 10,
      sharpness: 25,
      highlights: 10,
    },
  },
];

export function getFilterCategories(): string[] {
  return [...new Set(FILTER_PRESETS.map(f => f.category))];
}

/** Blend a partial adjustment set at a given intensity over defaults */
export function blendFilterAdjustments(
  base: Adjustments,
  filterAdj: Partial<Adjustments>,
  intensity: number
): Adjustments {
  const result = { ...base };
  for (const key of Object.keys(filterAdj) as (keyof Adjustments)[]) {
    const filterVal = filterAdj[key];
    if (filterVal !== undefined) {
      result[key] = base[key] + (filterVal - base[key]) * intensity;
    }
  }
  return result;
}
