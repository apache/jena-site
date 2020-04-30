---
title: The DatasetGraph hierarchy.
---

_These notes were written February 2016._

`DatasetGraph` forms the basic of storage as
[RDFDataset](https://www.w3.org/TR/rdf11-concepts/#section-dataset).  There
is a class hierarchy to make implementation a matter of choosing the style
of implementation and adding specific functionality.

The hierarchy of the significant classes is:
(there are others adding special features)


    DatasetGraph - the interface
        DatasetGraphBase
            DatasetGraphBaseFind
                DatasetGraphCollection
                    DatasetGraphMapLink - ad hoc collection of graphs
                DatasetGraphOne
                DatasetGraphTriplesQuads
                    DatasetGraphInMemory - fully transactional in-memory.
                    DatasetGraphMap
            DatasetGraphQuads 
        DatasetGraphTrackActive - transaction support 
            DatasetGraphTransaction - This is the main TDB dataset.
            DatasetGraphWithLock - MRSW support
        DatasetGraphWrapper
            DatasetGraphTxn - TDB usage
            DatasetGraphViewGraphs

Other important classes:

    GraphView

### DatasetGraph

This is the interface. Includes `Transactional` operations.

There are two markers for transaction features supported.

If `begin`, `commit` and `end` are supported (which is normally the case)
`supportsTransactions` returns true.

If, further, `abort` is supported, then `supportsTransactionAbort` is true.

### General hierarchy

**DatasetGraphBase**

This provides some basic machinery and provides implementations of
operations that have alternative styles.  It converts `add(G,S,P,O)` to
`add(quad)` and `delete(G,S,P,O)` to `delete(quad)` and converts
`find(quad)` to `find(G,S,P,O)`.

It provides basic implementations of `deleteAny(?,?,?,?)` and `clear()`.

It provides a Lock (LockMRSW) and the Context.

From here on down, the storage aspect of the hierarchy splits depending on
implementation style.

**DatasetGraphBaseFind**

This is the beginning of the hierarchy for DSGs that store using different units for default graph and named graphs.
This class splits find/4 into the following variants:

```
    findInDftGraph
    findInUnionGraph
    findQuadsInUnionGraph
    findUnionGraphTriples
    findInSpecificNamedGraph
    findInAnyNamedGraphs
```

**DatasetGraphTriplesQuads**

This is the beginning of the hierarchy for DSGs implemented as a set of triples for the default graph and a set of quads for all the named graphs.

It splits add(Quad) and delete(Quad) into:

    addToDftGraph
    addToNamedGraph
    deleteFromDftGraph
    deleteFromNamedGraph

and makes 

    setDefaultGraph
    addGraph
    removeGraph

copy-in operations - triples are copied into the graph or removed from the
graph, rather than the graph being shared.

** DatasetGraphInMemory**

The main in-memory implementation, providing full transactions (serializable isolation, abort).

Use this one!

This class backs `DatasetFactory.createTxnMem()`.

**DatasetGraphMap**

The in-memory implementation using in-memory Graphs as the storage for Triples.
It provides MRSW-transactions (serializable isolation, no real abort).
Use this if a single threaded application.

This class backs `DatasetFactory.create()`.

**DatasetGraphCollection**

Operations split into operations on a collection of Graphs, one for the default graph, and a map of (Node,Graph) for the named graphs.
It provides MRSW-transactions (serializable isolation, no real abort).

**DatasetGraphMapLink**

This implementation is manages Graphs provided by the application.

It provides MRSW-transactions (serializable isolation, no real abort).
Applications need to be careful when modifying the Graphs directly and also
modifying them via the DatasetGraph interface.

This class backs `DatasetFactory.createGeneral()`.

**DatasetGraphWrapper**

Indirection to another `DatasetGraph`.

Surprisingly useful.

**DatasetGraphViewGraphs**

A small class that provides the "get a graph" operations over a
`DatasetGraph` using `GraphView`.

Not used because subclasses usually want to inherit from a different part
fo the hierarchy but the idea of implementing `getDefaultGraph()` and
`getGraph(Node)` as calls to `GraphView` is used elsewhere.

Do not use with an implementations that store using graph
(e.g. `DatasetGraphMap`, `DatasetGraphMapLink`) because it goes into an
infinite recursion if they use GraphView internally.

**GraphView**

Implementation of the Graph interface as a view of a DatasetGraph including
providing a basic implementation of the union graph.  Subclasses can, and do,
provide a better mechanisms for the union graph based on their internal
indexes.

**DatasetGraphOne**

An implement that only provides a default graph, given at creation time.
This is a fixed - the app can't add named graphs.

Cuts through all the machinery to be a simple, direct implementation.

Backs up `DatasetGraphFactory.createOneGraph` but not
`DatasetFactory.create(Model)` which provided are adding named graphs.

**DatasetGraphQuads**

Root for implementations based on just quad storage, no special triples in
the default graph (e.g. the default graph is always the calculated union of
named graphs).  

Not used currently.

**DatasetGraphTrackActive**

Framework for implementing transactions.  Provides checking.

**DatasetGraphWithLock**

Provides transactions, without abort by default, using a lock.  If the lock
is LockMRSW, we get multiple-readers or a single writer at any given moment
in time. As most datastructures are multi-thread reader safe, this style
works over systems that do not themselves provide transactions.

Abort requires work to be undone.  Jena may in the future provide reverse
replay abort (do the adds and deletes in reverse operation, reverse order)
but this is partial. It does not protect against the DatasetGraph
implementation throwing exceptions nor JVM or machine crash (if any
persistence). It still needs MRSW to archive isolation.

Read-committed needs synchronization safe datastructures -including
co-ordinated changes to several places at once (ConcurrentHashMap isn't
enough - need to update 2 or more ConcurrentHashMaps together).

### TDB

**DatasetGraphTDB**

`DatasetGraphTDB` is concerned with the storage
historical and not used directly by applications.

**DatasetGraphTransaction**

This is the class returned by `TDBFactory`, wrapped in `DatasetImpl`.

Different in TDB2 - DatasetGraphTransaction not used, DatasetGraphTDB is transactional.

**DatasetGraphTxn**

This is the TDB per-transaction `DatasetGraph` using the transaction view
of indexes.  For the application, it is held in the transactions
`ThreadLocal` in `DatasetGraphTransaction`.

Internally, each read transaction for the same generation of the data uses
the same `DatasetGraphTransaction`.
