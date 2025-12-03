#!/bin/bash

echo "====================================="
echo "  N8N Automation - Local Development"
echo "====================================="
echo ""
echo "Starting development servers..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're in tmux or screen
if command_exists tmux; then
    echo "🚀 Starting with tmux (recommended)..."
    
    # Create new tmux session
    tmux new-session -d -s n8n-dev
    
    # Backend window
    tmux rename-window -t n8n-dev:0 'Backend'
    tmux send-keys -t n8n-dev:0 'cd backend && npm run dev:api' Enter
    
    # Frontend window  
    tmux new-window -t n8n-dev -n 'Frontend'
    tmux send-keys -t n8n-dev:1 'npm run dev' Enter
    
    # Status window
    tmux new-window -t n8n-dev -n 'Status'
    tmux send-keys -t n8n-dev:2 'echo "Development servers status:"' Enter
    tmux send-keys -t n8n-dev:2 'echo "📡 Backend API: http://localhost:8002"' Enter  
    tmux send-keys -t n8n-dev:2 'echo "🌐 Frontend: http://localhost:3000"' Enter
    tmux send-keys -t n8n-dev:2 'echo ""' Enter
    tmux send-keys -t n8n-dev:2 'echo "Commands:"' Enter
    tmux send-keys -t n8n-dev:2 'echo "  Ctrl+B, 0 - Backend window"' Enter
    tmux send-keys -t n8n-dev:2 'echo "  Ctrl+B, 1 - Frontend window"' Enter
    tmux send-keys -t n8n-dev:2 'echo "  Ctrl+B, 2 - Status window"' Enter
    tmux send-keys -t n8n-dev:2 'echo "  Ctrl+B, d - Detach session"' Enter
    tmux send-keys -t n8n-dev:2 'echo "  tmux attach -t n8n-dev - Reattach"' Enter
    
    # Attach to session
    tmux attach-session -t n8n-dev
    
else
    echo "🔄 Starting with background processes..."
    
    # Start backend
    echo "Starting backend API server..."
    cd backend && npm run dev:api &
    BACKEND_PID=$!
    
    # Wait a bit
    sleep 3
    
    # Go back to root directory
    cd ..
    
    # Start frontend
    echo "Starting frontend dev server..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Development servers started:"
    echo "📡 Backend API: http://localhost:8002 (PID: $BACKEND_PID)"
    echo "🌐 Frontend: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop all servers..."
    
    # Wait for interrupt
    trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi