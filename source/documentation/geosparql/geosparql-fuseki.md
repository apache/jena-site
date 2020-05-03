---
title: GeoSPARQL Fuseki
---

This application provides a HTTP server compliant with the GeoSPARQL standard.
It uses the embedded server Fuseki and provides additional parameters for dataset loading.

The project uses the GeoSPARQL implementation from the [GeoSPARQL Jena project](index).
Currently, there is no GUI interface as provided in the Fuseki distribution.

A subset of the EPSG spatial/coordinate reference systems are included by default from the Apache SIS project (http://sis.apache.org).
The full EPSG dataset is not distributed due to the EPSG terms of use being incompatible with the Apache Licence.
Several options are available to include the EPSG dataset by setting the `SIS_DATA` environment variable (http://sis.apache.org/epsg.html).

It is expected that at least one Geometry Literal or Geo Predicate is present in a dataset.
A spatial index is created and new data cannot be added to the index once built.
The spatial index can optionally be stored for future usage and needs to removed from a TDB folder if the index is to rebuilt.

## Getting Started
GeoSPARQL Fuseki can be accessed as an embedded server using Maven etc. from Maven Central or run from the command line.
SPARQL queries directly on Jena Datasets and Models can be done using
the [GeoSPARQL Jena project](index).

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>fuseki-geosparql</artifactId>
      <version>...</version>
    </dependency>

or download the binary from the 
[Maven central repository org/apache/jena/jena-fuseki-geosparql](http://central.maven.org/maven2/org/apache/jena/jena-fuseki-geosparql/)

### Command Line
Run from the command line and send queries over HTTP.

`java -jar jena-fuseki-geosparql-VER.jar ARGS`

written `geosparql-fuseki` below.

#### Examples

`java -jar jena-fuseki-geosparql-VER.jar -rf "geosparql_test.rdf" -i`

The example file `geosparql_test.rdf` in the GitHub repository contains several geometries in geodectic WGS84 (EPSG:4326).
The example file `geosparql_test_27700.rdf` is identical but in the projected OSGB36 (EPSG:27770) used in the United Kingdom.
Both will return the same results as GeoSPARQL treats all SRS as being projected.
RDFS inferencing is applied using the GeoSPARQL schema to infer additional relationships (which aren't asserted in the example files) that are used in the spatial operations and data retrieval.

Examples:

* Load RDF file (XML format) into memory and run server: `geosparql-fuseki -rf "test.rdf"`

* Load RDF file (TTL format: default) into memory, apply GeoSPARQL schema with RDFS inferencing and run server: `geosparql-fuseki -rf "test.rdf" -i`

* Load RDF file into memory, write spatial index to file and run server: `geosparql-fuseki -rf "test.rdf" -si "spatial.index"`

* Load RDF file into persistent TDB and run server: `geosparql-fuseki -rf "test.rdf" -t "TestTDB"`

* Load from persistent TDB and run server: `geosparql-fuseki -t "TestTDB"`

* Load from persistent TDB, change port and run server: `geosparql-fuseki -t "TestTDB" -p 3030`

 See [rdf-tables](https://github.com/galbiston/rdf-tables) in _Output Formats/Serialisations_ for supported RDF format keywords.

__N.B.__ Windows Powershell will strip quotation pairs from arguments and so triple quotation pairs may be required, e.g. """test.rdf""". Otherwise, logging output will be sent to a file called "xml". Also, "The input line is too long" error can mean the path to the  exceeds the character limit and needs shortening.

### Embedded Server
Run within a Java application to provide GeoSPARQL support over HTTP to other applications:

    FusekiLogging.setLogging();
    GeosparqlServer server =
        new GeosparqlServer(portNumber, datasetName, isLoopbackOnly, dataset, isUpdate);

## SPARQL Query Example
Once the default server is running it can be queried using Jena as follows:

    String service = "http://localhost:3030/ds";
    String query = ....;
    try (QueryExecution qe = QueryExecutionFactory.sparqlService(service, query)) {
        ResultSet rs = qe.execSelect();
        ResultSetFormatter.outputAsTSV(rs);
    }

The server will respond to any valid SPARQL HTTP so an alternative SPARQL framework can be used.
More information on SPARQL querying using Jena can be found on their website (https://jena.apache.org/tutorials/sparql.html).

## SIS_DATA Environment Variable
The Apache SIS library is used to support the recognition and transformation of Coordinate/Spatial Reference Systems.
These Reference Systems are published as the EPSG dataset.
The full EPSG dataset is not distributed due to the EPSG terms of use being incompatible with the Apache Licence.
A subset of the EPSG spatial/coordinate reference systems are included by default but the wider dataset may be required.
Several options are available to include the EPSG dataset by setting the `SIS_DATA` environment variable (http://sis.apache.org/epsg.html).

An embedded EPSG dataset can be included in an application by adding the following dependency:

* Gradle dependency in `build.gradle`

    ext.sisVersion = "0.8"
    implementation "org.apache.sis.non-free:sis-embedded-data:$sisVersion"

* Maven dependency in `pom.xml`

    <dependency>
      <groupId>org.apache.sis.non-free</groupId>
      <artifactId>sis-embedded-data</artifactId>
      <version>0.8</version>
    </dependency>

## Command Line Arguments

Boolean options that have false defaults only require "--option" to make true in release v1.0.7 or later.
Release v1.0.6 and earlier use the form "--option true".

### 1) Port

    --port, -p

The port number of the server. Default: 3030

### 2) Dataset name

    --dataset, -d

The name of the dataset used in the URL. Default: ds

### 3) Loopback only

    --loopback, -l

The server only accepts local host loopback requests. Default: true

### 4) SPARQL update allowed

    --update, -u

The server accepts updates to modify the dataset. Default: false

### 5) TDB folder

    --tdb, -t

An existing or new TDB folder used for the dataset. Default set to memory dataset.
If accessing a dataset for the first time with GeoSPARQL then consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset.

### 6) Load RDF file into dataset

    --rdf_file, -rf

Comma separated list of [RDF file path#graph name&RDF format] to load into dataset. Graph name is optional and will use default graph. RDF format is optional (default: ttl) or select from one of the following: json-ld, json-rdf, nt, nq, thrift, trig, trix, ttl, ttl-pretty, xml, xml-plain, xml-pretty.
e.g. `test.rdf#test&xml,test2.rdf` will load _test.rdf_ file into _test_ graph as _RDF/XML_ and _test2.rdf_ into _default_ graph as _TTL_.

Consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset.

### 7) Load Tabular file into dataset

    --tabular_file, -tf

Comma separated list of [Tabular file path#graph name|delimiter] to load into dataset. See RDF Tables for table formatting. Graph name is optional and will use default graph. Column delimiter is optional and will default to COMMA. Any character except ':', '^' and '|'. Keywords TAB, SPACE and COMMA are also supported.
e.g. `test.rdf#test|TAB,test2.rdf` will load _test.rdf_ file into _test_ graph as _TAB_ delimited and _test2.rdf_ into _default_ graph as _COMMA_ delimited.

See RDF Tables project (https://github.com/galbiston/rdf-tables) for more details on tabular format.

Consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset.

### 8) GeoSPARQL RDFS inference

    --inference, -i

Enable GeoSPARQL RDFS schema and inferencing (class and property hierarchy). Inferences will be applied to the dataset. Updates to dataset may require server restart. Default: false

### 9) Apply hasDefaultGeometry

    --default_geometry, -dg

Apply hasDefaultGeometry to single Feature hasGeometry Geometry statements. Additional properties will be added to the dataset. Default: false

### 10) Validate Geometry Literals

    --validate, -v

Validate that the Geometry Literals in the dataset are valid. Default: false

### 11) Convert Geo predicates

    --convert_geo, -c

Convert Geo predicates in the data to Geometry with WKT WGS84 Point GeometryLiteral. Default: false

### 12)  Remove Geo predicates

    --remove_geo, -rg

Remove Geo predicates in the data after combining to Geometry.

### 13) Query Rewrite enabled

    --rewrite, -r

Enable query rewrite extension of GeoSPARQL standard to simplify queries, which relies upon the 'hasDefaultGeometry' property. The 'default_geometry' may be useful for adding the 'hasDefaultGeometry' to a dataset. Default: true

### 14) Indexing enabled

    --index, -x

Enable caching of re-usable data to improve query performance. Default: true
See [GeoSPARQL Jena project](index) for more details.

### 15) Index sizes

    --index_sizes, -xs

List of Index item sizes: [Geometry Literal, Geometry Transform, Query Rewrite]. Unlimited: -1, Off: 0 Unlimited: -1, Off: 0, Default: -1,-1,-1

### 16) Index expiries

    --index_expiry, -xe

List of Index item expiry in milliseconds: [Geometry Literal, Geometry Transform, Query Rewrite]. Off: 0, Minimum: 1001, Default: 5000,5000,500

### 17) Spatial Index file

    --spatial_index, -si

File to load or store the spatial index. Default to "spatial.index" in TDB folder if using TDB and not set. Otherwise spatial index is not stored.

### 18) Properties File
Supply the above parameters as a file:

    $ java Main @/tmp/parameters

## Future Work
* GUI to assist users when querying a dataset.
