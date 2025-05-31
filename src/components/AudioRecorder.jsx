// src/components/AudioRecorder.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
const BASE_URL = "https://auto-researcher-node-api.onrender.com"
const AudioRecorder = ({ onTranscriptionReceived }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const transcriptPartsRef = useRef([]); // Store all transcript parts
  const audioChunksRef = useRef([]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            // Save final transcripts with timestamp
            transcriptPartsRef.current.push({
              text: transcript,
              timestamp: new Date().toISOString()
            });
          } else {
            interimTranscript += transcript;
          }
        }

        // Update current transcript with both final and interim results
        setCurrentTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart recognition if we're still recording
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          restartRecognition();
        }
      };
    }
  }, [isRecording]);

  const restartRecognition = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      setTimeout(() => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      }, 1000);
    }
  };

  const sendAudioToServer = async (audioBlob, transcriptData) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('transcript', JSON.stringify({
        fullText: transcriptData.text,
        segments: transcriptData.segments,
        timestamp: transcriptData.timestamp
      }));
  
      console.log('Sending audio file size:', audioBlob.size, 'bytes');
      console.log('Sending transcript length:', transcriptData.text.length, 'characters');
  
      const response = await fetch(`${BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send audio to server');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending audio:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      transcriptPartsRef.current = []; // Reset transcript parts
      audioChunksRef.current = []; // Reset audio chunks

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Also start media recording for audio backup
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Error starting recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Combine all transcript parts
    const fullTranscript = transcriptPartsRef.current
      .map(part => part.text)
      .join(' ');

    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Prepare transcript data
    const transcriptData = {
      text: fullTranscript,
      segments: transcriptPartsRef.current,
      timestamp: new Date().toISOString()
    };

    // Send to server
    const serverResponse = await sendAudioToServer(audioBlob, transcriptData);
    console.log('Server response:', serverResponse);

    // Send both transcript and audio to parent
    onTranscriptionReceived({
      ...transcriptData,
      audio: audioUrl,
      serverResponse
    });

    setCurrentTranscript('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Voice Recorder</h2>
        <p className="text-gray-600">Start recording your voice for instant transcription</p>
      </div>
      {/* Recording Interface */}
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Status Animation */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          isRecording 
            ? 'bg-red-100 animate-pulse' 
            : 'bg-blue-100'
        }`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500' 
                : 'bg-blue-500'
            }`}>
              <span className="text-4xl text-white">
                {isRecording ? '⏺' : '🎙️'}
              </span>
            </div>
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-8 py-3 rounded-full font-medium text-white transition-all transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        

          {/* Status Text */}
          <div className="text-center">
            <p className={`text-lg font-medium ${
              isRecording ? 'text-red-500' : 'text-gray-600'
            }`}>
              {isRecording ? 'Recording in progress...' : 'Ready to record'}
            </p>
            {currentTranscript && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-gray-700">{currentTranscript}</p>
              </div>
            )}
          </div>
        </div>
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
  );
};

AudioRecorder.propTypes = {
  onTranscriptionReceived: PropTypes.func.isRequired
};

export default AudioRecorder;