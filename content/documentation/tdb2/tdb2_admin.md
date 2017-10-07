Title: TDB2 - Database Administration

## TDB2 directory layout

A TDB2 database is contrained in a directory location `DIR` as:

    DIR/
      Backups/
      Data-0001/
      Data-0002/
      tdb.lock

where `Data-NNNN` are the compacted generations of the database. The
highest number is the currently live database.  The others are not used
and not touched by the TDB2 storage system. They can be deleted or compressed
as required.

`Backups` is teh directoryused to place backup files.

`tdb.lock` is the lock file to stop multipel use of the same database at
the same time by different JVM processes.

## Compaction

TDB2 databases grow over time as updates occur. They can be compacted by calling:

    DatabaseMgr.compact(dataset.asDatasetGraph());

This can be done on a live database. Read requests will continue to be
serviced; write request are held up until compaction has finished. This
can be a long time for large databases.

Compaction creates a new `Data-NNNN` subdirectory and copied over the
latest view of the RDF dataset into that directory, then switch to using
that generation of the database. 


## Backup

A TDB2 database can be backed up by calling:

    DatabaseMgr.backup(dataset.asDatasetGraph());

which will create a dump file with timestamp:

<pre>    
*location*/Backups/backup-*yyyy-MM-dd_HH:mm:ss*.nq.gz
</pre>

The file is a compressed N-Quads file.

Backup can be done on a live database. It takes a consistent view of the
data and does not include any updates committed after it starts.

Read and write transactions will continue to be serviced.
