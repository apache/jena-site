---
title: Apache Jena Releases
slug: index
---

Apache Jena is packaged as downloads which contain the most commonly used portions of the systems:

- **apache-jena** &ndash; contains the APIs, SPARQL engine, the TDB native RDF database and command line tools
- **apache-jena-fuseki** &ndash; the Jena SPARQL server

Jena4 requires Java 11.

## Download Mirrors

<p>[if-any logo]
<a href="[link]">
  <img align="right" src="[logo]" border="0" />
</a>[end]
The currently selected mirror is <b>[preferred]</b>.  If you encounter a problem with this mirror, please select another mirror.  If all
mirrors are failing, there are <i>backup</i> mirrors (at the end of the mirrors list) that should be available.</p>

<form action="[location]" method="get" id="SelectMirror">
Other mirrors: <select name="Preferred">
[if-any http]
  [for http]<option value="[http]">[http]</option>[end]
[end]

[if-any ftp]
  [for ftp]<option value="[ftp]">[ftp]</option>[end]
[end]
[if-any backup]
  [for backup]<option value="[backup]">[backup]
  (backup)</option>[end]
[end]
</select>
<input type="submit" value="Change" />
</form>

You may also consult the [complete list of mirrors](http://www.apache.org/mirrors/)

### Apache Jena

This distribution contains the APIs, SPARQL engine, the TDB native RDF database and a variety of command line scripts and tools for working with these systems.

The binary distribution may be downloaded at:

<a href="[preferred]jena/binaries/apache-jena-4.0.0.tar.gz">apache-jena-4.0.0.tar.gz</a>
(<a href="https://downloads.apache.org/jena/binaries/apache-jena-4.0.0.tar.gz.sha512">SHA512</a>, 
<a href="https://downloads.apache.org/jena/binaries/apache-jena-4.0.0.tar.gz.asc">PGP</a>)

<a href="[preferred]jena/binaries/apache-jena-4.0.0.zip">apache-jena-4.0.0.zip</a>
(<a href="https://downloads.apache.org/jena/binaries/apache-jena-4.0.0.zip.sha512">SHA512</a>,
<a href="https://downloads.apache.org/jena/binaries/apache-jena-4.0.0.zip.asc">PGP</a>)

The source distribution, which includes the source for Fuseki and all modules in the release, may be downloaded at:

<a href="[preferred]jena/source/jena-4.0.0-source-release.zip">jena-4.0.0-source-release.zip</a>
(<a href="https://downloads.apache.org/jena/source/jena-4.0.0-source-release.zip.sha512">SHA512</a>,
<a href="https://downloads.apache.org/jena/source/jena-4.0.0-source-release.zip.asc">PGP</a>)

### Apache Jena Fuseki

The binary distribution of Fuseki2 (this includes both the standalone and
WAR file packaging) may be downloaded at:

<a href="[preferred]jena/binaries/apache-jena-fuseki-4.0.0.tar.gz">apache-jena-fuseki-4.0.0.tar.gz</a>
(<a href="https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.0.0.tar.gz.sha512">SHA512</a>,
<a href="https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.0.0.tar.gz.asc">PGP</a>)

<a href="[preferred]jena/binaries/apache-jena-fuseki-4.0.0.zip">apache-jena-fuseki-4.0.0.zip</a>
(<a href="https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.0.0.zip.sha512">SHA512</a>,
<a href="https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.0.0.zip.asc">PGP</a>)

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

This is mirrored on github:

[https://github.com/apache/jena](https://github.com/apache/jena)

#### Previous releases

While previous releases are available, we strongly recommend that wherever
possible users use the latest official Apache releases of Jena in
preference to using any older versions of Jena.

Previous Apache Jena releases can be found in the Apache archive area
at [http://archive.apache.org/dist/jena](http://archive.apache.org/dist/jena/)
