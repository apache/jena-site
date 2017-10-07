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
