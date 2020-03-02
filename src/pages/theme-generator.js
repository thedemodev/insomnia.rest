import React from 'react';
import SocialCards from '../components/social-cards';
import Title from '../partials/title';
import DownloadButton from '../components/download-button';
import Link from '../components/link';

export default () => (
  <React.Fragment>
    <article>
      <Title>Theme Generator</Title>
      <SocialCards title="Insomnia" summary="Theme Generator" isBanner />

      <section className="container header--big run-in-container">
        <header className="run-in__header">
          <h1>Theme Generator</h1>
        </header>
      </section>
      <div className="container">
        <SvgPreview theme={{
          background: {
            default: 'black',
          },
          foreground: {
            default: 'white',
            success: 'green',
            info: 'blue',
            notice: 'yellow',
            warning: 'orange',
            surprise: 'purple',
            danger: 'red',
          },
          highlight: {
            md: 'gray',
          }
        }} />
      </div>
    </article>
  </React.Fragment>
);

const SvgPreview = ({ theme }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 300">
      <g>
        {/* Panes */}
        <g className="theme--pane--sub">
          <rect x="0" y="0" width="100%" height="100%" fill={theme.background.default} />
          <rect
            x="25%"
            y="0"
            width="100%"
            height="10%"
            fill={theme.background.default}
          />
        </g>

        {/* Sidebar */}
        <g className="theme--sidebar--sub">
          <rect x="0" y="0" width="25%" height="100%" fill={theme.background.default} />
          <rect
            x="0"
            y="0"
            width="25%"
            height="10%"
            fill={theme.background.default}
          />
        </g>

        {/* Lines */}
        <line x1="25%" x2="100%" y1="10%" y2="10%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="62%" x2="62%" y1="0" y2="100%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="25%" x2="25%" y1="0" y2="100%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="0" x2="25%" y1="10%" y2="10%" strokeWidth="1" stroke={theme.highlight.md} />

        {/* Colors */}
        <rect x="40%" y="85%" width="5%" height="8%" fill={theme.foreground.success} />
        <rect x="50%" y="85%" width="5%" height="8%" fill={theme.foreground.notice} />
        <rect x="60%" y="85%" width="5%" height="8%" fill={theme.foreground.warning} />
        <rect x="70%" y="85%" width="5%" height="8%" fill={theme.foreground.danger} />
        <rect x="80%" y="85%" width="5%" height="8%" fill={theme.foreground.surprise} />
        <rect x="90%" y="85%" width="5%" height="8%" fill={theme.foreground.info} />
      </g>
    </svg>
  );
};

