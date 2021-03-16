---
title: Apache Jena Initialization
---

Jena has a simple initialization sequence that is
used to setup components available at runtime.

Application code is welcome to also use this mechanism. This
must be done with care. Java initialization can lead to
visibility of uninitialized data.

The standard initialization sequence is  
Core -> RIOT -> ARQ -> TDB -> other (including jena text)

The sequence from core to TDB should be executed before application
components. See below for how to control the order.

Initialization occurs when `JenaSystem.init()` is first called.  Jena ensures that this
is done when the application first uses any Jena code by using class
initializers.

See [notes on repacking Jena code](jena-repack.html) for how to deal
with ServiceLoader files in repacked jars.

## Initialization code

Initialization code is an implementation of `JenaSubsystemLifecycle`.
For use in the default initialization, the class must have a zero-argument constructor

    public interface JenaSubsystemLifecycle {
        public void start() ;
        public void stop() ;
        default public int level() { return 9999 ; }
    }

The code also supply a level, indicating its place in the order of initialization.
The levels used by Jena are:

* 0 - reserved
* 10 - Used by jena-core
* 20 - RIOT
* 30 - ARQ
* 40 - TDB
* 9999 - other

## The Initialization Process

The process followed by `JenaSystem.init()` is to obtain an instance of
`JenaSubsystemRegistry`, ask it to `load()` initialization code, then call
that code in an order based on declared level. The order of invocation
of different initialization code within the same level is undefined
and may be different from run to run.

Only the first call of `JenaSystem.init()` causes the process to run.
Any subsequent calls are cheap, so calling `JenaSystem.init()`
when in doubt about the initialization state is safe.

Overlapping concurrent calls to `JenaSystem.init()` are thread-safe.
On a return from `JenaSystem.init()`, Jena has been initialized at some point.

## The Standard Subsystem Registry

The `JenaSubsystemRegistry` normally used is based on `java.util.ServiceLoader`.
It looks for class resources
`META-INF/services/org.apache.jena.sys.JenaSubsystemLifecycle`
on the classpath during the load step.

See the javadoc for `java.util.ServiceLoader` for more details.

See also the javadoc for
[JenaSystem](/documentation/javadoc/jena/org/apache/jena/system/JenaSystem.html)
and the source code.

## Debugging

There is a flag `JenaSystem.DEBUG_INIT` to help with development. It is not
intended for runtime logging.

Jena components print their initialization beginning and end points on
`System.err` to help track down ordering issues.

## Modifying the Standard Process

It is possible, with care, to alter the way
that initialization code is discovered.

An application can change the `JenaSubsystemRegistry` instance.
This must be done before any Jena code is called anywhere
in the current JVM.

    // Example alternative registry.
    JenaSubsystemRegistry r = new JenaSubsystemRegistryBasic() {
        @Override
        public void load() {
            if ( JenaSystem.DEBUG_INIT )
                System.err.println("Example custom load") ;
            super.load();
        }
    } ;

    // Set the sub-system registry
    JenaSystem.setSubsystemRegistry(r);

    // Enable output if required
    // JenaSystem.DEBUG_INIT = true ;

    // Initialize Jena
    JenaSystem.init() ;

## Jena initialization in multi-classloader environments

In some applications with multiple classloaders, or different classloader strategies, Jena initialization may
not work as expected. If the Jena initialization debug information shows that components were not loaded correctly,
trying to switch the context class loader may fix the initialization process.

    ClassLoader contextClassLoader = null;
    try {
        contextClassLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(getClass().getClassLoader());
        JenaSystem.DEBUG_INIT = true;
        // ...
    } finally {
        Thread.currentThread().setContextClassLoader(contextClassLoader);
    }
