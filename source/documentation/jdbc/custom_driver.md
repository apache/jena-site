---
title: Creating a Custom Jena JDBC Driver
---

As noted in the [overview](index.html#overview) Jena JDBC drivers are built around a core
library which implements much of the common functionality required in an abstract way.  This
means that it is relatively easy to build a custom driver just by relying on the core library
and implementing a minimum of one class.

## Custom Driver class

The one and only thing that you are required to do to create a custom driver is to implement
a class that extends `JenaDriver`.  This requires you to implement a constructor which simply
needs to call the parent constructor with the relevant inputs, one of these is your driver specific
connection URL prefix i.e. the `foo` in `jdbc:jena:foo:`.  Implementation specific prefixes
must conform to the regular expression `[A-Za-z\d\-_]+:` i.e. some combination of alphanumerics,
hyphens and underscores terminated by a colon.

Additionally you must override and implement two abstract methods `connect()` and `getPropertyInfo()`.
The former is used to produce an instance of a `JenaConnection` while the latter provides information 
that may be used by tools to present users with some form of user interface for configuring a 
connection to your driver.

An important thing to note is that this may be all you need to do to create a custom driver, it is
perfectly acceptable for your `connect()` implementation to just return one of the implementations
from the built-in drivers.  This may be useful if you are writing a driver for a specific store and
wish to provide simplified connection URL parameters and create the appropriate connection instance
programmatically.

## Custom Connection class

The next stage in creating a custom driver (where necessary) is to create a class derived from
`JenaConnection`.  This has a somewhat broader set of abstract methods which you will need to implement
such as `createStatementInternal()` and various methods which you may optionally override if you
need to deviate from the default behaviors.

If you wish to go down this route then we recommend looking at the source for the built in implementations
to guide you in this.  It may be easier to extend one of the built-in implementations rather than writing
an entire custom implementation yourself.

Note that custom implementations may also require you to implement custom `JenaStatement` and `JenaPreparedStatement`
implementations.

## Testing your Driver

To aid testing your custom driver the `jena-jdbc-core` module provides a number of abstract test classes which
can be derived from in order to provide a wide variety of tests for your driver implementation.  This is how
all the built in drivers are tested so you can check out their test sources for examples of this.
