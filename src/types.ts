export interface Episode {
  id: string;
  title: string;
  description: string;
  image: string;
  pubDate: string;
  audioUrl: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  chatUrl?: string;
  theme?: string;
}
