---
title: Maven Artifacts for Jena JDBC
---

The Jena JDBC libraries are a collection of maven artifacts which can be used individually
or together as desired.  These are available from the same locations as any other Jena
artifact, see [Using Jena with Maven](/download/maven.html) for more information.

## Core Library

The `jena-jdbc-core` artifact is the core library that contains much of the common implementation
for the drivers.  This is a dependency of the other artifacts and will typically only be required
as a direct dependency if you are implementing a [custom driver](custom_driver.html)

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-jdbc-core</artifactId>
      <version>x.y.z</version>
    </dependency>

## In-Memory Driver

The [in-memory driver](drivers.html#in-memory) artifact provides the JDBC driver for non-persistent
in-memory datasets.

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-jdbc-driver-mem</artifactId>
      <version>x.y.z</version>
    </dependency>

## TDB Driver

The [TDB driver](drivers.html#tdb) artifact provides the JDBC driver for [TDB](/documentation/tdb/)
datasets.

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-jdbc-driver-tdb</artifactId>
      <version>x.y.z</version>
    </dependency>

## Remote Endpoint Driver

The [Remote Endpoint driver](drivers.html#remote-endpoint) artifact provides the JDBC driver for accessing
arbitrary remote SPARQL compliant stores.

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-jdbc-driver-remote</artifactId>
      <version>x.y.z</version>
    </dependency>

## Driver Bundle

The driver bundle artifact is a shaded JAR (i.e. with dependencies included) suitable for dropping into tools
to easily make Jena JDBC drivers available without having to do complex class path setups.

This artifact depends on all the other artifacts.

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-jdbc-driver-bundle</artifactId>
      <version>x.y.z</version>
    </dependency>
