#!/bin/bash

# 🤖 Test AI Bot Locally
# Quick script to test the AI bot before deploying

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header "🤖 Testing AI Bot Locally"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found!"
    print_info "Creating from .env.example..."
    cp .env.example .env.local
    print_warning "Please edit .env.local with your values"
    exit 1
fi

# Load environment variables safely
if [ -f .env.local ]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^\s*# ]] || [[ -z "$line" ]]; then
      continue
    fi
    export "$line"
  done < .env.local
fi

# Check required variables
print_info "Checking environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
    print_error "OPENAI_API_KEY not set in .env.local"
    exit 1
fi
print_success "OPENAI_API_KEY set"

if [ -z "$AI_BOT_PRIVATE_KEY" ]; then
    print_error "AI_BOT_PRIVATE_KEY not set in .env.local"
    exit 1
fi
print_success "AI_BOT_PRIVATE_KEY set"

if [ -z "$NEXT_PUBLIC_AIORACLE_ADDRESS" ]; then
    print_error "NEXT_PUBLIC_AIORACLE_ADDRESS not set in .env.local"
    exit 1
fi
print_success "NEXT_PUBLIC_AIORACLE_ADDRESS set"

# Test OpenAI API
print_info "Testing OpenAI API..."
OPENAI_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
    https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY")

if [ "$OPENAI_TEST" = "200" ]; then
    print_success "OpenAI API key is valid"
else
    print_error "OpenAI API key is invalid (HTTP $OPENAI_TEST)"
    exit 1
fi

# Run bot once
print_header "Running AI Bot (One-time)"
print_info "This will check for markets ready for resolution..."
echo ""

pnpm ai-bot

echo ""
print_success "Bot test complete!"
echo ""

# Ask if user wants to run in watch mode
read -p "Run in watch mode? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting bot in watch mode..."
    print_warning "Press Ctrl+C to stop"
    echo ""
    pnpm ai-bot:watch
fi

