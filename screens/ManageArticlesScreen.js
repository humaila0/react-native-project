// screens/ManageArticlesScreen.js - AUTO CURRENT DATE ONLY
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { ArticleContext } from '../context/ArticleContext';

const SHEET_URL = 'https://api.sheetbest.com/sheets/4b63fcc0-e8e8-4a03-8160-e59dd191375b';

// Predefined categories (same as PublishScreen)
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

export default function ManageArticlesScreen() {
  const { articles, setArticles } = useContext(ArticleContext);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const setCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    setEditedDate(formattedDate);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
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
      Alert.alert('Error', `Failed to fetch articles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    const trimmedId = id.toString().trim();
    try {
      const res = await fetch(`${SHEET_URL}/id/${encodeURIComponent(trimmedId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        Alert.alert('✅ Success', 'Article deleted successfully!');
      } else {
        throw new Error(`Status ${res.status}`);
      }
    } catch (err) {
      Alert.alert('❌ Error deleting', err.message);
    }
  };

  const openEditModal = (article) => {
    setSelectedArticle(article);
    setEditedName(article.name || '');
    setEditedAuthor(article.author || '');
    setEditedDate(article.date || '');
    setEditedCategory(article.category || '');
    setEditedContent(article.content || '');
    setModalVisible(true);
  };

  const selectCategory = (categoryName) => {
    setEditedCategory(categoryName);
    setShowCategoryModal(false);
  };

  const updateArticle = async () => {
    if (!editedName.trim() || !editedAuthor.trim() || !editedDate.trim() || 
        !editedCategory.trim() || !editedContent.trim()) {
      Alert.alert('⚠️ Error', 'All fields are required');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        id: selectedArticle.id.toString(),
        name: editedName.trim(),
        ratings: selectedArticle.ratings || 0,
        author: editedAuthor.trim(),
        date: editedDate.trim(),
        category: editedCategory.trim(),
        content: editedContent.trim()
      };
      
      console.log('📊 Updating with data:', updateData);

      const response = await fetch(`${SHEET_URL}/id/${selectedArticle.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setArticles(prev =>
          prev.map(a => a.id.toString() === selectedArticle.id.toString() ? {
            ...a,
            name: editedName.trim(),
            author: editedAuthor.trim(),
            date: editedDate.trim(),
            category: editedCategory.trim(),
            content: editedContent.trim()
          } : a)
        );
        
        setModalVisible(false);
        Alert.alert('✅ Success', `Article updated!\nDate: ${editedDate.trim()}\nCategory: "${editedCategory.trim()}"`);
        setTimeout(fetchArticles, 1500);
      } else {
        throw new Error(`Update failed: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('❌ Update Failed', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const renderItem = ({ item }) => {
    const contentPreview = (item.content || '').length > 50 ? 
      `${item.content.substring(0, 50)}...` : item.content;

    return (
      <View style={styles.item}>
        <View style={styles.articleInfo}>
          <Text style={styles.itemText}>📄 ID: {item.id}</Text>
          <Text style={styles.itemText}>📝 Name: {item.name}</Text>
          <Text style={styles.ratingText}>⭐ Rating: {item.ratings}/5</Text>
          <Text style={styles.itemText}>👤 Author: {item.author}</Text>
          <Text style={styles.itemText}>📅 Date: {item.date}</Text>
          <Text style={styles.itemText}>🏷️ Category: {item.category}</Text>
          <Text style={styles.contentPreview}>📖 Content: {contentPreview}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => openEditModal(item)} 
            style={styles.editBtn}
            disabled={updating}
          >
            <Text style={styles.btnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => deleteArticle(item.id)} 
            style={styles.deleteBtn}
            disabled={updating}
          >
            <Text style={styles.btnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.header}>⚙️ Manage Articles</Text>
        <Text style={styles.subHeader}>Total: {articles?.length || 0} articles</Text>

        <TouchableOpacity 
          onPress={fetchArticles}
          style={styles.refreshButton}
          disabled={loading || updating}
        >
          <Text style={styles.refreshText}>
            {loading ? '⏳ Loading...' : '🔄 Refresh Articles'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContainer}>
        {loading ? (
          <Text style={styles.loading}>Loading articles...</Text>
        ) : articles?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.noArticles}>📭 No articles found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchArticles}>
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList 
            data={articles} 
            keyExtractor={(item) => item.id.toString()} 
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <ScrollView contentContainerStyle={styles.modalScrollContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>✏️ Edit Article</Text>
              
              <Text style={styles.inputLabel}>Article Name:</Text>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                style={styles.input}
                placeholder="Enter article name"
                editable={!updating}
              />
              
              <Text style={styles.inputLabel}>Author:</Text>
              <TextInput
                value={editedAuthor}
                onChangeText={setEditedAuthor}
                style={styles.input}
                placeholder="Enter author name"
                editable={!updating}
              />
              
              <Text style={styles.inputLabel}>Date:</Text>
              <View style={styles.dateEditContainer}>
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateDisplayText}>📅 {editedDate || 'Not set'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={setCurrentDate}
                  disabled={updating}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Category:</Text>
              <TouchableOpacity
                style={[styles.categorySelector, editedCategory && styles.categorySelected]}
                onPress={() => setShowCategoryModal(true)}
                disabled={updating}
              >
                <Text style={[styles.categorySelectorText, editedCategory && styles.categorySelectedText]}>
                  {editedCategory ? `📂 ${editedCategory}` : '📂 Select Category'}
                </Text>
                <Text style={styles.categoryArrow}>▼</Text>
              </TouchableOpacity>
              {editedCategory && (
                <Text style={styles.selectedCategoryHint}>
                  Selected: {editedCategory}
                </Text>
              )}
              
              <Text style={styles.inputLabel}>Content:</Text>
              <TextInput
                value={editedContent}
                onChangeText={setEditedContent}
                style={styles.contentInput}
                placeholder="Enter content"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                editable={!updating}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={styles.cancelBtn}
                  disabled={updating}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={updateArticle} 
                  style={[styles.saveBtn, updating && styles.saveBtnDisabled]}
                  disabled={updating}
                >
                  <Text style={styles.btnText}>
                    {updating ? ' Saving...' : ' Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <View style={styles.categoryModalContent}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>📂 Select Category</Text>
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
                    editedCategory === cat.name && styles.categoryOptionSelected
                  ]}
                  onPress={() => selectCategory(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    editedCategory === cat.name && styles.categoryOptionSelectedText
                  ]}>
                    {cat.name}
                  </Text>
                  {editedCategory === cat.name && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.categoryCancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.categoryCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  headerSection: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomWidth: 2, 
    borderBottomColor: '#9b59b6',
    elevation: 3,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#6f42c1', 
    marginBottom: 5 
  },
  subHeader: { 
    fontSize: 16, 
    color: '#ffc107', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  refreshButton: { 
    backgroundColor: '#6f42c1', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 4,
    shadowColor: '#6f42c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  scrollContainer: { 
    flex: 1 
  },
  loading: { 
    textAlign: 'center', 
    color: '#6f42c1', 
    fontSize: 16, 
    marginTop: 50 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 50 
  },
  noArticles: { 
    fontSize: 18, 
    color: '#6c757d', 
    marginBottom: 10 
  },
  retryButton: { 
    backgroundColor: '#6f42c1', 
    padding: 12, 
    borderRadius: 8 
  },
  retryText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  listContainer: { 
    padding: 15 
  },
  item: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 12, 
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',    // Yellow left border
  },
  articleInfo: { 
    marginBottom: 15 
  },
  itemText: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 5, 
    fontWeight: '500' 
  },
  ratingText: { 
    fontSize: 14, 
    color: '#ffc107', 
    marginBottom: 5, 
    fontWeight: 'bold' 
  },
  contentPreview: { 
    fontSize: 14, 
    color: '#6c757d', 
    fontStyle: 'italic', 
    marginTop: 5 
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  editBtn: { 
    backgroundColor: '#6f42c1', 
    padding: 12, 
    borderRadius: 8, 
    flex: 0.45, 
    alignItems: 'center',
    elevation: 2,
  },
  deleteBtn: { 
    backgroundColor: '#dc3545', 
    padding: 12, 
    borderRadius: 8, 
    flex: 0.45, 
    alignItems: 'center',
    elevation: 2,
  },
  btnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  modalBackground: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalScrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  modalBox: { 
    backgroundColor: 'white', 
    padding: 25, 
    borderRadius: 20, 
    width: '95%', 
    maxWidth: 400, 
    elevation: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#6f42c1' 
  },
  inputLabel: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#6f42c1' 
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#9b59b6', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 15, 
    backgroundColor: '#f8f9fa' 
  },
  dateEditContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    marginBottom: 15,
  },
  dateDisplay: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff9c4',
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f42c1',
  },
  todayButton: { 
    backgroundColor: '#ffc107', 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    borderRadius: 10, 
    elevation: 2 
  },
  todayButtonText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  categorySelector: {
    borderWidth: 2,
    borderColor: '#9b59b6',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 15,
    fontStyle: 'italic',
  },
  contentInput: { 
    borderWidth: 2, 
    borderColor: '#9b59b6', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 20, 
    minHeight: 100, 
    backgroundColor: '#f8f9fa' 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  cancelBtn: { 
    backgroundColor: '#6c757d', 
    padding: 12, 
    borderRadius: 8, 
    flex: 0.45, 
    alignItems: 'center' 
  },
  saveBtn: { 
    backgroundColor: '#6f42c1', 
    padding: 12, 
    borderRadius: 8, 
    flex: 0.45, 
    alignItems: 'center' 
  },
  saveBtnDisabled: { 
    backgroundColor: '#bdc3c7' 
  },

  // Category Modal Styles
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  categoryModalTitle: {
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
  categoryCancelButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  categoryCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});