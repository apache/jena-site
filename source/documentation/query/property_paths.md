---
title: ARQ Property Paths
---

# ARQ - Property Paths

A property path is a possible route through a graph between two
graph nodes.  A trivial case is a property path of length exactly
one, which is a triple pattern.

Most property paths are now legal SPARQL 1.1 syntax, there are some advanced property 
paths which are syntactic extensions and are only available if the query is parsed with language `Syntax.syntaxARQ`.

## Path Language

A property path expression (or just 'path') is similar to a string
regular expression but over properties, not characters. ARQ
determines all matches of a path expression and binds subject or
object as appropriate. Only one match is recorded - no duplicates
for any given path expression, although if the path is used in a
situation where it's initial points is already repeated in a
pattern, then this duplication is preserved.

Path example | Meaning
------------ | -------
<tt>dc:title &#x7C; rdfs:label</tt> | Dublin Core title or an RDFS label.
`foaf:knows/foaf:name` | Name of people one "knows" steps away.
`foaf:knows/foaf:knows/foaf:name` | Name of people two "knows" steps away.

In the description below, *`uri`* is either a URI or a prefixed
name.

Syntax Form                   | Matches
-----------                   | -------
<tt><i>uri</i></tt>           | A URI or a prefixed name. A path of length one.
<tt>^<i>elt</i></tt>          | Reverse path (object to subject)
<tt>(<i>elt</i>)</tt>                  | A group path *`elt`*, brackets control precedence.
<tt><i>elt1</i> / <i>elt2</i></tt>     | A sequence path of *`elt1`*, followed by *`elt2`*
<tt><i>elt1</i> &#x7C; <i>elt2</i></tt>   | A alternative path of <tt><i>elt1</i></tt>, or <tt><i>elt2</i></tt> (both possibilities are tried)
<tt><i>elt</i>*</tt>                   | A path of zero or more occurrences of *`elt`*.
<tt><i>elt</i>+</tt>                   | A path of one or more occurrences of *`elt`*.
<tt><i>elt</i>?</tt>                   | A path of zero or one *`elt`*.
<tt>!<i>uri</i></tt>                   | A path matching a property which isn't <tt><i>uri</i></tt> (negated property set)
<tt>!(<i>uri1</i>&#x7C;...&#x7C;<i>uriN</i>)</tt>   | A path matching a property which isn't any of `uri1 ... uri` (negated property set)

ARQ extensions: to use these you must use `Syntax.syntaxARQ`

Syntax Form | Matches
----------- | -------
<tt><i>elt1</i> ^ <i>elt2</i></tt>          | Shorthand for <tt><i>elt1 / ^elt2</i></tt>, that is *`elt1`* followed by reverse *`elt2`*.
<i><tt>elt</tt></i>`{n,m}`  | A path between n and m occurrences of *`elt`*.
<i><tt>elt</tt></i>`{n}`    | Exactly `n` occurrences of `elt`. A fixed length path.
<i><tt>elt</tt></i>`{n,}`   | `n` or more occurrences of *`elt`*.
<i><tt>elt</tt></i>`{,n}`   | Between 0 and `n` occurrences of *`elt`*.

Precedence:

1.  URI, prefixed names
2.  Negated property set
3.  Groups
4.  Unary \^ reverse links
5.  Unary operators `*`, `?`, `+` and `{}` forms
6.  Binary operators `/` and \^
7.  Binary operator `|`

Precedence is left-to-right within groups.

## Path Evaluation

Paths are "simple" if they involve only operators / (sequence), \^
(reverse, unary or binary) and the form {*n*}, for some single
integer *n*. Such paths are fixed length. They are translated to
triple patterns by the query compiler and do not require special
path-evaluation at runtime.

A path of just a URI is still a single triple pattern.

A path is "complex" if it involves one or more of the operators
\*,?, + and {}. Such paths require special evaluation and provide
expressivity outside of strict SPARQL because paths can be of
variable length. When used with models backed by SQL databases,
complex path expressions may take some time.

A path of length zero connects a graph node to itself.

Cycles in paths are possible and are handled.

Paths do not need to be anchored at one end of the other, although
this can lead to large numbers of result because the whole graph is
searched.

Property functions in paths are only available for simple paths.

## Extended Language

This involves is syntactic extension and is available if the query
is parsed with language `Syntax.syntaxARQ`.

Paths can be directly included in the query in the property
position of a triple pattern:

    PREFIX :     <http://example/>
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    # Find the types of :x, following subClassOf
    SELECT *
    {
       :x  rdf:type/rdfs:subClassOf*  ?t
    }

## Examples

### Simple Paths

Find the name of any people that Alice knows.

    {
      ?x foaf:mbox <mailto:alice@example> .
      ?x foaf:knows/foaf:name ?name .
    }

Find the names of people 2 "`foaf:knows`" links away.

    {
      ?x foaf:mbox <mailto:alice@example> .
      ?x foaf:knows/foaf:knows/foaf:name ?name .
    }

This is the same as the strict SPARQL query:

    {
      ?x  foaf:mbox <mailto:alice@example> .
      ?x  foaf:knows [ foaf:knows [ foaf:name ?name ]].
    }

or, with explicit variables:

    {
      ?x  foaf:mbox <mailto:alice@example> .
      ?x  foaf:knows ?a1 .
      ?a1 foaf:knows ?a2 .
      ?a2 foaf:name ?name .
    }

Because someone Alice knows may well know Alice, the example above
may include Alice herself. This could be avoided with:

    { ?x foaf:mbox <mailto:alice@example> .
      ?x foaf:knows/foaf:knows ?y .
      FILTER ( ?x != ?y )
      ?y foaf:name ?name
    }

These two are the same query: the second is just reversing the
property direction which swaps the roles of subject and object.

    { ?x foaf:mbox <mailto:alice@example> }

    { <mailto:alice@example> ^foaf:mbox ?x }

Mutual `foaf:knows` relationships: `?x` knows someone who knows
`?x`

    {
      ?x foaf:knows^foaf:knows ?x .
    }

Negated property sets define matching by naming one or more
properties that must not match. Match if there is a triple from
`?x` to `?y` which is not `rdf:type`.

    {
      ?x !rdf:type ?y .
    }

    {
      ?x !(rdf:type|^rdf:type) ?y .
    }

Only properties and reverse properties are allowed in a negated
property set, not a full path expression.

### Complex Paths

Find the names of all the people can be reached from Alice by
`foaf:knows`:

    {
      ?x foaf:mbox <mailto:alice@example> .
      ?x foaf:knows+/foaf:name ?name .
    }

Again, because of cycles in `foaf:knows` relationships, it is
likely to include Alice herself.

Some forms of limited inference are possible as well. For example:
all types and supertypes of a resource:

    { <http://example/> rdf:type/rdfs:subClassOf* ?type }

All resources and all their inferred types:

    { ?x rdf:type/rdfs:subClassOf* ?type }

## Use with Legal SPARQL Syntax

A path can parsed, then installed as a
[property function](extension.html#propertyFunctions) to be
referred to by URI. This way, when the URI is used in the predicate
location in a triple pattern, the path expression is evaluated.

    Path path = ...
    String uri = ...
    PathLib.install(uri, path) ;

For example:

    Path path = PathParser.parse("rdf:type/rdfs:subClassOf*", PrefixMapping.Standard) ;
    String uri = "http://example/ns#myType" ;
    PathLib.install(uri, path) ;

and the SPARQL query:

    PREFIX : <http://example/>
    PREFIX ns: <http://example/ns#>
    # Find the types of :x, following subClassOf
    SELECT * { :x ns:myType ?t}

This also works with if an existing property is redefined (a URI in
a path expression is not interpreted as a property function) so,
for example, `rdf:type` can be redefined as a path that also
considers RDFS sub -class relationships. The path is a complex path
so the property function for `rdf:type` is not triggered.

    Path path = PathParser.parse("rdf:type/rdfs:subClassOf*", PrefixMapping.Standard) ;
    PathLib.install(RDF.type.getURI(), path) ;


[ARQ documentation index](index.html)
