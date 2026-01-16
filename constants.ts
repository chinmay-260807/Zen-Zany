
import { Advice, AdviceMood } from './types';

export const FALLBACK_ADVICE: Advice[] = [
  { text: "If you think you're too small to make a difference, try sleeping with a mosquito.", mood: AdviceMood.LIGHTHEARTED },
  { text: "Eat the dessert first. Life is uncertain.", mood: AdviceMood.LIGHTHEARTED },
  { text: "Confidence is 10% hard work and 90% delusion.", mood: AdviceMood.GOOFY },
  { text: "The early bird gets the worm, but the second mouse gets the cheese.", mood: AdviceMood.INSPIRATIONAL },
  { text: "Never trust a turtle wearing a hat.", mood: AdviceMood.ABSURD },
  { text: "You are made of stardust and probably some old snacks.", mood: AdviceMood.INSPIRATIONAL },
  { text: "Always carry a potato. You never know when you'll meet a tiny hungry king.", mood: AdviceMood.ABSURD }
];

export const MOOD_COLORS: Record<AdviceMood, { primary: string; accent: string; bg: string }> = {
  [AdviceMood.INSPIRATIONAL]: {
    primary: 'bg-blue-600',
    accent: 'text-blue-600',
    bg: '#E0E7FF'
  },
  [AdviceMood.LIGHTHEARTED]: {
    primary: 'bg-green-500',
    accent: 'text-green-600',
    bg: '#DCFCE7'
  },
  [AdviceMood.GOOFY]: {
    primary: 'bg-[#FF4D00]',
    accent: 'text-[#FF4D00]',
    bg: '#FFEDD5'
  },
  [AdviceMood.ABSURD]: {
    primary: 'bg-purple-600',
    accent: 'text-purple-600',
    bg: '#F3E8FF'
  }
};
