---
title: Jena JDBC - A SPARQL over JDBC driver framework
slug: index
---

Jena JDBC is a set of libraries which provide SPARQL over JDBC driver implementations.

This is a pure SPARQL over JDBC implementation, there is no attempt to present the underlying
RDF data model as a relational model through the driver and only SPARQL queries and updates
are supported.

It provides type 4 drivers in that they are pure Java based but the drivers are not JDBC compliant since
by definition they **do not** support SQL.

This means that the drivers can be used with JDBC tools provided that those tools don't restrict you to SQL 
or auto-generate SQL.  So it can be used with a tool like [SquirrelSQL](http://squirrel-sql.sourceforge.net) 
since you can freely enter SPARQL queries and updates.  Conversely it cannot be used with a tool like a SQL based
ORM which generates SQL.

## Documentation

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Alternatives](#alternatives)
- [Jena JDBC Drivers](drivers.html)
- [Maven Artifacts for Jena JDBC](artifacts.html)
- [Implementing a custom Jena JDBC Driver](custom_driver.html)

## Overview

Jena JDBC aims to be a pure SPARQL over JDBC driver, it assumes that all commands that come in are
either SPARQL queries or updates and processes them as such.

As detailed on the [drivers](drivers.html) page there are actually three drivers provided currently:

- [In-Memory](drivers.html#in-memory) - uses an in-memory dataset to provide non-persistent storage
- [TDB](drivers.html#tdb) - uses a [TDB](/documentation/tdb/) dataset to provide persistent and transactional storage
- [Remote Endpoint](drivers.html#remote-endpoint) - uses HTTP based remote endpoints to access any SPARQL protocol compliant storage

These are all built on a core library which can be used to build [custom drivers](custom_driver.html)
if desired.  This means that all drivers share common infrastructure and thus exhibit broadly speaking
the same behavior around handling queries, updates and results.

Jena JDBC is published as a Maven module via its [maven artifacts](artifacts.html).  The source for Jena JDBC may be [downloaded](/download/index.cgi) as part of the source distribution.

### Treatment of Results

One important behavioral aspect to understand is how results are treated compared to a traditional
JDBC driver.  SPARQL provides four query forms and thus four forms of results while JDBC assumes all
results have a simple tabular format.  Therefore one of the main jobs of the core library is to marshal
the results of each kind of query into a tabular format.  For `SELECT` queries this is a trivial mapping,
for `CONSTRUCT` and `DESCRIBE` the triples are mapped to columns named `Subject`, `Predicate` and `Object`
respectively, finally for `ASK` the boolean is mapped to a single column named `ASK`.

The second issue is that JDBC expects uniform column typing throughout a result set which is not
something that holds true for SPARQL results.  Therefore the core library takes a pragmatic approach to column
typing and makes the exact behavior configurable by the user.  The default behavior of the core library is
to type all columns as `Types.NVARCHAR` with a Java type of `String`, this provides the widest compatibility
possible with both the SPARQL results and consuming tools since we can treat everything as a string.  We
refer to this default behavior as medium compatibility, it is sufficient to allow JDBC tools to interpret
results for basic display but may be unsuitable for further processing.

We then provide two alternatives, the first of which we refer to as high compatibility aims to present the
data in a way that is more amenable to subsequent processing by JDBC tools.  In this mode the column types
in a result set are detected by sniffing the data in the first row of the result set and assigning appropriate
types.  For example if the first row for a given column has the value `"1234"^^xsd:integer` then it would
be assigned the type `Types.BIGINT` and have the Java type of `Long`.  Doing this allows JDBC tools to carry
out subsequent calculations on the data in a type appropriate way.  It is important to be aware that this
sniffing may not be accurate for the entire result set so can still result in errors processing some rows.

The second alternative we refer to as low compatibility and is designed for users who are using the driver
directly and are fully aware that they are writing SPARQL queries and getting SPARQL results.  In this mode
we make no effort to type columns in a friendly way instead typing them as `Types.JAVA_OBJECT` with the Java
type `Node` (i.e. the Jena [Node](/documentation/javadoc/jena/org/apache/jena/graph/Node.html) class).

Regardless of how you configure to do column typing the core library does it best to allow you to marshal values
into strong types.  For example even if using default compatibility and your columns are typed as strings
from a JDBC perspective you can still call `getLong("column")` and if there is a valid conversion the
library will make it for you.

Another point of interest is around our support of different result set types.  The drivers support both
`ResultSet.TYPE_FORWARD_ONLY` and `ResultSet.TYPE_SCROLL_INSENSITIVE`, note that regardless of the type
chosen and the underlying query type all result sets are `ResultSet.CONCUR_READ_ONLY` i.e. the `setLong()`
style methods cannot be used to update the underlying RDF data.  Users should be aware that the default
behavior is to use forward only result sets since this allows the drivers to stream the results and
minimizes memory usage.  When scrollable result sets are used the drivers will cache all the results into
memory which can use lots of memory when querying large datasets.

## Basic Usage

The following takes you through the basic usage of the in-memory JDBC driver.  The code should be familiar
to anyone who has used JDBC before and is easily used with our other [drivers](drivers.html) simply by
changing the connection URL appropriately.

### Establishing a Connection

Firstly we should ensure that the driver we wish to use is registered with the JDBC driver manager, a static
method is provided for this:

    MemDriver.register();

Once this is done we can then make a JDBC connection just be providing an appropriate connection URL:

    // Make a connection using the In-Memory driver starting from an empty dataset
    Connection conn = DriverManager.getConnection("jdbc:jena:mem:empty=true");

Now we can go ahead and use the connection as you would normally.

### Performing Queries

You make queries as you would with any JDBC driver, the only difference being that the queries must be SPARQL:

    // Need a statement
    Statement stmt = conn.createStatement();
    
    try {
      // Make a query
      ResultSet rset = stmt.executeQuery("SELECT DISTINCT ?type WHERE { ?s a ?type } LIMIT 100");
    
      // Iterate over results
      while (rset.next()) {
        // Print out type as a string
        System.out.println(rset.getString("type"));
      }
    
      // Clean up
      rset.close();
    } catch (SQLException e) {
      System.err.println("SQL Error - " + e.getMessage());
    } finally {
      stmt.close();
    }

### Performing Updates

You make updates as you would with any JDBC driver.  Again the main difference is that updates must be SPARQL,
one downside of this is that SPARQL provides no way to indicate the number of triples/quads affected by an update
so the JDBC driver will either return `0` for successful updates or throw a `SQLException` for failed updates:

    // Need a statement
    Statement stmt = conn.createStatement();
    
    // Make an update
    try {
      stmt.executeUpdate("INSERT DATA { <http://x> <http://y> <http://z> }");
      System.out.println("Update succeeded");
    } catch (SQLException e) {
      System.out.println("Update Failed " - + e.getMessage());
    } finally {    
      // Clean up
      stmt.close();
    }

## Alternatives

If Jena JDBC does not fulfill your use case you may also be interested in some 3rd party
projects which do SPARQL over JDBC in other ways:

- [Claude Warren's jdbc4sparql](https://github.com/Claudenw/jdbc4sparql) - An alternative approach that does expose
the underlying RDF data model as a relational model and supports translating SQL into SPARQL
- [William Greenly's jdbc4sparql](http://code.google.com/p/jdbc4sparql/) - A similar approach to Jena JDBC restricted
to accessing HTTP based SPARQL endpoints
- [Paul Gearon's scon](https://code.google.com/p/scon/wiki/Introduction) - A similar approach to Jena JDBC restricted
to accessing HTTP based SPARQL endpoints



