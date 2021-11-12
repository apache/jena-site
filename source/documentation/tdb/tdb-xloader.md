---
title: TDB xloader
---

TDB xloader ("x" for external) is a bulkloader for very large datasets. The goal
is stability and reliability for long running loading, running on modest and

xloader is not a replacement for regular TDB1 and TDB2 loaders.

"tdb1.xloader" was called "tdbloader2" and has some improvements.

It is not as fast as other TDB loaders on dataset where the general loaders work
on without encountering progressive slowdown.

The xloaders for TDB1 and TDB2 are not identical. The TDB2 is more capable; it
is based on the same design approach with further refinements to building the
node table and to reduce the total amount of temporary file space used.

The xloader does not run on MS Windows. It uses and external sort program from
unix - `sort(1)`.

The xloader only builds a fresh database from empty.
It can not be used to load an existing database.

### Running xloader

`tdb2.xloader --loc DIRECTORY` FILE...

or

`tdb1.xloader --loc DIRECTORY` FILE...

Additioally, there is an argument `--tmpdir` to use a different directory for
temporary files.

`FILE` is any RDF syntax supported by Jena.

### Advice

`xloader` uses a lot of temporary disk space. 

To avoid a load failing due to a syntax or other data error, it is advisable to
run `riot --check` on the data first. Parsing is faster than loading.

If desired, the data can be converted to [RDF Thrift](../io/rdf-binary.html) at
this stage by adding `--stream rdf-thrift` to the riot checking run.
Parsing RDF Thrift is faster than parsing N-Triples although the bulk of the loading process is not limited by parser speed.


Do not capture the bulk loader output in a file on the same disk as the database
or temporary directory; it slows loading down.
