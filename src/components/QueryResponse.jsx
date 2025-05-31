// src/components/QueryComponent.jsx
import React, { useState } from 'react';

const QueryComponent = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(data.response || 'Failed to process query');
      }
      const data = await response.json();
      // Handle the response
      console.log('Response from server:', data.response);

      setResponse(data.response);
    } catch (error) {
      console.error('Error querying transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Query Transcriptions</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your query..."
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && !response && (
        <p className="text-gray-500 text-center">
          Ask a question about the transcriptions
        </p>
      )}
    </div>
  );
};

export default QueryComponent;