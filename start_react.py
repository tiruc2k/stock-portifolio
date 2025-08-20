#!/usr/bin/env python3
"""
Portfolio Pro React App Startup Script
"""

import argparse
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

def free_port(port: int):
    print(f"🧹 Freeing port {port} if in use...")
    try:
        result = subprocess.run(['lsof', '-ti', f":{port}"], capture_output=True, text=True)
        pids = [pid for pid in result.stdout.strip().splitlines() if pid]
        if not pids:
            print("✅ Port is free")
            return
        for pid in pids:
            subprocess.run(['kill', '-9', pid], check=False)
        print(f"✅ Killed PIDs: {', '.join(pids)}")
    except FileNotFoundError:
        print("ℹ️ 'lsof' not found; skipping port cleanup")

def start_react_app(port: int = 3000):
    """Start the React development server on the given port"""
    print("🚀 Starting Portfolio Pro React App...")
    print(f"📊 Dashboard: http://localhost:{port}")
    print("⚡ Press Ctrl+C to stop")
    print("=" * 50)

    env = os.environ.copy()
    env["PORT"] = str(port)

    try:
        subprocess.run(['npm', 'start'], cwd=os.getcwd(), env=env)
    except KeyboardInterrupt:
        print("\n👋 Portfolio Pro stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start app: {e}")

def main():
    print("💎 Portfolio Pro - React App Startup")
    print("=" * 50)

    parser = argparse.ArgumentParser(description="Start/Restart the Portfolio Pro React dev server")
    parser.add_argument("--restart", action="store_true", help="Free the port before starting")
    parser.add_argument("--port", type=int, default=3000, help="Port to run the dev server on (default: 3000)")
    args = parser.parse_args()

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

    # Optionally free the port
    if args.restart:
        free_port(args.port)

    # Start the app
    start_react_app(port=args.port)

if __name__ == "__main__":
    main()
