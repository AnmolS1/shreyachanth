#!/usr/bin/env bash
# upload-r2.sh — Upload r2-upload/ staging files to Cloudflare R2 bucket shreyamedia.
#
# Prerequisites:
#   1. bash scripts/encode-r2.sh has completed successfully.
#   2. wrangler is authenticated with R2 read/write scope:
#        ! wrangler login   (then re-run: ! wrangler r2 bucket list)
#
# Uploads sequentially: full MP4 → full WebM → preview MP4 → preview WebM, per reel.
# Stops immediately on any failure (do not proceed to source-ref updates until clean).
#
# Usage: bash scripts/upload-r2.sh

set -uo pipefail

BUCKET="shreyamedia"
FULL="r2-upload/videos/full"
PREVIEW="r2-upload/videos/preview"

# Verify staging dir exists
if [[ ! -d "$FULL" || ! -d "$PREVIEW" ]]; then
  echo "ERROR: r2-upload/ staging not found. Run: bash scripts/encode-r2.sh first."
  exit 1
fi

REELS=(
  reel-01 reel-02 reel-03 reel-04 reel-05
  reel-06 reel-07 reel-08 reel-09 reel-10
  reel-11 reel-12 reel-13 reel-14 reel-15
)

put() {
  local KEY="$1"
  local FILE="$2"
  local CT="$3"

  if [[ ! -f "$FILE" ]]; then
    echo "  ERROR: local file not found: $FILE"
    exit 1
  fi

  echo "  → $KEY"
  npx wrangler r2 object put "${BUCKET}/${KEY}" \
    --file "$FILE" \
    --content-type "$CT" \
    --remote \
    --force 2>&1
  local CODE=$?
  if [[ $CODE -ne 0 ]]; then
    echo "  UPLOAD FAILED (exit $CODE) for $KEY — stopping."
    exit $CODE
  fi
}

echo "=== Uploading to R2 bucket: $BUCKET ==="
echo "(60 objects: 15 reels × 4 formats)"
echo ""

OK=0
for ID in "${REELS[@]}"; do
  echo "━━━ $ID"
  put "videos/full/${ID}.mp4"     "$FULL/${ID}.mp4"     "video/mp4"
  put "videos/full/${ID}.webm"    "$FULL/${ID}.webm"    "video/webm"
  put "videos/preview/${ID}.mp4"  "$PREVIEW/${ID}.mp4"  "video/mp4"
  put "videos/preview/${ID}.webm" "$PREVIEW/${ID}.webm" "video/webm"
  echo "  ✓ $ID complete"
  OK=$((OK + 1))
done

echo ""
echo "=== Upload complete: $OK/15 reels ==="
echo "All 60 objects uploaded to https://media.shreyachanth.com/videos/"
echo ""
echo "Next: update src/content/video.ts references, then:"
echo "  npm run build && npm run dev:pages"
