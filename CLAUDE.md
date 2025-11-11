# Quest G6 English Learning Project - Claude AI Assistant Guide

## 🎯 Project Overview

**Quest G6** is a comprehensive English learning application for grades 4-6 students, based on FLTRP (Foreign Language Teaching and Research Press) textbook series. The application provides interactive gamified learning experiences with 240+ content modules and 1,700+ audio files.

### Key Features
- 📚 **42 Complete Modules**: Covering grades 4-6 curriculum
- 🎵 **Rich Audio System**: 1,700+ high-quality pronunciation files
- 🎮 **Gamification**: XP system, badges, and achievements
- 👥 **Multi-user Support**: Individual progress tracking
- 🌐 **PWA Ready**: Installable with offline capabilities
- ♿ **Accessibility**: Multiple themes and font sizes

## 🏗️ Project Architecture

### Technology Stack
- **Frontend**: React 18.2.0 + TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Deployment**: GitHub Pages

### Directory Structure
```
quest-g6-english-learning/
├── public/                 # Static assets
│   ├── audio/             # Audio files (TTS and sound effects)
│   │   ├── tts/          # Text-to-speech pronunciation files
│   │   └── sfx/          # Sound effects
│   └── icons/            # App icons and images
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Basic UI components
│   │   ├── forms/       # Form components
│   │   └── layout/      # Layout components
│   ├── content/         # Learning content modules
│   │   ├── module-*.json # Individual module content
│   │   └── index.ts     # Content index and loader
│   ├── stores/          # Zustand state management
│   │   ├── userStore.ts # User management
│   │   ├── gameStore.ts # Game state
│   │   └── bookStore.ts # Content management
│   ├── utils/           # Utility functions
│   │   ├── audioPlayer.ts # Audio playback system
│   │   ├── assetPath.ts  # Asset path management
│   │   └── storage.ts    # Local storage management
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── pages/           # Main application pages
└── scripts/             # Build and maintenance scripts
    ├── generate_audio.py # Audio generation script
    └── regenerate_problematic_audio.py # Audio regeneration tool
```

## 📋 Development Guidelines

### Code Style & Conventions

#### TypeScript
- **Strict typing enabled**: Always use proper TypeScript types
- **Interface over Type**: Prefer `interface` for object shapes
- **Enum usage**: Use enums for predefined values (e.g., themes, exercise types)
- **Null safety**: Use `?` and `!` operators appropriately

#### React Patterns
- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Destructuring**: Destructure props in function signatures
- **Component Naming**: Use PascalCase for component names

```typescript
// ✅ Good example
interface ExerciseProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  onComplete: () => void;
}

export const ExerciseComponent: React.FC<ExerciseProps> = ({
  question,
  options,
  onAnswer,
  onComplete
}) => {
  // Component implementation
};
```

#### File Naming
- **Components**: PascalCase (e.g., `ExerciseCard.tsx`)
- **Utilities**: camelCase (e.g., `audioPlayer.ts`)
- **Types**: camelCase with suffix (e.g., `userTypes.ts`)
- **Content**: kebab-case (e.g., `module-03-stamps-hobbies.json`)

### State Management (Zustand)

#### Store Structure
```typescript
// ✅ Store template
interface State {
  // State properties
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  // Actions
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
```

## 🔧 Development Workflow

### Audio Management

#### Adding New Audio Files
1. **Generate Audio**: Use the audio generation script
   ```bash
   python regenerate_problematic_audio.py "new phrase text"
   ```

2. **Update Content**: Reference audio files in module JSON
   ```json
   {
     "en": "new phrase text",
     "audio": "/audio/tts/new-phrase-text.mp3"
   }
   ```

3. **Test Playback**: Verify audio plays correctly in all environments

#### Audio Quality Standards
- **Format**: MP3, 44.1kHz, 128kbps minimum
- **Engine**: Use Coqui TTS for high-quality generation
- **File Naming**: kebab-case, descriptive names
- **Size Limits**: Keep audio files under 100KB for performance

### Content Management

#### Module Structure
```json
{
  "id": "module-xx-name",
  "title": {"en": "Module Title", "zh": "模块标题"},
  "description": {"en": "Description", "zh": "描述"},
  "words": [
    {
      "en": "word",
      "zh": "翻译",
      "audio": "/audio/tts/word.mp3",
      "image": "/images/word.jpg"
    }
  ],
  "phrases": [
    {
      "en": "phrase text",
      "zh": "短语翻译",
      "audio": "/audio/tts/phrase-text.mp3"
    }
  ],
  "patterns": [
    {
      "q": "question text",
      "a": "answer text",
      "audio": "/audio/tts/question.mp3"
    }
  ],
  "quests": [
    {
      "id": "quest-id",
      "type": "exercise-type",
      "title": "Quest Title",
      "steps": [...]
    }
  ]
}
```

### Testing & Quality Assurance

#### Before Committing
1. **Audio Testing**: Verify all new audio files play correctly
2. **Functionality Testing**: Test new features on multiple devices
3. **Responsive Testing**: Check mobile and desktop compatibility
4. **Accessibility Testing**: Verify screen reader and keyboard navigation
5. **Performance Testing**: Check for memory leaks and loading times

#### Build Validation
```bash
# Run build and check for errors
npm run build

# Check for TypeScript errors (once ESLint is configured)
npm run lint

# Run tests if available
npm run test
```

## 🚨 Safety Guidelines

### What to Modify Carefully
- **Audio Files**: Always test after modification
- **User Data**: Ensure backward compatibility
- **Content Structure**: Maintain JSON schema consistency
- **State Management**: Avoid breaking existing state contracts

### What Requires Special Attention
- **Authentication Logic**: Password encryption and user data
- **Progress Tracking**: Ensure data integrity
- **PWA Configuration**: Service worker and manifest
- **Build Configuration**: Vite and deployment settings

### Backup Requirements
- **Content Files**: Always backup before bulk changes
- **User Data**: Test migration scripts thoroughly
- **Audio Files**: Keep original high-quality versions
- **Configuration**: Version control all config files

## 🛠️ Available Scripts & Tools

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter (needs configuration)
```

### Audio Generation Scripts
```bash
# Generate audio for specific phrases
python regenerate_problematic_audio.py "phrase 1" "phrase 2"

# Generate all missing audio
python generate_audio.py

# Batch regenerate module audio
python regenerate_module03_audio.py
```

### Maintenance Scripts
```bash
# Clean backup files
find . -name "*.backup-*" -delete

# Validate content structure
python -c "import json; json.load(open('src/content/index.ts'))"
```

## 📊 Performance Considerations

### Audio Optimization
- **Lazy Loading**: Load audio files on demand
- **Caching Strategy**: Cache frequently used audio
- **Preloading**: Preload critical audio files
- **Compression**: Balance quality and file size

### Content Loading
- **Chunking**: Load modules in chunks
- **Progressive Loading**: Load content as needed
- **Caching**: Cache loaded content in localStorage
- **Bundle Splitting**: Split vendor and app code

## 🔍 Debugging Guidelines

### Common Issues
- **Audio Playback**: Check file paths and formats
- **State Management**: Verify Zustand store usage
- **Content Loading**: Check JSON structure and parsing
- **PWA Issues**: Verify service worker registration

### Debug Tools
- **React DevTools**: Component state and props inspection
- **Network Tab**: Audio file loading and caching
- **Console**: Audio and state management errors
- **Storage Tab**: LocalStorage and IndexedDB inspection

## 🚀 Deployment

### GitHub Pages Deployment
1. **Build Project**: `npm run build`
2. **Push Changes**: `git push origin main`
3. **Automatic Deploy**: GitHub Actions will deploy to GitHub Pages
4. **Verify Deployment**: Check https://songshen06.github.io/quest-g6-english-learning/

### Environment Variables
```env
VITE_APP_TITLE=Quest G6 English Learning
VITE_GITHUB_PAGES_BASE=/quest-g6-english-learning/
```

## 📝 Project History & Context

### Recent Improvements (2024-11)
- **Audio Quality Upgraded**: Replaced with high-quality Coqui TTS files
- **Script Optimization**: Enhanced audio generation with command-line parameters
- **Performance**: Improved audio caching and mobile compatibility
- **Content**: Added 16 new high-quality audio files for key phrases

### Known Issues & Work in Progress
- **ESLint Configuration**: Needs proper setup for code quality
- **Performance Testing**: Pending comprehensive performance analysis
- **Accessibility Audit**: Needs thorough accessibility testing
- **Content Validation**: Real-time content validation system

## 💡 Feature Ideas & Future Enhancements

### High Priority
- **Speech Recognition**: AI-powered pronunciation practice
- **Progress Analytics**: Detailed learning insights
- **Offline Mode**: Enhanced offline capabilities
- **Error Boundaries**: Better error handling

### Medium Priority
- **Social Features**: Leaderboards and group learning
- **Custom Content**: Teacher content creation tools
- **Advanced Reporting**: Parent/teacher dashboards
- **Mobile App**: Native mobile applications

## 🤖 Claude AI Assistant Role

When working on this project, Claude should:
1. **Understand Educational Context**: This is a learning application for young students
2. **Prioritize Accessibility**: All features should be accessible and inclusive
3. **Respect Content Structure**: Maintain consistency with existing content patterns
4. **Test Audio Functionality**: Always verify audio changes work correctly
5. **Consider Performance**: Mobile performance is critical for the target audience
6. **Maintain Child Safety**: All content and features should be age-appropriate
7. **Follow Educational Best Practices**: Align with modern language learning pedagogy

### Claude's Capabilities in This Project
- **Audio Generation**: Can regenerate and optimize audio files
- **Content Updates**: Can modify learning content following established patterns
- **Feature Development**: Can build new educational features and exercises
- **Performance Optimization**: Can improve loading times and user experience
- **Bug Fixes**: Can identify and resolve functionality issues
- **Documentation**: Can maintain and update project documentation

---

*Last Updated: November 2024*
*Project Version: 2.2.1*
*Maintainer: Shen Song*