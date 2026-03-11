import subprocess
import sys
import os
import time
import threading

def run_backend():
    print("🚀 Starting FastAPI Backend (Uvicorn)..")
    subprocess.run([sys.executable, "-m", "uvicorn", "api_gateway:app", "--host", "127.0.0.1", "--port", "8000", "--reload"])

def run_frontend():
    print("🚀 Starting React Frontend (Vite)..")
    # Assuming 'npm' is in the system PATH
    cwd = os.path.join(os.path.dirname(__file__), "frontend")
    
    # Use shell=True on Windows for npm
    subprocess.run("npm run dev", shell=True, cwd=cwd)

if __name__ == "__main__":
    print("=====================================================")
    print("   Intelli-Credit-Aveva — Industrial AI Optimizer    ")
    print("             Phase 4: Full-Stack Start               ")
    print("=====================================================")

    # Start FastAPI
    backend_thread = threading.Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()

    time.sleep(3) # Give backend a second to boot and load PyTorch

    # Start Vite
    frontend_thread = threading.Thread(target=run_frontend)
    frontend_thread.daemon = True
    frontend_thread.start()

    print("\n✅ System is running!")
    print("👉 Frontend: http://localhost:5173")
    print("👉 Backend:  http://localhost:8000/docs\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        sys.exit(0)
