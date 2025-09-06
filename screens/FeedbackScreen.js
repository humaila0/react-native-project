// screens/FeedbackScreen.js - Complete fixed version
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Rating } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { ArticleContext } from '../context/ArticleContext';
import { setRating } from '../redux/feedbackSlice';

const SHEET_URL = 'https://api.sheetbest.com/sheets/4b63fcc0-e8e8-4a03-8160-e59dd191375b';

export default function FeedbackScreen({ route }) {
  const { name, role } = route.params || {};
  const { articles, setArticles } = useContext(ArticleContext);
  
  const dispatch = useDispatch();
  const { ratings } = useSelector(state => state.feedback);

  const [articleId, setArticleId] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshArticles();
  }, []);

  // Fetch fresh article data from API before updating
  const fetchFreshArticleData = async (id) => {
    try {
      console.log('🔄 FeedbackScreen: Fetching fresh data for article ID:', id);
      const response = await fetch(SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const allData = await response.json();
      console.log('📊 FeedbackScreen: All data from API:', allData);
      
      const freshArticle = allData.find(item => item.id && item.id.toString() === id.toString());
      console.log('📊 FeedbackScreen: Found fresh article:', freshArticle);
      
      return freshArticle;
    } catch (error) {
      console.log('❌ FeedbackScreen: Error fetching fresh data:', error);
      return null;
    }
  };

  const handleRating = async () => {
    if (role !== 'reader') {
      Alert.alert('⚠️ Access Denied', 'Only readers can rate articles');
      return;
    }

    if (!articleId.trim()) {
      Alert.alert('⚠️ Missing ID', 'Please enter an article ID');
      return;
    }

    if (ratingValue === 0) {
      Alert.alert('⚠️ Missing Rating', 'Please select a rating (1-5 stars)');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 FeedbackScreen: Starting rating process for ID:', articleId.trim());
      
      // Get fresh data from API first
      const freshArticleData = await fetchFreshArticleData(articleId.trim());
      
      if (!freshArticleData) {
        Alert.alert('❌ Article Not Found', 'No article found with this ID in the database');
        return;
      }

      console.log('📊 FeedbackScreen: Fresh article data before update:', freshArticleData);
      
      // Create complete article data preserving ALL existing values
      const completeUpdateData = {
        id: freshArticleData.id || articleId.trim(),
        name: freshArticleData.name || 'Untitled',
        author: freshArticleData.author || 'Unknown',
        date: freshArticleData.date || 'No date',
        category: freshArticleData.category || 'Uncategorized',
        content: freshArticleData.content || 'No content',
        ratings: ratingValue
      };
      
      console.log('📊 FeedbackScreen: Sending complete update data:', completeUpdateData);
      console.log('📊 FeedbackScreen: Update URL:', `${SHEET_URL}/id/${articleId.trim()}`);

      const response = await fetch(`${SHEET_URL}/id/${articleId.trim()}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeUpdateData),
      });

      console.log('FeedbackScreen: Update response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('FeedbackScreen: Update successful, response:', responseText);
        
        // Update Redux state
        dispatch(setRating({ articleId: articleId.trim(), rating: ratingValue }));
        
        // Update local context state
        setArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId.trim() 
              ? { 
                  ...article, 
                  ratings: ratingValue,
                  // Also update with fresh data to ensure consistency
                  name: completeUpdateData.name,
                  author: completeUpdateData.author,
                  date: completeUpdateData.date,
                  category: completeUpdateData.category,
                  content: completeUpdateData.content
                }
              : article
          )
        );

        Alert.alert('✅ Success', `Rated "${completeUpdateData.name}" with ${ratingValue} stars!`);
        setArticleId('');
        setRatingValue(0);
        
        // Refresh articles list after a short delay to ensure data consistency
        setTimeout(async () => {
          await refreshArticles();
        }, 1500);
        
      } else {
        const errorText = await response.text();
        console.log('❌ FeedbackScreen: API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log('❌ FeedbackScreen: Complete error:', error);
      Alert.alert('❌ Error', `Failed to save rating: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh articles from API
  const refreshArticles = async () => {
    try {
      console.log('🔄 FeedbackScreen: Refreshing articles list...');
      const response = await fetch(SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 FeedbackScreen: Raw refresh data:', data);
      
      const formatted = data.map((item, i) => ({
        id: item.id ? item.id.toString() : i.toString(),
        name: item.name || 'Untitled',
        author: item.author || 'Unknown',
        date: item.date || 'No date',
        category: item.category || 'Uncategorized',
        content: item.content || 'No content',
        ratings: item.ratings || 0,
      }));
      
      console.log('📊 FeedbackScreen: Formatted articles:', formatted);
      setArticles(formatted.reverse());
      console.log('✅ FeedbackScreen: Articles refreshed successfully');
    } catch (error) {
      console.log('❌ FeedbackScreen: Error refreshing articles:', error);
      Alert.alert('⚠️ Refresh Error', 'Failed to refresh articles from server');
    }
  };

  const renderArticleList = () => {
    if (!articles || articles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available</Text>
          <Text style={styles.emptyHint}>Ask publishers to create articles</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshArticles}>
            <Text style={styles.retryText}>Try Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.articlesList}>
        <Text style={styles.listTitle}>Available Articles ({articles.length})</Text>
        
        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshArticles}
        >
          <Text style={styles.refreshText}>Refresh Articles</Text>
        </TouchableOpacity>
        
        {articles.map((article) => (
          <View key={article.id} style={styles.articleItem}>
            <Text style={styles.articleTitle}>📄 {article.name}</Text>
            <Text style={styles.articleMeta}>🆔 ID: {article.id}</Text>
            <Text style={styles.articleMeta}>👤 Author: {article.author}</Text>
            <Text style={styles.articleMeta}>📅 Date: {article.date}</Text>
            <Text style={styles.articleMeta}>🏷️ Category: {article.category}</Text>
            <Text style={styles.articleContent}>
              📖 Content: {article.content && article.content.length > 50 
                ? `${article.content.substring(0, 50)}...` 
                : article.content}
            </Text>
            <Text style={styles.articleRating}>⭐ Current Rating: {article.ratings || 0}/5</Text>
            
            {role === 'reader' && (
              <TouchableOpacity 
                style={styles.quickRateButton}
                onPress={() => {
                  setArticleId(article.id);
                  // Scroll to rating section would be nice here
                }}
              >
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.header}>⭐ Rate Articles</Text>
      <Text style={styles.subHeader}>Welcome, {name} ({role})</Text>

      {role === 'reader' ? (
        <>
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate an Article</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Article ID:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter article ID (e.g., 2, 25, 5)..."
                value={articleId}
                onChangeText={setArticleId}
                autoCapitalize="none"
                editable={!loading}
              />
              {articleId && (
                <Text style={styles.inputHint}>
                   You entered: {articleId}
                </Text>
              )}
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.label}>Your Rating:</Text>
              <Rating
                type="star"
                imageSize={35}
                startingValue={ratingValue}
                onFinishRating={setRatingValue}
                style={styles.rating}
                fractions={0}
                showRating={true}
                ratingCount={5}
                readonly={loading}
              />
              <Text style={styles.ratingText}>{ratingValue}/5 stars</Text>
              {ratingValue > 0 && (
                <Text style={styles.ratingDescription}>
                  {ratingValue === 1 ? '⭐ Poor' :
                   ratingValue === 2 ? '⭐⭐ Fair' :
                   ratingValue === 3 ? '⭐⭐⭐ Good' :
                   ratingValue === 4 ? '⭐⭐⭐⭐ Very Good' :
                   '⭐⭐⭐⭐⭐ Excellent'}
                </Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleRating}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'Submitting Rating...' : '⭐ Submit Rating'}
              </Text>
            </TouchableOpacity>

            {loading && (
              <Text style={styles.loadingText}>
                Updating article rating, please wait...
              </Text>
            )}
          </View>

          {renderArticleList()}
        </>
      ) : (
        <View style={styles.publisherView}>
          <Text style={styles.publisherTitle}>View Article Ratings</Text>
          <Text style={styles.publisherNote}>
            Publishers can view ratings but cannot rate articles
          </Text>
          <Text style={styles.publisherInfo}>
            💡 You can see how readers are rating your published content
          </Text>
          {renderArticleList()}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {role === 'reader' 
            ? 'Rate articles to help other readers!' 
            : 'Check how your articles are performing!'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingTop: 20,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ratingSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  inputHint: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 5,
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  rating: {
    marginVertical: 15,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffc107',
    marginTop: 10,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#ffc107',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
    elevation: 1,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  publisherView: {
    margin: 20,
  },
  publisherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  publisherNote: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  publisherInfo: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  articlesList: {
    margin: 20,
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
    paddingBottom: 5,
  },
  refreshButton: {
    backgroundColor: 'purple',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  refreshText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  articleItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  articleContent: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  articleRating: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
 
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: '#28a745',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
});