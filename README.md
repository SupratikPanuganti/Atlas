# EdgeBeacon 🔍⚡

**A sophisticated sports betting analytics platform that provides real-time fair value calculations and mispricing detection for sports props.**

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo%2054-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> **Developed for HackGT** - A collaboration between PrizePicks and Crypt of Data

## 🎯 Overview

EdgeBeacon is a mobile-first analytics platform that empowers sports bettors with advanced statistical models to identify mispriced betting lines in real-time. The app combines live pricing engines, transparency-first reporting, and comprehensive betting management tools.

### Key Features

- **🔥 Live Pricing Engine**: Real-time fair value calculations using advanced statistical models
- **📡 Today's Line Detection**: Identify mispriced lines before the market corrects them  
- **📊 Transparency First**: View calibration curves, Brier scores, and model performance metrics
- **💰 Betting Dashboard**: Comprehensive bet tracking with profit/loss analytics
- **🎮 Demo Mode**: Full-featured demo with realistic NBA player props
- **⚡ Real-time Updates**: Live odds monitoring and alert system

## 🏗️ Architecture

### Frontend (React Native/Expo)
```
src/
├── screens/           # Main application screens
│   ├── HomeScreen.tsx      # Betting dashboard with stats
│   ├── LiveScreen.tsx      # Real-time pricing engine
│   ├── RadarScreen.tsx     # Today's line detection
│   ├── TransparencyScreen.tsx # Model performance metrics
│   ├── WatchScreen.tsx     # Watchlist management
│   └── SettingsScreen.tsx  # User preferences
├── components/        # Reusable UI components
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── BettingStatsCards.tsx # KPI display cards
│   ├── ActiveBets.tsx      # Live bet tracking
│   ├── BetHistory.tsx      # Historical bet analysis
│   └── PriceCard.tsx       # Pricing display component
├── navigation/        # App navigation structure
├── store/            # Zustand state management
├── services/         # Data services and demo generators
├── theme/           # Design system (colors, typography)
└── types/           # TypeScript type definitions
```

### Backend (Supabase MCP)
```
supabase-mcp/
├── index.js          # MCP server for database integration
├── test-connection.js # Database connectivity testing
└── verify-setup.js   # Environment verification
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (for testing)
- Supabase account (for database integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SupratikPanuganti/EdgeBeacon.git
   cd EdgeBeacon
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Install Supabase MCP dependencies**
   ```bash
   cd supabase-mcp
   npm install
   cd ..
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

### Environment Setup

Create a `.env` file in the `supabase-mcp` directory:
```env
DATABASE_URL=your_supabase_connection_string
```

## 📱 Screens & Features

### 🏠 Home Dashboard
- **Betting Statistics**: Total Profit and Total Wins KPI cards
- **Active Bets**: Real-time tracking of live bets with current values
- **Bet History**: Comprehensive history with filtering (All, Won, Lost, This Week, This Month)
- **User Profile**: Quick access to settings and user management

### ⚡ Live Pricing Engine
- **Real-time Fair Value**: Continuous pricing updates for sports props
- **AI Reporting**: Intelligent analysis of pricing factors
- **Interactive Charts**: Visual representation of pricing trends
- **Alert System**: Notifications for significant mispricing opportunities

### 📡 Radar (Today's Line Detection)
- **Market Scanning**: Continuous monitoring of betting lines
- **Mispricing Alerts**: Real-time notifications for arbitrage opportunities
- **Filtering & Sorting**: Customizable views by sport, player, or margin

### 📊 Transparency
- **Model Performance**: Calibration curves and accuracy metrics
- **Brier Score Tracking**: Statistical validation of predictions
- **Historical Analysis**: Long-term model performance evaluation

### ⚙️ Settings
- **User Profile Management**: Account details and preferences
- **Alert Configuration**: Customizable notification thresholds
- **Demo Mode Toggle**: Switch between live and demo data

## 🛠️ Technical Stack

### Mobile Framework
- **Expo SDK 54.0.0**: Cross-platform mobile development
- **React Native 0.81.4**: Native mobile app framework
- **React 19.1.0**: Latest React with concurrent features

### Navigation & State
- **React Navigation 6**: Tab and stack navigation
- **Zustand 4.4.1**: Lightweight state management
- **TypeScript 5.1.3**: Type safety and developer experience

### UI/UX
- **Lucide React Native**: Beautiful, customizable icons
- **Custom Design System**: Consistent theming and typography
- **Dark Mode**: Optimized for trading environments
- **Responsive Design**: Tablet and phone compatibility

### Backend Integration
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Model Context Protocol (MCP)**: Structured database interactions
- **Node.js**: Backend services and API integration

## 🎮 Demo Mode

The app includes a comprehensive demo mode featuring:

- **Realistic Data**: NBA player props (Jokic, LeBron, Curry, etc.)
- **Live Simulations**: Mock real-time pricing updates
- **Complete Workflows**: End-to-end betting experience
- **Educational Content**: Transparency and methodology explanations

**Demo Credentials:**
- Email: `demo@edgebeacon.com`
- Password: `demo123`

## 🔧 Development

### Code Quality
- **TypeScript**: Full type coverage with strict mode
- **ESLint**: Code linting and style enforcement
- **Component Architecture**: Reusable, well-documented components

### Testing & Debugging
- **Expo Dev Tools**: Comprehensive debugging suite
- **Hot Reloading**: Instant development feedback
- **Cross-Platform**: Consistent behavior across iOS/Android

### Build & Deployment
```bash
# Production build
expo build:ios    # iOS App Store
expo build:android # Google Play Store

# Web deployment
expo build:web
```

## 🤝 Contributing

This project was developed for HackGT as a collaboration between PrizePicks and Crypt of Data. 

### Development Workflow
1. Create feature branches from `main`
2. Implement changes with proper TypeScript types
3. Test across iOS/Android platforms
4. Submit pull requests with detailed descriptions

### Branch Structure
- `main`: Production-ready code
- `ron`: Ron's development branch
- `praveen`: Praveen's development branch  
- `supratik`: Supratik's development branch

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For questions or issues:
- **HackGT Team**: Contact through official channels
- **Technical Issues**: Create GitHub issues with detailed descriptions
- **Feature Requests**: Submit through project management tools

---

**Built with ❤️ for HackGT** | *Empowering smarter sports betting through data transparency*