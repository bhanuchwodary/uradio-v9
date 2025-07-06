
export interface Track {
  url: string;
  name: string;
  isFavorite: boolean;
  playTime: number;
  isFeatured?: boolean;
  language?: string;
}
