import React from 'react';
import Link from './link';

const ChangelogListItem = ({text}) => {
  const match = text.match(/\(PR:(\d+)(:([^)]+))?\)/);
  if (match) {
    const prNumber = match[1];
    const user = match[3] || '';
    const userString = (user ? ' by ' + user : '');
    return (
      <React.Fragment>
        {text.replace(match[0], '')}
        {' '}
        <a href={`https://github.com/Kong/insomnia/pull/${prNumber}`} target="_blank">
          (#{prNumber}{userString})
        </a>
      </React.Fragment>
    );
  } else {
    return text;
  }
};

export default ChangelogListItem
