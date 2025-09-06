// components/ArticleList.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function ArticleList({ articles, loading }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Articles Title List</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.articleItem}>• {item.title}</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  articleItem: { fontSize: 16, paddingVertical: 6 },
});
