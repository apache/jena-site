---
title: Creating Jena models
---

## Introduction

Jena is a moderately complicated system, with several
different kinds of `Model` and ways of constructing them. This note
describes the Jena `ModelFactory`, a one-stop shop for
creating Jena models. `ModelFactory` lives in Java package
`org.apache.jena.rdf.model`.

This note is an introduction, not an exhaustive description. As
usual consult the Javadoc for details of the methods and classes to
use.

## Simple model creation

The simplest way to create a model (if not the shortest) is to call
`ModelFactory.createDefaultModel()`. This [by default] delivers a
plain RDF model, stored in-memory, that does no inference and has
no special ontology interface.

## Database model creation

For methods of creating models for [TDB](/documentation/tdb/index.html)
please see the relevant reference sections.

## Inference model creation

An important feature of Jena is support for different kinds of
inference over RDF-based models (used for RDFS and OWL).
Inference models are constructed by applying *reasoners* to
*base models* and optionally *schema*. The statements deduced by
the reasoner from the base model then appear in the inferred model
alongside the statements from the base model itself.
RDFS reasoning is directly available:

- `createRDFSModel(Model base)` creates an inference model over the
base model using the built-in RDFS inference rules and any RDFS
statements in the base model.

- `createRDFSModel(Model schema, Model base)` creates an RDFS
inference model from the base model and the supplied schema model.
The advantage of supplying the schema separately is that the
reasoner may be able to compute useful information in advance on
the assumption that the schema won't change, or at least not change
as often as the base model.

It's possible to use other reasoning systems than RDFS. For these a
Reasoner is required:

- `createInfModel(Reasoner reasoner, Model base)` creates an
inference model using the rules of `reasoner` over the model
`base`.

- `createInfModel(Reasoner reasoner, Model schema, Model base)` Just
as for the RDFS case, the schema may be supplied separately to
allow the reasoner to digest them before working on the model.

From where do you fetch your reasoners? From the
*reasoner registry*, the class
[ReasonerRegistry](/documentation/javadoc/jena/org/apache/jena/reasoner/ReasonerRegistry.html).
This allows reasoners to be looked up by name, but also provides
some predefined access methods for well-know reasoners:

- `getOWLReasoner()`: the reasoner used for OWL inference

- `getRDFSReasoner()`: the reasoner used for RDFS inference

- `getTransitiveReasoner()`: a reasoner for doing subclass and
sub-property closure.

## Ontology model creation

An *ontology model* is one that presents RDF as an ontology -
classes, individuals, different kinds of properties, and so forth.
Jena supports RDFS and OWL ontologies through *profiles*.
There is extensive documentation on
[Jena's ontology support](../ontology/index.html), so all we'll do
here is summarise the creation methods.

- `createOntologyModel()` Creates an ontology model which is
in-memory and presents OWL ontologies.

- `createOntologyModel(OntModelSpec spec, Model base)` Creates an
ontology model according the
[OntModelSpec](/documentation/javadoc/jena/org/apache/jena/ontology/OntModelSpec.html)
`spec` which presents the ontology of `base`.

- `createOntologyModel(OntModelSpec spec, ModelMaker maker, Model base)`
Creates an OWL ontology model according to the `spec` over the
`base` model. If the ontology model needs to construct additional
models (for OWL imports), use the `ModelMaker` to create them. [The
previous method will construct a `MemModelMaker` for this.]

Where do `OntModelSpec`s come from? There's a cluster of
constants in the class which provide for common uses; to name but
three:
- `OntModelSpec.OWL_MEM_RDFS_INF` OWL ontologies, model stored in
memory, using RDFS entailment only

- `OntModelSpec.RDFS_MEM` RDFS ontologies, in memory, but doing no
additional inferences

- `OntModelSpec.OWL_DL_MEM_RULE_INF` OWL ontologies, in memory, with
the full OWL Lite inference

## Creating models from Assembler descriptions

A model can be built from a description of the required model.
This is documented in the
[assembler howto](../assembler/assembler-howto.html). 
Access to the
assembler system for model creation is provided by three
ModelFactory methods:

- `assembleModelFrom( Model singleRoot )`: assemble a Model from the
single Model description in `singleRoot`. If there is no such
description, or more than one, an exception is thrown. If a
description has to be selected from more than one available
candidates, consider using the methods below.

- `findAssemblerRoots( Model m )`: answer a Set of all the Resources
in `m` which are of type `ja:Model`, ie descriptions of models to
assemble. (Note that this will include sub-descriptions of embedded
models if they are present.)

- `assembleModelFrom( Resource root )`: answer a Model assembled
according to the description hanging from `root`.
Assemblers can construct other things as well as models, and the
Assembler system is user-extensible: see the howto for details.

### File-based models

The method `ModelFactory.createFileModelMaker(String)` returns a
`ModelMaker` which attaches models to filing-system files. The
`String` argument is the *fileBase*. When a file-ModelMaker opens a
file, it reads it from a file in the directory named by the
fileBase; when the model is closed (and *only* then, in the current
implementation), the contents of the model are written back to the
file.

Because the names of models in a modelMaker can be arbitrary
character strings, in particular URIs, they are translated slightly
to avoid confusion with significant characters of common filing
systems. In the current implementation,

- colon : is converted to \\_C
- slash \/ is converted to \\_S
- underbar \_ is converted to \\_U

## ModelMakers

Plain models can be given names which allows them to be "saved" and
looked up by name later. This is handled by implementations of the
interface `ModelMaker`; each `ModelMaker` produces Models of the
same kind. The simplest kind of `ModelMaker` is a memory model
maker, which you get by calling
`ModelFactory.createMemModelMaker()`. The methods you'd want to use
to start with on a ModelMaker are:

- `createModel(String)`: create a model with the given name in the
ModelMaker. If a model with that name already exists, then that
model is used instead.

- `openModel(String)`: open an existing model with the given name. If
no such model exists, create a new empty one and give it that name.
[createModel(String) and openModel(String) behave in the same way,
but each has a two-argument form for which the behaviour is
different. Use whichever one best fits your intention.]

- `createModel()`: create a fresh anonymous model.

- `getModel()`: each `ModelMaker` has a *default model*; this method
returns that model.

There are other methods, for removing models, additional control
over create *vs* open, closing the maker, and looking names up; for
those consult the
[ModelMaker JavaDoc](/documentation/javadoc/jena/org/apache/jena/rdf/model/ModelMaker.html).

## Miscellany

Finally, `ModelFactory` contains a collection of methods for some
special cases not conveniently dealt with elsewhere.

`createModelForGraph(Graph g)` is used when an advanced user with
access to the Jena SPI has constructed or obtained a `Graph` and
wishes to present it as a model. This method wraps the graph up as
a plain model. Alterations to the graph are visible in the model,
and *vice versa*.


