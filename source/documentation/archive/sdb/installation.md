---
title: SDB Installation
---

A
[suitable database](databases_supported.html "SDB/Databases Supported")
must be installed separately. Any database installation should be
tuned according to the database documentation.

The SDB distribution is zip file of a directory hierarchy.

Unzip this. You may need to run `chmod u+x` on the scripts in the
`bin/` directory.

Write a `sdb.ttl`
[store description](store_description.html "SDB/Store Description"):
there are examples in the `Store/` directory.

A database must be created before the tests can be run.
[Microsoft SQL server](db_notes.html#ms-sql) and
[PostgreSQL](db_notes.html#postgresql) need
specific database options set when a database is created.

To use in a Java application, put all the jar files in `lib/` on
the build and classpath of your application. See the
[Java API](javaapi.html "SDB/JavaAPI").

To use command line scripts, see the
[scripts page](commands.html "SDB/Commands") including setting
environment variables `SDBROOT`, `SDB_USER`, `SDB_PASSWORD` and
`SDB_JDBC`.

     bin/sdbconfig --sdb=sdb.ttl --create



