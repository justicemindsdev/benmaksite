#!/bin/bash

# Run the token limit workaround test script
# This script executes the Node.js test for the ChatTokenManager

echo "Running Token Limit Workaround Test..."

# Check if Node.js is available
if command -v node &>/dev/null; then
    # Navigate to the script directory
    cd "$(dirname "$0")"
    
    # Run the test script
    node token-limit-test.js
else
    echo "Error: Node.js is not installed."
    echo "Please install Node.js to run this test."
    exit 1
fi
