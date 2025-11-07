import React, { useState } from 'react';
import api from '../utils/api';
import PreferencesForm from './PreferencesForm';

const SubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState(''); // Track verified email for preferences

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/api/users/register', { email });
      setMessage(res.data.msg);
      setStep('verify');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error registering email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/api/users/verify', { email, code });
      setMessage(res.data.msg);
      // Reset form after successful verification
      setCode('');
      setStep('email');
      setVerifiedEmail(email); // Track the verified email for preferences
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Registration section */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {step === 'email' && (
            <div className="form-section">
              <div className="form-title">Step 1: Enter Your Email</div>
              <form onSubmit={handleSubmitEmail}>
                <label>Email address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <button id="submit-email" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
          )}

          {step === 'verify' && (
            <div className="form-section">
              <div className="form-title">Step 2: Enter Verification Code</div>
              <form onSubmit={handleSubmitVerification}>
                <input 
                  type="hidden" 
                  name="email" 
                  value={email} 
                />
                <label>Verification Code:</label>
                <input
                  type="text"
                  name="verification_code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength="6"
                  required
                  disabled={loading}
                />
                <button id="submit-verification" type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Preferences section */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <PreferencesForm email={verifiedEmail} />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;