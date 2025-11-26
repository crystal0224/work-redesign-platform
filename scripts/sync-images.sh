#!/bin/bash

###############################################################################
# Persona Images Synchronization Script
#
# Purpose: Sync persona images from profile/ to profilecard/public/images/personas/
# Source: profile/001.jpg ~ 030.jpg
# Target: profilecard/public/images/personas/P001.jpg ~ P030.jpg
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/Users/crystal/Desktop/work-redesign-platform"
SOURCE_DIR="$PROJECT_ROOT/profile"
TARGET_DIR="$PROJECT_ROOT/profilecard/public/images/personas"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Persona Images Synchronization${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: Source directory not found${NC}"
    echo -e "   Expected: $SOURCE_DIR"
    exit 1
fi

# Check if target directory exists, create if not
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}⚠️  Creating target directory...${NC}"
    mkdir -p "$TARGET_DIR"
fi

# Count source images
SOURCE_COUNT=$(ls -1 "$SOURCE_DIR"/*.jpg 2>/dev/null | wc -l | tr -d ' ')

echo -e "${BLUE}📸 Source Images:${NC}"
echo -e "   Directory: profile/"
echo -e "   Format: 001.jpg ~ 030.jpg"
echo -e "   Count: ${GREEN}${SOURCE_COUNT}${NC} images"
echo ""

# Count existing target images
TARGET_COUNT=$(ls -1 "$TARGET_DIR"/P*.jpg 2>/dev/null | wc -l | tr -d ' ')

echo -e "${BLUE}📸 Target Images:${NC}"
echo -e "   Directory: profilecard/public/images/personas/"
echo -e "   Format: P001.jpg ~ P030.jpg"
echo -e "   Current count: ${YELLOW}${TARGET_COUNT}${NC} images"
echo ""

# Ask for confirmation
read -p "$(echo -e ${GREEN}Proceed with image sync? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Sync cancelled${NC}"
    exit 0
fi

# Sync images
echo -e "${GREEN}🔄 Syncing images...${NC}"
echo ""

SYNCED=0
FAILED=0

for i in {1..30}; do
    # Format: 001 -> P001
    SOURCE_NUM=$(printf "%03d" $i)
    TARGET_NUM=$(printf "P%03d" $i)

    SOURCE_FILE="$SOURCE_DIR/${SOURCE_NUM}.jpg"
    TARGET_FILE="$TARGET_DIR/${TARGET_NUM}.jpg"

    if [ -f "$SOURCE_FILE" ]; then
        cp "$SOURCE_FILE" "$TARGET_FILE"
        if [ $? -eq 0 ]; then
            echo -e "   ✓ ${SOURCE_NUM}.jpg → ${TARGET_NUM}.jpg"
            ((SYNCED++))
        else
            echo -e "   ${RED}✗ Failed: ${SOURCE_NUM}.jpg${NC}"
            ((FAILED++))
        fi
    else
        echo -e "   ${YELLOW}⊗ Missing: ${SOURCE_NUM}.jpg${NC}"
    fi
done

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  Sync Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   Synced: ${GREEN}${SYNCED}${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "   Failed: ${RED}${FAILED}${NC}"
fi
echo ""

# Verify final count
FINAL_COUNT=$(ls -1 "$TARGET_DIR"/P*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo -e "   Total images in profilecard: ${GREEN}${FINAL_COUNT}${NC}"
