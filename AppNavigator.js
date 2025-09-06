// AppNavigator.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/Homescreen';
import PublishScreen from './screens/PublishScreen';
import { ArticleContext } from './context/ArticleContext';
import ReaderScreen from './screens/ReaderScreen';
import GraphQL from './screens/GraphQL';

const Stack = createStackNavigator();

function ArticleProvider({ children }) {
  const [articles, setArticles] = useState([]);
  return (
    <ArticleContext.Provider value={{ articles, setArticles }}>
      {children}
    </ArticleContext.Provider>
  );
}

export default function AppNavigator() {
  return (
    <ArticleProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Signup"
          screenOptions={{
            headerStyle: {
                backgroundColor: 'purple', 
              elevation: 0, 
              shadowOpacity: 0, 
            },
            headerTintColor: '#ffffff', 
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center', 
          }}
        >
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{
              title: 'Signup',
              headerStyle: {
                backgroundColor: 'purple', // Purple for signup
              },
            }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Publisher Dashboard',
              // Keep back button - don't add headerLeft: null
            }}
          />
          <Stack.Screen 
            name="Reader" 
            component={ReaderScreen}
            options={{
              title: 'Reader Dashboard',
              // Keep back button - don't add headerLeft: null
            }}
          />
          <Stack.Screen 
            name="Publish" 
            component={PublishScreen}
            options={{
              title: 'Publish Article',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ArticleProvider>
  );
}