import crypto from 'crypto';
import React from 'react';
import moment from 'moment';
import { Tab, Tabs } from 'react-tabify';
import Title from '../partials/title';

export default ({ data: { npmPackage: plugin } }) => (
  <React.Fragment>
    <Title>{plugin.name}</Title>

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
            class="button primary w-25 mt-3 mb-4 float-right">
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
    </ul>
  </aside>
);

function InfoItem(key, value) {
  return (
    <li className="pt-2 pb-2">
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

function getAuthor(plugin) {
  const repository = plugin.npm.links.repository;
  const author = plugin.npm.author ? plugin.npm.author : plugin.npm.publisher;
  const name = author.name || author.username;
  const email = (author.email || '').trim().toLowerCase();
  const emailHash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex');
  let avatar = `https://avatars.dicebear.com/v2/bottts/${emailHash}.svg`;
  let fallbackAvatar = avatar;
  let username;

  if (repository && repository.indexOf('github.com') > -1) {
    username = repository.split('github.com/')[1].split('/')[0];
    avatar = `https://github.com/${username}.png`;
  } else {
    avatar = `https://gravatar.com/avatar/${emailHash}?d=mp&f=y`;
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
