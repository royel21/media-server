#!/bin/bash
#--enable-libfreetype
INPUT_VIDEO="$1"

# Configuration (change as needed)
COLS=4
ROWS=4
THUMB_WIDTH=320
OUTPUT_FILE="thumbnails_$(basename "${INPUT_VIDEO%.*}").jpg"
FONT=/usr/share/fonts/truetype/msttcorefonts/arial.ttf

# Extract video information
VIDEO_NAME=$(basename "$INPUT_VIDEO")
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT_VIDEO" | awk '{printf "%02d:%02d:%02d", $1/3600, ($1/60)%60, $1%60}')
SIZE=$(du -h "$INPUT_VIDEO" | cut -f1)
RESOLUTION=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$INPUT_VIDEO")
FRAMES=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$INPUT_VIDEO")
TOTAL_DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT_VIDEO")

# Calculate frame interval
FRAME_INTERVAL=$(( FRAMES / (COLS * ROWS) ))
[ $FRAME_INTERVAL -eq 0 ] && FRAME_INTERVAL=1

echo "Generating thumbnail sheet with ${COLS}x${ROWS} grid..."
echo "Video: $VIDEO_NAME | Duration: $DURATION | Size: $SIZE | Resolution: $RESOLUTION"

# Create a temp text file for the metadata
METADATA_TEXT="$VIDEO_NAME - Duration: $DURATION - Size: $SIZE - Resolution: $RESOLUTION"
echo "$METADATA_TEXT" > /tmp/metadata.txt

# Create a complex filter with timestamps on each frame
FILTER_COMPLEX="
select='not(mod(n,$FRAME_INTERVAL))',
scale=$THUMB_WIDTH:-2,
drawtext=fontfile=$FONT:text='%{pts\\:hms}':x=(w-tw)/2:y=h-th-5:fontsize=12:fontcolor=white:box=1:boxcolor=black@0.5,
tile=${COLS}x${ROWS},
drawtext=fontfile=$FONT:textfile=/tmp/metadata.txt:x=10:y=10:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5
"

ffmpeg -hide_banner -loglevel error -stats \
  -i "$INPUT_VIDEO" -filter_complex "$FILTER_COMPLEX" -frames:v 1 -q:v 2 "$OUTPUT_FILE" -y

# Clean up
rm /tmp/metadata.txt

echo "Thumbnail sheet saved as $OUTPUT_FILE"