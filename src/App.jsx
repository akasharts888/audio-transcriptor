// src/App.jsx
import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import ChatInterface from './components/ChatInterface';

function App() {
  const [transcriptions, setTranscriptions] = useState([]);

  const handleNewTranscription = (transcription) => {
    setTranscriptions(prev => [...prev, transcription]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Animated Blob Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-300/30 rounded-full filter blur-3xl animate-pulse top-[10%] left-[10%]" />
        <div className="absolute w-96 h-96 bg-blue-300/30 rounded-full filter blur-3xl animate-pulse top-[40%] right-[10%]" />
        <div className="absolute w-96 h-96 bg-pink-300/30 rounded-full filter blur-3xl animate-pulse bottom-[10%] left-[20%]" />
      </div>
      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-12">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Audio Transcriptor
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Transform your voice into text with AI-powered transcription and intelligent responses
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "🎙️",
              title: "Real-time Recording",
              description: "High-quality audio capture with noise reduction"
            },
            {
              icon: "⚡",
              title: "Instant Transcription",
              description: "Get accurate text transcripts in real-time"
            },
            {
              icon: "🤖",
              title: "AI-Powered Chat",
              description: "Interact with your transcriptions using advanced AI"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <AudioRecorder onTranscriptionReceived={handleNewTranscription} />
          </div>
          {/* Chat Interface Section */}
          <div className="mt-8">
            <TranscriptionDisplay transcriptions={transcriptions} />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;