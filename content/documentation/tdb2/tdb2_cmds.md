Title: TDB2 - Command Line Tools

*TDB2 is not compatible with TDB1*

Do not run TDB1 tools on a TDB2 database, nor run TDB2 tools on a TDB1 database.

These scripts are available jena binary distribution.

* `tdb2.tdbbackup`
* `tdb2.tdbdump`
* `tdb2.tdbcompact`
* `tdb2.tdbloader`
* `tdb2.tdbquery`
* `tdb2.tdbupdate`

On MS Windows, these commands are called `tdb2_tdbquery` etc.

Example usage:

```
tdb2.tdbloader --loc <DB location> file1 file2 ...
```

Note:

`tdbloader2` is a TDB1 command tool.

## `tdb2.tdbloader`

Basic usage: load files into a database at location "DB":

    tdb2.tdbloader --loc DB file1 file2 ....

All TDB2 loaders can update datasets and do not have to work on an empty
dataset.  However, only the basic and sequential loader are fully
transactional in the presense of crashes. The other loadrs, while
faster, work by manipulting the low-level datastructures, and are tuned
for large changes of data. They do not provide perfect transaction
isolation in case a load goes wrong for some reason. The multiphase
loading operations use partial transactions which can leave the database
in a strange state.

When working with large data to load, it is advisable to check it
completely first with `riot --validate`. Parse errors during loading can
lead to inconsistent indexing. Fixing bad data, even if legal RDF, such
as bad lexicial forms of literals or bad URIs, is much easier before the
data is in the database.

Because loading in hardware dependent, the right choice for any
situation can only be found by trying each loader to see what works best
and the notes below are only initial guidance. The default choice is
a reasonable starting point. Closing all applications to release their
memory and not use CPU improves the loading process performance.

### Loader options

The choice of loader is given by the optional `--loader` argument.

`--loader=basic`

The basic loader loads data as a single transaction into the dataset on
a single thread. It is suitable for small data and also for
incrementally adding to a dataset safely, A machine crash while running
this loader will not invaldiate the database; the load simply will not happen.

`--loader=sequential`

The sequential loader is a single threaded loader that loads the primary
index then each of the other indexes. It is suitable only for low resource
hardware, especiallyin a low I/O bandwidth siuation.

`--loader=phased` (default)

The phased loader, the default if no `--loader` argument is provided,
is balance between performance and hardware demands.

It used multiple threads for both the initial loading (3 worker threads)
and then 2 threads in parallel for building the other indexes.

`--loader=parallel`

The parallel loader runs all operations at once. It can deliver the best
performance providing enough RAM is available and the persistent storage
is SSD. It can consume all hardware resources, greatly impacting
any other applications running.
