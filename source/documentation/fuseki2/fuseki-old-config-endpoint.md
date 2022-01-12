---
title: Fuseki Data Service Configuration Syntax - Old Style
---

This page describes the original Fuseki2 server configuration syntax.

Example:

    ## Updatable dataset.

    <#service1> rdf:type fuseki:Service ;
        fuseki:name                       "ds" ;       # http://host:port/ds
        fuseki:serviceQuery               "sparql" ;   # SPARQL query service
        fuseki:serviceQuery               "query" ;    # SPARQL query service (alt name)
        fuseki:serviceUpdate              "update" ;   # SPARQL update service
        fuseki:serviceReadWriteGraphStore "data" ;     # SPARQL Graph Store Protocol (read and write)
        fuseki:serviceReadGraphStore      "get" ;      # SPARQL Graph Store Protocol (read only)
        fuseki:dataset                    <#dataset> ;
        .

`<#dataset>` refers to a dataset description in the same file.

There are a fixed set of services:

| Service | Description |
|---------|-------------|
| fuseki:serviceQuery | SPARQL query service |
| fuseki:serviceUpdate | SPARQL update service |
| fuseki:serviceReadGraphStore | SPARQL Graph Store Protocol (read)
| fuseki:serviceReadWriteGraphStore | SPARQL Graph Store Protocol (read and write)

Configuration syntax can be mixed. If there are both old style and new style
configurations for the same endpoint, the new style configuration is used.

Quads operations on dataset are implied if there is a SPARQL Graph Store
Protocol service configured.

If a request is made on the dataset (no service name in the request URL), then
the dispatcher classifies the operation and looks for a named endpoint for that
operation of any name. If one is found, that is used. 
In the [full endpoint configuration syntax](fuseki-config-endpoint.html), the
additional dataset services are specified explicitly.

The equivalent of 

        fuseki:serviceQuery               "sparql" ;

is

        fuseki:endpoint [ fuseki:operation fuseki:query ; ];
        fuseki:endpoint [ fuseki:operation fuseki:query ; fuseki:name "sparql" ];

and the two endpoint can have different context setting and security.
