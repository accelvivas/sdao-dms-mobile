import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';
import { getAppRole } from '../types/auth';
import ApproverNavigator from './ApproverNavigator';
import { stackScreenOptions } from './options';
import StudentNavigator from './StudentNavigator';

export type AuthStackParamList = {
  Login: undefined;
  TwoFactor: { email: string; challengeToken: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ ...stackScreenOptions, headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={TwoFactorScreen} name="TwoFactor" />
    </AuthStack.Navigator>
  );
}

function RootSwitch() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashBrand}>SDAO DMS</Text>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (getAppRole(user) === 'approver') {
    return <ApproverNavigator />;
  }

  return <StudentNavigator />;
}

export default function RootNavigator() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootSwitch />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    gap: 16,
  },
  splashBrand: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
