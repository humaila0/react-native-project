// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
//import articlesReducer from './articlesSlice';
import feedbackReducer from './feedbackSlice';

export const store = configureStore({
  reducer: {
    feedback: feedbackReducer, // Add feedback reducer
  },
});