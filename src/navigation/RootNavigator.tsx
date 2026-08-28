import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';
import ApproverNavigator from './ApproverNavigator';
import StudentNavigator from './StudentNavigator';

export type AuthStackParamList = {
  Login: undefined;
  TwoFactor: { email: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        component={LoginScreen}
        name="Login"
        options={{ title: 'Sign in' }}
      />
      <AuthStack.Screen
        component={TwoFactorScreen}
        name="TwoFactor"
        options={{ title: 'Verify' }}
      />
    </AuthStack.Navigator>
  );
}

function RootSwitch() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (user.role === 'approver') {
    return <ApproverNavigator />;
  }

  return <StudentNavigator />;
}

export default function RootNavigator() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootSwitch />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
