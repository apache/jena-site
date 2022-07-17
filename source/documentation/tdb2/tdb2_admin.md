---
title: TDB2 - Database Administration
---

## TDB2 directory layout

A TDB2 database is contained in a directory location `DIR` as:

    DIR/
      Backups/
      Data-0001/
      Data-0002/
      tdb.lock

where `Data-NNNN` are the compacted generations of the database. The
highest number is the currently live database.  The others are not used
and not touched by the TDB2 subsystem. They can be deleted, moved
elsewhere, or compressed as required. Each is a valid database in it own
right.

`Backups` is the directory used to write backup files.

`tdb.lock` is the lock file to stop multiple use of the same database at
the same time by different JVM processes. (If you wish to share a database
between processes, or machines, consider using [Fuseki2 with TDB2](tdb2_fuseki.html).

## Compaction

TDB2 databases grow over time as updates occur. They can be compacted by calling:

    DatabaseMgr.compact(dataset.asDatasetGraph());

Compaction can be done on a live database. Read requests will continue to be
serviced; write request are held up until compaction has finished. This
can be a long time for large databases.

Compaction creates a new `Data-NNNN` subdirectory and copied over the
latest view of the RDF dataset into that directory, then switch to using
that generation of the database. 

There is also a command line tool `tdb2.tdbcompact` to run the
compaction process on a database not in use. The command line
option  `--deleteOld` removes the last database after compaction.

Compaction can also be called from [the Fuseki HTTP Administration Protocol](/documentation/fuseki2/fuseki-server-protocol.html#compact)
for live [Fuseki webapps](/documentation/fuseki2/fuseki-webapp.html).

## Backup

A TDB2 database can be backed up by calling:

    DatabaseMgr.backup(dataset.asDatasetGraph());

which will create a dump file including a timestamp:

<pre>
<i>location</i>/Backups/backup-<i>yyyy-MM-dd_HH:mm:ss</i>.nq.gz
</pre>

The file is a compressed N-Quads file.

Backup can be done on a live database. It takes a consistent view of the
data and does not include any updates committed after the backup starts.

Backup can be called on a live database and read and write transactions
continue to be serviced.

There is also a command line tool `tdb2.tdbbackup` to run the
backup process on a database not in use.
