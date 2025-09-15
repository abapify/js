#!/bin/bash
set -e

# Change to the project directory
cd "$1"

# Run tsdown
npx tsdown
