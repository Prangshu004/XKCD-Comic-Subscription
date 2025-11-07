import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PreferencesForm = ({ email }) => {
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [preferredDays, setPreferredDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded by default

  // Fetch current preferences on load
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!email) return;
      
      try {
        const response = await api.get(`/api/users/preferences?email=${encodeURIComponent(email)}`);
        if (response.data) {
          setPreferredTime(response.data.preferredTime || '09:00');
          setPreferredDays(response.data.preferredDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, [email]);

  const dayOptions = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put('/api/users/preferences', {
        email,
        preferredTime,
        preferredDays
      });

      setMessage(response.data.msg);
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error updating preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter(d => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  if (!email) {
    return (
      <div className="preferences-section">
        <div className="form-title">
          Comic Delivery Preferences
        </div>
        <p style={{ textAlign: 'center', color: 'var(--secondary)', fontStyle: 'italic' }}>
          Register and verify your email to set delivery preferences
        </p>
      </div>
    );
  }

  return (
    <div className="preferences-section">
      <div className="form-title" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Comic Delivery Preferences</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="time-selection">
            <label>Preferred delivery time :</label>
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="days-selection">
            <label>Preferred delivery days:</label>
            <div className="days-grid">
              {dayOptions.map(day => (
                <label key={day.value} className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={preferredDays.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                    disabled={loading}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Preferences'}
          </button>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default PreferencesForm;