// screens/ReaderScreen.js - Reader Dashboard with Purple & Yellow Theme
import React, { useEffect, useState, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ArticleContext } from '../context/ArticleContext';
import ArticleList from '../components/ArticleList';
import FeedbackScreen from './FeedbackScreen';
import SearchScreen from './SearchScreen';
import CharactersScreen from './CharactersScreen';

const SHEET_URL = 'https://api.sheetbest.com/sheets/4b63fcc0-e8e8-4a03-8160-e59dd191375b';

function ReaderArticlesScreen({ route }) {
  const { name, role } = route.params;
  const { articles, setArticles } = useContext(ArticleContext);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      console.log(' Reader: Fetching articles...');
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      
      const formatted = data.map((item, i) => ({
        id: item.id ? item.id.toString() : i.toString(),
        title: item.name || 'Untitled',
        name: item.name || 'Untitled',
        ratings: item.ratings || 0,
      }));
      
      setArticles(formatted.reverse());
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const EnhancedArticleList = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}> Welcome, {name} ({role})</Text>
        
        <TouchableOpacity 
          onPress={fetchArticles}
          style={styles.refreshButton}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? '⏳ Loading...' : ' Refresh Articles'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.articleCount}>
          Total Articles: {articles?.length || 0}
        </Text>

        <ArticleList articles={articles} loading={loading} name={name} role={role} />
      </View>
    </SafeAreaView>
  );

  return <EnhancedArticleList />;
}

const Tab = createBottomTabNavigator();

export default function ReaderTabs({ route }) {
  const { name, role } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false,
          tabBarActiveTintColor: '#6f42c1',      // Purple when active
          tabBarInactiveTintColor: 'gray',    // Yellow when inactive
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 2,
            borderTopColor: '#9b59b6',           // Purple border
            paddingBottom: 8,
            paddingTop: 8,
            height: 75,
            elevation: 8,                        // Shadow on Android
            shadowColor: '#6f42c1',              // Purple shadow on iOS
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: 'bold',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}
      >
        <Tab.Screen
          name="Articles"
          component={ReaderArticlesScreen}
          initialParams={route.params}
          options={{ 
            title: 'Browse',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons 
                name="library-books" 
                size={focused ? 26 : 22} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          initialParams={{ name, role }}
          options={{ 
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name="search" 
                size={focused ? 26 : 22} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen
          name="Rate Articles"
          component={FeedbackScreen}
          initialParams={{ name, role }}
          options={{ 
            title: 'Rate',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons 
                name="star" 
                size={focused ? 26 : 22} 
                color={color} 
              />
            ),
          }}
        />

        <Tab.Screen
  name="Characters"
  component={CharactersScreen}
  options={{ 
    title: 'Characters',
    tabBarIcon: ({ color, focused }) => (
      <MaterialIcons 
        name="face" 
        size={focused ? 26 : 22} 
        color={color} 
      />
    ),
  }}
/>

      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#6f42c1',              // Purple header
    paddingHorizontal: 20,
    paddingTop: 20,
    letterSpacing: 0.5,
  },
  refreshButton: {
    backgroundColor: '#6f42c1',    // Purple button
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#6f42c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  articleCount: {
    fontSize: 16,
    color: '#ffc107',              // Yellow count text
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    backgroundColor: '#fff3cd',     // Light yellow background
    marginHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
});