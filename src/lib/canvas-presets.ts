export interface CanvasPreset {
  id: string;
  label: string;
  ratioLabel: string;
  aspectRatio: number;
  width: number;
  height: number;
  description: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: 'square',
    label: 'Square',
    ratioLabel: '1:1',
    aspectRatio: 1,
    width: 1080,
    height: 1080,
    description: 'Instagram posts, thumbnails, profile art',
  },
  {
    id: 'landscape',
    label: 'Widescreen',
    ratioLabel: '16:9',
    aspectRatio: 16 / 9,
    width: 1920,
    height: 1080,
    description: 'YouTube covers, presentations, hero images',
  },
  {
    id: 'portrait',
    label: 'Vertical',
    ratioLabel: '9:16',
    aspectRatio: 9 / 16,
    width: 1080,
    height: 1920,
    description: 'Stories, Reels, Shorts backgrounds',
  },
  {
    id: 'poster',
    label: 'Poster',
    ratioLabel: '4:5',
    aspectRatio: 4 / 5,
    width: 1080,
    height: 1350,
    description: 'Social ads, featured artwork, flyers',
  },
  {
    id: 'classic',
    label: 'Classic',
    ratioLabel: '3:2',
    aspectRatio: 3 / 2,
    width: 1500,
    height: 1000,
    description: 'Prints, postcards, cover art',
  },
];

export function getCanvasPreset(presetId: string): CanvasPreset {
  return (
    CANVAS_PRESETS.find((preset) => preset.id === presetId) ?? CANVAS_PRESETS[0]
  );
}
