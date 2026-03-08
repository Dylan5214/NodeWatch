# NodeWatch 

Real-time data center infrastructure monitoring dashboard. Streams live sensor data (CPU, memory, fan, network) using Server-Sent Events with a React frontend and FastAPI backend.

## Prerequisites
- Python 3.10+
- Node.js 18+

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Dylan5214/NodeWatch.git
cd NodeWatch
```

### 2. Backend
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### 3. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the dashboard
Go to `http://localhost:5173`

## Features
-  Live sensor streaming via SSE (updates every 2s), with simulated realistic results
-  CPU, Memory, Fan, and Network sensors
-  Warning and critical alert detection
-  Scrollable alert log panel
