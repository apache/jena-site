---
title: Using Jena with Apache Maven
---

[Apache Maven](http://maven.apache.org) is a tool to help Java projects manage
their dependencies on library code, such as Jena. By declaring a dependency on
the core of Jena in your project's <code>pom.xml</code> file, you will get the
consistent set of library files that Jena depends on automatically added too.

This page assumes you have Maven installed on your computer. If this is not the case,
please read and follow [these instructions](http://maven.apache.org/download.html#Installation).

### Repositories

Released maven artifacts are mirrored to the central maven repositories.

Development snapshots are available as well.  
[https://repository.apache.org/content/repositories/snapshots/](https://repository.apache.org/content/repositories/snapshots/)

Stable Jena releases are automatically mirrored by the central Maven
repositories, so there will normally be no need to add any extra
repositories to your <code>pom.xml</code> or <code>settings.xml</code>.

### Specifying Jena as a dependency

This is how to specify in your pom.xml file the dependency
on a version of Jena:

      <dependency>
        <groupId>org.apache.jena</groupId>
        <artifactId>apache-jena-libs</artifactId>
        <type>pom</type>
        <version>X.Y.Z</version>
      </dependency>

This will transitively resolve all the dependencies for you: `jena-core`,
`jena-arq`, `jena-tdb` and `jena-iri` and their dependencies.  

Note the use of `<type>pom</type>` above.

Other modules need to be added separately, for example:

      <dependency>
        <groupId>org.apache.jena</groupId>
        <artifactId>jena-text</artifactId>
        <version>x.y.z</version>
      </dependency>

Please check for the latest versions.

### Major Artifacts

Jena provides a number of maven artifacts as delivery points.  
There are also a number of maven artifacts used as part of
structuring Jena development.

<table>
  <tr>
    <th>Artifact ID</th>
    <th>Packaging (&lt;type&gt;)</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>apache-jena-libs</code></td>
    <td><code>pom</code></td>
    <td>A POM artifact that may be referenced to pull in all the standard Jena Libraries (Core, ARQ, IRI, and TDB) with a single dependency.</td>
  </tr>
  <tr>
    <td><code>apache-jena</code></td>
    <td><code>pom</code></td>
    <td>The binary distribution</td>
  </tr>
  <tr>
    <td><code>apache-jena-fuseki</code></td>
    <td><code>pom</code></td>
    <td>Fuseki2 distribution</td>
  </tr>
  <tr>
    <td><code>jena</code></td>
    <td></td>
    <td>The formal released source-released for each Jena release. This is not a maven-runnable set of binary files</td>
  </tr>
  <tr>
    <td><code>jena-fuseki-main</code></td>
    <td><code>war</code></td>
    <td>Fuseki packaged for standalone and embedded use.<td>
  </tr>
  <tr>
    <td><code>jena-text</code></td>
    <td><code>jar</code></td>
    <td>SPARQL Text Search. Included in Fuseki.</td>
  </tr>
  <tr>
    <td><code>jena-shacl</code></td>
    <td><code>jar</code></td>
    <td>SHACL engine for Jena.</td>
  </tr>
  <tr>
    <td><code>jena-shex</code></td>
    <td><code>jar</code></td>
    <td>ShEx engine for Jena.</td>
  </tr>
  <tr>
    <td><code>jena-serviceenhancer</code></td>
    <td><code>jar</code></td>
    <td>Bulk retrieval and caching for SERVICE clauses</td>
  </tr>
  <tr>
    <td><code>jena-querybuilder</code></td>
    <td><code>jar</code></td>
    <td>A utility package to simplify the building of ARQ queries in code.
    </td>
  </tr>
  <tr>
    <td><code>jena-permissions</code></td>
    <td><code>jar</code></td>
    <td>Security wrapper around Jena RDF implementation.</td>
  </tr>
  <tr>
    <td><code>jena-jdbc-driver-bundle</code></td>
    <td><code>jar</code></td>
    <td>A collection of JDBC drivers</td>
  </tr>
</table>

There are also a number of artifacts used in development.
The full list can be seen by browsing Maven 

[Released Jena artifacts](https://repo1.maven.org/maven2/org/apache/jena/)

(This includes historic artifacts which are no longer active.)

You can run <code>mvn dependency:tree</code> to print the dependency
tree. 

### Specifying dependencies on SNAPSHOTs

If you want to depend on Jena development snapshots and help with Jena
development, e.g. to get access to recent bug fixes for testing, you
should add the following to your <code>pom.xml</code>:

      <repository>
        <id>apache-repo-snapshots</id>
        <url>https://repository.apache.org/content/repositories/snapshots/</url>
        <releases>
          <enabled>false</enabled>
        </releases>
        <snapshots>
          <enabled>true</enabled>
        </snapshots>
      </repository>

### Build and install artifacts in your local Maven repository

If you want you can checkout the Jena sources, build the artifacts and
install them in your local Maven repository, then you simply checkout the source 
tree and build with maven 
<code>mvn install</code>. This assumes you have Maven and Git installed:

    git clone https://github.com/apache/jena/
    cd jena
    mvn clean install

Each of the modules can be built on its own but they
require the current snapshots and Jena parent POM to be installed.
