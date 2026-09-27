import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  backgroundColor = colors.background,
  style,
  refreshing = false,
  onRefresh,
}: Props) {
  const content = (
    <View style={[styles.body, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
              ) : undefined
            }
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  scroll: {
    flexGrow: 1,
  },
});
