---
title: Jena Full Text Search
---

This extension to ARQ combines SPARQL and full text search via
[Lucene](https://lucene.apache.org).
It gives applications the ability to perform indexed full text
searches within SPARQL queries. Here is a version compatibility table:

| &nbsp;Jena&nbsp; | &nbsp;Lucene&nbsp; |  &nbsp;Solr&nbsp; | &nbsp;ElasticSearch&nbsp; |
|------------------|--------------------|-------------------|----------------|
| upto 3.2.0       | 5.x or 6.x         | 5.x or 6.x        | not supported  |
| 3.3.0 - 3.9.0    | 6.4.x              | not supported     | 5.2.2 - 5.2.13 |
| 3.10.0           | 7.4.0              | not supported     | 6.4.2          |
| 3.15.0 - 3.17.0  | 7.7.x              | not supported     | 6.8.6          |
| 4.0.0 - current  | 8.8.x              | not supported     | not supported  |

SPARQL allows the use of 
[regex](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#func-regex) 
in `FILTER`s which is a test on a value retrieved earlier in the query
so its use _is not indexed_. For example, if you're
searching for occurrences of `"printer"` in the `rdfs:label` of a bunch
of products:

    PREFIX   ex: <http://www.example.org/resources#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?s ?lbl
    WHERE { 
    	?s a ex:Product ;
    	   rdfs:label ?lbl
    	FILTER regex(?lbl, "printer", "i")
    }

then the search will need to examine _all_ selected `rdfs:label`
statements and apply the regular expression to each label in turn. If
there are many such statements and many such uses of `regex`, then it
may be appropriate to consider using this extension to take advantage of
the performance potential of full text indexing.

Text indexes provide additional information for accessing the RDF graph
by allowing the application to have _indexed access_ to the internal
structure of string literals rather than treating such literals as
opaque items.  Unlike `FILTER`, an index can set the values of variables.
Assuming appropriate [configuration](#configuration), the
above query can use full text search via the
[ARQ property function extension](/documentation/query/extension.html#property-functions), `text:query`:

    PREFIX   ex: <http://www.example.org/resources#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX text: <http://jena.apache.org/text#>
    
    SELECT ?s ?lbl
    WHERE { 
    	?s a ex:Product ;
    	   text:query (rdfs:label 'printer') ;
    	   rdfs:label ?lbl
    }

This query makes a text query for `'printer'` on the `rdfs:label`
property; and then looks in the RDF data and retrieves the complete
label for each match.

The full text engine can be either [Apache
Lucene](http://lucene.apache.org/core) hosted with Jena on a single
machine, or [Elasticsearch](https://www.elastic.co/) for a large scale
enterprise search application where the full text engine is potentially
distributed across separate machines.

This [example code](https://github.com/apache/jena/tree/main/jena-text/src/main/java/examples/)
illustrates creating an in-memory dataset with a Lucene index.

## Table of Contents

-   [Architecture](#architecture)
    -   [One triple equals one document](#one-triple-equals-one-document)
    -   [One document equals one entity](#one-document-equals-one-entity)
        -   [External Content](#external-content)
    -   [External applications](#external-applications)
    -   [Document structure](#document-structure)
-   [Query with SPARQL](#query-with-sparql)
    -   [Syntax](#syntax)
        -   [Input arguments](#input-arguments)
        -   [Output arguments](#output-arguments)
    -   [Query strings](#query-strings)
        -   [Simple queries](#simple-queries)
        -   [Queries with language tags](#queries-with-language-tags)
        -   [Queries that retrieve literals](#queries-that-retrieve-literals)
        -   [Queries with graphs](#queries-with-graphs)
        -   [Queries across multiple `Fields`](#queries-across-multiple-fields)
            -   [Multiple fields in the default integration model](#multiple-fields-in-the-default-integration-model)
            -   [Multiple fields in the one document equals one entity model](#multiple-fields-in-the-one-document-equals-one-entity-model)
        -   [Queries with _Boolean Operators_ and _Term Modifiers_](#queries-with-boolean-operators-and-term-modifiers)
        -   [Highlighting](#highlighting)
    -   [Good practice](#good-practice)
-   [Configuration](#configuration)
    -   [Text Dataset Assembler](#text-dataset-assembler)
        -   [Lists of Indexed Properties](#lists-of-indexed-properties)
    -   [Configuring an analyzer](#configuring-an-analyzer)
    -   [Configuration by Code](#configuration-by-code)
    -   [Graph-specific Indexing](#graph-specific-indexing)
    -   [Linguistic Support with Lucene Index](#linguistic-support-with-lucene-index)
        - [Explicit Language Field in the Index](#explicit-language-field-in-the-index)
    	- [SPARQL Linguistic Clause Forms](#sparql-linguistic-clause-forms)
    	- [LocalizedAnalyzer](#localizedanalyzer)
    	- [Multilingual Support](#multilingual-support)
    -   [Generic and Defined Analyzer Support](#generic-and-defined-analyzer-support)
        - [Generic Analyzers, Tokenizers and Filters](#generic-analyzers-tokenizers-and-filters)
        - [Defined Analyzers](#defined-analyzers)
        - [Extending multilingual support](#extending0-multilingual-support)
        - [Multilingual enhancements for multi-encoding searches](#multilingual-enhancements-for-multi-encoding-searches)
        - [Naming analyzers for later use](#naming-analyzers-for-later-use)
    -   [Storing Literal Values](#storing-literal-values)
- [Working with Fuseki](#working-with-fuseki)
- [Building a Text Index](#building-a-text-index)
- [Configuring Alternative TextDocProducers](#configuring-alternative-textdocproducers)
  - [Default behavior](#default-behavior)
    - [Example](#example)
  - [Multiple fields per document](#multiple-fields-per-document)
- [Maven Dependency](#maven-dependency)

## Architecture

In general, a text index engine (Lucene or Elasticsearch) indexes
_documents_ where each document is a collection of _fields_, the values
of which are indexed so that searches matching contents of specified
fields can return a reference to the document containing the fields with
matching values.

There are two models for extending Jena with text indexing and search:

- One Jena _triple_ equals one Lucene _document_
- One Lucene _document_ equals one Jena _entity_

### One triple equals one document

The basic Jena text extension associates a triple with
a document and the _property_ of the triple with a _field_ of a document
and the _object_ of the triple (which must be a literal) with the value
of the field in the document. The _subject_ of the triple then becomes
another field of the document that is returned as the result of a search
match to identify what was matched. (NB, the particular triple that
matched is not identified. Only, its subject and _optionally_ the matching 
literal and match score.)

In this manner, the text index provides an inverted index that maps
query string matches to subject URIs.

A text-indexed dataset is configured with a description of which
properties are to be indexed. When triples are added, any properties
matching the description cause a document to be added to the index by
analyzing the literal value of the triple object and mapping to the
subject URI. On the other hand, it is necessary to specifically
configure the text-indexed dataset to [delete index
entries](#entity-map-definition) when the corresponding triples are
dropped from the RDF store.

The text index uses the native query language of the index:
[Lucene query language](http://lucene.apache.org/core/6_4_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description)
(with [restrictions](#input-arguments))
or
[Elasticsearch query language](https://www.elastic.co/guide/en/elasticsearch/reference/5.2/query-dsl.html).

### One document equals one entity

There are two approaches to creating indexed documents that contain more
than one indexed field:
- Using an externally maintained Lucene index
- [Multiple fields per document](#multiple-fields-per-document)

When using this integration model, `text:query` returns the _subject_ URI
for the document on which additional triples of metadata may be associated, 
and optionally the Lucene score for the match.

#### External content

When document content is externally indexed via Lucene and accessed in Jena 
via a `text:TextDataset` then the subject URI returned for a search result 
is considered to refer to the external content, and metadata about the 
document is represented as triples in Jena with the subject URI.

There is no requirement that the indexed document content be present 
in the RDF data.  As long as the index contains the index text documents to 
match the index description, then text search can be performed with queries that explicitly mention indexed fields in the document.

That is, if the content of a collection of documents is externally indexed 
and the URI naming the document is the result of the text search, then an RDF
dataset with the document metadata can be combined with accessing the
content by URI.

The maintenance of the index is external to the RDF data store.

### External applications

By using Elasticsearch, other applications can share the text index with
SPARQL search.

### Document structure

As mentioned above, when using the (_default_) one-triple equals one-document model,
text indexing of a triple involves associating a Lucene document with the triple. 
How is this done?

Lucene documents are composed of `Field`s. Indexing and searching are performed 
over the contents of these `Field`s. For an RDF triple to be indexed in Lucene the 
_property_ of the triple must be 
[configured in the entity map of a TextIndex](#entity-map-definition).
This associates a Lucene analyzer with the _`property`_ which will be used
for indexing and search. The _`property`_ becomes the _searchable_ Lucene 
`Field` in the resulting document.

A Lucene index includes a _default_ `Field`, which is specified in the configuration, 
that is the field to search if not otherwise named in the query. In jena-text 
this field is configured via the `text:defaultField` property which is then mapped 
to a specific RDF property via `text:predicate` (see [entity map](#entity-map-definition) 
below).

There are several additional `Field`s that will be included in the
document that is passed to the Lucene `IndexWriter` depending on the
configuration options that are used. These additional fields are used to
manage the interface between Jena and Lucene and are not generally 
searchable per se.

The most important of these additional `Field`s is the `text:entityField`.
This configuration property defines the name of the `Field` that will contain
the _URI_ or _blank node id_ of the _subject_ of the triple being indexed. This property does
not have a default and must be specified for most uses of `jena-text`. This
`Field` is often given the name, `uri`, in examples. It is via this `Field`
that `?s` is bound in a typical use such as:

    select ?s
    where {
        ?s text:query "some text"
    }

Other `Field`s that may be configured: `text:uidField`, `text:graphField`,
and so on are discussed below.

Given the triple:

    ex:SomeOne skos:prefLabel "zorn protégé a prés"@fr ;

The following is an abbreviated illustration a Lucene document that Jena will create and
request Lucene to index:

    Document<
        <uri:http://example.org/SomeOne> 
        <graph:urn:x-arq:DefaultGraphNode> 
        <label:zorn protégé a prés> 
        <lang:fr> 
        <uid:28959d0130121b51e1459a95bdac2e04f96efa2e6518ff3c090dfa7a1e6dcf00> 
        >

It may be instructive to refer back to this example when considering the various
points below.

## Query with SPARQL

The URI of the text extension property function is
`http://jena.apache.org/text#query` more conveniently written:

    PREFIX text: <http://jena.apache.org/text#>

    ...   text:query ...

### Syntax

The following forms are all legal:

    ?s text:query 'word'                              # query
    ?s text:query ('word' 10)                         # with limit on results
    ?s text:query (rdfs:label 'word')                 # query specific property if multiple
    ?s text:query (rdfs:label 'protégé' 'lang:fr')    # restrict search to French
    (?s ?score) text:query 'word'                     # query capturing also the score
    (?s ?score ?literal) text:query 'word'            # ... and original literal value
    (?s ?score ?literal ?g) text:query 'word'         # ... and the graph
    
The most general form when using the _default_ [one-triple equals one-document](#one-triple-equals-one-document)
integration model is:
   
     ( ?s ?score ?literal ?g ) text:query ( property* 'query string' limit 'lang:xx' 'highlight:yy' )

while for the [one-document equals one-entity model](#one-document-equals-one-entity), the general form is:

     ( ?s ?score ) text:query ( 'query string' limit )

and if only the _subject_ URI is needed:

     ?s text:query ( 'query string' limit )

#### Input arguments:

| &nbsp;Argument&nbsp;  | &nbsp; Definition&nbsp;    |
|-------------------|--------------------------------|
| property          | (zero or more) property URIs (including prefix name form) |
| query string      | Lucene query string fragment       |
| limit             | (optional) `int` limit on the number of results       |
| lang:xx           | (optional) language tag spec       |
| highlight:yy      | (optional) highlighting options    |

The `property` URI is only necessary if multiple properties have been
indexed and the property being searched over is not the [default field
of the index](#entity-map-definition).

Since 3.13.0, `property` may be a list of zero or more (prior to 3.13.0 zero or one) Lucene indexed properties, or a defined 
[`text:propList` of indexed properties](#lists-of-indexed-properties). 
The meaning is an `OR` of searches on a variety of properties. This can be used in place of SPARQL level `UNION`s of 
individual `text:query`s. For example, instead of:

    select ?foo where {
      {
        (?s ?sc ?lit) text:query ( rdfs:label "some query" ).
      }
      union
      {
        (?s ?sc ?lit) text:query ( skos:altLabel "some query" ).
      }
      union
      { 
        (?s ?sc ?lit) text:query ( skos:prefLabel "some query" ).
      }
    }

it can be more performant to push the unions into the Lucene query by rewriting as:

    (?s ?sc ?lit) text:query ( rdfs:label skos:prefLabel skos:altLabel "some query" )

which creates a Lucene query:

    (altLabel:"some query" OR prefLabel:"some query" OR label:"some query")

The `query string` syntax conforms to the underlying 
[Lucene](http://lucene.apache.org/core/6_4_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description),
or when appropriate, 
[Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/5.2/query-dsl.html).

In the case of the _default_ [one-triple equals one-document](#one-triple-equals-one-document) model, the Lucene query syntax is restricted to `Terms`, `Term modifiers`,
`Boolean Operators` applied to `Terms`, and `Grouping` of terms. 

Additionally, the use of `Fields` within the `query string` is supported when using the [one-document equals one-entity](#one-document-equals-one-entity) text integration model.

When using the [default model](#one-triple-equals-one-document), 
use of `Fields` in the query string **will generally lead to unpredictable results.**

The optional `limit` indicates the maximum hits to be returned by Lucene.

The `lang:xx` specification is an optional string, where _xx_ is 
a BCP-47 language tag. This restricts searches to field values that were originally 
indexed with the tag _xx_. Searches may be restricted to field values with no 
language tag via `"lang:none"`. 

The `highlight:yy` specification is an optional string where _yy_ are options that control the highlighting of search 
result literals. See [below](#highlighting) for details.

If both `limit` and one or more of `lang:xx` or `highlight:yy` are present, then `limit` must precede these arguments.

If only the query string is required, the surrounding `( )` _may be_ omitted.

#### Output arguments:

| &nbsp;Argument&nbsp;  | &nbsp; Definition&nbsp;    |
|-------------------|--------------------------------|
| subject URI       | The subject of the indexed RDF triple.          |
| score             | (optional) The score for the match. |
| literal           | (optional) The matched object literal. |
| graph URI         | (optional) The graph URI of the triple. |
| property URI      | (optional) The property URI of the matched triple |

The results include the _subject URI_; the _score_ assigned by the
text search engine; and the entire matched _literal_ (if the index has
been [configured to store literal values](#text-dataset-assembler)).
The _subject URI_ may be a variable, e.g., `?s`, or a _URI_. In the
latter case the search is restricted to triples with the specified
subject. The _score_, _literal_, _graph URI_, and _property URI_ **must** be variables.
The _property URI_ is meaningful when two or more properties are used in the query.

### Query strings

There are several points that need to be considered when formulating
SPARQL queries using either of the Lucene integration models. 

As mentioned above, in the case of the [default model](#one-triple-equals-one-document) 
the `query string` syntax is restricted to `Terms`, `Term modifiers`, `Boolean Operators` 
applied to `Terms`, and `Grouping` of terms. 

Explicit use of `Fields` in the _query string_ is only useful with the
[one-document equals one-entity model](#one-document-equals-one-entity); 
and otherwise will generally produce unexpected results.
See [Queries across multiple `Fields`](#queries-across-multiple-fields).

#### Simple queries

The simplest use of the jena-text Lucene integration is like:

    ?s text:query "some phrase"

This will bind `?s` to each entity URI that is the subject of a triple
that has the default property and an object literal that matches
the argument string, e.g.:

    ex:AnEntity skos:prefLabel "this is some phrase to match"

This query form will indicate the _subjects_ that have literals that match
for the _default property_ which is determined via the configuration of
the `text:predicate` of the [`text:defaultField`](#default-text-field) 
(in the above this has been assumed to be `skos:prefLabel`.

For a _non-default property_ it is necessary to specify the property as
an input argument to the `text:query`:

    ?s text:query (rdfs:label "protégé")

(see [below](#entity-map-definition) for how RDF _property_ names 
are mapped to Lucene `Field` names).

If this use case is sufficient for your needs you can skip on to the 
[sections on configuration](#configuration).

**Please note** that the query:

    ?s text:query "some phrase"

when using the Lucene `StandardAnalyzer` or similar will treat the query string
as an `OR` of terms: `some` and `phrase`. If a phrase search is required then
it is necessary to surround the phrase by double quotes, `"`:

    ?s text:query "\"some phrase\""

This will only match strings that contain `"some phrase"`, while the former
query will match strings like: `"there is a phrase for some"` or
`"this is some of the various sorts of phrase that might be matched"`.

#### Queries with language tags

When working with `rdf:langString`s it is necessary that the
[`text:langField`](#language-field) has been configured. Then it is
as simple as writing queries such as:

    ?s text:query "protégé"@fr

to return results where the given term or phrase has been
indexed under French in the [`text:defaultField`](#default-text-field).

It is also possible to use the optional `lang:xx` argument, for example:

    ?s text:query ("protégé" 'lang:fr') .

In general, the presence of a language tag, `xx`, on the `query string` or
`lang:xx` in the `text:query` adds `AND lang:xx` to the query sent to Lucene, 
so the above example becomes the following Lucene query:

    "label:protégé AND lang:fr"

For _non-default properties_ the general form is used:

    ?s text:query (skos:altLabel "protégé" 'lang:fr')

Note that an explicit language tag on the `query string` takes precedence
over the `lang:xx`, so the following

    ?s text:query ("protégé"@fr 'lang:none')

will find French matches rather than matches indexed without a language tag.

#### Queries that retrieve literals

It is possible to retrieve the *literal*s that Lucene finds matches for
assuming that

    <#TextIndex#> text:storeValues true ;

has been specified in the `TextIndex` configuration. So

    (?s ?sc ?lit) text:query (rdfs:label "protégé")

will bind the matching literals to `?lit`, e.g.,

    "zorn protégé a prés"@fr
    
Note it is necessary to include a variable to capture the Lucene _score_
even if this value is not otherwise needed since the _literal_ variable
is determined by position.

#### Queries with graphs

Assuming that the [`text:graphField`](#graph-field) has been configured, 
then, when a triple is indexed, the graph that the triple resides in is 
included in the document and may be used to restrict searches or to retrieve the graph that a matching triple resides in.

For example:

    select ?s ?lit
    where {
      graph ex:G2 { (?s ?sc ?lit) text:query "zorn" } .
    }

will restrict searches to triples with the _default property_ that reside 
in graph, `ex:G2`.

On the other hand:

    select ?g ?s ?lit
    where {
      graph ?g { (?s ?sc ?lit) text:query "zorn" } .
    }

will iterate over the graphs in the dataset, searching each in turn for
matches.

If there is suitable structure to the graphs, e.g., a known `rdf:type` and
depending on the selectivity of the text query and number of graphs, 
it may be more performant to express the query as follows:

    select ?g ?s ?lit
    where {
      (?s ?sc ?lit) text:query "zorn" .
      graph ?g { ?s a ex:Item } .
    }

Further, if `tdb:unionDefaultGraph true` for a TDB dataset backing a Lucene index then it is possible to retrieve the graphs that contain triples resulting from a Lucene search via the fourth output argument to `text:query`:

    select ?g ?s ?lit
    where {
      (?s ?sc ?lit ?g) text:query "zorn" .
    }

This will generally perform much better than either of the previous approaches when there are
large numbers of graphs since the Lucene search will run once and the returned _documents_ carry
the containing graph URI for free as it were.

#### Queries across multiple `Field`s

As mentioned earlier, the Lucene text index uses the
[native Lucene query language](http://lucene.apache.org/core/6_4_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description).

##### Multiple fields in the default integration model

For the [default integration model](#one-triple-equals-one-document), since each document 
has only one field containing searchable text, searching for documents containing
multiple fields will generally not find any results.  

Note that the [default model](#one-triple-equals-one-document) provides three Lucene `Fields` 
in a document that are used during searching:

1. the field corresponding to the property of the indexed triple,
2. the field for the language of the literal (if configured), and 
3. the graph that the triple is in (if configured).

Given these, it should be clear from the above that the 
[default model](#one-triple-equals-one-document)
constructs a Lucene query from the _property_, _query string_, `lang:xx`, and 
SPARQL graph arguments.

For example, consider the following triples:

    ex:SomePrinter 
        rdfs:label     "laser printer" ;
        ex:description "includes a large capacity cartridge" .

 assuming an appropriate configuration, if we try to retrieve `ex:SomePrinter`
 with the following Lucene `query string`:

    ?s text:query "label:printer AND description:\"large capacity cartridge\""

then this query can not find the expected results since the `AND` is interpreted
by Lucene to indicate that all documents that contain a matching `label` field _and_
a matching `description` field are to be returned; yet, from the discussion above
regarding the [structure of Lucene documents in jena-text](#document-structure) it
is evident that there is not one but rather in fact two separate documents one with a 
`label` field and one with a `description` field so an effective SPARQL query is:

    ?s text:query (rdfs:label "printer") .
    ?s text:query (ex:description "large capacity cartridge") .

which leads to `?s` being bound to `ex:SomePrinter`.

In other words when a query is to involve two or more _properties_ of a given _entity_
then it is expressed at the SPARQL level, as it were, versus in Lucene's query language.

It is worth noting that the equivalent of a Lucene `OR` of `Fields` can be expressed
using SPARQL `union`, though since 3.13.0 this can be expressed in Jena text
using a property list - see [Input arguments](#input-arguments):

    { ?s text:query (rdfs:label "printer") . }
    union
    { ?s text:query (ex:description "large capacity cartridge") . }

Suppose the matching literals are required for the above then it should be clear
from the above that:

    (?s ?sc1 ?lit1) text:query (skos:prefLabel "printer") .
    (?s ?sc2 ?lit2) text:query (ex:description "large capacity cartridge") .

will be the appropriate form to retrieve the _subject_ and the associated literals, `?lit1` and `?lit2`. (Obviously, in general, the _score_ variables, `?sc1` and `?sc2`
must be distinct since it is very unlikely that the scores of the two Lucene queries
will ever match).

There is no loss of expressiveness of the Lucene query language versus the jena-text
integration of Lucene. Any cross-field `AND`s are replaced by concurrent SPARQL calls to
text:query as illustrated above and uses of Lucene `OR` can be converted to SPARQL 
`union`s. Uses of Lucene `NOT` are converted to appropriate SPARQL `filter`s.

##### Multiple fields in the one-document equals one-entity model

If Lucene documents have been indexed with [multiple searchable fields](#one-document-equals-one-entity) 
then compound queries expressed directly in the Lucene query language can significantly improve search
performance, in particular, where the individual components of the Lucene query generate
a lot of results which must be combined in SPARQL.

It is possible to have text queries that search multiple fields within a text query.
Doing this is more complex as it requires the use of either an externally managed 
text index or code must be provided to build the multi-field text documents to be indexed.
See [Multiple fields per document](#multiple-fields-per-document).

#### Queries with _Boolean Operators_ and _Term Modifiers_

On the other hand the various features of the [Lucene query language](http://lucene.apache.org/core/6_4_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description)
are all available to be used for searches within a `Field`. 
For example, _Boolean Operators_ on _Terms_:

    ?s text:query (ex:description "(large AND cartridge)")

and

    (?s ?sc ?lit) text:query (ex:description "(includes AND (large OR capacity))")
    
or _fuzzy_ searches:

    ?s text:query (ex:description "include~")

and so on will work as expected.

**Always surround the query string with `( )` if more than a single term or phrase
are involved.**

#### Highlighting

The highlighting option uses the Lucene `Highlighter` and `SimpleHTMLFormatter` to insert highlighting markup into the literals returned from search results (hence the text dataset must be configured to store the literals). The highlighted results are returned via the _literal_ output argument. This highlighting feature, introduced in version 3.7.0, does not require re-indexing by Lucene. 

The simplest way to request highlighting is via `'highlight:'`. This will apply all the defaults:

| &nbsp;Option&nbsp; | &nbsp;Key&nbsp; | &nbsp;Default&nbsp; |
|--------------------|-----------------|---------------------|
| maxFrags | m: | 3 |
| fragSize | z: |  128 |
| start | s: | RIGHT_ARROW |
| end | e: | LEFT_ARROW |
| fragSep | f: | DIVIDES |
| joinHi | jh: | true |
| joinFrags | jf: | true |

to the highlighting of the search results. For example if the query is:

    (?s ?sc ?lit) text:query ( "brown fox" "highlight:" ) 
    
then a resulting literal binding might be:

    "the quick ↦brown fox↤ jumped over the lazy baboon"

The `RIGHT_ARROW` is Unicode \u21a6 and the `LEFT_ARROW` is Unicode \u21a4. These are chosen to be single characters that in most situations will be very unlikely to occur in resulting literals. The `fragSize` of 128 is chosen to be large enough that in many situations the matches will result in single fragments. If the literal is larger than 128 characters and there are several matches in the literal then there may be additional fragments separated by the `DIVIDES`, Unicode \u2223.

Depending on the analyzer used and the tokenizer, the highlighting will result in marking each token rather than an entire phrase. The `joinHi` option is by default `true` so that entire phrases are highlighted together rather than as individual tokens as in:

    "the quick ↦brown↤ ↦fox↤ jumped over the lazy baboon"

which would result from:

    (?s ?sc ?lit) text:query ( "brown fox" "highlight:jh:n" )

The `jh` and `jf` boolean options are set `false` via `n`. Any other value is `true`. The defaults for these options have been selected to be reasonable for most applications.

The joining is performed post highlighting via Java `String replaceAll` rather than using the Lucene Unified Highlighter facility which requires that term vectors and positions be stored. The joining deletes _extra_ highlighting with only intervening Unicode separators, `\p{Z}`.

The more conventional output of the Lucene `SimpleHTMLFormatter` with html emphasis markup is achieved via, `"highlight:s:<em class='hiLite'> | e:</em>"` (highlight options are separated by a Unicode vertical line, \u007c. The spaces are not necessary). The result with the above example will be:

    "the quick <em class='hiLite'>brown fox</em> jumped over the lazy baboon"

which would result from the query:

    (?s ?sc ?lit) text:query ( "brown fox" "highlight:s:<em class='hiLite'> | e:</em>" )

### Good practice

From the above it should be clear that best practice, except in the simplest cases
is to use explicit `text:query` forms such as:

    (?s ?sc ?lit) text:query (ex:someProperty "a single Field query")

possibly with _limit_ and `lang:xx` arguments.

Further, the query engine does not have information about the selectivity of the
text index and so effective query plans cannot be determined
programmatically.  It is helpful to be aware of the following two
general query patterns.

#### Query pattern 1 &ndash; Find in the text index and refine results

Access to the text index is first in the query and used to find a number of
items of interest; further information is obtained about these items from
the RDF data.

    SELECT ?s
    { ?s text:query (rdfs:label 'word' 10) ; 
         rdfs:label ?label ;
         rdf:type   ?type 
    }

The `text:query` limit argument is useful when working with large indexes to limit results to the
higher scoring results &ndash; results are returned in the order of scoring by the text search engine.

#### Query pattern 2 &ndash; Filter results via the text index

By finding items of interest first in the RDF data, the text search can be
used to restrict the items found still further.

    SELECT ?s
    { ?s rdf:type     :book ;
         dc:creator  "John" .
      ?s text:query   (dc:title 'word') ; 
    }

## Configuration

The usual way to describe a text index is with a 
[Jena assembler description](../assembler/index.html).  Configurations can
also be built with code. The assembler describes a 'text
dataset' which has an underlying RDF dataset and a text index. The text
index describes the text index technology (Lucene or Elasticsearch) and the details
needed for each.

A text index has an "entity map" which defines the properties to
index, the name of the Lucene/Elasticsearch field and field used for storing the URI
itself.

For simple RDF use, there will be one field, mapping a property to a text
index field. More complex setups, with multiple properties per entity
(URI) are possible.

The assembler file can be either default configuration file (.../run/config.ttl)
or a custom file in ...run/configuration folder. Note that you can use several files
simultaneously.

You have to edit the file (see comments in the assembler code below):

1. provide values for paths and a fixed URI for tdb:DatasetTDB
2. modify the entity map : add the fields you want to index and desired options (filters, tokenizers...)

If your assembler file is run/config.ttl, you can index the dataset with this command :

    java -cp ./fuseki-server.jar jena.textindexer --desc=run/config.ttl

Once configured, any data added to the text dataset is automatically
indexed as well: [Building a Text Index](#building-a-text-index).

### Text Dataset Assembler

The following is an example of an assembler file defining a TDB dataset with a Lucene text index.

    ######## Example of a TDB dataset and text index#########################
    # The main doc sources are:
    #  - https://jena.apache.org/documentation/fuseki2/fuseki-configuration.html
    #  - https://jena.apache.org/documentation/assembler/assembler-howto.html
    #  - https://jena.apache.org/documentation/assembler/assembler.ttl
    # See https://jena.apache.org/documentation/fuseki2/fuseki-layout.html for the destination of this file.
    #########################################################################
    
    @prefix :        <http://localhost/jena_example/#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .
    @prefix text:    <http://jena.apache.org/text#> .
    @prefix skos:    <http://www.w3.org/2004/02/skos/core#>
    @prefix fuseki:  <http://jena.apache.org/fuseki#> .

    [] rdf:type fuseki:Server ;
       fuseki:services (
         :myservice
       ) .

    :myservice rdf:type fuseki:Service ;
        fuseki:name                       "myds" ;     # e.g : `s-query --service=http://localhost:3030/myds "select * ..."`
        fuseki:serviceQuery               "query" ;    # SPARQL query service
        fuseki:serviceUpdate              "update" ;   # SPARQL update service
        fuseki:serviceReadWriteGraphStore "data" ;     # SPARQL Graph store protocol (read and write)
        fuseki:dataset                    :text_dataset ;
        .

    ## ---------------------------------------------------------------
    
    # A TextDataset is a regular dataset with a text index.
    :text_dataset rdf:type     text:TextDataset ;
        text:dataset   :mydataset ; # <-- replace `:my_dataset` with the desired URI
        text:index     <#indexLucene> ;
    .

    # A TDB dataset used for RDF storage
    :mydataset rdf:type      tdb:DatasetTDB ; # <-- replace `:my_dataset` with the desired URI - as above
        tdb:location "DB" ;
        tdb:unionDefaultGraph true ; # Optional
    .
    
    # Text index description
    <#indexLucene> a text:TextIndexLucene ;
        text:directory <file:path> ;  # <-- replace `<file:path>` with your path (e.g., `<file:/.../fuseki/run/databases/MY_INDEX>`)
        text:entityMap <#entMap> ;
        text:storeValues true ; 
        text:analyzer [ a text:StandardAnalyzer ] ;
        text:queryAnalyzer [ a text:KeywordAnalyzer ] ;
        text:queryParser text:AnalyzingQueryParser ;
        text:propLists ( [ . . . ] . . . ) ;
        text:defineAnalyzers ( [ . . . ] . . . ) ;
        text:multilingualSupport true ; # optional
    .
    # Entity map (see documentation for other options)
    <#entMap> a text:EntityMap ;
        text:defaultField     "label" ;
        text:entityField      "uri" ;
        text:uidField         "uid" ;
        text:langField        "lang" ;
        text:graphField       "graph" ;
        text:map (
            [ text:field "label" ; 
              text:predicate skos:prefLabel ]
        ) .

See below for [more on defining an entity map](#entity-map-definition)

The `text:TextDataset` has two properties:

- a `text:dataset`, e.g., a `tdb:DatasetTDB`, to contain 
the RDF triples; and

- an index configured to use either `text:TextIndexLucene` or `text:TextIndexES`.

The `<#indexLucene>` instance of `text:TextIndexLucene`, above, has two required properties: 

- the `text:directory` 
file URI which specifies the directory that will contain the Lucene index files &ndash; if this has the 
value `"mem"` then the index resides in memory;

- the `text:entityMap`, `<#entMap>` that will define 
what properties are to be indexed and other features of the index; and

and several optional properties:

- `text:storeValues` controls the [storing of literal values](#storing-literal-values).
It indicates whether values are stored or not &ndash; values must be stored for the 
[`?literal` return value](#query-with-sparql) to be available in `text:query` in SPARQL.

- `text:analyzer` specifies the default [analyzer configuration](#configuring-an-analyzer) to used 
during indexing and querying. The default analyzer defaults to Lucene's `StandardAnalyzer`.

- `text:queryAnalyzer` specifies an optional [analyzer for query](#analyzer-for-query) that will be
used to analyze the query string. If not set the analyzer used to index a given field is used.

- `text:queryParser` is optional and specifies an [alternative query parser](#alternative-query-parsers)

- `text:propLists` is optional and allows to specify [lists of indexed properties](#lists-of-indexed-properties) for use in `text:query`

- `text:defineAnalyzers` is optional and allows specification of [additional analyzers, tokenizers and filters](#defined-analyzers)

- `text:multilingualSupport` enables [Multilingual Support](#multilingual-support)

If using Elasticsearch then an index would be configured as follows:

    <#indexES> a text:TextIndexES ;
          # A comma-separated list of Host:Port values of the ElasticSearch Cluster nodes.
        text:serverList "127.0.0.1:9300" ; 
          # Name of the ElasticSearch Cluster. If not specified defaults to 'elasticsearch'
        text:clusterName "elasticsearch" ; 
          # The number of shards for the index. Defaults to 1
        text:shards "1" ;
          # The number of replicas for the index. Defaults to 1
        text:replicas "1" ;         
          # Name of the Index. defaults to jena-text
        text:indexName "jena-text" ;
        text:entityMap <#entMap> ;
        .

and `text:index  <#indexES> ;` would be used in the configuration of `:text_dataset`.

To use a text index assembler configuration in Java code is it necessary
to identify the dataset URI to be assembled, such as in:

    Dataset ds = DatasetFactory.assemble(
        "text-config.ttl", 
        "http://localhost/jena_example/#text_dataset") ;

since the assembler contains two dataset definitions, one for the text
dataset, one for the base data.  Therefore, the application needs to
identify the text dataset by it's URI
`http://localhost/jena_example/#text_dataset`.

#### Lists of Indexed Properties

Since 3.13.0, an optional `text:TextIndexLucene` feature, `text:propLists` allows to define lists of Lucene indexed 
properties that may be used in `text:query`s. For example:

    text:propLists (
        [ text:propListProp ex:labels ;
          text:props ( skos:prefLabel 
                       skos:altLabel 
                       rdfs:label ) ;
        ]
        [ text:propListProp ex:workStmts ;
          text:props ( ex:workColophon 
                       ex:workAuthorshipStatement 
                       ex:workEditionStatement ) ;
        ]
    ) ;

The `text:propLists` is a list of _property list_ definitions. Each _property list_ defines a new property, 
`text:propListProp` that will be used to refer to the list in a `text:query`, for example, `ex:labels` and 
`ex:workStmts`, above. The `text:props` is a list of Lucene indexed properties that will be searched over when the 
_property list_ property is referred to in a `text:query`. For example:

    ?s text:query ( ex:labels "some text" ) .

will request Lucene to search for documents representing triples, ?s ?p ?o, where ?p is one of: `rdfs:label` OR 
`skos:prefLbael` OR `skos:altLabel`, matching the query string.

### Entity Map definition

A `text:EntityMap` has several properties that condition what is indexed, what information is stored, and 
what analyzers are used.

    <#entMap> a text:EntityMap ;
        text:defaultField     "label" ;
        text:entityField      "uri" ;
        text:uidField         "uid" ;
        text:langField        "lang" ;
        text:graphField       "graph" ;
        text:map (
             [ text:field "label" ; 
               text:predicate rdfs:label ]
             ) .

#### Default text field

The `text:defaultField` specifies the default field name that Lucene will use in a query that does
not otherwise specify a field. For example,

    ?s text:query "\"bread and butter\""

will perform a search in the `label` field for the phrase `"bread and butter"`

#### Entity field

The `text:entityField ` specifies the field name of the field that will contain the subject URI that
is returned on a match. The value of the property is arbitrary so long as it is unique among the
defined names.

#### UID Field and automatic document deletion

When the `text:uidField` is defined in the `EntityMap` then dropping a triple will result in the 
corresponding document, if any, being deleted from the text index. The value, `"uid"`, is arbitrary 
and defines the name of a stored field in Lucene that holds a unique ID that represents the triple.

If you configure the index via Java code, you need to set this parameter to the 
EntityDefinition instance, e.g.

    EntityDefinition docDef = new EntityDefinition(entityField, defaultField);
    docDef.setUidField("uid");

**Note**: If you migrate from an index without deletion support to an index with automatic deletion, 
you will need to rebuild the index to ensure that the uid information is stored.

#### Language Field

The `text:langField` is the name of the field that will store the language attribute of the literal
in the case of an `rdf:langString`. This Entity Map property is a key element of the 
[Linguistic support with Lucene index](#linguistic-support-with-lucene-index)

#### Graph Field

Setting the `text:graphField` allows [graph-specific indexing](#graph-specific-indexing) of the text 
index to limit searching to a specified graph when a SPARQL query targets a single named graph. The 
field value is arbitrary and serves to store the graph ID that a triple belongs to when the index is 
updated.

#### The Analyzer Map

The `text:map` is a list of [analyzer specifications](#configuring-an-analyzer) as described below.

### Configuring an Analyzer

Text to be indexed is passed through a text analyzer that divides it into tokens 
and may perform other transformations such as eliminating stop words. If a Lucene
or Elasticsearch text index is used, then by default the Lucene `StandardAnalyzer` is used.

In case of a `TextIndexLucene` the default analyzer can be replaced by another analyzer with 
the `text:analyzer` property on the `text:TextIndexLucene` resource in the 
[text dataset assembler](#text-dataset-assembler),  for example with a `SimpleAnalyzer`:   

    <#indexLucene> a text:TextIndexLucene ;
            text:directory <file:Lucene> ;
            text:analyzer [
                a text:SimpleAnalyzer
            ]
            . 

It is possible to configure an alternative analyzer for each field indexed in a
Lucene index.  For example:

    <#entMap> a text:EntityMap ;
        text:entityField      "uri" ;
        text:defaultField     "text" ;
        text:map (
             [ text:field "text" ; 
               text:predicate rdfs:label ;
               text:analyzer [
                   a text:StandardAnalyzer ;
                   text:stopWords ("a" "an" "and" "but")
               ]
             ]
             ) .
             
will configure the index to analyze values of the 'text' field
using a `StandardAnalyzer` with the given list of stop words.

Other analyzer types that may be specified are `SimpleAnalyzer` and
`KeywordAnalyzer`, neither of which has any configuration parameters. See
the Lucene documentation for details of what these analyzers do. Jena also
provides `LowerCaseKeywordAnalyzer`, which is a case-insensitive version of
`KeywordAnalyzer`, and [`ConfigurableAnalyzer`](#configurableanalyzer).

Support for the new `LocalizedAnalyzer` has been introduced in Jena 3.0.0 to
deal with Lucene language specific analyzers. See [Linguistic Support with
Lucene Index](#linguistic-support-with-lucene-index) for details.

Support for `GenericAnalyzer`s has been introduced in Jena 3.4.0 to allow
the use of Analyzers that do not have built-in support, e.g., `BrazilianAnalyzer`; 
require constructor parameters not otherwise supported, e.g., a stop words `FileReader` or
a `stemExclusionSet`; and finally use of Analyzers not included in the bundled
Lucene distribution, e.g., a `SanskritIASTAnalyzer`. See [Generic and Defined
Analyzer Support](#generic-and-defined-analyzer-support)

#### ConfigurableAnalyzer

`ConfigurableAnalyzer` was introduced in Jena 3.0.1. It allows more detailed
configuration of text analysis parameters by independently selecting a
`Tokenizer` and zero or more `TokenFilter`s which are applied in order after
tokenization. See the Lucene documentation for details on what each
tokenizer and token filter does.

The available `Tokenizer` implementations are:

* `StandardTokenizer`
* `KeywordTokenizer`
* `WhitespaceTokenizer`
* `LetterTokenizer`

The available `TokenFilter` implementations are:

* `StandardFilter`
* `LowerCaseFilter`
* `ASCIIFoldingFilter`
* `SelectiveFoldingFilter`

Configuration is done using Jena assembler like this:

    text:analyzer [
      a text:ConfigurableAnalyzer ;
      text:tokenizer text:KeywordTokenizer ;
      text:filters (text:ASCIIFoldingFilter, text:LowerCaseFilter)
    ]

From Jena 3.7.0, it is possible to define tokenizers and filters in addition to the _built-in_
choices above that may be used with the `ConfigurableAnalyzer`. Tokenizers and filters are 
defined via `text:defineAnalyzers` in the `text:TextIndexLucene` assembler section
using [`text:GenericTokenizer` and `text:GenericFilter`](#generic-analyzers-tokenizers-and-filters).

#### Analyzer for Query

New in Jena 2.13.0.

There is an ability to specify an analyzer to be used for the query
string itself.  It will find terms in the query text.  If not set, then
the analyzer used for the document will be used.  The query analyzer is
specified on the `TextIndexLucene` resource:

    <#indexLucene> a text:TextIndexLucene ;
        text:directory <file:Lucene> ;
        text:entityMap <#entMap> ;
        text:queryAnalyzer [
            a text:KeywordAnalyzer
        ]
        .

#### Alternative Query Parsers

New in Jena 3.1.0.

It is possible to select a query parser other than the default QueryParser.

The available `QueryParser` implementations are:

* `AnalyzingQueryParser`: Performs analysis for wildcard queries . This
is useful in combination with accent-insensitive wildcard queries.

* `ComplexPhraseQueryParser`: Permits complex phrase query syntax. Eg:
"(john jon jonathan~) peters*".  This is useful for performing wildcard
or fuzzy queries on individual terms in a phrase.

* `SurroundQueryParser`: Provides positional operators (w and n) 
that accept a numeric distance, as well as boolean 
operators (and, or, and not, wildcards (* and ?), quoting (with "), 
and boosting (via ^).

The query parser is specified on
the `TextIndexLucene` resource:

    <#indexLucene> a text:TextIndexLucene ;
        text:directory <file:Lucene> ;
        text:entityMap <#entMap> ;
        text:queryParser text:AnalyzingQueryParser .

Elasticsearch currently doesn't support Analyzers beyond Standard Analyzer. 

### Configuration by Code

A text dataset can also be constructed in code as might be done for a
purely in-memory setup:

        // Example of building a text dataset with code.
        // Example is in-memory.
        // Base dataset
        Dataset ds1 = DatasetFactory.createMem() ; 

        EntityDefinition entDef = new EntityDefinition("uri", "text", RDFS.label) ;

        // Lucene, in memory.
        Directory dir =  new RAMDirectory();
        
        // Join together into a dataset
        Dataset ds = TextDatasetFactory.createLucene(ds1, dir, entDef) ;

### Graph-specific Indexing

jena-text supports storing information about the source graph into the
text index. This allows for more efficient text queries when the query
targets only a single named graph. Without graph-specific indexing, text
queries do not distinguish named graphs and will always return results
from all graphs.

Support for graph-specific indexing is enabled by defining the name of the
index field to use for storing the graph identifier.

If you use an assembler configuration, set the graph field using the
text:graphField property on the EntityMap, e.g.

    # Mapping in the index
    # URI stored in field "uri"
    # Graph stored in field "graph"
    # rdfs:label is mapped to field "text"
    <#entMap> a text:EntityMap ;
        text:entityField      "uri" ;
        text:graphField       "graph" ;
        text:defaultField     "text" ;
        text:map (
             [ text:field "text" ; text:predicate rdfs:label ]
             ) .

If you configure the index in Java code, you need to use one of the
EntityDefinition constructors that support the graphField parameter, e.g.

        EntityDefinition entDef = new EntityDefinition("uri", "text", "graph", RDFS.label.asNode()) ;

**Note:** If you migrate from a global (non-graph-aware) index to a graph-aware index,
you need to rebuild the index to ensure that the graph information is stored.

### Linguistic support with Lucene index

Language tags associated with `rdfs:langStrings` occurring as literals in triples may
be used to enhance indexing and queries. Sub-sections below detail different settings with the index, and use cases with SPARQL queries.

#### Explicit Language Field in the Index 

The language tag for object literals of triples can be stored (during triple insert/update) 
into the index to extend query capabilities. 
For that, the `text:langField` property must be set in the EntityMap assembler :

    <#entMap> a text:EntityMap ;
        text:entityField      "uri" ;
        text:defaultField     "text" ;        
        text:langField        "lang" ;       
        . 

If you configure the index via Java code, you need to set this parameter to the 
EntityDefinition instance, e.g.

    EntityDefinition docDef = new EntityDefinition(entityField, defaultField);
    docDef.setLangField("lang");

Note that configuring the `text:langField` does not determine a language specific
analyzer. It merely records the tag associated with an indexed `rdfs:langString`.
 
#### SPARQL Linguistic Clause Forms

Once the `langField` is set, you can use it directly inside SPARQL queries. For that the `lang:xx`
argument allows you to target specific localized values. For example:

    //target english literals
    ?s text:query (rdfs:label 'word' 'lang:en' ) 
    
    //target unlocalized literals
    ?s text:query (rdfs:label 'word' 'lang:none') 
    
    //ignore language field
    ?s text:query (rdfs:label 'word')

Refer [above](#queries-with-language-tags) for further discussion on querying.

#### LocalizedAnalyzer

You can specify a LocalizedAnalyzer in order to benefit from Lucene language 
specific analyzers (stemming, stop words,...). Like any other analyzers, it can 
be done for default text indexing, for each different field or for query.

Using an assembler configuration, the `text:language` property needs to
be provided, e.g :

    <#indexLucene> a text:TextIndexLucene ;
        text:directory <file:Lucene> ;
        text:entityMap <#entMap> ;
        text:analyzer [
            a text:LocalizedAnalyzer ;
            text:language "fr"
        ]
        .

will configure the index to analyze values of the _default property_ field using a
FrenchAnalyzer.

To configure the same example via Java code, you need to provide the analyzer to the
index configuration object:

        TextIndexConfig config = new TextIndexConfig(def);
        Analyzer analyzer = Util.getLocalizedAnalyzer("fr");
        config.setAnalyzer(analyzer);
        Dataset ds = TextDatasetFactory.createLucene(ds1, dir, config) ;

Where `def`, `ds1` and `dir` are instances of `EntityDefinition`, `Dataset` and 
`Directory` classes.

**Note**: You do not have to set the `text:langField` property with a single 
localized analyzer. Also note that the above configuration will use the
FrenchAnalyzer for all strings indexed under the _default property_ regardless
of the language tag associated with the literal (if any).

#### Multilingual Support

Let us suppose that we have many triples with many localized literals in
many different languages. It is possible to take all these languages
into account for future mixed localized queries.  Configure the
`text:multilingualSupport` property to enable indexing and search via localized 
analyzers based on the language tag:

    <#indexLucene> a text:TextIndexLucene ;
        text:directory "mem" ;
        text:multilingualSupport true;     
        .

Via Java code, set the multilingual support flag : 

        TextIndexConfig config = new TextIndexConfig(def);
        config.setMultilingualSupport(true);
        Dataset ds = TextDatasetFactory.createLucene(ds1, dir, config) ;

This multilingual index combines dynamically all localized analyzers of existing 
languages and the storage of langField properties. 

The multilingual analyzer becomes the _default analyzer_ and the Lucene 
`StandardAnalyzer` is the default analyzer used when there is no language tag.

It is straightforward to refer to different languages in the same text search query:

    SELECT ?s
    WHERE {
        { ?s text:query ( rdfs:label 'institut' 'lang:fr' ) }
        UNION
        { ?s text:query ( rdfs:label 'institute' 'lang:en' ) }
    }

Hence, the result set of the query will contain "institute" related
subjects (institution, institutional,...) in French and in English.

**Note** When multilingual indexing is enabled for a _property_, e.g., rdfs:label,
there will actually be two copies of each literal indexed. One under the `Field` name, 
"label", and one under the name "label_xx", where "xx" is the language tag.

### Generic and Defined Analyzer Support

There are many Analyzers that do not have built-in support, e.g.,
`BrazilianAnalyzer`; require constructor parameters not otherwise
supported, e.g., a stop words `FileReader` or a `stemExclusionSet`; or
make use of Analyzers not included in the bundled Lucene distribution,
e.g., a `SanskritIASTAnalyzer`. Two features have been added to enhance
the utility of jena-text: 1) `text:GenericAnalyzer`; and 2)
`text:DefinedAnalyzer`. Further, since Jena 3.7.0, features to allow definition of
tokenizers and filters are included.

#### Generic Analyzers, Tokenizers and Filters

A `text:GenericAnalyzer` includes a `text:class` which is the fully
qualified class name of an Analyzer that is accessible on the jena
classpath. This is trivial for Analyzer classes that are included in the
bundled Lucene distribution and for other custom Analyzers a simple
matter of including a jar containing the custom Analyzer and any
associated Tokenizer and Filters on the classpath.

Similarly, `text:GenericTokenizer` and `text:GenericFilter` allow to access any tokenizers
or filters that are available on the Jena classpath. These two types are used _only_ to define
tokenizer and filter configurations that may be referred to when specifying a
[ConfigurableAnalyzer](#configurableanalyzer).

In addition to the `text:class` it is generally useful to include an
ordered list of `text:params` that will be used to select an appropriate
constructor of the Analyzer class. If there are no `text:params` in the
analyzer specification or if the `text:params` is an empty list then the
nullary constructor is used to instantiate the analyzer. Each element of
the list of `text:params` includes:

* an optional `text:paramName` of type `Literal` that is useful to identify the purpose of a 
parameter in the assembler configuration
* a `text:paramType` which is one of:

| &nbsp;Type&nbsp;  | &nbsp; Description&nbsp;    |
|-------------------|--------------------------------|
|`text:TypeAnalyzer`|a subclass of `org.apache.lucene.analysis.Analyzer`|
|`text:TypeBoolean`|a java `boolean`|
|`text:TypeFile`|the `String` path to a file materialized as a `java.io.FileReader`|
|`text:TypeInt`|a java `int`|
|`text:TypeString`|a java `String`|
|`text:TypeSet`|an `org.apache.lucene.analysis.CharArraySet`|

and is required for the types `text:TypeAnalyzer`, `text:TypeFile` and `text:TypeSet`, but,
since Jena 3.7.0, may be implied by the form of the literal for the types: `text:TypeBoolean`,
`text:TypeInt` and `text:TypeString`.

* a required `text:paramValue` with an object of the type corresponding to `text:paramType`

In the case of an `analyzer` parameter the `text:paramValue` is any `text:analyzer` resource as 
describe throughout this document.

An example of the use of `text:GenericAnalyzer` to configure an `EnglishAnalyzer` with stop 
words and stem exclusions is:

    text:map (
         [ text:field "text" ; 
           text:predicate rdfs:label;
           text:analyzer [
               a text:GenericAnalyzer ;
               text:class "org.apache.lucene.analysis.en.EnglishAnalyzer" ;
               text:params (
                    [ text:paramName "stopwords" ;
                      text:paramType text:TypeSet ;
                      text:paramValue ("the" "a" "an") ]
                    [ text:paramName "stemExclusionSet" ;
                      text:paramType text:TypeSet ;
                      text:paramValue ("ing" "ed") ]
                    )
           ] .

Here is an example of defining an instance of `ShingleAnalyzerWrapper`:

    text:map (
         [ text:field "text" ; 
           text:predicate rdfs:label;
           text:analyzer [
               a text:GenericAnalyzer ;
               text:class "org.apache.lucene.analysis.shingle.ShingleAnalyzerWrapper" ;
               text:params (
                    [ text:paramName "defaultAnalyzer" ;
                      text:paramType text:TypeAnalyzer ;
                      text:paramValue [ a text:SimpleAnalyzer ] ]
                    [ text:paramName "maxShingleSize" ;
                      text:paramType text:TypeInt ;
                      text:paramValue 3 ]
                    )
           ] .

If there is need of using an analyzer with constructor parameter types not included here then 
one approach is to define an `AnalyzerWrapper` that uses available parameter types, such as 
`file`, to collect the information needed to instantiate the desired analyzer. An example of
such an analyzer is the Kuromoji morphological analyzer for Japanese text that uses constructor 
parameters of types: `UserDictionary`, `JapaneseTokenizer.Mode`, `CharArraySet` and `Set<String>`.

As mentioned above, the simple types: `TypeInt`, `TypeBoolean`, and `TypeString` may be written
without explicitly including `text:paramType` in the parameter specification. For example:

                    [ text:paramName "maxShingleSize" ;
                      text:paramValue 3 ]

is sufficient to specify the parameter.

#### Defined Analyzers

The `text:defineAnalyzers` feature allows to extend the [Multilingual Support](#multilingual-support)
defined above. Further, this feature can also be used to name analyzers defined via `text:GenericAnalyzer`
so that a single (perhaps complex) analyzer configuration can be used is several places.

Further, since Jena 3.7.0, this feature is also used to name tokenizers and filters that
can be referred to in the specification of a `ConfigurableAnalyzer`.

The `text:defineAnalyzers` is used with `text:TextIndexLucene` to provide a list of analyzer
definitions:

    <#indexLucene> a text:TextIndexLucene ;
        text:directory <file:Lucene> ;
        text:entityMap <#entMap> ;
        text:defineAnalyzers (
            [ text:addLang "sa-x-iast" ;
              text:analyzer [ . . . ] ]
            [ text:defineAnalyzer <#foo> ;
              text:analyzer [ . . . ] ]
        )
        .

References to a defined analyzer may be made in the entity map like:

    text:analyzer [
        a text:DefinedAnalyzer
        text:useAnalyzer <#foo> ]

Since Jena 3.7.0, a `ConfigurableAnalyzer` specification can refer to any defined tokenizer 
and filters, as in:

    text:defineAnalyzers (
         [ text:defineAnalyzer :configuredAnalyzer ;
           text:analyzer [
                a text:ConfigurableAnalyzer ;
                text:tokenizer :ngram ;
                text:filters ( :asciiff text:LowerCaseFilter ) ] ]
         [ text:defineTokenizer :ngram ;
           text:tokenizer [
                a text:GenericTokenizer ;
                text:class "org.apache.lucene.analysis.ngram.NGramTokenizer" ;
                text:params (
                     [ text:paramName "minGram" ;
                       text:paramValue 3 ]
                     [ text:paramName "maxGram" ;
                       text:paramValue 7 ]
                     ) ] ]
         [ text:defineFilter :asciiff ;
           text:filter [
                a text:GenericFilter ;
                text:class "org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilter" ;
                text:params (
                     [ text:paramName "preserveOriginal" ;
                       text:paramValue true ]
                     ) ] ]
         ) ;

And after 3.8.0 users are able to use the JenaText custom filter `SelectiveFoldingFilter`.
This filter is not part of the Apache Lucene, but rather a custom implementation available
for JenaText users.

It is based on the Apache Lucene's `ASCIIFoldingFilter`, but with the addition of a
white-list for characters that must not be replaced. This is especially useful for languages
where some special characters and diacritical marks are useful when searching.

Here's an example:

    text:defineAnalyzers (
         [ text:defineAnalyzer :configuredAnalyzer ;
           text:analyzer [
                a text:ConfigurableAnalyzer ;
                text:tokenizer :tokenizer ;
                text:filters ( :selectiveFoldingFilter text:LowerCaseFilter ) ] ]
         [ text:defineTokenizer :tokenizer ;
           text:tokenizer [
                a text:GenericTokenizer ;
                text:class "org.apache.lucene.analysis.core.LowerCaseTokenizer" ] ]
         [ text:defineFilter :selectiveFoldingFilter ;
           text:filter [
                a text:GenericFilter ;
                text:class "org.apache.jena.query.text.filter.SelectiveFoldingFilter" ;
                text:params (
                     [ text:paramName "whitelisted" ;
                       text:paramType text:TypeSet ;
                       text:paramValue ("ç" "ä") ]
                     ) ] ]
         ) ;


#### Extending multilingual support

The [Multilingual Support](#multilingual-support) described above allows for a limited set of 
ISO 2-letter codes to be used to select from among built-in analyzers using the nullary constructor 
associated with each analyzer. So if one is wanting to use:

* a language not included, e.g., Brazilian; or 
* use additional constructors defining stop words, stem exclusions and so on; or 
* refer to custom analyzers that might be associated with generalized BCP-47 language tags, 
such as, `sa-x-iast` for Sanskrit in the IAST transliteration, 

then `text:defineAnalyzers` with `text:addLang` will add the desired analyzers to the
multilingual support so that fields with the appropriate language tags will use the appropriate 
custom analyzer.

When `text:defineAnalyzers` is used with `text:addLang` then `text:multilingualSupport` is 
implicitly added if not already specified and a warning is put in the log:

        text:defineAnalyzers (
            [ text:addLang "sa-x-iast" ;
              text:analyzer [ . . . ] ]

this adds an analyzer to be used when the `text:langField` has the value `sa-x-iast` during 
indexing and search.

#### Multilingual enhancements for multi-encoding searches

There are two multilingual search situations that are supported as of 3.8.0:

 * Search in one encoding and retrieve results that may have been entered in other encodings. For example, searching via Simplified Chinese (Hans) and retrieving results that may have been entered in Traditional Chinese (Hant) or Pinyin. This will simplify applications by permitting encoding independent retrieval without additional layers of transcoding and so on. It's all done under the covers in Lucene.
* Search with queries entered in a lossy, e.g., phonetic, encoding and retrieve results entered with accurate encoding. For example, searching via Pinyin without diacritics and retrieving all possible Hans and Hant triples.

The first situation arises when entering triples that include languages with multiple encodings that for various reasons are not normalized to a single encoding. In this situation it is helpful to be able to retrieve appropriate result sets without regard for the encodings used at the time that the triples were inserted into the dataset.

There are several such languages of interest: Chinese, Tibetan, Sanskrit, Japanese and Korean. There are various Romanizations and ideographic variants.

Encodings may not be normalized when inserting triples for a variety of reasons. A principle one is that the `rdf:langString` object often must be entered in the same encoding that it occurs in some physical text that is being catalogued. Another is that metadata may be imported from sources that use different encoding conventions and it is desirable to preserve the original form.

The second situation arises to provide simple support for phonetic or other forms of lossy search at the time that triples are indexed directly in the Lucene system.

To handle the first situation a `text` assembler predicate, `text:searchFor`, is introduced that specifies a list of language tags that provides a list of language variants that should be searched whenever a query string of a given encoding (language tag) is used. For example, the following `text:defineAnalyzers` fragment :

        [ text:addLang "bo" ; 
          text:searchFor ( "bo" "bo-x-ewts" "bo-alalc97" ) ;
          text:analyzer [ 
            a text:GenericAnalyzer ;
            text:class "io.bdrc.lucene.bo.TibetanAnalyzer" ;
            text:params (
                [ text:paramName "segmentInWords" ;
                  text:paramValue false ]
                [ text:paramName "lemmatize" ;
                  text:paramValue true ]
                [ text:paramName "filterChars" ;
                  text:paramValue false ]
                [ text:paramName "inputMode" ;
                  text:paramValue "unicode" ]
                [ text:paramName "stopFilename" ;
                  text:paramValue "" ]
                )
            ] ; 
          ]

indicates that when using a search string such as "རྡོ་རྗེ་སྙིང་"@bo the Lucene index should also be searched for matches tagged as `bo-x-ewts` and `bo-alalc97`.

This is made possible by a Tibetan `Analyzer` that tokenizes strings in all three encodings into Tibetan Unicode. This is feasible since the `bo-x-ewts` and `bo-alalc97` encodings are one-to-one with Unicode Tibetan. Since all fields with these language tags will have a common set of indexed terms, i.e., Tibetan Unicode, it suffices to arrange for the query analyzer to have access to the language tag for the query string along with the various fields that need to be considered.

Supposing that the query is:

    (?s ?sc ?lit) text:query ("rje"@bo-x-ewts) 

Then the query formed in `TextIndexLucene` will be:

    label_bo:rje label_bo-x-ewts:rje label_bo-alalc97:rje

which is translated using a suitable `Analyzer`, `QueryMultilingualAnalyzer`, via Lucene's `QueryParser` to:

    +(label_bo:རྗེ label_bo-x-ewts:རྗེ label_bo-alalc97:རྗེ)

which reflects the underlying Tibetan Unicode term encoding. During `IndexSearcher.search` all documents with one of the three fields in the index for term, "རྗེ", will be returned even though the value in the fields `label_bo-x-ewts` and `label_bo-alalc97` for the returned documents will be the original value "rje".

This support simplifies applications by permitting encoding independent retrieval without additional layers of transcoding and so on. It's all done under the covers in Lucene.

Solving the second situation simplifies applications by adding appropriate fields and indexing via configuration in the `text:defineAnalyzers`. For example, the following fragment:

        [ text:defineAnalyzer :hanzAnalyzer ; 
          text:analyzer [ 
            a text:GenericAnalyzer ;
            text:class "io.bdrc.lucene.zh.ChineseAnalyzer" ;
            text:params (
                [ text:paramName "profile" ;
                  text:paramValue "TC2SC" ]
                [ text:paramName "stopwords" ;
                  text:paramValue false ]
                [ text:paramName "filterChars" ;
                  text:paramValue 0 ]
                )
            ] ; 
          ]  
        [ text:defineAnalyzer :han2pinyin ; 
          text:analyzer [ 
            a text:GenericAnalyzer ;
            text:class "io.bdrc.lucene.zh.ChineseAnalyzer" ;
            text:params (
                [ text:paramName "profile" ;
                  text:paramValue "TC2PYstrict" ]
                [ text:paramName "stopwords" ;
                  text:paramValue false ]
                [ text:paramName "filterChars" ;
                  text:paramValue 0 ]
                )
            ] ; 
          ]
        [ text:defineAnalyzer :pinyin ; 
          text:analyzer [ 
            a text:GenericAnalyzer ;
            text:class "io.bdrc.lucene.zh.ChineseAnalyzer" ;
            text:params (
                [ text:paramName "profile" ;
                  text:paramValue "PYstrict" ]
                )
            ] ; 
          ]
        [ text:addLang "zh-hans" ; 
          text:searchFor ( "zh-hans" "zh-hant" ) ;
          text:auxIndex ( "zh-aux-han2pinyin" ) ;
          text:analyzer [
            a text:DefinedAnalyzer ;
            text:useAnalyzer :hanzAnalyzer ] ; 
          ]
        [ text:addLang "zh-hant" ; 
          text:searchFor ( "zh-hans" "zh-hant" ) ;
          text:auxIndex ( "zh-aux-han2pinyin" ) ;
          text:analyzer [
            a text:DefinedAnalyzer ;
            text:useAnalyzer :hanzAnalyzer ] ; 
          ]
        [ text:addLang "zh-latn-pinyin" ;
          text:searchFor ( "zh-latn-pinyin" "zh-aux-han2pinyin" ) ;
          text:analyzer [
            a text:DefinedAnalyzer ;
            text:useAnalyzer :pinyin ] ; 
          ]        
        [ text:addLang "zh-aux-han2pinyin" ;
          text:searchFor ( "zh-latn-pinyin" "zh-aux-han2pinyin" ) ;
          text:analyzer [
            a text:DefinedAnalyzer ;
            text:useAnalyzer :pinyin ] ; 
          text:indexAnalyzer :han2pinyin ; 
          ]

defines language tags for Traditional, Simplified, Pinyin and an _auxiliary_ tag `zh-aux-han2pinyin` associated with an `Analyzer`, `:han2pinyin`. The purpose of the auxiliary tag is to define an `Analyzer` that will be used during indexing and to specify a list of tags that should be searched when the auxiliary tag is used with a query string. 

Searching is then done via the multi-encoding support discussed above. In this example the `Analyzer`, `:han2pinyin`, tokenizes strings in `zh-hans` and `zh-hant` as the corresponding pinyin so that at search time a pinyin query will retrieve appropriate triples inserted in Traditional or Simplified Chinese. Such a query would appear as:

    (?s ?sc ?lit ?g) text:query ("jīng"@zh-aux-han2pinyin)

The auxiliary field support is needed to accommodate situations such as pinyin or sound-ex which are not exact, i.e., one-to-many rather than one-to-one as in the case of Simplified and Traditional.

`TextIndexLucene` adds a field for each of the auxiliary tags associated with the tag of the triple object being indexed. These fields are in addition to the un-tagged field and the field tagged with the language of the triple object literal.


#### Naming analyzers for later use

Repeating a `text:GenericAnalyzer` specification for use with multiple fields in an entity map
may be cumbersome. The `text:defineAnalyzer` is used in an element of a `text:defineAnalyzers` 
list to associate a resource with an analyzer so that it may be referred to later in a 
`text:analyzer` object. Assuming that an analyzer definition such as the following has appeared 
among the `text:defineAnalyzers` list:

    [ text:defineAnalyzer <#foo>
      text:analyzer [ . . . ] ]
      
then in a `text:analyzer` specification in an entity map, for example, a reference to analyzer `<#foo>`
is made via:

    text:map (
         [ text:field "text" ; 
           text:predicate rdfs:label;
           text:analyzer [
               a text:DefinedAnalyzer
               text:useAnalyzer <#foo> ]

This makes it straightforward to refer to the same (possibly complex) analyzer definition in multiple fields.

### Storing Literal Values

New in Jena 3.0.0.

It is possible to configure the text index to store enough information in the
text index to be able to access the original indexed literal values at query time.
This is controlled by two configuration options. First, the `text:storeValues` property
must be set to `true` for the text index:

    <#indexLucene> a text:TextIndexLucene ;
        text:directory "mem" ;
        text:storeValues true;     
        .

Or using Java code, used the `setValueStored` method of `TextIndexConfig`:

        TextIndexConfig config = new TextIndexConfig(def);
        config.setValueStored(true);

Additionally, setting the `langField` configuration option is recommended. See 
[Linguistic Support with Lucene Index](#linguistic-support-with-lucene-index) 
for details. Without the `langField` setting, the stored literals will not have 
language tag or datatype information.

At query time, the stored literals can be accessed by using a 3-element list
of variables as the subject of the `text:query` property function. The literal
value will be bound to the third variable:

    (?s ?score ?literal) text:query 'word'

## Working with Fuseki

The Fuseki configuration simply points to the text dataset as the
`fuseki:dataset` of the service.

    <#service_text_tdb> rdf:type fuseki:Service ;
        rdfs:label                      "TDB/text service" ;
        fuseki:name                     "ds" ;
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceUpdate            "update" ;
        fuseki:serviceReadGraphStore    "get" ;
        fuseki:serviceReadWriteGraphStore    "data" ;
        fuseki:dataset                  :text_dataset ;
        .

## Building a Text Index

When working at scale, or when preparing a published, read-only, SPARQL
service, creating the index by loading the text dataset is impractical.  
The index and the dataset can be built using command line tools in two
steps: first load the RDF data, second create an index from the existing
RDF dataset.

### Step 1 - Building a TDB dataset

**Note:** If you have an existing TDB dataset then you can skip this step

Build the TDB dataset:

    java -cp $FUSEKI_HOME/fuseki-server.jar tdb.tdbloader --tdb=assembler_file data_file

using the copy of TDB included with Fuseki.

Alternatively, use one of the
[TDB utilities](../tdb/commands.html) `tdbloader` or `tdbloader2` which are better for bulk loading:

    $JENA_HOME/bin/tdbloader --loc=directory  data_file

### Step 2 - Build the Text Index

You can then build the text index with the `jena.textindexer` tool:

    java -cp $FUSEKI_HOME/fuseki-server.jar jena.textindexer --desc=assembler_file

Because a Fuseki assembler description can have several datasets descriptions, 
and several text indexes, it may be necessary to extract a single dataset and index description
into a separate assembler file for use in loading.

#### Updating the index

If you allow updates to the dataset through Fuseki, the configured index
will automatically be updated on every modification.  This means that you
do not have to run the above mentioned `jena.textindexer` after updates,
only when you want to rebuild the index from scratch.

# Configuring Alternative TextDocProducers

## Default Behavior

The [default behavior](#one-triple-equals-one-document) when performing text indexing 
is to index a single property as a single field, generating a different `Document` 
for each indexed triple. This behavior may be augmented by 
writing and configuring an alternative `TextDocProducer`.

**Please note** that `TextDocProducer.change(...)` is called once for each triple that is
`ADD`ed or `DELETE`d, and thus can not be directly used to accumulate multiple properties
for use in composing a single multi-fielded Lucene document. [See below](#multiple-fields-per-document).

To configure a `TextDocProducer`, say `net.code.MyProducer` in a dataset assembly,
use the property `textDocProducer`, eg:

	<#ds-with-lucene> rdf:type text:TextDataset;
		text:index <#indexLucene> ;
		text:dataset <#ds> ;
		text:textDocProducer <java:net.code.MyProducer> ;
		.

where `CLASSNAME` is the full java class name. It must have either
a single-argument constructor of type `TextIndex`, or a two-argument
constructor `(DatasetGraph, TextIndex)`. The `TextIndex` argument
will be the configured text index, and the `DatasetGraph` argument
will be the graph of the configured dataset.

For example, to explicitly create the default `TextDocProducer` use:

	...
	    text:textDocProducer <java:org.apache.jena.query.text.TextDocProducerTriples> ;
	...

`TextDocProducerTriples` produces a new document for each subject/field
added to the dataset, using `TextIndex.addEntity(Entity)`. 

### Example 

The example class below is a `TextDocProducer` that only indexes
`ADD`s of quads for which the subject already had at least one
property-value. It uses the two-argument constructor to give it
access to the dataset so that it count the `(?G, S, P, ?O)` quads
with that subject and predicate, and delegates the indexing to
`TextDocProducerTriples` if there are at least two values for
that property (one of those values, of course, is the one that
gives rise to this `change()`).

      public class Example extends TextDocProducerTriples {
      
          final DatasetGraph dg;
          
          public Example(DatasetGraph dg, TextIndex indexer) {
              super(indexer);
              this.dg = dg;
          }
          
          public void change(QuadAction qaction, Node g, Node s, Node p, Node o) {
              if (qaction == QuadAction.ADD) {
                  if (alreadyHasOne(s, p)) super.change(qaction, g, s, p, o);
              }
          }
      
          private boolean alreadyHasOne(Node s, Node p) {
              int count = 0;
              Iterator<Quad> quads = dg.find( null, s, p, null );
              while (quads.hasNext()) { quads.next(); count += 1; }
              return count > 1;
          }
      }

## Multiple fields per document

In principle it should be possible to extend Jena to allow for creating documents with 
multiple searchable fields by extending `org.apache.jena.sparql.core.DatasetChangesBatched`
such as with `org.apache.jena.query.text.TextDocProducerEntities`; however, this form of
extension is not currently (Jena 3.13.1) functional.

# Maven Dependency

The <code>jena-text</code> module is included in Fuseki.  To use it within application code,
then use the following maven dependency:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-text</artifactId>
      <version>X.Y.Z</version>
    </dependency>

adjusting the version <code>X.Y.Z</code> as necessary.  This will automatically
include a compatible version of Lucene.

For Elasticsearch implementation, you can include the following Maven Dependency:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-text-es</artifactId>
      <version>X.Y.Z</version>
    </dependency>

adjusting the version <code>X.Y.Z</code> as necessary.
