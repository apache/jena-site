---
title: SDB - persistent triple stores using relational databases
---

SDB uses an SQL database for the storage and query of RDF data.
Many databases are supported, both Open Source and proprietary.

An SDB store can be accessed and managed with the provided command
line scripts and via the Jena API.

<blockquote>
<i>
Use of SDB for new applications is not recommended.
</i>
</blockquote>

<i>This component is "maintenance only".</i>

<i>[TDB](../tdb/index.html) is faster, more scalable and better supported
than SDB.</i>

## Status 

As of June 2013 the Jena developers agreed to treat SDB as 
being only maintained where possible. 
See [Future of SDB](http://mail-archives.apache.org/mod_mbox/jena-users/201306.mbox/%3c51B1A7FB.4070601@apache.org%3e) thread on the mailing list.

The developers intend to continue releasing SDB alongside other Jena
components but it is not actively developed.  None of the developers
use it within their organizations.

SDB may be revived as a fully supported component if members of the
community come forward to develop it.  The Jena team strongly recommends
the use of [TDB](../tdb/) instead of SDB for all new development due to
TDBs substantially better performance and scalability.

## Documentation

-   [SDB Installation](installation.html)
-   [Quickstart](quickstart.html)
-   [Command line utilities](commands.html)
-   [Store Description format](store_description.html)
-   [Dataset And Model Descriptions](dataset_description.html)
-   [Use from Java](javaapi.html)
-   [Specialized configuration](configuration.html)
-   [Database Layouts](database_layouts.html)
-   [FAQ](faq.html)
-   [Fuseki Integration](fuseki_integration.html)
-   [Databases supported](databases_supported.html)

## Downloads

SDB is distributed from the Apache Jena project. See the
[downloads page](/download/index.cgi) for details.

## Support

[Support and questions](/help_and_support)

## Details

-   [Loading data](loading_data.html)
-   [Loading performance](loading_performance.html)
-   [Query performance](query_performance.html)

## Database Notes

List of [databases supported](databases_supported.html)

Notes:

-   [PostgreSQL notes](db_notes.html#postgresql)
-   [MySQL notes](db_notes.html#mysql)
-   Oracle notes
-   [Microsoft SQL Server notes](db_notes.html#ms_sql)
-   [DB2 notes](db_notes.html#db2)
-   [Derby notes](db_notes.html#derby)
-   HSQLDB notes
-   H2 notes
