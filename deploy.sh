#!/bin/bash

# ASH Educational Center - Quick Deploy Script
# This script helps deploy the project to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ASH Educational Center - Deployment Script${NC}"

# Function to display menu
show_menu() {
    echo -e "\n${YELLOW}Choose deployment platform:${NC}"
    echo -e "${GREEN}1)${NC} Vercel (Frontend only)"
    echo -e "${GREEN}2)${NC} Railway (Full stack - Recommended)"
    echo -e "${GREEN}3)${NC} Render (Full stack)"
    echo -e "${GREEN}4)${NC} Heroku (Full stack)"
    echo -e "${GREEN}5)${NC} DigitalOcean (Full control)"
    echo -e "${GREEN}6)${NC} Local development setup"
    echo -e "${GREEN}7)${NC} Exit"
    echo -ne "\n${YELLOW}Enter choice [1-7]:${NC} "
}

# Function to check if running
check_running() {
    if pgrep -f "node server.js" > /dev/null; then
        echo -e "${RED}⚠️  Server is already running!${NC}"
        echo -e "${YELLOW}Stop the server first with: pkill -f 'node server.js'${NC}"
        return 1
    fi
    return 0
}

# Function to setup environment
setup_env() {
    echo -e "\n${BLUE}🔧 Setting up environment...${NC}"
    
    # Create .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cat > backend/.env << EOF
NODE_ENV=production
PORT=8080
SESSION_SECRET=ash-educational-$(date +%s)-secret-key
DATABASE_URL=./ash_database.db
EOF
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${YELLOW}.env file already exists${NC}"
    fi
}

# Function to install dependencies
install_deps() {
    echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
    cd backend
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
}

# Function to start development server
start_dev() {
    echo -e "\n${GREEN}🚀 Starting development server...${NC}"
    cd backend
    npm run dev
}

# Function to deploy to Railway
deploy_railway() {
    echo -e "\n${BLUE}🚂 Deploying to Railway...${NC}"
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}Installing Railway CLI...${NC}"
        npm install -g @railway/cli
    fi
    
    # Deploy
    cd backend
    railway up
    echo -e "${GREEN}✅ Deployment initiated! Check Railway dashboard for status.${NC}"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "\n${BLUE}▲ Deploying frontend to Vercel...${NC}"
    
    cd ASH-Educational-system
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    echo -e "${GREEN}✅ Frontend deployed! Check Vercel dashboard for URL.${NC}"
}

# Function to create production build
create_build() {
    echo -e "\n${BLUE}🏗 Creating production build...${NC}"
    
    # Minify CSS and JS (basic optimization)
    echo -e "${YELLOW}Optimizing assets...${NC}"
    
    cd backend
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
}

# Function to show deployment status
show_status() {
    echo -e "\n${BLUE}📊 Deployment Status:${NC}"
    echo -e "${GREEN}✅ Backend: Node.js + Express + SQLite${NC}"
    echo -e "${GREEN}✅ Frontend: HTML5 + CSS3 + JavaScript${NC}"
    echo -e "${GREEN}✅ Database: SQLite with WAL mode${NC}"
    echo -e "${GREEN}✅ Admin Dashboard: Full management interface${NC}"
}

# Main menu loop
main() {
    # Check if server is running
    if check_running; then
        return 1
    fi
    
    while true; do
        show_menu
        read choice
        case $choice in
            1)
                deploy_vercel
                ;;
            2)
                setup_env
                install_deps
                deploy_railway
                ;;
            3)
                echo -e "${YELLOW}⚠️  Render deployment - Follow DEPLOYMENT.md for detailed instructions${NC}"
                ;;
            4)
                echo -e "${YELLOW}⚠️  Heroku deployment - Follow DEPLOYMENT.md for detailed instructions${NC}"
                ;;
            5)
                echo -e "${YELLOW}⚠️  DigitalOcean deployment - Follow DEPLOYMENT.md for detailed instructions${NC}"
                ;;
            6)
                setup_env
                install_deps
                start_dev
                ;;
            7)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
                ;;
        esac
    done
}

# Run main function
main
