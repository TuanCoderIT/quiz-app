import type { ComponentProps, PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '../theme';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  edges?: ComponentProps<typeof SafeAreaView>['edges'];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export const ScreenContainer = ({
  children,
  scroll = false,
  edges,
  style,
  contentContainerStyle,
}: ScreenContainerProps) => {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[5],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[5],
  },
});
