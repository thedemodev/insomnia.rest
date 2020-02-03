const axios = require('axios');
const marked = require('marked');

const INSOMNIA_PKG = `https://raw.githubusercontent.com/Kong/insomnia/develop/packages/insomnia-app/package.json`;

const NPM_API_PGKINFO = name =>
  `https://api.npms.io/v2/package/${encodeURIComponent(name)}`;
const NPM_REG_INFO = name =>
  `http://registry.npmjs.com/${encodeURIComponent(name)}`;
const NPM_API_SEARCH = (query, size, offset) =>
  `https://api.npms.io/v2/search?q=${encodeURIComponent(
    query
  )}&size=${size}&from=${offset}`;
const NPM_API_DWNINFO = (period, pkg) =>
  `https://api.npmjs.org/downloads/point/${period}/${pkg}`;

function getLastYearRange() {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const currentDay = date.getDay();
  const lastYear = currentYear - 1;
  return `${lastYear}-${currentMonth}-${currentDay}:${currentYear}-${currentMonth}-${currentDay}`;
}

async function getDetail(pkg) {
  // const npms = await axios(NPM_API_PGKINFO(pkg.name));
  const npm = await axios(NPM_REG_INFO(pkg.name));

  const currentVersion = npm.data['dist-tags'].latest;
  const currentPkg = npm.data.versions[currentVersion];

  return {
    name: npm.data.name,
    readme: npm.data.readme,
    released: npm.data.time.created,
    repository: npm.data.repository,
    // REMOVE FOR GENERIC PLUGIN
    meta: currentPkg.insomnia || {}
  };
}

async function getDownload(period, pkg) {
  const response = await axios(NPM_API_DWNINFO(period, pkg));
  return response.data;
}

async function getDownloads(period, pkgs) {
  const pkgNames = pkgs.map(obj => obj.package.name);
  const bulkPkgs = pkgNames.filter(name => name[0] !== '@');
  const scopedPkgs = pkgNames.filter(name => name[0] === '@');
  const bulkQuery = bulkPkgs.join(',');
  let bulkResults = await getDownload(period, bulkQuery);

  bulkResults = bulkResults || {};

  for (var scopedName of scopedPkgs) {
    bulkResults[scopedName] = await getDownload(period, scopedName);
  }

  return bulkResults;
}

async function getDetails(pkgs) {
  const results = [];

  for (var obj of pkgs) {
    results.push(await getDetail(obj.package));
  }

  return results;
}

function buildPkg(pkg, detailsMap, downloads) {
  const details = detailsMap[pkg.name];
  const readme = marked(details.readme || '');
  const readmeRaw = details.readme;
  const meta = details.meta;

  return {
    name: pkg.name,
    downloads: {
      lastDay: downloads.lastDay[pkg.name].downloads,
      lastWeek: downloads.lastWeek[pkg.name].downloads,
      lastMonth: downloads.lastMonth[pkg.name].downloads,
      lastYear: downloads.lastYear[pkg.name].downloads
    },
    meta,
    npm: {
      ...pkg,
      repository: details.repository,
      released: details.released,
      readme,
      readmeRaw
    }
  };
}

async function fetch(query, allowDeprecated, filter, offset, size) {
  let appPkg = null;
  let corePlugins = null;
  let pkgs = null;
  let results = null;

  // Fetch pkg.json for app
  // REMOVE FOR GENERIC PLUGIN
  appPkg = await axios(INSOMNIA_PKG);
  corePlugins = appPkg.data.app.plugins;

  // Fetch packages
  pkgs = await axios(NPM_API_SEARCH(query, size, offset));
  pkgs = pkgs.data;

  // Filter out core plugins
  // REMOVE FOR GENERIC PLUGIN
  results = pkgs.results.filter(
    obj => corePlugins.indexOf(obj.package.name) < 0
  );

  // Filter out packages when value exists
  if (filter) {
    results = results.filter(obj => obj.package.name.indexOf(filter) > -1);
  }

  // Filter out deprecated when not allowed
  if (!allowDeprecated) {
    results = results.filter(obj => !obj.package.deprecated);
  }

  // Fetch plugin details
  // Readme, Plugin Meta Info
  const detailsResults = await getDetails(results);
  const detailsMap = {};

  for (const details of detailsResults) {
    detailsMap[details.name] = details;
  }

  // Fetch aggregated downloads for a period
  // TODO: fetch range for sparkline
  const downloadMap = {
    lastDay: await getDownloads('last-day', results),
    lastWeek: await getDownloads('last-week', results),
    lastMonth: await getDownloads('last-month', results),
    lastYear: await getDownloads(getLastYearRange(), results)
  };

  return {
    packages: results.map(obj =>
      buildPkg(obj.package, detailsMap, downloadMap)
    ),
    totalResults: pkgs.total
  };
}

module.exports = {
  getPackages: async function(
    query,
    { filter, allowDeprecated = false, perFetch = 100 }
  ) {
    let results = await fetch(query, allowDeprecated, filter, 0, perFetch);
    let currentOffset = perFetch;
    let total = results.totalResults;

    while (currentOffset < total) {
      let nextPage = await fetch(
        query,
        allowDeprecated,
        filter,
        currentOffset,
        perFetch
      );
      currentOffset += perFetch;
      results.packages = results.packages.concat(nextPage.packages);
    }

    return results;
  }
};
