---
title: SDB Quickstart
---

----
> The Apache Jena SDB module has been retired and is no longer supported.<br/>
> The last release of Jena with this module was Apache Jena 3.17.0.<br/>
----

SDB provides some command line tools to work with SDB triple
stores. In the following it assumed that you have a store
description set up for your database (`sdb.ttl`). See the
[store description format](store_description.html "SDB/Store Description")
for details. The `Store/` directory for some examples.

###  Setting up your environment

    $ export SDBROOT=/path/to/sdb
    $ export PATH=$SDBROOT/bin:$PATH
    $ export SDB_USER=YourDatabaseUserName
    $ export SDB_PASSWORD=YourDatabasePassword
    $ export SDB_JDBC=YourJDBCdriver

### Initialising the database

Be aware that this will wipe existing data from the database.

     $ sdbconfig --sdb sdb.ttl --format

This creates a basic layout. It does *not* add all indexes to the
triple table, which may be left until after loading.

### Loading data

     $ sdbload --sdb sdb.ttl file.rdf

You might want to add the `--verbose` flag to show the load as it
progresses.

### Adding indexes

You need to do this at some point if you want your queries to
execute in a reasonable time.

     $ sdbconfig --sdb sdb.ttl --index

### Query

     $ sdbquery --sdb sdb.ttl 'SELECT * WHERE { ?s a ?p }'

     $ sdbquery --sdb sdb.ttl --file query.rq


