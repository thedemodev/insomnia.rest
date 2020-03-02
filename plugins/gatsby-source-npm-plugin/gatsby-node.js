const api = require('./api');
const path = require('path');
const crypto = require('crypto');

function createContentDigest(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

exports.sourceNodes = async (
  { boundActionCreators, createNodeId },
  configOptions,
) => {
  const { createNode } = boundActionCreators;
  const processPackage = pkg => {
    const nodeId = createNodeId(`npm-package-${pkg.name}`);
    const nodeContent = JSON.stringify(pkg);
    return Object.assign({}, pkg, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `NPMPackage`,
        content: nodeContent,
        contentDigest: createContentDigest(nodeContent),
      },
    });
  };

  createNode(processPackage({
    name: 'insomnia-plugin-dummy',
    downloads: {
      lastYear: 0,
      lastMonth: 0,
      lastWeek: 0,
      lastDay: 0,
    },
    meta: {
      name: '',
      description: '',
    },
    npm: {
      released: '',
      description: '',
      version: '',
      date: '',
      git: {
        url: '',
        username: '',
        project: '',
        isGithub: '',
        isGitlab: '',
      },
      author: {
        name: '',
      },
      publisher: {
        username: '',
      },
      links: {
        npm: '',
        homepage: '',
        repository: '',
      },
      readme: '',
    }}));

  // // Create nodes here, generally by downloading data
  // // from a remote API.
  // const response = await api.getPackages(configOptions.query, configOptions)
  //
  // // Process data into nodes.
  // response.packages.forEach(pkg => createNode(processPackage(pkg)))
  //
  // // We're done, return.
  // return
};
