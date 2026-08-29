import { StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { DocumentRow } from '../../components/DocumentRow';
import { Screen } from '../../components/Screen';
import { mockQueue } from '../../constants/mockData';
import { colors } from '../../constants/theme';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';

export default function ReviewQueueScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ReviewQueue'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();

  return (
    <Screen scroll>
      <Text style={styles.title}>Review queue</Text>
      <Text style={styles.subtitle}>
        Sample queue layout. Approvals will connect to the API later.
      </Text>
      <Card>
        {mockQueue.map((document, index) => (
          <View key={document.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <DocumentRow
              document={document}
              onPress={() =>
                navigation.navigate('DocumentReview', { documentId: document.id })
              }
              showSubmitter
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
