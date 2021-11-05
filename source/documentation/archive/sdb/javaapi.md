---
title: SDB JavaAPI
---

This page describes how to use SDB from Java.

Code examples are in `src-examples/` in the SDB distribution.

## Contents

-   [Concepts](#concepts)
-   [Obtaining the Store](#obtaining-the-store)
    -   [From a configuration file](#from-a-configuration-file)
    -   [In Java code](#in-java-code)
    -   [Database User and Password](#database-user-and-password)
-   [Connection Management](#connection-management)
-   [Formatting or Emptying the Store](#formatting-or-emptying-the-store)
-   [Loading data](#loading-data)
-   [Executing Queries](#executing-queries)
-   [Using the Jena Model API with SDB](#using-the-jena-model-api-with-sdb)

## Concepts

-   `Store`
-   `SDBFactory`
-   `SDBConnection`

SDB loads and queries data based on the unit of a `Store`. The
`Store` object has all the information for formatting, loading and
accessing an SDB database. One database or table space is one
Store. `Store` objects are made via the static method of the
`StoreFactory` class.

`SDBConnection` wraps the underlying database connection, as well
as providing logging operations.

-   `StoreDesc`

A store description is the low level mechanism for describing
stores to be created.

-   `DatasetStore`
-   `GraphSDB`

Two further class are not immediately visible because they are
managed by the `SDBFactory` which creates the necessary classes,
such as Jena models and graphs.

An object of class `DatasetStore` represents an
[RDF dataset](http://www.w3.org/TR/sparql11-query/#rdfDataset "http://www.w3.org/TR/rdf-sparql-query/#rdfDataset")
backed by an SDB store. Objects of this class trigger SPARQL
queries being sent to SDB.

The class `GraphSDB` provides the adapter between the standard Jena
Java API and an SDB store, either to the default graph or one of
the named graphs. The `SDBFactory` can also create Jena Models
backed by such a graph.

## Obtaining the Store

A store is build from a description. This can be a description in
file as a
[Jena assembler](../assembler)
or the application can build the store description
programmatically.

### From a configuration file

The stored description is the only point where the specific details
of store are given. This includes connection information, the
database name, and database type. It makes sense to place this
outside the code. That way, the application can be switched between
different databases (e.g. testing and production) by changing a
configuration file, and not the code, which would require
recompilation and a rebuild.

To create a `Store` from a store assembler

      Store store = SDBFactory.connectStore("sdb.ttl") ;

The assembler file has two parts, the connection details and the
store type.

     @prefix rdfs:     <http://www.w3.org/2000/01/rdf-schema#> .
     @prefix rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
     @prefix ja:       <http://jena.hpl.hp.com/2005/11/Assembler#> .
     @prefix sdb:      <http://jena.hpl.hp.com/2007/sdb#> .

     _:c rdf:type sdb:SDBConnection ;
         sdb:sdbType        "derby" ;
         sdb:sdbName        "DB/SDB2" ;
         sdb:driver         "org.apache.derby.jdbc.EmbeddedDriver" ;
         .

     [] rdf:type sdb:Store ;
         sdb:layout         "layout2" ;
         sdb:connection     _:c ;
        .

See the full details of
[store description files](store_description.html "SDB/Store Description")
for the options.

### In Java code

The less flexible way to create a store description is to build it
in Java. For example:

       StoreDesc storeDesc = new StoreDesc(LayoutType.LayoutTripleNodesHash,
                                           DatabaseType.Derby) ;
       JDBC.loadDriverDerby() ;
       String jdbcURL = "jdbc:derby:DB/SDB2";
       SDBConnection conn = new SDBConnection(jdbcURL, null, null) ;
       Store store = SDBFactory.connectStore(conn, storeDesc) ;

### Database User and Password

The user and password for the database can be set in explicitly in
the description file but it is usually better to use an environment
variable or Java system property because this avoid writing use and
password in a file.

Environment variable: `SDB_USER`
Java property: `jena.db.user`

Environment variable: `SDB_PASSWORD`
Java property: `jena.db.password`

## Connection Management

Each store has a JDBC connection associated with it.

In situations where such connections are managed externally, the
store object can be created and used within a single operation.

A `Store` is lightweight and does not perform any database actions
when created, so creating and releasing them will not impact
performance. Closing a store does not close the JDBC connection.

Similarly, a `SDBConnection` is lightweight and creation does not
result in any database or JDBC connection actions.

The store description can be read from the same file because any
SDB connection information is ignored when reading to get just the
store description. The store description can be kept across store
creations:

      storeDesc = StoreDesc.read("sdb.ttl") ;

then used with an JDBC connection object passed from the connection
container:

        public static void query(String queryString,
                                 StoreDesc storeDesc,
                                 Connection jdbcConnection)
        {
            Query query = QueryFactory.create(queryString) ;

            SDBConnection conn = SDBFactory.createConnection(jdbcConnection) ;

            Store store = SDBFactory.connectStore(conn, storeDesc) ;

            Dataset ds = SDBFactory.connectDataset(store) ;
            try(QueryExecution qe = QueryExecutionFactory.create(query, ds)) {
                ResultSet rs = qe.execSelect() ;
                ResultSetFormatter.out(rs) ;
            }
            store.close() ;
        }

## Formatting or Emptying the Store

SDB stores do not ensure that the database is formatted. You can
check whether the store is already formatted using:

    StoreUtils.isFormatted(store);

This is an expensive operation, and should be used sparingly.

Once you obtain a store for the first time you will need to:

    store.getTableFormatter().create();

This will create the necessary tables and indexes required for a
full SDB store.

You may empty the store completely using:

    store.getTableFormatter().truncate();

## Loading data

Data loading uses the standard Jena `Model.read` operations.
`GraphSDB`, and models made from a `GraphSDB`, implement the
standard Jena bulk data interface with backed by an SBD
implementation of that interface.

## Executing Queries

The interface to making queries with SDB is same as that for
[querying with ARQ](../query/app_api.html).
SDB is an ARQ query engine that can handle queries made on an RDF
dataset which is of the SDB class `DatasetStore`:

       Dataset ds = DatasetStore.create(store) ;

This is then used as normal with ARQ:

       Dataset ds = DatasetStore.create(store) ;
       try(QueryExecution qe = QueryExecutionFactory.create(query, ds)) {
           ResultSet rs = qe.execSelect() ;
           ResultSetFormatter.out(rs) ;
       }

When finished, the store should be closed to release any resources
associated with the particular implementation. Closing a store does
*not* close it's JDBC connection.

       store.close() ;

Closing the SDBConnection *does* close the JDBC connection:

       store.getConnection().close() ;
       store.close() ;

If models or graphs backed by SDB are placed in a general Dataset
then the query is not efficiently executed by SDB.

## Using the Jena Model API with SDB

A Jena model can be connected to one graph in the store and used
with all the Jena API operations.

Here, the graph for the model is the default graph:

        Store store = SDBFactory.connectStore("sdb.ttl") ;
        Model model = SDBFactory.connectDefaultModel(store) ;

        StmtIterator sIter = model.listStatements() ;
        for ( ; sIter.hasNext() ; )
        {
            Statement stmt = sIter.nextStatement() ;
            System.out.println(stmt) ;
        }
        sIter.close() ;
        store.close() ;

SDB is optimized for SPARQL queries but queries and other Jena API
operations can be mixed. The results from a SPARQL query are Jena
RDFNodes, with the associated model having a graph implemented by
SDB.

