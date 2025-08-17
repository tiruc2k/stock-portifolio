#!/usr/bin/env python3
"""
Portfolio Pro React App Startup Script
"""

import subprocess
import sys
import os
import time

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js version: {result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm version: {result.stdout.strip()}")
            return True
        else:
            print("❌ npm not found")
            return False
    except FileNotFoundError:
        print("❌ npm not found")
        return False

def install_dependencies():
    """Install React dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run(['npm', 'install'], check=True, cwd=os.getcwd())
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_react_app():
    """Start the React development server"""
    print("🚀 Starting Portfolio Pro React App...")
    print("📊 Dashboard: http://localhost:3000")
    print("⚡ Press Ctrl+C to stop")
    print("=" * 50)
    
    try:
        subprocess.run(['npm', 'start'], cwd=os.getcwd())
    except KeyboardInterrupt:
        print("\n👋 Portfolio Pro stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start app: {e}")

def main():
    print("💎 Portfolio Pro - React App Startup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_node():
        print("💡 Please install Node.js from https://nodejs.org/")
        return
    
    if not check_npm():
        print("💡 Please install npm (usually comes with Node.js)")
        return
    
    # Install dependencies if needed
    if not os.path.exists('node_modules'):
        if not install_dependencies():
            return
    else:
        print("✅ Dependencies already installed")
    
    # Start the app
    start_react_app()

if __name__ == "__main__":
    main()
