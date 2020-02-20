import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

function Header(onSearch) {
  return (
    <header className="container header--big">
      <div className="row">
        <div className="col-12">
          <h1>Plugins</h1>
          <p className="text-xl">
            Leverage the power of the community.
            <br />
            One plugin at a time.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <input
            className="plugin-search br-3 text-lg d-block w-100 pr-3 pl-3 pt-2 pb-2 mb-3"
            placeholder="Search plugins"
            onChange={onSearch}
          />
          <a
            href="https://support.insomnia.rest/article/26-plugins"
            className="create-plugin-link">
            Interested in making your own?
            <span className="emoji-swap default">😏</span>
            <span className="emoji-swap on-hover">😍</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: 'center' }} className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h4>Loading...</h4>
        </div>
      </div>
    </div>
  );
}

function NoMoreResults(numResults) {
  return (
    <div style={{ textAlign: 'center' }} className="container mt-5">
      <div className="row">
        <div className="col-12">
          <p>
            {numResults
              ? "No more results. Don't see your plugin?"
              : 'No matches found'}
            <br />
            <a href="https://support.insomnia.rest/article/26-plugins">
              Create a Plugin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Plugin(pkg, period) {
  let displayName = Plugin.getDisplayName(pkg);
  let description = Plugin.getDescription(pkg);
  let author = Plugin.getAuthor(pkg);

  return (
    <div className="plugin-wrapper mb-3 d-flex" key={pkg.name}>
      <div className="plugin w-100 p-3">
        <div className="plugin-header d-flex w-100">
          <div className="plugin-logo" />
          <div className="plugin-name">
            <a href={`/plugins/${pkg.name}`}>{displayName}</a>
          </div>
          <div className="plugin-info">
            <span className="text-small plugin-author">{author.name}</span>
          </div>
        </div>

        <p
          className="plugin-content d-block mt-2 mb-3 text-overflow text-small text-secondary"
          title={pkg.npm.description}>
          {description}
        </p>

        <div className="plugin-footer d-flex mb-0 text-small text-secondary">
          <div className="plugin-version pr-3">
            <i className="las la-code-branch" /> {pkg.npm.version}
          </div>
          <div className="plugin-author pr-3">
            <i className="las la-download" /> {pkg.downloads[period]}
          </div>
        </div>
      </div>
    </div>
  );
}

Plugin.getAuthor = pkg => {
  const author = pkg.npm.author ? pkg.npm.author : pkg.npm.publisher;
  const name = author.name || author.username;
  const email = author.email;

  return {
    name,
    email,
    avatar: {
      github: `https://github.com/${name}`,
      gravatar: `tbd`
    }
  };
};

Plugin.getDisplayName = pkg => {
  let displayName = pkg.meta.name || pkg.name;
  return displayName.indexOf('insomnia-plugin') > -1
    ? displayName.split('insomnia-plugin-')
    : displayName;
};

Plugin.getDescription = pkg => {
  return pkg.meta.description || pkg.npm.description;
};

function Plugins(plugins, hasMore, onNext) {
  return (
    <div className="plugins">
      <InfiniteScroll
        dataLength={plugins.length}
        next={onNext}
        hasMore={hasMore}
        hasChildren={plugins.length > 0}
        loader={Loader()}
        endMessage={NoMoreResults(plugins.length)}>
        {plugins.map(plugin => Plugin(plugin, 'lastYear'))}
      </InfiniteScroll>
    </div>
  );
}

export default class Component extends React.Component {
  constructor() {
    super();

    this.plugins = [];
    this.state = {
      plugins: [],
      total: 0,
      offset: 0,
      sortBy: 'downloads',
      trendingBy: 'lastWeek',
      hasMore: true,
      perScroll: 25
    };
  }

  componentDidMount() {
    const {
      allNpmPackage: { edges }
    } = this.props.data;

    this.plugins = edges.map(({ node: plugin }) => plugin);
    this.setState({
      total: this.plugins.length,
      hasMore: this.plugins.length > 0
    });
    this.load();
  }

  reset() {
    this.setState({
      plugins: [],
      offset: 0,
      hasMore: false
    });

    setTimeout(() => {
      this.loadMore();
    }, 1);
  }

  search(evt) {
    let query = evt.target.value;

    if (!query) {
      this.reset();
      return;
    }

    query = query.toLowerCase();

    this.setState({
      offset: 0,
      hasMore: false,
      plugins: this.plugins.filter(plugin => {
        return (
          Plugin.getDisplayName(plugin)
            .toLowerCase()
            .indexOf(query) > -1
        );
      })
    });
  }

  sortByDownloads(period) {
    this.plugins = this.plugins.sort((a, b) => {
      if (a.downloads[period] < b.downloads[period]) {
        return 1;
      } else if (a.downloads[period] > b.downloads[period]) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  load() {
    const { sortBy } = this.state;

    switch (sortBy) {
      case 'downloads':
        this.sortByDownloads('lastYear');
    }

    this.loadMore();
  }

  loadMore() {
    let { offset, plugins, perScroll } = this.state;
    let nextOffset = offset + perScroll;
    let nextSet = this.plugins.slice(offset, nextOffset);

    this.setState({
      loading: true
    });

    setTimeout(() => {
      this.setState({
        plugins: plugins.concat(nextSet),
        offset: nextOffset,
        hasMore: this.state.total > nextOffset,
        loading: false
      });
    }, Math.random() * 500);
  }

  render() {
    return (
      <React.Fragment>
        <link
          rel="stylesheet"
          href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"
        />
        <div className="container mb-5">
          {Header(this.search.bind(this))}
          {Plugins(
            this.state.plugins,
            this.state.hasMore,
            this.loadMore.bind(this)
          )}
        </div>
      </React.Fragment>
    );
  }
}

export const pageQuery = graphql`
  query myQuery {
    allNpmPackage {
      edges {
        node {
          name
          downloads {
            lastYear
            lastMonth
            lastWeek
            lastDay
          }
          meta {
            name
            description
          }
          npm {
            description
            version
            author {
              name
            }
            publisher {
              username
            }
            readme
          }
        }
      }
    }
  }
`;
