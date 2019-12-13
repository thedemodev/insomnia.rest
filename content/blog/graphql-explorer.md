---
date: 2019-08-06
title: GraphQL Explorer
slug: graphql-explorer
tags: ["feature"]
---

Starting in version [6.6.2](/changelog/6.6.2/), it is now possible to browse documentation for 
[GraphQL](http://graphql.org/) APIs without leaving Insomnia! 🤗🔥

![GraphQL explorer demo using GatsbyJS API](/images/screens/gql-explorer.gif)

Since adding GraphQL support [two years ago](/blog/introducing-graphql), Insomnia has become 
one of the go-to tools for interacting with GraphQL. This, combined with its already existing
ability to interact with a broad set of HTTP-based APIs, make it a nice alternative to more
popular GraphQL-only tools such as [GraphiQL](https://github.com/graphql/graphiql)*.

**Thanks to the GraphiQL project for providing a GraphQL CodeMirror plugin for autocomplete
and linting!* 🤗💜


## How it Works

The great thing about using Insomnia with GraphQL is that it automatically fetches a schema
based on the current endpoint. Always having a local copy of the schema allows 
features like linting, autocomplete, and inline documentation to exist. The documentation explorer
is no different. 

The same schema is used as a references to dynamically build a visual 
representation of all the types, fields, and arguments you may want to use in a query, even
rendering Markdown descriptions when necessary.


## Three Ways to Show Documentation

There are three ways to show the documentation pane.

1. Click "Show Documentation" in the Schema dropdown near the query
1. Hover over a field and click within the popup documentation
1. Control-click (command on Mac) a field within a query


## Moving Forward

This feature is by no means complete. If you have any suggestions, comments, or bug reports, 
please open an issue on the [Insomnia GitHub Repo](https://github.com/Kong/insomnia).
