---
title: Apache Jena Elephas - Common API
---

The Common API provides the basic data model for representing RDF data within Apache Hadoop applications.  This primarily takes the form of `Writable` implementations and the necessary machinery to efficiently serialise and deserialise these.

Currently we represent the three main RDF primitives - Nodes, Triples and Quads - though in future a wider range of primitives may be supported if we receive contributions to implement them.

# RDF Primitives

## Nodes

The `Writable` type for nodes is predictably enough called `NodeWritable` and it implements the `WritableComparable` interface which means it can be used as both a key and/or value in Map/Reduce.  In standard Hadoop style a `get()` method returns the actual value as a Jena `Node` instance while a corresponding `set()` method allows the value to be set.  Conveying `null` values is acceptable and fully supported.

Note that nodes are lazily converted to and from the underlying binary representation so there is minimal overhead if you create a `NodeWritable` instance that does not actually ever get read/written.

`NodeWritable` supports and automatically registers itself for Hadoop's [`WritableComparator`](https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/io/WritableComparator.html) mechanism which allows it to provide high efficiency binary comparisons on nodes which helps reduce phases run faster by avoiding unnecessary deserialisation into POJOs.

However the downside of this is that the sort order for nodes may not be as natural as the sort order using POJOs or when sorting with SPARQL.  Ultimately this is a performance trade off and in our experiments the benefits far outweigh the lack of a more natural sort order.

You simply use it as follows

    NodeWritable nw = new NodeWritable();

    // Set the value
    nw.set(NodeFactory.createURI("http://example.org"));

    // Get the value (remember this may be null)
    Node value = nw.get();

## Triples

Again the `Writable` type for nodes is simply called `TripleWritable` and it also implements the `WritableComparable` interface meaning it may be used as both a key and/or value.  Again the standard Hadoop conventions of a `get()` and `set()` method to get/set the value as a Jena `Triple` are followed.  Unlike the `NodeWritable` this class does not support conveying `null` values.

Like the other primitives it is lazily converted to and from the underlying binary representations and it also supports & registers itself for Hadoop's `WritableComparator` mechanism.

## Quads

Similarly the `Writable` type for quads is again simply called `QuadWritable` and it implements the `WritableComparable` interface making it usable as both a key and/or value.  As per the other primitives standard Hadoop conventions of a `get()` and `set()` method are provided to get/set the value as a Jena `Quad`.  Unlike the `NodeWritable` this class does not support conveying `null` values.

Like the other primitives it is lazily converted to and from the underlying binary representations and it also supports & registers itself for Hadoop's `WritableComparator` mechanism.

## Arbitrary sized tuples

In some cases you may have data that is RDF like but not itself RDF or that is a mix of triples and quads in which case you may wish to use the `NodeTupleWritable`.  This is used to represent an arbitrarily sized tuple consisting of zero or more `Node` instances, there is no restriction on the number of nodes per tuple and no requirement that tuple data be uniform in size.

Like the other primitives it implements `WritableComparable` so can be used as a key and/or value.  However this primitive does not support binary comparisons meaning it may not perform as well as using the other primitives.

In this case the `get()` and `set()` methods get/set a `Tuple<Node>` instance which is a convenience container class provided by ARQ.  Currently the implementation does not support lazy conversion so the full `Tuple<Node>` is reconstructed as soon as an `NodeTupleWritable` instance is deserialised.
