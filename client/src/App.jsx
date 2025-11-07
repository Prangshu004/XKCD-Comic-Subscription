import { useState, useEffect } from 'react';
import './App.css';
import SubscriptionForm from './components/SubscriptionForm';
import UnsubscribeForm from './components/UnsubscribeForm';
import XkcdInfo from './components/XkcdInfo';

function App() {
  const [activeTab, setActiveTab] = useState('subscribe'); // 'subscribe' or 'unsubscribe'

  // Check URL parameters to determine initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
      setActiveTab('unsubscribe');
    }
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>📬 XKCD Comics Email Subscription</h1>
        
        <p className="app-description">
          Subscribe to receive a random XKCD comic once on your preferred days via email. 
          XKCD is a popular webcomic of romance, sarcasm, math, and language.
        </p>
        
        <div className="tab-container">
          <button 
            className={activeTab === 'subscribe' ? 'tab active' : 'tab' } 
            onClick={() => setActiveTab('subscribe')}
          >
            Subscribe
          </button>
          <button 
            className={activeTab === 'unsubscribe' ? 'tab active' : 'tab'} 
            onClick={() => setActiveTab('unsubscribe')}
          >
            Unsubscribe
          </button>
        </div>

        <div className="send-time-info">
          <p>Comics are automatically sent daily at <strong>9:00 AM</strong> (by default)</p>
        </div>

        {/* Instructions for changing preferred time */}
        <div className="instructions-info">
          <p><strong>Note:</strong> If you're a subscribed user who has already set a preferred delivery time and wish to change it, please unsubscribe first, then subscribe again to set a new preferred time.</p>
        </div>

        {activeTab === 'subscribe' ? <SubscriptionForm /> : <UnsubscribeForm />}
        
        {/* XKCD Info Section - appears after subscription part */}
        <XkcdInfo />
      </div>
    </div>
  );
}

export default App;