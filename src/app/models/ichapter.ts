export interface IChapter {
  id: string;
  title: string;
  asset: {
    title: string;
    resource: {
      duration: number;
      stream: {
        url: string;
      };
      thumbnail: {
        url: string;
      };
      hlsPlaylistUrl: string;
    };
  };
}


