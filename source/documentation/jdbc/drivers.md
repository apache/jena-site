---
title: Jena JDBC Drivers
---

Jena JDBC comes with three built in drivers by default with the option of building
[custom drivers](custom_driver.html) if desired.  This page covers the differences
between the provided drivers and the connection URL options for each.

## Connection URL Basics

Connection URLs for Jena JDBC drivers have a common format, they all start with the following:

    jdbc:jena:foo:

Where `foo` is a driver specific prefix that indicates which specific driver implementation
is being used.

After the prefix the connection URL consists of a sequence of key
value pairs, the characters ampersand (`&`), semicolon (`;`) and
pipe (`|`) are considered to be separators between pairs, the
separators are reserved characters and may not be used in values. The key is
separated from the value by a equals sign (`=`) though unlike the
separators this is not a reserved character in values.

There is no notion of character escaping in connection parameters so if you
need to use any of the reserved characters in your values then you should
pass these to the `connect(String, Properties)` method directly in the
`Properties` object.

### Common Parameters

There are some common parameter understood by all Jena JDBC drivers and which
apply regardless of driver implementation.

#### JDBC Compatibility Level

As discussed in the [overview](index.html#treatment-of-results) the drivers have a notion
of JDBC compatibility which is configurable. The `jdbc-compatibility` parameter is used 
in connection URLs. To avoid typos when creating URLs programmatically a constant 
(`JenaDriver.PARAM_JDBC_COMPATIBILITY`) is provided which contains the parameter
name exactly as the code expects it. This parameter provides an integer value
in the range 1-9 which denotes how compatible the driver should attempt to
be.  See the aforementioned overview documentation for more information on the interpretation
of this parameter.

When not set the default compatibility level is
used, note that `JenaConnection` objects support changing this after
the connection has been established.

#### Pre-Processors

The second of the common parameters is the `pre-processor` parameter which is used to
specify one/more `CommandPreProcessor` implementations to use. The
parameter should be specified once for each pre-processor you wish to you and
you should supply a fully qualified class name to ensure the pre-processor
can be loaded and registered on your connections. The driver will report an
error if you specify a class that cannot be appropriately loaded and
registered.

Pre-processors are registered in the order that they are specified so if you
use multiple pre-processors and they have ordering dependencies please ensure
that you specify them in the desired order. Note that `JenaConnection`
objects support changing registered pre-processors after the connection has
been established.

#### Post-Processors

There is also a `post-processor` parameter which is used to specify
one/more `ResultsPostProcessor` implementations to use. The parameter
should be specified once for each post-processor you wish to use and you
should supply a fully qualified class name to ensure the post-processor can
be loaded and registered on your connections. The driver will report an error
is you specify a class that cannot be appropriately loaded and registered.

Post-processors are registered in the order that they are specified so if you
use multiple post-processors and they have ordering dependencies please
ensure that you specify them in the desired order. Note that
`JenaConnection` objects support changing registered post-processors
after the connection has been established.

## Available Drivers

- [In-Memory](#in-memory)
- [TDB](#tdb)
- [Remote Endpoint](#remote-endpoint)

Each driver is available as a separate maven artifact, see the [artifacts](artifacts.html) page 
for more information.

### In-Memory

The in-memory driver provides access to a non-persistent non-transactional in-memory dataset.  This dataset
may either be initially empty or may be initialized from an input file.  Remember that
this is non-persistent so even if the latter option is chosen changes are not persisted
to the input file.  This driver is primarily intended for testing and demonstration
purposes.

Beyond the common parameters it has two possible connection parameters.  The first of these
is the `dataset` parameter and is used to indicate an input file that the driver will
initialize the in-memory dataset with e.g.

    jdbc:jena:mem:dataset=file.nq

If you prefer to start with an empty dataset you should use the `empty` parameter instead e.g.

    jdbc:jena:mem:empty=true

If both are specified then the `dataset` parameter has precedence.

### TDB

The TDB driver provides access to a persistent [Jena TDB](/documentation/tdb/) dataset.  This
means that the dataset is both persistent and can be used transactionally.  For correct
transactional behavior it is typically necessary to set the holdability for connections and 
statements to `ResultSet.HOLD_CURSORS_OVER_COMMIT` as otherwise closing a result set or making
an update will cause all other results to be closed.

Beyond the common parameters the driver requires a single `location` parameter that provides
the path to a location for a TDB dataset e.g.

    jdbc:jena:tdb:location=/path/to/data

By default a TDB dataset will be created in that location if one does not exist, if you would
prefer not to do this i.e. ensure you only access existing TDB datasets then you can add the
`must-exist` parameter e.g.

    jdbc:jena:tdb:location=/path/to/data&must-exist=true

With this parameter set the connection will fail if the location does not exist as a directory,
note that this does not validate that the location is a TDB dataset so it is still possible
to pass in invalid paths even with this set.

### Remote Endpoint

The Remote Endpoint driver provides access to any SPARQL Protocol compliant store that exposes
SPARQL query and/or SPARQL update endpoints.  This driver can be explicitly configured to be
in read-only or write-only mode by providing only one of the required endpoints.

The `query` parameter sets the query endpoint whilst the `update` parameter sets the update endpoint e.g.

    jdbc:jena:remote:query=http://localhost:3030/ds/query&update=http://localhost:3030/ds/update

At least one of these parameters is required, if only one is provided you will get a read-only or 
write-only connection as appropriate.

This driver also provides a whole variety of parameters that may be used to customize its behavior
further.  Firstly there are a set of parameters which control the dataset description provided
via the SPARQL protocol:

- `default-graph-uri` - Sets a default graph for queries
- `named-graph-uri` - Sets a named graph for queries
- `using-graph-uri` - Sets a default graph for updates
- `using-named-graph-uri` - Sets a named graph for updates

All of these may be specified multiple times to specify multiple graph URIs for each.

Then you have the `select-results-type` and `model-results-type` which are used to set the MIME
type you'd prefer to have the driver retrieve SPARQL results from the remote endpoints in.  If used
you must set them to formats that ARQ supports, the ARQ [WebContent](/documentation/javadoc/arq/org/apache/jena/riot/WebContent.html)
class has constants for the various supported formats.

#### Authentication

There is also comprehensive support for authentication using this driver, the standard JDBC `user`
and `password` parameters are used for credentials and then a selection of driver specific
parameters are used to configure how you wish the driver to authenticate.

Under the hood authentication uses the new `HttpAuthenticator` framework introduced in the same
release as Jena JDBC, see [HTTP Authentication in ARQ](/documentation/query/http-auth.html).  This means
that it can support standard HTTP auth methods (Basic, Digest etc) or can use more complex schemes
such as forms based auth with session cookies.

To set up standard HTTP authentication it is sufficient to specify the `user` and `password` fields.  As
with any JDBC application we **strongly** recommend that you do not place these in the connection URL
directly but rather use the `Properties` object to pass these in.  One option you may wish to include
if your endpoints use HTTP Basic authentication is the `preemptive-auth` parameter which when set to
true will enable preemptive authentication.  While this is less secure it can be more performant if
you are making lots of queries.

Setting up form based authentication is somewhat more complex, at a minimum you need to provide the 
`form-url` parameter with a value for the URL that user credentials should be POSTed to in order to
login.  You may need to specify the `form-user-field` and `form-password-field` parameters to provide
the name of the fields for the login request, by default these assume you are using an Apache `mod_auth_form`
protected server and use the appropriate default values.

The final option for authenticator is to use the `authenticator` parameter via the `Properties` object
to pass in an actual instance of a `HttpAuthenticator` that you wish to use.  This method is the most
powerful in that it allows you to use any authentication method that you need.

