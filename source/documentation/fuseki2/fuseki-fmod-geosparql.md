---
title: GeoSPARQL Module for Fuseki2
---

# GeoSPARQL Module for Fuseki2

The Fuseki2 server in the module `jena-fuseki-server` ships with the GeoSPARQL Fuseki Module `jena-fueski-mod-geosparql` which features GeoSPARQL support via the `jena-geosparql` module and the *spatial indexer* endpoint. Spatial indexes need to be manually updated after modifications to the underlying RDF data.
The spatial indexer endpoint provides a basic HTML page and Web API to re-index specific or all graphs of the underlying data set.

## Spatial Indexer Endpoint Configuration

The following snippet summarizes how to declare a spatial indexer endpoint in a Fuseki configuration.

```turtle
PREFIX fuseki: <http://jena.apache.org/fuseki#>

<#ep-spatial-indexer> fuseki:name "spatial-indexer" ;
  fuseki:operation fuseki:spatial-indexer ;
  fuseki:allowedUsers "anne" . # Optional access control.
```

The spatial indexer endpoint needs be registered with a service. The following shows an example where the spatial indexer endpoint is registered next to a usual query and update endpoint. Make sure to see Fuseki's documentation about [Access Control Lists](/documentation/fuseki2/fuseki-data-access-control.html#acl) for securing your endpoints!

```turtle
<#service> a fuseki:Service ;
  fuseki:name "ds" ;
  fuseki:endpoint [ fuseki:operation fuseki:query ] ;
  fuseki:endpoint [ fuseki:name "update" ; fuseki:operation fuseki:query ] ;
  fuseki:endpoint [
     fuseki:name "spatial-indexer" ;
     fuseki:operation fuseki:spatial-indexer ;
     fuseki:allowedUsers "anne" . # Optional access control.
  ] ;

  # ... further configuration ...
  fuseki:dataset  <#your-spatial-dataset> ;
  .
```

## Spatial Indexer Web API

* Access the spatial indexer Web page.

  ```bash
  curl http://localhost:3030/ds/spatial-indexer
  ```

* Note, if access control is enabled,then curl's `-u` option (short for `--user`) can be used to supply the credentials:

  ```bash
  curl http://localhost:3030/ds/spatial-indexer -u 'user:password'
  ```

* List available graphs. This API used to render the graph listing in the HTML view.  The `keyword`, `limti`, and `offset` options are optional. The given keyword is used for substring matching in the graph URIs. The default graph and union graph constants are also returned and can be passed to the `graph` option of the `index` command. The union graph constant is expanded to the set of all *named* graphs - i.e. the set of all graphs except for the default graph.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=graphs&offset=1&limit=10&keyword=some_keyword'
  ```

  ```json
  ["urn:x-arq:DefaultGraph","urn:x-arq:UnionGraph","http://your.named/graph"]
  ```

* Retrieve status information.

  ```bash
  curl -X POST 'http://localhost:3030/ds/spatial-indexer?command=status'
  ```

  ```json
  {"isIndexing":true,"isAborting":false,"time":1749320452197}
  ```

* Start a clean task. This removes dangling graph entries from the spatial index. These are entries in spatial index for which there is no longer a corresponding graph in the dataset.

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
  {"isIndexing":false,"error":"java.lang.InterruptedException\n\tat java.base/java.util.concurrent.FutureTask.awaitDone(FutureTask.java:418)\n\tat java.base/java.util.concurrent.FutureTask.get(FutureTask.java:190)\n\tat org.apache.jena.geosparql.spatial.index.v2.SpatialIndexerComputation.callActual(SpatialIndexerComputation.java:153)\n\tat org.apache.jena.geosparql.spatial.index.v2.SpatialIndexerComputation.call(SpatialIndexerComputation.java:128)\n\tat org.apache.jena.geosparql.spatial.index.v2.SpatialIndexLib$1.runActual(SpatialIndexLib.java:272)\n\tat org.apache.jena.geosparql.spatial.task.TaskThread.runInternal(TaskThread.java:159)\n\tat org.apache.jena.geosparql.spatial.task.TaskThread.run(TaskThread.java:150)\n","time":1749320601685}
  ```

  
