# Contributing to ChronoAura Backend

First off, thank you for taking the time to contribute! 🎉 

ChronoAura is an open-source project, and we welcome contributions from developers of all skill levels. Whether you are fixing a typo in the documentation, fixing a bug in the routes, or adding a completely new feature, your help is highly appreciated.

Please review the following guidelines to keep our codebase clean, organized, and secure.

---

## How Can I Contribute?

### 1. Reporting Bugs or Requesting Features
Before writing code, check the **Issues** tab on GitHub to see if your bug or feature request has already been reported. If it hasn't, please open a new issue and include:
- A clear, descriptive title.
- Steps to reproduce the bug (if applicable).
- Expected vs. actual behavior.
- Node.js version and any error messages from your terminal.

### 2. Working on Code Changes
If you find an open issue you want to work on, or want to implement a new feature from our API roadmap, follow our development workflow below.

---

## Branching and Git Workflow

To keep our commit history clean, please follow these steps to submit your changes:

1. **Fork the Repository:** Create your own copy of the repository by clicking the **Fork** button at the top right of the GitHub page.
2. **Clone Your Fork:** Clone your fork to your local machine:
   ```bash
   git clone https://github.com/your-username/chrono-aura.git
   cd chrono-aura/backend
   ```
3. **Create a Feature Branch:** Never work directly on the `main` branch. Create a descriptive branch name based on what you are doing:
   ```bash
   # For new features
   git checkout -b feature/your-feature-name

   # For bug fixes
   git checkout -b fix/bug-description
   ```
4. **Make Your Changes:** Write your JavaScript code, test your endpoints locally using Postman/Thunder Client, and ensure the server runs smoothly with `npm run dev`.
5. **Commit Your Changes:** Write clear, concise commit messages in the imperative mood (e.g., "Add brand verification middleware" instead of "fixed stuff").
   ```bash
   git add .
   git commit -m "Fix token validation expiration bug in auth routes"
   ```
6. **Push to GitHub:** Push your branch up to your personal fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request (PR):** Go back to the original `codex-leo/chrono-aura` repository on GitHub. You will see a prompt to open a Pull Request. Fill out the PR template explaining what you changed and why.

---

## Code and Security Guidelines

Because ChronoAura deals with sensitive user information (like passwords and JWT access tokens), please observe these strict rules:

- **Never Commit `.env` Files:** Ensure your local `.env` file containing your real `MONGO_URL`, `IMAGE_KIT_PRIVATE_KEY`, or JWT secrets is **never** committed to Git. Check that your `.gitignore` is working before pushing code.
- **Keep Code Modular:** Follow the established architecture. Keep database schemas in `/models`, endpoint paths in `/routes`, business logic in `/controllers`, and request verifications in `/middlewares`.
- **Handle Errors Gracefully:** Always wrap database operations and asynchronous calls in `try...catch` blocks and return appropriate HTTP status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`).

---

Thank you again for helping me build the ultimate e-commerce backend! If you have any questions, feel free to open a discussion or contact the maintainers.
