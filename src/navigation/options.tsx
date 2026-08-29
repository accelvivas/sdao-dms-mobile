import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { colors } from '../constants/theme';

export function tabScreenOptions(
  icon: keyof typeof Ionicons.glyphMap,
  activeIcon: keyof typeof Ionicons.glyphMap,
): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons color={color} name={focused ? activeIcon : icon} size={size} />
    ),
  };
}

export const tabNavigatorOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
};

export const stackScreenOptions = {
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTitleStyle: {
    fontWeight: '700' as const,
    color: colors.text,
  },
  contentStyle: {
    backgroundColor: colors.background,
  },
};
