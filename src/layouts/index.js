import React from 'react';
import Helmet from 'react-helmet';
import './simple-grid.min.css';
import './base.less';
import './index.less';
import Navbar from '../partials/navbar';
import Footer from '../partials/footer';
import Title from '../partials/title';
import { isLoggedIn } from '../lib/session';
import { site } from '../config';
import { parse as urlParse } from 'url';
import Announcement from '../partials/announcement';

export default class extends React.Component {
  state = {
    isLoggedIn: false
  };

  componentDidMount() {
    this.setState({ isLoggedIn: isLoggedIn() });
    this.trackSignupSource();
  }

  trackSignupSource() {
    const url = urlParse(document.location.href, true);

    // Override signup source with ref non matter what
    if (url.query.ref) {
      localStorage.signupSource = url.query.ref;
      return;
    }

    // Fallback to referrer but don't track self-referrals. Also don't set referrer
    // if signupSource already exists. We don't want to accidentally overwrite the ref
    if (!localStorage.signupSource && document.referrer && document.referrer.indexOf('https://insomnia.rest') !== 0) {
      localStorage.signupSource = document.referrer;
    }
  }

  render() {
    const { children, location } = this.props;
    const { isLoggedIn } = this.state;
    return (
      <React.Fragment>
        <Title/>
        <Helmet>
          <meta name="description" content={site && site.description}/>
          <body data-pathname={location.pathname}/>
        </Helmet>
        <Navbar loggedIn={isLoggedIn}/>
        <main role="main">
          {children()}
        </main>
        <Footer/>
      </React.Fragment>
    );
  }
}

export const pageQuery = graphql`
  query MetadataQuery {
    site {
      siteMetadata {
        title
        author
      }
    }
  }
`;
