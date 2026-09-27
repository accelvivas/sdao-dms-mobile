import { useCallback, useEffect, useRef, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NotificationResponse } from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import { markLatestNotificationForProposalRead } from '../services/notificationService';
import {
  addNotificationResponseListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from '../services/pushNotificationService';
import type { ApproverStackParamList } from './ApproverNavigator';
import { canAccessMobileReview } from '../types/auth';
import ApproverNavigator from './ApproverNavigator';
import { stackScreenOptions } from './options';

export type AuthStackParamList = {
  Login: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
type RootParamList = AuthStackParamList & ApproverStackParamList;
const navigationRef = createNavigationContainerRef<RootParamList>();

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
    </AuthStack.Navigator>
  );
}

function getProposalReference(response: NotificationResponse): string | null {
  const proposalReference = response.notification.request.content.data?.proposalReference;
  return typeof proposalReference === 'string' && proposalReference.length > 0
    ? proposalReference
    : null;
}

function RootSwitch({ navigationReady }: { navigationReady: boolean }) {
  const { user, isLoading } = useAuth();
  const [lastNotificationResponse, setLastNotificationResponse] = useState<NotificationResponse | null>(null);
  const pendingProposalReference = useRef<string | null>(null);

  const openPendingProposal = useCallback(() => {
    if (!user || !canAccessMobileReview(user) || isLoading || !navigationReady || !pendingProposalReference.current) return;

    const documentId = pendingProposalReference.current;
    pendingProposalReference.current = null;
    void markLatestNotificationForProposalRead(documentId).catch(() => undefined);
    navigationRef.navigate('DocumentReview', { documentId });
    void clearLastNotificationResponse();
  }, [isLoading, navigationReady, user]);

  const receiveNotificationResponse = useCallback((response: NotificationResponse) => {
    const proposalReference = getProposalReference(response);
    if (!proposalReference) return;

    pendingProposalReference.current = proposalReference;
    openPendingProposal();
  }, [openPendingProposal]);

  useEffect(() => {
    let isMounted = true;
    const subscription = addNotificationResponseListener(setLastNotificationResponse);
    void getLastNotificationResponse().then((response) => {
      if (isMounted && response) setLastNotificationResponse(response);
    });
    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (lastNotificationResponse) receiveNotificationResponse(lastNotificationResponse);
  }, [lastNotificationResponse, receiveNotificationResponse]);

  useEffect(() => {
    openPendingProposal();
  }, [openPendingProposal]);

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

  if (canAccessMobileReview(user)) {
    return <ApproverNavigator />;
  }

  return <AuthNavigator />;
}

export default function RootNavigator() {
  const [navigationReady, setNavigationReady] = useState(false);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer
          onReady={() => setNavigationReady(true)}
          ref={navigationRef}
          theme={navigationTheme}
        >
          <RootSwitch navigationReady={navigationReady} />
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
