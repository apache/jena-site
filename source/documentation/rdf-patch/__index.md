---
title: RDF Patch
slug: index
aliases:
    - /documentation/rdfpatch/
    - /documentation/rdfpatch/index.html
---

This page describes RDF Patch. An RDF Patch is a set of changes to an
[RDF dataset](https://www.w3.org/TR/rdf11-concepts/#section-dataset).
The change are for triples, quads and prefixes.

Changes to triples involving blank nodes are handled by using their system
identifier which uniquely identifies a blank node. Unlike RDF syntaxes, blank
nodes are not generated afresh each time the document is parsed.

## Example

This example ensures certain prefixes are in the dataset and adds some
basic triples for a new subclass of `<http://example/SUPER_CLASS>`.

```
TX .
PA "rdf" "http://www.w3.org/1999/02/22-rdf-syntax-ns#" .
PA "owl" "http://www.w3.org/2002/07/owl#" .
PA "rdfs" "http://www.w3.org/2000/01/rdf-schema#" .
A <http://example/SubClass> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .
A <http://example/SubClass> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://example/SUPER_CLASS> .
A <http://example/SubClass> <http://www.w3.org/2000/01/rdf-schema#label> "SubClass" .
TC .
```

## Structure

The text format for an RDF Patch is N-Triples-like: it is a series of
rows, each row ends with a `.` (DOT).  The tokens on a row are keywords,
URIs, blank nodes, writen with their label (see below) or RDF Literals,
in N-triples syntax.  A keyword follows the same rules as
Turtle prefix declarations without a trailing `:`.

A line has an operation code, then some number of items depending on 
the operation.

| Operation |                   |
| --------- | ----------------- |
| `H`                  | Header |
| `TX`<br/>`TC`<br/>`TA`     | Change block: transactions    |
| `PA`<br/>`PD`<br/>         | Change: Prefix add and delete |
| `A`<br/>`D`                | Change: Add and delete triples and quads |

The general structure of an RDF patch is a header (possible empty), then a
number of change blocks.

Each change block is a transaction. Transactions can be explicit recorded ('TX'
start, `TC` commit) to include multiple transaction in one patch. They are not
required. If not present, the patch should be applied atomically to the data.

```
header
TX
Quad, triple or prefix changes
TC or TA
```

Multiple transaction blocks are allowed for multiple sets of changes in one
patch.

A binary version based on [RDF Thrift](../io/rdf-binary/) is provided.
Parsing binary compared to text for N-triples achieves a x3-x4 increase in
throughput.

### Header

The header provides for basic information about patch. It is a series of
(key, value) pairs.

It is better to put complex metadata in a separate file and link to it
from the header, but certain information is best kept with the patch. If
patches are given an identifier, and als refer to the exp[ected previous patch,
it create a log and patches can be applied in the right order.

A header section can be used to provide additional information. In this example
a patch has an identifier and refers to a previous patch. This might be used to
create a log of patches, a log being a sequnce of chnages to apply in-order.

```
H id <uuid:0686c69d-8f89-4496-acb5-744f0157a8db> .
H prev <uuid:3ee0eca0-6d5f-4b4d-85db-f69ab1167eb1> .
TX .
PA "rdf" "http://www.w3.org/1999/02/22-rdf-syntax-ns#" .
PA "owl" "http://www.w3.org/2002/07/owl#" .
PA "rdfs" "http://www.w3.org/2000/01/rdf-schema#" .
A <http://example/SubClass> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .
A <http://example/SubClass> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://example/SUPER_CLASS> .
A <http://example/SubClass> <http://www.w3.org/2000/01/rdf-schema#label> "SubClass" .
TC .
```

Header format:
```
H word RDFTerm .
```
where `word` is a string in quotes, or an unquoted string (no spaces, starts with a letter,
same as a prefix without the colon).

The header is ended by the first non `H` line or the end of the patch.

### Transactions

```
TX .
TC .
```

These delimit a block of quad, triple and prefix changes.

Abort, `TA` is provided so that changes can be streamed, not obliging the
application to buffer change and wait to confirm the action is
committed.

Transactions should be applied atomically when a patch is applied.

### Changes

A change is an add or delete of a quad or a prefix.

#### Prefixes

Prefixes do not apply to the data of the patch. They are
changes to the data the patch is applied to.

The prefix name is without the trailing colon. It can be given as a
quoted string or unquoted string (keyword) with the same limitations as
Turtle on the prefix name.

```
PA rdf <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
```

`PA` is adding a prefix, `PD` is deleting a prefix.

#### Quads and Triples

Triples and quads are written like N-Quads, 3 or 4 RDF terms, 
with the addition of an initial `A` or `D` for "add" or "delete". 
Triples are in the order S-P-O, quads are S-P-O-G.

Add a triple:
```
A  <http://example/SubClass> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .
```

## Blank nodes

In order to synchronize datasets, changes involving blank nodes may need
to refer to a blank node already in the data.  RDF Patch deals with this
by making blank node labels refer to the "system identifier" for the
blank node.

In this way, RDF Patch is not an "RDF Format".  In all syntaxes for RDF
(Turtle, TriG, RDF/XML etc), blank nodes are "document scoped" meaning
that the blank node is unique to that one time reading of the document.
A new blank node is generated every time the file is read into a graph
or dataset, and that blank node does not appear in the existing data.

In practice, most RDF triplestores have some kind of internal
identifier that identifies the blank node.  RDF Patch requires a "system
identifier" for blank nodes so that change can refer to an existing
blank node in the data.

These can be written as `_:label` or `<_:label>` (the latter provides a
wider set of permissible characters in the label). Note that `_` is
illegal as an IRI scheme to highlight the fact this is not, strictly, an
IRI.

RDF 1.1 describes
[_skolemization_](https://www.w3.org/TR/rdf11-concepts/#section-skolemization)
where blank nodes are replaced by a URI.  A system could use those for
RDF Patch if it also meets the additional requirements to be able to
receive and reverse the mapping back to the internal blank node object
and also that all system generating patches can safely generate new,
fresh skolem IRIs that will become new blank nodes in the RDF dataset
then a patch is applied to it.

## Preferred Style

The preferred style is to write patch rows on a single line, single
space between tokens on a row and a single space before the terminal
`.`.  No comments should be included (comments start `#` and run to end of
line).

Headers should be placed before the item they refer to; for information
used by an RDF Patch Log, the metadata is about the whole patch and
should be at the start of the file, before any `TX`.
