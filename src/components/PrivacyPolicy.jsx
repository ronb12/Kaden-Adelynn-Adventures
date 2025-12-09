import './Legal.css'

function PrivacyPolicy({ onClose }) {
  return (
    <div className="legal-page">
      <div className="legal-background">
        <div className="legal-stars"></div>
      </div>

      <div className="legal-container">
        <header className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <button className="legal-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="legal-content">
          <p className="legal-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              The Game collects the following information locally on your device:
            </p>
            <ul>
              <li>Game progress and scores (stored in browser localStorage)</li>
              <li>Gamer tag (stored locally and shared on global leaderboard)</li>
              <li>Game settings and preferences (stored locally)</li>
              <li>High scores (stored locally and synced to cloud for global leaderboard)</li>
            </ul>
            <p>
              <strong>Important Safety Notice:</strong> For your safety and privacy, we require that you use a gamer tag only. Do not use your real name. Your gamer tag will appear on the global leaderboard.
            </p>
            <p>
              <strong>No personal information is collected or transmitted to our servers.</strong>
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Information</h2>
            <p>
              All data is stored locally on your device using browser localStorage. High scores may be optionally synced to Firebase (Google Cloud) for leaderboard functionality, but no personally identifiable information is included.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Third-Party Services</h2>
            <p>
              The Game uses Firebase (Google) for cloud score storage. Firebase's privacy practices are governed by Google's Privacy Policy. We do not share your data with any other third parties.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Data Storage</h2>
            <p>
              All game data is stored locally in your browser. You can clear this data at any time by clearing your browser's localStorage. Cloud scores are stored anonymously and cannot be linked to individual users.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Cookies and Tracking</h2>
            <p>
              The Game does not use cookies or tracking technologies. We do not track your browsing behavior or collect analytics data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Children's Privacy</h2>
            <p>
              The Game is suitable for all ages. We do not knowingly collect personal information from children. All data is stored locally and no personal information is transmitted.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Clear all local game data at any time</li>
              <li>Not provide a player name (you can play anonymously)</li>
              <li>Disable cloud score syncing (scores will only be stored locally)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The "Last Updated" date at the top indicates when changes were made.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Contact Information</h2>
            <p>
              For questions about this Privacy Policy, please contact Bradley Virtual Solutions, LLC.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

