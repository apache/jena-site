---
title: SDB Database Layouts
---

[SDB](index.html "SDB") does not have a single database layout. This
page is an informal overview of the two main types ("layout2/hash"
and "layout2/index").

In SDB one store is one RDF dataset is one SQL database.

Databases of type layout2 have a triples table for the default
graph, a quads table for the named graphs. In the triples and quads
tables, the columns are integers referencing a nodes table.

In the hash form, the integers are 8-byte hashes of the node.

In the index form, the integers are 4-byte sequence ids into the
node table.


**Triples**

    +-----------+
    | S | P | O |
    +-----------+

Primary key: SPO  <br />
Indexes: PO, OS

**Quads**

    +---------------+
    | G | S | P | O |
    +---------------+

Primary key: GSPO  <br />
Indexes: GPO, GOS, SPO, OS, PO.

**Nodes**

In the index-based layout, the table is:

    +------------------------------------------------+
    | Id | Hash | lex | lang | datatype | value type |
    +------------------------------------------------+

Primary key: Id  <br />
Index: Hash

Hash:

    +-------------------------------------------+
    | Hash | lex | lang | datatype | value type |
    +-------------------------------------------+

Primary key: Hash

All character fields are unicode, supporting any character set,
including mixed language use.



