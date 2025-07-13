# react-native-project
article-management-system

# Article Management System

A full-featured React Native app for managing and reading articles. It supports role-based access, allowing **Publishers** to create and manage content, and **Readers** to explore, search, and rate articles. Built with Expo, Redux, and integrated with GraphQL and Google Sheets (via SheetBest).

![Platform](https://img.shields.io/badge/platform-react--native-lightgrey)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## 🔍 Table of Contents

- [User Roles](#user-roles)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [APIs](#apis)
- [Keywords](#keywords)
- [Contributing](#contributing)
- [License](#license)

---

## User Roles

### Publishers
- Add new articles with:
  - Title
  - Description
  - Author name
  - Category
- Edit existing articles
- Categorize and manage their content

### Readers
- View and search articles
- Rate each article using a star-based system
- Explore data from the Rick and Morty GraphQL API

---

## Features

- Role-based signup and routing
- Article creation, editing, and categorization
- Star-based rating system (1 to 5 stars)
- Article search by title, author, or category
- GraphQL API integration (Rick and Morty characters)
- Google Sheets used as a backend (via SheetBest)

---

## Demo

Coming soon! You can test it locally using Expo CLI:

```bash
npx expo start
Installation
bash
Copy
Edit
# Clone this repository
git clone https://github.com/your-username/article-management-system.git
cd article-management-system

# Install dependencies
npm install

# Start the development server
npx expo start

Project Structure

├── App.js # Entry point of the app
├── AppNavigator.js # Navigation configuration
├── index.js # Registers the root component
├── package.json # Project dependencies and scripts
├── components/ # Reusable UI components
│ ├── AssetExample.js
│ ├── ArticleList.js
│ └── CharacterCard.js
├── context/
│ └── ArticleContext.js # Global context for articles
├── screens/
│ ├── SignupScreen.js # Signup screen for reader/publisher selection
│ ├── Homescreen.js # Initial landing screen after login
│ ├── ReaderScreen.js # Reader view with articles and GraphQL characters
│ ├── PublishScreen.js # Publisher form to add new articles
│ ├── ManageArticlesScreen.js # Manage/edit publisher's own articles
│ ├── FeedbackScreen.js # Readers rate articles with stars
│ ├── SearchScreen.js # Search articles by title, author, or category
│ ├── GraphQL.js # GraphQL data fetch for Rick and Morty
│ └── CharactersScreen.js # UI to display fetched GraphQL characters
├── assets/ # App images and fonts
├── app.json # App configuration for Expo.
├── App.js
├── AppNavigator.js
├── index.js
├── package.json
├── components/
├── context/
├── screens/
├── assets/
├── app.json

Technologies Used
React Native with Expo

Redux for state management

React Navigation

Google Sheets (SheetBest API)

Apollo Client and GraphQL

JavaScript (ES6+)

APIs
Rick and Morty GraphQL API: https://rickandmortyapi.com/graphql

SheetBest API: https://sheet.best

Keywords
React Native Redux Expo GraphQL Google Sheets API SheetBest Article Management Star Rating Apollo Client Rick and Morty API Content Platform Publisher Reader App

