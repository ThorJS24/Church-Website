#!/bin/bash

# Salem Primitive Baptist Church - Auto Setup Script
# Works on Linux, macOS, and WSL

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Salem Primitive Baptist Church${NC}"
echo -e "${GREEN}  Automated Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found. Please install Node.js 18+ first.${NC}"
    echo "Download from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found ($(npm --version))${NC}"

# Install dependencies
echo
echo -e "${YELLOW}Installing dependencies...${NC}"
if ! npm install; then
    echo -e "${RED}Error: Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build project
echo
echo -e "${YELLOW}Building project...${NC}"
if ! npm run build; then
    echo -e "${RED}Error: Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project built successfully${NC}"

# Clean up
echo
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf .next node_modules/.cache 2>/dev/null
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Success message
echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 SETUP COMPLETE! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Run: ${YELLOW}npm run dev${NC}"
echo -e "2. Open: ${YELLOW}http://localhost:3000${NC}"
echo -e "3. Login with: ${YELLOW}admin@salemprimitivebaptist.org${NC}"
echo
echo -e "${BLUE}Your church website is ready! 🙏${NC}"
echo

# Ask to start dev server
read -p "Start development server now? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo
    echo -e "${YELLOW}Starting development server...${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
    echo
    npm run dev
fi