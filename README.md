# Article Management System

A React Native application that allows users to sign up, read articles, rate content, and for publishers to add, manage, and search articles. This project also includes GraphQL API integration using the Rick and Morty API.

## User Roles

### Publishers
Publishers have full control over article management. They can:
- Add new articles with:
  - Title
  - Description
  - Their own name (author)
  - Article category (e.g., Tech, Health, Politics)
- Edit and manage their previously published articles
- Filter and organize articles based on category

### Readers
Readers can:
- Browse and search articles
- Rate articles using a star rating system
- Explore content from the Rick and Morty GraphQL API

## Features

- User Signup for both Readers and Publishers
- Article Creation and Management (for Publishers)
- Article Rating System (for Readers)
- Search Functionality across articles
- GraphQL-based character exploration (Rick & Morty API)
- Google Sheets backend integration via SheetBest

## Project Structure

```
.
├── App.js
├── AppNavigator.js
├── index.js
├── package.json
├── components/
│   ├── AssetExample.js
│   ├── ArticleList.js
│   └── CharacterCard.js
├── context/
│   └── ArticleContext.js
├── screens/
│   ├── SignupScreen.js
│   ├── Homescreen.js
│   ├── ReaderScreen.js
│   ├── PublishScreen.js
│   ├── ManageArticlesScreen.js
│   ├── FeedbackScreen.js
│   ├── SearchScreen.js
│   ├── GraphQL.js
│   └── CharactersScreen.js
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/article-management-system.git
   cd article-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npx expo start
   ```

## Technologies Used

- React Native & Expo
- Redux for state management
- React Navigation for screen navigation
- Apollo Client for GraphQL integration
- Google Sheets API via SheetBest
- JavaScript (ES6)

## APIs Used

- Rick and Morty GraphQL API: https://rickandmortyapi.com/graphql
- SheetBest for CRUD operations with Google Sheets: https://sheet.best

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

MIT