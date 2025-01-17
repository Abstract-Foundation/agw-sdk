# Contribution Guidelines

We're excited that you're interested in contributing to the Abstract Global Wallet SDK! ❤️ This document will guide you through the contribution process and help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Bug Reports & Feature Requests](#bug-reports--feature-requests)
- [Coding Standards](#coding-standards)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read and follow our Code of Conduct.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agw-sdk.git
   cd agw-sdk
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a new branch:
   ```bash
   git checkout -b your-branch-name
   ```

## Contributing Process

### 1. Fork the Repository

1. Visit the [main repository](https://github.com/Abstract-Foundation/agw-sdk)
2. Click the "Fork" button in the top right
3. Clone your fork locally

### 2. Keep Your Fork Updated

```bash
# Add the upstream repository
git remote add upstream https://github.com/Abstract-Foundation/agw-sdk.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

### 4. Make Your Changes

- Write clean, maintainable code
- Follow our coding standards
- Add tests for new features
- Update documentation as needed
- Commit your changes with clear messages

### 5. Submit a Pull Request

1. Push your changes to your fork
2. Go to the original repository
3. Click "New Pull Request"
4. Choose your branch
5. Fill in the PR template

## Pull Request Guidelines

### PR Title Format
- feat: Add new feature
- fix: Fix specific issue
- docs: Update documentation
- style: Code style changes
- refactor: Code refactoring
- test: Add or update tests
- chore: Maintenance tasks

### PR Description Should Include:
- Clear description of changes
- Motivation and context
- Breaking changes (if any)
- Screenshots (if applicable)
- Related issue numbers

## Bug Reports & Feature Requests

When submitting issues:

1. Use our issue templates
2. Provide detailed reproduction steps
3. Include relevant information:
   - SDK version
   - Environment details
   - Error messages
   - Screenshots/GIFs

---

Thank you for contributing to Abstract Global Wallet SDK! 🚀
