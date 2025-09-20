# Contributing to xmld

Thank you for your interest in contributing to **xmld**! This guide will help you get started with development.

## 🏗️ Development Setup

This project is part of a larger monorepo managed with NX.

### Prerequisites

- Node.js 18+
- npm or yarn
- NX CLI (for workspace development)

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd abapify-js

# Install dependencies
npm install

# Build the xmld package
npx nx build xmld

# Run tests
npx nx test xmld

# Run tests in watch mode
npx nx test xmld --watch

# Run tests with coverage
npx nx test xmld --coverage
```

## 🧪 Testing

We use Vitest for testing. All tests should be placed in the appropriate directories:

- **Unit tests**: `src/**/*.test.ts`
- **Integration tests**: `src/examples/*.test.ts`

### Running Tests

```bash
# Run all xmld tests
npx nx test xmld

# Run specific test file
npx vitest run src/core/decorators.test.ts --reporter=default

# Run RSS feed examples
npx vitest run src/examples/rss-feed.test.ts --reporter=default
```

## 📁 Project Structure

```
packages/xmld/
├── src/
│   ├── core/
│   │   ├── decorators/          # Individual decorator files
│   │   │   ├── index.ts         # Re-exports
│   │   │   ├── xmld.ts         # @xmld signature decorator
│   │   │   ├── element.ts      # @element decorator
│   │   │   └── ...
│   │   ├── metadata.ts         # Metadata management
│   │   └── constants.ts        # Constants
│   ├── serialization/
│   │   └── serializer.ts       # XML serialization engine
│   ├── plugins/
│   │   └── fast-xml-parser.ts  # Plugin implementations
│   ├── examples/
│   │   └── rss-feed.test.ts    # Real-world examples
│   └── index.ts                # Public API
├── docs/                       # Technical documentation
├── README.md                   # Package documentation (for npm users)
├── CONTRIBUTING.md            # This file (for contributors)
└── CHANGELOG.md               # Version history
```

## 🎯 Development Guidelines

### 1. **Follow the Architecture**

- **Modular Decorators**: Each decorator in its own file
- **Separation of Concerns**: Core logic separate from serialization
- **Generic Design**: No domain-specific logic in core components

### 2. **Code Style**

- Use TypeScript strict mode
- Follow existing naming conventions
- Use extensionless imports for internal files
- Add JSDoc comments for public APIs

### 3. **Testing Requirements**

- All new features must have tests
- Maintain 100% test coverage for core functionality
- Include both unit tests and integration examples
- Test both success and error cases

### 4. **Documentation**

- Update README.md for user-facing changes
- Update API reference for new decorators/functions
- Add examples for new features
- Update CHANGELOG.md

## 🚀 Making Changes

### 1. **Create a Branch**

```bash
git checkout -b feature/your-feature-name
```

### 2. **Make Your Changes**

- Follow the existing code patterns
- Add tests for new functionality
- Update documentation as needed

### 3. **Test Your Changes**

```bash
# Run all tests
npx nx test xmld

# Check that examples still work
npx vitest run src/examples/ --reporter=default

# Verify build works
npx nx build xmld
```

### 4. **Submit a Pull Request**

- Write a clear description of your changes
- Reference any related issues
- Ensure all tests pass
- Update documentation if needed

## 🎯 Key Principles

### **No Surprises**

- Explicit over implicit behavior
- Clear error messages
- Predictable APIs

### **Generic Design**

- No domain-specific logic in core
- Extensible through plugins
- Works with any XML format

### **Type Safety**

- Full TypeScript support
- Runtime validation where needed
- Clear interfaces and types

## 📚 Resources

- [Technical Specification](./docs/specs/README.md)
- [API Reference](./docs/specs/api-reference.md)
- [Architecture Guide](./docs/specs/architecture.md)
- [Examples](./docs/specs/examples.md)

## ❓ Questions?

Feel free to open an issue for questions about contributing or development setup.

---

**Thank you for contributing to xmld!** 🎉
