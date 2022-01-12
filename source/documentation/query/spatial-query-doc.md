---
title: Spatial searches with SPARQL
---

This module was first released with Jena 2.11.0.
It was last released in Jena 3.12.0.

Jena provides a [GeoSPARQL implementation](../geosparql/).

----

This is an extension to Apache Jena ARQ, which combines SPARQL and simple spatial query.
It gives applications the ability to perform simple spatial searches within SPARQL queries.
Spatial indexes are additional information for accessing the RDF graph.

The spatial index can be either [Apache Lucene](http://lucene.apache.org/core) for a
same-machine spatial index, or [Apache Solr](http://lucene.apache.org/solr/)
for a large scale enterprise search application.

Some example code is [available here](https://github.com/apache/jena/tree/main/jena-spatial/src/main/java/examples/).

*Illustration*

This query makes a spatial query for the places within 10 kilometres of Bristol UK (which as latitude/longitude of 51.46, 2.6).

    PREFIX spatial: <http://jena.apache.org/spatial#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?placeName
    {
        ?place spatial:nearby (51.46 2.6 10 'km') .
        ?place rdfs:label ?placeName
    }

## Table of Contents

- [How to Use it by Code](#how-to-use-it-by-code)
    - [Create Spatial Dataset](#create-spatial-dataset)
    - [Supported Geo Data for Indexing and Querying](#supported-geo-data-for-indexing-and-querying)
        - [Builtin Geo Predicates](#builtin-geo-predicates)
        - [Custom Geo Predicates](#custom-geo-predicates)
    - [Load Geo Data into Spatial Dataset](#load-geo-data-into-spatial-dataset)
- [Property Function Library](#property-function-library)
- [Spatial Dataset Assembler](#spatial-dataset-assembler)
- [Working with Solr](#working-with-solr)
- [Working with Fuseki](#working-with-fuseki)
- [Building a Spatial Index](#building-a-spatial-index)


## How to Use it by Code

### Create Spatial Dataset

    import org.apache.jena.query.spatial.EntityDefinition
    ...
    // In Lucene, "entityField" stores the uri of the subject (e.g. a place), 
    // while "geoField" holds the indexed geo data (e.g. latitude/longitude).
    // Using fields "uri" and "geo":
    EntityDefinition entDef = new EntityDefinition("uri", "geo"); 

    // index in File system (or use an in-memory one)
    Directory dir = FSDirectory.open(indexDir); 

    // The baseDataset can be an in-memory or TDB/SDB file based one which contains the geo data. Join together into a dataset.
    Dataset spatialDataset = SpatialDatasetFactory.createLucene(baseDataset, dir, entDef); 
    ...

### Supported Geo Data for Indexing and Querying

#### Builtin Geo Predicates

There are mainly 2 types of RDF representation of geo data, which are both supported by jena-spatial:

**1) Latitude/Longitude Format (in gonames, DBPedia and Linked Geo Data)**

    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    :EGBB rdf:type :LargeAirport ;
        geo:lat "52.4539"^^xsd:float ;
        geo:long "-1.74803"^^xsd:float .
    :EGBB_String rdf:type :LargeAirport ;
        geo:lat "52.4539" ;
        geo:long "-1.74803" .

**2) Well Known Text (WKT) Literal (in DBPedia and Linked Geo Data)**

    PREFIX ogc: <http://www.opengis.net/ont/geosparql#>
    :node1000032677 a :Geometry ;
        ogc:asWKT "POINT(7.338818000000001 51.4433324)"^^ogc:wktLiteral .
    airports:EGBB_Fake_In_Box rdf:type airports_sc:LargeAirport ;
        ogc:asWKT "Polygon ((-2.0 51.2, 1.0 51.2, 1.0 51.8, -2.0 51.8, -2.0 51.2))"^^wkt:wktLiteral.

For 2) WKT, DBPedia uses `geo:geometry`, while Linked Geo Data adopts `ogc:asWKT` and `geo:geometry`.

**The builtin predicates that can be automatically processed by jena-spatial include: 1) `geo:lat`, `geo:long`; 2) `geo:geometry`, `ogc:asWKT`.**

**Important note** In order to read geo data in 2) WKT literal format, jena-spatial uses [JTS Topology Suite](http://tsusiatsoftware.net/jts/main.html),
which is under LGPL licence. jena-spatial **does not** make a hard dependency on JTS. In other words,
if an end user just uses the feature of 1), there's no need to depend on JTS (i.e. nothing needs to be done). If they want 2),
they can make it by setting the `SpatialContextFactory` of 
[EntityDefinition](https://github.com/apache/jena/tree/main/jena-spatial/src/main/java/org/apache/jena/query/spatial/EntityDefinition.java)
to `JtsSpatialContextFactory`, which is an optional choice. In this way, the JTS libs should be in the classpath. Here's the sample code: 

    import org.apache.jena.query.spatial.EntityDefinition
    ...
    EntityDefinition entDef = new EntityDefinition("uri", "geo");
    
    // use JtsSpatialContextFactory to support 2) WKT literals (optional)
    entDef.setSpatialContextFactory("com.spatial4j.core.context.jts.JtsSpatialContextFactory");
    ...
    
#### Custom Geo Predicates

However, there may be more predicates for other data sources for both 1) and 2).
jena-spatial provides an interface for consuming all kinds of custom geo predicates.
You can simply add predicates to let jena-spatial recognize them using 
[EntityDefinition](https://github.com/apache/jena/tree/main/jena-spatial/src/main/java/org/apache/jena/query/spatial/EntityDefinition.java):

    import org.apache.jena.query.spatial.EntityDefinition
    ...

    EntityDefinition entDef = new EntityDefinition("uri"", "geo");

    // custom geo predicates for 1) Latitude/Longitude Format
    Resource lat_1 = ResourceFactory.createResource("http://localhost/jena_example/#latitude_1") ;
    Resource long_1 ResourceFactory.createResource("http://localhost/jena_example/#longitude_1") ;
    entDef.addSpatialPredicatePair(lat_1, long_1) ;

    // custom geo predicates for Well Known Text (WKT) Literal
    Resource wkt_1 = ResourceFactory.createResource("http://localhost/jena_example/#wkt_1");
    entDef.addWKTPredicate( wkt_1 );

See more supported [geo data examples](https://github.com/apache/jena/tree/main/jena-spatial/src/test/resources/geoarq-data-1.ttl)

### Load Geo Data into Spatial Dataset

    spatialDataset.begin(ReadWrite.WRITE);
    try {
        Model m = spatialDataset.getDefaultModel();
        RDFDataMgr.read(m, file);
        spatialDataset.commit();
    } finally {
        spatialDataset.end();
    }

Now the spatial dataset is ready for spatial query.

## Property Function Library

The prefix spatial is `<http://jena.apache.org/spatial#>`.

|  &nbsp;Property name&nbsp;  |  &nbsp;Description&nbsp; |
|-------------------|--------------------------------|
|*?place* **spatial:nearby** *(latitude, longitude, radius [, units, limit])*<br>*?place* **spatial:withinCircle** *(latitude, longitude, radius [, units, limit])*|Query for the *?place* within the *radius* distance of the location of *(latitude, longitude)*. The distance *units* can be: "kilometres"/"km", "miles"/"mi", "metres"/"m", "centimetres"/"cm", "millimetres"/"mm" or "degrees"/"de", which are delivered as the optional strings (the default value is "kilometres"). *limit* is an optional integer parameter for the limit of the query results (if *limit*<0, return all query results).|
|*?place* **spatial:withinBox** *(latitude_min, longitude_min, latitude_max, longitude_max [, limit])*|Query for the *?place* within the box area of *(latitude_min, longitude_min, latitude_max, longitude_max)*.|
|*?place* **spatial:intersectBox** *(latitude_min, longitude_min, latitude_max, longitude_max [, limit])*|Query for the *?place* intersecting the box area of *(latitude_min, longitude_min, latitude_max, longitude_max)*.|
|*?place* **spatial:north** *(latitude, longitude [, limit])*|Query for the *?place* northing the location of *(latitude, longitude)*.|
|*?place* **spatial:south** *(latitude, longitude [, limit])*|Query for the *?place* southing the location of *(latitude, longitude)*.|
|*?place* **spatial:west** *(latitude, longitude [, limit])*|Query for the *?place* westing the location of *(latitude, longitude)*.|
|*?place* **spatial:east** *(latitude, longitude [, limit])*|Query for the *?place* easting the location of *(latitude, longitude)*.|

See [ESRIs docs on spatial relations](http://edndoc.esri.com/arcsde/9.1/general_topics/understand_spatial_relations.htm)

## Spatial Dataset Assembler

The usual way to describe an index is with a [Jena assembler description](/documentation/assembler/index.html). Configurations can also be built with [code](#how-to-use-it-by-code). The assembler describes a "spatial dataset" which has an underlying RDF dataset and a spatial index. The spatial index describes the spatial index technology (Lucene or Solr) and the details needed for each.

A spatial index has an 
[EntityDefinition](https://github.com/apache/jena/tree/main/jena-spatial/src/main/java/org/apache/jena/query/spatial/EntityDefinition.java)
which defines the properties to index, the name of the lucene/solr field used for storing the URI itself (e.g. "entityField") and its geo information (e.g. latitude/longitude as "geoField"), and the custom geo predicates.

For common RDF spatial query, only "entityField" and "geoField" are required with the [builtin geo predicates](#builtin-geo-predicates) working well. More complex setups, with multiple [custom geo predicates](#custom-geo-predicates) besides the two fields are possible.
You also optionally use JtsSpatialContextFactory to support indexing WKT literals. 

Once setup this way, any data added to the spatial dataset is automatically indexed as well.

The following is an example of a TDB dataset with a spatial index.

    ## Example of a TDB dataset and spatial index

    PREFIX :        <http://localhost/jena_example/#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>
    PREFIX spatial: <http://jena.apache.org/spatial#>
    
    ## ---------------------------------------------------------------
    ## This URI must be fixed - it's used to assemble the spatial dataset.
    
    :spatial_dataset rdf:type     spatial:SpatialDataset ;
        spatial:dataset   <#dataset> ;
        ##spatial:index   <#indexSolr> ;
        spatial:index     <#indexLucene> ;
        .
    
    <#dataset> rdf:type      tdb:DatasetTDB ;
        tdb:location "--mem--" ;
        tdb:unionDefaultGraph true ;
        .
    
    <#indexLucene> a spatial:SpatialIndexLucene ;
        #spatial:directory <file:Lucene> ;
        spatial:directory "mem" ;
        spatial:definition <#definition> ;
        .
    
    <#definition> a spatial:EntityDefinition ;
        spatial:entityField      "uri" ;
        spatial:geoField     "geo" ;
        # custom geo predicates for 1) Latitude/Longitude Format
        spatial:hasSpatialPredicatePairs (
             [ spatial:latitude :latitude_1 ; spatial:longitude :longitude_1 ]
             [ spatial:latitude :latitude_2 ; spatial:longitude :longitude_2 ]
             ) ;
        # custom geo predicates for 2) Well Known Text (WKT) Literal
        spatial:hasWKTPredicates (:wkt_1 :wkt_2) ;
        # custom SpatialContextFactory for 2) Well Known Text (WKT) Literal
        spatial:spatialContextFactory
             "com.spatial4j.core.context.jts.JtsSpatialContextFactory"
        .
        
then use code such as:

    Dataset spatialDataset = DatasetFactory.assemble( "spatial-config.ttl", 
        "http://localhost/jena_example/#spatial_dataset") ;

Key here is that the assembler contains two dataset definitions, one for the spatial dataset, one for the base data. Therefore, the application needs to identify the text dataset by its URI 'http://localhost/jena_example/#spatial_dataset'.

## Working with Solr

Besides Lucene, jena-spatial can work with Solr for spatial query, powered by [Lucene / Solr 4 Spatial](http://wiki.apache.org/solr/SolrAdaptersForLuceneSpatial4) and [Solrj](http://wiki.apache.org/solr/Solrj).

It's required to add the field definitions for "entityField" and "geoField" respectively in `schema.xml` of Solr.
The names of the fields in [EntityDefinition](https://github.com/apache/jena/tree/main/jena-spatial/src/main/java/org/apache/jena/query/spatial/EntityDefinition.java) should be in accordance with those in `schema.xml`.
Here is an example defining the names of "entityField" as "uri" and "geoField" as "geo":

    <field name="uri" type="string" indexed="true" stored="true" required="true" multiValued="false" /> 
    <field name="geo"  type="location_rpt"  indexed="true" stored="true"  multiValued="true" /> 

The fieldType of "entityField" is `string`, while that of "geoField" is `location_rpt`:
   
    <fieldType name="string" class="solr.StrField" sortMissingLast="true" />
    <fieldType name="location_rpt" class="solr.SpatialRecursivePrefixTreeFieldType" geo="true" distErrPct="0.025" maxDistErr="0.000009" units="degrees" />

Additionally, in `solrconfig.xml`, there should be 2 `requestHandlers` defined for querying and updating the spatial data and the index.
    
    <requestHandler name="/select" class="solr.SearchHandler"></requestHandler>
    <requestHandler name="/update" class="solr.UpdateRequestHandler"></requestHandler>

The above is the least required configuration to run jena-spatial in Solr.
For more information about the configuration, please check the [Lucene / Solr 4 Spatial](http://wiki.apache.org/solr/SolrAdaptersForLuceneSpatial4) documentation.
 
There are also some demonstrations of the usage of Solr in the [unit tests](https://github.com/apache/jena/tree/main/jena-spatial/src/test/java/org/apache/jena/query/spatial/pfunction/solr) of jena-spatial.
They use a `EmbeddedSolrServer`with a `SOLR_HOME` sample [here](https://github.com/apache/jena/tree/main/jena-spatial/src/test/resources/SolrHome).

## Working with Fuseki

The Fuseki configuration simply points to the spatial dataset as the fuseki:dataset of the service.

    <#service_spatial_tdb> rdf:type fuseki:Service ;
        rdfs:label                      "TDB/spatial service" ;
        fuseki:name                     "ds" ;
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceUpdate            "update" ;
        fuseki:serviceReadGraphStore    "get" ;
        fuseki:serviceReadWriteGraphStore    "data" ;
        fuseki:dataset                  :spatial_dataset ;


## Building a Spatial Index

When working at scale, or when preparing a published, read-only, SPARQL service, creating the index by loading the spatial dataset is impractical. The index and the dataset can be built using command line tools in two steps: first load the RDF data, second create an index from the existing RDF dataset.

Build the TDB dataset:

    java -cp $FUSEKI_HOME/fuseki-server.jar tdb.tdbloader --tdb=assembler_file data_file
    
using the copy of TDB included with Fuseki. Alternatively, use one of the TDB utilities tdbloader or tdbloader2:

    $JENA_HOME/bin/tdbloader --loc=directory  data_file
    
then build the spatial index with the jena.spatialindexer:

    java -cp jena-spatial.jar jena.spatialindexer --desc=assembler_file
    

