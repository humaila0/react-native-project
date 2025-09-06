 
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
 
// 1. Create Apollo client
const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/',
  cache: new InMemoryCache(),
});
 
// 2. Define query
const GET_COUNTRIES = gql`
  query {
    countries {
      code
      name
      emoji
    }
  }
`;
 
// 3. Component to display countries
const CountryList = () => {
  const { loading, error, data } = useQuery(GET_COUNTRIES);
 
  if (loading) return <Text> </Text>;
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>;
 
  return (
    <FlatList
      data={data.countries}
      keyExtractor={(item) => item.code}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.text}>{item.emoji} {item.name}</Text>
        </View>
      )}
    />
  );
};
 
// 4. Main App component
export default function App() {
  return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
        <Text style={styles.header}>🌍 Country List</Text>
        <CountryList />
      </View>
    </ApolloProvider>
  );
}
 
// 5. Styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    marginTop: 50,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 18,
  },
});
 