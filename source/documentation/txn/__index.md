---
title: Jena Transactions
slug: index
---

This page gives an overview of transactions in Jena.

There are two API for transactions: the [basic transaction
interface](transactions_api.html) styled after the conventional
`begin`-`commit` and a [higher level `Txn` API](#txn.html) that builds
on the basic API using Java8 features.

## APIs

-   [Basic API for Transactions](transactions_api.html)
-   [Txn, a high level API to transactions](txn.html)

## Overview

Transaction provide applications with a safe way to use and update data between
threads. The properties of transactions are [ACID](https://en.wikipedia.org/wiki/ACID)
- Atomic, Consistent, Isolation, Durable -
meaning that groups of changes are made visible to other transactions
in a single unit or no changes become visible, and when made changes are not
reversed, or the case of persistent storage, not lost or the database corrupted.

Jena provides transaction on datasets and provides "serializable transactions".
Any application code reading data sees all changes made elsewhere,
not parts of changes.  In particular, SPARQL aggregation like `COUNT` are
correct and do not see partial changes due to other transactions.

The exact details are dependent on the implementation.

Transactions can not be [nested](https://en.wikipedia.org/wiki/Nested_transaction)
(a transaction happening inside an outer transaction results in changes visible only
to the outer transaction until that commits).

Transactions are "per thread". Actions by different threads on the same dataset are
always inside different transactions.

## Implementations

Transactions are part of the interface to RDF Datasets.
There is a default implementation, based on MRSW locking (multiple-reader or single-writer)
that can be used with any mixed set of components. Certain storage sub-systems provide
better concurrency with MR+SW (multiple-read and single writer).

| Dataset   | Facilities | Creation |
|-----------|-----------|----------|
| TxnMem    | MR+SW             | `DatasetFactory.createTxnMem` |
| TDB       | MR+SW, persistent | `TDBFactory.create` |
| TDB2      | MR+SW, persistent | `TDB2Factory.create` |
| General   | MRSW              | `DatasetFactory.create` |

The general dataset can have any graphs added to it (e.g. inference graphs).

[More details of transactions in TDB](transactions_tdb.html).
