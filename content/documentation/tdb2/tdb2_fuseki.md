Title: DB2 - Use with Fuseki2

TDB2 is incorporated into Fuseki2, both in the full server, with UI, and
[Fuseki2 basic server](../fuseki2/fuseki-embedded.html#fuseki-basic).

In each case, the database needs to be defined in a configuration file,
either a completw server configuration (see below) or as an entry in the
`FUSEKI_BASE/configuration/` area of the full server.

Example complete server configuration file for full or basic servers:
The base URL will be of the form `http::/_host:port_/tdb2-database`.

Note the `tdb2:` prefix.

    PREFIX :        <#>
    PREFIX fuseki:  <http://jena.apache.org/fuseki#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    **PREFIX tdb2:    <http://jena.apache.org/2016/tdb#>**
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>
    
    [] rdf:type fuseki:Server ;
       fuseki:services (
         <#service_tdb2>
       ) .
    
    <#service_tdb2> rdf:type fuseki:Service ;
        rdfs:label                      "TDB2 Service (RW)" ;
        fuseki:name                     "tdb2-database" ;
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceUpdate            "update" ;
        fuseki:serviceUpload            "upload" ;
        fuseki:serviceReadWriteGraphStore      "data" ;
        # A separate read-only graph store endpoint:
        fuseki:serviceReadGraphStore       "get" ;
        fuseki:dataset           <#tdb_dataset_readwrite> ;
        .
    
    <#tdb_dataset_readwrite> rdf:type      **tdb2:DatasetTDB2** ;
        **tdb2:location** "TDB2" ;
        ## This works: tdb2:unionDefaultGraph true ;
        .

This example is available in [fuseki-tdb2.ttl](https://github.com/apache/jena/tree/master/jena-fuseki2/examples/fuseki-tdb2.ttl)

The key difference is the declared `rdf:type` of the dataset.

Note that the Fuseki UI does not provide a way to create TDB2 databases;
a configuration file must be used. Once setup, upload, query and graph
editting will be routed to the TDB2 database.

For a service configuration in `FUSEKI_BASE/configuration/`:

    PREFIX :        <#>
    PREFIX fuseki:  <http://jena.apache.org/fuseki#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX tdb2:    <http://jena.apache.org/2016/tdb#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>
    
    <#service_tdb2> rdf:type fuseki:Service ;
        rdfs:label                      "TDB2 Service (RW)" ;
        fuseki:name                     "tdb2-database" ;
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceUpdate            "update" ;
        fuseki:serviceUpload            "upload" ;
        fuseki:serviceReadWriteGraphStore      "data" ;
        # A separate read-only graph store endpoint:
        fuseki:serviceReadGraphStore       "get" ;
        fuseki:dataset           <#tdb_dataset_readwrite> ;
        .
    
    <#tdb_dataset_readwrite> rdf:type      **tdb2:DatasetTDB2** ;
        tdb2:location "TDB2" ;
        ## This works: tdb2:unionDefaultGraph true ;
         .
