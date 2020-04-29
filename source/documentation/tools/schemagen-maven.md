---
title: Schemagen Maven
---

# Schemagen-maven: generating Java source files from OWL and RDFS ontologies via Maven

The [Apache Jena](/) command line tool
[`schemagen`](/documentation/tools/schemagen.html)
provides an automated way of creating
Java source code constants from ontology files in an RDF-based project. This
can be very convenient, as it provides both a level of robustness that the
names of RDF classes, properties and individuals are being used correctly, and
it can be used by IDE's such as Eclipse to provide name-completion for
constants from the ontology.

For some projects, invoking `schemagen` from the command line, perhaps via `ant`,
is sufficient. For projects organised around Apache Maven, it would be convenient to integrate
the schemagen translation step into Maven's normal build process. This plugin
provides a means to do just that.

## Pre-requisites

This plugin adds a step to the Maven build process to automatically translate RDFS
and OWL files, encoded as RDF/XML, Turtle or N-triples into Java source files.
This plugin is designed to be used with a Java project that is already using Apache Maven to
control the build. Non-Java projects do not need this tool. Projects that are
not using Maven should see the [schemagen documentation](schemagen.html)
for ways to run `schemagen` from the command line.


## Installing

Schemagen is available from the maven central repository. To use it, add
the following dependency to your `pom.xml`:

    <build>
      <plugins>
        <plugin>
          <groupId>org.apache.jena</groupId>
          <artifactId>jena-maven-tools</artifactId>
          <version>x.y.z</version>
          <executions>
            <execution>
              <id>schemagen</id>
              <goals>
                <goal>translate</goal>
              </goals>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
    <dependencies>
       <dependency>
         <groupId>org.apache.jena</groupId>
         <artifactId>jena-core</artifactId>
         <version>x.y.z</version>
      </dependency>
    </dependencies>

Replace the `x.y.z` above with the latest versions as found by
browsing [jena-maven-tools](http://central.maven.org/maven2/org/apache/jena/jena-maven-tools/) 
and [jena-core](http://central.maven.org/maven2/org/apache/jena/jena-core/) in Maven Central.


## Configuration: basic principles

Schemagen supports a large number of options, controlling such things as the name of the
input file, the RDF namespace to expect, which Java package to place the output in and
so forth. For a command line or Ant-based build, these options are normally passed on
a per-file basis. When using maven, however, we point the plugin at a whole collection of input
files to be converted to Java, and let the plugin figure out which ones need updating (e.g. because
the RDF source is newer than the Java output, or because the Java file has not yet
been generated). So we need:

  * a mechanism to specify which files to process
  * a mechanism to specify common options for all input files
  * a mechanism to specify per-file unique options

In Maven, all such configuration information is provided via the `pom.xml` file. We tell
Maven to use the plugin via the `<build> <plugins>` section:

    <build>
      <plugins>
        <plugin>
          <groupId>org.apache.jena</groupId>
          <artifactId>jena-maven-tools</artifactId>
          <version>x.y.z</version>
          <configuration>
          </configuration>
          <executions>
            <execution>
              <id>schemagen</id>
              <goals>
                <goal>translate</goal>
              </goals>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>

Replace the `x.y.z` above with the latest versions as found by
browsing [jena-maven-tools](http://central.maven.org/maven2/org/apache/jena/jena-maven-tools/) 
 in Maven Central.


The configuration options all nest inside the `<configuration>` section.

### Specifying files to process

An `<include>` directive specifies one file pattern to include in the set of
files to process. Wildcards may be used. For example, the following section
specifies that the tool will process all Turtle files, and the `foaf.rdf` file,
in `src/main/vocabs`:

    <includes>
      <include>src/main/vocabs/*.ttl</include>
      <include>src/main/vocabs/foaf.rdf</include>
    </includes>

### Specifying processing options

Options are, in general, given in the `<fileOptions>` section. A given
`<source>` refers to one input source - one file - as named by the
`<input>` name. The actual option names are taken from the RDF [config
file property names](/documentation/tools/schemagen.html),
omitting the namespace:

          <fileOptions>
            <source>
              <!-- Test2.java (only) will contain OntModel declarations -->
              <input>src/main/vocabs/demo2.ttl</input>
              <ontology>true</ontology>
            </source>
          </fileOptions>

The special source `default` provides a mechanism for specifying shared defaults
across all input sources:

            <source>
              <input>default</input>
              <package-name>org.example.test</package-name>
            </source>

## Example configuration

**Note:** Replace the `x.y.z` below with the latest versions as found by
browsing [jena-maven-tools](http://central.maven.org/maven2/org/apache/jena/jena-maven-tools/) 
and [jena-core](http://central.maven.org/maven2/org/apache/jena/jena-core/) in Maven Central.


    <build>
     <plugins>
      <plugin>
        <groupId>org.apache.jena</groupId>
        <artifactId>jena-maven-tools</artifactId>
        <version>x.y.z</version>
        <configuration>
          <includes>
            <include>src/main/vocabs/*.ttl</include>
            <include>src/main/vocabs/foaf.rdf</include>
          </includes>
          <fileOptions>
            <source>
              <input>default</input>
              <package-name>org.example.test</package-name>
            </source>
            <source>
              <!-- Test2.java (only) will contain OntModel declarations -->
              <input>src/main/vocabs/demo2.ttl</input>
              <ontology>true</ontology>
              <!-- caution: the config file property name 'inference' is mapped to 'use-inf' -->
              <use-inf>true</use-inf>
            </source>
          </fileOptions>
        </configuration>
        <executions>
         <execution>
          <id>schemagen</id>
           <goals>
            <goal>translate</goal>
           </goals>
          </execution>
         </executions>
        </plugin>
       </plugins>
      </build>
      <dependencies>
        <dependency>
         <groupId>org.apache.jena</groupId>
         <artifactId>jena-core</artifactId>
         <version>x.y.z</version>
        </dependency>
      </dependencies>

