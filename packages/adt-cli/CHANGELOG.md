# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Transport Management** - New `adt transport list` command to list and filter transport requests
- **Service-Oriented Architecture** - Refactored to modular service structure for better maintainability
- **Automatic Re-authentication** - CLI automatically re-authenticates when tokens expire using stored service key
- **Command Aliases** - Added `adt tr` as alias for `adt transport`
- **Advanced Filtering** - Transport list supports filtering by user, status, and result limits
- **Comprehensive Documentation** - Updated README with new commands and API reference

### Changed

- **Discovery Service** - Moved discovery logic to service-oriented architecture
- **HTTP Client** - Centralized ADT HTTP requests through `ADTClient` base class
- **Error Handling** - Improved error messages with better context and suggestions

### Technical

- **Parser Library** - Switched from `xml2js` to `fast-xml-parser` for better performance
- **TypeScript Types** - Added comprehensive type definitions for transport and discovery data
- **Code Organization** - Services organized by domain (`services/transport/`, `services/discovery/`)

## [0.0.1] - Initial Release

### Added

- **OAuth Authentication** - Browser-based BTP authentication with PKCE
- **Service Discovery** - Discover and list available ADT services
- **Export Options** - Save discovery data as XML or JSON
- **CLI Interface** - Commander.js-based command-line interface
- **Authentication Management** - Secure token storage and session management
