# Changelog

All notable changes to the xmld project will be documented in this file.

## [2.1.0] - 2025-09-21

### ✨ New Features

- **Added `@attributes` Convenience Decorator** - Shortcut for `@unwrap @attribute` pattern
  - Simplifies attribute flattening with a single decorator
  - Works seamlessly with `@namespace` for namespaced attributes
  - Provides cleaner, more readable syntax for common attribute patterns
  - Full test coverage with equivalence testing

### 📚 Documentation

- Updated API Reference with comprehensive `@attributes` documentation
- Added examples showing usage with namespaces
- Updated main README with `@attributes` usage examples
- Enhanced specification documentation

## [2.0.0] - 2025-09-20

### 🎯 Major Features

- **Introduced `@xmld` Signature Decorator** - Our branded decorator that serves as xmld's visit card
- **Explicit Auto-Instantiation** - Use `@element({ type: SomeClass })` for predictable behavior
- **Modular Decorator Architecture** - Separated decorators into individual files for better maintainability

### ✨ Improvements

- **Eliminated Naming Surprises** - Removed unreliable naming heuristics that caused unexpected behavior
- **Enhanced Type Safety** - Validates that only `@xmld` decorated classes are used for auto-instantiation
- **Clean Architecture** - Proper separation of concerns with individual decorator files
- **Better Error Messages** - Clear warnings when invalid types are used for auto-instantiation

### 🔧 Technical Changes

- Refactored decorators into separate files:
  - `src/core/decorators/xmld.ts` - Our signature decorator
  - `src/core/decorators/element.ts` - Element decorator with explicit auto-instantiation
  - `src/core/decorators/attribute.ts` - Attribute decorator
  - `src/core/decorators/unwrap.ts` - Unwrap decorator
  - `src/core/decorators/namespace.ts` - Namespace decorator
  - `src/core/decorators/root.ts` - Root decorator
- Added `ElementOptions` interface for explicit type hints
- Improved test coverage with explicit auto-instantiation tests

### 🛡️ Breaking Changes

- **Auto-instantiation now requires explicit type hints**
  - Old: `@element author!: Author;` (relied on naming heuristics)
  - New: `@element({ type: Author }) author!: Author;` (explicit and safe)

### ♻️ Backward Compatibility

- Both `@xmld` and `@xml` decorators work seamlessly
- Old `@element` syntax still works (just no auto-instantiation without explicit types)
- All existing APIs remain functional

### 📊 Test Results

- ✅ 4/4 RSS feed tests passing
- ✅ 20/20 decorator tests passing
- ✅ All integration tests passing
- ✅ No breaking changes to public API

## [1.0.0] - Previous Release

### Initial Features

- Basic XML modeling with TypeScript decorators
- Auto-instantiation based on naming heuristics
- Plugin-based XML serialization
- Complete test suite with RSS feed examples
