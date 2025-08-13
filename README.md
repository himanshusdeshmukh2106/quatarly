# Quatarly - Personal Finance Management Platform

A comprehensive personal finance management platform built with React Native frontend and Django backend, designed to help users track assets, investments, goals, and financial opportunities.

## 🏗️ Project Structure

```
quatarly/
├── C9FR/                    # React Native Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # App screens
│   │   ├── services/        # API and business logic
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── android/             # Android-specific files
│   ├── ios/                 # iOS-specific files
│   └── __tests__/           # Test files
├── c8v2/                    # Django Backend
│   ├── C8V2/                # Main Django project
│   ├── users/               # User management
│   ├── investments/         # Investment tracking
│   ├── goals/               # Financial goals
│   ├── opportunities/       # Financial opportunities
│   ├── questionnaire/       # User onboarding
│   ├── sms/                 # SMS processing
│   ├── email_reader/        # Email processing
│   └── notifications/       # Notification system
└── .kiro/                   # Kiro AI assistant specs
```

## 🚀 Features

### Frontend (React Native)
- **Asset Management**: Track physical and tradable assets
- **Investment Portfolio**: Monitor investments with real-time data
- **Goal Setting**: Set and track financial goals
- **Opportunities**: Discover financial opportunities
- **AI Insights**: Get AI-powered financial insights
- **Profile Management**: User profile and preferences
- **Charts & Analytics**: Visual representation of financial data

### Backend (Django)
- **User Authentication**: Secure user registration and login
- **Investment API**: RESTful APIs for investment data
- **Goal Management**: CRUD operations for financial goals
- **Opportunity Engine**: Personalized opportunity recommendations
- **SMS Integration**: Process financial SMS messages
- **Email Processing**: Extract financial data from emails
- **Notification System**: Push notifications and alerts

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **React Native Chart Kit** - Data visualization
- **Jest** - Testing framework

### Backend
- **Django** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (configurable)
- **Celery** - Asynchronous task processing
- **Redis** - Caching and message broker

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Frontend Setup (C9FR)

```bash
cd C9FR
npm install

# For iOS
cd ios && pod install && cd ..

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

### Backend Setup (c8v2)

```bash
cd c8v2

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both directories:

**C9FR/.env**
```
API_BASE_URL=http://localhost:8000/api
GEMINI_API_KEY=your_gemini_api_key
```

**c8v2/.env**
```
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///db.sqlite3
GEMINI_API_KEY=your_gemini_api_key
```

## 🧪 Testing

### Frontend Tests
```bash
cd C9FR
npm test
```

### Backend Tests
```bash
cd c8v2
python manage.py test
```

## 📱 App Features

### Asset Management
- Add and track physical assets (real estate, gold, etc.)
- Monitor tradable assets with real-time pricing
- Asset insights and recommendations

### Investment Tracking
- Portfolio management
- Investment performance analytics
- Candlestick charts for market data

### Goal Setting
- Create financial goals with target amounts
- Track progress with visual indicators
- Budget allocation and monitoring

### Opportunities
- Personalized financial opportunities
- AI-powered recommendations
- Opportunity insights and analysis

## 🤖 AI Integration

The app integrates with Google's Gemini AI for:
- Financial insights and analysis
- Investment recommendations
- Goal planning assistance
- Opportunity discovery

## 📊 API Documentation

The Django backend provides RESTful APIs for:
- `/api/users/` - User management
- `/api/investments/` - Investment data
- `/api/goals/` - Financial goals
- `/api/opportunities/` - Financial opportunities
- `/api/questionnaire/` - User onboarding

## 🔒 Security

- JWT-based authentication
- Secure API endpoints
- Data encryption for sensitive information
- Input validation and sanitization

## 🚀 Deployment

### Frontend
- Build for production: `npx react-native build-android` or `npx react-native build-ios`
- Deploy to app stores following platform guidelines

### Backend
- Configure production settings
- Set up database (PostgreSQL recommended)
- Deploy to cloud platforms (AWS, Heroku, etc.)
- Set up Redis for caching and Celery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Asset management
  - Investment tracking
  - Goal setting
  - AI-powered insights

---

Built with ❤️ for better financial management