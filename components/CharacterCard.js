import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const GET_CHARACTER = gql`
  query {
    character(id: 1) {
      id
      name
      species
      image
    }
  }
`;

export default function CharacterCard() {
  const { loading, error, data } = useQuery(GET_CHARACTER);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error loading character.</Text>;

  const { name, species, image } = data.character;

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.species}>Species: {species}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  species: {
    fontSize: 14,
    color: '#555',
  },
});
