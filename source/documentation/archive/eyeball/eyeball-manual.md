---
title: Jena Eyeball manual
---

<b>This page is historical "for information only" - there is no Apache
release of Eyeball and the code has not been updated for Jena3.  
<br/>
The [original source code is available](https://svn.apache.org/viewvc/jena/Scratch/Eyeball/trunk/).
</b>

This document describes Eyeball, an
"[RDF](http://www.w3.org/RDF/)
[lint](http://en.wikipedia.org/wiki/Lint_programming_tool)".
See
the release notes for descriptions of changes
from previous versions. Eyeball was a part of the
[Jena](/) family of RDF/OWL tools. 

Throughout this document, the prefix `eye:` stands for the URL
`http://jena.hpl.hp.com/Eyeball\#`.

## Introduction

Eyeball is a library and command-line tool for checking RDF and OWL
models for various common problems. These problems often result in
technically correct but implausible RDF. Eyeball checks against
user-provided schema files and makes various closed-world
assumptions.

Eyeball can check for:

-   unknown [with respect to the schemas] properties and classes
-   bad prefix namespaces
-   ill-formed URIs, with user-specifiable constraints
-   ill-formed language tags on literals
-   datatyped literals with illegal lexical forms
-   unexpected local names in schema namespaces
-   untyped resources and literals
-   individuals having consistent types, assuming complete typing
-   likely cardinality violations
-   broken RDF list structures
-   suspected broken use of the typed list idiom
-   obviously broken OWL restrictions
-   user-specified constraints written in SPARQL

Eyeball's checks are performed by Inspector plug-ins and can be
customised by the user. Rendering its reports to output is
performed by Renderer plug-ins which can also be customised by the
user.

## Installation

Fetch the Eyeball distribution zipfile and unpack it somewhere
convenient. Eyeball 2.1 comes with its own copy of Jena 2.5 with CVS updates.
Do *not* attempt to use other versions of Jena with Eyeball.

In the Eyeball distribution directory, run the Eyeball tests:

    ant test

If these tests fail, something is wrong. Please ask on the user
mailing list.

If the tests have passed, you can use Eyeball from the installation
directory, or copy *lib*, *etc* and *mirror* to somewhere
convenient.

## Command line operation

You must ensure that *all* the Eyeball jars from *lib* are on your
classpath. (Note that Eyeball comes with its own Jena jar files and
*may not work* with other Jena jars.) The directories *etc* and
*mirror* should be in the current directory or also on your
classpath.

Run the Eyeball command:

    java [java options eg classpath and proxy] jena.eyeball
        (-check | -sign | -accept) specialURL+
        [-assume Reference*]
        [-config fileOrURL*]
        [-set Setting*]
        [-root rootURI]
        [-render Name]
        [-include shortName*]
        [-exclude shortName*]
        [-analyse | -repair]
        [-remark] [-version]

The -*whatever* sections can come in any order and may be repeated,
in which case the additional arguments are appended to the existing
ones. Exactly one of *-check*, *-sign*, *-accept*, or *version*
must be provided; all the other options are optional.

When Eyeball resolves ordinary filenames or URLs it uses the Jena
file manager to possibly map those names (*eg* to redirect an
`http:` URL to a local cached copy). See the
[file manager howto](../notes/file-manager.html)
for details on how to configure the file manager.

### Examples of command-line use

    java jena.eyeball -version

    java jena.eyeball -check myDataFile.rdf

    java jena.eyeball -assume dc -check http://example.com/nosuch.n3

    java jena.eyeball -assume mySchema.rdf -check myData.rdf -render xml

    java jena.eyeball -check myData.rdf -include consistent-type

    java jena.eyeball -check myConfig.ttl -sign >signedConfig.ttl

### -check specialURL+

The *-check* command checks the specified models for problems. The
*specialURL*s designate the models to be checked. In the simplest
case, these are plain filenames, `file:` URLs, or `http:` URLs. At
least one *specialURL* must be specified. Each specified model is
checked independently of the others.

    -check myModel.ttl
    -check file:///c:/rdf/pizza.owl
    -check http://example.com/rdf/beer.rdf

If the *specialURL* is of the form *ont:NAME:base*, then the
checked model is the model *base* treated as an OntModel with the
specification `OntModelSpec.<i>NAME</i>`; see
[the Jena ontology documentation](../ontology/index.html)
for the available names.

    -check ont:OWL_MEM_RDFS_INF:myModel.ttl
    -check ont:OWL_DL_MEM_RULE_INF:http://example.com/rdf/beer.rdf

If the *specialURL* is of the form *ja:R@AF*, then the model is
that described by the resource *R* in the Jena
[assembler](../assembler/index.html)
description file *AF*. *R* is prefix-expanded using the prefixes in
*AF*.

    -check ja:my:root@my-assembly.ttl
    -check ont:OWL_MEM_RDFS_INF:my:root@my-assembly.ttl

If the URL (or the base) is of the form *jdbc:DB:head:model*, then
the checked model is the one called *model* in the database with
connection *jdbc:DB:head*. (The database user and password must be
specified independently using the *jena.db.user* and
*jena.db.password* system properties.)

    -check jdbc:mysql://localhost/test:example

### -config fileOrURL and -root rootURI

The *-config fileOrURL* options specify the Eyeball
[assembler](../assembler/index.html)
configuration files to load. A single configuration model is
constructed as the union of the contents of those files. If this
option is omitted, the default configuration file
*etc/eyeball-config.n3* is loaded. See
[inside the Eyeball configuration file](#inside-configuration) for
details of the configuration file.

    -config my-hacked-config-file.n3
    -config etc/eyeball-config.n3 extras.ttl

The *-root rootURI* option specifies the root resource in the
Eyeball configuration. If this option is omitted, *eye:eyeball* is
used by default. *rootURI* is prefix-expanded using the prefixes in
the configuration file.

    -root my:root
    -root my:sparse-config
    -root urn:x-hp:eyeball-roots:special

### -set Setting\*

The *-set* option allows command-line tweaks to the configuration,
*eg* for enabling checking URIs for empty local names.
*You will rarely need to use this*; it is presented here because of
its association with the `-config` and `-root` options.

Each *Setting* has the form `S.P=O` and adds the statement
`(S' P' O')` to the configuration.

The current Eyeball converts the components of the `S.P=O` string
into RDF nodes `S'`, `P'`, `O'` using some special rules:

-   A component starting with a digit is treated as an xsd:integer
    literal (and hence should only appear as the object of the
    setting).
-   A component starting with a quote, either `"` or `'`, is
    treated as a literal whose lexical form extends to the matching
    closing quote. Note: (a)
    *literals with embedded spaces are not supported*; (b) your
    command-line interpreter may treat quotes specially, and to allow
    the quotes to pass through to Eyeball, you'll have to use another
    (different) pair of quotes!
-   A component starting with `_` is treated as a blank node with
    that label.
-   Otherwise, the component is treated as a URI reference. If it
    starts with a prefix (*eg*, `rdf:`) that prefix is expanded using
    the prefixes of the configuration file. If it has no prefix, it is
    as though the empty prefix was specified: in the default
    configuration file, that is set to the Eyeball namespace, so it is
    as though the prefix `eye:` had been used.

For example, to enable the URI inspectors non-default reporting of
URIs with empty local names, use:

    -set URIInspector.reportEmptyLocalNames="'true'"

Note the nested different quotes required to pass 'true' to Eyeball
so that it can interpret this as a literal.

### -include/-exclude shortNames

The various Eyeball inspectors are given *short names* in the
configuration file. By default, an Eyeball check uses a specific
set of inspectors with short name *defaultInspectors*. Additional
inspectors can be enabled using the *-include* option, and default
inspectors can be disabled using the *-exclude* option. See below
for the available inspectors and their short names, and see
[inspectors configuration](#inspectors-configuration) for how to
configure inspectors.

    -include list all-typed
    -exclude cardinality
    -include owl -exclude consistent-type

### -assume Reference

The -assume *Reference*s identifies any assumed schemas used to
specify the predicates and classes of the data model. The reference
may be a file name or a URL (and may be mapped by the file
manager).

Eyeball automatically assumes the RDF and RDFS schemas, and the
built-in XSD datatype classes. The short name *owl* can be used to
refer to the OWL schema, *dc* to the Dublin Core schema, *dcterms*
to the Dublin Core terms schema, and *dc-all* to both.

    -assume owl
    -assume owl dc-all
    -assume owl my-ontology.owl

### -sign and -accept (experimental)

If *-sign* is specified, Eyeball first does a *-check*. If no
problem reports are generated, Eyeball writes a *signed* version of
the current model to the standard output. The signature records the
Eyeball configuration used and a weak hash of the model. If the
input model is already signed, that signature is discarded before
computing the new signature and writing the output.

If *-accept* is specified, the model is checked for its signature.
If it is not signed, or if the signature does not match the content
of the model -- either the hash fails, or the recorded
configuration is not sufficient -- a problem is reported; otherwise
not.

The intended use of *-sign* and *-accept* is that an application
can require signed models which have passed some minimum set of
inspections. The application code can then rely on the model having
the desired properties, without having to run potentially expensive
validation checks every time a model is loaded.

*Important*. Model signing is intended to catch careless mistakes,
not for security against malicious users.

### -version

Eyeball will print its version on the standard error stream
(currently "*Eyeball 2.1 (Nova Embers)*").

### -remark

Normally Eyeball issues its report or signed model to the standard
output and exits with code 0 (success) or 1 (failure) with no
additional output. Specifying *-remark* causes it to report
*success* or *some problems reported* to standard error.

### -repair and -analyse (experimental)

These operations are not currently documented. Try them at your
peril: *-repair* may attempt to update your models.

### -render Name

The eyeball reports are written to the standard output; by default,
the reports appear as text (RDF rendered by omitting the subjects -
which are all blank nodes - and lightly prettifying the predicate
and object). To change the rendering style, supply the *-render*
option with the name of the renderer as its value. Eyeball comes
with N3, XML, and text renderers; the Eyeball config file
associates renderer names with their classes.

    -render n3
    -render rdf

### setting the proxy

If any of the data or schema are identified by an http: URL, and
you are behind a firewall, you will need specify the proxy to Java
using system properties; one way to do this is by using the Java
command line options:

        -DproxySet=true
        -DproxyHost=theProxyHostName
        -DproxyPort=theProxyPortNumber

## Inspectors shipped with Eyeball

Eyeball comes with a collection of inspectors that do relatively
simple checks.

### PropertyInspector (short name: "property")

Checks that every predicate that appears in the model is declared
in some *-assume*d schema or `owl:import`ed model -- that is, is
given `rdf:type` `rdf:Property` or some subclass of it.

### ClassInspector (short name: "presumed-class")

Checks that every resource in the model that is used as a class,
*ie* that appears as the object of an `rdf:type`, `rdfs:domain`, or
`rdfs:range` statement, or as the subject or object of an
`rdfs:subClassOf` statement, has been declared as a `Class` in the
*-assume*d schemas or in the model under test.

### URIInspector (short name: "URI")

Checks that every URI in the model is well-formed according to the
rules of the Jena IRI library. May apply additional rules specified
in the configuration file: see
[uri configuration](#uri-configuration) later for details.

### LiteralInspector (short name: "literal")

Checks literals for syntactically correct language codes,
syntactically correct datatype URIs (using the same rules as the
URIInspector), and conformance of the lexical form of typed
literals to their datatype.

### PrefixInspector (short name: "prefix")

The PrefixInspector checks that the prefix declarations of the
model have namespaces that are valid URIs and that if the prefix
name is "well-known" (`rdf`, `rdfs`, `owl`, `xsd`, and `dc`) then
the associated URI is the one usually associated with the prefix.

The PrefixInspector also reports a problem if any prefix looks like
an Jena automatically-generated prefix, `j.<i>Number</i>`. (Jena
generates these prefixes when writing RDF/XML if the XML
syntactically requires a prefix but the model hasn't defined one.)

### VocabularyInspector (short name: "vocabulary")

Checks that every URI in the model with a namespace which is
mentioned in some schema is one of the URIs declared for that
namespace -- that is, it assumes that the schemas define a closed
set of URIs.

The inspector may be configured to suppress this check for
specified namespaces: see
[vocabulary configuration](#configure-vocabulary) later.

### OwlSyntaxInspector (short name: "owl")

This inspector looks for "suspicious restrictions" which have some
of the OWL restriction properties but not exactly one
owl:onProperty and exactly one constraint (owl:allValuesFrom,
etc).

### SparqlDrivenInspector (short name: "sparql")

The SparqlDrivenInspector is configured according to
[configuring the SPARQL-driven inspector](#sparql-driven), and
applies arbitrary SPARQL queries to the model. The queries can be
required to match or prohibited from matching; a problem is
reported if the constraint fails.

### AllTypedInspector (short name: "all-typed")

Checks that all URI and bnode resources in the model have an
rdf:type property in the model or the schema(s). If there is a
statement in the configuration with property `eye:checkLiteralTypes`
and value `eye:true`, also checks that every literal has a type or
a language. *Not* in the default set of inspectors.

### ConsistentTypeInspector (short name: "consistent-type")

Checks that every subject in the model can be given a type which is
the intersection of the subclasses of all its "attached" types -- a
"consistent type".

For example, if the model contains three types `Top`, `Left`, and
`Right`, with `Left` and `Right` both being subtypes of `Top` and
with no other subclass statements, then some `S` with `rdf:type`s
`Left` and `Right` would generate this warning.

### CardinalityInspector (short name: "cardinality")

Looks for classes *C* that are subclasses of cardinality
restrictions on some property *P* with cardinality range *min* to
*max*. For any *X* of `rdf:type` *C*, it checks that the number of
values of *P* is in the range *min..max* and generates a report if
it isn't.

Literals are counted as distinct if their values (not just their
lexical form) are distinct. Resources are counted as distinct if
they have different case-sensitive URIs: the CardinalityInspector
takes no account of `owl:sameAs` statements.

### ListInspector (short name: "list")

The ListInspector performs two separate checks:

-   looks for lists that are ill-formed by having multiple or
    missing rdf:first or rdf:rest properties on their elements.
-   looks for possible mis-uses of the "typed list" idiom, and
    reports the types so defined.

The *typed list idiom* is boilerplate OWL for defining a type which
is List-of-T for some type T. It takes the form:

    my:EList a owl:Class
        ; rdfs:subClassOf rdf:List
        ; rdfs:subClassOf [owl:onProperty rdf:first; owl:allValuesFrom my:Element]
        ; rdfs:subClassOf [owl:onProperty rdf:rest; owl:allValuesFrom my:EList]
        .

The type `my:Element` is the element type of the list, and the type
`EList` is the resulting typed list. The list inspector checks that
all the subclasses of `rdf:List` (such as *EList* above) that are
also subclasses of any bnode (such as the two other superclasses of
*EList)*that has any property (*eg*, *owl:onProperty*) that has as
an object either `rdf:first` or `rdf:rest` is a subclass defined by
the full idiom above: if not, it reports it as a
`suspectListIdiom`.

## Eyeball problem reports

Eyeball generates its reports as *items* in a model. Each item has
`rdf:type` `eye:Item`, and its other properties determine what
problem report it is. The default text renderer displays a
prettified form of each item; use *-render n3* to expose the
complete report structure.

One of the item's properties is its *main property*, which
identifies the problem; the others are qualifications supplying
additional detail.

### PropertyInspector: predicate not declared

    [] eye:unknownPredicate "*URIString*".

The predicate with the given URI is not defined in any of the
*-assumed* schemas.

### ClassInspector: class not declared

    [] eye:unknownClass "*URIString*".

The resource with the given URI is used as a Class, but not defined
in any of the *-assumed* schemas.

### URIInspector: bad URI

    [] eye:badURI "*URIString*"; eye:forReason *Reason*.

The *URIString* isn't legal as a URI, or is legal but fails a
user-specified spelling constraint. *Reason* is a resource or
string identifying the reason.

reason | explanation
------ | -----------
eye:uriContainsSpaces | the URI contains unencoded spaces, probably as a result of sloppy use of file: URLs.
eye:uriFileInappropriate | a URI used as a namespace is a file: URI, which is inappropriate as a global identifier.
eye:uriHasNoScheme | a URI has no scheme field, probably a misused relative URI.
eye:schemeShouldBeLowercase | the scheme part of a URI is not lower-case; while technically correct, this is not usual practice.
eye:uriFailsPattern | a URI fails the pattern appropriate to its schema (as defined in the configuration for this eyeball).
eye:unrecognisedScheme | the URI scheme is unknown, perhaps a misplaced QName.
eye:uriNoHttpAuthority | an http: URI has no authority (domain name/port) component.
eye:uriSyntaxFailure | the URI can't be parsed using the general URI syntax, even with any spaces removed.
eye:namespaceEndsWithNameCharacter | a namespace URI ends in a character that can appear in a name, leading to possible ambiguities.
eye:uriHasNoLocalname | a URI has no local name according to the XML name-splitting rules. (For example, the URI *http://x.com/foo\#12345* has no local name because a local name cannot start with a digit.)
"did not match required pattern *Tail<sub>i</sub>* for prefix *Head*". | This badURI starts with *Head*, but the remainder doesn't match any of the *Tail<sub>i</sub>*s associated with that prefix.
"matched prohibited pattern *Tail* for prefix *Head*". | This badURI starts with *Head*, and the remainder matched a prohibited *Tail* associated with that prefix.

### LiteralInspector: illegal language code

    [] eye:badLanguage "*badCode*"; eye:onLiteral "*spelling*".

A literal with the lexical form *spelling* has the illegal language
code *badCode*.

### LiteralInspector: bad datatype URI

    [] eye:badDatatypeURI "*badURI*"; eye:onLiteral "*spelling*".

A literal with the lexical form *spelling* has the illegal datatype
URI *badURI*.

### LiteralInspector: bad lexical form

    [] eye:badLexicalForm "*spelling*"; eye:forDatatype "*dtURI*".

A literal with the datatype URI *dtURI* has the lexical form
*spelling*, which isn't legal for that datatype.

### PrefixInspector: bad namespace URI

    [] eye:badNamespaceURI "*URIString*" ; eye:onPrefix "*prefix*" ; eye:forReason *Reason*.

The namespace *URIString* for the declaration of *prefix* is
suspicious for the given *Reason* (see the URIInspector reports for
details of the possible reasons).

### PrefixInspector: Jena prefix found

    [] eye:jenaPrefixFound "*j.Digits*"; eye:forNamespace "*URIString*".

The namespace *URIString* has an automatically-generated Jena
prefix.

### PrefixInspector: multiple prefixes for namespace

    [] eye:multiplePrefixesForNamespace "*NameSpace*" ; eye:onPrefix "*prefix<sub>1</sub>"* ...

There are multiple prefix declarations for *NameSpace*, namely,
*prefix<sub>1</sub>* etc.

### VocabularyInspector: not from schema

    [] eye:notFromSchema "*NameSpace*"; eye:onResource *Resource*.

The *Resource* has a URI in the *NameSpace*, but isn't declared in
the schema associated with that *NameSpace*.

### OwlSyntaxInspector: suspicious restriction

    [] eye:suspiciousRestriction *R*; eye:forReason *Reason*...

The presumed restriction *R* is suspicious for the given
*Reason*s:

-   `eye:missingOnProperty` -- there is no `owl:onProperty`
    property in this suspicious restriction.
-   `eye:multipleOnProperty` -- there are multiple `owl:onProperty`
    properties in this suspicious restriction.
-   `eye:missingConstraint` -- there is no `owl:hasValue`,
    `owl:allValuesFrom`, `owl:someValuesFrom`, or
    `owl:[minC|maxC|c]ardinality` property in this suspicious
    restriction.
-   `eye:multipleConstraint` -- there are multiple constraints (as
    above) in this suspicious restriction.

The restriction *R* is identified by (a) supplying its immediate
properties, and (b) identifying its named equivalent classes and
subclasses.

### SparqlDrivenInspector: require failed

    [] eye:sparqlRequireFailed "*message*".

A SPARQL query that was required to succeed against the model did
not. The *message* is either the query that failed or a meaningful
description, depending on the inspector configuration.

### SparqlDrivenInspector: prohibit failed

    [] eye:sparqlProhibitFailed "*message*".

A SPARQL query that was required to fail against the model did not.
The *message* is either the query that succeeded or a meaningful
description, depending on the inspector configuration.

### AllTypedInspector: should have type

    [] eye:shouldHaveType *Resource*.

The *Resource* has no `rdf:type`. Note that when using models with
inference, this report is unlikely, since inference may well give
the resource a type even if it has no explicit type in the original
model.

### ConsistentTypeInspector: inconsistent types for resource

    [] eye:noConsistentTypeFor *URI* ; eye:hasAttachedType *TypeURI<sub>i</sub>*
    ...

The resource *URI* has been given the various types *TypeURI<sub>i</sub>*,
but if we assume that subtypes are disjoint unless otherwise
specified, these types have no intersection.

The ConsistentTypeInspector must do at least some type inference.
This release of Eyeball compromises by doing RDFS inference
augmented by (very) limited union and intersection reasoning, as
described in the Jena rules in `etc/owl-like.rules`, so its reports
must be treated with caution. Even with these restrictions, doing
type inference over a large model is costly: you may need to
suppress it with `-exclude` until any other warnings are dealt
with.

While, technically, a resource with no attached types at all is
automatically inconsistent, Eyeball quietly ignores such resources,
since they turn up quite often in simple RDF models.

### CardinalityInspector: cardinality failure

    [] eye:cardinalityFailure *Subject*; eye:onType *T*; eye:onProperty *P*

The *Subject* has a cardinality-constrained `rdf:type` *T* with
`owl:onProperty` *P*, but the number of distinct values in the
model isn't consistent with the cardinality restriction.

Additional properties describe the cardinality restriction and the
values found:

-   `eye:numValues` *N*: the number of distinct values for
    (*Subject*, *P*) in the model.
-   `eye:cardinality` [`eye:min` *min*; `eye:max` *max*]: the
    minimum and maximum cardinalities permitted.
-   `eye:values` *Set*: A blank node of type `eye:Set` with an
    `rdfs:member` value for each of the values of *P*.

### ListInspector: ill-formed list

    [] eye:illFormedList *URI* ; eye:because [eye:element *index<sub>i</sub>*; *Problem<sub>i~*]~i</sub> ...

The list starting at *URI* is ill-formed because the element with
index *index<sub>i</sub>* had *Problem<sub>i</sub>*. The possible problems are:

-   `eye:hasNoRest` -- the element has no `rdf:rest` property.
-   `eye:hasMultipleRests` -- the element has more than one
    `rdf:rest` property.
-   `eye:hasNoFirst` -- the element has no `rdf:first` property.
-   `eye:hasMultipleFirsts` -- the element has more than one
    `rdf:rest` property.

### ListInspector: suspect list idiom

    [] eye:suspectListIdiom *Type*.

The resource *Type* looks like it's supposed to be a use of the
"typed list idiom", but it isn't complete/accurate.

## Inside the Eyeball configuration file

### Configuration files

The Eyeball command-line utility is configured by files (or URLs)
specified on the command line: their RDF contents are unioned
together into a single config model. If no config file is
specified, then *etc/eyeball-config.n3* is loaded.
The configuration file is a Jena assembler description (see
[Assemblers](../assembler/index.html))
with added Eyeball vocabulary.

Eyeball is also configured by the location-mapping file
*etc/location-mapping.n3*. The Eyeball jar contains copies of both
the default config and the location mapper; these are used by
default. You can provide your own *etc/eyeball-config.n3* file
earlier on your classpath or in your current directory; this config
replaces the default. You may provide *additional* location-mapping
files earlier on your classpath or in your current directory.

### Configuring schema names

To avoid having to quote schema names in full on the Eyeball
command line, (collections of) schemas can be given short names.
    [] eye:shortName shortNameLiteral
        ; eye:schema fullSchemaURL
        ...
        .

A shortname can name several schemas. The Eyeball delivery has the
short names *rdf*, *rdfs*, *owl*, and *dc* for the corresponding
schemas (and mirror versions of those schemas so that they don't
need to be downloaded each time Eyeball is run.)

### Configuring inspectors

The inspectors that Eyeball runs over the model are specified by
*eye:inspector* properties of inspector resources. These resources
are identified by `eye:shortName`s (supplied on the command line).
Each such property value must be a plain string literal whose value
is the full name of the Inspector class to load and run; see the
Javadoc of Inspector for details.

An inspector resource may refer to other inspector resources to
include their inspectors, using either of the two properties
`eye:include` or `eye:includeByName`. The value of an `include`
property should be another inspector resource; the value of an
`includeByName` property should be the `shortName` of an inspector
resource.

### Configuring the URI inspector

As well as applying the standard URI rules, Eyeball allows extra
pattern-oriented checks to be applied to URIs. These are specified
by `eye:check` properties of the `URIInspector` object in the
configuration.

The object of an `eye:check` property is a bnode with `eye:prefix`,
`eye:prohibit`, and `eye:require` properties. The objects of these
properties must be string literals.

If a URI *U* can be split into a prefix *P* and suffix *S*, and
there is a *check* property with that prefix, and either:

-   there's a *prohibit* property and *S* matches the object of
    that property, or
-   there's a *require* property and *S* does not match the object
    of that property,

then a problem is reported. If there are multiple `prohibit`s, then
a problem is reported if *any* prohibition is violated; if there
are multiple `require`s, a problem is reported if *none* of them
succeed.

    eye:URIInspector eye:check
      [eye:prefix "urn:x-hp:"; eye:prohibit ".*:.*"]
      ; [eye:prefix "http://example.com/"; eye:require ".*eyeball.*"]

The prefixes, requires, and prohibits are treated as Java patterns.
The URI inspector can be configured to report URIs with an empty
local name. These arise because the meaning of "local name" comes
from XML, and in XML a local name must start with an NCName
character, typically a letter but not a digit. Hence URIs like
`http://example.com/productCode#1829` have an empty local name.
This is sometimes confusing.

To report empty local names, add the property
`eye:reportEmptyLocalNames` to the inspector `eye:URIInspector`
with the property value `true`. You may edit the configuration file
or use the `-set` command-line option.

### Configuring the vocabulary inspector

The vocabulary inspector defaults to assuming that schema
namespaces are closed. To disable this for specified namespaces,
the inspector object in the configuration can be given
`eye:openNamespace` properties.

The object of each of these properties must be a resource; the URI
of this resource is an open namespace for which the inspector will
not report problems.

    eye:VocabularyInspector eye:openNamespace <http://example.com/examples#>

### Configuring the SPARQL-driven inspector

The SPARQL inspector object in the configuration may be given
`eye:sparql` properties whose objects are resources specifying
SPARQL queries and problem messages.

    eye:SparqlDrivenInspector eye:sparql [...]

The resource may specify a SPARQL query which must succeed in the
model, and a message to produce if it does not.

    eye:SparqlDrivenInspector eye:sparql
      [eye:require "select * where {?s ?p ?o}"; eye:message "must be non-empty"]

If the query is non-trivial, the string may contain a reference to
a file containing the query, rather than the entire query.

    eye:require "@'/home/kers/example/query-one.sparql'"

The quoted filename is read using the Jena file manager and so
respects any filename mappings. "@" characters not followed by "'"
are not subject to substitution, except that the sequence "@@" is
replaced by "@".

Using `eye:prohibit` rather than `eye:require` means that the
problem is reported if the query succeeds, rather than if it
fails.

### Configuring renderers

The renderer class that Eyeball uses to render the report into text
is giving in the config file by triples of the form:

    []
      eye:renderer FullClassName
      ; eye:shortName ShortClassHandler

The `FullClassName` is a string literal giving the full class name
of the rendering class. That class must implement the *Renderer*
interface and have a constructor that takes a `Resource`, its
configuration root, as its argument.

The `ShortClassHandle` is a string literal giving the short name
used to refer to the class. The default short name used is
**default**. There should be no more than one *eye:shortName*
statement with the same ShortClassHandle in the configuration file,
but the same class can have many different short names.

The `TextRenderer` supports an additional property `eye:labels` to
allow the appropriate labels for an ontology to be supplied to the
renderer. Each object of a `eye:labels` statement names a model;
all the `rdfs:label` statements in that model are used to supply
strings which are used to render resources.

The model names are strings which are interpreted by Jena's
`FileManager`, so they may be redirected using Jena's file
mappings.

## Inside the Eyeball code

Eyeball can be used from within Java code; the command line merely
provides a convenient external interface.

### Creating an Eyeball

An Eyeball object has three subcomponents: the assumptions against
which the model is to be checked, the inspectors which do the
checking, and the renderer used to display the reports.

The assumptions are bundled into a single OntModel. Multiple
assumptions can be supplied either by adding them as sub-models or
by loading their content directly into the OntModel.

The inspectors are supplied as a single Inspector object. The
method `Inspector.Operations.create(List)` creates a single
Inspector from a list of Inspectors; this inspector delegates all
its inspection methods to all of its sub-inspectors.

The renderer can be anything that implements the (simple) renderer
interface.

To create an Eyeball:

    Eyeball eyeball = new Eyeball( inspector, assumptions, renderer );

### To eyeball a model

Models to be inspected are provided as OntModels. The problems are
delivered to a Report object, where they are represented as an RDF
model.

    eyeball.inspect( report, ontModelToBeInspected )

The result is that same report object. The *Report::model()* method
delivers an RDF model which describes the problems found by the
inspection. The inspections supplied in the distribution use the
EYE vocabulary, and are used in the standard reports:

Every report item in the model is a blank node with
`rdf:type eye:Item`. See earlier sections for the descriptions of
the properties attached to an Item.

## Rebuilding Eyeball

The provided ant script can be used to rebuild Eyeball from
source:

    ant clean build jar

(Omitting `clean` will do an incremental build, useful for small
changes.)

The libraries required by Eyeball are all in the `lib` directory,
including the necessary Jena jars.

## Creating and configuring an inspector

To make a new inspector available to Eyeball, a new Inspector class
must be created and that class has to be described in the Eyeball
configuration.

### Creating an Inspector

Any inspector must implement the Inspector interface, which has
four operations:

-   *begin( Report r, OntModel assume )*: Begin a new inspection.
    `r` is the `Report` object which will accept the reports in this
    inspection; `assume` is the model containing the assumed
    ontologies. `begin` is responsible for declaring this inspectors
    *report properties*.
-   *inspectModel( Report r, OntModel m )*: Do a whole-model
    inspection of `m`, issuing reports to `r`.
-   *inspectStatement( Report r, Statement s )*: Inspect the single
    statement `s`, issuing reports to `r`.
-   *end( Report r )*: Do any tidying-up reports required.

Typically `end` and one of `inspectModel` or `inspectStatement` do
nothing.

An inspector must also have a constructor that takes a `Resource`
argument. When Eyeball creates the Inspector object, it passes the
`Resource` which is the root of this inspector's configuration.
(This is, for example, how the SPARQL-driven inspector receives the
query strings to use.)

Developers may find the class `InpsectorBase` useful; it has empty
implementations for all the `Inspector` methods. They may also find
`InspectorTestBase` useful when writing their inspector's tests,
both for its convenience methods and because it requires that their
class has the appropriate constructors.

### Reports and report properties

Eyeball reports are statements in a report model. To let the
renderer know which property of a report is the "main" one, and
which order the other properties should appear in, the inspector's
`begin` method should declare the properties:

    r.declareProperty( EYE.badDatatypeURI );
    r.declareOrder( EYE.badLanguage, EYE.onLiteral );

`declareProperty(P)` announces that `P` is a report property of
this inspector. `declareOrder(F,S)` says that both `F` and `S` are
report properties, and that `F` should appear before `S` in the
rendered report.

Reports are made up of *report items*, which are the subjects of
the report properties. To create a report item, use one of
`reportItem()` or `reportItem(S)`. The second form is appropriate
when the report is attached to some statement `S` of the model
being inspected; a report renderer will attempt to display `S`.

To add the main property to a report item `R`, use
`R.addMainProperty(P,O)`; to add non-main properties, use
`R.addProperty(P,O)`.

### Configuring an inspector

To add an inspector to a configuration file, choose a URI for it
(here we're using `my:Fresh` and assuming a prefix declaration for
`my:`) and a short name (here, "fresh") and add a description to
the configuration file:

    my:Fresh a eye:Inspector
      ; eye:shortName "fresh"
      ; rdfs:label "fresh checks for my application"
      ; eye:className "full.path.to.Fresh"
      .

Replace `full.path.to.Fresh` with the full classname of your
inspector. Now you can use `Fresh` by adding *-include fresh* to
the Eyeball command line (and ensuring that the class is on your
classpath).

If you want `Fresh` to be included by default, then you must add it
as an `eye:inspector` property of the configuration root, *eg*:

    eye:eyeball a eye:Eyeball
      ; eye:inspector
        eye:PrefixInspector,    # as delivered
        my:FreshInspector,      # new inspector
        eye:URIInspector,       # as delivered
        ...
