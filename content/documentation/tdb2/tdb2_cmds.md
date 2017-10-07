Title: Apache Jena TDB2 - Command line tools.

*TDB2 is not compatible with TDB1*

Do not run TDB1 tools on a TDB2 database, nor run TDB2 tools on a TDB1 database.

* `tdb2.tdbbackup`
* `tdb2.tdbdump`
* `tdb2.tdbcompact`
* `tdb2.tdbloader`
* `tdb2.tdbquery`
* `tdb2.tdbstats`
* `tdb2.tdbupdate`

Example usage:

```
java -cp JENA_HOME/lib/* tdb2.tdbloader --loc <DB location> file1 file2 ...
```
where "`JENA_HOME`" is the location of an unpacked Apache Jena binary
distribution.

