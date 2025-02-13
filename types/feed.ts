export interface Feed {
  id?: string;
  feedTime: string;
  amount: number;
  wetDiaper: boolean;
  pooped: boolean;
}

export interface FeedPrediction {
  nextFeedIn: {
    hours: number;
    minutes: number;
  } | null;
  message: string;
  predictionHistory?: {
    feedNumber: number;
    averageTime: string;
    previousFeeds: {
      date: string;
      time: string;
    }[];
  };
}
