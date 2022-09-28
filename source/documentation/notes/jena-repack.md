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

#### Maven
The 
[maven shade plugin](https://maven.apache.org/plugins/maven-shade-plugin/) 
is capable of doing this process in a build using a "transformer".

The Apache Jena uses the shade plugin technique itself to make the combined jar
for Fuseki.  It uses the maven shade plugin with a `transformer`.

This is an extract from the POM:

```xml
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
  </configuration>
</plugin>
```
See
[jena-fuseki2/jena-fuseki-server/pom.xml](https://github.com/apache/jena/blob/main/jena-fuseki2/jena-fuseki-server/pom.xml)
for the complete shade plugin setup used by Fuseki.

#### Gradle
For Gradle, the [shadowJar plugin](https://plugins.gradle.org/plugin/com.github.johnrengelman.shadow)
has the
[mergeServiceFiles](https://imperceptiblethoughts.com/shadow/configuration/merging/#merging-service-descriptor-files)
operation.

```groovy
plugins {
  ...    
  id "com.github.johnrengelman.shadow" version "7.1.2"
}
shadowJar {
  mergeServiceFiles()
}
...
```    

#### Manual assembling
If doing manually, create a single file (`META-INF/services/org.apache.jena.sys.JenaSubsystemLifecycle`) in your application jar containing the
lines of all the services resource files. The order does not matter.
Jena calls modules in the right order.