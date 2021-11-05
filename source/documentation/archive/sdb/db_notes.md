---
title: SDB Database Notes
---

- [DB2](#db2)
- [Derby](#derby)
- [MS SQL](#ms-sql)
- [MySQL](#mysql)
- [PostgresQL](#postgresql)

## DB2

### Database creation

The database should be created with code set UTF-8 so unicode is
enabled (SDB creates tables CCSID UNICODE for full
internationalization support).


## Derby

### Loading Restriction

Only one load operation can be active at any one time. Limitations
on temporary tables in Derby mean the loader tables are not
temporary and hence are shared by all connections.

## MS SQL

The collation sequence for the database must be one that is binary
(BIN in the name). It does not matter which one is used. Without
BIN, string matching is case insensitive but RDF requires case
sensitive literals and IRIs. The normal layout is not affected by
this because it does not use string comparisons.

## MySQL

### National Characters

SDB formats all table columns used for storing text in the MySQL
schema to UTF-8. However, this does not cause the data to be
transmitted in UTF-8 over the JDBC connection.

The best way is to run the server with a default character set of
UTF-8. This is set in the MySQL server configuration file:

    [mysql]
    default-character-set=utf8

A less reliable way is to pass parameters to the JDBC driver in the
JDBC URL. The application will need to explicitly set the JDBC URL
in the
[store configuration](store_description.html "SDB/Store Description")
file.

     ...?useUnicode=true&characterEncoding=UTF-8

### Connection timeouts

If you get the connection timing out after (by default) 8 hours of
no activity, try setting `autoReconnect=true` in the JDBC URL.

### Tuning

1.  For InndoDB, the critical parameter is
    `innodb_buffer_pool_size`. See the MySQL sample configuration files
    for details.
2.  Using ANALYZE TABLE on the database tables can improve the
    choices made by the MySQL optimizer.

### Connection Timeout

MySQL closes the JDBC connection after a period of no use (8 hours
by default).

While deprecated my MySQL, `?autoReconnect=true` may help here.

Other ways of addressing the problem are to make a simple query
call on a regular basis just to keep the connection alive (e.g.
`SELECT * { <http://example/junk> <http://example/junk> <http://example/junk> }`).

Some connection pool systems automatic compensate for this feature
of MySQL.

## PostgresQL

### Databases must use UTF-8 encoding

Create SDB stores with encoding UTF-8.

International character sets can cause corrupted databases
otherwise. The database will not pass the SDB test suite.

Set this when creating the database with pgAdmin or if you use the
command line, for example:

     CREATE DATABASE "YourStoreName"
     WITH OWNER = "user"
          ENCODING = 'UTF8'
          TABLESPACE = pg_default;

### Improving loading rates

The index layout ("layout2/index") usually loads faster than the
hash form.

*Existing store*

When loading into an existing store, where there is existing data
and `ANALYZE` has been run, the process is:

-   Drop indexes

     sdbconfig --drop

-   Load data

    sdbload file

-   Redo the indexes

     sdbconfig --index

*Fresh store*

PostgreSQL needs statistics to improve load performance through the
use of `ANALYSE`.

When loading the first time, there are no statistics so, for a
large load, it is advisable to load a sample, run `ANALYSE` and
then load the whole data.

-   Create the database without indexes (just the primary keys).

     sdbconfig --format

-   Load a sample of the triples (say, a 100K or a million triples
    - until

the load rate starts to drop appreciably). The sample must be
representative of the data.

     sdbload --time sample

-   Run `ANALYZE` on the database.

-   If your sample is one part of a large set of files, this set is
    not necessary at all. If you are loading one single large file then
    you might wish to empty the database. This is only needed if the
    data has bNodes in

it because the load process suppresses duplicates.

     sdbconfig --truncate

-   Now load the data or rest of the data.

     sdbload --time file

-   Add the indexes. This only takes a few minutes even on a very
    large store but calculating them during loading (that is,
    `--create`, not `--format`) is noticeably slower.

     sdbconfig --index

-   Run `ANALYZE` on the database again.

### Tuning

It is essential to run the PostgreSQL ANALYZE command on a
database, either during or after building. This is done via the
command line `psql` or via `pgAdmin`. The PostgreSQL documentation
describes ways to run this as a background daemon.

Various of the PostgreSQL configuration parameters will affect
performance, particularly `effective_cache_size`. The parameter
`enable_seqscan` *may* help avoid some unexpected slow queries.
