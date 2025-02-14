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
    date: string;
    predictedTime: string;
    actualTime: string;
  }[];
}
