---
title: TDB Quad Filter
---

This page describes how to filter quads at the lowest level of TDB.
It can be used to hide certain quads (triples in named graphs) or
triples.

The code for the example on this page can be found in the 
[TDB examples](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/tdb)
Filtering
quads should be used with care. The performance of the tuple filter
callback is critical.

See also
[Dynamic Datasets](dynamic_datasets.html) to
select only certain specified named graphs for a query.

TDB will call a registered filter on every quad that it retrieves
from any of the indexes, both quads (for named graphs) and triples
(for the stored default graph). This filter indicates whether to
accept or reject the quad or triple. This happens during basic
graph pattern processing.

A rejected quad is simply not processed further in the basic graph
pattern and it is as if it is not in the dataset.

The filter has a signature of: `java.util.function.Predicate<Tuple<NodeId>>`
with a type parameter of `Tuple<NodeId>`. `NodeId` is the low level
internal identifier TDB uses for RDF terms. `Tuple` is a class for
an immutable tuples of values of the same type.

      /** Create a filter to exclude the graph http://example/g2 */
      private static Predicate<Tuple<NodeId>> createFilter(Dataset ds)
      {
          DatasetGraphTransaction dst = (DatasetGraphTransaction)(ds.asDatasetGraph()) ;
          DatasetGraphTDB dsg = dst.getBaseDatasetGraph();

          NodeTable nodeTable = dsg.getQuadTable().getNodeTupleTable().getNodeTable() ;
          // Filtering operates at a very low level:
          // need to know the internal identifier for the graph name.
          final NodeId target = nodeTable.getNodeIdForNode(Node.createURI("http://example/g2")) ;

          // Filter for accept/reject as quad as being visible.
          Predicate<Tuple<NodeId>> filter = item ->
              {
                  // Quads are 4-tuples, triples are 3-tuples.
                  if ( item.size() == 4 && item.get(0).equals(target) )
                      // reject
                      return false ;
                  // Accept
                  return true ;
              } ;
          return filter ;
      }

To install a filter, put it in the context of a query execution
under the symbol `SystemTDB.symTupleFilter` then execute the query as normal.

        Dataset ds = ... ;
        Predicate<Tuple<NodeId>> filter = createFilter(ds) ;
        Query query = ... ;
        try (QueryExecution qExec = QueryExecution.dataset(ds)
                .query(query)
                .set(SystemTDB.symTupleFilter, filter)
                .build() ) {
            ResultSet rs = qExec.execSelect() ;
            ...
        }
