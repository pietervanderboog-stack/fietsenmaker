#!/usr/bin/env bash
# Publishes a clean snapshot of main to the public GitHub repo.
#
# The public repo gets NO local history (old commits contain names and a work
# email) — each publish is one commit on top of the previous public one,
# authored with the GitHub noreply address. Source art ("sprites unedited/",
# "cleaned/") is left out.
# Before pushing, the snapshot is checked against .publish-blocklist
# (gitignored, one word per line) so private names can never leak.
#
# Usage: ./publish-github.sh "Wat er veranderd is"
set -euo pipefail
cd "$(dirname "$0")"

REMOTE=github
BRANCH=publish
AUTHOR_NAME="pietervanderboog-stack"
AUTHOR_EMAIL="278901746+pietervanderboog-stack@users.noreply.github.com"
MSG="${1:-Update}"

git diff --quiet && git diff --cached --quiet || { echo "✗ Commit your changes on main first"; exit 1; }

# Build the public tree from main without the unedited sprite originals
export GIT_INDEX_FILE="$(mktemp)"
git read-tree main
# Source art the game doesn't load (originals and intermediate clean-ups)
git rm -r --cached --quiet --ignore-unmatch "sprites unedited" cleaned
TREE=$(git write-tree)

# Block private words anywhere in the snapshot
if [ -f .publish-blocklist ]; then
  while IFS= read -r word; do
    [ -z "$word" ] && continue
    if git grep -i -q -e "$word" "$TREE" --; then
      echo "✗ Blocked word found in snapshot:"; git grep -i -l -e "$word" "$TREE" -- | sed 's/^/    /'
      rm -f "$GIT_INDEX_FILE"; exit 1
    fi
  done < .publish-blocklist
fi
rm -f "$GIT_INDEX_FILE"; unset GIT_INDEX_FILE

PARENT=$(git rev-parse -q --verify "$BRANCH" || true)
if [ -n "$PARENT" ] && [ "$(git rev-parse "$PARENT^{tree}")" = "$TREE" ]; then
  echo "✓ Nothing new to publish"; exit 0
fi

COMMIT=$(GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
         GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
         git commit-tree "$TREE" ${PARENT:+-p "$PARENT"} -m "$MSG")
git update-ref "refs/heads/$BRANCH" "$COMMIT"
git push "$REMOTE" "$BRANCH:main"
echo "✓ Published $COMMIT — the site updates in ~1 minute"
