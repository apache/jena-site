---
title: Maven Artifacts for Apache Jena Elephas
---

The Apache Jena Elephas libraries for Apache Hadoop are a collection of maven artifacts which can be used individually
or together as desired.  These are available from the same locations as any other Jena
artifact, see [Using Jena with Maven](/download/maven.html) for more information.

# Hadoop Dependencies

The first thing to note is that although our libraries depend on relevant Hadoop libraries these dependencies
are marked as `provided` and therefore are not transitive.  This means that you may typically also need to 
declare these basic dependencies as `provided` in your own POM:

    <!-- Hadoop Dependencies -->
    <!-- Note these will be provided on the Hadoop cluster hence the provided 
            scope -->
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-common</artifactId>
      <version>2.6.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-mapreduce-client-common</artifactId>
      <version>2.6.0</version>
      <scope>provided</scope>
    </dependency>

### Using Alternative Hadoop versions

If you wish to use a different Hadoop version then we suggest that you build the modules yourself from source which can be
found in the `jena-elephas` folder of our source release (available on the [Downloads](../download/) page) or from our Git 
repository (see [Getting Involved](../getting_involved/) for details of the repository).

When building you need to set the `hadoop.version` property to the desired version e.g.

    > mvn clean package -Dhadoop.version=2.4.1

Would build for Hadoop `2.4.1`

**Note** that we only support Hadoop 2.x APIs and so Elephas cannot be built for Hadoop 1.x

# Jena RDF Tools for Apache Hadoop Artifacts

## Common API

The `jena-elephas-common` artifact provides common classes for enabling RDF on Hadoop.  This is mainly
composed of relevant `Writable` implementations for the various supported RDF primitives.

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-common</artifactId>
      <version>x.y.z</version>
    </dependency>

## IO API

The [IO API](io.html) artifact provides support for reading and writing RDF in Hadoop:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-io</artifactId>
      <version>x.y.z</version>
    </dependency>

## Map/Reduce

The [Map/Reduce](mapred.html) artifact provides various building block mapper and reducer implementations
to help you get started writing Map/Reduce jobs over RDF data quicker:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-mapreduce</artifactId>
      <version>x.y.z</version>
    </dependency>

## RDF Stats Demo

The [RDF Stats Demo](demo.html) artifact is a Hadoop job jar which can be used to run some simple demo applications over your
own RDF data:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-stats</artifactId>
      <version>x.y.z</version>
      <classifier>hadoop-job</classifier>
    </dependency>