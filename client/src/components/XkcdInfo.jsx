import React from 'react';

const XkcdInfo = () => {
  return (
    <div className="xkcd-info-section">
      <div className="xkcd-highlight">
        <h2 className="xkcd-title">🌌 What are XKCD Comics?</h2>
        
        <div className="xkcd-description">
          <p>XKCD is a webcomic created by <strong>Randall Munroe</strong> that combines <span className="highlight-accent">humor</span>, <span className="highlight-accent">science</span>, <span className="highlight-accent">math</span>, <span className="highlight-accent">technology</span>, and <span className="highlight-accent">philosophy</span> in delightfully nerdy and often profound ways.</p>
          
          <div className="comic-features">
            <div className="comic-feature">
              <span className="feature-icon">🔬</span>
              <h3>Science & Tech</h3>
              <p>Packed with references to physics, computer science, and mathematics that'll make you both laugh and think</p>
            </div>
            
            <div className="comic-feature">
              <span className="feature-icon">🎨</span>
              <h3>Minimalist Art</h3>
              <p>Simple stick figures with profound punchlines that prove you don't need fancy graphics to deliver brilliant humor</p>
            </div>
            
            <div className="comic-feature">
              <span className="feature-icon">💡</span>
              <h3>Deep Insights</h3>
              <p>Seemingly silly comics that often contain profound observations about life, love, and the human condition</p>
            </div>
          </div>
          
          <div className="xkcd-fun-facts">
            <h3>✨ XKCD By The Numbers</h3>
            <ul>
              <li>Started in <strong>2005</strong> and still going strong</li>
              <li>Over <strong>2,800 comics</strong> and counting</li>
              <li>Featured in <strong>Scientific American</strong> and <strong>Nature</strong></li>
              <li>Translated into multiple languages worldwide</li>
            </ul>
          </div>
          
          <div className="xkcd-magic">
            <p>Every XKCD comic is a <span className="highlight-accent">delightful blend of intellectual humor</span> and <span className="highlight-accent">unexpected wisdom</span> that'll brighten your day and maybe teach you something new!</p>
            <p className="xkcd-motto">"A webcomic of romance, sarcasm, math, and language" – and we're here to deliver the daily dose of brilliance directly to your inbox!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XkcdInfo;