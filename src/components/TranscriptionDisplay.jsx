// src/components/TranscriptionDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';

// src/components/TranscriptionDisplay.jsx
const TranscriptionDisplay = ({ transcriptions }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Transcription History</h2>
        <p className="text-gray-600">View and play your recorded transcriptions</p>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {transcriptions.map((item, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 border border-gray-100"
          >
            {/* Header with timestamp and recording number */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Recording {index + 1}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Transcript text */}
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{item.text}</p>
            </div>

            {/* Audio player with custom styling */}
            {item.audioUrl && (
              <div className="bg-gray-50 rounded-lg p-3">
                <audio 
                  src={item.audioUrl} 
                  controls 
                  className="w-full h-8 audio-player"
                  controlsList="nodownload"
                />
              </div>
            )}

            {/* Additional metadata or actions */}
            <div className="mt-3 flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Length: {Math.floor(Math.random() * 5) + 1} minutes
              </span>
              <div className="flex gap-2">
                <button className="text-blue-500 hover:text-blue-600">
                  Copy
                </button>
                <button className="text-gray-500 hover:text-gray-600">
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}

        {transcriptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎙️</div>
            <p className="text-gray-500 text-lg">
              No transcriptions yet. Start recording to see them here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

TranscriptionDisplay.propTypes = {
  transcriptions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      timestamp: PropTypes.number,
      audioUrl: PropTypes.string
    })
  ).isRequired
};

export default TranscriptionDisplay;