#!/usr/bin/env bash

set -euo pipefail

if [[ ${1:-} == "--" ]]; then
  shift
fi

if [[ $# -lt 2 || $# -gt 5 ]]; then
  echo "Usage: pnpm demo:media -- <input.mov> <slug> [start-seconds] [duration-seconds] [poster-offset-seconds]"
  exit 1
fi

input_path=$1
output_slug=$2
start_seconds=${3:-0}
duration_seconds=${4:-12}
poster_offset_seconds=${5:-2}
output_directory="public/media"
output_video="${output_directory}/demo-${output_slug}.mp4"
output_poster="${output_directory}/demo-${output_slug}.webp"

if [[ ! -f "$input_path" ]]; then
  echo "Demo source does not exist: $input_path"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to process product demos."
  exit 1
fi

mkdir -p "$output_directory"

ffmpeg \
  -hide_banner \
  -loglevel error \
  -y \
  -ss "$start_seconds" \
  -i "$input_path" \
  -t "$duration_seconds" \
  -an \
  -vf "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x10110f,format=yuv420p" \
  -c:v libx264 \
  -preset medium \
  -crf 24 \
  -movflags +faststart \
  "$output_video"

ffmpeg \
  -hide_banner \
  -loglevel error \
  -y \
  -ss "$poster_offset_seconds" \
  -i "$output_video" \
  -frames:v 1 \
  -c:v libwebp \
  -quality 82 \
  -compression_level 6 \
  "$output_poster"

echo "Created $output_video"
echo "Created $output_poster"
