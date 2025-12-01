#!/bin/bash

# Supabase Backup Restore Script
# This script helps restore a Supabase backup to a new project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Supabase Backup Restore Script${NC}"
echo "=================================="
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}psql not found in PATH. Adding PostgreSQL@16 to PATH...${NC}"
    export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi

# Check if psql is now available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed. Please install PostgreSQL first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ psql is available${NC}"
echo ""

# Prompt for backup file
read -p "Enter the path to your backup file (e.g., ./backup_name.backup or ./backup_name.backup.gz): " BACKUP_FILE

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Backup file is gzipped. Unzipping...${NC}"
    UNZIPPED_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$UNZIPPED_FILE"
    BACKUP_FILE="$UNZIPPED_FILE"
    echo -e "${GREEN}✓ Unzipped to: $BACKUP_FILE${NC}"
fi

# Prompt for connection string
echo ""
echo "Enter your Supabase connection string."
echo "You can find this in your project dashboard under Settings → Database → Connection string"
echo "Use the Session pooler connection string (recommended)"
echo ""
read -p "Connection string: " CONNECTION_STRING

if [ -z "$CONNECTION_STRING" ]; then
    echo -e "${RED}Error: Connection string is required${NC}"
    exit 1
fi

# Confirm before proceeding
echo ""
echo -e "${YELLOW}Ready to restore backup:${NC}"
echo "  Backup file: $BACKUP_FILE"
echo "  Target: $CONNECTION_STRING"
echo ""
read -p "Proceed with restore? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Restore the backup
echo ""
echo -e "${GREEN}Restoring backup...${NC}"
psql "$CONNECTION_STRING" -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Backup restored successfully!${NC}"
    echo ""
    echo "Note: Some errors about 'object already exists' are expected and can be ignored."
    echo "These occur because Supabase projects already have some default schemas."
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the new project credentials"
    echo "2. If you have storage files, you'll need to migrate them separately"
else
    echo ""
    echo -e "${RED}✗ Restore failed. Please check the error messages above.${NC}"
    exit 1
fi



