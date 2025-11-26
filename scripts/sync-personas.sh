#!/bin/bash

###############################################################################
# Persona Data Synchronization Script
#
# Purpose: Sync personas-v3.ts from workshop-pilot-system to profilecard
# Source of Truth: workshop-pilot-system/2-personas/personas-v3.ts
# Target: profilecard/src/data/personas.ts
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
SOURCE_FILE="$PROJECT_ROOT/workshop-pilot-system/2-personas/personas-v3.ts"
TARGET_FILE="$PROJECT_ROOT/profilecard/src/data/personas.ts"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Persona Data Synchronization${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ Error: Source file not found${NC}"
    echo -e "   Expected: $SOURCE_FILE"
    exit 1
fi

# Check if target file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo -e "${YELLOW}⚠️  Warning: Target file not found${NC}"
    echo -e "   Will create: $TARGET_FILE"
fi

# Display file info
echo -e "${BLUE}📄 Source (Master):${NC}"
echo -e "   File: workshop-pilot-system/2-personas/personas-v3.ts"
ls -lh "$SOURCE_FILE" | awk '{print "   Size: " $5 ", Modified: " $6 " " $7 " " $8}'
echo ""

if [ -f "$TARGET_FILE" ]; then
    echo -e "${BLUE}📄 Target (will be replaced):${NC}"
    echo -e "   File: profilecard/src/data/personas.ts"
    ls -lh "$TARGET_FILE" | awk '{print "   Size: " $5 ", Modified: " $6 " " $7 " " $8}'
    echo ""

    # Create backup
    BACKUP_FILE="${TARGET_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    cp "$TARGET_FILE" "$BACKUP_FILE"
    echo -e "   Backup: ${BACKUP_FILE##*/}"
    echo ""
fi

# Ask for confirmation
read -p "$(echo -e ${GREEN}Proceed with sync? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Sync cancelled${NC}"
    exit 0
fi

# Perform sync
echo -e "${GREEN}🔄 Syncing...${NC}"
cp "$SOURCE_FILE" "$TARGET_FILE"

# Verify
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sync completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Result:${NC}"
    ls -lh "$TARGET_FILE" | awk '{print "   Size: " $5 ", Modified: " $6 " " $7 " " $8}'
    echo ""

    # Count personas
    PERSONA_COUNT=$(grep -c "id: 'P0" "$TARGET_FILE" || echo "0")
    echo -e "   Total personas: ${GREEN}${PERSONA_COUNT}${NC}"
    echo ""

    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Sync Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
else
    echo -e "${RED}❌ Sync failed${NC}"
    exit 1
fi
