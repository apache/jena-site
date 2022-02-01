---
title: Fuseki Modules
---

<em>Fuseki modules</em> are a mechanism to include extension code into a Fuseki
server. Modules are invoked during the process of building a [Fuseki
Main](./fuseki-main.html) server. The module can modify the server
configuration, add new functionality, or react to a server being built and
started.

This feature was added in Jena version 4.3.0. They are an expeirmental feature
that will evolve based on experineace and use cases.

Fuseki Modules are loaded use the JDK
[ServiceLoader](https://www.baeldung.com/java-spi) by being placing a jar file on the classpath,
together with any additional dependencies. The service loader looks for files
`META-INF/services/org.apache.jena.fuseki.main.sys.FusekiModule` in the jar
file.
This is often done by placing the file in the development code in
`src/main/resources/META-INF/services/`).
The file containing a line with the implementation full class name. If
[repacking](../notes/jena-repack.html) Fuseki with the maven-shade-plugin, make
sure the `ServicesResourceTransformer` is used. The module must have a no
argument constructor.

If using Fuseki as an [embedded server](./fuseki-embedded.html), the module is
added in code as:

```
    FusekiModule module = new MyModule();
    FusekiModules.add(module);
```

The method `start` is called when the module is loaded. Custom operations can
be globally registered at this point (see the [Fuseki
examples](https://github.com/apache/jena/tree/main/jena-fuseki2/jena-fuseki-main/src/test/java/org/apache/jena/fuseki/main/examples) directory).

The module lifecycle during creating a Fuseki server is:

* `configuration` - access and modify the setup. 
  This is called after the server has been configured, just before the server is built.
* `server` - access the built server
* `serverBeforeStarting` - about to call "server.start()"
* `serverAfterStarting` - just after calling "server.start()"
* `serverStopped` - called as the server stop 
  (note, this is not always called because a server can simply exit the JVM).

A Fuseki module does not need to implement all these steps, the default for all
of them is "do nothing". Usually, an extension will only be interested in
certain stpes, like the configuration and registry information of
`configuration`.

During the configuration step, the Fuskei configuration file for the server is
available. If the server is built programmatically without a configuration file,
this is null.

The configuration file can contain RDF information to build resources (e.g.
contains assembler descriptions not directly linked to the server).

There is an [example Fuseki
Module](https://github.com/apache/jena/blob/main/jena-fuseki2/jena-fuseki-main/src/test/java/org/apache/jena/fuseki/main/examples/ExFusekiMain_3_FusekiModule.java)
in the Fuseki examples directory.

`FusekiModule` interface:

```java
/**
 * Module interface for Fuseki.
 * <p>
 * A module is additional code, usually in a separate jar, 
 * but can also be part of the application code.
 */
public interface FusekiModule extends SubsystemLifecycle {
    /**
     * Unique (within this server) name to identify this module.
     * The default is to generate an UUID.
     */
    public String name();

    /** Module loaded */
    @Override
    public default void start() {}

    // ---- Build cycle

    /**
     * Called at the start of "build" step. The builder has been set according to the
     * configuration. The "configModel" parameter is set if a configuration file was
     * used otherwise it is null.
     */
    public default void configuration(FusekiServer.Builder builder, DataAccessPointRegistry dapRegistry, Model configModel) {
        dapRegistry.accessPoints().forEach(accessPoint->configDataAccessPoint(builder, accessPoint, configModel));
    }

    /**
     * This method is called for each {@link DataAccessPoint}
     * by the default implementation of {@link #configuration}.
     */
    public default void configDataAccessPoint(FusekiServer.Builder builder, DataAccessPoint dap, Model configModel) {}

    /**
     * Built, not started, about to be returned to the builder caller.
     */
    public default void server(FusekiServer server) { }

    /**
     * Server starting - called just before server.start happens.
     */
    public default void serverBeforeStarting(FusekiServer server) { }

    /**
     * Server started - called just after server.start happens, and before server
     * .start() returns to the application.
     */
    public default void serverAfterStarting(FusekiServer server) { }

    /** Server stopping.
     * Do not rely on this to clear up external resources.
     * Usually there is no stop phase and the JVM just exits or is killed externally.
     *
     */
    public default void serverStopped(FusekiServer server) { }

    /** Module unloaded */
    @Override
    public default void stop() {}
}
```
