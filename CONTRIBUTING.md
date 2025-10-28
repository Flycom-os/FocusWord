# Contributing to FocusWord

First off, thanks for taking the time to contribute! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/Flycom-os/FocusWord.git
cd FocusWord
```

3. Create a branch for your changes:
```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

4. Make your changes following our coding standards below
5. Test your changes locally
6. Commit your changes ([good commit messages please!](https://www.conventionalcommits.org/))
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local development)
- Git

### Local Development

1. Backend (NestJS):
```bash
cd FocusWord_backend_by_TypeWord
npm install
npm run start:dev
```

2. Frontend (Next.js):
```bash
cd FocusWord_client_by_TypeWord
npm install
npm run dev
```

3. Or use Docker Compose (recommended for full stack):
```bash
cd FocusWord_backend_by_TypeWord
docker-compose up --build
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new code
- Follow the existing code style
- Use ESLint and Prettier configurations provided
- Add JSDoc comments for public APIs
- Use meaningful variable/function names

### Git Workflow

1. Branch naming:
   - `feature/*` for new features
   - `fix/*` for bug fixes
   - `docs/*` for documentation
   - `refactor/*` for code refactoring

2. Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(component): add new feature
   fix(api): resolve issue with auth
   docs: update README
   ```

### Testing

- Add tests for new features
- Ensure existing tests pass
- Run linters before committing:
  ```bash
  npm run lint
  ```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Update CHANGELOG.md if applicable
4. Ensure CI checks pass
5. Request review from maintainers
6. Address review feedback

## Additional Notes

### First Time Contributors

- Look for issues labeled `good first issue` or `help wanted`
- Feel free to ask questions in issues
- Join our community discussions

### Need Help?

- Create an issue for bugs/features
- Ask questions in discussions
- Contact maintainers (see README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.