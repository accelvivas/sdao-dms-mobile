import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { DocumentRow } from '../../components/DocumentRow';
import { Screen } from '../../components/Screen';
import { mockDocuments } from '../../constants/mockData';
import { colors, radius } from '../../constants/theme';
import type {
  StudentStackParamList,
  StudentTabParamList,
} from '../../navigation/StudentNavigator';
import type { DocumentStatus } from '../../types/document';

const filters: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In review', value: 'in_review' },
  { label: 'Approved', value: 'approved' },
];

export default function MyDocumentsScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<StudentTabParamList, 'MyDocuments'>,
        NativeStackNavigationProp<StudentStackParamList>
      >
    >();
  const [filter, setFilter] = useState<DocumentStatus | 'all'>('all');
  const documents =
    filter === 'all'
      ? mockDocuments
      : mockDocuments.filter((item) => item.status === filter);

  return (
    <Screen scroll>
      <Text style={styles.title}>My documents</Text>
      <Text style={styles.subtitle}>Preview layout with sample requests.</Text>

      <View style={styles.filters}>
        {filters.map((item) => {
          const selected = item.value === filter;
          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        {documents.map((document, index) => (
          <View key={document.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <DocumentRow
              document={document}
              onPress={() =>
                navigation.navigate('DocumentStatus', { documentId: document.id })
              }
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  chipLabelSelected: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
