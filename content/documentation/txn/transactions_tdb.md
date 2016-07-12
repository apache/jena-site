## API for Transactions

## Overview from TDB doc

The transaction mechanism in TDB is based on
[write-ahead-logging](http://en.wikipedia.org/wiki/Write-ahead_logging).
All changes made inside a write-transaction are written to
[journals](http://en.wikipedia.org/wiki/Journaling_file_system),
then propagated to the main database at a suitable moment. This
design allows for read-transactions to proceed without locking or
other overhead over the base database.

Transactional TDB supports one active write transaction, and
multiple read transactions at the same time. Read-transactions
started before a write-transaction commits see the database in a
state without any changes visible. Any transaction starting after a
write-transaction commits sees the database with the changes
visible, whether fully propagates back to the database or not.
There can be active read transactions seeing the state of the
database before the updates, and read transactions seeing the state
of the database after the updates running at the same time.

Transactional TDB works with SPARQL Query, SPARQL Update, SPARQL
Graph Store Update as well as the full Jena API.

TDB provides
[Serializable](http://en.wikipedia.org/wiki/Isolation_%28database_systems%29#SERIALIZABLE)
transactions, the highest
[isolation level](http://en.wikipedia.org/wiki/Isolation_%28database_systems%29).

## Limitations

(some of these limitations may be removed in later versions)

-   Bulk loads: the TDB bulk loader is not transactional
-   [Nested transactions](http://en.wikipedia.org/wiki/Nested_transaction) are not supported.
-   Some active transaction state is held exclusively in-memory,
    limiting scalability.
-   Long-running transactions. Read-transactions cause a build-up
    of pending changes;

If a single read transaction runs for a long time when there are
many updates, the system will consume a lot of temporary
resources.
