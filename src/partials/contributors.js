import React from 'react';
import contributors from '../assets/contributors.json';
import Waypoint from 'react-waypoint';
import Link from '../components/link';

class Contributors extends React.Component {
  state = {
    contributors: []
  };

  load() {
    this.setState({contributors});
  }

  render() {
    const {contributors} = this.state;
    return (
      <section className="dark github-contributors">
        <Waypoint
          onEnter={this.load.bind(this)}
        />
        <div>
          Thanks to all {contributors.length} <Link to="https://github.com/Kong/insomnia/graphs/contributors">contributors</Link>
          {' '}
          🎉👏
        </div>
        <div className="github-contributors__users">
          {contributors.map(c => (
            <Link key={c.login}
               to={`https://github.com/${c.login}`}
               title={`${c.contributions} contributions from ${c.login}`}
               target="_blank"
               className="github-contributors__avatar"
               style={{backgroundImage: `url('${c.avatar_url}&s=30')`}}>
              &nbsp;
            </Link>
          ))}
        </div>
      </section>
    );
  }
}

export default Contributors;
