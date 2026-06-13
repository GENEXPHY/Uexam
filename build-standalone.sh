#!/bin/bash

# Build script untuk standalone deployment
echo "🔨 Building Uexam untuk standalone deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
NEXT_CONFIG_FILE=next.config.standalone.js npm run build

# Copy output to dist folder
echo "📁 Copying files to dist folder..."
mkdir -p dist
cp -r out/* dist/ 2>/dev/null || true
cp -r public/* dist/ 2>/dev/null || true

echo "✅ Build selesai! Files ada di folder 'dist/'"
echo "🚀 Jalankan: npx http-server dist/"
