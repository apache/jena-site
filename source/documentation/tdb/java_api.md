---
title: TDB Java API
---

All the operations of the
Jena API including the
[SPARQL query and SPARQL Update](../query/) are supported.
The application obtains a model or RDF datasets from TDB then uses
it as for any other model or dataset.

TDB also supports [transactions](tdb_transactions.html).

## Constructing a model or dataset

The class `TDBFactory` contains the static factory methods for
creating and connecting to a TDB-backed graph or an RDF dataset.
Models and datasets should be closed after use.

An application can specify the model or dataset by:

1.  Giving a directory name
2.  Giving an assembler file

If a directory is empty, the TDB files for indexes and node table
are created. If the directory contains files from a previous
application run, TDB connects to the data already there.

Closing the model or dataset is important. Any updates made are
forced to disk if they have not been written already.

### Using a directory name

      // Make a TDB-backed dataset
      String directory = "MyDatabases/Dataset1" ;
      Dataset dataset = TDBFactory.createDataset(directory) ;
      ...
      dataset.begin(ReadWrite.READ) ;
      // Get model inside the transaction
      Model model = dataset.getDefaultModel() ;
      dataset.end() ;
      ... 
      dataset.begin(ReadWrite.WRITE) ;
      model = dataset.getDefaultModel() ;
      dataset.end() ;
      ... 

### Using an assembler file

      // Assembler way: Make a TDB-back Jena model in the named directory.
      // This way, you can change the model being used without changing the code.
      // The assembler file is a configuration file.
      // The same assembler description will work in Fuseki.
      String assemblerFile = "Store/tdb-assembler.ttl" ;
      Dataset dataset = TDBFactory.assembleDataset(assemblerFile) ;
      ...
      dataset.begin(ReadWrite.READ) ;
      // Get model inside the transaction
      Model model = dataset.getDefaultModel() ;
      dataset.end() ;
      ...

See
[the TDB assembler documentation](assembler.html)
for details.

## Bulkloader

The bulkloader is a faster way to load data into an empty dataset
than just using the Jena update operations.

It is accessed through the command line utility `tdbloader`.

## Concurrency

TDB support [transactions](tdb_transactions.html), which is the preferred
way to work.  It is possible to act directly on the dataset without transaction
with a Multiple Reader or Single Writer (MRSW) policy for
concurrency access. Applications are expected to adhere to this
policy - it is not automatically checked.

One gotcha is Java iterators. An iterator that is moving over the
database is making read operations and no updates to the dataset
are possible while an iterator is being used.

## Caching and synchronization

If used non-transactionally, then the application must be aware of
the caching and synchronization used by TDB.  TDB employs caching at
various levels, from RDF terms to disk
blocks. It is important to flush all caches to make the file state
consistent with the cached states because some caches are
write-behind so unwritten changes may be held in-memory.

TDB provides an explicit call dataset objects for
synchronization with disk:

      Dataset dataset = ... ;
      TDB.sync(dataset );

Any dataset or model can be passed to these functions - if they are
not backed by TDB then no action is taken and the call merely
returns without error.
