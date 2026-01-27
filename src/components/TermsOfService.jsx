import './Legal.css'

function TermsOfService({ onClose }) {
  return (
    <div className="legal-page">
      <div className="legal-background">
        <div className="legal-stars"></div>
      </div>

      <div className="legal-container">
        <header className="legal-header">
          <h1 className="legal-title">Terms of Service</h1>
          <button className="legal-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="legal-content">
          <p className="legal-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and playing "Kaden & Adelynn Space Adventures" (the "Game"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              The Game is a free-to-play browser-based space shooter game. All in-game currency (stars) are earned through gameplay and cannot be purchased with real money. No real money transactions are available or accepted.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Game for any unlawful purpose</li>
              <li>Attempt to modify, hack, or exploit the Game</li>
              <li>Interfere with or disrupt the Game's functionality</li>
              <li>Use automated systems or bots to play the Game</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Intellectual Property</h2>
            <p>
              The Game, including all content, graphics, code, and software, is the property of Bradley Virtual Solutions, LLC and is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works from the Game without express written permission.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Disclaimer of Warranties</h2>
            <p>
              The Game is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Game will be uninterrupted, error-free, or free from viruses or other harmful components.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Bradley Virtual Solutions, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Game.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Your continued use of the Game after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact Bradley Virtual Solutions, LLC.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService

