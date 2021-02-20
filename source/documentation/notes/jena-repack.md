---
title: Combining Apache Jena jars
---

Apache Jena initializes uses Java's
[ServiceLoader](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html)
mechanism to locate initialization steps. The 
documentation for process in Jena is [available here](system-initialization.html).

There are a number of files (Java resources) in Jena jars named:

    META-INF/services/org.apache.jena.sys.JenaSubsystemLifecycle

Each has different contents, usually one or two lines.

When making a combined jar ("uber-jar", jar with dependencies) from Jena
dependencies and application code, the contents of the Jena files must
be combined and be present in the combined jar as a java resource of the
same name.

The 
[maven shade plugin](https://maven.apache.org/plugins/maven-shade-plugin/) 
is capable of doing this process in a build using a "transformer".

The Apache Jena uses the shade plugin technique itself to make the combined jar
for Fuseki.  It uses the maven shade plugin with a `transformer`.

This is an extract from the POM:

    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-shade-plugin</artifactId>
      <configuration>
        ...
        <transformers>
          <transformer 
              implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
          ... other transformers ...
        </transformers>

See
[jena-fuseki2/jena-fuseki-server/pom.xml](https://github.com/apache/jena/blob/main/jena-fuseki2/jena-fuseki-server/pom.xml)
for the complete shade plugin setup used by Fuseki.

If doing manually, create a single file in your application jar the
all lines of all the services resource files. The order does not matter
- Jena calls modules in the right order.

For Gradle, the [shadowJar plugin](https://imperceptiblethoughts.com/shadow/)
has the
[mergeServiceFiles](https://imperceptiblethoughts.com/shadow/configuration/merging/#merging-service-descriptor-files)
operation.

    // Merging Service Files
    shadowJar {
      mergeServiceFiles()
      . . .
    }
