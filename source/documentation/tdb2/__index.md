---
title: TDB2
slug: index
---

TDB2 is a component of [Apache Jena](https://jena.apache.org) for RDF storage
and query.  It supports the full range of Jena APIs.  TDB2 can be used as a high
performance RDF store on a single machine.  TDB2 can be used with Apache Jena
Fuseki.

TDB1 is the previous generation native storage system for Jena.

Compared to TDB1:

- No size limits on transactions : bulk uploads into a live Fuseki can be 100's
of millions of triples.
- Models and Graphs can be passed across transactions
- Transactional only (there is currently no "autocommit" mode).
- Better transaction control
    - No queue of delayed updates
    - No backlog problems.
    - "Writer pays" - readers don't
- Datatypes of numerics preserved; `xsd:doubles` supported.

**TDB2 is not compatible with TDB1**

## Documentation

-  [Migrating from TDB1](tdb2_migration.html)
-  [Use with Fuseki2](tdb2_fuseki.html)
-  [Command line tools](tdb2_cmds.html)
-  [Database administration](tdb2_admin.html)
