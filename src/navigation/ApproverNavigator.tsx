import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApproverHomeScreen from '../screens/approver/ApproverHomeScreen';
import DocumentReviewScreen from '../screens/approver/DocumentReviewScreen';
import ReviewQueueScreen from '../screens/approver/ReviewQueueScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { stackScreenOptions, tabNavigatorOptions, tabScreenOptions } from './options';

export type ApproverTabParamList = {
  ApproverHome: undefined;
  ReviewQueue: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type ApproverStackParamList = {
  ApproverTabs: undefined;
  DocumentReview: { documentId: string };
};

const Tabs = createBottomTabNavigator<ApproverTabParamList>();
const Stack = createNativeStackNavigator<ApproverStackParamList>();

function ApproverTabs() {
  return (
    <Tabs.Navigator screenOptions={tabNavigatorOptions}>
      <Tabs.Screen
        component={ApproverHomeScreen}
        name="ApproverHome"
        options={{
          title: 'Home',
          ...tabScreenOptions('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        component={ReviewQueueScreen}
        name="ReviewQueue"
        options={{
          title: 'Queue',
          ...tabScreenOptions('reader-outline', 'reader'),
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

export default function ApproverNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={ApproverTabs}
        name="ApproverTabs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={DocumentReviewScreen}
        name="DocumentReview"
        options={{ title: 'Review document' }}
      />
    </Stack.Navigator>
  );
}
