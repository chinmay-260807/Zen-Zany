
export enum AdviceMood {
  INSPIRATIONAL = 'INSPIRATIONAL',
  LIGHTHEARTED = 'LIGHTHEARTED',
  GOOFY = 'GOOFY',
  ABSURD = 'ABSURD'
}

export interface Advice {
  id: string;
  text: string;
  mood: AdviceMood;
}

export interface AdviceState {
  current: Advice | null;
  history: Advice[];
  loading: boolean;
  error: string | null;
}
