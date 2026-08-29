import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import DocumentStatusScreen from '../screens/student/DocumentStatusScreen';
import MyDocumentsScreen from '../screens/student/MyDocumentsScreen';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import { stackScreenOptions, tabNavigatorOptions, tabScreenOptions } from './options';

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
    <Tabs.Navigator screenOptions={tabNavigatorOptions}>
      <Tabs.Screen
        component={StudentHomeScreen}
        name="StudentHome"
        options={{
          title: 'Home',
          ...tabScreenOptions('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        component={MyDocumentsScreen}
        name="MyDocuments"
        options={{
          title: 'Documents',
          ...tabScreenOptions('folder-outline', 'folder'),
        }}
      />
      <Tabs.Screen
        component={NotificationsScreen}
        name="Notifications"
        options={tabScreenOptions('notifications-outline', 'notifications')}
      />
      <Tabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={tabScreenOptions('person-outline', 'person')}
      />
    </Tabs.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
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
