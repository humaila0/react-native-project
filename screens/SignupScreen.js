// /screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);

  const handleSignup = () => {
    try {
      console.log('🔐 Sign up button pressed');
      console.log('📝 Name:', name);
      console.log('👤 Role:', role);
      
      // Validation with error handling
      if (!name || !name.trim()) {
        Alert.alert('⚠️ Error', 'Please enter your name');
        return;
      }
      
      if (!role) {
        Alert.alert('⚠️ Error', 'Please select a role');
        return;
      }
      
      // Navigation with error handling
      if (role === 'publisher') {
        console.log('🏢 Navigating to Publisher Home');
        navigation.navigate('Home', { name: name.trim(), role });
      } else {
        console.log('📚 Navigating to Reader');
        navigation.navigate('Reader', { name: name.trim(), role });
      }
      
    } catch (error) {
      console.log('❌ Sign up error:', error);
      Alert.alert('❌ Sign Up Failed', 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Article Management</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Name</Text>
        <TextInput
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.roleSection}>
        <Text style={styles.roleLabel}>Select Your Role:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'reader' && styles.selectedButton]}
            onPress={() => setRole('reader')}
          >
            <Text style={[styles.roleButtonText, role === 'reader' && styles.selectedButtonText]}>
               Reader
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'publisher' && styles.selectedButton]}
            onPress={() => setRole('publisher')}
          >
            <Text style={[styles.roleButtonText, role === 'publisher' && styles.selectedButtonText]}>
              Publisher
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pink-Purple Gradient Button with Purple Dominance */}
      <TouchableOpacity 
        style={styles.signupButtonContainer}
        onPress={handleSignup}
        disabled={!name.trim() || !role}
      >
        <LinearGradient
          colors={(!name.trim() || !role) ? 
            ['#bdc3c7', '#95a5a3'] : 
           ['purple', '#8e11ad', '#6f42c1']   
           }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.signupButton}
        >
          <Text style={styles.signupButtonText}> Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Choose Reader to browse articles or Publisher to create content
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25, 
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  header: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 40,
    textAlign: 'center',
    color: 'purple',
    letterSpacing: 1
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f42c1',
    marginBottom: 8,
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#9b59b6', 
    padding: 18, 
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  roleSection: {
    marginBottom: 30,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6f42c1',
    marginBottom: 15,
    textAlign: 'center'
  },
  roleButton: {
    flex: 1,
    padding: 18,
    borderWidth: 2,
    borderColor: '#9b59b6',
    borderRadius: 15,
    margin: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  selectedButton: { 
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
    transform: [{ scale: 1.02 }]
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f42c1'
  },
  selectedButtonText: {
    color: '#ffffff'
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between'
  },
  signupButtonContainer: {
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#6f42c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  signupButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    lineHeight: 20
  }
});