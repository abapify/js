# Classify Code Review checks as read analysis

## Why

ATC, AUnit, and code coverage are fundamental Code Review operations.
Requiring a separate `safe_execute` approval removes them from ordinary
non-mutating assistant catalogues and prevents an assistant from completing a
transport review.

## What changes

- Classify `atc_run` and `run_unit_tests` (with or without coverage) as
  non-mutating `read` operations.
- Advertise and dispatch these checks for an authenticated read-only
  Destination.
- Retain support for stricter object-bound `safe_execute` credentials when a
  workflow elects to use them.
- Keep repository mutations outside ordinary read authority.

## Impact

Delegated read assistants can run ATC, AUnit, and coverage without user approval. Destination
binding, authentication, response bounds, and optional stricter execution
policies remain server-enforced.
