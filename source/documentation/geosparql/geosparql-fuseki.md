---
title: GeoSPARQL Fuseki
---

This application provides a HTTP server compliant with the GeoSPARQL standard.

GeoSPARQL can also be integrated with Fuseki using the 
[GeoSPARQL assembler](#fuseki-assembler) with a general Fuseki server.

## `jena-fuseki-geosparql` {#jena-fuseki-geosparql}

GeoSPARQL Fuseki can be accessed as an embedded server using Maven etc. from Maven Central or run from the command line.
SPARQL queries directly on Jena Datasets and Models can be done using
the [GeoSPARQL Jena module](index.html).

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-fuseki-geosparql</artifactId>
      <version>...</version>
    </dependency>

or download the binary from the 
[Maven central repository org/apache/jena/jena-fuseki-geosparql](https://repo1.maven.org/maven2/org/apache/jena/jena-fuseki-geosparql/)

This uses the embedded server Fuseki and provides additional parameters for dataset loading.

The project uses the GeoSPARQL implementation from the [GeoSPARQL Jena module](index.html), which includes a range of functions in addition to those from the GeoSPARQL standard.

Currently, there is no GUI interface as provided with this server.

The intended usage is to specify a TDB folder (either TDB1 or TDB2, created if
required) for persistent storage of the dataset. File loading, inferencing and
data conversion operations can also be specified to load and manipulate data
into the dataset. When the server is restarted these conversion operations are
not required again (as they have been stored in the dataset) unless there are
relevant changes. The TDB dataset can also be prepared and manipulated
programatically using the Jena API.

Updates can be made to the dataset while the Fuseki server is running. However,
these changes will not be applied to inferencing and spatial indexes until the
server restarts (any default or specified spatial index file must not exists to
trigger building). This is due to the current implementation of RDFS inferencing
in Jena (and is required in any Fuseki server with inferencing) and the selected
spatial index.

A subset of the EPSG spatial/coordinate reference systems are included by
default from the Apache SIS project (http://sis.apache.org).  The full EPSG
dataset is not distributed due to the EPSG terms of use being incompatible with
the Apache Licence.  Several options are available to include the EPSG dataset
by setting the `SIS_DATA` environment variable
(http://sis.apache.org/epsg.html).

It is expected that at least one Geometry Literal or Geo Predicate is present in
a dataset (otherwise a standard Fuseki server can be used).  A spatial index is
created and new data cannot be added to the index once built.  The spatial index
can optionally be stored for future usage and needs to removed from a TDB folder
if the index is to rebuilt.

## Clarifications on GeoSPARQL

### Geographic Markup Language (GML)

GeoSPARQL refers to the Geographic Markup Language (GML) as one format for
`GeometryLiterals`. This does not mean that GML is part of the GeoSPARQL
standard. Instead a subset of geometry encodings from the GML standards are
permitted (specifically the `GML 2.0 Simple Features Profile (10-100r3)` is
supported by GeoSPARQL Jena). The expected encoding of data is in RDF triples
and can be loaded from any RDF file format supported by Apache Jena. Conversion
of GML to RDF is out of scope of the GeoSPARQL standard and Apache Jena.

### Geo Predicates Lat/Lon

Historically, geospatial data has frequently been encoded as Latitude/Longitude
coordinates in the WGS84 coordinate reference system. The GeoSPARQL standard
specifically chooses not to adopt this approach and instead uses the more
versatile `GeometryLiteral`, which permits multiple encoding formats that support
multiple coordinate reference systems and geometry shapes. Therefore, Lat/Lon
Geo Predicates are not part of the GeoSPARQL standard. However, GeoSPARQL Jena
provides two methods to support users with geo predicates in their geospatial
data.

1. Conversion of Geo Predicates to the GeoSPARQL data structure (encoding the Lat/Lon as a Point geometry).
2. Spatial extension which provides property and filter functions accepting Lat/Lon arguments.

The Spatial extension functions (documented in the [GeoSPARQL Jena module](index)) support triples in either GeoSPARQL data structure or Geo Predicates. Therefore, converting a dataset to GeoSPARQL will not lose functionality. By converting to the GeoSPARQL data structure, datasets can include a broader range of geospatial data.

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
    try (QueryExecution qe = QueryExecution.service(service).query(query).build()) {
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

An existing or new TDB folder used to persist the dataset. Default set to memory dataset.
If accessing a dataset for the first time with GeoSPARQL then consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset. TDB1 Dataset will be used by default, use `-t <folder_path> -t2` options for TDB2 Dataset. 

### 6) Load RDF file into dataset

    --rdf_file, -rf

Comma separated list of [RDF file path#graph name&RDF format] to load into dataset. Graph name is optional and will use default graph. RDF format is optional (default: ttl) or select from one of the following: json-ld, json-rdf, nt, nq, thrift, trig, trix, ttl, ttl-pretty, xml, xml-plain, xml-pretty.
e.g. `test.rdf#test&xml,test2.rdf` will load _test.rdf_ file into _test_ graph as _RDF/XML_ and _test2.rdf_ into _default_ graph as _TTL_.

Consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset.

The combination of specifying `-t` TDB folder and `-rf` loading RDF file will store the triples in the persistent TDB dataset. Therefore, loading the RDF file would only be required once.

### 7) Load Tabular file into dataset

    --tabular_file, -tf

Comma separated list of [Tabular file path#graph name|delimiter] to load into dataset. See RDF Tables for table formatting. Graph name is optional and will use default graph. Column delimiter is optional and will default to COMMA. Any character except ':', '^' and '|'. Keywords TAB, SPACE and COMMA are also supported.
e.g. `test.rdf#test|TAB,test2.rdf` will load _test.rdf_ file into _test_ graph as _TAB_ delimited and _test2.rdf_ into _default_ graph as _COMMA_ delimited.

See RDF Tables project (https://github.com/galbiston/rdf-tables) for more details on tabular format.

Consider the `--inference`, `--default_geometry` and `--validate` options. These operations may add additional statements to the dataset.

The combination of specifying `-t` TDB folder and `-tf` loading tabular file will store the triples in the persistent TDB dataset. Therefore, loading the tabular file would only be required once.

### 8) GeoSPARQL RDFS inference

    --inference, -i

Enable GeoSPARQL RDFS schema and inferencing (class and property hierarchy). Inferences will be applied to the dataset. Updates to dataset may require server restart. Default: false

The combination of specifying `-t` TDB folder and `-i` GeoSPARQL RDFS inference will store the triples in the persistent TDB dataset. Therefore, the GeoSPARL RDFS inference option would only be required when there is a change to the dataset.

### 9) Apply hasDefaultGeometry

    --default_geometry, -dg

Apply hasDefaultGeometry to single Feature hasGeometry Geometry statements. Additional properties will be added to the dataset. Default: false

The combination of specifying `-t` TDB folder and `-dg` apply hasDefaultGeometry will modify the triples in the persistent TDB dataset. Therefore, applying hasDefaultGeometry would only be required when there is a change to the dataset.

### 10) Validate Geometry Literals

    --validate, -v

Validate that the Geometry Literals in the dataset are valid. Default: false

### 11) Convert Geo predicates

    --convert_geo, -c

Convert Geo predicates in the data to Geometry with WKT WGS84 Point GeometryLiteral. Default: false

The combination of specifying `-t` TDB folder and `-c` convert Geo predicates will modify the triples in the persistent TDB dataset. Therefore, converting the Geo predicates would only be required once.

### 12)  Remove Geo predicates

    --remove_geo, -rg

Remove Geo predicates in the data after combining to Geometry. Default: false

The combination of specifying `-t` TDB folder and `-rg` remove Geo predicates will modify the triples in the persistent TDB dataset. Therefore, removing the Geo predicates would only be required once.

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

File to load or store the spatial index. Default to "spatial.index" in TDB folder if using TDB option and this option is not set. Otherwise spatial index is not stored and rebuilt at start up. The spatial index file must not exist for the index to be built (e.g. following changes to the dataset).

### 18) Properties File
Supply the above parameters as a file:

    $ java Main @/tmp/parameters

## Future Work
* GUI to assist users when querying a dataset.
