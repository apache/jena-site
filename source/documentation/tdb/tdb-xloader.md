---
title: TDB xloader
---

TDB xloader ("x" for external) is a bulkloader for very large datasets. The goal
is stability and reliability for long running loading, running on modest
hardware and can be use to load a database on rotating disk or SSD.

`xloader` is not a replacement for regular TDB1 and TDB2 loaders. It is for very
large datasets.

There are two scripts to load data using the xloader subsystem.

"tdb1.xloader", which was called "tdbloader2", has some improvements.

It is not as fast as other TDB loaders on datasets where the general loaders work
without encountering progressive slowdown.

The xloaders for TDB1 and TDB2 are not identical. The TDB2 xloader is more
capable; it is based on the same design approach with further refinements to
building the node table and to reduce the total amount of temporary file space
used.

The xloader does not run on MS Windows. It uses an external sort program from
unix - `sort(1)`.

The xloader only builds a fresh database from empty.
It can not be used to load an existing database.

### Running xloader

`tdb2.xloader --loc DIRECTORY` FILE...

or

`tdb1.xloader --loc DIRECTORY` FILE...

Additionally, there is an argument `--tmpdir` to use a different directory for
temporary files.

`FILE` is any RDF syntax supported by Jena. Syntax is determined by the file
extension and can include an addtional ".gz" or ".bz2" for compressed files.

`tdb2.xloader` also supports argument `--threads` to set the number of threads
to use with `sort(1)`. The default is 2. The recommendation for an initial
setting is to set it to the number of cores (not hardware threads) minus 1. This
is sensitive to the hardware environment. Experimentation may show a different,
better setting.

### Advice

To avoid a load failing due to a syntax or other data error, it is advisable to
run `riot --check` on the data first. Parsing is faster than loading.

The TDB databases will take up a lot of disk space and in addition during
loading `xloader` uses a significant amount of temporary disk space.

If desired, the data can be converted to [RDF Thrift](../io/rdf-binary.html) at
this stage by adding `--stream rdf-thrift` to the riot checking run.  Parsing
RDF Thrift is faster than parsing N-Triples although the bulk of the loading
process is not limited by parser speed.

Do not capture the bulk loader output in a file on the same disk as the database
or temporary directory; it slows loading down.
