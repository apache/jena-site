---
title: SDB/Commands
---

This page describes the command line programs that can be used to
create an SDB store, load data into it and to issue queries.

## Contents

-   [Scripts](#scripts)
    -   [Script set up](#script-set-up)
    -   [Argument Structure](#argument-structure)

-   [Store Description](#store-description)
    -   [Modifying the Store Description](#modifying-the-store-description)
    -   [Logging and Monitoring](#logging-and-monitoring)

-   [SDB Commands](#sdb-commands)
    -   [Database creation](#database-creation)
    -   [Loading data](#loading-data)
    -   [Query](#query)
    -   [Testing](#testing)
    -   [Other](#other)


## Scripts

The directory `bin/` contains shell scripts to run the commands
from the command line. The scripts are bash scripts which also run
over [Cygwin](http://www.cygwin.com/ "http://www.cygwin.com/").

### Script set up

Set the environment variable `SDBROOT` to the root of the SDB
installation.

A store description can include naming the class for the JDBC
driver. Getting a `Store` object from a store description will
automatically load the JDBC driver from the classpath.

When running scripts, set the environment variable `SDB_JDBC` to
one or more jar files for JDBC drivers. If it is more than one jar
file, use the classpath syntax for your system. You can also use
the system property `jdbc.drivers`.

Set the environment variables `SDB_USER` and `SDB_PASSWORD` to the
database user name and password for JDBC.

     $ export SDBROOT="/path/to/sdb
     $ export SDB_USER="YourDbUserName"
     $ export SDB_PASSWORD="YourDbPassword"
     $ export SDB_JDBC="/path/to/driver.jar"

They are bash scripts, and work on Linux and Cygwin for MS
Windows.

     $ export PATH=$SDBROOT/bin:$PATH

Alternatively, there are wrapper scripts in `$SDBROOT/bin2` which
can be placed in a convenient directory that is already on the
shell command path.

### Argument Structure

All commands take a SDB store description to extract the connection
and configuration information they need. This is written
*`SPEC`* in the command descriptions below but it can be
composed of several arguments as described here.

Each command then has command-specific arguments described below.

All commands support `--help` to give details of named and
positional arguments.

There are two equivalent forms of named argument syntax:

    --arg=val

    --arg val

## Store Description

If this is not specified, commands load the description file
sdb.ttl from the current directory.

     --sdb=<sdb.ttl>

This store description is a
[Jena assembler](/documentation/assembler/)
file. The description consists of two parts; a store description
and a connection description.

Often, this is all that is needed to describe which store to use.
The individual components of a connection or configuration can be
overridden after the description have been read, before it is
processed.

The directory `Store/` has example assembler files.

The full details of the assembler file is given in
'[SDB/Store Description](store_description.html "SDB/Store Description")'

### Modifying the Store Description

The individual items of a store description can be overridden by
various command arguments. The description in the assembler file is
read, then any command line arguments used to modify the
description, then the appropriate object is created from the
modified description.

Set the layout type:

     --layout : layout name

Currently, one of `layout1`, `layout2`, `layout2/index`,
`layout2/hash`.

Set JDBC details:

     --dbName : Database Name
     --dbHost : Host machine name
     --dbType : Database type.
     --dbUser : Database use
     --dbPassword : Database password.

The host name can `host` or `host:port`.

The better way to handle passwords is to use environment variables
SDB\_USER and SDB\_PASSWORD because then the user/password is not
stored in a visible way.

### Logging and Monitoring

All commands take the following arguments (although they may do
nothing if they make no sense to the command).

     -v

Be verbose.

     --time

Print timing information. Treat with care - while the timer avoids
recording JVM and some class loading time, it can't avoid all class
loading. Hence, the values of timing are more meaningful on longer
operations. JDBC operation times to a remote server can also be a
significant proportion in short operations.

     --log=[all|none|queries|statements|exceptions]

to log SQL actions on the database connection (but not the prepared
statements used by the loader). Can be repeated on the command
line.

## SDB Commands

### Database creation

     sdbconfig SPEC [--create|--format|--indexes|--dropIndexes]

Setup a database.

Option | Description
------ | -----------
`--create` | formats the store and sets up indexes
`--format` | just formats the store and creates indexes for loading, not querying.
`--indexes` | Create indexes for querying
`--dropIndexes` | Drop indexes for querying.

Loading large graphs can be faster by formatting, loading the data,
then building the query indexes with this command.

     sdbtruncate SPEC

Truncate the store. Non-transactional. Destroys data.

### Loading data

     sdbload SPEC FILE [FILE ...]

Load RDF data into a store using the SDB bulk loader. Data is
streamed into the database and is not loaded as a single
transaction.

The file's extension is used to determine the data syntax.

To load into a named graph:

     sdbload SPEC --graph=URI FILE [FILE ...]

### Query

     sdbquery SPEC --query=FILE

Execute a query.

     sdbprint SPEC --print=X [--sql] --query=FILE

Print details of a query. `X` is any of `query`, `op`, `sqlNode`,
`sql` or `plan`. `--print=X` can be repeated. --sql is short for
--print=sql. The default is `--print=sql`.

### Testing

     sdbtest SPEC MANIFEST

Execute a test manifest file. The manifest of all query tests,
which will test connection and loading of data, is in
`<em>SDBROOT</em>/testing/manifest-sdb.ttl`.

### Other

     sdbdump SPEC --out=SYNTAX

Dump the contents of a store N-TRIPLES or a given serialization
format (usual Jena syntax names, e.g. `Turtle` or `TTL`).

Only suitable for data sizes that fit in memory. All output
syntaxes that do some form of pretty printing will need additional
space for their internal datastructures.

     sdbsql SPEC [ --file=FILE | SQL string ]

Execute a SQL command on the store, using the connection details
from the store specification. The SQL command either comes from
file `FILE` or the command line as a string.

     sdbinfo SPEC

Details of a store.

     sdbmeta SPEC --out=SYNTAX

Do things with the meta graphs of a store.

     sdbscript SPEC FILE

Execute a script. Currently only JRuby is supported.

     sdbtuple SPEC [--create|--print|--drop|--truncate]  tableName

Many of the tables used within SDB are tuples of RDF nodes. This
command allows low-level access to these tuple tables. Misuse of
this command can corrupt the store.



