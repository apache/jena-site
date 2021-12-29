---
title: TDB Command-line Utilities
---

## Contents

-   [Installation](#installation)
-   [Scripts](#scripts)
    -   [Script set up - bash scripts](#script-set-up-bash-scripts)
    -   [Script set up - Windows batch files](#script-set-up-windows-batch-files)
-   [Command line script arguments](#command-line-script-arguments)
    -   [Setting options from the command line](#setting-options-from-the-command-line)
-   [TDB Commands](#tdb-commands)
    -   [Store description](#store-description)
    -   [tdbloader](#tdbloader)
    -   [TDB xloader](#tdb-xloader)
    -   [tdbquery](#tdbquery)
    -   [tdbdump](#tdbdump)
    -   [tdbstats](#tdbstats)


## Installation

From Apache Jena version `2.7.x` onwards, TDB is now installed as part of a single integrated Jena
package. There is no longer a need to install a separate TDB package to run the TDB command line
tools, or to use TDB in your Java programs. See the [downloads](/download/index.cgi) page
for details on getting the latest Jena release.

## Scripts

From the location The directory `bin/` contains shell scripts to run the commands
from the command line. The scripts are bash scripts which should work
on Linux systems, Windows systems using [Cygwin](http://www.cygwin.com/) and
Mac/OS systems. The directory `bat/` contains Windows batch files which
provide the same functionality for Windows systems that are not using
Cygwin.

### Script set up

The TDB tools are included in the jena toolset. See the 
[command line tools page](../tools/).

## Command line script arguments

Each command then has command-specific arguments described below.

All commands support `--help` to give details of named and
positional arguments.

There are two equivalent forms of named argument syntax:

    --arg=val

    --arg val

### Setting options from the command line

TDB has a number of
[configuration options](configuration.html)
which can be set from the command line using:

     --set tdb:symbol=value

Using tdb: is really a short hand for the URI prefix
http://jena.hpl.hp.com/TDB\# so the full URI form is

     --set http://jena.hpl.hp.com/TDB#symbol=value

## TDB Commands

### Store description

TDB commands use an assembler description for the persistent store

    --desc=assembler.ttl
    --tdb=assembler.ttl

or a direct reference to the directory with the index and node
files:

    --loc=DIRECTORY
    --location=DIRECTORY

The assembler description follow the form for a dataset given in
[TDB assembler description](assembler.html "TDB/Assembler") page.

If neither assembler file nor location is given, `--desc=tdb.ttl`
is assumed.

### `tdbloader`

    tdbloader --loc /path/for/database ...input files ...

Input files can be any RDF syntax; triple formats (e.g. N-Triples, Turtle)
are loaded into the default graph, quad formats (e.g. N-Quads, TriG)
are loaded into the dataset according to the name or the default graph.

Bulk loader and index builder. Performs bulk load operations more
efficiently than simply reading RDF into a TDB-back model.

### tdb.xloader {#tdb-xloader}

`tdb1.xloader` and `tdb2.xloader` are bulk loaders for very large data for TDB1
and TDB2.

See [TDB xloader](./tdb-xloader.html) for more information. These loaders only
work on Linux since it relies on some Unix system utilities.

### `tdbquery`

Invoke a SPARQL query on a store. Use `--time` for timing
information. The store is attached on each run of this command so
timing includes some overhead not present in a running system.

Details about query execution can be obtained -- see notes on the
[TDB Optimizer](optimizer.html#investigating-what-is-going-on).

### `tdbdump`

Dump the store in
[N-Quads](http://www.w3.org/TR/n-quads/)
format.

### `tdbstats`

Produce a statistics for the dataset. See the
[TDB Optimizer description.](optimizer.html#statistics-rule-file).

### `tdbloader2`

*This has been replace by  [TDB xloader](./tdb-xloader.html).*

This bulk loader can only be used to create a database. It may
overwrite existing data. It requires accepts the `--loc` argument and a
list of files to load e.g.

    tdbloader2 --loc /path/for/database input1.ttl input2.ttl ...

#### Advanced `tdbloader2` Usage

There are various other advanced options available to customise the
behaviour of the bulk loader.  Run with `--help` to see the full usage 
summary.

It is possible to do builds in phases by using the `tdbloader2data` and
`tdbloader2index` scripts separately though this should only be used
by advanced users.  You can also do this by passing the `--phase`
argument to the `tdbloader2` script and specifying `data` or `index` as
desired.

The indexing phase of the build uses the `sort` utility to prepare the raw
data for indexing, this can potentially require large amounts of disk space
and the scripts will automatically check and warn/abort if the disk space
looks to be/is insufficient.

If you are building a large dataset (i.e. gigabytes of input data) you may 
wish to have the [PipeViewer](http://www.ivarch.com/programs/pv.shtml)
tool installed on your system as this will provide extra progress information 
during the indexing phase of the build.
