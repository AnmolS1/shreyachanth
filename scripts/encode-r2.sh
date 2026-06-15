#!/usr/bin/env bash
# encode-r2.sh — Encode source MOVs into R2-ready full + preview files.
#
# Outputs to r2-upload/ (staging, git-ignored) — NOT to public/.
#
#   Full version (lightbox):  r2-upload/videos/full/<id>.mp4 + .webm
#     Source-length (no -t), up to 1080px wide, with audio.
#
#   Preview version (tile hover): r2-upload/videos/preview/<id>.mp4 + .webm
#     Muted (-an), 8s cap (-t 8), up to 640px wide.
#
# Logs before/after sizes for each reel.
# Usage: bash scripts/encode-r2.sh

set -uo pipefail

FFMPEG="/opt/homebrew/bin/ffmpeg"
if [[ ! -x "$FFMPEG" ]]; then
	FFMPEG="$(command -v ffmpeg || true)"
fi
if [[ -z "$FFMPEG" ]]; then
	echo "ERROR: ffmpeg not found. Install with: brew install ffmpeg"
	exit 1
fi
echo "ffmpeg: $FFMPEG"

FULL="r2-upload/videos/full"
PREVIEW="r2-upload/videos/preview"
mkdir -p "$FULL" "$PREVIEW"

# Print file size in a human-readable format
size_of() {
	local f="$1"
	if [[ -f "$f" ]]; then
		du -sh "$f" | cut -f1
	else
		echo "MISSING"
	fi
}

encode() {
	local ID="$1"
	local SRC="$2"
	local FULL_SCALE="$3"   # e.g. "min(1080,iw)" for landscape, "min(1080,ih)" not needed — source width drives
	local PREV_SCALE="$4"   # e.g. "min(640,iw)"

	if [[ ! -f "$SRC" ]]; then
		echo "WARN: source not found: $SRC — skipping $ID"
		return
	fi

	local SRC_SIZE
	SRC_SIZE=$(size_of "$SRC")
	echo ""
	echo "━━━ $ID  (source: $SRC_SIZE)"

	# ── Full: MP4 ────────────────────────────────────────────────────────────────
	# Single-quote the scale expression so ffmpeg's filter parser treats the comma
	# inside min(N,iw) as literal rather than a filter-chain separator.
	local FULL_MP4="$FULL/${ID}.mp4"
	echo "  ▸ full MP4..."
	"$FFMPEG" -y -i "$SRC" \
		-vf "scale='${FULL_SCALE}':-2,format=yuv420p" \
		-c:v libx264 -preset slow -crf 21 \
		-c:a aac -b:a 160k \
		-movflags +faststart \
		"$FULL_MP4" 2>/dev/null \
		&& echo "    ✓ full MP4:  $SRC_SIZE → $(size_of "$FULL_MP4")" \
		|| { echo "    ✗ full MP4 FAILED"; return 1; }

	# ── Full: WebM ───────────────────────────────────────────────────────────────
	local FULL_WEBM="$FULL/${ID}.webm"
	echo "  ▸ full WebM..."
	"$FFMPEG" -y -i "$SRC" \
		-vf "scale='${FULL_SCALE}':-2" \
		-c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 \
		-c:a libopus -b:a 128k \
		"$FULL_WEBM" 2>/dev/null \
		&& echo "    ✓ full WebM: $SRC_SIZE → $(size_of "$FULL_WEBM")" \
		|| { echo "    ✗ full WebM FAILED"; return 1; }

	# ── Preview: MP4 (muted, ≤8s, 640px) ────────────────────────────────────────
	local PREV_MP4="$PREVIEW/${ID}.mp4"
	echo "  ▸ preview MP4..."
	"$FFMPEG" -y -i "$SRC" \
		-t 8 -an \
		-vf "scale='${PREV_SCALE}':-2,format=yuv420p" \
		-c:v libx264 -preset fast -crf 28 \
		-movflags +faststart \
		"$PREV_MP4" 2>/dev/null \
		&& echo "    ✓ preview MP4:  $SRC_SIZE → $(size_of "$PREV_MP4")" \
		|| { echo "    ✗ preview MP4 FAILED"; return 1; }

	# ── Preview: WebM ────────────────────────────────────────────────────────────
	local PREV_WEBM="$PREVIEW/${ID}.webm"
	echo "  ▸ preview WebM..."
	"$FFMPEG" -y -i "$SRC" \
		-t 8 -an \
		-vf "scale='${PREV_SCALE}':-2" \
		-c:v libvpx-vp9 -crf 36 -b:v 0 -deadline good -cpu-used 4 \
		"$PREV_WEBM" 2>/dev/null \
		&& echo "    ✓ preview WebM: $SRC_SIZE → $(size_of "$PREV_WEBM")" \
		|| { echo "    ✗ preview WebM FAILED"; return 1; }
}

echo "=== Encoding 15 reels for R2 ==="

# Landscape (1920×1080) — cap at 1080px wide
encode "reel-01" "videos/copy_3A8B6470-0503-4512-B80A-8CB3D55B9F33.MOV" "min(1080,iw)" "min(640,iw)"
encode "reel-05" "videos/copy_A586A7E4-2392-4043-A2AB-68687D796325.MOV" "min(1080,iw)" "min(640,iw)"

# Portrait 576×1024 — cap at 1080px (height drives; width is already 576)
encode "reel-02" "videos/v15044gf0000d5k6savog65mbb3vkmt0.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-03" "videos/v15044gf0000d5niv9nog65t30n1sn80.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-04" "videos/v15044gf0000d5s5fqfog65l9l99npvg.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-06" "videos/v15044gf0000d603onnog65l74l2tp9g.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-07" "videos/v15044gf0000d62uun7og65gf3fv73ag.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-08" "videos/v15044gf0000d6bcanfog65ldgrk1chg.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-09" "videos/v15044gf0000d6eesl7og65unriceot0.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-11" "videos/v15044gf0000d6gebo7og65h2q8825g0.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-14" "videos/v15044gf0000d6k7chvog65sec4rno3g.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-15" "videos/v15044gf0000d6n5lpvog65sec0a35ig.mov" "min(1080,iw)" "min(640,iw)"
# Portrait 536×960
encode "reel-12" "videos/v15044gf0000d6igrunog65r9agujk60.mov" "min(1080,iw)" "min(640,iw)"

# Portrait 720×1280
encode "reel-10" "videos/v15044gf0000d6sgmqfog65ggfekejng.mov" "min(1080,iw)" "min(640,iw)"
encode "reel-13" "videos/ef2bbe89646447adaa2978212ba34536.mov" "min(1080,iw)" "min(640,iw)"

echo ""
echo "=== Encode complete ==="
echo "Full MP4:     $(ls $FULL/*.mp4  2>/dev/null | wc -l | tr -d ' ')/15"
echo "Full WebM:    $(ls $FULL/*.webm 2>/dev/null | wc -l | tr -d ' ')/15"
echo "Preview MP4:  $(ls $PREVIEW/*.mp4  2>/dev/null | wc -l | tr -d ' ')/15"
echo "Preview WebM: $(ls $PREVIEW/*.webm 2>/dev/null | wc -l | tr -d ' ')/15"
echo ""
echo "Staging dir sizes:"
du -sh r2-upload/videos/full r2-upload/videos/preview 2>/dev/null
echo ""
echo "Next: bash scripts/upload-r2.sh"
