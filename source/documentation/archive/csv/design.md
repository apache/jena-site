---
title: CSV PropertyTable - Design
---

## Architecture

The architecture of CSV PropertyTable mainly involves 2 components:

-    [PropertyTable](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/PropertyTable.java)
-    [GraphPropertyTable](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/GraphPropertyTable.java)

![Picture of architecture of jena-csv](jena-csv-architecture.png "Architecture of jena-csv")

## PropertyTable 

A `PropertyTable` is collection of data that is sufficiently regular in shape it can be treated as a table.
That means each subject has a value for each one of the set of properties.
Irregularity in terms of missing values needs to be handled but not multiple values for the same property.
With special storage, a PropertyTable

-    is more compact and more amenable to custom storage (e.g. a JSON document store)
-    can have custom indexes on specific columns
-    can guarantee access orders

More explicitly, `PropertyTable` is designed to be a table of RDF terms, or 
[Nodes](https://github.com/apache/jena/tree/main/jena-core/src/main/java/org/apache/jena/graph/Node.java) in Jena. 
Each [Column](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/Column.java) of the `PropertyTable` has an unique columnKey `Node` of the predicate (or p for short).
Each [Row](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/Row.java) of the `PropertyTable` has an unique rowKey `Node` of the subject (or s for short).
You can use `getColumn()` to get the `Column` by its columnKey `Node` of the predicate, while `getRow()` for `Row`.

A `PropertyTable` should be constructed in this workflow (in order):

1.    Create `Columns` using `PropertyTable.createColumn()` for each `Column` of the `PropertyTable`
2.    Create `Rows` using `PropertyTable.createRow()` for each `Row` of the `PropertyTable`
3.    For each `Row` created, set a value (`Node`) at the specified `Column`, by calling `Row.setValue()`

Once a `PropertyTable` is built, tabular data within can be accessed by the API of `PropertyTable.getMatchingRows()`, `PropertyTable.getColumnValues()`, etc.

## GraphPropertyTable

`GraphPropertyTable` implements the [Graph](https://github.com/apache/jena/tree/main/jena-core/src/main/java/org/apache/jena/graph/Graph.java) interface (read-only) over a `PropertyTable`. 
This is subclass from [GraphBase](https://github.com/apache/jena/tree/main/jena-core/src/main/java/org/apache/jena/graph/impl/GraphBase.java) and implements `find()`. 
The `graphBaseFind()`(for matching a `Triple`) and `propertyTableBaseFind()`(for matching a whole `Row`) methods can choose the access route based on the find arguments.
`GraphPropertyTable` holds/wraps a reference of the `PropertyTable` instance, so that such a `Graph` can be treated in a more table-like fashion.

**Note:** Both `PropertyTable` and `GraphPropertyTable` are *NOT* restricted to CSV data.
They are supposed to be compatible with any table-like data sources, such as relational databases, Microsoft Excel, etc.

## GraphCSV

[GraphCSV](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/GraphCSV.java) is a sub class of GraphPropertyTable aiming at CSV data.
Its constructor takes a CSV file path as the parameter, parse the file using a CSV Parser, and makes a `PropertyTable` through `PropertyTableBuilder`.

For CSV to RDF mapping, we establish some basic principles:

### Single-Value and Regular-Shaped CSV Only

In the [CSV-WG](https://www.w3.org/2013/csvw/wiki/Main_Page), it looks like duplicate column names are not going to be supported. Therefore, we just consider parsing single-valued CSV tables. 
There is the current editor working [draft](http://w3c.github.io/csvw/syntax/) from the CSV on the Web Working Group, which is defining a more regular data out of CSV.
This is the target for the CSV work of GraphCSV: tabular regular-shaped CSV; not arbitrary, irregularly shaped CSV.

### No Additional CSV Metadata

A CSV file with no additional metadata is directly mapped to RDF, which makes a simpler case compared to SQL-to-RDF work. 
It's not necessary to have a defined primary column, similar to the primary key of database. The subject of the triple can be generated through one of:

1.    The triples for each row have a blank node for the subject, e.g. something like the illustration
2.    The triples for row N have a subject URI which is `<FILE#_N>`.

### Data Type for Typed Literal

All the values in CSV are parsed as strings line by line. As a better option for the user to turn on, a dynamic choice which is a posh way of saying attempt to parse it as an integer (or decimal, double, date) and if it passes, it's an integer (or decimal, double, date).
Note that for the current release, all of the numbers are parsed as `double`, and `date` is not supported yet.

### File Path as Namespace

RDF requires that the subjects and the predicates are URIs. We need to pass in the namespaces (or just the default namespaces) to make URIs by combining the namespaces with the values in CSV.
We don’t have metadata of the namespaces for the columns, But subjects can be blank nodes which is useful because each row is then a new blank node. For predicates, suppose the URL of the CSV file is `file:///c:/town.csv`, then the columns can be `<file:///c:/town.csv#Town>` and `<file:///c:/town.csv#Population>`, as is showed in the illustration.

### First Line of Table Header Needed as Predicates

The first line of the CSV file must be the table header. The columns of the first line are parsed as the predicates of the RDF triples. The RDF triple data are parsed starting from the second line.

### UTF-8 Encoded Only

The CSV files must be UTF-8 encoded. If your CSV files are using Western European encodings, please change the encoding before using CSV PropertyTable.


