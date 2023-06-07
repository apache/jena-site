---
title: Fuseki Modules
---

<em>Fuseki modules</em> are a mechanism to include extension code into a Fuseki
server. Modules are invoked during the process of building a [Fuseki
Main](./fuseki-main.html) server. A module can modify the server
configuration, add new functionality, or react to a server being built and
started.

This feature was added in Jena version 4.3.0. It is an experimental feature
that will evolve based on feedback and use cases.

The interface for modules is `FusekiModule`; if automatcally loaded, the
interface is `FusekiAutoModule` which extends `FusekiModule`.

Fuseki modules can be provided in two ways:

* Loaded from additional jars on the classpath
* Programmatically controlling the setup of the `FusekiServer` server.

### Automatically loaded

Fuseki Modules can be loaded using the JDK
[ServiceLoader](https://www.baeldung.com/java-spi) by being placing
a jar file on the classpath,
together with any additional dependencies. These provide interface 
`FusekiAutoModule`.
The service loader is controlled by file resources
`META-INF/services/org.apache.jena.fuseki.main.sys.FusekiAutoModule` in the jar
file.
The module class must have a no-argument constructor.

This is often done by placing the file in the development code in
`src/main/resources/META-INF/services/`).
The file containing a line with the implementation full class name. If
[repacking](../notes/jena-repack.html) Fuseki with the maven-shade-plugin, make
sure the `ServicesResourceTransformer` is used. 

The method `start` is called when the module is loaded. Custom operations can
be globally registered at this point (see the [Fuseki
examples](https://github.com/apache/jena/tree/main/jena-fuseki2/jena-fuseki-main/src/test/java/org/apache/jena/fuseki/main/examples) directory).

A `FusekiAutoModule` can provide a level, an integer, to control the order in which
modules are invoked during server building. Lower numbers are invoked before larger
numbers at each step.

### Programmaticaly configuring a server

If creating a Fuseki server from Java, the modules can be autoloaded as described above,
or explicitly added to the server builder. 

A `FusekiModules` object is collection of modules, called at each point in the order
given when creating the object.

```
    FusekiModule myModule = new MyModule();
    FusekiModules fmods = FusekiModules.create(myModule);
    FusekiServer server = FusekiServer.create()
        ...
        .fusekiModules(fmods)
        ...
        .build();  
```

### Fuseki Module operations

The module lifecycle during creating a Fuseki server is:

* `prepare` - called at the start of the server
   build steps before setting up the datasets.
* `configured` - access and modify the setup. 
   This is called after the server has been configured, before the server is built.
   It defaults to calls to `configDataAccessPoint` for dataset being hosted by the server.
* `server` - called after the built, before the return of `FusekiServerBuilder.build()`

There are also operations notified when a server is reloaded while running.
* `serverConfirmReload`
* `serveReload`

As of Jena 4.9.0, eeload is not yet supported.

The Fuseki start up sequence is:

* `serverBeforeStarting` - called at the start of `server.start()`
* `serverAfterStarting` - called at the end of `server.start()`
* `serverStopped` - called as just after the server
    has stopped in the `server.stop()` call.
  (note, this is not always called because a server can simply exit the JVM).

A Fuseki module does not need to implement all these steps. The default for all
steps is "do nothing".  Usually, an extension will only be interested in
certain steps, such as `prepare`, or the registry information of
`configuration`.

During the configuration step, the Fuseki configuration file for the server is
available. If the server is built programmatically without a configuration file,
this is null.

The configuration file can contain RDF information to build resources (e.g.
it can contain additional assembler descriptions not directly linked to the server).

There is an [example Fuseki
Module](https://github.com/apache/jena/blob/main/jena-fuseki2/jena-fuseki-main/src/test/java/org/apache/jena/fuseki/main/examples/ExFusekiMain_3_FusekiModule.java)
in the Fuseki examples directory.

### `FusekiModule` interface

```java
/**
 * Module interface for Fuseki.
 * <p>
 * A module is additional code, usually in a separate jar, 
 * but can also be part of the application code.
 */
public interface FusekiModule extends SubsystemLifecycle {
    /**
     * Display name to identify this module.
     */
    public String name();

    // -- Build cycle.

    /**
     * Called at the start of "build" step. The builder has been set according to the
     * configuration of API calls and parsing configuration files. No build actions have been carried out yet.
     * The module can make further FusekiServer.{@link Builder} calls.
     * The "configModel" parameter is set if a configuration file was used otherwise it is null.
     */
    public default void prepare(FusekiServer.Builder serverBuilder, Set<String> datasetNames, Model configModel) ;

     /**
      * Called after the DataAccessPointRegistry has been built.
      * <p>
      * The default implementation is to call {@link #configDataAccessPoint(DataAccessPoint, Model)}
      * for each {@link DataAccessPoint}.
      * <pre>
      *    dapRegistry.accessPoints().forEach(accessPoint{@literal ->}configDataAccessPoint(accessPoint, configModel));
      * </pre>
      */
    public default void configured(FusekiServer.Builder serverBuilder, DataAccessPointRegistry dapRegistry, Model configModel) {
        dapRegistry.accessPoints().forEach(accessPoint->configDataAccessPoint(accessPoint, configModel));
    }

    /**
     * This method is called for each {@link DataAccessPoint} by the default
     * implementation of {@link #configured} after the new servers
     * DataAccessPointRegistry has been built.
     */
    public default void configDataAccessPoint(DataAccessPoint dap, Model configModel) {}

    /**
     * Built, not started, about to be returned to the builder caller.
     */
    public default void server(FusekiServer server) { }

    /**
     * Confirm or reject a request to reload.
     */
    public default boolean serverConfirmReload(FusekiServer server) { return true; }

    /**
     * Perform any operations necessary for a reload.
     */
    public default void serverReload(FusekiServer server) { }

    // -- Server start up

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

    /** Module unloaded : do not rely on this happening. */
    @Override
    public default void stop() {}
}
```

`FusekiAutoModules` also provide the 
[`org.apache.jena.base.module.SubsystemLifecycle`](https://jena.apache.org/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/sys/JenaSubsystemLifecycle.html)
interface.
