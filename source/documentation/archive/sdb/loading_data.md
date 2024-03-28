---
title: SDB Loading data
---

----
> The Apache Jena SDB module has been retired and is no longer supported.<br/>
> The last release of Jena with this module was Apache Jena 3.17.0.<br/>
----

There are three ways to load data into SDB:

1.  Use the command utility
    [sdbload](commands.html#Loading_data "SDB/Commands")
2.  Use one of the Jena `model.read` operations
3.  Use the Jena `model.add`

The last one of these requires the application to signal the
beginning and end of batches.

## Loading with `Model.read`

A Jena Model obtained from SDB via:

    SDBFactory.connectModel(store)

will automatically bulk load data for each call of one of the
`Model.read` operations.

## Loading with `Model.add`

The `Model.add` operations, in any form or combination of forms,
whether loading a single statement, list of statements, or another
model, will invoke the bulk loader if previously notified before an
add operation.

You can also explicitly delimit bulk operations:

     model.notifyEvent(GraphEvents.startRead)
     ... do add/remove operations ...
     model.notifyEvent(GraphEvents.finishRead)

**Failing to notify the end of the operations will result in data loss**.

A try/finally block can ensure that the finish is notified.

     model.notifyEvent(GraphEvents.startRead) ;
     try {
        ... do add/remove operations ...
     } finally {
       model.notifyEvent(GraphEvents.finishRead) ;
     }

The `model.read` operations do this automatically.

The bulk loader will automatically chunk large sequences of
additions to sizes appropriate to the underlying database. The bulk
loader is threaded with double-buffered; loading to the database
happens in parallel to the application thread and any RDF parsing.

## How the loader works

Loading consists of two phases: in the java VM, and on the database
itself. The SDB loader takes incoming triples and breaks them down
into components ready for the database. These prepared triples are
added to a queue for the database phase, which (by default) takes
place on a separate thread. When the number of triples reaches a
limit (default 20,000), or finish update is signalled, the triples
are passed to the database.

You can configure whether to use threading and the 'chunk size' --
the number of triples per load event -- via `StoreLoader`.

    Store store; // SDB Store
    ...
    store.getLoader().setChunkSize(5000); //
    store.getLoader().setUseThreading(false); // Don't thread

You should set these *before* the loader has been used.

Each loader sets up two temporary tables (`NNode` and `NTrip`) that
mirror `Nodes` and `Triples` tables. These tables are virtually
identical, except that a) they are not indexed and b) for the index
variant there is no index column for nodes.

When loading prepared triples -- triples that have been broken down
ready for the database -- are passed to the loader core (normally
running on a different thread). When the chunk size is reached, or
we are out of triples, the following happens:

-   Prepared nodes are added in one go to `NNode`. Duplicate nodes
    within a chunk are suppressed on the java side (this is worth doing
    since they are quite common, e.g. properties).
-   Prepared triples are added in one go to `NTrip`.
-   New nodes are added to the node table (duplicate suppression is
    explained below).
-   New triples are added to the triple table (once again
    suppressing dupes). For the index case this involves joining on the
    node table to do a hash to index lookup.
-   We commit.
-   If anything goes wrong the transaction (the chunk) is rolled
    back, and an exception is thrown (or readied for throwing on the
    calling thread).

Thus there are five calls to the database for every chunk. The
database handles almost all of the work uninterrupted (duplicate
suppression, hash to index lookup), which makes loading reasonably
quick.

## Duplicate Suppression

MySQL has a very useful `INSERT IGNORE`, which will keep going,
skipping an offending row if a uniqueness constraint is violated.
For other databases we need something else.

Having tried a number of options the best seems to be to `INSERT`
new items by `LEFT JOIN` new items to existing items, then
filtering `WHERE (existing item feature) IS NULL`. Specifically,
for the triple hash case (where no id lookups are needed):

    INSERT INTO Triples
    SELECT DISTINCT NTrip.s, NTrip.p, NTrip.o -- DISTINCT because new triples may contain duplicates (not so for nodes)
    NTrip LEFT JOIN Triples ON (NTrip.s=Triples.s AND NTrip.p=Triples.p AND NTrip.o=Triples.o)
    WHERE Triples.s IS NULL OR Triples.p IS NULL OR Triples.o IS NULL
