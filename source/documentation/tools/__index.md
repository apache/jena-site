---
title: Command-line and other tools for Jena developers
slug: index
---

Jena includes various command-line utilities which can help you with
a variety of tasks in developing Jena-based applications.

### Index of tools

  - [schemagen](schemagen.html)
  - [using schemagen from maven](schemagen-maven.html)

### Setting up your Environment

An environment variable `JENA_HOME` is used by all the command line tools to configure the class path automatically for you.  You can set this up as follows:

**On Linux / Mac**

  - `export JENA_HOME=`*the directory you downloaded Jena to*
  - `export PATH=$PATH:$JENA_HOME/bin`

**On Windows**

  - `SET JENA_HOME =`*the directory you downloaded Jena to*
  - `SET PATH=%PATH%;%JENA_HOME%\bat`

### Running the Tools

Once you've done the above you should now be able to run the tools from the command line like so:

**On Linux / Mac**

 - `sparql --version`

**On Windows**

 - `sparql.bat --version`

This command will simply print the versions of Jena and ARQ used in your distribution, all the tools support the `--version ` option.  To find out how to use a specific tool add the `--help` flag instead.

Note that many examples of using Jena tools typically use the Linux style invocation because most of the Jena developers work on Linux/Mac platforms.  When running on windows simply add `.bat` as an extension to the name of the command line tool to run it, on some versions of Windows this may not be required.


### Common Issues with Running the Tools

If you receive errors stating that a class is not found then it is most likely that `JENA_HOME` is not set correctly.  As a quick check you can try the following to see if it is set appropriately:

**On Linux / Mac**

 - `cd $JENA_HOME`

**On Windows**

 - `cd %JENA_HOME%`

If this command fails then `JENA_HOME` is not correctly set, please ensure you have set it correctly and try again.

Windows users may experience problems if trying to run the tools when their `JENA_HOME` path contains spaces in it, there are two workarounds for this:

 1. Move your Jena installation to a path without spaces
 1. Grab the latest scripts from [main][1] where they have been fixed to safely handle this.  Future releases will include this fix and resolve this issue

[1]: https://github.com/apache/jena/tree/main/apache-jena/bat/

### Command Line Tools Quick Reference

#### riot and Related 

See [Reading and Writing RDF in Apache Jena](https://jena.apache.org/documentation/io/) for more information.

- **`riot`**: parse RDF data, guessing the syntax from the file extension. Assumes that standard input is N-Quads/N-Triples unless 
you tell it otherwise with the `--syntax` parameter. `riot` can also do RDFS [inferencing](https://jena.apache.org/documentation/inference/), count triples, convert serializations, 
validate syntax, concatenate datasets, and more.

- **`turtle`**, **`ntriples`**, **`nquads`**, **`trig`**, **`rdfxml`**: specialized versions of `riot` that assume that the input is in the named serialization. 

- **`rdfparse`**: parse an RDF/XML document, for which you can usually just use `riot`, but this can also pull triples out of `rdf:RDF` elements 
embedded at arbitrary places in an XML document if you need to deal with those. 

#### SPARQL Queries on Local Files and Endpoints

See [ARQ - Command Line Applications](https://jena.apache.org/documentation/query/cmds.html) for more about these. 

- **`arq`** and **`sparql`**: run a query in a file named as a command line parameter on a dataset in one or more files named as command line parameters.

- **`qparse`**: parse a query, report on any problems, and output a pretty-printed version of the query.

- **`uparse`**: do the same thing as `qparse` but for update requests.

- **`rsparql`**: send a local query to a SPARQL endpoint specified with a URL, giving you the same choice of output formats 
that `arq` does.

- **`rupdate`**: send a local update query to a SPARQL endpoint specified with a URL, assuming that is accepting updates from you. 

#### Querying and Manipulating Fuseki Datasets

The following utilities let you work with data stored using a local
[Fuseki](https://jena.apache.org/documentation/fuseki2/) triplestore. They can
be useful for automating queries and updates of data stored there. Each
requires an [assembler file](https://jena.apache.org/documentation/assembler/assembler-howto.html)
pointing at a dataset as a parameter; Fuseki creates these for you.

For each pair of utilities shown, the first is used with data stored using the TDB format and the 
second with data stored using the newer and more efficient TDB2 format. 

The [TDB](https://jena.apache.org/documentation/tdb/) and [TDB2 - Command Line Tools](https://jena.apache.org/documentation/tdb2/tdb2_cmds.html) 
pages describe these further.

- **`tdbquery`**, **`tdb2.tdbquery`**: query a dataset that has been stored with Fuseki.

- **`tdbdump`**, **`tdb2.tdbdump`**: dump the contents of a Fuseki dataset to standard out.

- **`tdbupdate`**, **`tdb2.tdbupdate`**: run an update request against a Fuseki dataset.

- **`tdbloader`**, **`tdb2.tdbloader`**: load a data from a file into a Fuseki dataset.

- **`tdbstats`**, **`tdb2.tdbstats`**: output a short report of information about a Fuseki dataset.

- **`tdbbackup`**, **`tdb2.tdbbackup`**: create a gzipped copy of the Fuseki dataset's triples.

- **not implemented for TDB1**, **`tdb2.tdbcompact`**: reduce the size of the Fuseki dataset.



#### Other Handy Command Line Tools

- **`shacl`**: validate a dataset against a set of shapes and constraints described in a 
file that conforms to the W3C [SHACL](https://www.w3.org/TR/shacl/) standard. 
Jena's [SHACL](https://jena.apache.org/documentation/shacl/) page has more on this utility.

- **`shex`**: validate data using [ShEx](https://shex.io/) from the
[W3C Shape Expressions Community Group](https://www.w3.org/community/shex/).
Jena's [ShEx](https://jena.apache.org/documentation/shex/) page has more on this utility.

- **`rdfdiff`**: compare the triples in two datasets, regardless of their serializations, and list 
which are different between the two datasets. (Modeled on the UNIX `diff` utility.)

- **`iri`**: Parse a IRI and tell you about it, with errors and warnings. Good for 
checking for issues like proper escaping.

