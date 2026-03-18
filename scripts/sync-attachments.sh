#!/usr/bin/env bash
# sync-attachments.sh
# Copies recent image attachments from Messages into the OpenClaw inbox.
# Triggered by launchd WatchPaths on ~/Library/Messages/Attachments/.
# Filters: images only, max 25MB, skips already-copied files.

set -euo pipefail

SRC="$HOME/Library/Messages/Attachments"
DEST="$HOME/.openclaw/workspace-main/inbox"
MAX_BYTES=$((25 * 1024 * 1024))  # 25 MB
ALLOWED_EXTS="jpg jpeg png gif webp heic heif"

mkdir -p "$DEST"

# Find files modified in the last 5 minutes
find "$SRC" -type f -newer <(date -v-5M +%s | xargs -I{} date -r {} 2>/dev/null || date -d "5 minutes ago") 2>/dev/null | \
while IFS= read -r file; do
  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  # Check extension
  allowed=0
  for e in $ALLOWED_EXTS; do
    [ "$ext_lower" = "$e" ] && allowed=1 && break
  done
  [ "$allowed" -eq 0 ] && continue

  # Check file size
  size=$(stat -f%z "$file" 2>/dev/null || echo 0)
  [ "$size" -gt "$MAX_BYTES" ] && continue
  [ "$size" -eq 0 ] && continue

  # Build dest filename: timestamp + original name, avoid collisions
  basename_file=$(basename "$file")
  timestamp=$(date +%Y%m%d-%H%M%S)
  dest_file="$DEST/${timestamp}_${basename_file}"

  # Skip if already exists (same name+size)
  if [ -f "$dest_file" ]; then
    dest_size=$(stat -f%z "$dest_file" 2>/dev/null || echo 0)
    [ "$dest_size" -eq "$size" ] && continue
  fi

  cp "$file" "$dest_file"
  echo "$(date '+%Y-%m-%d %H:%M:%S') copied: $dest_file" >> "$DEST/.sync.log"
done
