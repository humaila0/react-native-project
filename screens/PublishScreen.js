// screens/PublishScreen.js - AUTO CURRENT DATE ONLY
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Modal } from 'react-native';
import { ArticleContext } from '../context/ArticleContext';

const SHEET_URL = 'https://api.sheetbest.com/sheets/4b63fcc0-e8e8-4a03-8160-e59dd191375b';

// Predefined categories
const CATEGORIES = [
  { id: 1, name: 'Technology', icon: '💻' },
  { id: 2, name: 'Health', icon: '🏥' },
  { id: 3, name: 'Business', icon: '💼' },
  { id: 4, name: 'Education', icon: '🎓' },
  { id: 5, name: 'Sports', icon: '⚽' },
  { id: 6, name: 'Entertainment', icon: '🎬' },
  { id: 7, name: 'Science', icon: '🔬' },
  { id: 8, name: 'Travel', icon: '✈️' },
  { id: 9, name: 'Food', icon: '🍽️' },
  { id: 10, name: 'Fashion', icon: '👗' },
  { id: 11, name: 'Finance', icon: '💰' },
  { id: 12, name: 'Politics', icon: '🏛️' },
];

export function PublishScreen({ route }) {
  const { name, role } = route.params || {};
  const { articles, setArticles } = useContext(ArticleContext);

  const scrollRef = useRef(null);

  const [articleId, setArticleId] = useState('');
  const [articleName, setArticleName] = useState('');
  const [author, setAuthor] = useState(name || '');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Automatically set current date on component mount
  useEffect(() => {
    setCurrentDate();
  }, []);

  const setCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    setDate(formattedDate);
  };

  const selectCategory = (categoryName) => {
    setCategory(categoryName);
    setShowCategoryModal(false);
  };

  const publishArticle = async () => {
    const trimmed = {
      id: articleId.trim(),
      name: articleName.trim(),
      author: author.trim(),
      date: date.trim(),
      category: category.trim(),
      content: content.trim(),
    };

    if (!trimmed.id) return Alert.alert('⚠️ Missing ID', 'Please enter a unique Article ID.');
    if (!trimmed.name) return Alert.alert('⚠️ Missing Name', 'Please enter the Article name.');
    if (!trimmed.author) return Alert.alert('⚠️ Missing Author', 'Please enter the Author name.');
    if (!trimmed.date) return Alert.alert('⚠️ Missing Date', 'Please set the publishing date.');
    if (!trimmed.category) return Alert.alert('⚠️ Missing Category', 'Please select a category.');
    if (!trimmed.content) return Alert.alert('⚠️ Missing Content', 'Please enter article content.');

    const existingArticle = articles.find(article => article.id === trimmed.id);
    if (existingArticle) {
      return Alert.alert('⚠️ ID Already Exists', 'Please use a different ID');
    }

    setLoading(true);

    try {
      const newArticle = { ...trimmed, ratings: 0 };

      console.log(' Publishing:', newArticle);

      const response = await fetch(SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newArticle),
      });

      if (response.ok) {
        // Clear form but keep current date
        setArticleId('');
        setArticleName('');
        setAuthor(name || '');
        setCategory('');
        setContent('');
        setCurrentDate(); // Reset to current date

        Alert.alert('✅ Success', `Article published!\nDate: ${trimmed.date}\nCategory: "${trimmed.category}"`);
        setTimeout(() => {
          fetchArticles();
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 1000);
      } else {
        throw new Error(`Publish failed: ${response.status}`);
      }

    } catch (error) {
      Alert.alert('❌ Error', `Failed to publish: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();

      const formatted = data.map((item, i) => ({
        id: item.id ? item.id.toString() : i.toString(),
        name: item.name || 'Untitled',
        ratings: item.ratings || 0,
        author: item.author || 'Unknown',
        date: item.date || 'No date',
        category: item.category || 'Uncategorized',
        content: item.content || 'No content',
      }));

      setArticles(formatted.reverse());
    } catch (err) {
      console.log('❌ Fetch error:', err);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.header}> Publish Article</Text>
        <Text style={styles.subHeader}>Welcome, {name} ({role})</Text>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Article ID:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter unique ID (e.g., 1, 2, 3...)"
              value={articleId}
              onChangeText={setArticleId}
              autoCapitalize="none"
              editable={!loading}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Article Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter article title"
              value={articleName}
              onChangeText={setArticleName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Author:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter author name"
              value={author}
              onChangeText={setAuthor}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Publication Date:</Text>
            <View style={styles.dateDisplayContainer}>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateDisplayText}>📅 {date || 'Not set'}</Text>
              </View>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={setCurrentDate}
                disabled={loading}
              >
                <Text style={styles.todayButtonText}> Update to Today</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.dateHint}>
              📝 Date is automatically set to today's date
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category:</Text>
            <TouchableOpacity
              style={[styles.categorySelector, category && styles.categorySelected]}
              onPress={() => setShowCategoryModal(true)}
              disabled={loading}
            >
              <Text style={[styles.categorySelectorText, category && styles.categorySelectedText]}>
                {category ? `📂 ${category}` : '📂 Select Category'}
              </Text>
              <Text style={styles.categoryArrow}>▼</Text>
            </TouchableOpacity>
            {category && (
              <Text style={styles.selectedCategoryHint}>
                Selected: {category}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content:</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your article content here..."
              value={content}
              onChangeText={setContent}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.publishButton, loading && styles.publishButtonDisabled]}
            onPress={publishArticle}
            disabled={loading}
          >
            <Text style={styles.publishText}>
              {loading ? '⏳ Publishing...' : 'Publish Article'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📂 Select Category</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.name && styles.categoryOptionSelected
                  ]}
                  onPress={() => selectCategory(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.name && styles.categoryOptionSelectedText
                  ]}>
                    {cat.name}
                  </Text>
                  {category === cat.name && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#6f42c1', 
    paddingTop: 20, 
    marginBottom: 10 
  },
  subHeader: { 
    fontSize: 16, 
    color: '#ffc107', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  formSection: { 
    padding: 20 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#6f42c1' 
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#9b59b6', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    backgroundColor: 'white', 
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateDisplayContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  dateDisplay: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fff9c4',
    elevation: 2,
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f42c1',
  },
  todayButton: { 
    backgroundColor: '#ffc107', 
    paddingHorizontal: 15, 
    paddingVertical: 15, 
    borderRadius: 12, 
    elevation: 3,
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  todayButtonText: { 
    color: 'white', 
    fontSize: 13, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
    fontStyle: 'italic',
  },
  categorySelector: {
    borderWidth: 2,
    borderColor: '#9b59b6',
    borderRadius: 12,
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  categorySelected: {
    borderColor: '#6f42c1',
    backgroundColor: '#f8f5ff',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#999',
  },
  categorySelectedText: {
    color: '#6f42c1',
    fontWeight: 'bold',
  },
  categoryArrow: {
    fontSize: 12,
    color: '#9b59b6',
  },
  selectedCategoryHint: {
    fontSize: 14,
    color: '#6f42c1',
    marginTop: 5,
    fontStyle: 'italic',
  },
  contentInput: { 
    borderWidth: 2, 
    borderColor: '#9b59b6', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    backgroundColor: 'white', 
    minHeight: 120, 
    textAlignVertical: 'top',
    elevation: 2,
  },
  publishButton: { 
    backgroundColor: '#6f42c1', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
    shadowColor: '#6f42c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  publishButtonDisabled: { 
    backgroundColor: '#bdc3c7',
    elevation: 1,
  },
  publishText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6f42c1',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  categoryOptionSelected: {
    backgroundColor: '#6f42c1',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  categoryOptionSelectedText: {
    color: 'white',
  },
  checkMark: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});