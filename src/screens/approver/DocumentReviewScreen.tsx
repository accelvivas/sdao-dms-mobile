import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

export default function DocumentReviewScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document review</Text>
      <Text style={styles.subtitle}>{route.params.documentId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    color: '#475467',
  },
});
