import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const GET_CHARACTERS = gql`
  query {
    characters(page: 1) {
      results {
        id
        name
        species
        image
      }
    }
  }
`;

// 🔹 Simple Character of the Day logic
const getCharacterOfTheDay = (characters) => {
  const day = new Date().getDate(); // 1–31
  const index = day % characters.length;
  return characters[index];
};

export default function CharactersScreen() {
  const { loading, error, data } = useQuery(GET_CHARACTERS);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error.message}</Text>;

  const characters = data.characters.results;
  const characterOfTheDay = getCharacterOfTheDay(characters);

  return (
    <FlatList
      data={characters}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={() => (
        <View style={styles.featuredCard}>
          <Text style={styles.featuredTitle}>🌟 Character of the Day</Text>
          <Image source={{ uri: characterOfTheDay.image }} style={styles.featuredImage} />
          <Text style={styles.name}>{characterOfTheDay.name}</Text>
          <Text style={styles.species}>{characterOfTheDay.species}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.species}>{item.species}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  featuredCard: {
    backgroundColor: '#fdf6e3',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6f42c1',
  },
  featuredImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f42c1',
  },
  species: {
    fontSize: 14,
    color: '#555',
  },
});
