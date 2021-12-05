---
title: TDB FAQs
---

## FAQs

-   [What are TDB1 and TDB2?](#tdb1-tdb2)
-   [Does TDB support Transactions?](#transactions)
-   [Can I share a TDB dataset between multiple applications?](#multi-jvm)
-   [What is the *Impossibly Large Object* exception?](#impossibly-large-object)
-   [What are the *ObjectFile.read()* and *ObjectFileStorage.read()* errors?](#object-file-errors)
-   [What is the difference between `tdbloader` and `tdbloader2`?](#tdbloader-vs-tdbloader2)
-   [How large a Java heap size should I use for TDB?](#java-heap)
-   [Does Fuseki/TDB have a memory leak?](#fuseki-tdb-memory-leak)
-   [Should I use a SSD?](#ssd)
-   [Why do I get the exception *Can't open database at location /path/to/db as it is already locked by the process with PID 1234* when trying to open a TDB database?](#lock-exception)
-   [I see a warning that *Location /path/to/db was not locked, if another JVM accessed this location simultaneously data corruption may have occurred* in my logs?](#no-lock-warning)
-   [Why can't I delete a dataset (MS Windows/64 bit)?](#windows-dataset-delete)
-   [What is the *Unable to check TDB lock owner, the lock file contents appear to be for a TDB2 database. Please try loading this location as a TDB2 database* error?](#tdb2-lock)
-   [My question isn't answered here?](#not-answered)

<a name="tdb1-tdb2></a>
## TDB1 and TDB2

TDB2 is a later generation of database for Jena. It is more robust and can
handle large update transactions.

These are different databases systems - they have different on-disk file formats
and databases for one are not compatible with other database engine.

<a name="transactions"></a>
## Does TDB support transactions?

Yes, TDB provides
[Serializable](http://en.wikipedia.org/wiki/Isolation_\(database_systems\)#SERIALIZABLE)
transactions, the highest
[isolation level](http://en.wikipedia.org/wiki/Isolation_\(database_systems\)).

Using transactions is **strongly** recommended as they help prevent data corruption 
from unexpected process termination and system crashes as well as data corruption that
can otherwise occur from non-transactional use of TDB.

Please see the [transactions](tdb_transactions.html) documentation for how to use TDB
transactionally.

<a name="multi-jvm"></a>
## Can I share a TDB dataset between multiple applications?

Multiple applications, running in multiple JVMs, using the same
file databases is **not** supported and has a high risk of data corruption.  Once corrupted, a database cannot be repaired
and must be rebuilt from the original source data. Therefore there **must** be a single JVM
controlling the database directory and files.

TDB includes automatic prevention of multi-JVM usage which prevents this under most circumstances and helps
protect your data from corruption.

If you wish to share a TDB dataset between applications use our [Fuseki](../fuseki2/) component which provides a 
database server. Fuseki supports [SPARQL Query](http://www.w3.org/TR/sparql11-query/),
[SPARQL Update](http://www.w3.org/TR/sparql11-update/) and the [SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
Applications should be written in terms of these protocols using the relevant Jena APIs, this has the added benefit of making your
applications portable to another SPARQL backend should you ever need to.

<a name="impossibly-large-object"></a>
## What is the *Impossibly Large Object* exception?

The *Impossibly Large Object* exception is an exception that occurs when part of your TDB dataset has become corrupted.  It may
only affect a small section of your dataset so may only occur intermittently depending on your queries.  For example some queries 
may continue to function normally while other queries or queries with/without particular features may fail.  A particular query that 
fails with this error should continue to always fail unless the database is modified.

A query that touches the entirety of the dataset will always encounter this exception and can be used to verify whether your
database has this problem e.g.

    SELECT * WHERE { { ?s ?p ?o } UNION { GRAPH ?g { ?s ?p ?o } } }

The corruption may have happened at any time in the past and once it has happened there is no way to repair it.  Corrupted datasets 
will need to be rebuilt from the original source data, this is why we **strongly** recommend you use 
[transactions](tdb_transactions.html) since this protects your dataset against corruption.

To resolve this problem you **must** rebuild your database from the original source data, a corrupted database **cannot** be repaired.

## What are the *ObjectFile.read()* and *ObjectFileStorage.read()* errors? {#object-file-errors}

These errors are closely related to the above *Impossibly Large Object* exception, they also indicate corruption to your TDB database.

As noted above to resolve this problem you **must** rebuild your database from the original source data, a corrupted database **cannot** 
be repaired. This is why we **strongly** recommend you use [transactions](tdb_transactions.html) since this protects your dataset against 
corruption.

## What is `tdb.xloader`?

`tdb1.xloader` and `tdb2.xloader` are bulk loaders for very large datasets that
take several hours to load.

See [TDB xloader](./tdb-xloader.html) for more information.

<a name="tdbloader-vs-tdbloader2"></a>
## What is the different between `tdbloader` and `tdbloader2`?

`tdbloader2` has been replaced by `tdb1.xloader` and `tdb2.xloader` for TDB1 and TDB2 respectively.


`tdbloader` and `tdbloader2` differ in how they build databases.


`tdbloader` is Java based and uses the same TDB APIs that you would use in your own Java code to perform the data load.  The advantage of this is that
it supports incremental loading of data into a TDB database.  The downside is that the loader will be slower for initial database builds.

`tdbloader2` is POSIX compliant script based which limits it to running on POSIX systems only.  The advantage this gives it is that it is capable of building 
the database files and indices directly without going through the Java API which makes it much faster.  **However** this does mean that it can only be used
for an initial database load since it does not know how to apply incremental updates.  Using `tdbloader2` on a pre-existing database will cause the existing
database to be overwritten.

Often a good strategy is to use `tdbloader2` for your initial database creation and then use `tdbloader` for smaller incremental updates in the future.

<a name="java-heap"></a>
## How large a Java heap should I use for TDB?

TDB uses memory mapped files heavily for providing fast access to data and indices.  Memory mapped files live outside of the JVM heap and are managed by
the OS therefore it is important to not allocate all available memory to the JVM heap.

However JVM heap is needed for TDB related things like query & update processing, storing the in-memory journal etc and also for any other activities that your code carries
out.  What you should set the JVM heap to will depend on the kinds of queries that you are running, very specific queries will not need a large heap whereas queries that touch
large amounts of data or use operators that may require lots of data to be buffered in-memory e.g. `DISTINCT`, `GROUP BY`, `ORDER BY` may need a much larger heap depending
on the overall size of your database.

There is no hard and fast guidance we can give you on the exact numbers since it depends heavily on your data and your workload.  Please ask on our mailing lists 
(see our [Ask](../help_and_support/) page) and provide as much detail as possible about your data and workload if you would like us to attempt to provide more specific guidance.

<a name="fuseki-tdb-memory-leak"></a>
## Does Fuseki/TDB have a memory leak?

A number of users have reported a suspected memory leak when using Fuseki/TDB when it used to serve a database that has continuous high
load with a mixture of queries and updates.  Having investigate the problem this is not a memory leak per-se rather a limitation of how
[transactions](tdb_transactions.html) are implemented for TDB.

TDB uses write-ahead logging so new data is written both to an on-disk journal and kept in-memory.  This is necessary because TDB permits
a single writer and multiple readers at any one time and readers are guaranteed to always see the state of the database at the time they
started reading.  Therefore, until there are no active readers it is not possible to update the database directly since readers are actively
accessing it hence why a journal is used.  The in-memory journal holds some memory that cannot be freed up until such time as the database
has no active readers/writers and the changes it holds can be safely flushed to disk.

This means that in scenarios where there is continuous high load on the system TDB never reaches a state where it is able to flush the journal
eventually causing out of memory errors in Fuseki.  You can see if you are experiencing this issue by examining your database directory, if it
contains a `.jrnl` file that is non-empty then Fuseki/TDB is having to hold the journal in-memory.

**However**, because this relates to transactional use and the journal is also stored on disk no data will be lost, by stopping and restarting 
Fuseki the journal will be flushed to disk. When using the [TDB Java API](java_api.html), the journal can be flushed by closing any datasets and releasing the TDB resources.
    
      Dataset dataset = TDBFactory.createDataset(directory) ;
      try{
         ...
         dataset.begin(ReadWrite.READ) ;
         // Perform operations      
         dataset.end() ;
         ... 
      }finally{
         dataset.close();
         TDBFactory.release(dataset);
      }

<a name="ssd"></a>
## Should I use a SSD?

Yes if you are able to

Using a SSD boost performance in a number of ways.  Firstly bulk loads, inserts and deletions will be faster i.e. operations that modify the 
database and have to be flushed to disk at some point due to faster IO.  Secondly TDB will start faster because the files can be mapped into
memory faster.

SSDs will make the most difference when performing bulk loads since the on-disk database format for TDB is entirely portable and may be
safely copied between systems (provided there is no process accessing the database at the time).  Therefore even if you can't run your production
system with a SSD you can always perform your bulk load on a SSD equipped system first and then move the database to your production system.

<a name="lock-exception"></a>
## Why do I get the exception *Can't open database at location /path/to/db as it is already locked by the process with PID 1234* when trying to open a TDB database?

This exception is a result of TDBs automatic multi-JVM usage prevention, as noted in the earlier 
[Can I share a TDB dataset between multiple applications?](#multi-jvm) question a TDB database can only be safely used by a single JVM otherwise
data corruption may occur.  From 1.1.0 onwards TDB automatically enforces this restriction wherever possible and you will get this exception if you
attempt to access a database which is being accessed from another JVM.

To investigate this error use the process management tools for your OS to see what the process ID referenced in the error is.  If it is another JVM
then the error is entirely valid and you should follow the advice about sharing a TDB dataset between applications.  You may need to coordinate with
the owner of the other process (if it is not yourself) in order to do this.

In rare circumstances you may find that the process is entirely unrelated (this can happen due to stale lock files since they are not always automatically 
cleared up) in which case you can try and manually remove the `tdb.lock` file from the database directory.  Please only do this if you are **certain** that 
the other process is not accessing the TDB database otherwise data corruption may occur.

<a name="no-lock-warning"></a>
## I see a warning that *Location /path/to/db was not locked, if another JVM accessed this location simultaneously data corruption may have occurred* in my logs?

This warning can occur in rare circumstances when TDB detects that you are releasing a database location via `StoreConnection.release()` and that the
database was eligible to be locked but wasn't.  This can usually only occur if you circumvented the normal TDB database opening procedures somehow.

As the warning states data corruption may occur if another JVM accesses the location while your process is accessing it.  Ideally you should follow the
advice on [multi-JVM usage](#multi-jvm) if this might happen, otherwise the warning can likely be safely ignored.

## Why can't I delete a dataset (MS Windows/64 bit)? {#windows-dataset-delete}

Java on MS Windows does not provide the ability to delete a memory mapped
file while the JVM is still running.  The file is properly deleted when the
JVM exits.  This is a known issue with Java.  
See the Java bug database e.g. 
[Bug id: 4724038](http://bugs.java.com/view_bug.do?bug_id=4724038) and several
others. While there are some workarounds mentioned on the web, 
none is known to always work on all JVMs.

On 64 bit systems, TDB uses memory mapped to manage datasets on disk.  This
means that the operating system dynamically controls how much of a file is held in
RAM, trading off against requests by other applications.  But it also means
the database files are not properly deleted until the JVM exits.  A new
dataset can not be created in the same location (directory on disk).

The workaround is to use a different location.

##  What is the *Unable to check TDB lock owner, the lock file contents appear to be for a TDB2 database. Please try loading this location as a TDB2 database* error? {#tdb2-lock}

As described elsewhere in this FAQ (see [Lock Exceptions](#lock-exception) 
and [No Lock Warning](#no-lock-warning)) TDB uses a lock file to ensure that multiple 
JVMs don't try to use the same TDB database simultaneously as this can lead to 
data corruption.  However with the introduction of [TDB2](../tdb2/) there are now two
versions of TDB, TDB2 also uses a lock file however it uses a slightly different
format for that file.

This error means that you have tried to open a [TDB2](../tdb2/) database as a TDB1 
database which is not permitted.  Please adjust your usage of Jena libraries or command
line tools to use TDB2 code/arguments as appropriate.

For example if [Using TDB2 with Fuseki](../tdb2/tdb2_fuseki.html) you would need to use
the `--tdb2` option.

## My question isn't answered here? {#not-answered}

If your question isn't answered here please get in touch with the project, please check out the [Ask](../../help_and_support/index.html) page for ways to ask for further help.
