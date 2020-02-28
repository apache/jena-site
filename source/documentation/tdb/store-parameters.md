---
title: TDB - Store Parameters
---

TDB (as of version Jena 3.0.0) supports configuration of the
databases when they are first created and each time an application connects
to an existing database.  Databases using the default settings built-into
TDB continue to work exactly as before.

## Setting Store Parameters

In TDB, there is exactly one internal object for each dataset in the JVM
and this is shared between all application datasets for that location of
persistent storage.

Setting store parameters is done by setting the internal system state
before any other access to the disk area occurs. It is not possible to have
different setups for the same dataset on disk.

`StoreParams` are set by populating the internal state with the setup
before a application level dataset is created.

    TDBFactory.setup(Location location, StoreParams params)

This must be called before any application calls to get a `Dataset` (or
`DatasetGraph`) object otherwise `IllegalStateException` is thrown by this
function.

    Location location = ... ;
    StoreParams customParams = ... ;

    TDBFactory.setup(location, customParams) ;
    
    Dataset ds = TDBFactory.createDataset(location) ;
    ...

It is only possible to change store parameters by expelling the managed
storage by calling `TDBFactory.release(Location)`.  This drops all caching.
Access to the dataset is then a cold start.

## Per-connect Options

The per-connect options are the ones that can be changed after the database has
been created and can be different each time the application attaches to the
database.  A database can have at most one JVM attached to it (see Fuseki 
to share a database).

These options do not affect the on-disk structures.

| JSON key name                  | Default value | Notes                  |
|--------------------------------|--------------:|------------------------|
| tdb.file_mode                  | See below     |                        |
| tdb.node2nodeid_cache_size     | 100,000       |  50,000 on 32 bit java |
| tdb.nodeid2node_cache_size     | 500,000       |  50,000 on 32 bit java |
| tdb.node_miss_cache_size       |     100       |                        |
| tdb.block_read_cache_size      |   10000       | Only in direct mode    |
| tdb.block_write_cache_size     |    2000       | Only in direct mode    |

### File access - "mapped" and "direct" modes

TDB has two modes of operation for accessing block files - "mapped" and
"direct".

* "mapped" uses memory mapped files and so the operating system is managing
caching, flexing the amount of memory for file system cache to balance
demands from other programmes on the same hardware.

* "direct" using TDB's own in-heap block caching.  It avoids the problem that
addressing is limited to a total of about 1.5Gbytes on 32 bit Java.

By default, TDB uses memory mapped files on 64 bit Java and its own file
caching on 32 bit java.

On Microsoft Windows, "mapped" databases can not be deleted while the JVM is running on MS
Windows.  This is a [known issue with Java](http://bugs.java.com/view_bug.do?bug_id=4715154).

TDB databases are compatible across these file modes.  There is no
difference to the file layouts.  Memory mapped files may appear larger
because they contain unused space.  Some utilities report this in file
size, some do not.

### Caching options.

These are the useful tuning options.  Only the <tt>node*</tt> choices have
any effect when running in "mapped" mode.

All these options effect the amount of heap used.  The block read/write
cache sizes are tuned to 32 bit Java.

Increasing the Node/NodeId cache sizes on 64 bit machines may be
beneficial.

## Static Options

While it is possible to customize a database, this is considered to be
experimental. It is possible to corrupt, unrecoverable, existing databases
and create nonsense databases with inappropriate settings.  It will be
useful in very few real situations. Not all combinations of index choices
will work.  Only the standard layout is supported; alternative schemes are
for experimentation only.

### Block Size

The block size can not be changed once a database has been created.

While the code attempts to detect block size mismatches, in order to retain
compatibility with existing database, the testing can not be perfect.  If
undetected, any update will permanently and irrecoverably damage the
database.

## Store Parameters File Format

JSON is used for the on-disk record of store parameters, see the example
below.  Unspecified options defaults to the for the running setup.

These are default settings for a 64 bit Java:

<pre>
{ 
  "tdb.file_mode" :               "mapped" ,
  "tdb.block_size" :              8192 ,
  "tdb.block_read_cache_size" :   10000 ,
  "tdb.block_write_cache_size" :  2000 ,
  "tdb.node2nodeid_cache_size" :  100000 ,
  "tdb.nodeid2node_cache_size" :  500000 ,
  "tdb.node_miss_cache_size" :    100 ,
  "tdb.index_node2id" :           "node2id" ,
  "tdb.index_id2node" :           "nodes" ,
  "tdb.triple_index_primary" :    "SPO" ,
  "tdb.triple_indexes" :          [ "SPO" , "POS" , "OSP" ] ,
  "tdb.quad_index_primary" :      "GSPO" ,
  "tdb.quad_indexes" :            [ "GSPO" , "GPOS" , "GOSP" , "POSG" , "OSPG" , "SPOG" ] ,
  "tdb.prefix_index_primary" :    "GPU" ,
  "tdb.prefix_indexes" :          [ "GPU" ] ,
  "tdb.file_prefix_index" :       "prefixIdx" ,
  "tdb.file_prefix_nodeid" :      "prefix2id" ,
  "tdb.file_prefix_id2node" :     "prefixes"
}
</pre>

## Choosing the store parameters

This is the policy applied when creating or reattaching to a database.

If the database location has a parameter file, `tdb.cfg` then use that.
This is modified by any dynamic options supplied by the application.  So to
create a specialized database, one way to do that is to create an empty
directory and put a `tdb.cfg` in place.

If there is no parameter file and this is a new database, use the
application provided store parameters, or if there are no application
provided parameters, use the system default parameters. If application
supplied parameters are used, write a `tdb.cfg` file.

Finally, if this is an existing database, with no `tdb.cfg`, use the system
default modified by any application parameters.

In other words, if there is no `tdb.cfg` assume the system defaults, except
when creating a database.

*Modification* involves taking one set of store parameters and applying any
dynamic parameters set in the second set.  Only explicitly set dynamic
parameters modify the original.
