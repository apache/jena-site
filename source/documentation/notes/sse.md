---
title: SPARQL S-Expressions (or "SPARQL Syntax Expressions")
---

A way to write down data structures in an RDF-centric syntax.

But not an idea for another RDF serialization format.

## Contents

-   [Need](#need)
-   [Design Intent](#design-intent)
-   [Other Approaches](#other-approaches)
    -   [RDF](#rdf)
    -   [Lisp](#lisp)
    -   [XML](#xml)
    -   [JSON](#json)
-   [Design](#design)
    -   [Tokens](#tokens)
    -   [SSE Comments](#sse-comments)
    -   [SSE Escapes](#sse-escapes)
    -   [Structures](#structures)
-   [Tagged Structures](#tagged-structures)
    -   [IRI resolution](#iri-resolution)
        -   [base](#base)
        -   [prefix](#prefix)
        -   [Nesting](#nesting)
    -   [Links](#links)
-   [Building Java Objects](#building-java-objects)
    -   [SSE Factory](#sse-factory)
-   [Mapping to RDF](#mapping-to-rdf)
-   [SSE Files](#sse-files)
-   [Longer Examples](#longer-examples)
    -   [Query 1](#query-1)
    -   [Complete SPARQL Execution](#complete-sparql-execution)
-   [SSE Grammar](#sse-grammar)

## Need

The [SPARQL algebra](http://www.w3.org/TR/sparql11-query/#sparqlAlgebra)
defines the semantics of a SPARQL graph pattern. Every SPARQL query
string (the syntax) is mapped to a SPARQL algebra expression.

It is convenient to be able to print out such algebra expressions for
discussion between people and for debugging. Further, if algebra
expressions can be read back in as well, testing of specific parts of an
implementation is also easier.

This is an example of a general problem : how to express data structures
where the basic elements of RDF are based on RDF nodes.

RDF itself is often the most appropriate way to do this, but sometimes
it isn't so convenient. An algebra expression is a tree, and order
matters.

When expressing a data structure, there are certain key structure that
need to be expressible: arrays and maps, then sets and bags, but
expression of a data structure is not the same as the high-level
semantics of the data structure.

A stack can be expressed as a list. And because we want to express the
structure, and not express the operations on the structures, data
structures with operational meaning don't enter the picture. There are
no operations, no *push*, *pop* or *peek*.

Note that this is to *express* a data structure, not *encode* or
*represent* it. By *express* we mean communicate it, between people or
between cooperating machines. The structures are not completely
self-representing. But we do discuss a way to express in RDF that does
give a self-describing nature through the use of tagged structures.

## Design Intent

-   Concise (=\> for people to write conveniently) format for data
    structures
-   RDF-centric

Non-goals:

-   to directly represent any data structure.
-   to be another RDF syntax.

So desirable features are:

-   Concise syntax for RDF terms
-   Datastructures

## Other Approaches

### RDF

RDF is "map-centric" but not all data structures are conveniently
expressible in maps. RDF has lists, and these lists have convenient
syntax in Turtle or N3.

If your data structure fits the RDF paradigm, then RDF is a better
choice that SSE. [Below](#mapping-to-rdf) is a possible mapping from SSE
to RDF as Turtle.

### Lisp

Lacks convenient syntax for the RDF terms themselves.

SSE syntax is almost valid
[Scheme](http://www.schemers.org "http://www.schemers.org"); literal
language tags and datatypes get split a separate list symbols but the
information is recoverable. Scheme doesn't use `[]` lists or
single-quoted strings.

### XML

Too verbose.

### JSON

[JSON](http://json.org/ "http://json.org/") provides values (strings,
numbers, booleans, null), arrays and object (which are maps). [SPARQL
Query Results in
JSON](http://www.w3.org/TR/rdf-sparql-json-res/ "http://www.w3.org/TR/rdf-sparql-json-res/")
shows how JSON might be used. It describes how RDF terms are encoded
into further substructures. Alternatively, we could put encoded terms in
strings like "<http://w3.org/\>" and have a parser-within-a-parser. But
both these approaches do not make the writing of RDF terms as easy as it
could be.

## Design

[S-expressions](http://en.wikipedia.org/wiki/S-expression "http://en.wikipedia.org/wiki/S-expression")
using RDF terms.

The command `arq.qparse --print=op --file queryFile` will print the
SPARQL algebra for the query in SSE format.

### Tokens

Tokens are the atomic elements of the syntax.

| Example                    | Explanation |
| -------------------------- | ------------ |
|  `"abc"`                   | string
|  `"abc"@en`                | string with language tag.
|  `123`                     | number, specifically an xsd;integer.
|  `<http://example.org/>`   | IRI (or URI).
|  `_:abc`                   | blank node.
|  `?x`                      | variable
|  `?`                       | variable
|  `ex:thing`                | prefixed name
|  `ex:123`                  | prefixed name
|  `SELECT`                  | symbol
|  `+`                       | symbol
|  `@xyz`                    | symbol

For `?` (no name), a unique, internal name for a fresh variable will be
allocated; every use of `?` is a different variable.

`??x` creates a non-distinguished variable. `??` creates a fresh
non-distinguished variable.

`_:` creates a fresh blank node.

`@xyz` - this is a symbol because a language tags only follow a lexical
form.

Almost any sequence of characters which is not an RDF term or variable
is a symbol that can be given special meaning by processing software.

### SSE Comments

`#` or `;` introduce comments, which run to the end of line, including
the end-of-line characters.

### SSE Escapes

`\u` and `\U` escape sequences for arbitrary Unicode codepoints. These
apply to the input character stream before parsing. They don't, for
example, permit a space in a symbol.

Strings provide `\n`, `\t`, `\r`, `\b`, `\b`, `\f`, `\"`, `\'` and `\\`
escape sequences as in SPARQL.

### Structures

`(?x ns:p "abc")` - list of 3 elements: a variable, a prefixed name and
a string

    (bgp 
      [?x ns:p "abc"])

A list of 2 elements: a symbol (`bgp`) and a list of 3 elements. Both
`()` and `[]` delimit lists; they must match but otherwise it's a free
choice. Convention is that compact lists use `[]`; large lists use `()`.

## Tagged Structures

The basic syntax defines tokens and lists. Higher level processing
happens on this basic syntax and can be extended by interpreting the
structure.

Layers on top of the basic abstract syntax produce specialised data
structures. This can be a transformation into a new SSE structure or the
production of programming language objects.

This is driven by tagged (data) objects in an SSE expression. The tag is
a symbol and the elements of the data object are the rest of the list.

    (+ 1 2)

is tagged with symbol `+`

    (triple ?s ?p "text"@en)

is tagged with symbol `triple`

### IRI resolution

One such layer is IRI and prefix name resolution, using tags `base` and
`prefix`.

Basic syntax includes unresolved IRIs, (example `<abc>`) and prefixed
names (example `foaf:name`). These are turned into absolute IRIs and the
`base` and `prefix` tagged object wrappers are removed.

This is sufficiently important that the SSE library handles this in an
optimized fashion where the IRI processing directly rewrites the
streamed output of the parser.

#### `base`

    (base <http://example/>
       (triple <xyz> ?p "lex"^^<thing>))

becomes

    (triple <http://example/xyz> ?p "lex"^^<http://example/thing>)

#### `prefix`

    (prefix ((: <http://example/>)
              (ns: <http://example/ns#>))
         (triple :x ns:p "lex"^^ns:type))

becomes

     (triple <http://example/x> <http://example/ns#p> "lex"^^<http://example/ns#type>)

#### Nesting

The tagged structures can be combined and nested. The base or prefixes
declared only apply to the body of the data object.

     (prefix ((: <http://jena.hpl.hp.com/2007/>)
                 (foaf:  <http://xmlns.com/foaf/0.1/>))
           (triple (base <http://jena.hpl.hp.com/> <afs> foaf:name "Andy")))

Combined with the triple builder, this will produce a triple:

     <http://jena.hpl.hp.com/afs> <http://xmlns.com/foaf/0.1/name> "Andy" .

### Links

*Not implemented*

Not all data structures can be conveniently expressed as nested lists.
Sub-element sharing matters. A structure with shared elements can't be
serialized as a strict tree and some form of reference is needed.

Name a place in the structure: `(name@ symbol X)`

Link to it: `(@link symbol)`

The link layer will produce an SSE structure without these tags, having
replaced all `name@` and `@link` with the shared structure *X*.

*`@` is a convention for referencing.*

## Building Java Objects

Builders are code classes that process the structure into Java objects.
Writing builders is straight-forward because low-level parsing details
have been taken care of in the basic syntax. A typical builder is a
recursive-decent parser over the abstract syntax tree, coding one is
primarily walking the structure, with a tagged object to Java instance
mapping being applied.

Some tagged objects with builders are:

-   `(triple S P O)` where *X* is an RDF node (RDF term or variable).
-   `(quad G S P O)`
-   `(graph triple*)`
-   `(graph@ URL)` — Read a URL.

*@@ Need to write the abstract syntax for each tagged object*

Many builders have convenience syntax. Triples can be abbreviated by
omitting the tag `triple` because usually the fact it is a triple is
clear.

    (bgp (triple ?s ?p ?o)) 
    (bgp (?s ?p ?o)) 

Quads have a similar abbreviation as 4-lists. In addition, `_` is a quad
on the default graph.

Elements for executing SPARQL:

-   SPARQL algebra operators and basic graph patterns
-   Filter expressions (in prefix notation `(+ 1 2)`)
-   Query solutions (Bindings) and tables.

### SSE Factory

The class `SSE` in package `org.apache.jena.sparql.sse` provides many
convenience functions to call builders for RDF and SPARQL structures.

    Node n = SSE.parseNode("<http://example/node>") ;
    Triple t = SSE.parseTriple("(?s ?p ?o)") ;
    Op op = SSE.parseOp("(filter (> ?v 123) (bgp (?s ?p ?v)))") ;

Most of the operations have forms that allow a `PrefixMapping` to be
specified - this is wrapped around the parser run so prefixed names can
be used without explicit prefix declarations.

There is a default prefix mapping with a few common prefixes: `rdf`,
`rdfs`, `owl`, `xsd` and `fn` (the XPath/XQuery functions and operators
namespace).

## Mapping to RDF

The syntax of SSE is very close to Turtle lists because the syntax for
IRIs and literals are the same.: to produce Turtle (outline):

1.  Replace symbols by IRIs: prepend a common URI and %-encode any
    characters necessary.
2.  Replace variables by IRIs: prepend a common URI.
3.  Move prefixes to be `@prefix` directives.
4.  Put a dot at the end of the file.

The result is an RDF model using only the properties `rdf:first` and
`rdf:rest` so it records the data structure, but not what the data
structure represents.

## SSE Files

The file extension is `.sse` and all files are UTF-8.

A quick and pragmatic Emacs mode is given by:

    ;; ==== SSE mode
    (define-derived-mode sse-mode lisp-mode "SSE" nil
       (make-local-variable 'lisp-indent-function)
       (setq lisp-indent-function 'sse-indent-function)
       )

    ;; Everything in SSE is "def" like
    (defun sse-indent-function (indent-point state)
      (lisp-indent-defform state indent-point))

    (setq auto-mode-alist
           (cons '("\\.sse" . sse-mode) auto-mode-alist))

## Longer Examples

### Query 1

    PREFIX foaf:       <http://xmlns.com/foaf/0.1/>
    SELECT DISTINCT ?name ?nick
    {
        ?x foaf:mbox <mailt:person@server> .
        ?x foaf:name ?name 
        OPTIONAL { ?x foaf:nick ?nick }
    }

    (prefix ((foaf: <http://xmlns.com/foaf/0.1/>))
       (distinct
         (project (?name ?nick)
           (leftjoin
             (BGP
               [triple ?x foaf:mbox <mailto:person@server>]
               [triple ?x foaf:name ?name]
             )
             (BGP [triple ?x foaf:nick ?nick])
           ))))

### Complete SPARQL Execution

The following is a complete query execution, data and query. There is an
inline dataset and a query of

     PREFIX : <http://example/>
     SELECT * 
     {
       GRAPH :g1 { ?x ?p ?v }
     }

The tag `graph` is used twice, with different meanings. First, for an
RDF graph, and second in `GRAPH` SPARQL pattern. In a data structure,
context sorts out the different usages.

    (prefix ((: <http://example/>))
       (exec
         (dataset
           (default (graph
              (:x :p 1)
              (:x :p 2)))
           (namedgraph :g1
         (graph
           (:x :gp 1)
           (:x :gp 2)))
           (namedgraph :g2
         (graph
           (:y :gp 1)
           (:y :gp 2)))
           )

         (graph :g1
           (bgp (?x ?p ?v)))
         ))

## SSE Grammar

*@@ insert grammar here*
