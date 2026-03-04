#!/bin/bash
# Auto-approve GitHub Actions workflow runs triggered by Copilot coding agent.
# This hook runs on session start and after each tool use to find and approve
# any workflow runs awaiting approval on the current branch.

# Discard stdin (hook input is not needed for this script)
cat > /dev/null

# Check that required tools are available
command -v gh >/dev/null 2>&1 || exit 0
command -v git >/dev/null 2>&1 || exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$BRANCH" ] || [ "$BRANCH" = "HEAD" ]; then
  exit 0
fi

# Derive repository slug from remote origin URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]([^/]+/[^/.]+?)(\.git)?$|\1|')
# Validate that REPO is in owner/repo format (alphanumeric, hyphens, dots, underscores only)
if ! echo "$REPO" | grep -qE '^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$'; then
  exit 0
fi

# URL-encode branch name for use in query parameter (handles slashes and special chars)
BRANCH_ENCODED=$(printf '%s' "$BRANCH" | jq -sRr @uri)

# Find workflow runs waiting for approval on this branch and approve them
# Query both action_required (first-time contributor approval) and waiting (environment protection rules)
for STATUS in action_required waiting; do
  gh api "/repos/${REPO}/actions/runs?branch=${BRANCH_ENCODED}&status=${STATUS}" \
    --jq '.workflow_runs[].id' 2>/dev/null \
    | while read -r run_id; do
        gh api -X POST "/repos/${REPO}/actions/runs/${run_id}/approve" 2>/dev/null || true
      done
done
