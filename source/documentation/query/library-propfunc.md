---
title: Property Functions in ARQ
---

SPARQL allows custom property functions to add functionality to the
triple matching process. Property functions can be
[registered or dynamically loaded](extension.html).

See also the [free text search](text-query.html) page.

See also the FILTER functions
[FILTER functions library](library-function.html).

Applications can also [provide their own property functions](writing_propfuncs.html).

## Property Function Library

The prefix `apf` is `<http://jena.apache.org/ARQ/property#>`.
(The old prefix of `<http://jena.hpl.hp.com/ARQ/property#>` continues to
work. Applications are encouraged to switch.)

Direct loading using a URI prefix of
`<java:org.apache.jena.sparql.pfunction.library.>` (note the final
dot) also works.

The prefix `list:` is `http://jena.apache.org/ARQ/list#`.

<table>
<tr><th>Property name</th><th>Description</th></tr>
<tr><td>
<i><code>list</code> </i><code>list:member</code> <i><code>member</code></i>
</td><td>
Membership of an RDF List (RDF Collection). If <i>list</i> is not bound
or a constant, find and iterate all lists in the graph (can be
slow) else evaluate for one particular list. If <i>member</i> a
variable, generate solutions with <i>member</i> bound to each element in
the list. If <i>member</i> is bound or a constant expression, test to
see if a member of the list.
</td></tr>
<tr><td>
<code><i>list </i>list:index <i>(index member)</i></code>
</td><td>
Index of an RDF List (RDF Collection). If <i>list</i> is not bound or a
constant, find and iterate all lists in the graph (can be slow)
else evaluate for one particular list. The object is a list pair,
either element can be bound, unbound or a fixed node. Unbound
variables in the object list are bound by the property function.
</td></tr>
<tr><td>
<code><i>list </i>list:length <i>length</i></code>
</td><td>
Length of an RDF List (RDF Collection). If <i>list</i> is not bound or a
constant, find and iterate all lists in the graph (can be slow)
else evaluate for one particular list. The object is tested against
or bound to the length of the list.
</td></tr>
<tr><td>
<code><i>container </i>rdfs:member <i>member</i></code>
</td><td>
Membership of an RDF Container (rdf:Bag, rdf:Seq, rdf:Alt).
Pre-registered URI. If this infers with queries running over a Jena
inference model which also provides <code>rdfs:member</code>, then remove this
from the global registry.
<code>  PropertyFunctionRegistry.get().<br>       remove(RDFS.member.getURI()) ;</code>
</td></tr>
<tr><td>
<code>apf:textMatch</code>
</td><td>
Free text match.
</td></tr>
<tr><td>
<code><i>bag </i>apf:bag <i>member</i></code>
</td><td>
The argument <i>bag</i> must be bound by this point in the query or a
constant expression. If <i>bag</i> is bound or a URI, and <i>member</i> a
variable, generate solutions with <i>member</i> bound to each element in
the bag. If <i>member</i> is bound or a constant expression, test to see
if a member of the list.
</td><tr>
<tr><td>
<code><i>seq</i> apf:seq <i>member</i></code>
</td><td>
The argument <i>seq</i> must be bound by this point in the query or a
constant expression. If <i>seq</i> is bound or a URI, and <i>member</i> a
variable, generate solutions with <i>member</i> bound to each element in
the sequence. If <i>member</i> is bound or a constant expression, test
to see if a member of the list.
</td><tr>
<tr><td>
<code><i>seq</i> apf:alt <i>member</i></code>
</td><td>
The argument <i>alt</i> must be bound by this point in the query or a
constant expression. If <i>alt</i> is bound or a URI, and <i>member</i> a
variable, generate solutions with <i>member</i> bound to each element in
the alt . If <i>member</i> is bound or a constant expression, test to
see if a member of the list.
</td><tr>
<tr><td>
<i><code>varOrTerm</code></i><code>apf:assign</code><i><code>varOrTerm</code></i>
</td><td>
Assign an RDF term from one side to the other.  If both are fixed
RDF terms or bound variables, it becomes a boolean test that the
subject is the same RDF term as the object.
</td><tr>
<tr><td>
<i><code>iri</code></i><code>apf:splitIRI (<i>namespace</i> <i> localname</i>)</code><br />
<i><code>iri</code></i><code>apf:splitURI (<i>namespace</i> <i> localname</i>)</code>
</td><td>
Split the IRI or URI into namespace (an IRI) and local name (a
string). Compare if given values or bound variables, otherwise set
the variable. The object is a list with 2 elements.
<code>splitURI</code> is an synonym.
</td><tr>
<tr><td>
<code><i>subject</i> apf:str <i>object</i></code>
</td><td>
The <i>subject</i> is the string form of the <i>object</i>, like the function
str().
<i>Object</i> must be bound or a constant. <i>Object</i> can not be a blank
node (see <code>apf:blankNode</code>)
</td><tr>
<tr><td>
   <code><i>subject</i> apf:blankNode <i>label</i><br/>
   <code><i>subject</i> apf:bnode <i>label</i><br></td></code>
</td><td>
<i>Subject</i> must be bound to a blank node or a constant. <i>Label</i> is
either a string, in which case test for whether this is the blank
node label of <i>subject</i>, or it is a variable, which is assigned the
blank node label as a plain string. Argument mismatch causes no
match. Use with care.
</td><tr>
<tr><td>
<code><i>subject</i> apf:versionARQ <i>version</i><br>             <br>  </code>
</td><td>
Set the <i>subject</i> to the IRI for ARQ and set the object to the
version string (format "N.N.N" where N is a number). If any of the
variables are already set, test for the correct value.
</td><tr>
<tr><td>
<code><i>var</i> apf:concat <i>(arg arg ...)</i></code>
</td><td>
Concatenate the arguments in the object list as strings, and
assign to <code><i>var</i></code>.
</td><tr>
<tr><td>
<code><i>var</i> apf:strSplit <i>(arg arg)</i></code>
</td><td>
Split a string and return a binding for each result.  The subject variable should be unbound.  The first argument to the
object list is the string to be split.  The second argument to the object list is a regular expression by which to split the string.
The subject <code><i>var</i></code> is bound for each result of the split, and each result has the whitespace trimmed from it.
</td><tr>
</table>

[ARQ documentation index](index.html)



