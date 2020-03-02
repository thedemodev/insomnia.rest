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
      <div>Hello</div>
    </article>
  </React.Fragment>
);
