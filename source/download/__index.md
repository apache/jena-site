---
title: Apache Jena Releases
slug: index
---
Apache Jena is packaged as downloads which contain the most commonly used portions of the systems:

- **apache-jena** &ndash; contains the APIs, SPARQL engine, the TDB native RDF database and command line tools
- **apache-jena-fuseki** &ndash; the Jena SPARQL server

Jena4 requires Java 11.

Jena jars are [available from Maven](maven.html).

You may [verify the authenticity of artifacts](https://www.apache.org/info/verification.html) below by using the [PGP KEYS](https://downloads.apache.org/jena/KEYS) file.

### Apache Jena Release

Source release: this forms the official release of Apache Jena. All binaries artifacts and maven binaries correspond to this source.

| Apache Jena Release | SHA512 | Signature |
| ------------ | :----: | :-------: |
|<a href="[preferred]jena/source/jena-4.4.0-source-release.zip">jena-4.4.0-source-release.zip</a> | [SHA512](https://downloads.apache.org/jena/source/jena-4.4.0-source-release.zip.sha512) | [PGP](https://downloads.apache.org/jena/source/jena-4.4.0-source-release.zip.asc) |

### Apache Jena Binary Distributions

The binary distribution of the Fuseki server:

| Apache Jena Fuseki  | SHA512 | Signature |
| ------------ | :----: | :-------: |
| <a href="[preferred]jena/binaries/apache-jena-fuseki-4.4.0.tar.gz">apache-jena-fuseki-4.4.0.tar.gz</a> | [SHA512](https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.4.0.tar.gz.sha512) | [PGP](https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.4.0.tar.gz.asc) |
| <a href="[preferred]jena/binaries/apache-jena-fuseki-4.4.0.zip">apache-jena-fuseki-4.4.0.zip</a> | [SHA512](https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.4.0.zip.sha512) | [PGP](https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.4.0.zip.asc) |

<p>&nbsp;</p>
The binary distribution of libraries contains the APIs, SPARQL engine, the TDB native RDF database and a variety of command line scripts and tools for working with these systems.

| Apache Jena libraries | SHA512 | Signature |
| ------------ | :----: | :-------: |
|<a href="[preferred]jena/binaries/apache-jena-4.4.0.tar.gz">apache-jena-4.4.0.tar.gz</a> | [SHA512](https://downloads.apache.org/jena/binaries/apache-jena-4.4.0.tar.gz.sha512) | [PGP](https://downloads.apache.org/jena/binaries/apache-jena-4.4.0.tar.gz.asc) |
| <a href="[preferred]jena/binaries/apache-jena-4.4.0.zip">apache-jena-4.4.0.zip</a> | [SHA512](https://downloads.apache.org/jena/binaries/apache-jena-4.4.0.zip.sha512) | [PGP](https://downloads.apache.org/jena/binaries/apache-jena-4.4.0.zip.asc)

<p>&nbsp;</p>
The binary distribution of Fuseki as a WAR file:

| Apache Jena Fuseki  | SHA512 | Signature |
| ------------ | :----: | :-------: |
| <a href="[preferred]jena/binaries/jena-fuseki-war-4.4.0.war">jena-fuseki-war-4.4.0.war</a> | [SHA512](https://downloads.apache.org/jena/binaries/jena-fuseki-war-4.4.0.war.sha512) | [PGP](https://downloads.apache.org/jena/binaries/jena-fuseki-war-4.4.0.war.asc) |

### Individual Modules

Apache Jena publishes a range of modules beyond those included in the binary distributions (code for all modules may be found in the source distribution).

Individual modules may be obtained using a dependency manager which can talk to Maven repositories, some modules are only available via Maven.

#### Maven

See "[Using Jena with Apache Maven](maven.html)" for full details.

    <dependency>
       <groupId>org.apache.jena</groupId>
       <artifactId>apache-jena-libs</artifactId>
       <type>pom</type>
       <version>X.Y.Z</version>
    </dependency>

#### Source code

The development codebase is available from git.

[https://gitbox.apache.org/repos/asf?p=jena.git](https://gitbox.apache.org/repos/asf?p=jena.git)

This is also available on github:

[https://github.com/apache/jena](https://github.com/apache/jena)

#### Previous releases

While previous releases are available, we strongly recommend that wherever
possible users use the latest official Apache releases of Jena in
preference to using any older versions of Jena.

Previous Apache Jena releases can be found in the Apache archive area
at [https://archive.apache.org/dist/jena](https://archive.apache.org/dist/jena/).

## Apache Software Foundation Distribution Directory (CDN)

The Apache Software foundation provides [CDN-distribution](https://dlcdn.apache.org/) for Apache projects and [the current release of Jena](https://dlcdn.apache.org/jena/). 

However Apache has a long history with using mirrors, and the distribution may still be found for the forseeable future on some hosted mirrors. According the the [Apache Mirror History page](https://apache.org/history/mirror-history.html)
> Any organization that has been hosting an Apache download mirror site, and that finds it useful for its own purposes, may continue to host the mirror site.

See also [the historical list of mirrors](https://web.archive.org/web/20211027074947/https://www.apache.org/mirrors/) from October in 2021.
