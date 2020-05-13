---
title: "Fuseki: Configuring Fuseki"
---

Configuration consists of defining the data services (data and actions available on the data) together with configuring the server.  Explicitly configuring the server is often unnecessary.

The data services configuration can come from:

1. The directory `FUSEKI_BASE/configuration/` with one data service assembler per file (includes endpoint details and the dataset description.)
2. The system database. This includes uploaded assembler files.  It also keeps the state of each data service (whether it's active or offline).
3. The service configuration file.  For compatibility, the service configuration file can also have data services. [See below](#relationship-to-fuseki-1-configuration).
4. The command line, if not running as a web application from a .war file.

`FUSEKI_BASE` is the location of the [Fuseki run area](./fuseki-layout.html).

## Data Service assembler

See [Fuseki Data Services](fuseki-data-services.html) for the architecture of data services.

See [Fuseki Security](fuseki-security.html) for more information on security.

## Fuseki Configuration File

A Fuseki server can be set up using a configuration file. The
command-line arguments for publishing a single dataset are a short
cut that, internally, builds a default configuration based on the
dataset name given.

The configuration is an RDF graph. One graph consists of one server
description, with a number of services, and each service offers a
number of endpoints over a dataset.

The example below is all one file (RDF graph in Turtle syntax)
split to allow for commentary.

### Prefix declarations

Some useful prefix declarations:

    @prefix fuseki:  <http://jena.apache.org/fuseki#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .
    @prefix ja:      <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix :        <#> .

### Assembler Initialization

All datasets are described by 
[assembler descriptions](../assembler/index.html).
Assemblers provide an extensible way of describing many kinds of
objects. 

### Defining the service name and endpoints available 

Each data service assembler defines:

* The base name
* The operations and endpoint names
* The dataset for the RDF data.

This example offers SPARQL Query, SPARQL Update and SPARQL Graph
Store protocol, as well as file upload.

Note: As of Jena 3.13.0, 
[an additional, more expressive configuration for endpoints](fuseki-config-endpoint.html)
is available.

The base name is `/ds`.

    ## Updateable in-memory dataset.

    <#service1> rdf:type fuseki:Service ;
        fuseki:name                       "ds" ;       # http://host:port/ds
        fuseki:serviceQuery               "sparql" ;   # SPARQL query service
        fuseki:serviceQuery               "query" ;    # SPARQL query service (alt name)
        fuseki:serviceUpdate              "update" ;   # SPARQL update service
        fuseki:serviceUpload              "upload" ;   # Non-SPARQL upload service
        fuseki:serviceReadWriteGraphStore "data" ;     # SPARQL Graph store protocol (read and write)
        # A separate read-only graph store endpoint:
        fuseki:serviceReadGraphStore      "get" ;      # SPARQL Graph store protocol (read only)
        fuseki:dataset                   <#dataset> ;
        .

`<#dataset>` refers to a dataset description in the same file.

### Read-only service

This example offers only read-only endpoints (SPARQL Query and HTTP GET
SPARQl Graph Store protocol).

This service offers read-only access to a dataset with a single
graph of data.

    <#service2> rdf:type fuseki:Service ;
        fuseki:name                     "/ds-ro" ;   # http://host:port/ds-ro
        fuseki:serviceQuery             "query" ;    # SPARQL query service
        fuseki:serviceReadGraphStore    "data" ;     # SPARQL Graph store protocol (read only)
        fuseki:dataset           <#dataset> ;
        .

### Dataset

#### In-memory

An in-memory dataset, with data in the default graph taken from a local file.

    <#books>    rdf:type ja:RDFDataset ;
        rdfs:label "Books" ;
        ja:defaultGraph
          [ rdfs:label "books.ttl" ;
            a ja:MemoryModel ;
            ja:content [ja:externalContent <file:Data/books.ttl> ] ;
          ] ;
        .

#### TDB

    <#dataset> rdf:type      tdb:DatasetTDB ;
        tdb:location "DB" ;
        # Query timeout on this dataset (1s, 1000 milliseconds)
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "1000" ] ;
        # Make the default graph be the union of all named graphs.
        ## tdb:unionDefaultGraph true ;
         .

#### TDB2

    <#dataset> rdf:type      tdb:DatasetTDB2 ;
        tdb:location "DB2" ;
        # Query timeout on this dataset (1s, 1000 milliseconds)
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "1000" ] ;
        # Make the default graph be the union of all named graphs.
        ## tdb:unionDefaultGraph true ;
         .

#### Inference

An inference reasoner can be layered on top of a dataset as defined above. The type of reasoner must be selected carefully and should not include more reasoning than is required by the application, as extensive reasoning can be detrimental to performance.

You have to build up layers of dataset, inference model, and graph.

    <#dataset> rdf:type ja:RDFDataset;
         ja:defaultGraph <#inferenceModel>
         .
         
    <#inferenceModel> rdf:type      ja:InfModel;
         ja:reasoner [ ja:reasonerURL <http://example/someReasonerURLHere> ];
         ja:baseModel <#baseModel>;
         .
    <#baseModel> rdf:type tdb:GraphTDB2;  # for example.
         tdb2:location "/some/path/to/store/data/to";
         # etc
         .

where `http://example/someReasonerURLHere` is one of the URLs below.

##### Possible reasoners:

Details are in [the main documentation for inference](/documentation/inference/).

* **Generic Rule Reasoner**: `http://jena.hpl.hp.com/2003/GenericRuleReasoner`
  
  The specific rule set and mode configuration can be set through parameters in the configuration Model.
  
* **Transitive Reasoner**: `http://jena.hpl.hp.com/2003/TransitiveReasoner`
  
  A simple "reasoner" used to help with API development.
  
  This reasoner caches a transitive closure of the subClass and subProperty graphs. The generated infGraph allows both the direct and closed versions of these properties to be retrieved. The cache is built when the tbox is bound in but if the final data graph contains additional subProperty/subClass declarations then the cache has to be rebuilt.

  The triples in the tbox (if present) will also be included in any query. Any of tbox or data graph are allowed to be null.

 * **RDFS Rule Reasoner**: `http://jena.hpl.hp.com/2003/RDFSExptRuleReasoner`

   A full implementation of RDFS reasoning using a hybrid rule system, together with optimized subclass/subproperty closure using the transitive graph caches. Implements the container membership property rules using an optional data scanning hook. Implements datatype range validation.

 * **Full OWL Reasoner**: `http://jena.hpl.hp.com/2003/OWLFBRuleReasoner`
   
   A hybrid forward/backward implementation of the OWL closure rules.

 * **Mini OWL Reasoner**: `http://jena.hpl.hp.com/2003/OWLMiniFBRuleReasoner`
   
   Key limitations over the normal OWL configuration are:
   * omits the someValuesFrom => bNode entailments
   * avoids any guard clauses which would break the find() contract
   * omits inheritance of range implications for XSD datatype ranges

 * **Micro OWL Reasoner**: `http://jena.hpl.hp.com/2003/OWLMicroFBRuleReasoner`
 
   This only supports:
   * RDFS entailments
   * basic OWL axioms like ObjectProperty subClassOf Property
   * intersectionOf, equivalentClass and forward implication of unionOf sufficient for traversal of explicit class hierarchies
   * Property axioms (inverseOf, SymmetricProperty, TransitiveProperty, equivalentProperty)

   There is some experimental support for the cheaper class restriction handlingly which should not be relied on at this point.

## Server Configuration

If you need to load additional classes, or set global parameters, then these go in
`FUSEKI_BASE/config.ttl`.

Additional classes can not be loaded if running as a `.war` file.  You will
need to create a custom `.war` file consisting of the contents of the Fuseki
web application and the additional classes

### Server Section

    [] rdf:type fuseki:Server ;
       # Server-wide context parameters can be given here.
       # For example, to set query timeouts: on a server-wide basis:
       # Format 1: "1000" -- 1 second timeout
       # Format 2: "10000,60000" -- 10s timeout to first result, then 60s timeout to for rest of query.
       # See java doc for ARQ.queryTimeout
       # ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "10000" ] ;

       # Load custom code (rarely needed)
       # ja:loadClass "your.code.Class" ;
       .

## Compatibility with Fuseki 1 configuration

Configurations from Fuseki 1, where all dataset and server setup is in a
single configuration file, will still work.  It is less flexible
(you can't restart these services after stopping them in a running server)
and user should plan to migrate to the [new layout](./fuseki-layout.html).

To convert a Fuseki 1 configuration setup to Fuseki 2 style, move each data service assembler and put in its own file under `FUSEKI_BASE/configuration/`
