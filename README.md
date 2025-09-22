# Abapify.js Monorepo

TypeScript libraries and CLI tools for modern SAP ABAP development workflows. Build CLI-first development tools, integrate ABAP with modern CI/CD pipelines, and work with SAP systems programmatically.

## What is Abapify.js?

A monorepo containing focused TypeScript packages for SAP development:

- **CLI-First Approach**: Command-line tools for developers and CI/CD automation
- **Modern Toolchain**: TypeScript, NX monorepo, comprehensive testing
- **SAP BTP Ready**: OAuth 2.0 authentication and optimized for SAP Business Technology Platform
- **Modular Architecture**: Use only the packages you need

## ⚠️ AI-Driven Development Disclaimer

**This project is actively developed using AI assistants** for code generation, architecture decisions, and documentation. While we strive for quality and consistency:

- 🔄 **Experimental Nature**: Some features may not work as expected
- 🏗️ **Evolving Architecture**: Code patterns may vary as AI learns and adapts
- 🧹 **Legacy Artifacts**: You may encounter unused code or outdated patterns from iterative development
- 🧪 **Active Development**: APIs and interfaces may change between versions

**Recommendation**: Use this project for experimentation and learning. For production use, thoroughly test and review all functionality.

## 📦 Core Packages

| Package                                                | Purpose                                       | Status         |
| ------------------------------------------------------ | --------------------------------------------- | -------------- |
| **[@abapify/adt-cli](./packages/adt-cli)**             | Command-line interface for SAP ADT operations | ✅ Active      |
| **[@abapify/adt-client](./packages/adt-client)**       | HTTP client library for SAP ADT REST APIs     | ✅ Active      |
| **[@abapify/adk](./packages/adk)**                     | ABAP Development Kit - object modeling        | 🚧 Development |
| **[@abapify/asjson-parser](./packages/asjson-parser)** | ABAP serialized JSON parser                   | ✅ Stable      |

### Package Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   @abapify/     │◄───┤ @abapify/adt-cli │◄───┤ CLI Commands    │
│   adt-client    │    │                  │    │ & User Interface│
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲
         │                        │
┌─────────────────┐    ┌──────────────────┐
│ SAP ADT         │    │ @abapify/adk     │
│ REST APIs       │    │ Object Models    │
│                 │    │                  │
└─────────────────┘    └──────────────────┘
```

**Core Principle**: CLI-first design with reusable client libraries.

## 🛠️ Development Setup

### Prerequisites

- **Node.js 18+**
- **npm** (not pnpm or yarn - important!)
- **Git**

### Project Setup

```bash
# Clone the repository
git clone https://github.com/your-org/abapify-js.git
cd abapify-js

# Install dependencies
npm install

# Build all packages
npx nx build

# Run tests
npx nx test

# Type checking
npx nx typecheck
```

## 📁 Repository Structure

```
abapify-js/
├── packages/              # Core packages
│   ├── adt-cli/          # ADT Command Line Interface
│   ├── adt-client/       # ADT Client Library
│   ├── adk/              # ABAP Development Kit
│   └── asjson-parser/    # ASJSON Parser
├── samples/              # Example applications and usage
├── docs/                 # Documentation and planning
├── e2e/                  # End-to-end tests
├── tmp/                  # Temporary files (gitignored)
└── tools/                # Build tools & NX configuration
```

## 🔧 NX Monorepo Commands

```bash
# Build specific package
npx nx build adt-cli
npx nx build adt-client

# Run tests for specific package
npx nx test adk
npx nx test adt-cli

# Build all packages
npx nx run-many --target=build

# Run all tests
npx nx run-many --target=test

# Lint all packages
npx nx run-many --target=lint
```

### NX Plugins Used

- **@nx/node** - Node.js library support
- **@nx/eslint** - ESLint integration
- **@nx/vite** - Vite build tool integration

## 📋 Code Guidelines

### TypeScript Standards

- **Strict Mode**: All packages use TypeScript strict mode
- **ESNext**: Prefer native Node.js APIs over external dependencies
- **Async/Await**: Use async patterns over callbacks or sync operations

### Code Style

```typescript
// ✅ Good - PascalCase for types, camelCase for variables
interface AdtClientConfig {
  serviceKeyPath: string;
}

const createClient = async (config: AdtClientConfig) => {
  // Implementation
};

// ✅ Good - Use native APIs
const response = await fetch(url, options);
const fileContent = await readFile(path, 'utf-8');
```

### Architecture Principles

1. **CLI-First**: Design for command-line usage and automation
2. **Modular**: Small, focused packages with clear boundaries
3. **Type-Safe**: Comprehensive TypeScript support
4. **Testable**: High test coverage with Vitest

### Import Guidelines

```typescript
// ✅ Cross-package imports
import { AdtClientImpl } from '@abapify/adt-client';

// ✅ Internal imports (extensionless for bundlers)
import { parseXml } from '../utils/xml-parser';

// ✅ External packages
import { Command } from 'commander';
```

## 🤝 Contributing

### Quick Start for Contributors

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/abapify-js.git
   cd abapify-js
   npm install
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   - Write tests first (TDD approach)
   - Implement your changes
   - Ensure all tests pass: `npx nx test`

4. **Submit PR**
   - Push branch: `git push origin feature/your-feature-name`
   - Open PR with clear description

### Development Workflow

```bash
# Install dependencies
npm install

# Build and test everything
npx nx build && npx nx test

# Work on specific package
npx nx build adt-cli
npx nx test adt-cli --watch

# Create new package
npx nx g @nx/node:library packages/my-package
```

### Project Planning

- **Current Work**: See [current-sprint.md](./docs/planning/current-sprint.md)
- **Project Status**: See [abap-code-review.md](./docs/planning/abap-code-review.md)
- **Roadmap**: See [roadmap.md](./docs/planning/roadmap.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🗺️ Roadmap

- **Current**: ADT CLI with transport management and source deployment
- **Next**: Enhanced ADK with more ABAP object types
- **Future**: Real-time SAP synchronization and advanced tooling

---

**Built for the SAP development community** 🚀
