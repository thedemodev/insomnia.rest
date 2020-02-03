const path = require('path');
const crypto = require('crypto');

module.exports.onCreateNode = ({node, boundActionCreators}) => {
  const {createNodeField} = boundActionCreators;

  // Add slug to Node so we can query on it
  if (node.internal.type === 'MarkdownRemark') {
    // console.log('__NODE', node);
    const {frontmatter} = node;
    createNodeField({
      node,
      name: 'slug',
      value: frontmatter.slug,
    });
  }

  if (node.internal.type === 'NPMPackage') {
    createNodeField({
      node,
      name: 'name',
      value: node.name,
    });
  }
};

module.exports.createPages = async function (data) {
  const {graphql, boundActionCreators} = data;
  const {createPage, createNode} = boundActionCreators;
  const templateBlogPost = path.resolve('./src/templates/blog.js');
  const templateChangelog = path.resolve('./src/templates/changelog.js');
  const templatePage = path.resolve('./src/templates/page.js');
  const templateTag = path.resolve('./src/templates/tag.js');
  const templateSeries = path.resolve('./src/templates/series.js');

  const result = await graphql(`
    {
      allFile(filter: {sourceInstanceName: {regex: "/blog|changelog|page/"}}) {
        edges {
          node {
            sourceInstanceName
            childMarkdownRemark {
              frontmatter {
                date(formatString: "MMMM DD, YYYY")
                date_iso: date
                channel
                fixes
                link
                major
                minor
                series
                slug
                summary
                tags
                title
              }
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.log('ERROR:', JSON.stringify(result.errors, null, 2));
    process.exit(1);
  }

  // Create blog posts pages.
  const tagCounts = {};
  const seriesCounts = {};
  for (const edge of result.data.allFile.edges) {
    const {frontmatter} = edge.node.childMarkdownRemark;
    let urlPath;
    let template = templatePage;

    if (edge.node.sourceInstanceName === 'blog') {
      urlPath = `/blog/${frontmatter.slug}`;
      template = templateBlogPost;
      for (const tag of frontmatter.tags || []) {
        const t = tag.toLowerCase();
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
      for (const series of frontmatter.series || []) {
        const s = series.toLowerCase();
        seriesCounts[s] = (seriesCounts[s] || 0) + 1;
      }
    } else if (edge.node.sourceInstanceName === 'changelog') {
      urlPath = `/changelog/${frontmatter.slug}`;
      template = templateChangelog;
    } else if (edge.node.sourceInstanceName === 'page') {
      urlPath = `/${frontmatter.slug}`;
      template = templatePage;
    }

    createPage({
      path: frontmatter.url || urlPath,
      component: template,
      context: {
        // So we can use the $slug variable in GraphQL queries
        slug: frontmatter.slug || ''
      },
    });
  }

  const tagCountObjects = Object.keys(tagCounts)
    .map(tag => ({tag, count: tagCounts[tag]}))
    .sort((a, b) => b.count - a.count);

  const seriesCountObjects = Object.keys(seriesCounts)
    .map(series => ({series, count: seriesCounts[series]}))
    .sort((a, b) => b.count - a.count);

  for (const {tag, count} of tagCountObjects) {
    createPage({
      path: `/tags/${tag}`,
      component: templateTag,
      context: {
        tag: tag,
        count: count,
      },
    });

    createNode({
      tag: tag,
      count: count,

      // Required base fields
      id: `blog-tag.${tag}`,
      parent: null,
      children: [],
      internal: {
        type: 'BlogTag',
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(tag))
          .digest(`hex`),
      },
    });
  }

  for (const {series, count} of seriesCountObjects) {
    createPage({
      path: `/series/${series}`,
      component: templateSeries,
      context: {
        series: series,
        count: count,
      },
    });

    createNode({
      series: series,
      count: count,

      // Required base fields
      id: `blog-series.${series}`,
      parent: null,
      children: [],
      internal: {
        type: 'BlogSeries',
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(series))
          .digest(`hex`),
      },
    });
  }
  
  const template = path.resolve('./src/templates/plugin.js');
  const results = await graphql(`
    query myQuery {
      allNpmPackage {
        edges {
          node {
            name
          }
        }
      }
    }
  `);

  // Process data into pages.
  results.data.allNpmPackage.edges.forEach(({ node: pkg }) => {
    createPage({
      path: `/plugins/${pkg.name}`,
      component: template,
      context: {
        slug: pkg.name || ''
      },
    })
  })
};
