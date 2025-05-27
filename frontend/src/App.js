import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [buttonClicks, setButtonClicks] = useState(0);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Replace this with your actual backend URL from Render
  const BACKEND_URL = "https://doyoutrustme.onrender.com"

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleTrustClick = async () => {
    setLoading(true);
    setError(null);
    setButtonClicks(prev => prev + 1);

    try {
      const response = await fetch(`${BACKEND_URL}/api/random-content`);
      const data = await response.json();

      if (data.success) {
        setContent(data);
      } else {
        setError(data.message || 'Something mysterious happened...');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!content || !content.file) return null;

    const { file, url } = content;
    const baseUrl = BACKEND_URL;

    switch (file.category) {
      case 'images':
        return (
          <div className="content-display">
            <img
              src={`${baseUrl}${url}`}
              alt={file.filename}
              className="media-content"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
              }}
            />
            <p className="content-filename">{file.filename}</p>
          </div>
        );

      case 'videos':
        return (
          <div className="content-display">
            <video
              controls
              className="media-content"
              onError={() => setError('Video could not be loaded')}
            >
              <source src={`${baseUrl}${url}`} type={`video/${file.extension.slice(1)}`} />
              Your browser does not support video playback.
            </video>
            <p className="content-filename">{file.filename}</p>
          </div>
        );

      case 'audio':
        return (
          <div className="content-display">
            <div className="audio-container">
              <div className="audio-icon">🎵</div>
              <audio
                controls
                className="audio-content"
                onError={() => setError('Audio could not be loaded')}
              >
                <source src={`${baseUrl}${url}`} type={`audio/${file.extension.slice(1)}`} />
                Your browser does not support audio playback.
              </audio>
            </div>
            <p className="content-filename">{file.filename}</p>
          </div>
        );

      case 'text':
        return (
          <div className="content-display">
            <div className="text-content">
              <div className="text-icon">📝</div>
              <pre className="text-display">{file.text_content}</pre>
            </div>
            <p className="content-filename">{file.filename}</p>
          </div>
        );

      default:
        return (
          <div className="content-display">
            <p>Unknown content type: {file.category}</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1 className="title">🪇</h1>
          <p className="subtitle">The challenge is...</p>
        </header>

        <div className="main-content">
          <button
            className={`trust-button ${loading ? 'loading' : ''}`}
            onClick={handleTrustClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Do you trust me?'}
          </button>

          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}

          {renderContent()}
        </div>

        <footer className="footer">
          {stats && (
            <div className="stats">
              <p>📊 Available content: {stats.total_files} files</p>
              <p>🎯 Button clicks: {buttonClicks}</p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;