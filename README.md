# Audio Transcriptor with LLM Integration

A real-time audio transcription and chat application that combines speech recognition, audio recording, and LLM-powered responses. Users can record audio, get transcriptions, and interact with an AI assistant based on the transcribed content.

## Features

- Real-time audio recording and transcription
- Live chat interface with AI responses
- Modern, responsive UI design
- Audio file storage and management
- Integration with LLM for intelligent responses
- Multi-backend architecture (Node.js + Python)

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Web Speech API
- MediaRecorder API

### Backend
- Node.js Express server
- Python FastAPI server
- LLM Integration

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd audio-transcriptor
```

2. **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

3. **Node.js Backend Setup**
```bash
cd server
npm install
npm run dev
```

4. **Python Backend Setup**
```bash
cd python-backend
pip install -r requirements.txt
uvicorn app:app --reload
```

## Environment Variables

Create `.env` files in both backend directories:

Node.js Backend (.env):