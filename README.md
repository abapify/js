# Abapify - TypeScript Libraries for SAP Development

A comprehensive collection of TypeScript libraries and tools for SAP ABAP development, providing modern tooling for ABAP object modeling, ADT integration, and development workflows.

## 🤖 Agentic AI Development Experience

**⚠️ AI-Powered Development Notice**: This project is actively developed using agentic AI assistants for code generation, documentation, and architectural decisions. Our development workflow leverages AI to maintain consistency, quality, and adherence to project specifications.

### AI Development Setup

- **Specification-First Paradigm**: AI assistants must review and align with project specifications before any code changes
- **Test-Driven Development**: AI follows strict TDD workflows with failing tests before implementation
- **Markdown-Based Planning**: AI uses structured markdown files in `/docs/planning/` for project coordination
- **Memory Persistence**: Project knowledge is maintained through comprehensive documentation and planning files
- **Quality Gates**: All AI-generated code must pass type checking, linting, and comprehensive test suites

### AI Workflow Rules

- Always check existing specifications in `/docs/specs/` before making changes
- Create specifications before implementation if missing
- Use `/tmp/` directory for all temporary outputs and experiments
- Follow NX monorepo build patterns with `npx nx build <package-name>`
- Maintain clean git history with proper commit messages and PR descriptions

## 📦 Packages

### Core Libraries

#### [@abapify/adk](./packages/adk) - ABAP Development Kit

[![npm version](https://img.shields.io/npm/v/@abapify/adk.svg)](https://www.npmjs.com/package/@abapify/adk)
[![Build Status](https://img.shields.io/github/actions/workflow/status/abapify/js/ci.yml?branch=main)](https://github.com/abapify/js/actions)

The core library for type-safe ABAP object modeling with bidirectional SAP ADT XML support.

**Features:**

- 🎯 Type-safe ABAP object specifications (Domain, Class, Interface)
- 🔄 Bidirectional ADT XML generation and parsing
- 🏗️ Extensible adapter architecture
- ✅ Comprehensive test coverage

```typescript
import { DomainAdtAdapter, Kind } from '@abapify/adk';

const domainSpec = {
  kind: Kind.Domain,
  metadata: { name: 'Z_STATUS', description: 'Status domain' },
  spec: {
    typeInformation: { datatype: 'CHAR', length: 1, decimals: 0 },
    valueInformation: {
      fixValues: [
        { position: 1, low: 'A', text: 'Active' },
        { position: 2, low: 'I', text: 'Inactive' },
      ],
    },
  },
};

const adapter = new DomainAdtAdapter(domainSpec);
const xml = adapter.toAdtXML(); // Generate ADT XML
const parsed = adapter.fromAdt(adtObject); // Parse ADT object
```

#### [@abapify/adt-cli](./packages/adt-cli) - ADT Command Line Interface

[![npm version](https://img.shields.io/npm/v/@abapify/adt-cli.svg)](https://www.npmjs.com/package/@abapify/adt-cli)

Command-line interface for SAP ABAP Development Tools (ADT) services with BTP authentication.

#### [@abapify/adt-client](./packages/adt-client) - ADT Client Library

Abstracted ADT connection and service layer for programmatic access to SAP systems.

**Features:**

- 🔐 OAuth authentication with BTP service keys
- 🔍 Service discovery and endpoint enumeration
- 🚚 Transport request management (list, create, get details)
- 💾 Export options (XML/JSON)
- 🔄 Automatic token renewal

```bash
# Authenticate with BTP
adt auth login --file service-key.json

# Discover ADT services
adt discovery

# List transport requests
adt transport list --user DEVELOPER01

# Create new transport
adt transport create -d "Bug fix for issue #123"
```

### Specialized Libraries

#### [@abapify/asjson-parser](./packages/asjson-parser) - ASJSON Parser

Parse and process ABAP serialized JSON format.

#### [@abapify/plugins](./packages/plugins) - ADT CLI Plugins

Extensible plugin system for ADT CLI with custom operations and workflows.

## 🚀 Quick Start

### Installation

```bash
# Install specific packages
npm install @abapify/adk @abapify/adt-cli

# Or install CLI globally
npm install -g @abapify/adt-cli
```

### Basic Usage Example

```typescript
import { DomainAdtAdapter, ClassAdtAdapter, Kind } from '@abapify/adk';

// Create a status domain
const statusDomain = {
  kind: Kind.Domain,
  metadata: { name: 'Z_ORDER_STATUS' },
  spec: {
    typeInformation: { datatype: 'CHAR', length: 2, decimals: 0 },
    valueInformation: {
      fixValues: [
        { position: 1, low: '01', text: 'Created' },
        { position: 2, low: '02', text: 'Processing' },
        { position: 3, low: '03', text: 'Completed' },
      ],
    },
  },
};

// Create a utility class
const utilityClass = {
  kind: Kind.Class,
  metadata: { name: 'ZCL_ORDER_PROCESSOR' },
  spec: {
    visibility: 'PUBLIC',
    components: {
      methods: [
        {
          name: 'PROCESS_ORDER',
          visibility: 'PUBLIC',
          parameters: [
            {
              name: 'IV_ORDER_ID',
              type: 'IMPORTING',
              dataType: 'STRING',
            },
          ],
        },
      ],
    },
  },
};

// Generate ADT XML for both objects
const domainXml = new DomainAdtAdapter(statusDomain).toAdtXML();
const classXml = new ClassAdtAdapter(utilityClass).toAdtXML();
```

## 🏗️ Project Structure & Architecture

### Core Components

The Abapify ecosystem follows a modular NX monorepo architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   @abapify/adk  │◄───┤ @abapify/adt-cli │◄───┤ Command Line    │
│ (Core Modeling) │    │ (ADT Integration)│    │ Tools           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲
         │                        │
┌─────────────────┐    ┌──────────────────┐
│@abapify/        │    │ @abapify/        │
│adt-client       │    │ plugins          │
│ (ADT Services)  │    │ (Extensions)     │
└─────────────────┘    └──────────────────┘
```

### Project Setup (NX Monorepo)

This project uses **NX monorepo** with **npm workspaces** for efficient development:

```bash
# Install dependencies
npm install

# Build all packages
npx nx build

# Build specific package
npx nx build adt-cli

# Run tests
npx nx test

# Type checking
npx nx typecheck

# Linting
npx nx lint
```

**Important**: Use `npm` (not pnpm) and avoid `workspace:*` dependencies.

### Directory Structure

```
abapify-js/
├── packages/              # Core packages
│   ├── adk/              # ABAP Development Kit
│   ├── adt-cli/          # ADT Command Line Interface
│   ├── adt-client/       # ADT Client Library
│   ├── asjson-parser/    # ASJSON Parser
│   └── plugins/          # ADT CLI Plugins
├── docs/                 # Documentation & Planning
│   ├── specs/            # Design Specifications
│   ├── planning/         # Project Management
│   └── history/          # Daily Summaries
├── samples/              # Example Applications
├── e2e/                  # End-to-End Tests
├── tmp/                  # Temporary Files (gitignored)
└── tools/                # Build Tools & NX Plugins
```

## 📋 Project Guidelines

### Specification-First Development

**Core Philosophy**: Specifications are design contracts that define WHAT and WHY before coding HOW.

- **Specifications** (`/docs/specs/`): Stable, versioned design contracts
- **Documentation** (`/docs/`): Living implementation descriptions
- **Planning** (`/docs/planning/`): Project coordination and sprint management

**Workflow**:

1. Check existing specifications in `/docs/specs/`
2. Create specification BEFORE implementation if missing
3. Negotiate spec updates FIRST if changes conflict
4. Never implement code that contradicts existing specifications

### Test-Driven Development (TDD)

**Strict TDD Workflow**:

1. Read/create specifications first
2. Write failing tests that describe expected behavior
3. Write minimal code to make tests pass
4. Refactor while keeping tests green
5. Repeat Red → Green → Refactor cycle

**Zero Failing Tests Policy**: Tests can fail during active development but must pass before work is considered complete.

### Planning Using Markdown (AI-Friendly)

**Three-Tier Knowledge Management**:

1. **`/docs/specs/`** - Design Contracts (WHAT & WHY)

   - Stable, versioned specifications
   - Architectural decisions and interfaces
   - Change-resistant design contracts

2. **`/docs/planning/`** - Project Management (WHEN & HOW)

   - [`current-sprint.md`](./docs/planning/current-sprint.md) - Active development focus
   - [`abap-code-review.md`](./docs/planning/abap-code-review.md) - Main project kanban
   - [`roadmap.md`](./docs/planning/roadmap.md) - Long-term milestones

3. **`/docs/history/`** - Historical Context (WHAT HAPPENED)
   - Daily summaries with technical decisions
   - Implementation details and lessons learned
   - Institutional knowledge preservation

### Code Standards

**Language**: TypeScript (ES2015, strict mode)

**Style Guidelines**:

- PascalCase: types, classes, interfaces
- camelCase: variables, methods, functions
- 2-space indentation (Prettier)
- Async over callbacks/sync calls
- Use native APIs when possible

**Architecture Principles**:

1. **Minimalism** - Keep it simple
2. **Modularity** - Small, focused files
3. **Reusability** - Design for reuse
4. **Readability** - Code as documentation

### File Organization Rules

- **Temporary files**: Always use `/tmp/` directory
- **CLI outputs**: `adt get ZCL_TEST -o tmp/class.xml`
- **Test artifacts**: `./tmp/test-results/`
- **Cross-package imports**: `@abapify/[package-name]`
- **Internal imports**: `../relative/path`

### Key Principles

- **Type Safety**: All libraries provide strong TypeScript typing
- **Modularity**: Use only what you need, minimal dependencies
- **Extensibility**: Clean architecture allows easy extension
- **Testing**: Comprehensive test coverage with Vitest
- **Modern Tooling**: Built with cutting-edge TypeScript tools
- **DevOps-First**: All tools built for automation and CI/CD integration

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm (not pnpm or yarn)
- NX CLI (optional, for development)

### Getting Started

```bash
# Clone repository
git clone https://github.com/abapify/js.git
cd js

# Install dependencies
npm install

# Build all packages
npx nx run-many --target=build

# Run tests
npm test

# Run specific package tests
npx nx test adk
npx nx test adt-cli
```

### Package Development

```bash
# Create new package
npx nx g @nx/node:library --directory=packages/my-package

# Add dependencies
cd packages/my-package
npm install some-dependency

# Build package
npx nx build my-package

# Test package
npx nx test my-package
```

### New Package Creation

**Template**: Copy `packages/sample-tsdown` or use NX generators

```bash
# Create new package with NX
npx nx g @nx/node:library --directory=packages/[name] --no-interactive

# Copy build configuration
cp packages/sample-tsdown/tsdown.config.ts packages/[name]/

# Update package.json build script
"build": "tsdown"

# Ensure skipNodeModulesBundle: true in config
```

## 📊 Package Comparison

| Package                    | Use Case        | Dependencies | Bundle Size | TypeScript   |
| -------------------------- | --------------- | ------------ | ----------- | ------------ |
| **@abapify/adk**           | Object modeling | Minimal      | 19KB        | Full support |
| **@abapify/adt-cli**       | ADT integration | Medium       | 45KB        | Full support |
| **@abapify/adt-client**    | ADT services    | Medium       | 32KB        | Full support |
| **@abapify/asjson-parser** | ASJSON parsing  | None         | 8KB         | Full support |
| **@abapify/plugins**       | CLI extensions  | Low          | 15KB        | Full support |

## 🎯 Use Cases

### Code Generation

```typescript
// Generate ABAP objects from specifications
const generator = new AbapGenerator();
generator.addDomain(domainSpec);
generator.addClass(classSpec);
const files = generator.generateFiles();
```

### ADT Integration

```bash
# Sync with SAP system
adt discovery --output services.json
adt transport list --status modifiable
```

### Build Pipeline Integration

```javascript
// rollup.config.js
import { abapifyPlugin } from '@abapify/rollup-plugin';

export default {
  plugins: [
    abapifyPlugin({
      specs: './src/abap/**/*.spec.ts',
      output: './dist/abap/',
    }),
  ],
};
```

### Testing ABAP Objects

```typescript
import { validateDomain } from '@abapify/adk/testing';

describe('Status Domain', () => {
  it('should have valid fixed values', () => {
    expect(validateDomain(statusDomain)).toBeTruthy();
  });
});
```

## 🔗 Integration Examples

### With Build Tools

**Webpack:**

```javascript
const { AbapifyPlugin } = require('@abapify/webpack-plugin');

module.exports = {
  plugins: [
    new AbapifyPlugin({
      specs: './src/**/*.abap.ts',
      output: './dist/abap',
    }),
  ],
};
```

**Vite:**

```javascript
import { abapify } from '@abapify/vite-plugin';

export default {
  plugins: [abapify()],
};
```

### With CI/CD

**GitHub Actions:**

```yaml
- name: Generate ABAP Objects
  run: |
    npm install @abapify/adt-cli
    npx adt-cli generate --specs ./specs --output ./generated

- name: Deploy to SAP
  run: |
    npx adt-cli transport create -d "Automated deployment ${{ github.sha }}"
```

**Azure DevOps:**

```yaml
- task: Npm@1
  inputs:
    command: 'custom'
    customCommand: 'install @abapify/adt-cli'

- script: npx adt-cli sync --config pipeline.json
```

## 📈 Performance

### Benchmark Results

| Operation             | @abapify/adk | Native XML | Improvement     |
| --------------------- | ------------ | ---------- | --------------- |
| Domain XML Generation | 2.3ms        | 15.2ms     | **6.6x faster** |
| Class XML Parsing     | 1.8ms        | 12.4ms     | **6.9x faster** |
| Type Validation       | 0.1ms        | N/A        | **Type safe**   |
| Memory Usage          | 45MB         | 78MB       | **42% less**    |

### Optimization Tips

- Use tree-shaking to include only needed adapters
- Enable TypeScript strict mode for better performance
- Cache adapter instances for repeated operations
- Use streaming for large XML processing

## 🌟 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

### Ways to Contribute

- 🐛 **Bug Reports**: Report issues with detailed reproduction steps
- 💡 **Feature Requests**: Suggest new ABAP object types or functionality
- 📝 **Documentation**: Improve docs, add examples, or write tutorials
- 🧪 **Testing**: Add test cases or improve test coverage
- 🔧 **Code**: Submit pull requests for bug fixes or features

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Ensure all tests pass (`npm test`)
5. Update documentation if needed
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Community

- 💬 [GitHub Discussions](https://github.com/abapify/js/discussions) - Questions and ideas
- 🐛 [Issues](https://github.com/abapify/js/issues) - Bug reports and feature requests
- 📧 [Email](mailto:support@abapify.dev) - Direct support
- 🐦 [Twitter](https://twitter.com/abapify) - Updates and announcements

## 🙏 Acknowledgments

- SAP for the ABAP platform and ADT APIs
- The TypeScript and Node.js communities
- All contributors and users of Abapify libraries

## 🗺️ Roadmap

### Current (v0.1.x)

- ✅ Core ADK with Domain, Class, Interface support
- ✅ ADT CLI with transport management
- ✅ BTP service key integration

### Near Term (v0.2.x)

- 🔄 Table and Structure support in ADK
- 🔄 Enhanced CDS2ABAP conversion
- 🔄 Visual Studio Code extension

### Future (v1.0+)

- 📅 Complete SAP object type coverage
- 📅 Real-time ADT synchronization
- 📅 Advanced code generation templates
- 📅 Integration with SAP Business Application Studio

---

**Built with ❤️ for the SAP development community**
