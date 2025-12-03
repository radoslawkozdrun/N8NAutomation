#!/bin/bash

echo "====================================="
echo "  FlowCraft - Rebuild and Start"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill processes
kill_processes() {
    echo -e "${RED}🛑 Zatrzymywanie istniejących procesów...${NC}"

    # Kill node processes
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true

    # Wait a moment for processes to die
    sleep 2
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Instalowanie zależności frontend...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Błąd przy instalacji zależności frontend${NC}"
        exit 1
    fi

    echo -e "${BLUE}📦 Instalowanie zależności backend...${NC}"
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Błąd przy instalacji zależności backend${NC}"
        cd ..
        exit 1
    fi
    cd ..
}

# Function to build frontend
build_frontend() {
    echo -e "${BLUE}🏗️ Budowanie frontend...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Błąd przy budowaniu frontend${NC}"
        exit 1
    fi
}

# Function to run linting
run_linting() {
    echo -e "${BLUE}🧹 Sprawdzanie jakości kodu...${NC}"
    npm run lint
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Znaleziono problemy z jakością kodu${NC}"
        read -p "Kontynuować? (t/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Tt]$ ]]; then
            exit 1
        fi
    fi
}

# Function to start servers
start_servers() {
    echo ""
    echo -e "${GREEN}🚀 Uruchamianie serwerów...${NC}"
    echo ""

    if command_exists tmux; then
        echo -e "${GREEN}🚀 Uruchamianie z tmux...${NC}"

        # Kill existing session if it exists
        tmux kill-session -t flowcraft-dev 2>/dev/null || true

        # Create new tmux session
        tmux new-session -d -s flowcraft-dev

        # Backend window
        tmux rename-window -t flowcraft-dev:0 'Backend'
        tmux send-keys -t flowcraft-dev:0 'cd backend && npm run dev:api' Enter

        # Frontend window
        tmux new-window -t flowcraft-dev -n 'Frontend'
        tmux send-keys -t flowcraft-dev:1 'npm run dev' Enter

        # Status window
        tmux new-window -t flowcraft-dev -n 'Status'
        tmux send-keys -t flowcraft-dev:2 'echo "Development servers status:"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "📡 Backend API: http://localhost:8002"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "🌐 Frontend: http://localhost:5173"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo ""' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "ℹ️  Sprawdź konsolę przeglądarki pod kątem błędów JavaScript"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "ℹ️  Przetestuj funkcjonalność aplikacji"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo ""' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "Commands:"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "  Ctrl+B, 0 - Backend window"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "  Ctrl+B, 1 - Frontend window"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "  Ctrl+B, 2 - Status window"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "  Ctrl+B, d - Detach session"' Enter
        tmux send-keys -t flowcraft-dev:2 'echo "  tmux attach -t flowcraft-dev - Reattach"' Enter

        # Attach to session
        tmux attach-session -t flowcraft-dev

    else
        echo -e "${GREEN}🔄 Uruchamianie z procesami w tle...${NC}"

        # Start backend
        echo "Uruchamianie backend API server..."
        cd backend && npm run dev:api &
        BACKEND_PID=$!

        # Wait a bit
        sleep 5

        # Go back to root directory
        cd ..

        # Start frontend
        echo "Uruchamianie frontend dev server..."
        npm run dev &
        FRONTEND_PID=$!

        echo ""
        echo -e "${GREEN}✅ Serwery zostały uruchomione:${NC}"
        echo -e "📡 Backend API: http://localhost:8002 (PID: $BACKEND_PID)"
        echo -e "🌐 Frontend: http://localhost:5173"
        echo ""
        echo -e "${YELLOW}ℹ️  Sprawdź konsolę przeglądarki pod kątem błędów JavaScript${NC}"
        echo -e "${YELLOW}ℹ️  Przetestuj funkcjonalność aplikacji${NC}"
        echo ""
        echo "Naciśnij Ctrl+C aby zatrzymać wszystkie serwery..."

        # Wait for interrupt
        trap "echo -e '${RED}Zatrzymywanie serwerów...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
        wait
    fi
}

# Main execution
main() {
    kill_processes
    echo ""
    echo -e "${BLUE}🔧 Przebudowywanie aplikacji...${NC}"
    echo ""

    install_dependencies
    build_frontend
    run_linting

    echo ""
    echo -e "${GREEN}✅ Przebudowa zakończona pomyślnie!${NC}"
    echo ""

    start_servers
}

# Run main function
main