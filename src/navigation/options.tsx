import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { colors, shadow } from '../constants/theme';

export function tabScreenOptions(
  icon: keyof typeof Ionicons.glyphMap,
  activeIcon: keyof typeof Ionicons.glyphMap,
): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarIcon: ({ color, focused }) => (
      <Ionicons color={color} name={focused ? activeIcon : icon} size={22} />
    ),
  };
}

export const tabNavigatorOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    ...shadow.card,
    shadowOffset: { width: 0, height: -3 },
  },
  tabBarHideOnKeyboard: true,
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
