---
title: ARQ - SPARQL Update
---

SPARQL Update is a W3C standard for an RDF update language with
SPARQL syntax. It is described in
"[SPARQL 1.1 Update](http://www.w3.org/TR/sparql11-update/)".

A SPARQL Update request is composed of a number of update
operations, so in a single request graphs can be created, loaded
with RDF data and modified.

Some examples of ARQ's SPARQL Update support are to be found in the
download in 
[jena-examples:arq/examples/update](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/update).

The main API classes are:

-   UpdateRequest - A list of Update to be performed.
-   UpdateFactory - Create UpdateRequest objects by parsing
    strings or parsing the contents of a file.
-   UpdateAction - execute updates

To execute a SPARQL Update request as a script from a file:

    Dataset dataset = ...
    UpdateAction.readExecute("update.ru", dataset) ;

To execute a SPARQL Update request as a string:

    Dataset dataset = ...
    UpdateAction.parseExecute("DROP ALL", dataset) ;

The application writer can create and execute operations:

    UpdateRequest request = UpdateFactory.create() ;
    request.add("DROP ALL")
           .add("CREATE GRAPH <http://example/g2>")
           .add("LOAD <file:etc/update-data.ttl> INTO <http://example/g2>") ;

    // And perform the operations.
    UpdateAction.execute(request, dataset) ;

but be aware that each operation added needs to be a complete
SPARQL Update operation, including prefixes if needed.

[ARQ documentation index](index.html)



