# Contributing to Ellis App

Thank you for your interest in contributing to Ellis! This app helps service providers better serve marginalized communities through relationship management, service referrals, and care coordination.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.x or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally with `npm install -g @expo/cli`
- **Git** for version control

For mobile development, you'll also need:
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Add the original repository as upstream**
4. **Navigate to the App directory and install dependencies**
5. **Set up environment variables**:
   - Create a `.env` file in the `App` directory
   - Contact the maintainers for the required Supabase credentials:
     ```
     AUTH_SUPABASE_URL=your_auth_supabase_url
     AUTH_SUPABASE_ANON_KEY=your_auth_supabase_anon_key
     DATA_SUPABASE_URL=your_data_supabase_url
     DATA_SUPABASE_ANON_KEY=your_data_supabase_anon_key
     ```
6. **Start the development server**

## Development Workflow

### Before You Start Working

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

### Making Changes

1. **Follow the existing code structure**:
   - Place new screens in the appropriate directory under `screens/`
   - Add shared components to `shared/`
   - Use the established naming conventions
   - Follow the modular approach outlined in the project structure

2. **Test your changes**:
   - Test on both iOS and Android if possible
   - Ensure the app builds without errors
   - Test with different user roles (service providers, clients)

3. **Follow coding standards**:
   - Use meaningful variable and function names
   - Add comments for complex logic
   - Keep functions small and focused
   - Follow React Native best practices

### Project Structure Guide

When adding new features, place files in the appropriate directories

## Types of Contributions

### 🐛 Bug Fixes
- Check existing issues before creating a new one
- Include steps to reproduce the bug
- Test your fix thoroughly

### ✨ New Features
- Discuss major features in an issue first
- Consider how the feature serves marginalized communities
- Ensure accessibility compliance
- Update documentation as needed

### 📚 Documentation
- Fix typos and improve clarity
- Add missing documentation
- Update outdated information
- Create examples and tutorials

### 🧪 Testing
- Add unit tests for new functionality
- Improve test coverage
- Test on different devices and screen sizes

## Special Considerations

### HMIS Integration
When working with HMIS-related features:
- Follow federal compliance requirements
- Understand the data mapping in `HMIS/` directory
- Ensure data privacy and security
- Test data export functionality

### Accessibility
Ellis serves marginalized communities, so accessibility is crucial:
- Use semantic elements and proper labels
- Ensure sufficient color contrast
- Test with screen readers
- Support keyboard navigation

### Privacy and Security
- Never commit sensitive data or credentials
- Follow data protection best practices
- Be mindful of client privacy in all features
- Use secure authentication patterns

## Submitting Your Contribution

### Pull Request Process

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "type: brief description of changes"
   ```
   
   Use conventional commit types:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for adding tests

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Use a descriptive title
   - Explain what your changes do and why
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] No breaking changes
- [ ] Added/updated tests

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Fixes #[issue number]
```

## Code Review Process

1. **Automated checks** must pass (if and when configured)
2. **Maintainer** will review your PR
3. **Address feedback** promptly and respectfully
4. **Squash commits** if requested before merging

## Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [Provide contact email if available] @mit review this

### Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [HMIS Standards](https://hudexchange.info/programs/hmis/)

## Code of Conduct

This project follows a code of conduct that ensures a welcoming environment for everyone. Key principles:

- **Be respectful** and inclusive
- **Focus on the mission** of serving marginalized communities
- **Assume good intentions** in interactions
- **Report inappropriate behavior** to maintainers

## Questions?

Don't hesitate to ask questions! Create an issue with the "question" label, or reach out to the maintainers directly. We're here to help you contribute successfully.

Thank you for helping make Ellis better for the communities it serves! 🙏