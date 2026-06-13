#!/bin/bash

# Local development server
echo "🚀 Starting Uexam local server..."
echo "📍 http://localhost:8080"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ 'dist' folder not found. Please run: npm run build:standalone"
    exit 1
fi

# Start server
echo "\n✅ Server running at http://localhost:8080"
echo "Press Ctrl+C to stop\n"
npx http-server dist/ -p 8080 -o
