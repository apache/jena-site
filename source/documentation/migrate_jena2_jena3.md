---
title: Migrating from Jena2 to Jena3
---

Apache Jena3 is a major version release for Jena - it is not binary compatible with
Jena2. The migration consists of package renaming and database reloading.

## Key Changes

* [Package renaming](#packaging)
* [RDF 1.1 Semantics for plain literals](#rdf11-plain-literals)
* [Persistent data (TDB, SDB) should be reloaded.](#persistent-data)
* Java8 is required.
* [Security renamed to Permissions. Security Evaluator changes required](#permissions-changes)


## Package Name Changes {#packaging}

Packages with a base name of `com.hp.hpl.jena` become `org.apache.jena`.

Global replacement of `import com.hp.hpl.jena.` with `import
org.apache.jena.` will cover the majority of cases.

The Jena APIs remain unchanged expect for this renaming.

### Vocabularies unchanged

Only java package names are being changed.  Vocabularies are not affected.

### Assemblers

Migration support is provided by mapping `ja:loadClass` names beginning
`com.hp.hpl.jena` internally to `org.apache.jena`. A warning is logged.

### Logging

This will also affect logging: logger names reflect the java class naming
so loggers for `com.hp.hpl.jena` become `org.apache.jena`

## RDF 1.1

Many of the changes and refinements for RDF 1.1 are already in Jena2. The
parsers for Turtle-family languages already follow the RDF 1.1 grammars
and output is compatible with RDF 1.1 as well as earlier output details.

### RDF 1.1 changes for plain literals {#rdf11-plain-literals}

In RDF 1.1, all literals have a datatype.  The datatype of a plain
literal with no language tag (also called a "simple literal") has datatype
`xsd:string`.  A plain literal with a language tag has datatype
`rdf:langString`.

Consequences:

`"abc"` and `"abc"^^xsd:string` are the same RDF term in RDF 1.1.  Jena2
memory models have always treated these as the same value, but different
terms. Jena2 persistent models treated them as two separate term and two
separate values.

Data is not invalidated by this change.

* The parsers will give datatypes to all data read, there is no need to
change the data.  

* Output is in the datatype-less form (an abbreviated syntax) even in
N-triples.

* Applications which explicitly use `^^xsd:string` (or in RDF/XML,
`rdf:datatype="http://www.w3.org/2001/XMLSchema#string"`) will see a change
in appearance.

* Applications with a mix of plain literals and explicit `^^xsd:string` 
(the RDF 1.1 Work Group believed these to be uncommon) may see changes.

* Applications that do their own RDF output need to be careful to not assume
that having datatype excludes the possibility of also having a language tag.

## Persistent Data {#persistent-data}

For data stored in [TDB](tdb/) and [SDB](sdb/), it is advisable to reload data.

Data that does not use explicit `xsd:string` should be safe but it is still
recommended that data is reloaded at a convenient time.

Data that does use explicit `xsd:string` must be reloaded.

## Security package renamed to Permissions {#permissions-changes}

Jena Security has been renamed Jena Permissions and the Maven 
_artifact id_ has been changed to _jena-permissions_ to reflect this change.

Shim code that was introduced to map Jena classes to security classes
has been removed.  This change requires changes to `SecurityEvaluator`
implementations.  More details are available at the 
<a href="permissions/migration2To3.html">Permissions 
migration documentation</a>.

## Other 

* `GraphStore` interface has been removed
* `ModelFactory.createFileModelMaker` has been removed
* `LateBindingIterator` has been removed: use `LazyIterator` instead
* `EarlyBindingIterator` has been removed: no replacement
* `UniqueExtendedIterator` has been removed: use `ExtendedIterator` with unique filter
