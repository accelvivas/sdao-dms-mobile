import { useEffect, useState } from 'react';
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
import { colors } from '../../constants/theme';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import type { Document } from '../../types/document';

export default function ReviewQueueScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ReviewQueue'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadQueue(refresh = false) {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const items = await getReviewQueue();
      setDocuments(items);
    } catch {
      setError('Unable to load Activity Proposals. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadQueue().catch(() => undefined);
  }, []);

  return (
    <Screen onRefresh={() => loadQueue(true)} refreshing={isRefreshing} scroll>
      <Text style={styles.title}>Review queue</Text>
      <Text style={styles.subtitle}>Activity Proposals awaiting your review.</Text>
      <Card>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading queue...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>
            No Activity Proposals are currently awaiting your review.
          </Text>
        ) : (
          documents.map((document, index) => (
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
          ))
        )}
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
  emptyText: {
    color: colors.textMuted,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.danger,
    paddingVertical: 8,
  },
});
