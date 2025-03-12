#!/bin/bash

# Launch the token manager demo using a simple HTTP server
# This script starts a server and opens the demo in a browser

echo "Starting server for Token Manager Demo..."

# Check if Python is available
if command -v python3 &>/dev/null; then
    echo "Using Python 3 HTTP server"
    cd "$(dirname "$0")" # Navigate to the script directory
    python3 -m http.server 8000 &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    
    # Wait a moment for the server to start
    sleep 1
    
    # Open the browser
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:8000/token-manager-demo.html
    elif command -v open &>/dev/null; then
        open http://localhost:8000/token-manager-demo.html
    else
        echo "Please open a browser and navigate to: http://localhost:8000/token-manager-demo.html"
    fi
    
    echo "Press Ctrl+C to stop the server"
    
    # Wait for user to press Ctrl+C
    trap "kill $SERVER_PID; echo 'Server stopped'; exit 0" INT
    wait $SERVER_PID
    
elif command -v npx &>/dev/null; then
    echo "Using npx serve"
    cd "$(dirname "$0")" # Navigate to the script directory
    npx serve &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    
    # Wait a moment for the server to start
    sleep 1
    
    # Open the browser
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:5000/token-manager-demo.html
    elif command -v open &>/dev/null; then
        open http://localhost:5000/token-manager-demo.html
    else
        echo "Please open a browser and navigate to: http://localhost:5000/token-manager-demo.html"
    fi
    
    echo "Press Ctrl+C to stop the server"
    
    # Wait for user to press Ctrl+C
    trap "kill $SERVER_PID; echo 'Server stopped'; exit 0" INT
    wait $SERVER_PID
    
else
    echo "Error: Neither Python 3 nor npx is available."
    echo "Please install Python 3 or Node.js to run this demo."
    echo "Alternatively, you can open the token-manager-demo.html file directly in your browser."
    exit 1
fi
