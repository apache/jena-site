---
title: SDB Fuseki Integration
---

[Fuseki](../fuseki2/index.html) is a server
that implements the SPARQL protocol for HTTP. It can be used to
give a SPARQL interface to an SDB installation.

The Fuseki server needs the SDB jar files on its classpath. The
Fuseki server configuration file needs to contain two triples to integrate
SDB:

    [] rdf:type fuseki:Server ;
       fuseki:services (
         <#service1>
       ) .

    ## Declare that sdb:DatasetStore is an implementation of ja:RDFDataset .
    sdb:DatasetStore rdfs:subClassOf ja:RDFDataset .

then a Fuseki service can use an SBD-implemented dataset:

    <#dataset> rdf:type sdb:DatasetStore ;
        sdb:store <#store> .

    <#store> rdf:type sdb:Store ;
        sdb:layout     "layout2" ;
        sdb:connection <#conn> ;
        .

    <#conn> rdf:type sdb:SDBConnection ;
        ....

The database installation does not need to accept public requests,
it needs only to be accessible to the Fuseki server itself.


