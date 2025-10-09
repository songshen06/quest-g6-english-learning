# Quest G6 - English Learning App 🎓

ADHD-friendly English learning application designed for 6th graders, featuring gamified lessons, interactive exercises, and personalized learning paths.

## ✨ Features

### 🎮 **Gamified Learning**
- **Interactive Quests**: Complete engaging English exercises
- **Progress Tracking**: Visual progress indicators and achievements
- **Reward System**: Earn XP points and badges for motivation
- **ADHD Support**: Simplified modes and reduced stimulation options

### 📚 **Learning Modules**
- **Comprehensive Curriculum**: Aligned with 6th-grade English standards
- **Multiple Exercise Types**:
  - 📖 Reading comprehension
  - 🎧 Listening exercises
  - 🗣️ Speaking practice
  - ✍️ Writing tasks
  - 🎯 Vocabulary building
  - 🔤 Sentence sorting

### 🎨 **Accessibility Features**
- **Font Size Options**: Normal, Large, Extra-Large
- **Theme Modes**: Light, Dark, High Contrast
- **ADHD-Friendly Settings**:
  - Simplified Mode (reduced distractions)
  - Low Stimulus Mode (minimal animations)
  - Focus-friendly interface design

### 🔧 **Technical Features**
- **Progressive Web App (PWA)**: Offline support and installable
- **Responsive Design**: Works on all devices
- **Real-time Progress**: Persistent user data
- **Audio Support**: Integrated audio for listening exercises

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/songshen06/quest-g6-english-learning.git
cd quest-g6-english-learning
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173/quest-g6-english-learning/`

## 📱 Available Platforms

- **Web App**: [https://songshen06.github.io/quest-g6-english-learning/](https://songshen06.github.io/quest-g6-english-learning/)
- **PWA**: Installable on mobile devices
- **Desktop**: Works on all modern browsers

## 🛠️ Development

### Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Import new learning modules
npm run import-book
```

### Project Structure

```
src/
├── components/          # React components
│   ├── quest-steps/    # Exercise type components
│   ├── auth/           # Authentication components
│   └── ...
├── pages/              # Page components
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── i18n/               # Internationalization

content/                # Learning content JSON files
public/                 # Static assets
```

## 🚢 Deployment

### Automatic Deployment (GitHub Actions)

This project uses GitHub Actions for automatic deployment to GitHub Pages:

1. **Push to main branch**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

2. **Automatic CI/CD Pipeline**
   - ✅ Code checkout
   - ✅ Dependency installation
   - ✅ Production build
   - ✅ Deployment to GitHub Pages
   - ✅ CDN distribution

3. **Live within 3-5 minutes**
   - 🌐 [https://songshen06.github.io/quest-g6-english-learning/](https://songshen06.github.io/quest-g6-english-learning/)

### Manual Deployment

```bash
# Build project
npm run build

# Deploy dist/ folder to your hosting service
```

## 📊 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **PWA**: Vite PWA Plugin
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🎯 Learning Exercise Types

### 1. **ShowStep** 📖
Display content and explanations

### 2. **SelectStep** 🎯
Multiple choice questions

### 3. **ListenStep** 🎧
Audio listening comprehension

### 4. **SpeakStep** 🗣️
Speaking practice exercises

### 5. **ZhToEnStep** 🔤
Chinese to English translation

### 6. **WordMatchingStep** 🧩
Word matching exercises

### 7. **SentenceSortingStep** 📝
Sentence word ordering

## 🧩 User Management

### Authentication System
- **Guest Mode**: Preview content without registration
- **User Registration**: Create personal accounts
- **Progress Tracking**: Save learning progress
- **Multi-user Support**: Switch between users

### Admin Features
- **Super Admin**: Initial setup and management
- **Content Management**: Add/edit learning modules
- **User Analytics**: Track learning progress

## 🌐 Internationalization

Supported languages:
- 🇺🇸 English
- 🇨🇳 Chinese (Simplified)
- 🌍 Both (bilingual display)

## 🔧 Configuration

### Environment Variables
Create `.env.local` for development:

```env
VITE_APP_TITLE=Quest G6 English Learning
VITE_BASE_PATH=/quest-g6-english-learning/
```

### Build Configuration
Key settings in `vite.config.ts`:
- Base path for GitHub Pages
- PWA configuration
- Static asset copying
- Build optimization

## 🎨 Customization

### Adding New Content
1. Create JSON files in `content/` directory
2. Run `npm run import-book` to process
3. Update modules through admin interface

### Theming
Modify `tailwind.config.js` and CSS variables for custom themes.

### Exercise Types
Add new exercise components in `src/components/quest-steps/`.

## 🐛 Troubleshooting

### Common Issues

1. **Blank Settings Page**
   - Fixed: Settings now work without login
   - Clear browser cache if issues persist

2. **Audio Not Playing**
   - Check browser audio permissions
   - Ensure audio files exist in `audio/` directory

3. **PWA Not Installing**
   - Ensure site is served over HTTPS
   - Check manifest configuration

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips
- Use browser DevTools for debugging
- Check Network tab for 404 errors
- Console logs show detailed state information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic HTML
- Maintain accessibility standards
- Test on multiple devices
- Keep ADHD-friendly design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or suggestions:

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/songshen06/quest-g6-english-learning/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/songshen06/quest-g6-english-learning/discussions)
- 📧 **Direct Contact**: Create an issue for direct communication

## 🏆 Acknowledgments

- Designed with ADHD-friendly principles
- Built for 6th-grade English curriculum
- Created with modern web technologies
- Deployed with GitHub's free hosting services

---

**🎓 Start your English learning adventure today!**

Made with ❤️ for 6th-grade learners everywhere