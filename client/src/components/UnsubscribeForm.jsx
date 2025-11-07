import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UnsubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract email from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setStep('verify'); // Skip to verification step if email is provided
    }
  }, []);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/users/unsubscribe-request', { email });
      setMessage(res.data.msg);
      setStep('verify');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error requesting unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/users/unsubscribe', { email, code });
      setMessage(res.data.msg);
      // Reset form after successful unsubscribe
      setCode('');
      setStep('email');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error unsubscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      
      {step === 'email' && (
        <div className="form-section">
          <div className="form-title">Step 1: Enter Email to Unsubscribe</div>
          <form onSubmit={handleSubmitEmail}>
            <label>Email address:</label>
            <input
              type="email"
              name="unsubscribe_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button id="submit-unsubscribe" type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Unsubscribe'}
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
              name="unsubscribe_email" 
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
  );
};

export default UnsubscribeForm;