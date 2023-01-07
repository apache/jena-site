---
title: Apache Jena Initialization
---

Jena has an initialization sequence that is
used to setup components available at runtime.

Application code is welcome to also use this mechanism. This
must be done with care. During Jena initialization, there can be 
visibility of uninitialized data in class static members.

The standard initialization sequence is  
Core -> RIOT -> ARQ -> TDB -> other (including jena text)

The sequence from 0 to level 500 is the Jena platform
initialization. Application may use the jena initialization mechanism and it is
recommended to place initialization code above level 500.

Initialization occurs when `JenaSystem.init()` is first called.  Jena ensures that this
is done when the application first uses any Jena code by using class
initializers.

Application can call `JenaSystem.init()`. 

See [notes on repacking Jena code](jena-repack.html) for how to deal
with `ServiceLoader` files in repacked jars.

## Initialization code

Initialization code is an implementation of `JenaSubsystemLifecycle` which
itself extends `SubsystemLifecycle`.

For use in the default initialization, the class must have a zero-argument
constructor and implement:

```java
    public interface JenaSubsystemLifecycle {
        public void start() ;
        public void stop() ;
        default public int level() { return 9999 ; }
    }
```

The code should supply a level, indicating its place in the order of initialization.
The levels used by Jena are:

* 0 - reserved
* 10 - Used by jena-core
* 15 - CLI Commands registry
* 20 - RIOT
* 30 - ARQ
* 40 - Text indexing
* 40 - TDB1
* 42 - TDB2
* 60 - Additional HTTP configuration
* 60 - RDFPatch
* 96 - SHACL
* 96 - ShEx
* 101 - Fuseki
* 9999 - Default.

Levels up to 500 are considered to be "Jena system level", Application code
should use level above 500.

Fuseki initialization includes [Fuseki
Modules](/documentation/fuseki2/fuseki-modules) which uses `SubsystemLifecycle`
with a different Java interface.

## The Initialization Process

The process followed by `JenaSystem.init()` is to load all java `ServiceLoader`
registered `JenaSubsystemLifecycle`, sort into level order, then call `init` on
each initialization object. Initialization code at the same level may be called
in any order and that order may be different between runs.

Only the first call of `JenaSystem.init()` causes the process to run.
Any subsequent calls are cheap, so calling `JenaSystem.init()`
when in doubt about the initialization state is safe.

Overlapping concurrent calls to `JenaSystem.init()` are thread-safe.
On a return from `JenaSystem.init()`, Jena has been initialized at some point.

## Debugging

There is a flag `JenaSystem.DEBUG_INIT` to help with development. It is not
intended for runtime logging.

Jena components print their initialization beginning and end points on
`System.err` to help track down ordering issues.
