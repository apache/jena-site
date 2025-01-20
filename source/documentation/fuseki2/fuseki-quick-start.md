---
title: Fuseki Quickstart
---

This page describes how to achieve certain common tasks in the most direct way possible.

## Running with Apache Jena Fuseki loading a file.

1. [Download](https://jena.apache.org/download/) the versioned distribution file 
   `apache-jena-fuseki-VER.zip'
2. Unpack the distribution. The directory will be `apache-jena-fuseki-VER/`
3. Run the script `fuseki-server`, or `fuseki-server.bat`.
4. In your browser, go to [http://localhost:3030/](http://localhost:3030/fuseki)
  (details such as port number depend optional arguments on the start-up script).
5. Click on "Add one", choose "in-memory", choose a name for the URL for the dataset.
6. Go to "add data" and load the file (single graph).

Try `fuseki-server --help` for command line options.

## Publish an RDF file as a SPARQL endpoint.

1. Unpack the distribution.
2. Run <tt>fuseki-server --file <i>FILE</i> /<i>name</i></tt>

The SPARQL endpoint will be <tt>http://localhost:3030/<i>name</i>/sparql</tt>
and the SPARQL UI at <tt>http://localhost:3030/#/dataset/<i>name</i>/query</tt>.

## Explore a TDB database

1. Unpack the distribution.
2. Run <tt>fuseki-server --loc=<i>DATABASE</i> /<i>name</i></tt>
3. In a browser, go to <tt>http://localhost:3030/#/dataset/<i>name</i>/query.html</tt>

More details on running Fuseki can be found on the [Fuseki Server](fuseki-server.html) page,
including running as an operating system service or as a web app on a
servlet container such as [Apache Tomcat](http://tomcat.apache.org/).
