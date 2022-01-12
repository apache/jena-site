---
title: TDB2 - Use with Fuseki2
---

TDB2 is incorporated into Fuseki2, both in the full server, with UI, and
embeddable [Fuseki2 main server](../fuseki2/fuseki-embedded.html#fuseki-basic).

The TDB2 database can be in a configuration file,
either a complete server configuration (see below) or as an entry in the
`FUSEKI_BASE/configuration/` area of the full server.

The command line start-up for Fuseki (both full and basic versions) uses the
the `--tdb2` flag to modify the `--loc` argument to work with a TDB2 dataset.

Example complete server configuration file for full or basic servers:
The base URL will be of the form `http::/_host:port_/tdb2-database`.

Note the `tdb2:` prefix.

<pre>
PREFIX :        &lt;#&gt;
PREFIX fuseki:  &lt;http://jena.apache.org/fuseki#&gt;
PREFIX rdf:     &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;
PREFIX rdfs:    &lt;http://www.w3.org/2000/01/rdf-schema#&gt;
<b>PREFIX tdb2:    &lt;http://jena.apache.org/2016/tdb#&gt;</b>
PREFIX ja:      &lt;http://jena.hpl.hp.com/2005/11/Assembler#&gt;

[] rdf:type fuseki:Server ;
   fuseki:services (
     &lt;#service_tdb2&gt;
   ) .

&lt;#service_tdb2&gt; rdf:type fuseki:Service ;
    rdfs:label                      "TDB2 Service (RW)" ;
    fuseki:name                     "tdb2-database" ;
    fuseki:serviceQuery             "query" ;
    fuseki:serviceQuery             "sparql" ;
    fuseki:serviceUpdate            "update" ;
    fuseki:serviceReadWriteGraphStore      "data" ;
    # A separate read-only graph store endpoint:
    fuseki:serviceReadGraphStore       "get" ;
    fuseki:dataset           &lt;#tdb_dataset_readwrite&gt; ;
    .

&lt;#tdb_dataset_readwrite&gt; rdf:type      <b>tdb2:DatasetTDB2</b> ;
    <b>tdb2:location</b> "TDB2" ;
    ## This is supported: tdb2:unionDefaultGraph true ;
        .
</pre>

This example is available in [config-tdb2.ttl](https://github.com/apache/jena/blob/main/jena-fuseki2/examples/config-tdb2.ttl)

The key difference is the declared `rdf:type` of the dataset.

Note that the Fuseki UI does not provide a way to create TDB2 databases;
a configuration file must be used. Once setup, upload, query and graph
editing will be routed to the TDB2 database.

For a service configuration in `FUSEKI_BASE/configuration/`:

<pre>
PREFIX :        &lt;#&gt;
PREFIX fuseki:  &lt;http://jena.apache.org/fuseki#&gt;
PREFIX rdf:     &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;
PREFIX rdfs:    &lt;http://www.w3.org/2000/01/rdf-schema#&gt;
PREFIX tdb2:    &lt;http://jena.apache.org/2016/tdb#&gt;
PREFIX ja:      &lt;http://jena.hpl.hp.com/2005/11/Assembler#&gt;

&lt;#service_tdb2&gt; rdf:type fuseki:Service ;
    rdfs:label                      "TDB2 Service (RW)" ;
    fuseki:name                     "tdb2-database" ;
    fuseki:serviceQuery             "query" ;
    fuseki:serviceQuery             "sparql" ;
    fuseki:serviceUpdate            "update" ;
    fuseki:serviceReadWriteGraphStore      "data" ;
    # A separate read-only graph store endpoint:
    fuseki:serviceReadGraphStore       "get" ;
    fuseki:dataset           &lt;#tdb_dataset_readwrite&gt; ;
    .

&lt;#tdb_dataset_readwrite&gt; rdf:type      <b>tdb2:DatasetTDB2</b> ;
    <b>tdb2:location</b> "TDB2" ;
    ## tdb2:unionDefaultGraph true ;
     .
</pre>
