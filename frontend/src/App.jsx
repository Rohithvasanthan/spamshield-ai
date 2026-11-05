
import { useState } from "react";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkMessage = async () => {

    if (!message.trim()) {
      setError("Please enter a message first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${API_URL}/api/predict`,
         {
          method: "POST",
           headers: {
           "Content-Type": "application/json"
              },
              body: JSON.stringify({ message })
            }
        );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prediction failed"
        );
      }

      setResult(data);

    } catch (err) {

      setError(
        err.message || "Unable to connect to server."
      );

    } finally {

      setLoading(false);

    }
  };


  const clearMessage = () => {
    setMessage("");
    setResult(null);
    setError("");
  };


  return (

    <div className="app">

      <nav className="navbar">

        <div className="brand">
          <div className="brand-icon">S</div>

          <span>
            SpamShield<span className="brand-ai"> AI</span>
          </span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          AI ENGINE ACTIVE
        </div>

      </nav>


      <main className="main-container">

        <div className="hero">

          <div className="eyebrow">
            <span>✦</span>
            INTELLIGENT MESSAGE SECURITY
          </div>

          <h1>
            Think before
            <br />
            you <span>click.</span>
          </h1>

          <p>
            Analyze suspicious SMS messages using
            machine learning. Detect spam before
            it reaches you.
          </p>

        </div>


        <section className="detector-card">

          <div className="card-heading">

            <div>
              <span className="section-label">
                MESSAGE ANALYZER
              </span>

              <h2>Analyze your SMS</h2>
            </div>

            <div className="shield-icon">◈</div>

          </div>


          <label htmlFor="sms">
            PASTE YOUR MESSAGE
          </label>

          <textarea
            id="sms"
            value={message}
            maxLength={5000}
            onChange={(e) => {
              setMessage(e.target.value);
              setResult(null);
              setError("");
            }}
            placeholder="Paste your SMS message here..."
          />


          <div className="input-footer">

            <span>
              {message.length} / 5000 characters
            </span>

            <button
              className="clear-btn"
              onClick={clearMessage}
            >
              Clear message
            </button>

          </div>


          <button
            className="analyze-btn"
            onClick={checkMessage}
            disabled={loading || !message.trim()}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing message...
              </>
            ) : (
              <>
                Analyze Message
                <span>→</span>
              </>
            )}

          </button>


          {error && (
            <div className="error-box">
              {error}
            </div>
          )}


          {result && (

            <div className={`result-box ${
              result.prediction === "SPAM"
                ? "spam-result"
                : "ham-result"
            }`}>

              <div className="result-top">

                <div>
                  <span className="section-label">
                    ANALYSIS RESULT
                  </span>

                  <h2>
                    {result.prediction === "SPAM"
                      ? "Spam detected"
                      : "Message looks legitimate"}
                  </h2>
                </div>

                <div className="result-symbol">
                  {result.prediction === "SPAM"
                    ? "!"
                    : "✓"}
                </div>

              </div>


              <p className="result-description">
                {result.prediction === "SPAM"
                  ? "This model classified your message as spam. Be cautious before clicking links or sharing personal information."
                  : "This model classified your message as non-spam. Still verify unexpected requests independently."
                }
              </p>


              <div className="probability-section">

                <h3>Model probability estimates</h3>

                {Object.entries(
                  result.probabilities
                ).map(([label, value]) => (

                  <div
                    className="probability-item"
                    key={label}
                  >

                    <div className="probability-label">
                      <span>{label.toUpperCase()}</span>
                      <span>{value.toFixed(2)}%</span>
                    </div>

                    <div className="progress-track">

                      <div
                        className={`progress-fill ${label}`}
                        style={{
                          width: `${value}%`
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

              <div className="disclaimer">
                AI predictions are estimates, not a guarantee
                that a message is safe or fraudulent.
              </div>

            </div>

          )}

        </section>


        <div className="feature-grid">

          <div className="feature-card">
            <span>01</span>
            <h3>Smart Detection</h3>
            <p>Machine learning powered text classification.</p>
          </div>

          <div className="feature-card">
            <span>02</span>
            <h3>Instant Analysis</h3>
            <p>Analyze messages through a real-time API.</p>
          </div>

          <div className="feature-card">
            <span>03</span>
            <h3>Privacy First</h3>
            <p>Messages are processed without database storage.</p>
          </div>

        </div>


        <footer>
          <span>SPAMSHIELD AI</span>
          <span>Built with Machine Learning & FastAPI</span>
        </footer>

      </main>

    </div>

  );

}

export default App;
