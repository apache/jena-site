---
title: SDB Store Description
---

----
> The Apache Jena SDB module has been retired and is no longer supported.<br/>
> The last release of Jena with this module was Apache Jena 3.17.0.<br/>
----

Use of an SDB store requires a `Store` object which is described in
two parts:

-   a connection to the database
-   a description of the store configuration

These can be built from a
[Jena assembler](../assembler/)
description.

Store objects themselves are lightweight so connections to an SDB
database can be created on a per-request basis as required for use
in J2EE application servers.

## Store Descriptions

A store description identifies which storage layout is being used,
the connection to use and the database type.

     [] rdf:type sdb:Store ;
         sdb:layout         "layout2" ;
         sdb:connection     <#conn> .

     <#conn> ...

## SDB Connections

SDB connections, objects of class `SDBConnection`, abstract away
from the details of the connection and also provide consist logging
and transaction operations. Currently, SDB connections encapsulate
JDBC connections but other connection technologies, such as direct
database APIs, can be added.



## Example

The `sdbType` is needed for both a connection and for a store
description. It can be given in either part of the complete store
description. If it is specified in both places, it must be the
same.

    @prefix rdfs:      <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix ja:       <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix sdb:      <http://jena.hpl.hp.com/2007/sdb#> .

    <#myStore> rdf:type sdb:Store ;
         sdb:layout         "layout2" ;
         sdb:connection     <#conn> ;
         .

    <#conn> rdf:type sdb:SDBConnection ;
         sdb:sdbType        "derby" ;
         sdb:sdbName        "DB/SDB2" ;
         sdb:driver         "org.apache.derby.jdbc.EmbeddedDriver" ;
         .

Examples of assembler files are to be found in the `Store/`
directory in the distribution.

## Vocabulary

### Store

The value of `sdbType` needed for the connection also applies to
choosing the store type.

`layout`
  ~ Layout type (e.g. "layout2", "layout2/hash" or
    "layout2/index").

`connection`
  ~ The object of this triple is the subject of the connection
    description.

`engine`
  ~ Set the MySQL engine type (MySQL only).

### Connection

`sdbType`
:   The type of the database (e.g. "oracle", "MSSQLServerExpress",
    "postgresql", "mysql"). Controls both creating the JDBC URL, if not
    given explicitly, and the store type.

`sdbName`
:   Name used by the database service to select a database. Oracle
    SID.

`sdbHost`
:   Host name for the database server. Include *:port* to change
    the port from the default for the database.

`sdbUser`
`sdbPassword`
:   Database user name and password. The environment variables
    `SDB_USER` and `SDB_PASSWORD` are a better way to pass in the user
    and password because they are not then written into store
    description files. In Java programs, the system properties
    `jena.db.user` and `jena.db.password` can be used.

`driver`
:   The JDBC driver class name. Normally, the system looks up the
    `sdbType` to find the driver. Setting this property overrides that
    choice.

`jdbcURL`
:   If necessary, the JDBC URL can be set explicitly, not
    constructed by SDB. The `sdbType` is still needed.



