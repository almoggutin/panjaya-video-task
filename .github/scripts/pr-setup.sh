#!/bin/bash
set -euo pipefail

BRANCH="$1"
PR_URL="$2"

# Extract branch type and description
BRANCH_TYPE=$(echo "$BRANCH" | cut -d'/' -f1)
BRANCH_REST=$(echo "$BRANCH" | cut -d'/' -f2-)

# Extract issue number if present (format: 123-description or #123-description)
ISSUE_NUM=$(echo "$BRANCH_REST" | grep -oP '^\#?\K\d+' || true)
BRANCH_DESC=$(echo "$BRANCH_REST" | sed 's/^[#]*[0-9]*-//' | tr '-' ' ')

# Map branch type to conventional commit type
case "$BRANCH_TYPE" in
  feature)
    COMMIT_TYPE="feat"
    ;;
  bugfix|fix)
    COMMIT_TYPE="fix"
    ;;
  hotfix)
    COMMIT_TYPE="fix"
    ;;
  release)
    COMMIT_TYPE="chore"
    ;;
  *)
    echo "Unknown branch type: $BRANCH_TYPE, skipping PR title update."
    exit 0
    ;;
esac

# Capitalize first letter of description
DESCRIPTION=$(echo "$BRANCH_DESC" | sed 's/^./\U&/')

# Format PR title with issue number if present
if [ -n "$ISSUE_NUM" ]; then
  PR_TITLE="${COMMIT_TYPE}(#${ISSUE_NUM}): ${DESCRIPTION}"
else
  PR_TITLE="${COMMIT_TYPE}: ${DESCRIPTION}"
fi

# Set PR title
gh pr edit "$PR_URL" --title "$PR_TITLE"

# Add closing comment if issue number is present
if [ -n "$ISSUE_NUM" ]; then
  gh pr comment "$PR_URL" --body "Closes #${ISSUE_NUM}"
fi

echo "PR updated: $PR_TITLE"