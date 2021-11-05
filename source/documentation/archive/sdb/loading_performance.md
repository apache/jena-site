---
title: SDB Loading performance
---

-   [Introduction](#introduction)
-   [The Databases and Hardware](#the-databases-and-hardware)
    -   [Hardware](#hardware)
    -   [Windows setup](#windows-setup)
    -   [Linux setup](#linux-setup)
-   [The Dataset and Queries](#the-dataset-and-queries)
    -   [LUBM](#lubm)
    -   [dbpedia](#dbpedia)
-   [Loading](#loading)
-   [Results](#results)
-   [Uniprot 700m loading: Tuning Helps](#uniprot-700m-loading-tuning-helps)

## Introduction

Performance reporting is an area prone to misinterpretation, and
such reports should be liberally decorated with disclaimers. In our
case there are an alarming number of variables: the hardware, the
operating system, the database engine and its myriad parameters,
the data itself, the queries, and planetary alignment.

Given this here is some basic information. You may find it
sufficient:

-   Loading speed will be in the thousands of triples per second
    range. Expect to load around 5 million triples per hour.
-   Index layout is usually better than hash for loading speed.
    Hash loading is very bad on MySQL.
-   Hash layout is better for query speed.

We suggest that you don't choose your database based on these
figures. The performance is broadly similar, so if you already have
a relational database installed this is your best option.

## The Databases and Hardware

SDB supports a range of databases, but the figures here are limited
to SQLServer and Postgresql. The hardware used was identical,
although running linux (for Postgresql) and windows (for
SQLServer).

### Hardware

-   Dual AMD Opteron processors, 64 bit, 1.8 GHz.
-   8 GB memory.
-   80 GB disk for database.

### Windows setup

-   Windows server 2003
-   Java 6 64 bit
-   SQLServer 2005

### Linux setup

-   Redhat Enterprise Linux 4
-   Java 6 64 bit
-   Postgresql 8.2

## The Dataset and Queries

We use the Lehigh University Benchmark
[http://swat.cse.lehigh.edu/projects/lubm/](http://swat.cse.lehigh.edu/projects/lubm/ "http://swat.cse.lehigh.edu/projects/lubm/")
and dbpedia
[http://dbpedia.org/](http://dbpedia.org/ "http://dbpedia.org/"),
together with some example queries that each provides. You can find
the queries in SDB/PerfTests.

### LUBM

LUBM generates artificial datasets. To be useful one needs to apply
reasoning, and this was done in advance of loading. The queries are
quite stressful for SDB in that they are not very ground (in many
neither subjects nor objects are present), and many produce very
large result sets. Thus they are probably atypical of many SPARQL
queries.

-   Size: 19 million triples (including inferred triples).

### dbpedia

The dbpedia queries are, unlike LUBM, quite ground. dbpedia
contains many large literals, in contrast to LUBM.

-   Size: 25 million triples.

## Loading

All operations were performed using SDB's command line tools. The
data was loaded into a freshly formatted SDB store -- although
postgresql needs an ANALYSE to avoid silly planning -- then the
additional indexes were added.

## Results

Benchmark | Database loading Speed (tps) | Index time (s) | Size (MB)
--------- | ---------------------------- | -------------- | ---------
LUBM Postgres (Hash) | 4972 |199 | 5124
LUBM Postgres (Index) | 8658 | 176 | 3666
LUBM SQLServer (Hash) | 8762 | 121 | 3200
LUBM SQLServer (Index) | 7419 | 68 | 2029
DBpedia Postgres (Hash) | 3029 | 298 | 10193
DBpedia Postgres (Index) | 4293 | 227 | 6251
DBpedia SQLServer (Hash) | 5345 | 162 | 6349
DBpedia SQLServer (Index) | 4749 | 110 | 4930

## Uniprot 700m loading: Tuning Helps

To illustrate the variability in loading speed, and emphasise the
importance of tuning, consider the case of Uniprot
[http://dev.isb-sib.ch/projects/uniprot-rdf/](http://dev.isb-sib.ch/projects/uniprot-rdf/ "http://dev.isb-sib.ch/projects/uniprot-rdf/").
Uniprot contains (at the time of writing) around 700 million
triples. We loaded these on to the SQLServer setup given above, but
with the following changes:

-   The database was stored on a separate disk.
-   The database's transactional logs were stored on yet another
    disk.

So the rdf data, database data, and log data were all on distinct
disks.

Loading into an index-layout store proceeded at:

-   11079 triples per second



