---
title: GeoSPARQL Fuseki Module
---

The GeoSPARQL Fuseki Module features an endpoint to manage a dataset's spatial index. The endpoint comes with an HTML view and a corresponding API.
Spatial indexes need to be manually updated after modifications to the underlying RDF data.
The spatial indexer endpoint allows one to reindex specific graphs or all graphs of an underlying dataset.
Spatial datasets are generally configured using the [GeoSPARQL Assembler](geosparql-assembler.html).

The architecture is as follows: The Fuseki2 server in the Java module `jena-fuseki-server` ships with the GeoSPARQL Fuseki Module in `jena-fuseki-mod-geosparql`. The latter depends on `jena-geosparql` for GeoSPARQL support.

## Spatial Indexer Endpoint Configuration

The following snippet summarizes how to declare a spatial indexer endpoint in a Fuseki configuration.

```turtle
PREFIX fuseki: <http://jena.apache.org/fuseki#>

<#ep-spatial-indexer> fuseki:name "spatial-indexer" ;
  fuseki:operation fuseki:spatial-indexer ;
  fuseki:allowedUsers "anne" . # Optional access control.
```

The spatial indexer endpoint needs to be registered with a service. The following shows an example where the spatial indexer endpoint is registered next to a usual query and update endpoint. Make sure to see Fuseki's documentation about [Access Control Lists](../fuseki2/fuseki-data-access-control.html#acl) for securing your endpoints.

```turtle
<#service> a fuseki:Service ;
  fuseki:name "ds" ;
  fuseki:endpoint [ fuseki:operation fuseki:query ] ;
  fuseki:endpoint [ fuseki:name "update" ; fuseki:operation fuseki:update ] ;

  # This is the configuration for the spatial indexer endpoint:
  fuseki:endpoint [
     fuseki:name "spatial-indexer" ;
     fuseki:operation fuseki:spatial-indexer ;
     fuseki:allowedUsers "anne" . # Optional access control.
  ] ;

  # ... further configuration ...
  fuseki:dataset  <#your-spatial-dataset> ;
  .

# The dataset referenced by fuseki:dataset should be of type "geosparql:GeosparqlDataset":
# <#your-spatial-dataset> a geosparql:GeosparqlDataset ;
# ...
```

## Spatial Indexer Web API

* Access the spatial indexer web page.

  ```bash
  curl http://localhost:3030/ds/spatial-indexer
  ```

* Note, if access control is enabled, then curl's `-u` option (short for `--user`) can be used to supply the credentials:

  ```bash
  curl http://localhost:3030/ds/spatial-indexer -u 'user:password'
  ```

* List available graphs. This API is used by the spatial indexer HTML view to render the list of available graphs. The `keyword`, `limit`, and `offset` parameters are optional. The `keyword` parameter performs a case-insensitive substring match over graph URIs. The default graph and union graph constants are members of this set and can also be passed to the `graph` option of the `index` command. The union graph constant is thereby expanded to the set of all *named* graphs - i.e. the set of all graphs except for the default graph.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=graphs&offset=1&limit=10&keyword=graph'
  ```

  ```json
  ["urn:x-arq:DefaultGraph","urn:x-arq:UnionGraph","https://example.org/graph"]
  ```

* Retrieve status information. Only a single indexing task can be active per dataset.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=status'
  ```

  ```json
  {"isIndexing":true,"isAborting":false,"time":1749320452197}
  ```

* Start a cleanup task. This removes dangling graph entries from the spatial index. These are entries in the spatial index for which there is no longer a corresponding graph in the dataset.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=clean'
  ```

* Start an indexing task. This request does not wait for indexing to complete.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=index'
  ```

* Index specific graphs using the `graphs` option. The value must be a JSON array of strings with graph names.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=index' \
    --data-urlencode 'graphs=["urn:x-arq:DefaultGraph","http://your.named/graph"]'
  ```

* Cancel a running indexing or clean task.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=cancel'
  ```

* If an index task failed, such as due to cancellation, then the `error` field will contain a stack trace with information.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=status'
  ```

  ```json
  {"isIndexing":false,"error":"java.lang.InterruptedException\n(stack trace)\n","time":1749320601685}
  ```

  
