// screens/SearchScreen.js - Complete fixed version
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Rating } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { ArticleContext } from '../context/ArticleContext';
import { setRating } from '../redux/feedbackSlice';

const SHEET_URL = 'https://api.sheetbest.com/sheets/4b63fcc0-e8e8-4a03-8160-e59dd191375b';

export default function SearchScreen({ route }) {
  const { name, role } = route.params || {};
  const { articles, setArticles } = useContext(ArticleContext);
  
  // Redux for ratings (for readers)
  const dispatch = useDispatch();
  const { ratings } = useSelector(state => state.feedback);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('all'); // 'all', 'name', 'id', 'author', 'date', 'category', 'rating'
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshArticles();
  }, []);

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const filtered = articles.filter(article => {
      const query = searchQuery.toLowerCase();
      
      switch (searchType) {
        case 'name':
          return article.name && article.name.toLowerCase().includes(query);
        case 'id':
          return article.id.toString().includes(query);
        case 'author':
          return article.author && article.author.toLowerCase().includes(query);
        case 'date':
          return article.date && article.date.toLowerCase().includes(query);
        case 'category':
          return article.category && article.category.toLowerCase().includes(query);
        case 'rating':
          const rating = article.ratings || 0;
          return rating.toString().includes(query);
        case 'all':
        default:
          return (
            (article.name && article.name.toLowerCase().includes(query)) ||
            article.id.toString().includes(query) ||
            (article.author && article.author.toLowerCase().includes(query)) ||
            (article.date && article.date.toLowerCase().includes(query)) ||
            (article.category && article.category.toLowerCase().includes(query)) ||
            (article.ratings && article.ratings.toString().includes(query))
          );
      }
    });

    setSearchResults(filtered);
    setIsSearching(false);
  }, [searchQuery, searchType, articles]);

  // Fetch fresh article data from API before updating
  const fetchFreshArticleData = async (id) => {
    try {
      const response = await fetch(SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const allData = await response.json();
      
      const freshArticle = allData.find(item => item.id && item.id.toString() === id.toString());
      
      return freshArticle;
    } catch (error) {
      return null;
    }
  };

  // Rating functionality for readers
  const handleRating = async (articleId, value) => {
    if (role !== 'reader') {
      Alert.alert('⚠️ Access Denied', 'Only readers can rate articles');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 SearchScreen: Starting rating process for ID:', articleId);
      
      // Get fresh data from API first
      const freshArticleData = await fetchFreshArticleData(articleId);
      
      if (!freshArticleData) {
        Alert.alert('❌ Error', 'Article not found in database');
        return;
      }

      console.log('📊 SearchScreen: Fresh article data before update:', freshArticleData);
      
      // Create complete article data preserving ALL existing values
      const completeUpdateData = {
        id: freshArticleData.id || articleId,
        name: freshArticleData.name || 'Untitled',
        author: freshArticleData.author || 'Unknown',
        date: freshArticleData.date || 'No date',
        category: freshArticleData.category || 'Uncategorized',
        content: freshArticleData.content || 'No content',
        ratings: value
      };
      
      console.log('📊 SearchScreen: Sending complete update data:', completeUpdateData);
      console.log('📊 SearchScreen: Update URL:', `${SHEET_URL}/id/${articleId}`);

      const response = await fetch(`${SHEET_URL}/id/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeUpdateData),
      });

      console.log('📊 SearchScreen: Update response status:', response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log('✅ SearchScreen: Update successful, response:', responseText);
        
        // Update Redux state
        dispatch(setRating({ articleId, rating: value }));
        
        // Update local context state
        setArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId 
              ? { 
                  ...article, 
                  ratings: value,
                  // Also update with fresh data to ensure consistency
                  name: completeUpdateData.name,
                  author: completeUpdateData.author,
                  date: completeUpdateData.date,
                  category: completeUpdateData.category,
                  content: completeUpdateData.content
                }: article
          )
        );
        
        Alert.alert('✅ Success', `Rated "${completeUpdateData.name}" with ${value} stars!`);
        
        // Refresh articles list after a short delay
        setTimeout(async () => {
          await refreshArticles();
        }, 1500);
        
      } else {
        const errorText = await response.text();
        console.log('❌ SearchScreen: API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log('❌ SearchScreen: Complete error:', error);
      Alert.alert('❌ Error', `Failed to save rating: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh articles from API
  const refreshArticles = async () => {
    try {
      console.log('🔄 SearchScreen: Refreshing articles list...');
      const response = await fetch(SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 SearchScreen: Raw refresh data:', data);
      
      const formatted = data.map((item, i) => ({
        id: item.id ? item.id.toString() : i.toString(),
        name: item.name || 'Untitled',
        author: item.author || 'Unknown',
        date: item.date || 'No date',
        category: item.category || 'Uncategorized',
        content: item.content || 'No content',
        ratings: item.ratings || 0,
      }));
      
      console.log('📊 SearchScreen: Formatted articles:', formatted);
      setArticles(formatted.reverse());
      console.log('✅ SearchScreen: Articles refreshed successfully');
    } catch (error) {
      console.log('❌ SearchScreen: Error refreshing articles:', error);
    }
  };

  const getArticleRating = (articleId) => {
    return ratings[articleId] || 
           articles.find(article => article.id === articleId)?.ratings || 
           0;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderSearchResult = ({ item }) => {
    const currentRating = getArticleRating(item.id);
    
    // Safe content handling
    const safeContent = item.content || 'No content available';
    const contentPreview = safeContent.length > 100 ? 
      `${safeContent.substring(0, 100)}...` : 
      safeContent;

    return (
      <View style={styles.resultCard}>
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle}>{item.name || 'Untitled'}</Text>
          <Text style={styles.articleMeta}>🆔 ID: {item.id} | 👤 Author: {item.author || 'Unknown'}</Text>
          <Text style={styles.articleMeta}>📅 {item.date || 'No date'} | 🏷️ {item.category || 'Uncategorized'}</Text>
          <Text style={styles.contentPreview}>📖 {contentPreview}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>
            {role === 'reader' ? 'Rate this article:' : 'Current rating:'}
          </Text>
          
          <Rating
            type="star"
            imageSize={25}
            readonly={role === 'publisher' || loading}
            startingValue={currentRating}
            onFinishRating={value => handleRating(item.id, value)}
            style={styles.rating}
            fractions={0}
            showRating={false}
          />
          
          <Text style={styles.ratingValue}>{currentRating}/5 stars</Text>
          
          {loading && (
            <Text style={styles.ratingLoading}>Updating rating...</Text>
          )}
        </View>

        {role === 'publisher' && (
          <Text style={styles.publisherNote}>View only - Publishers cannot rate</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Articles</Text>
        <Text style={styles.headerSubtitle}>Welcome, {name} ({role})</Text>
      </View>

      {/* Search Input Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Search for articles:</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter search term..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            editable={!loading}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Enhanced Search Type Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Search by:</Text>
          <View style={styles.filterGrid}>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'all' && styles.activeFilter]}
              onPress={() => setSearchType('all')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'all' && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'name' && styles.activeFilter]}
              onPress={() => setSearchType('name')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'name' && styles.activeFilterText]}>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'id' && styles.activeFilter]}
              onPress={() => setSearchType('id')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'id' && styles.activeFilterText]}>ID</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'author' && styles.activeFilter]}
              onPress={() => setSearchType('author')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'author' && styles.activeFilterText]}>Author</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'date' && styles.activeFilter]}
              onPress={() => setSearchType('date')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'date' && styles.activeFilterText]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'category' && styles.activeFilter]}
              onPress={() => setSearchType('category')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'category' && styles.activeFilterText]}>Category</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, searchType === 'rating' && styles.activeFilter]}
              onPress={() => setSearchType('rating')}
              disabled={loading}
            >
              <Text style={[styles.filterText, searchType === 'rating' && styles.activeFilterText]}>Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshArticles}
          disabled={loading}
        >
          <Text style={styles.refreshText}> Refresh Articles</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsText}> Total Articles: {articles?.length || 0}</Text>
        {searchQuery && (
          <Text style={styles.statsText}>Search Results: {searchResults?.length || 0}</Text>
        )}
        {loading && (
          <Text style={styles.statsText}>⏳ Processing rating update...</Text>
        )}
      </View>

      {/* Search Results */}
      <View style={styles.resultsSection}>
        {!searchQuery ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Start Searching</Text>
            <Text style={styles.welcomeText}>Enter a search term above to find articles</Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Search Tips:</Text>
              <Text style={styles.tipItem}>• Search by article name</Text>
              <Text style={styles.tipItem}>• Search by article ID (e.g., "2", "25")</Text>
              <Text style={styles.tipItem}>• Search by author name</Text>
              <Text style={styles.tipItem}>• Search by date (e.g., "25/05/2025")</Text>
              <Text style={styles.tipItem}>• Search by category (e.g., "Technology")</Text>
              <Text style={styles.tipItem}>• Search by rating (e.g., "5", "4")</Text>
              <Text style={styles.tipItem}>• Use filters to narrow results</Text>
            </View>
          </View>
        ) : isSearching ? (
          <Text style={styles.searching}> Searching...</Text>
        ) : searchResults.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResults}> No articles found</Text>
            <Text style={styles.noResultsHint}>Try different search terms or filters</Text>
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}> Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
            Search Results ({searchResults.length})
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={true}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {role === 'reader' 
            ? '⭐ Rate articles after searching to help others!' 
            : ' Search and view how your articles are rated!'}
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    elevation: 1,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    paddingRight: 50,
    color: '#333',
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterBtn: {
    width: '30%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
  },
  activeFilter: {
    backgroundColor: '#007bff',
    elevation: 2,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  activeFilterText: {
    color: 'white',
  },
  refreshButton: {
    backgroundColor: 'purple',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  refreshText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  statsText: {
    fontSize: 14,
    color: '#004085',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  resultsSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 40,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  searching: {
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
    color: '#007bff',
    fontWeight: 'bold',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResults: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 10,
  },
  noResultsHint: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSearchBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  clearSearchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
    paddingBottom: 5,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleHeader: {
    marginBottom: 15,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  articleMeta: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 3,
  },
  contentPreview: {
    fontSize: 14,
    color: '#495057',
    marginTop: 8,
    fontStyle: 'italic',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  rating: {
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  ratingLoading: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 5,
    fontStyle: 'italic',
  },
  publisherNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 5,
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