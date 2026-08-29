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

  useEffect(() => {
    let isMounted = true;

    getReviewQueue()
      .then((items) => {
        if (isMounted) {
          setDocuments(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDocuments([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Screen scroll>
      <Text style={styles.title}>Review queue</Text>
      <Text style={styles.subtitle}>Approvals loaded from the connected API.</Text>
      <Card>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading queue...</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No queue items available.</Text>
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
});
