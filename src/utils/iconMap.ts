import { Ionicons } from '@expo/vector-icons';

type IoniconsName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, IoniconsName> = {
  trophy: 'trophy',
  flame: 'flame',
  star: 'star',
  brain: 'bulb',
  flashcard: 'copy',
  crown: 'ribbon',
  bolt: 'flash',
  book: 'book',
  check: 'checkmark-circle',
  shield: 'shield-checkmark',
  heart: 'heart',
  medal: 'medal',
  rocket: 'rocket',
  target: 'flag',
};

const FALLBACK_ICON: IoniconsName = 'trophy';

export const getAchievementIcon = (key: string | null | undefined): IoniconsName => {
  if (!key) return FALLBACK_ICON;
  return ICON_MAP[key.toLowerCase()] ?? FALLBACK_ICON;
};
