import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApproverHomeScreen from '../screens/approver/ApproverHomeScreen';
import DocumentReviewScreen from '../screens/approver/DocumentReviewScreen';
import ReviewQueueScreen from '../screens/approver/ReviewQueueScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

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
    <Tabs.Navigator>
      <Tabs.Screen
        component={ApproverHomeScreen}
        name="ApproverHome"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        component={ReviewQueueScreen}
        name="ReviewQueue"
        options={{ title: 'Queue' }}
      />
      <Tabs.Screen
        component={NotificationsScreen}
        name="Notifications"
      />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
    </Tabs.Navigator>
  );
}

export default function ApproverNavigator() {
  return (
    <Stack.Navigator>
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
