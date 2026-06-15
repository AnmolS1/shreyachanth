#!/usr/bin/env bash
# T14 — Video pipeline: transcode 16 source MOV files to MP4 + WebM + poster webp
set -uo pipefail

OUT_VIDEO="public/videos"
OUT_POSTER="public/posters"
mkdir -p "$OUT_VIDEO" "$OUT_POSTER"

encode() {
  local ID="$1"
  local SRC="$2"
  local SCALE="$3"  # e.g. "640:-2" or "360:-2"

  if [[ ! -f "$SRC" ]]; then
    echo "WARN: source not found: $SRC — skipping $ID"
    return
  fi

  local MP4="$OUT_VIDEO/${ID}.mp4"
  local WEBM="$OUT_VIDEO/${ID}.webm"
  local POSTER="$OUT_POSTER/${ID}.webp"

  echo "▸ ${ID}: MP4..."
  ffmpeg -y -i "$SRC" -t 8 -vf "scale=${SCALE},format=yuv420p" \
    -c:v libx264 -preset fast -crf 26 -c:a aac -b:a 128k -movflags +faststart "$MP4" 2>/dev/null \
    && echo "  ✓ MP4 $(du -sh "$MP4" | cut -f1)" || echo "  ✗ MP4 failed"

  echo "▸ ${ID}: WebM..."
  ffmpeg -y -i "$SRC" -t 8 -vf "scale=${SCALE}" \
    -c:v libvpx-vp9 -crf 36 -b:v 0 -deadline good -cpu-used 4 -c:a libopus -b:a 128k "$WEBM" 2>/dev/null \
    && echo "  ✓ WebM $(du -sh "$WEBM" | cut -f1)" || echo "  ✗ WebM failed"

  echo "▸ ${ID}: poster..."
  ffmpeg -y -i "$SRC" -ss 0.5 -frames:v 1 -vf "scale=${SCALE}" "$POSTER" 2>/dev/null \
    && echo "  ✓ poster $(du -sh "$POSTER" | cut -f1)" || echo "  ✗ poster failed"
}

echo "=== Transcoding 15 reels ==="

# Landscape (1920x1080) → scale 640w
encode "reel-01" "videos/copy_3A8B6470-0503-4512-B80A-8CB3D55B9F33.MOV" "640:-2"
encode "reel-05" "videos/copy_A586A7E4-2392-4043-A2AB-68687D796325.MOV" "640:-2"

# Portrait 576x1024 → scale 360w
encode "reel-02" "videos/v15044gf0000d5k6savog65mbb3vkmt0.mov" "360:-2"
encode "reel-03" "videos/v15044gf0000d5niv9nog65t30n1sn80.mov" "360:-2"
encode "reel-04" "videos/v15044gf0000d5s5fqfog65l9l99npvg.mov" "360:-2"
encode "reel-06" "videos/v15044gf0000d603onnog65l74l2tp9g.mov" "360:-2"
encode "reel-07" "videos/v15044gf0000d62uun7og65gf3fv73ag.mov" "360:-2"
encode "reel-08" "videos/v15044gf0000d6bcanfog65ldgrk1chg.mov" "360:-2"
encode "reel-09" "videos/v15044gf0000d6eesl7og65unriceot0.mov" "360:-2"
encode "reel-11" "videos/v15044gf0000d6gebo7og65h2q8825g0.mov" "360:-2"
encode "reel-14" "videos/v15044gf0000d6k7chvog65sec4rno3g.mov" "360:-2"
encode "reel-15" "videos/v15044gf0000d6n5lpvog65sec0a35ig.mov" "360:-2"
# Portrait 536x960 → scale 360w
encode "reel-12" "videos/v15044gf0000d6igrunog65r9agujk60.mov" "360:-2"

# Portrait 720x1280 → scale 360w
encode "reel-10" "videos/v15044gf0000d6sgmqfog65ggfekejng.mov" "360:-2"
encode "reel-13" "videos/ef2bbe89646447adaa2978212ba34536.mov" "360:-2"

echo ""
echo "=== Done ==="
echo "Videos: $(ls $OUT_VIDEO/*.mp4 2>/dev/null | wc -l | tr -d ' ') MP4, $(ls $OUT_VIDEO/*.webm 2>/dev/null | wc -l | tr -d ' ') WebM"
echo "Posters: $(ls $OUT_POSTER/*.webp 2>/dev/null | wc -l | tr -d ' ') webp"
