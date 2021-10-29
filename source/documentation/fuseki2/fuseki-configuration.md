---
title: "Fuseki: Configuring Fuseki"
---

A Fuseki server is configured by defining the data services (data and actions available on the data). There is also server configuration although this is often unnecessary.

The data services configuration can come from:

For Fuseki Full (webapp with UI):

1. The directory `FUSEKI_BASE/configuration/` with one data service assembler per file (includes endpoint details and the dataset description.)
2. The system database. This includes uploaded assembler files.  It also keeps the state of each data service (whether it's active or offline).
3. The server configuration file `config.ttl`.  For compatibility, the server configuration file can also have data services.
4. The command line, if not running as a web application from a .war file.

`FUSEKI_BASE` is the location of the [Fuseki run area](./fuseki-layout.html).

For [Fuseki Main](fuseki-main.html):

1. The command line, using `--conf` to provide a configuration file.
2. The command line, using arguments (e.g. `--mem /ds` or `--tdb2 --loc DB2 /ds`).
3. [Programmatic configuration](fuseki-main.html#build) of the server.

See [Fuseki Security](fuseki-security.html) for more information on security configuration.

## Examples

Example server configuration files can be found at [jena-fuseki2/examples](https://github.com/apache/jena/tree/main/jena-fuseki2/examples).

## Security and Access Control

Access Control can be configured on any of the server, data service or dataset.
[Fuseki Data Access Control](fuseki-data-access-control.html).

Separately, Fuseki Full has request based security filtering provided by Apache Shiro:
[Fuseki Full Security](fuseki-security.html)

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

    PREFIX fuseki:  <http://jena.apache.org/fuseki#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX tdb1:    <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX tdb2:    <http://jena.apache.org/2016/tdb#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>
    PREFIX :        <#>

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

See [Data Service Configuration Syntax](fuseki-config-endpoint.html) for the complete details of the endpoint configuration description. Here, we show some examples.

The [original configuration](fuseki-old-config-endpoint.html) syntax, using, for example, `fuseki:serviceQuery`, is still supported.

The base name is `/ds`.

    ## Updatable in-memory dataset.

    <#service1> rdf:type fuseki:Service ;
        fuseki:name   "ds" ;       # http://host:port/ds
        fuseki:endpoint [ 
             # SPARQL query service
            fuseki:operation fuseki:query ; 
            fuseki:name "sparql"
        ] ;
        fuseki:endpoint [ 
             # SPARQL query service (alt name)
            fuseki:operation fuseki:query ; 
            fuseki:name "query" 
        ] ;

        fuseki:endpoint [ 
             # SPARQL update service
            fuseki:operation fuseki:update ; 
            fuseki:name "update" 
        ] ;

        fuseki:endpoint [ 
             # HTML file upload service
            fuseki:operation fuseki:update ; 
            fuseki:name "update" 
        ] ;

        fuseki:endpoint [ 
             # SPARQL Graph Store Protocol (read)
            fuseki:operation fuseki:gsp_r ; 
            fuseki:name "get" 
        ] ;
        fuseki:endpoint [ 
            # SPARQL Graph Store Protcol (read and write)
            fuseki:operation fuseki:gsp_rw ; 
            fuseki:name "data" 
        ] ;

        fuseki:dataset  <#dataset> ;
        .

`<#dataset>` refers to a dataset description in the same file.

HTTP requests will include the service name: <tt>http://<i>host:port</i>/ds/sparql?query=.\..</tt>.

### Read-only service

This example offers only read-only endpoints (SPARQL Query and HTTP GET
SPARQL Graph Store protocol).

This service offers read-only access to a dataset with a single
graph of data.

    <#service2> rdf:type fuseki:Service ;
        fuseki:name      "/ds-ro" ;   # http://host:port/ds-ro
        fuseki:endpoint  [ fuseki:operation fuseki:query ; fuseki:name "sparql" ];
        fuseki:endpoint  [ fuseki:operation fuseki:query ; fuseki:name "query" ];
        fuseki:endpoint  [ fuseki:operation fuseki:gsp_r ; fuseki:name "data" ];
        fuseki:dataset           <#dataset> ;
        .

### Data services on the dataset

The standard SPARQL operations can also be defined on the dataset URL with no secondary service name:

<#service2> rdf:type fuseki:Service ;
        fuseki:name     "/dataset" ;
        fuseki:endpoint  [ fuseki:operation fuseki:query ];
        fuseki:endpoint  [ fuseki:operation fuseki:gsp_r ];
        fuseki:dataset  <#dataset> ;
        .

HTTP requests use the URL of the dataset.

* SPARQL Query: <tt>http://<i>host:port</i>/dataset?query=.\..</tt>
* Fetch the default graph 
([SPARQL Graph Store Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/)):
<tt>http://<i>host:port</i>/dataset?default</tt>

## Server Configuration

If you need to load additional classes, or set global parameters, then these go in
`FUSEKI_BASE/config.ttl`.

Additional classes can not be loaded if running as a `.war` file.  You will
need to create a custom `.war` file consisting of the contents of the Fuseki
web application and the additional classes

The server section is optional.

If absent, fuseki configuration is performed
by searching the configuration file for the type `fuseki:Service`.

### Server Section

    [] rdf:type fuseki:Server ;
       # Server-wide context parameters can be given here.
       # For example, to set query timeouts: on a server-wide basis:
       # Format 1: "1000" -- 1 second timeout
       # Format 2: "10000,60000" -- 10s timeout to first result, then 60s timeout to for rest of query.
       # See java doc for ARQ.queryTimeout
       # ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "10000" ] ;

       # Explicitly choose which services to add to the server.
       # If absent, include all descriptions of type `fuseki:Service`.
       # fuseki:services (<#service1> <#service2>)
       .

## Datasets

### In-memory

An in-memory dataset, with data in the default graph taken from a local file.

    <#books>    rdf:type ja:RDFDataset ;
        rdfs:label "Books" ;
        ja:defaultGraph
          [ rdfs:label "books.ttl" ;
            a ja:MemoryModel ;
            ja:content [ja:externalContent <file:Data/books.ttl> ] ;
          ] ;
        .

### TDB

    <#dataset> rdf:type      tdb:DatasetTDB ;
        tdb:location "DB" ;
        # Query timeout on this dataset (1s, 1000 milliseconds)
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "1000" ] ;
        # Make the default graph be the union of all named graphs.
        ## tdb:unionDefaultGraph true ;
         .

### TDB2

    <#dataset> rdf:type      tdb:DatasetTDB2 ;
        tdb:location "DB2" ;
        # Query timeout on this dataset (1s, 1000 milliseconds)
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "1000" ] ;
        # Make the default graph be the union of all named graphs.
        ## tdb:unionDefaultGraph true ;
         .

### Inference

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

#### Possible reasoners:

Details are in [the main documentation for inference](/documentation/inference/).

* **Generic Rule Reasoner**: `http://jena.hpl.hp.com/2003/GenericRuleReasoner`
  
  The specific rule set and mode configuration can be set through parameters in the configuration Model.
  
* **Transitive Reasoner**: `http://jena.hpl.hp.com/2003/TransitiveReasoner`
  
  A simple "reasoner" used to help with API development.
  
  This reasoner caches a transitive closure of the subClass and subProperty graphs. The generated infGraph allows both the direct and closed versions of these properties to be retrieved. The cache is built when the tbox is bound in but if the final data graph contains additional subProperty/subClass declarations then the cache has to be rebuilt.

  The triples in the tbox (if present) will also be included in any query. Any of tbox or data graph are allowed to be null.

  **RDFS Rule Reasoner**: `http://jena.hpl.hp.com/2003/RDFSExptRuleReasoner`

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

 There is some experimental support for the cheaper class restriction handling which should not be relied on at this point.
