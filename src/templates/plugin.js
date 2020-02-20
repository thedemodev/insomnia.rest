import crypto from 'crypto';
import React from 'react';
import moment from 'moment';
import { Tab, Tabs } from 'react-tabify';
import Title from '../partials/title';
import SocialCards from '../components/social-cards';

export default ({ data: { npmPackage: plugin } }) => (
  <React.Fragment>
    <link
      rel="stylesheet"
      href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"
    />
    <Title>{plugin.name}</Title>
    <SocialCards title={plugin.name} summary={`Install "${plugin.name}" in Insomnia`} />

    <article className="plugin-page">
      {Header(plugin)}

      <div className="container">
        <div className="row">
          <Tabs>{Overview(plugin)}</Tabs>
        </div>
      </div>
    </article>
  </React.Fragment>
);

function Header(plugin) {
  return (
    <header className="container">
      <div className="row">
        <div className="col-12">
          <a
            href={`insomnia://plugins/install?name=${plugin.name}`}
            className="button primary w-25 mt-3 mb-4 float-right">
            Install
          </a>

          <h1>{plugin.name}</h1>

          <div className="text-md">
            <strong className="mr-3">{plugin.npm.version}</strong>
            {Author(plugin)}
            {PublishDate(plugin)}
          </div>
        </div>
      </div>
    </header>
  );
}

function Overview(plugin) {
  return (
    <Tab label="Overview">
      {Overview.Content(plugin)}
      {Overview.Sidebar(plugin)}
    </Tab>
  );
}

Overview.Content = plugin => (
  <section className="col-8 content">
    <div dangerouslySetInnerHTML={{ __html: plugin.npm.readme }} />
  </section>
);

Overview.Sidebar = plugin => (
  <aside className="col-4 plugin-sidebar">
    <ul>
      {InfoItem('Version', plugin.npm.version)}
      {InfoItem('Installations', formatNumber(plugin.downloads.lastYear))}
      {InfoItem('Released', moment(plugin.npm.released).format('MM/DD/YYYY'))}
      {InfoItem('Updated', moment(plugin.npm.date).format('MM/DD/YYYY'))}

      {plugin.npm.links &&
        plugin.npm.links.npm &&
        InfoItem(
          'NPM',
          <a href={plugin.npm.links.npm}>{getNpmDisplay(plugin)}</a>
        )}

      {plugin.npm.links &&
        plugin.npm.links.homepage &&
        InfoItem(
          'Site',
          <a href={plugin.npm.links.homepage}>
            <i className="las la-globe" /> {plugin.npm.links.homepage}
          </a>
        )}

      {plugin.npm.git.isGithub &&
        InfoItem(
          'Git',
          <a href={plugin.npm.git.url}>
            <i className="lab la-github" /> {getGitDisplay(plugin)}
          </a>
        )}

      {plugin.npm.git.isGitlab &&
        InfoItem(
          'Git',
          <a href={plugin.npm.git.url}>
            <i className="lab la-gitlab" /> {getGitDisplay(plugin)}
          </a>
        )}
    </ul>
  </aside>
);

function InfoItem(key, value) {
  return (
    <li className="info-item pt-2 pb-2">
      {key}: <strong className="float-right">{value}</strong>
    </li>
  );
}

function Author(plugin) {
  const author = getAuthor(plugin);
  return (
    <div className="d-inline-block mr-3">
      <img
        src={author.avatar}
        alt="Author Avatar"
        className="d-inline-block position-relative mr-1"
        onError={e => {
          e.target.onerror = null;
          e.target.src = author.fallbackAvatar;
        }}
        style={{ width: '16px', top: '1px' }}
      />
      <span>{author.name}</span>
    </div>
  );
}

function PublishDate(plugin) {
  return (
    <time className="mr-3" dateTime={plugin.npm.date}>
      Published {moment(plugin.npm.date).fromNow()}
    </time>
  );
}

function formatNumber(value) {
  return value.toLocaleString('en-US');
}

function getNpmDisplay(plugin) {
  return decodeURIComponent(plugin.npm.links.npm.split('/package/')[1]);
}

function getGitDisplay(plugin) {
  const git = plugin.npm.git;

  if (git.username) {
    return `${git.username}/${git.project}`;
  }

  return decodeURIComponent(git.url);
}

function getAuthor(plugin) {
  const author = plugin.npm.author ? plugin.npm.author : plugin.npm.publisher;
  const name = author.name || author.username;
  const email = (author.email || '').trim().toLowerCase();
  const emailHash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex');
  let avatar = `https://gravatar.com/avatar/${emailHash}?d=mp&f=y`;
  let fallbackAvatar = `https://avatars.dicebear.com/v2/bottts/${emailHash}.svg`;

  if (plugin.npm.git.isGithub) {
    avatar = `https://github.com/${plugin.npm.git.username}.png`;
  }

  return {
    name,
    email,
    avatar,
    fallbackAvatar
  };
}

export const pageQuery = graphql`
  query PluginByName($slug: String!) {
    npmPackage(fields: { name: { eq: $slug } }) {
      name
      downloads {
        lastYear
        lastMonth
        lastWeek
        lastDay
      }
      npm {
        released
        description
        version
        date
        git {
          url
          username
          project
          isGithub
          isGitlab
        }
        author {
          name
        }
        publisher {
          username
        }
        links {
          npm
          homepage
          repository
        }
        readme
      }
    }
  }
`;
