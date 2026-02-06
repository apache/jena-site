---
title: GeoSPARQL Assembler
---

Details of the GeoSPARQL support are provided on the [GeoSPARQL page](index).

The assembler for GeoSPARQL support is part of the `jena-geosparql` artifact and
must be on the Fuseki server classpath, along with its dependencies.

```xml
<dependency>
  <groupId>org.apache.jena</groupId>
  <artifactId>jena-geosparql</artifactId>
  <version>...</version>
</dependency>
```

or download the binary from the 
[Maven central repository org/apache/jena/jena-geosparql](https://repo1.maven.org/maven2/org/apache/jena/jena-geosparql/)

The GeoSPARQL assembler can be used in a Fuseki configuration file.

This example is of a read-only: 

```sparql
PREFIX fuseki:    <http://jena.apache.org/fuseki#>
PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tdb2:      <http://jena.apache.org/2016/tdb#>

PREFIX ja:        <http://jena.hpl.hp.com/2005/11/Assembler#>
PREFIX geosparql: <http://jena.apache.org/geosparql#>

<#service> rdf:type fuseki:Service;
    fuseki:name "geo";
    fuseki:endpoint [ fuseki:operation fuseki:query; ] ;
    fuseki:dataset <#geo_ds> .

<#geo_ds> rdf:type geosparql:geosparqlDataset ;
    geosparql:spatialIndexFile     "run/databases/tdb2/mydb/spatial.index";
    geosparql:dataset <#baseDataset> ;
    geosparql:srsUri <http://www.opengis.net/def/crs/OGC/1.3/CRS84> ; # See note below.
    .

<#baseDataset> rdf:type tdb2:DatasetTDB2 ;
    tdb2:location "run/databases/tdb2/mydb" ;
    .
```

It is strongly advised to explicitly define a value for `geosparql:srsUri`. The spatial reference system (SRS) URI is needed during the initial construction of a spatial index. The SRS associated with an *existing* index takes precedence over the assembler option. In order for a modified SRS assembler configuration to take effect, the the existing persistent index file (pointed to by `geosparql:spatialIndexFile`) needs to be manually deleted.
If `geosparql:srsUri` is absent, then a value will be automatically computed by scanning all available geometric data and randomly selecting from the most prevalent SRS URIs. Scanning may take a while for large datasets.

It is possible to run with a data file loaded into memory and 
a spatial in-memory index:

```sparql
PREFIX fuseki:    <http://jena.apache.org/fuseki#>
PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>

PREFIX ja:        <http://jena.hpl.hp.com/2005/11/Assembler#>
PREFIX geosparql: <http://jena.apache.org/geosparql#>

<#service> rdf:type fuseki:Service;
    fuseki:name "ds";
    fuseki:endpoint [ fuseki:operation fuseki:query; ] ;
    fuseki:dataset <#geo_ds> .

# In-memory data and index.

<#geo_ds> rdf:type geosparql:geosparqlDataset ;
    geosparql:dataset <#baseDataset> .

<#baseDataset> rdf:type ja:MemoryDataset ;
    ja:data <file:geosparql_data.ttl> ;
    .
```

The full assembler properties with the default settings is:

```turtle
<#geo_ds> rdf:type geosparql:GeosparqlDataset ;
    # Build in-memory is absent.
    geosparql:spatialIndexFile     "run/databases/tdb2/mydb/spatial.index" ;

    geosparql:srsUri <http://www.opengis.net/def/crs/OGC/1.3/CRS84> ;

    ## Default settings. See documentation for meanings.
    geosparql:inference            true ;
    geosparql:queryRewrite         true ;
    geosparql:indexEnabled         true ;
    geosparql:applyDefaultGeometry false ;
    
    # 3 item lists: [Geometry Literal, Geometry Transform, Query Rewrite]
    geosparql:indexSizes           "-1,-1,-1" ;       # Default - unlimited.
    geosparql:indexExpires         "5000,5000,5000" ; # Default - time in milliseconds.

    ## Required setting - data over which GeoSPARQL is applied.
    geosparql:dataset <#baseDataset> ;
    .
```

