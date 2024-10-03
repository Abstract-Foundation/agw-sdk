# Contribution Guidelines

We’re excited that you’re interested in contributing to the Abstract Global Wallet SDK! ❤️ Contributions, whether they're bug reports, feature suggestions, documentation updates, or code enhancements, are highly appreciated.

To make the contribution process smooth and efficient, please follow these guidelines.

## How to Contribute

### 1. Fork the Repository

Fork the repository to your GitHub account to get started. This will create your own copy where you can make changes.

1. Go to the main repository on GitHub.
2. Click the "Fork" button in the top right corner.
3. Once the repository is forked, clone it to your local machine. 

### 2. Create a New Branch

Before you start working on your changes, create a new branch for your work to keep the `main` branch clean:

```bash
git checkout -b your-branch-name
```

- Use a descriptive name for your branch (e.g., `feature/add-new-component` or `bugfix/fix-issue-123`).

### 3. Make Your Changes

Now that you have a branch set up, you can make changes to the codebase. When making changes:

- Follow the existing code style and structure.
- Write clear, concise commit messages that explain the "why" behind your changes.
- Make sure your changes are well-tested. If applicable, add tests to validate the new functionality.

### 4. Commit Your Changes

Once you're happy with your changes and everything works as expected, commit them to your branch:

```bash
git add .
git commit -m "description of your changes"
```

### 5. Push to Your Fork

Push the changes to your fork on GitHub:

```bash
git push origin your-branch-name
```

### 6. Submit a Pull Request (PR)

- **Title**: Use a concise and informative title for your pull request.
- **Description**: Provide a detailed description of the changes made, why you made them, and any relevant details about the implementation.
- **Link to Issue**: If your PR addresses an issue, please link to it (e.g., `Fixes #123`).

Submit the pull request and wait for the review process to begin.

---

## Reporting Bugs and Issues

If you encounter a bug or want to suggest a feature:

- Use the Github Issues page to report issues or request features.
- Include as much detail as possible: steps to reproduce the issue, expected behavior, and screenshots if applicable.
- If submitting a feature request, please explain the use case and benefits of the feature.

### **How Do I Submit a Good Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/Abstract-Foundation/agw-sdk/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to. You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
- **Explain why this enhancement would be useful** to most agw-sdk users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

---

## Coding Guidelines

- Follow the existing structure and style of the codebase.
- Ensure all functionality is thoroughly tested.
- Write clear, self-documenting code and add comments when necessary.
- Keep performance and security in mind when making changes.
