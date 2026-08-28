import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import DocumentStatusScreen from '../screens/student/DocumentStatusScreen';
import MyDocumentsScreen from '../screens/student/MyDocumentsScreen';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';

export type StudentTabParamList = {
  StudentHome: undefined;
  MyDocuments: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  DocumentStatus: { documentId: string };
};

const Tabs = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

function StudentTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen
        component={StudentHomeScreen}
        name="StudentHome"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        component={MyDocumentsScreen}
        name="MyDocuments"
        options={{ title: 'Documents' }}
      />
      <Tabs.Screen
        component={NotificationsScreen}
        name="Notifications"
      />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
    </Tabs.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={StudentTabs}
        name="StudentTabs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={DocumentStatusScreen}
        name="DocumentStatus"
        options={{ title: 'Document status' }}
      />
    </Stack.Navigator>
  );
}
