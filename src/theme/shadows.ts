import type { ViewStyle } from 'react-native';

import { Colors } from './colors';

export const Shadows = {
  glass: {
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 3,
  } satisfies ViewStyle,
  glassSoft: {
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  } satisfies ViewStyle,
  primary: {
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  } satisfies ViewStyle,
} as const;
