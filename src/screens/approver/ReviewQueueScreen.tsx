import { StyleSheet, Text, View } from 'react-native';

export default function ReviewQueueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review queue</Text>
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
});
