import React from 'react';
import GLink from 'gatsby-link';

const Link = ({children, to, ...props}) => {
  if (to.match(/^(http|https|insomnia):\/\//)) {
    return <a href={to} {...props}>{children}</a>
  } else {
    return <GLink to={to} {...props}>{children}</GLink>
  }
};

export default Link
