// redux/feedbackSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  articles: [],  // Articles for feedback
  ratings: {},   // { [articleId]: ratingValue }
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setFeedbackArticles(state, action) {
      state.articles = action.payload;
    },
    setRating(state, action) {
      const { articleId, rating } = action.payload;
      state.ratings[articleId] = rating;
      console.log('📊 Redux: Rating set for article', articleId, ':', rating);
    },
    clearRatings(state) {
      state.ratings = {};
    },
    updateArticleRating(state, action) {
      const { articleId, rating } = action.payload;
      // Update the article's rating in the API
      const articleIndex = state.articles.findIndex(article => article.id === articleId);
      if (articleIndex !== -1) {
        state.articles[articleIndex].ratings = rating;
      }
    },
  },
});

export const { 
  setFeedbackArticles, 
  setRating, 
  clearRatings, 
  updateArticleRating 
} = feedbackSlice.actions;

export default feedbackSlice.reducer;