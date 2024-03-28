---
title: Jena Assembler howto
---

## Introduction

This document describes the vocabulary and effect of the built-in
Jena assembler descriptions for constructing models (and other
things). A [companion document](inside-assemblers.html) describes
the built-in assembler classes and how to write and integrate your
own assemblers. If you just need a quick guide to the common model
specifications, see the [assembler quickstart](index.html).

This document describes how to use the Assembler classes to
construct models -- and other things -- from RDF descriptions that
use the Jena Assembler vocabulary. That vocabulary is available in
[assembler.ttl](assembler.ttl) as an RDFS
schema with conventional prefix `ja` for the URI
`http://jena.hpl.hp.com/2005/11/Assembler#`; the class `JA` is its
Java rendition.

The examples used in this document are extracted from the examples
file [examples.ttl](examples.ttl). The pieces of RDF/OWL schema are
extracted from the `ja-vocabulary` file.

The property names selected are those which are the "declared
properties" (as per Jena's `listDeclaredProperties` method) of the
class. Only the most specialised super-classes and range classes are
shown, so (for example) `rdf:Resource` typically won't appear.

### Overview

An Assembler specification is a Resource in some RDF Model. The
properties of that Resource describe what kind of object is to be
assembled and what its components are: for example, an InfModel is
constructed by specifying a base model and a reasoner. The
specifications for the components are themselves Assembler
specifications given by other Resources in the same Model.For
example, to specify a memory model with data loaded from a file:

```turtle
eg:model a ja:MemoryModel
    ; ja:content [ja:externalContent <file:////home/kers/projects/jena2/doc/assembler/Data/example.n3>]
    .
```

The `rdf:type` of `eg:model` specifies that the constructed Model is to
be a Jena memory-based model. The `ja:content` property specifies
that the model is to be loaded with the content of the resource
`file:Data/example.n3`. The content handler guesses from the ".n3"
suffix that this file is to be read using the Jena N3 reader.

Unless otherwise specified by an application, Assembler
specifications are interpreted after *completion* by

1.  including the JA schema,
2.  including (recursively) the objects of any owl:imports and
    ja:imports statements, and
3.  doing [(limited) RDFS inference](#limited-rdfs-inference).

(The supplied model is not modified.) In the example above,
`eg:model` has to be given an explicit type, but the `ja:externalContent`
bnode is implicitly typed by the domain of `ja:externalContent`. In
this document, we will usually leave out inferrable types.

We can construct our example model from the specification like this
(you may need to tweak the filename to make this work in your
environment):

```java
Model spec = RDFDataMgr.loadModel( "examples.ttl" );
Resource root = spec.createResource( spec.expandPrefix( "eg:opening-example" ) );
Model m = Assembler.general.openModel( root );
```

The model is constructed from the "root resource",
`eg:opening-example` in our example. `general` knows how to create
all the kinds of objects - not just Models - that we describe in
the next sections.

## Specifications common to all models

Assembler specifications can describe many kinds of models: memory,
inference, ontology, and file-backed. All of these model
specifications share a set of base properties for attaching
content and prefix mappings.

```turtle
ja:Loadable a rdfs:Class ;
  rdfs:subClassOf ja:Object
.
ja:initialContent a rdf:Property ;
  rdfs:domain ja:Loadable
  rdfs:range ja:Content
.
ja:content a rdf:Property ;
  rdfs:domain ja:Loadable ;
  rdfs:range ja:Content
.

ja:Model a rdfs:Class ;
  rdfs:subClassOf ja:ContentItem ;
  rdfs:subClassOf ja:Loadable
.

ja:prefixMapping a rdf:Property ;
  rdfs:domain ja:Model ;
  rdfs:range ja:PrefixMapping
.
```

All of a model's `ja:content` property values are interpreted as
specifying `Content` objects and a single composite `Content`
object is constructed and used to initialise the model. See
[Content](#content-specification) for the description of Content
specifications. For example:

```turtle
eg:sharedContent
    ja:externalContent <http://somewhere/RDF/ont.owl>
    .
eg:common-example a ja:MemoryModel ;
      ja:content eg:sharedContent ;
      ja:content [ja:externalContent <file:////home/kers/projects/jena2/doc/assembler/Data/A.rdf>] ;
      ja:content [ja:externalContent <file:////home/kers/projects/jena2/doc/assembler/Data/B.rdf>]
    .
```

The model constructed for `eg:A` will be loaded with the contents
of `Data/A.n3`, `Data/B.rdf`, and `http://somewhere/RDF/ont.owl`.
If the model supports transactions, then the content is loaded
inside a transaction; if the load fails, the transaction is
aborted, and a `TransactionAbortedException` thrown. If the content
has any prefix mappings, then they are also added to the model.

All of a model's `ja:prefixMapping`, `ja:prefix`, and
`ja:namespace` properties are interpreted as specifying a
`PrefixMapping` object and a single composite `PrefixMapping` is
constructed and used to set the prefixes of the model. See
[PrefixMapping](#prefix-mappings) for the description of
Content specifications.

### Content specification

A Content specification describes content that can be used to fill
models. Content can be external (files and URLs) or literal
(strings in the specification) or quotations (referring to RDF
which is part of the specification).

```turtle
ja:Content a rdfs:Class ;
  rdfs:subClassOf ja:HasFileManager
.

ja:HasFileManager a rdfs:Class ;
  rdfs:subClassOf ja:Object
.
ja:fileManager a rdf:Property ;
  rdfs:domain ja:HasFileManager ;
  rdfs:range ja:FileManager
.
```

A `ja:Content` specification may have zero or more
`ja:externalContent` property values. These are URI resources
naming an external (file or http etc) RDF object. The constructed
Content object contains the union of the values of all such
resources. For example:

```turtle
eg:external-content-example
    ja:externalContent <file:////home/kers/projects/jena2/doc/assembler/Data/C.owl>,
                       <http://jena.hpl.hp.com/some-jena-data.rdf>
    .
```

The external content is located using a `FileManager`. If the
`Content` resource has a `ja:fileManager` property, then the
`FileManager` described by that resource is used. Otherwise, if the
`ContentAssembler` assembling this specification was constructed
with a `FileManager` argument, that `FileManager` is used.
Otherwise, the default `FileManager`, `FileManager.get()`, is
used.

The string literal value of the any `ja:literalContent` properties
is interpreted as RDF in an appropriate language. The constructed
Content object contains that RDF. The language is either specified
by an explicit `ja:contentEncoding` property value, or guessed from
the content of the string. The only encodings permitted are "N3"
and "RDF/XML". For example:

```turtle
eg:literal-content-example
    ja:literalContent "_:it dc:title 'Interesting Times'"
    .
```

The literal content is wrapped so that prefix declarations for
**rdf**, **rdfs**, **owl**, **dc**, and **xsd** apply before
interpretation.

The property values of any `ja:quotedContent` properties should be
resources. The subgraphs rooted at those resources (using the
algorithm from `ResourceUtils.reachableClosure()`) are added to the
content.

### Inference models and reasoners

Inference models are specified by supplying a description of the
reasoner that is used by the model and (optionally) a base model to
reason over. For example:

```turtle
eg:inference-example
    ja:baseModel [a ja:MemoryModel] ;
      ja:reasoner [ja:reasonerURL <http://jena.hpl.hp.com/2003/RDFSExptRuleReasoner>]
    .
```

describes an inference model that uses RDFS reasoning. The
*reasonerURL* property value is the URI used to identify the
reasoner (it is the value of the Jena constant
`RDFSRuleReasonerFactory.URI`). The base model is specified as a
memory model; if it is left out, an empty memory model is used.

```turtle
eg:db-inference-example
    ja:baseModel eg:model-example ;
    ja:reasoner [ja:reasonerURL <http://jena.hpl.hp.com/2003/RDFSExptRuleReasoner>]
    .
```

The same reasoner as used as in the previous example, but now the
base model is a specific model description in the same way as our earlier
example.

Because Jena's access to external reasoners goes through the same
API as for its internal reasoners, you can access a DIG reasoner
(such as Pellet running as a server) using an Assembler
specification:

```turtle
eg:external-inference-example
    ja:reasoner [<http://jena.hpl.hp.com/2003/JenaReasoner#extReasonerURL>
                   <http://localhost:2004/> ;
                 ja:reasonerURL <http://jena.hpl.hp.com/2003/DIGReasoner>]
    .
```

If there's a DIG server running locally on port 2004, this
specification will create a DIG inference model that uses it.

The internal rule reasoner can be supplied with rules written
inside the specification, or outside from some resource (file or
http: URL):
    eg:rule-inference-example
        ja:reasoner [ja:rule "[r1: (?x my:P ?y) -> (?x rdf:type my:T)]"]
        .

This reasoner will infer a type declaration from a use of a
property. (The prefix *my* will have to be known to the rule
parser, of course.)

```turtle
ja:InfModel a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:reasoner; owl:maxCardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:baseModel; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:Model
.
ja:reasoner a rdf:Property ;
  rdfs:domain ja:InfModel ;
  rdfs:range ja:ReasonerFactory
.
ja:baseModel a rdf:Property ;
  rdfs:domain ja:InfModel ;
  rdfs:range ja:Model
.

ja:HasRules a rdfs:Class ;
  rdfs:subClassOf ja:Object
.
ja:rule a rdf:Property ;
  rdfs:domain ja:HasRules
.
ja:rulesFrom a rdf:Property ;
  rdfs:domain ja:HasRules
.
ja:rules a rdf:Property ;
  rdfs:domain ja:HasRules ;
  rdfs:range ja:RuleSet
.
```

An InfModel's `ja:baseModel` property value specifies the base
model for the inference model; if omitted, an empty memory model is
used.

An InfModel's `ja:ReasonerFactory` property value specifies the
Reasoner for this inference model; if omitted, a
GenericRuleReasoner is used.

A Reasoner's optional `ja:schema` property specifies a Model which
contains the schema for the reasoner to be bound to. If omitted, no
schema is used.

If the Reasoner is a GenericRuleReasoner, it may have any of the
RuleSet properties `ja:rules`, `ja:rulesFrom`, or `ja:rule`. The
rules of the implied `RuleSet` are added to the `Reasoner`.

#### ReasonerFactory

A ReasonerFactory can be specified by URL or by class name (but not
both).

```turtle
ja:ReasonerFactory a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:ReasonerURL; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:HasRules
.
ja:reasonerClass a rdf:Property ;
  rdfs:domain ja:ReasonerFactory
.
ja:reasonerURL a rdf:Property ;
  rdfs:domain ja:ReasonerFactory
.
ja:schema a rdf:Property ;
  rdfs:domain ja:ReasonerFactory ;
  rdfs:range ja:Model
.
```

If the optional unique property `ja:reasonerURL` is specified, then
its resource value is the URI of a reasoner in the Jena reasoner
registry; the reasoner is the one with the given URI.

If the optional property `ja:schema` is specified, then the models
specified by all the schema properties are unioned and any reasoner
produced by the factory will have that union bound in as its schema
(using the `Reasoner::bindSchema()` method).

If the optional unique property `ja:reasonerClass` is specified,
its value names a class which implements `ReasonerFactory`. That
class is loaded and an instance of it used as the factory.

The class may be named by the lexical form of a literal, or by a
URI with the (fake) "java:" scheme.

If the class has a method `theInstance`, that method is called to
supply the `ReasonerFactory` instance to use. Otherwise, a new
instance of that class is constructed. Jena's reasoner factories
come equipped with this method; for other factories, see the
documentation.

#### Rulesets

A `RuleSet` specification allows rules (for ReasonerFactories) to
be specified inline, elsewhere in the specification model, or in an
external resource.

```turtle
ja:RuleSet a rdfs:Class ;
  rdfs:subClassOf ja:HasRules
.
```

The optional repeatable property `ja:rule` has as its value a
literal string which is the text of a Jena rule or rules. All those
rules are added to the `RuleSet`.

The optional repeatable property `ja:rulesFrom` has as its value a
resource whose URI identifies a file or other external entity that
can be loaded as Jena rules. All those rules are added to the
`RuleSet`.

The optional repeatable property `ja:rules` has as its value a
resource which identifies another `RuleSet` in the specification
model. All those rules from that `RuleSet` are added to this
`RuleSet`.

### Ontology models

Ontology models can be specified in several ways. The simplest is
to use the name of an OntModelSpec from the Java OntModelSpec
class:

```turtle
eg:simple-ont-example
    ja:ontModelSpec ja:OWL_DL_MEM_RULE_INF
    .
```

This constructs an `OntModel` with an empty base model and using
the OWL_DL language and the full rule reasoner. All of the
OntModelSpec constants in the Jena implementation are available in
this way. A base model can be specified:

```turtle
eg:base-ont-example
    ja:baseModel [a ja:MemoryModel ;
                 ja:content [ja:externalContent <http://jena.hpl.hp.com/some-jena-data.rdf>]]
    .
```

The OntModel has a base which is a memory model loaded with the
contents of `http://jena.hpl.hp.com/some-jena-data.rdf`. Since the
ontModelSpec was omitted, it defaults to `OWL_MEM_RDFS_INF` - the
same default as `ModelFactory.createOntologyModel()`.

```turtle
ja:OntModel a rdfs:Class ;
  rdfs:subClassOf ja:UnionModel ;
  rdfs:subClassOf ja:InfModel
.
ja:ontModelSpec a rdf:Property ;
  rdfs:domain ja:OntModel ;
  rdfs:range ja:OntModelSpec
.

ja:OntModelSpec a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:like; owl:maxCardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:reasonerFactory; owl:maxCardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:importSource; owl:maxCardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:documentManager; owl:maxCardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:ontLanguage; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:Object
.
ja:importSource a rdf:Property ;
  rdfs:domain ja:OntModelSpec
.
ja:reasonerFactory a rdf:Property ;
  rdfs:domain ja:OntModelSpec ;
  rdfs:range ja:ReasonerFactory
.
ja:documentManager a rdf:Property ;
  rdfs:domain ja:OntModelSpec
.
ja:ontLanguage a rdf:Property ;
  rdfs:domain ja:OntModelSpec
.
ja:likeBuiltinSpec a rdf:Property ;
  rdfs:domain ja:OntModelSpec
.
```

`OntModel` is a subclass of `InfModel`, and the `ja:baseModel`
property means the same thing.

The `OntModelSpec` property value is a resource, interpreted as an
OntModelSpec description based on its name and the value of the
appropriate properties:

* `ja:likeBuiltinSpec`: The value of this optional unique
    property must be a JA resource whose local name is the same as the
    name of an OntModelSpec constant (as in the simple case above).
    This is the basis for the OntModelSpec constructed from this
    specification. If absent, then `OWL_MEM_RDFS_INF` is used. To build
    an OntModelSpec with no inference, use eg
    `ja:likeBuiltinSpec ja:OWL_MEM`.
* `ja:importSource`: The value of this optional unique property
    is a `ModelSource` description which describes where imports are
    obtained from. A `ModelSource` is usually of class `ja:ModelSource`.
* `ja:documentManager`: This value of this optional unique
    property is a DocumentManager specification. If absent, the default
    document manager is used.
* `ja:reasonerFactory`: The value of this optional unique
    property is the ReasonerFactory resource which will be used to
    construct this OntModelSpec's reasoner. A `reasonerFactory`
    specification is the same as an InfModel's `reasoner` specification
    (the different properties are required for technical reasons).
* `ja:reasonerURL`: as a special case of `reasonerFactory`, a
    reasoner may be specified by giving its URL as the object of the
    optional unique `reasonerURL` property. It is not permitted to
    supply both a `reasonerURL` and `reasonerFactory` properties.
* `ja:ontLanguage`: The value of this optional unique property is
    one of the values in the `ProfileRegistry` class which identifies
    the ontology language of this `OntModelSpec`:
    * OWL: http://www.w3.org/2002/07/owl\#
    * OWL DL: http://www.w3.org/TR/owl-features/\#term_OWLDL
    * OWL Lite: http://www.w3.org/TR/owl-features/\#term_OWLLite
    *  RDFS: http://www.w3.org/2000/01/rdf-schema\#

Any unspecified properties have default values, normally taken from
those of `OntModelSpec.OWL_MEM_RDFS_INF`. However, if the
OntModelSpec resource is in the JA namespace, and its local name is
the same as that of an OntModelSpec constant, then that constant is
used as the default value.

### Document managers

An `OntDocumentManager` can be specified by a `ja:DocumentManager`
specification which describes the `OntDocumentManager`'s file
manager and policy settings.

```turtle
eg:mapper
    lm:mapping [lm:altName "file:etc/foo.n3" ;
    lm:name "file:foo.n3"]
    .
eg:document-manager-example
    ja:fileManager [ja:locationMapper eg:mapper] ;
    ja:meta [ dm:altURL <http://localhost/RDF/my-alt.rdf>]
    .
```

In this example, `eg:document-manager-example` is a
`ja:DocumentManager` specification. It has its own
`FileManager specification`, the object of the
`ja:fileManager property`; that `FileManager` has a location
mapper, `eg:mapper`, that maps a single filename.

The document manager also has an additional property to link it to
document manager meta-data: the sub-model of the assembler
specification reachable from `eg:document-manager-example` is
passed to the document manager when it is created. For the meanings
of the `dm:` properties, see the Jena ontology documentation and
the `ontology.rdf` ontology.

```turtle
    ja:DocumentManager a rdfs:Class ;
      rdfs:subClassOf [owl:onProperty ja:policyPath; owl:maxCardinality 1] ;
      rdfs:subClassOf [owl:onProperty ja:fileManager; owl:maxCardinality 1] ;
      rdfs:subClassOf [owl:onProperty ja:fileManager; owl:maxCardinality 1] ;
      rdfs:subClassOf ja:HasFileManager
    .
    ja:policyPath a rdf:Property ;
      rdfs:domain ja:DocumentManager
    .
```

The `ja:fileManager` property value, if present, has as its object
a `ja:FileManager` specification; the constructed document manager
is given a new file manager constructed from that specification. If
there is no `ja:fileManager` property, then the default
`FileManager` is used.

The `ja:policyPath` property value, if present, should be a string
which is a path to policy files as described in the Jena ontology
documentation. If absent, the usual default path is applied.

If the sub-model of the assembler specification reachable from the
DocumentManager resource contains any OntDocumentManager
`DOC_MGR_POLICY` or `ONTOLOGY_SPEC` objects, they will be
interpreted by the constructed document manager object.

```turtle
ja:FileManager a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:locationMapper; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:Object
.
ja:locationMapper a rdf:Property ;
  rdfs:domain ja:FileManager ;
  rdfs:range ja:LocationMapper
.
```

A `ja:FileManager` object may have a `ja:locationMapper` property
value which identifies the specification of a `LocationMapper`
object initialising that file manager.

```turtle
ja:LocationMapper a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty lm:mapping; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:Object
.
lm:mapping a rdf:Property ;
  rdfs:domain ja:LocationMapper
.
```

A `ja:LocationMapper` object may have `lm:mapping` property values,
describing the location mapping, as described in the FileManager
documentation. (Note that the vocabulary for those items is in a
different namespace than the JA properties and classes.)

### Union models

Union models can be constructed from any number of sub-models and a
single *root* model. The root model is the one written to when the
union model is updated; the sub-models are untouched.

```turtle
ja:UnionModel a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:rootModel; owl:maxCardinality 1] ;
  rdfs:subClassOf ja:Model
.
ja:rootModel a rdf:Property ;
  rdfs:domain ja:UnionModel ;
  rdfs:range ja:Model
.
ja:subModel a rdf:Property ;
  rdfs:domain ja:UnionModel ;
  rdfs:range ja:Model
.
```

If the single `ja:rootModel` property is present, its value
describes a model to use as the root model of the union. All
updates to the union are directed to this root model. If no root
model is supplied, the union is given an *immutable*, *empty* model
as its root.

Any `ja:subModel` property values have objects describing the
remaining sub-models of the union. The order of the sub-models in
the union is *undefined* (which is why there's a special rootModel
property).

### Prefix mappings

The PrefixMappings of a model may be set from PrefixMapping
specifications.

```turtle
ja:PrefixMapping a rdfs:Class ;
  rdfs:subClassOf ja:Object
.
ja:includes a rdf:Property ;
  rdfs:domain ja:PrefixMapping ;
  rdfs:range ja:PrefixMapping
.

ja:SinglePrefixMapping a rdfs:Class ;
  rdfs:subClassOf [owl:onProperty ja:namespace; owl:cardinality 1] ;
  rdfs:subClassOf [owl:onProperty ja:prefix; owl:cardinality 1] ;
  rdfs:subClassOf ja:PrefixMapping
.
ja:namespace a rdf:Property ;
  rdfs:domain ja:SinglePrefixMapping
.
ja:prefix a rdf:Property ;
  rdfs:domain ja:SinglePrefixMapping
.
```

The `ja:includes` property allows a PrefixMapping to include the
content of other specified PrefixMappings.

The `ja:prefix` and `ja:namespace` properties allow the
construction of a single element of a prefix mapping by specifying
the prefix and namespace of the mapping.

### Other Assembler directives

There are two more `Assembler` directives that can be used in an
Assembler specification: the *assembler* and *imports* directives.

#### Assembler

A specification may contain statements of the form:

```turtle
someResource ja:assembler "some.Assembler.class.name"
```

When `someResource` is used as the type of a root object, the
AssemblerGroup that processes the description will use an instance
of the Java class named by the object of the statement. That class
must implement the `Assembler` interface. See
[loading assembler classes](inside-assemblers.html#loading-assembler-classes) for more
details.

Similarly, statements of the form:

```turtle
someResource ja:loadClass "some.class.name"
```

will cause the named class to be loaded (but not treated as
assemblers).

#### Imports

If a specification contains statements of the form:

```turtle
anyResource owl:imports someURL
```

or, equivalently,

```turtle
anyResource ja:imports someURL
```

then the specification is regarded as also containing the contents
of the RDF at `someURL`. That RDF may in turn contain `imports`
referring to other RDF.

## Limited RDFS inference

The Assembler engine uses limited RDFS inference to complete the
model it is given, so that the spec-writer does not need to write
excessive and redundant RDF. (It does not use the usual Jena
reasoners because this limited once-off reasoning has been faster.)
The inference steps are:

* add all the classes from the JA schema.
* do subclass closure over all the classes.
* do domain and range inference.
* do simple intersection inference: if X is an instance of
    *intersection A B C ...*, then X is an instance of A, B, C ... (and
    their supertypes).

This is sufficient for closed-world assembling. Other parts of the
`JA` schema -- eg, cardinality constraints -- are hard-coded into the
individual assemblers.
