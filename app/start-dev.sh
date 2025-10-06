#!/bin/bash

# Development startup script for CertChain
# This script starts both the backend and frontend servers

echo "🚀 Starting CertChain Development Environment..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check if required ports are available
echo "🔍 Checking port availability..."
check_port 4000 || exit 1
check_port 3000 || exit 1

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend server started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 CertChain is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:4000"
echo "📊 Dashboard: http://localhost:3000/dashboard"
echo "🔍 Verify:    http://localhost:3000/verify"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop the servers
wait