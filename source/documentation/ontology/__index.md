---
title: Jena Ontology API
slug: index
---

This section is a general introduction to the Jena
ontology API, including some of the common tasks you may need
to perform. We
won't go into all of the many details of the API here: you should
expect to refer to the [Javadoc](/documentation/javadoc/jena/) to
get full details of the capabilities of the API.

_Please note that this section covers the new Jena ontology API, which has been introduced since Jena 5.1.0.
The legacy Jena Ontology API documentation can be found [here](legacy.html)._

### Prerequisites

We'll assume that you have a basic familiarity with RDF and with
Jena. If not, there are other
[Jena help documents](/getting_started) you can read for background
on these topics, and a [collection of tutorials](/tutorials).

Jena is a programming toolkit, using the Java programming language.
While there are a few command-line tools to help you perform some
key tasks using Jena, mostly you use Jena by writing Java programs.
The examples in this document will be primarily code samples.

We also won't be explaining the OWL or RDFS ontology languages in
much detail in this document. You should refer to
supporting documentation for details on those languages, for
example the [W3C OWL document index](http://www.w3.org/2004/OWL/).

## Overview

The section of the manual is broken into a number of sections. You
do not need to read them in sequence, though later sections may
refer to concepts and techniques introduced in earlier sections.
The sections are:

- [General concepts](#general-concepts)
- [Running example: the ESWC ontology](#running-example-the-eswc-ontology)
- [Creating ontology models](#creating-ontology-models)
- [Compound ontology documents and imports processing](#compound-ontology-documents-and-imports-processing)
- [The generic ontology type: OntResource](#the-generic-ontology-type-ontresource)
- [Ontology classes and basic class expressions](#ontology-classes-and-basic-class-expressions)
- [Ontology properties](#ontology-properties)
- [More complex class expressions](#more-complex-class-expressions)
- [Instances or individuals](#instances-or-individuals)
- [Ontology meta-data](#ontology-meta-data)
- [Ontology inference: overview](#ontology-inference-overview)
- [Working with persistent ontologies](#working-with-persistent-ontologies)
- [Experimental ontology tools](#experimental-ontology-tools)

### Further assistance

Hopefully, this document will be sufficient to help most readers
to get started using the Jena ontology API. For further support,
please post questions to the [Jena support list](/help_and_support),
or [file a bug report](/help_and_support/bugs_and_suggestions.html).

*Please note that we ask that you use the support list or the bug-tracker
to communicate with the Jena team, rather than send email to the team
members directly. This helps us manage Jena support more effectively,
and facilitates contributions from other Jena community members.*

## General concepts

In a widely-quoted definition, an ontology is

> "a specification of a conceptualization"
> [[Gruber, T.](https://web.archive.org/web/20160126114515/http://www-ksl.stanford.edu/kst/what-is-an-ontology.html) 1993]

Let's unpack that brief characterisation a bit. An
ontology allows a programmer to specify, in an open, meaningful,
way, the concepts and relationships that collectively characterise
some domain of interest. Examples might be the concepts of red and white wine,
grape varieties, vintage years, wineries and so forth that
characterise the domain of 'wine', and relationships such as
'wineries produce wines', 'wines have a year of production'. This
*wine ontology* might be developed initially for a particular
application, such as a stock-control system at a wine warehouse. As
such, it may be considered similar to a well-defined database
schema. The advantage to an ontology is that it is an explicit,
first-class description. So having been developed for one purpose,
it can be published and reused for other purposes. For example, a
given winery may use the wine ontology to link its production
schedule to the stock system at the wine warehouse. Alternatively,
a wine recommendation program may use the wine ontology, and a
description (ontology) of different dishes to recommend wines for a
given menu.

There are many ways of writing down an ontology, and a variety of
opinions as to what kinds of definition should go in one. In
practice, the contents of an ontology are largely driven by the
kinds of application it will be used to support. In Jena, we do not
take a particular view on the minimal or necessary components of an
ontology. Rather, we try to support a variety of common techniques.
In this section, we try to explain what is &ndash; and to some extent what
isn't &ndash; possible using Jena's ontology support.

Since Jena is fundamentally an RDF platform, Jena's ontology
support is limited to ontology formalisms built on top of RDF.
Specifically this means [RDFS](http://en.wikipedia.org/wiki/RDFS),
the varieties of
[OWL](http://en.wikipedia.org/wiki/Web_Ontology_Language).
We will provide a very brief introduction to these languages here,
but please refer to the extensive on-line documentation for these
formalisms for complete and authoritative details.

### RDFS

RDFS is the weakest ontology language supported by Jena. RDFS
allows the ontologist to build a simple hierarchy of concepts, and
a hierarchy of properties. Consider the following trivial
characterisation (with apologies to biology-trained readers!):

![image of simple class hierarchy](simple-hierarchy.png "Table 1: A simple concept hierarchy")
<br />Table 1: A simple concept hierarchy

Using RDFS, we can say that my ontology has five *classes*, and that
`Plant` is a *sub-class of* `Organism` and so on. So every animal
is also an organism. A good way to think of these classes is as
describing sets of *individuals*: organism is intended to describe
a set of living things, some of which are animals (i.e. a sub-set
of the set of organisms is the set of animals), and some animals
are fish (a subset of the set of all animals is the set of all
fish).

To describe the attributes of these classes, we can associate
*properties* with the classes. For example, animals have sensory
organs (noses, eyes, etc.). A general property of an animal might
be `senseOrgan`, to denote any given sensory organs a particular
animal has. In general, fish have eyes, so a fish might have a
`eyes` property to refer to a description of the particular eye
structure of some species. Since eyes are a type of sensory organ,
we can capture this relationship between these properties by saying
that `eye` is a sub-property-of `senseOrgan`. Thus if a given fish
has two eyes, it also has two sense organs. (It may have more, but
we know that it must have two).

We can describe this simple hierarchy with RDFS. In general, the
class hierarchy is a graph rather than a tree (i.e. not like Java
class inheritance). The
[slime mold](http://en.wikipedia.org/wiki/Slime_mold) is popularly,
though perhaps not accurately, thought of as an organism that has
characteristics of both plants and animals. We might model a slime
mold in our ontology as a class that has both plant and animal
classes among its super-classes. RDFS is too weak a language to
express the constraint that a thing cannot be both a plant and an animal (which is
perhaps lucky for the slime molds). In RDFS, we can only name the
classes, we cannot construct expressions to describe interesting
classes. However, for many applications it is sufficient to state
the basic vocabulary, and RDFS is perfectly well suited to this.

Note also that we can both describe classes, in general terms, and we
can describe particular *instances* of those classes. So there may
be a particular individual Fred who is a Fish (i.e. has
`rdf:type Fish`), and who has two eyes. Their companion Freda, a
[Mexican Tetra](http://en.wikipedia.org/wiki/Mexican_tetra), or
blind cave fish, has no eyes. One use of an ontology is to allow us
to fill-in missing information about individuals. Thus, though it
is not stated directly, we can deduce that Fred is also an Animal
and an Organism. Assume that there was no `rdf:type` asserting that
Freda is a Fish. We may still infer Freda's `rdf:type` since Freda
has [lateral lines](http://en.wikipedia.org/wiki/Lateral_line) as
sense organs, and these only occur in fish. In RDFS, we state that
the *domain* of the `lateralLines` property is the `Fish` class, so
an RDFS reasoner can infer that Freda must be a fish.

### OWL

In general, OWL allows us to say everything that RDFS allows, and
much more besides. A key part of OWL is the ability to describe
classes in more interesting and complex ways. For example, in OWL
we can say that Plant and Animal are *disjoint classes*: no
individual can be both a plant and an animal (which would have the
unfortunate consequence of making `SlimeMold` an empty class).
`SaltwaterFish` might be the *intersection* of `Fish` and the class
`SeaDwellers` (which also includes, for example, cetaceans and sea
plants).

Suppose we have a property `covering`, intended to represent the
scales of a fish or the fur of a mammal. We can now refine the
mammal class to be 'animals that have a covering that is hair',
using a *property restriction* to express the condition that
property `covering` has a value from the class `Hair`. Similarly
`TropicalFish` might be the intersection of the class of `Fish` and
the class of things that have `TropicalOcean` as their habitat.

Finally (for this brief overview), we can say more about properties
in OWL. In RDFS, properties can be related via a property
hierarchy. OWL extends this by allowing properties to be denoted as
*transitive*, *symmetric* or *functional*, and allow one property
to be declared to be the *inverse* of another. OWL also makes a
distinction between properties that have individuals (RDF resources)
as their range and properties that have data-values (known as
*literals* in RDF terminology) as their range.
Respectively these are *object properties* and *datatype properties*.
One consequence of the RDF lineage of OWL is
that OWL ontologies cannot make statements about literal values. We
cannot say in RDF that `seven` has the property of being a prime number.
We can, of course, say that the class of primes includes seven, doing so
doesn't require a number to be the subject of an RDF statement. In
OWL, this distinction is important: only object properties can
be transitive or symmetric.

The OWL language is sub-divided into several syntax classes:
*OWL2 Full*, *OWL2 DL*, *OWL2 RL*, *OWL2 EL*, *OWL2 QL*,
and also *OWL1 Lite*, *OWL1 DL* and *OWL1 Full*.
The last three are deprecated now.
OWL2 EL, OWL2 QL and OWL2 RL do not permit some constructions allowed in OWL2 Full and OWL2 DL.
Although OWL1 is deprecated, Jena Ontology API still supports it.
The intent for OWL2 RL, EL, QL, and also OWL1 Lite and OWL1 DL,
is to make the task of reasoning with expressions in that subset more tractable.
Specifically, OWL (1 & 2) DL is intended to be able to be processed efficiently by a
[*description logic*](http://en.wikipedia.org/wiki/Description_logic)
reasoner. OWL1 Lite is intended to be amenable to processing by a
variety of reasonably simple inference algorithms, though experts
in the field have challenged how successfully this has been
achieved.
[OWL 2 EL](https://www.w3.org/TR/owl2-profiles/#OWL_2_EL) is particularly useful in
applications employing ontologies that contain very large numbers of properties and/or classes.
The EL acronym reflects the profile's basis in the EL family of description logics,
logics that provide only Existential quantification.
[OWL 2 QL](https://www.w3.org/TR/owl2-profiles/#OWL_2_QL) is aimed at applications that
use very large volumes of instance data, and where query answering is
the most important reasoning task.
The QL acronym reflects the fact that query answering in this profile
can be implemented by rewriting queries into a standard relational Query Language.
[OWL 2 RL](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL) is aimed at applications that
require scalable reasoning without sacrificing too much expressive power.
The RL acronym reflects the fact that reasoning in this profile can be implemented using a standard Rule Language.

While the OWL standards documents note that OWL builds on top of
the (revised) RDF specifications, it is possible to treat OWL as a
separate language in its own right, and not something that is built
on an RDF foundation. This view uses RDF as a serialisation syntax;
the RDF-centric view treats RDF triples as the core of the OWL
formalism. While both views are valid, in Jena we take the
RDF-centric view.

### Ontology languages and the Jena Ontology API

As we outlined above, there are various different ontology languages
available for representing ontology information on the semantic
web. They range from the most expressive, OWL Full, through to the
weakest, RDFS. Through the Ontology API, Jena aims to provide a
consistent programming interface for ontology application
development, independent of which ontology language you are using
in your programs.

The Jena Ontology API is language-neutral: the Java class names are not
specific to the underlying language. For example, the `OntClass`
Java class can represent an OWL class or RDFS class.
To represent the differences between the various representations,
each of the ontology languages has a *specification*, which lists the
permitted constructs and the names of the classes and properties.

Thus in the OWL profile is it `owl:ObjectProperty` (short for
`http://www.w3.org/2002/07/owl#ObjectProperty`) and in the RDFS
attempt to get an object property will cause an error 
and search for all object properties will return empty java `Stream`.

The specification is bound to an *ontology model*, which is an extended
version of Jena's
[`Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Model.html) class.
The base `Model` allows access to the statements in a collection of
RDF data.
[`OntModel`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntModel.html)
extends this by adding support for the kinds of constructs expected to
be in an ontology: classes (in a class hierarchy), properties (in a
property hierarchy) and individuals.

When you're working with an
ontology in Jena, all of the state information remains encoded as
RDF triples (accessed as Jena
[`Statement`s](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Statement.html)) stored in the RDF
model. The ontology API
doesn't change the RDF representation of ontologies. What it does
do is add a set of convenience classes and methods that make it
easier for you to write programs that manipulate the underlying RDF
triples.

The predicate names defined in the ontology language correspond to
the accessor methods on the Java classes in the API. For example,
an `OntClass` has a method to list its super-classes, which
corresponds to the values of the `subClassOf` property in the RDF
representation. This point is worth re-emphasising: no information
is stored in the `OntClass` object itself. When you call the
OntClass `superClasses()` method, Jena will retrieve the
information from the underlying RDF triples. Similarly, adding a
subclass to an `OntClass` asserts an additional RDF triple, typically
with predicate `rdfs:subClassOf` into
the model.

### Ontologies and reasoning

One of the key benefits of building an ontology-based application
is using a reasoner to derive additional truths about the concepts
you are modelling. We saw a simple instance of this above: the
assertion "Fred is a Fish" *entails* the deduction "Fred is an
Animal". There are many different styles of automated reasoner, and
very many different reasoning algorithms. Jena includes support for
a variety of reasoners through the
[inference API](../inference).

A common feature of Jena
reasoners is that they create a new RDF model which appears to
contain the triples that are derived from reasoning as well as the
triples that were asserted in the base model. This extended model
nevertheless still conforms to the contract for Jena models.
It can be used wherever a non-inference model can be used. The ontology
API exploits this feature: the convenience methods provide by the ontology API
can query an extended inference model in just the same way
that they can a plain RDF model. In fact, this is such a common pattern that
we provide simple recipes for constructing ontology models whose
language, storage model and reasoning engine can all be simply
specified when an `OntModel` is created. We'll show examples shortly.

Figure 2 shows one way of visualising this:

![image of layering of graphs in model](ont-model-layers.png "Figure 2: the statements seen by the OntModel")

`Graph` is an internal Jena interface that supports the composition
of sets of RDF triples. The asserted statements, which may have
been read in from an ontology document, are held in the base graph.
The reasoner, or inference engine, can use the contents of the base
graph and the semantic rules of the language to show a more
complete set of base and entailed triples. This is also presented via a `Graph`
interface, so the `OntModel` works only with the outermost interface.
This regularity allows us to very easily build ontology models with
or without a reasoner. It also means that the base graph can be an
in-memory store, a database-backed persistent store, or some other
storage structure altogether &ndash; e.g. an LDAP directory &ndash; again without
affecting the operation of the ontology model (but noting that these
different approaches may have very different efficiency profiles).

### RDF-level polymorphism and Java

Deciding which Java abstract class to use to represent a given RDF
resource can be surprisingly subtle. Consider the following RDF
sample:

    <owl:Class rdf:ID="DigitalCamera">
    </owl:Class>

This declares that the resource with the relative URI
`#DigitalCamera` is an OWL ontology class. It suggests that it
would be appropriate to model that declaration in Java with an
instance of an `OntClass`. Now suppose we add a triple to the RDF
model to augment the class declaration with some more information:

    <owl:Class rdf:ID="DigitalCamera">
      <rdf:type owl:NamedIndividual />
    </owl:Class>

Now we are stating that `#DigitalCamera` is an OWL Named Individual.
This is valid in OWL2, but, for example, in OWL1 DL, 
such a [punning](https://www.w3.org/TR/owl2-new-features/#F12:_Punning) is not allowed.
The problem we then have is that Java does not
allow us to dynamically change the Java class of the object
representing this resource. The resource has not changed: it still
has URI `#DigitalCamera`. But the appropriate Java class Jena might
choose to encapsulate it has changed from `OntClass` to `OntIndividual`.
Conversely, if we subsequently remove the `rdf:type owl:NamedIndividual`
from the model, using the `OntIndividual` Java class is no longer
appropriate.

Even worse, OWL2 and OWL1 Full allow us to state the following (rather
counter-intuitive) construction:

    <owl:Class rdf:ID="DigitalCamera">
      <rdf:type owl:ObjectProperty />
    </owl:Class>

That is, `#DigitalCamera` is both a class *and* a property. While
this may not be a very useful claim, it illustrates a basic
point: we cannot rely on a consistent or unique mapping between an
RDF resource and the appropriate Java abstraction.

Jena accepts this basic characteristic of polymorphism at the RDF
level by considering that the Java abstraction (`OntClass`,
`OntClass.Restriction`, `OntDataProperty`, etc.) is just a view or *facet*
of the resource. That is, there is a one-to-many mapping from a
resource to the facets that the resource can present. If the
resource is typed as an `owl:Class`, it can present the `OntClass`
facet; given other types, it can present other facets. Jena
provides the `.as()` method to efficiently map from an RDF object
to one of its allowable facets. Given a RDF object (i.e. an
instance of `org.apache.jena.rdf.model.RDFNode` or one of its
sub-types), you can get a facet by invoking `as()` with an argument
that denotes the facet required. Specifically, the facet is
identified by the Java class object of the desired facet. For
example, to get the `OntClass` facet of a resource, we can write:

    Resource r = myModel.getResource( myNS + "DigitalCamera" );
    OntClass cls = r.as( OntClass.class );

This pattern allows our code to defer decisions about the correct Java
abstraction to use until run-time. The choice can depend on the
properties of the resource itself. If a given `RDFNode` will not
support the conversion to a given facet, it will raise a
`OntJenaException.Conversion`. We can test whether `.as()` will succeed for a
given facet with `canAs()`. This RDF-level polymorphism is used
extensively in the Jena ontology API to allow maximum flexibility
in handling ontology data.

## Running example: the ESWC ontology

To illustrate the principles of using the ontology API, we will use
examples drawn from the
[ESWC ontology](http://data.semanticweb.org/ns/swc/swc_2009-05-09.html)
This ontology presents a simple model for describing the concepts
and activities associated with a typical academic conference. A
copy of the ontology serialized in RDF/XML is included with the
Jena download, see:
[[`eswc-2006-09-21.rdf`](https://raw.githubusercontent.com/apache/jena/main/jena-core/src-examples/data/eswc-2006-09-21.rdf)]
(note that you may need to view the page source in some browsers to
see the XML code).

A subset of the classes and properties from the ontology are shown
in Figure 3:

![Image of the example class hierarchy](eswc-classes.png "Figure 3: Classes and properties from ESWC ontology")
<br />Figure 3: Classes and properties from ESWC ontology

We will use elements from this ontology to illustrate the ontology
API throughout the rest of this document.

## Creating ontology models

An ontology model is an extension of the Jena RDF model,
providing extra capabilities for handling ontologies. Ontology
models are created through the Jena
[`OntModelFactory`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/OntModelFactory.html).
The simplest way to create an ontology model is as follows:

    OntModel m = OntModelFactory.createModel();

This will create an ontology model with the *default* settings,
which are set for maximum compatibility with the previous version
of Jena. These defaults are:

-   OWL2-DL language
-   in-memory triples graph
-   builtin RDFS inference, which principally produces entailments from the
    sub-class and sub-property hierarchies.

The builtin RDFS inference is a cut down inference 
which is done by model itself without any attached reasoner. 
To have complete RDFS inference use, e.g., OWL2_DL_MEM_RDFS_INF specification.
In many applications, such as driving a GUI, RDFS inference is too
strong. For example, every class is inferred to be an immediate sub-class of
`owl:Thing`. In other applications, stronger reasoning is needed.
In general, to create an `OntModel` with a particular reasoner or
language profile, you should pass a model specification to the
`createModel` call. 
For example, an OWL model that performs no reasoning at all can be created with:

    OntModel m = OntModelFactory.createModel( OntSpecification.OWL2_DL_MEM );

Beyond these basic choices, the complexities of configuring an
ontology model are wrapped up in a recipe object called
[`OntSpecification`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/OntSpecification.html).
This specification allows complete control over the configuration
choices for the ontology model, including the language profile in
use and the reasoner.
A number of common recipes are pre-declared as constants in
`OntSpecification`, and listed below.

OntSpecification | Language profile | Storage model | Reasoner
------------ |------------------| ------------- | --------
OWL2_DL_MEM_BILTIN_INF | OWL2 DL          | in-memory | builtin reasoner with RDFS-level entailment-rules
OWL2_DL_MEM | OWL2 DL          | in-memory | none
OWL2_DL_MEM_TRANS_INF | OWL2 DL          | in-memory | transitive class-hierarchy inference
OWL2_DL_MEM_RULES_INF | OWL2 DL          | in-memory | rule-based reasoner with OWL rules
OWL2_DL_MEM_RDFS_INF | OWL2 DL          | in-memory | rule reasoner with RDFS-level entailment-rules
OWL2_FULL_MEM | OWL2 Full        | in-memory | none
OWL2_FULL_MEM_TRANS_INF | OWL2 Full        | in-memory | transitive class-hierarchy inference
OWL2_FULL_MEM_RULES_INF | OWL2 Full        | in-memory | rule-based reasoner with OWL rules
OWL2_FULL_MEM_RDFS_INF | OWL2 Full        | in-memory | rule reasoner with RDFS-level entailment-rules
OWL2_FULL_MEM_MICRO_RULES_INF | OWL2 Full        | in-memory | optimised rule-based reasoner with OWL rules
OWL2_FULL_MEM_MINI_RULES_INF | OWL2 Full        | in-memory | rule-based reasoner with subset of OWL rules
OWL2_EL_MEM | OWL2 EL          | in-memory | none
OWL2_EL_MEM_TRANS_INF | OWL2 EL          | in-memory | transitive class-hierarchy inference
OWL2_EL_MEM_RULES_INF | OWL2 EL          | in-memory | rule-based reasoner with OWL rules
OWL2_EL_MEM_RDFS_INF | OWL2 EL          | in-memory | rule reasoner with RDFS-level entailment-rules
OWL2_QL_MEM | OWL2 QL          | in-memory | none
OWL2_QL_MEM_TRANS_INF | OWL2 QL          | in-memory | transitive class-hierarchy inference
OWL2_QL_MEM_RULES_INF | OWL2 QL          | in-memory | rule-based reasoner with OWL rules
OWL2_QL_MEM_RDFS_INF | OWL2 QL          | in-memory | rule reasoner with RDFS-level entailment-rules
OWL2_RL_MEM | OWL2 RL          | in-memory | none
OWL2_RL_MEM_TRANS_INF | OWL2 RL          | in-memory | transitive class-hierarchy inference
OWL2_RL_MEM_RULES_INF | OWL2 RL          | in-memory | rule-based reasoner with OWL rules
OWL2_RL_MEM_RDFS_INF | OWL2 RL          | in-memory | rule reasoner with RDFS-level entailment-rules
OWL1_DL_MEM | OWL1 DL          | in-memory | none
OWL1_DL_MEM_TRANS_INF | OWL1 DL          | in-memory | transitive class-hierarchy inference
OWL1_DL_MEM_RULES_INF | OWL1 DL          | in-memory | rule-based reasoner with OWL rules
OWL1_DL_MEM_RDFS_INF | OWL1 DL          | in-memory | rule reasoner with RDFS-level entailment-rules
OWL1_FULL_MEM | OWL1 Full        | in-memory | none
OWL1_FULL_MEM_TRANS_INF | OWL1 Full        | in-memory | transitive class-hierarchy inference
OWL1_FULL_MEM_RULES_INF | OWL1 Full        | in-memory | rule-based reasoner with OWL rules
OWL1_FULL_MEM_RDFS_INF | OWL1 Full        | in-memory | rule reasoner with RDFS-level entailment-rules
OWL1_FULL_MEM_MICRO_RULES_INF | OWL1 Full         | in-memory | optimised rule-based reasoner with OWL rules
OWL1_FULL_MEM_MINI_RULES_INF | OWL1 Full         | in-memory | rule-based reasoner with subset of OWL rules
OWL1_LITE_MEM | OWL1 Lite          | in-memory | none
OWL1_LITE_MEM_TRANS_INF | OWL1 Lite          | in-memory | transitive class-hierarchy inference
OWL1_LITE_MEM_RULES_INF | OWL1 Lite          | in-memory | rule-based reasoner with OWL rules
OWL1_LITE_MEM_RDFS_INF | OWL1 Lite          | in-memory | rule reasoner with RDFS-level entailment-rules
RDFS_MEM | RDFS             | in-memory | none
RDFS_MEM_TRANS_INF | RDFS             | in-memory | transitive class-hierarchy inference
RDFS_MEM_RDFS_INF | RDFS             | in-memory | rule reasoner with RDFS-level entailment-rules

For details of reasoner capabilities, please see the
[inference documentation](../inference) and the Javadoc
for
[OntSpecification](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/OntSpecification.html).
See also further discussion [below](#inference-intro).

To create a custom model specification, 
you can create [OntPersonality](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/common/OntPersonality.html) object 
and create a new `OntSpecification` from its constructor:

    OntPersonality OWL2_FULL_PERSONALITY = OntPersonalities.OWL2_ONT_PERSONALITY()
                    .setBuiltins(OntPersonalities.OWL2_FULL_BUILTINS)
                    .setReserved(OntPersonalities.OWL2_RESERVED)
                    .setPunnings(OntPersonalities.OWL_NO_PUNNINGS)
                    .setConfig(OntConfigs.OWL2_CONFIG)
                    .build();
    OntSpecification OWL2_FULL_MEM_RDFS_INF = new OntSpecification(
        OWL2_FULL_PERSONALITY, RDFSRuleReasonerFactory.theInstance()
    );

The first parameter in the builder above is the vocabulary
(see [OntPersonality.Builtins](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/common/OntPersonality.Builtins.html))
that contains a set of OWL entities' IRIs that do not require an explicit declaration (e.g., `owl:Thing`). 
The second parameter is the vocabulary
(see [OntPersonality.Reserved](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/common/OntPersonality.Reserved.html)),
which is for system resources and properties that cannot represent any OWL object.
The third vocabulary 
(see [OntPersonality.Punnings](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/common/OntPersonality.Punnings.html))
contains description of [OWL punnings](https://www.w3.org/TR/owl2-new-features/#F12:_Punning).
The last parameter in the builder is the  
[OntConfig](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/common/OntConfig.html) 
that allows fine-tuning the behavior.
There are the following configuration settings 
(see [OntModelControls](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/OntModelControls.html)):

Setting | Description
------------ |------------------
ALLOW_ANONYMOUS_INDIVIDUALS | Controls anonymous individuals. Some specifications (e.g. OWL2 EL) do not allow anonymous individuals.
ALLOW_GENERIC_CLASS_EXPRESSIONS | If this key is set to true, there is a special type of class expressions, which includes any structure declared as `owl:Class` or `owl:Restriction` that cannot be classified as a specific type. This option is for compatibility with legacy `OntModel`.
ALLOW_NAMED_CLASS_EXPRESSIONS | If this key is set to true, all class expressions are allowed to be named (can have URI). This option is for compatibility with legacy `OntModel`.
USE_BUILTIN_HIERARCHY_SUPPORT | If this key is set to true, then the class/property hierarchies (e.g., see `OntClass.subClasses()`) are to be inferred by the naked model itself using builtin algorithms.
USE_CHOOSE_MOST_SUITABLE_ONTOLOGY_HEADER_STRATEGY | If true, a multiple ontology header is allowed. 
USE_GENERATE_ONTOLOGY_HEADER_IF_ABSENT_STRATEGY | If true, `OntID` will be generated automatically if it is absent (as a b-node). OWL2 requires one and only one ontology header.
USE_LEGACY_COMPATIBLE_NAMED_CLASS_FACTORY | If true, named class testing is compatible with the legacy Jena `OntModel`, otherwise, a strict check against the specification for the class declaration is performed (`owl:Class` for OWL & `rdfs:Class` for RDFS types are required).
USE_OWL_CLASS_DISJOINT_WITH_FEATURE | Controls `owl:disjointWith` functionality.
USE_OWL_CLASS_EQUIVALENT_FEATURE | Controls `owl:equivalentClass` functionality.
USE_OWL_DATA_PROPERTY_FUNCTIONAL_FEATURE | Controls data `owl:FunctionalProperty` functionality.
USE_OWL_INDIVIDUAL_DIFFERENT_FROM_FEATURE | Controls `owl:differentFrom` functionality.
USE_OWL_INDIVIDUAL_SAME_AS_FEATURE | Controls `owl:sameAs` functionality.
USE_OWL_INVERSE_OBJECT_PROPERTY_FEATURE | If this key is set to true, an anonymous inverse object property type is enabled (OWL2 feature).
USE_OWL_OBJECT_PROPERTY_FUNCTIONAL_FEATURE | Controls object `owl:FunctionalProperty` functionality.
USE_OWL_PROPERTY_ASYMMETRIC_FEATURE | Controls `owl:AsymmetricProperty` functionality.
USE_OWL_PROPERTY_CHAIN_AXIOM_FEATURE | Controls `owl:propertyChainAxiom` functionality.
USE_OWL_PROPERTY_EQUIVALENT_FEATURE | Controls `owl:equivalentProperty` functionality.
USE_OWL_PROPERTY_INVERSE_FUNCTIONAL_FEATURE | Controls `owl:InverseFunctionalProperty` functionality.
USE_OWL_PROPERTY_INVERSE_OF_FEATURE | Controls `owl:inverseOf` functionality.
USE_OWL_PROPERTY_IRREFLEXIVE_FEATURE | Controls `owl:IrreflexiveProperty` functionality.
USE_OWL_PROPERTY_REFLEXIVE_FEATURE | Controls `owl:ReflexiveProperty` functionality.
USE_OWL_PROPERTY_SYMMETRIC_FEATURE | Controls `owl:SymmetricProperty` functionality.
USE_OWL_PROPERTY_TRANSITIVE_FEATURE | Controls `owl:TransitiveProperty` functionality.
USE_OWL1_DATARANGE_DECLARATION_FEATURE | If this key is set to true, then `owl:DataRange` (OWL1) is used instead of `rdfs:Datatype` (OWL2).
USE_OWL1_DISTINCT_MEMBERS_PREDICATE_FEATURE | If this key is set to true, then `owl:distinctMembers` (OWL1) is used instead of `owl:members` (OWL2).
USE_OWL2_CLASS_HAS_KEY_FEATURE | Controls `owl:hasKey` functionality.
USE_OWL2_DEPRECATED_VOCABULARY_FEATURE | If this key is set to true, then `owl:DataRange` and `owl:distinctMembers` will also be considered, although in OWL2 they are deprecated.
USE_OWL2_NAMED_CLASS_DISJOINT_UNION_FEATURE | Controls `owl:disjointUnionOf` functionality.
USE_OWL2_NAMED_INDIVIDUAL_DECLARATION_FEATURE | If this key is set to true, then `owl:NamedIndividual` declaration is used for creating individuals (method `OntModel#createIndividual(String iri)`).
USE_OWL2_PROPERTY_DISJOINT_WITH_FEATURE | Controls `owl:propertyDisjointWith` functionality.
USE_OWL2_QUALIFIED_CARDINALITY_RESTRICTION_FEATURE | If this key is set to true, then `owl:qualifiedCardinality`, `owl:maxQualifiedCardinality`, `owl:minQualifiedCardinality` predicates are allowed for Cardinality restrictions.
USE_SIMPLIFIED_TYPE_CHECKING_WHILE_LIST_INDIVIDUALS | Used while listing individuals (`OntModel.individuals()`).

## Compound ontology documents and imports processing

The OWL ontology language includes some facilities for
creating modular ontologies that can be re-used in a similar manner
to software modules. In particular, one ontology can *import*
another. Jena helps ontology developers to work with modular
ontologies by automatically handling the imports statements in
ontology models.

The key idea is that the base model of an ontology model is
actually a collection of models, one per imported model. This means
we have to modify figure 2 a bit. Figure 4 shows how the ontology
model builds a collection of import models:

![Diagram of compound document for imports](./ont-model-layers-import.png "ontology model compound document structure for imports")
<br />
Figure 4: ontology model compound document structure for imports

We will use the term *document* to describe an ontology serialized
in some transport syntax, such as RDF/XML or N3. This terminology
isn't used by the OWL or RDFS standards, but it is a convenient way
to refer to the written artifacts. However, from a broad view of
the interlinked semantic web, a document view imposes artificial
boundaries between regions of the global web of data and isn't necessarily
a useful way of thinking about ontologies.

We will load an ontology document into an ontology model in the
same way as a normal Jena model, using the `read` method. There are
several variants on read, that handle differences in the source of
the document (to be read from a resolvable URL or directly from an
input stream or reader), the base URI that will resolve any
relative URI's in the source document, and the serialisation
language. In summary, these variants are:

    read( String url )
    read( Reader reader, String base )
    read( InputStream reader, String base )
    read( String url, String lang )
    read( Reader reader, String base, String lang )
    read( InputStream reader, String base, String lang )

You can use any of these methods to load an ontology document. Note
that we advise that you avoid the `read()` variants that accept
a `java.io.Reader` argument when loading XML documents containing
internationalised character sets, since the handling of character
encoding by the Reader and by XML parsers is not compatible.

By default, when an ontology model reads an ontology document, it
will *not* locate and load the document's imports.
To automatically handle all documents from imports closure, a specialized method from `OntModelFactory` should be used: 

    GraphRepository repository = GraphRepository.createGraphDocumentRepositoryMem();
    OntModel m = OntModelFactory.createModel(graph, OntSpecification.OWL2_DL_MEM_BUILTIN_INF, repository);

An OWL document may contain an individual `owl:Ontology`, which
contains meta-data about that document itself. For example:

    <owl:Ontology rdf:about="">
      <dc:creator rdf:value="Ian Dickinson" />
      <owl:imports rdf:resource="http://jena.apache.org/examples/imported-ontology-iri" />
      <owl:versionIRI rdf:resource="http://jena.apache.org/examples/this-ontology-iri" />
    </owl:Ontology>

In OWL2 this section is mandatory and there must be one and only one per document.
It corresponds 
[OntID](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntID.html) object.
In the example above, the construct `rdf:about=""` is a *relative URI*. 
It will resolve to the document's base URI.
In OWL2 the identifier of ontology is either version IRI, ontology IRI or document IRI 
(see [OWL 2 Web Ontology Language Structural Specification: Imports](https://www.w3.org/TR/owl2-syntax/#Imports)). 
The `owl:imports` line states
that this ontology is constructed using classes, properties and
individuals from the referenced ontology, 
which identifier in the example above is `http://jena.apache.org/examples/imported-ontology-iri`. 
When an `OntModel`, created with `GraphRepository`, reads
this document, it will notice the `owl:imports` line and attempt to
load the imported ontology into a sub-model of the ontology model
being constructed. 
The definitions from both the base ontology and all the imports will be visible to the reasoner.

Each imported ontology document is held in a separate graph
structure. This is important: we want to keep the original source
ontology separate from the imports. When we write the model out
again, normally only the base model is written (the alternative is
that all you see is a confusing union of everything). And when we
update the model, only the base model changes. To get the base
model or base graph from an `OntModel`, use:

    Model base = thisOntModel.getBaseModel();

Imports are processed recursively, so if our base document imports
ontology A, and A imports B, we will end up with the structure shown
in Figure 4. Note that the imports have been flattened out. A cycle
check is used to prevent the document handler getting stuck if, for
example, A imports B which imports A!

To dynamically control imports, the methods `OntModel#addImport`,
`OntModel#removeImport`, `OntModel#hasImport` and `OntModel#imports` can be used.
E.g.:

    thisOntModel.addImport(otherOntModel);

If the ontology is created with `GraphRepository`,
adding a statement `<this-ont-id> owl:imports <other-ont-id>` will import the corresponding ontology.
More convenient way to add the import, is to use `OntID` object:

    thisOntModel.getID().addImport("other-ontology-iri");

### GraphRepository

[GraphRepository](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/GraphRepository.html) 
is an abstraction that provides access to graphs. 
The method `GraphRepository#createGraphDocumentRepositoryMem()` creates an implementation `DocumentGraphRepository` 
that stores graphs in memory. 
The method `DocumentGraphRepository#get` returns graphs by reference id, 
which can be a URL or a path to a file. 
If the graph is not in the repository, it will be downloaded from the provided link. 
Using the `DocumentGraphRepository#addMapping` method,
you can match the graph ID to the actual location of the document:
    
    DocumentGraphRepository repo = GraphRepository.createGraphDocumentRepositoryMem();
    repo.addMapping("http://this-ontology", "file://example.ttl");
    Graph graph = repo.get("http://this-ontology");

If the `GraphRepository` is passed as a parameter to the corresponding `OntModelFactory#createModel` method, 
it will contain 
[UnionGraph](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/UnionGraph.html) graphs 
that provide connectivity between ontologies.

## OntModel triple representation: OntStatement
[OntStatement](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntStatement.html) is an extended `org.apache.jena.rdf.model.Statement`.
It has additional methods to support OWL2 annotations.
For example, the following snippet 

    OntModel m = OntModelFactory.createModel( OntSpecification.OWL2_DL_MEM );
    OntStatement st1 = m.createOntClass("X").getMainStatement();
    OntStatement st2 = st1.addAnnotation(m.getRDFSComment(), "comment#1");
    OntStatement st3 = st2.addAnnotation(m.getRDFSLabel(), "label#1");
    OntStatement st4 = st3.addAnnotation(m.getRDFSLabel(), "label#2");

will produce the following RDF:

    PREFIX owl:  <http://www.w3.org/2002/07/owl#>
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
    
    <X>     rdf:type      owl:Class;
            rdfs:comment  "comment#1" .
    
    [ rdf:type               owl:Annotation;
      rdfs:label             "label#2";
      owl:annotatedProperty  rdfs:label;
      owl:annotatedSource    [ rdf:type               owl:Axiom;
                               rdfs:label             "label#1";
                               owl:annotatedProperty  rdfs:comment;
                               owl:annotatedSource    <X>;
                               owl:annotatedTarget    "comment#1"
                             ];
      owl:annotatedTarget    "label#1"
    ] .

## The generic ontology type: OntObject

All of the classes in the ontology API that represent ontology
values have
[`OntObject`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntObject.html)
as a common super-class. 
This makes `OntObject` a good place to
put shared functionality for all such classes, and makes a handy
common return value for general methods. The Java interface
`OntObject` extends more general `OntResource` 
which in turns extends Jena's RDF [`Resource`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Resource.html)
interface, so any general method that accepts a resource or an
[`RDFNode`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFNode.html)
will also accept an `OntObject`, and consequently, any other
ontology value.

Some of the common attributes of an ontology object that are
expressed through methods on `OntObject` are shown below:

Attribute | Meaning
--------- | -------
objectType | A concret java Class-type of this `OntObject`
mainStatement | The main `OntStatement`, which determines the nature of this ontological resource, In most cases it is a declaration and wraps a triple with predicate `rdf:type`
spec | All characteristic statements of the ontology resource, i. e., all those statements which completely determine this object nature according to the OWL2 specification; mainStatement is a part of spec
content | spec plus all additional statements in which this object is the subject, minus those of them whose predicate is an annotation property (i.e. annotations are not included)
annotations | All top-level annotations attached to the mainStatement of this object
statements | Model's statements for which this object is a subject
objects | Lists typed `Resource`s for which this object is a subject
types | Equivalent to `objects(RDF.type, Resource.class)`
isLocal | Determines if this Ontology Resource is locally defined, which means mainStatement belongs to a base graph

The generic way to list `OntObject`s of a particular type is the method `<T extends OntObject> OntModel#ontObject(Class<T>)`

## Ontology entities
In OWL2, there are six kinds of named (IRI) resources, 
called [OWL entities](https://www.w3.org/TR/owl-syntax/#Entities.2C_Literals.2C_and_Anonymous_Individuals).
The common supertype is [OntEntity](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntEntity.html),
which has following sub-types:
- [OntClass.Named](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntClass.Named.html) - a named class expression.
- [OntDataRange.Named](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntDataRange.Named.html) - a named data range expression.
- [OntIndividual.Named](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntIndividual.Named.html) - a named individual
- [OntObjectProperty.Named](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntObjectProperty.Named.html) - a non-inverse object property
- [OntDataProperty](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntDataProperty.html) - a datatype property
- [OntAnnotationProperty](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntAnnotationProperty.html) - an annotation property

`OntEntity` can be ontology defined or builtin, e.g. `owl:Thing` is a builtin `OntClass.Named`  

## Ontology classes

Classes are the basic building blocks of an ontology. 
A class is represented in Jena by an
[OntClass](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntClass.html)
object. As [mentioned above](#rdf-polymorphism), an ontology class
is a facet of an RDF resource. One way, therefore, to get an
ontology class is to convert a plain RDF resource into
its class facet. Assume that `m` is a
suitably defined `OntModel`, into which the ESWC ontology has
already been read, and that `NS` is a variable denoting the
ontology namespace:

    Resource r = m.getResource( NS + "Paper" );
    OntClass paper = r.as( OntClass.class );

This can be shortened by calling `getOntClass()` on the ontology
model:

    OntClass paper = m.getOntClass( NS + "Paper" );

The `getOntClass` method will retrieve the resource with the given
URI, and attempt to obtain the `OntClass` facet. If either of these
operations fail, `getOntClass()` will return null. Compare this
with the `createOntClass` method, which will reuse an existing
resource if possible, or create a new class resource if not:

    OntClass paper     = m.createOntClass( NS + "Paper" );
    OntClass bestPaper = m.createOntClass( NS + "BestPaper" );

In OWL2 `OntClass` can be either named class (URI resource) or anonymous class expression.
OWL1 `OntSpecification`s also allow named class expressions. 
An anonymous class expression is 
a class description with no associated URI, which have structure determined by the specification. 
Anonymous classes are
often used when building more complex ontologies in OWL.
They are less useful in RDFS.

    OntClass anonClass = m.createObjectUnionOf(classes);

Once you have the ontology class object, you can begin processing
it through the methods defined on `OntClass`. The attributes of a
class are handled in a similar way to the attributes of
`OntObject`, above, with a collection of methods to set, add, get,
test, list and remove values. Properties of classes that are
handled in this way are:

Attribute | Meaning
--------- | -------
subClasses | A subclass of this class, i.e. those classes that are declared `rdfs:subClassOf` this class.
superClasses | A super-class of this class, i.e. a class that this class is a `rdfs:subClassOf`.
equivalentClasses | A class that represents the same concept as this class. This is not just having the same class extension: the class 'British Prime Minister in 2003' contains the same individual as the class 'the husband of Cherie Blair', but they represent different concepts.
disjointWith | Denotes a class with which this class has no instances in common.
hasKey | OWL2 Language feature [Keys](https://www.w3.org/TR/owl-primer/#Keys)
disjointUnions | OWL2 language feature [Disjoint Union](https://www.w3.org/TR/owl2-syntax/#Disjoint_Union_of_Class_Expressions), which only applicable to named classes

Thus, in our example ontology, we can print a list the subclasses
of an `Artefact` as follows:

    OntClass artefact = m.getOntClass( NS + "Artefact" );
    artefact.subClasses().forEach( it -> System.out.println( it.getURI() ) );

Note that, under RDFS and OWL semantics, each class is a sub-class
of itself (in other words, `rdfs:subClassOf` is reflexive). While
this is true in the semantics, Jena users have reported finding
it inconvenient. Therefore, the `subClasses` and
`superClasses` convenience methods remove the reflexive from the list of
results returned by the iterator. However, if you use the plain
`Model` API to query for `rdfs:subClassOf` triples, assuming that a
reasoner is in use, the reflexive triple will appear among the deduced
triples.

Given an `OntClass` object, you can create or remove members of the
class extension &ndash; individuals that are instances of the class &ndash;
using the following methods:

Method | Meaning
------ | -------
individuals()<br />individuals(boolean&nbsp;direct) | Returns a `Stream` over those instances that include this class among their `rdf:type` values. The `direct` flag can be used to select individuals that are direct members of the class, rather than indirectly through the class hierarchy. Thus if `p1` has `rdf:type :Paper`, it will appear in the `Stream` returned by `individuals` on `:Artefact`, but not in the `Stream` returned by `individuals(false)` on `:Artefact`.
createIndividual()<br />createIndividual(String&nbsp;uri) | Adds a resource to the model, whose asserted `rdf:type` is this ontology class. If no URI is given, the individual is an anonymous resource.
removeIndividual(Resource&nbsp;individual) | Removes the association between the given individual and this ontology class. Effectively, this removes the `rdf:type` link between this class and the resource. Note that this is not the same as removing the individual altogether, unless the only thing that is known about the resource is that it is a member of the class.

To test whether a class is a root of the class hierarchy in this
model (i.e. it has no known super-classes), call
`isHierarchyRoot()`.

The domain of a property is intended to allow entailments about the
class of an individual, given that it appears as a statement
subject. It is not a constraint that can be used to validate a
document, in the way that XML schema can do. Nevertheless, many
developers find it convenient to use the domain of a property to
document the design intent that the property only applies to known
instances of the domain class. Given this observation, it can be a
useful debugging or display aide to show the properties that have
this class among their domain classes. The method
`declaredProperties()` attempts to identify the properties that
are intended to apply to instances of this class. Using
`declaredProperties` is explained in detail in the
[RDF frames how-to](/documentation/notes/rdf-frames.html).

The following class expressions are supported:

Java Class | OWL2 construct
-----------|---------------
`OntClass.Named` | [Class Entity](https://www.w3.org/TR/owl2-syntax/#Classes)
`OntClass.IntersectionOf` | [Intersection of Class Expressions](https://www.w3.org/TR/owl2-syntax/#Intersection_of_Class_Expressions)
`OntClass.UnionOf` | [Union of Class Expressions](https://www.w3.org/TR/owl2-syntax/#Union_of_Class_Expressions)
`OntClass.ComplementOf` | [Complement of Class Expressions](https://www.w3.org/TR/owl2-syntax/#Complement_of_Class_Expressions)
`OntClass.OneOf` | [Enumeration of Individuals](https://www.w3.org/TR/owl2-syntax/#Enumeration_of_Individuals)
`OntClass.ObjectAllValuesFrom` | [Universal Quantification](https://www.w3.org/TR/owl2-syntax/#Universal_Quantification)
`OntClass.ObjectSomeValuesFrom` | [Existential Quantification](https://www.w3.org/TR/owl2-syntax/#Existential_Quantification)
`OntClass.ObjectHasValue` | [Individual Value Restriction](https://www.w3.org/TR/owl2-syntax/#Individual_Value_Restriction)
`OntClass.HasSelf` | [Self Restriction](https://www.w3.org/TR/owl2-syntax/#Self-Restriction)
`OntClass.ObjectCardinality` | [Exact Cardinality](https://www.w3.org/TR/owl2-syntax/#Exact_Cardinality)
`OntClass.ObjectMaxCardinality` | [Maximum Cardinality](https://www.w3.org/TR/owl2-syntax/#Maximum_Cardinality)
`OntClass.ObjectMinCardinality` | [Minimum Cardinaloty](https://www.w3.org/TR/owl2-syntax/#Minimum_Cardinality)
`OntClass.DataAllValuesFrom` | [Universal Qualification](https://www.w3.org/TR/owl2-syntax/#Universal_Quantification_2)
`OntClass.DataSomeValuesFrom` | [Existential Quantification](https://www.w3.org/TR/owl2-syntax/#Existential_Quantification_2)
`OntClass.DataHasValue` | [Literal Value Restriction](https://www.w3.org/TR/owl2-syntax/#Literal_Value_Restriction)
`OntClass.DataCardinality` | [Exact Cardinality](https://www.w3.org/TR/owl2-syntax/#Exact_Cardinality_2)
`OntClass.DataMaxCardinality` | [Maximum Cardinality](https://www.w3.org/TR/owl2-syntax/#Maximum_Cardinality_2)
`OntClass.DataMinCardinality` | [Minimum Cardinality](https://www.w3.org/TR/owl2-syntax/#Minimum_Cardinality_2)
`OntClass.NaryDataAllValuesFrom` | [Universal Qualification](https://www.w3.org/TR/owl2-syntax/#Universal_Quantification_2)
`OntClass.NaryDataSomeValuesFrom` | [Existential Quantification](https://www.w3.org/TR/owl2-syntax/#Existential_Quantification_2)

### Complex class expressions

We introduced the handling of basic, named classes above. These are
the only kind of class descriptions available in RDFS. In OWL,
however, there are a number of additional types of class
expression, which allow richer and more expressive descriptions of
concepts.
In OWL2, all class expressions (with except of named classes) must be anonymous resources.
In OWL1, for compatibility reasons, they are allowed to be named.
There are two main categories of additional class
expression: *restrictions* and *logical expressions*
We'll examine each in turn.

### Restriction class expressions

A
[restriction](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntClass.Restriction.html)
defines a class by reference to one of the properties of the
individuals that comprise the members of the class, and then
placing some constraint on that property. For example, in a simple
view of animal taxonomy, we might say that mammals are covered in
fur, and birds in feathers. Thus the property `hasCovering` is in
one case restricted to have the value `fur`, in the other to have
the value `feathers`. This is a *has value restriction*. Six
restriction types are currently defined by OWL:

Restriction type | Meaning
---------------- | -------
has value | The restricted property has exactly the given value.
all values from | All values of the restricted property, if it has any, are members of the given class.
some values from | The property has at least one value which is a member of the given class.
cardinality | The property has exactly *n* values, for some positive integer n.
min cardinality | The property has at least *n* values, for some positive integer n.
max cardinality | The property has at most *n* values, for some positive integer n.
object has self | A self-restriction consists of an object property expression `p`, and it contains all those individuals that are connected by `p` to themselves.                          

Jena provides a number of ways of creating restrictions, or
retrieving them from a model.

    // list restriction with a given 
    OntRestriction r = m.ontObjects(OntClass.ObjectSomeValuesFrom.class);

You can create a new restriction created by nominating the property
that the restriction applies to:

    // anonymous restriction on property p
    OntObjectProperty p = m.createObjectProperty( NS + "p" );
    OntClass c = m.createOntClass( NS + "c" );
    OntClass.Restriction r = m.createObjectMaxCardinality( p, 42, c );

A common case is that we want the restrictions on some property
`p`. In this case, from an object denoting `p` we can list the
restrictions that mention that property:

    OntObjectProperty p = m.getObjectProperty( NS + "p" );
    Stream<OntClass.Restriction> i = p.referringRestrictions();

A general restriction can be converted to a specific type of
restriction via `as...` methods (if the information is already in the
model), or, if the information is not in the model, via
`convertTo...` methods. For example, to convert the example
restriction `r` from the example above to an all values from
restriction, we can do the following:

    OntClass c = m.createClass( NS + "SomeClass" );
    AllValuesFromRestriction avf = r.convertToAllValuesFromRestriction( c );

To create a particular restriction *ab initio*, we can use the
creation methods defined on `OntModel`. For example:

    OntClass c = m.createOntClass( NS + "SomeClass" );
    OntObjectProperty p = m.createObjectProperty( NS + "p" );
    OntClass.ObjectAllValuesFrom avf = m.createObjectAllValuesFrom( p, c );

Assuming that the above code fragment was using a model `m` which
was created with the OWL language profile, it creates a instance of
an OWL restriction that would have the following definition in
RDF/XML:

    <owl:Restriction>
      <owl:onProperty rdf:resource="#p"/>
      <owl:allValuesFrom rdf:resource="#SomeClass"/>
    </owl:Restriction>

Once we have a particular restriction object, there are methods
following the standard add, get, set and test naming pattern to
access the aspects of the restriction. For example, in a camera
ontology, we might find this definition of a class describing
Large-Format cameras:

    <owl:Class rdf:ID="Large-Format">
      <rdfs:subClassOf rdf:resource="#Camera"/>
      <rdfs:subClassOf>
        <owl:Restriction>
          <owl:onProperty rdf:resource="#body"/>
          <owl:allValuesFrom rdf:resource="#BodyWithNonAdjustableShutterSpeed"/>
       </owl:Restriction>
      </rdfs:subClassOf>
    </owl:Class>

Here's one way to access the components of the all values from
restriction. Assume `m` contains a suitable camera ontology:

    OntClass LargeFormat = m.getOntClass(ns + "Large-Format");
    LargeFormat.superClasses()
            .filter(it -> it.canAs(OntClass.ObjectAllValuesFrom.class))
            .map(it -> it.as(OntClass.ObjectAllValuesFrom.class))
            .forEach(av ->
                    System.out.println("AllValuesFrom class " + 
                            av.getValue().getURI() +
                            " on property " + 
                            av.getProperty().getURI())
            );

### Boolean Connectives

Most developers are familiar with the use of Boolean operators to
construct propositional expressions: conjunction (and), disjunction
(or) and negation (not). OWL provides a means for constructing
expressions describing classes with analogous operators, by
considering class descriptions in terms of the set of individuals
that comprise the members of the class.

Suppose we wish to say that an instance `x` has `rdf:type` `A` **and**
`rdf:type` `B`. This means that `x` is both a member of the set of
individuals in `A`, and in the set of individuals in `B`. Thus, `x` lies
in the *intersection* of classes `A` and `B`. If, on the other hand, `A`
is either has `rdf:type` `A` **or** `B`, then `x` must lie in the *union*
of `A` and `B`. Finally, to say that x does **not** have `rdf:type` `A`,
it must lie in the *complement* of `A`. These operations, union,
intersection and complement are the Boolean operators for
constructing class expressions. While complement takes only a
single argument, union and intersection must necessarily take more
than one argument. Before continuing with constructing and using

In additional to these three class expressions, OWL2 also offers
[Enumeration of Individuals](https://www.w3.org/TR/owl2-syntax/#Enumeration_of_Individuals).
An enumeration of individuals `ObjectOneOf( a1 ... an )` contains exactly the individuals `ai` with `1 ≤ i ≤ n`.

### Intersection, union and complement class expressions

Given Jena's ability to construct lists, building intersection and
union class expressions is straightforward. The `create` methods on
`OntModel` allow us to construct an intersection or union directly.
For example, we can define the class of UK
industry-related conferences as the intersection of conferences
with a UK location and conferences with an industrial track. Here's
the XML declaration:

    <owl:Class rdf:ID="UKIndustrialConference">
      <owl:intersectionOf rdf:parseType="Collection">
        <owl:Restriction>
          <owl:onProperty rdf:resource="#hasLocation"/>
          <owl:hasValue rdf:resource="#united_kingdom"/>
        </owl:Restriction>
        <owl:Restriction>
          <owl:onProperty rdf:resource="#hasPart"/>
          <owl:someValuesFrom rdf:resource="#IndustryTrack"/>
        </owl:Restriction>
      </owl:intersectionOf>
    </owl:Class>

Or, more compactly in N3/Turtle:

    :UKIndustrialConference a owl:Class ;
        owl:intersectionOf (
           [a owl:Restriction ;
              owl:onProperty :hasLocation ;
              owl:hasValue :united_kingdom]
           [a owl:Restriction ;
              owl:onProperty :hasPart ;
              owl:someValuesFrom :IndustryTrack]
          )

Here is code to create this class declaration using Jena, assuming
that `m` is a model into which the ESWC ontology has been read:

    // get the class references
    OntClass place = m.getOntClass( ns + "Place" );
    OntClass indTrack = m.getOntClass( ns + "IndustryTrack" );

    // get the property references
    OntObjectProperty hasPart = m.getObjectProperty( ns + "hasPart" );
    OntObjectProperty hasLoc = m.getObjectProperty( ns + "hasLocation" );

    // create the UK instance
    OntIndividual uk = place.createIndividual( ns + "united_kingdom" );

    // now the anonymous restrictions
    OntClass.ObjectHasValue ukLocation =
            m.createObjectHasValue( hasLoc, uk );
    OntClass.ObjectSomeValuesFrom hasIndTrack =
            m.createObjectSomeValuesFrom(  hasPart, indTrack );

    // finally, create the intersection class
    OntClass.IntersectionOf ukIndustrialConf =
            m.createObjectIntersectionOf( ukLocation, hasIndTrack );

### Enumeration of Individuals

The final type class expression allowed by OWL is the enumerated
class. Recall that a class is a set of individuals. Often, we want
to define the members of the class *implicitly*: for example, "the class
of UK conferences". Sometimes it is convenient to define a class
*explicitly*, by stating the individuals the class contains. An
[OntClass.OneOf](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntClass.OneOf.html)
is exactly the class whose members are the given individuals. For
example, we know that the class of PrimaryColours contains exactly
red, green and blue, and no others.

In Jena, an enumerated class is created in a similar way to other
classes. The set of values that comprise the enumeration is
described by an RDFList. For example, here's a class defining the
countries that comprise the United Kingdom:

    <owl:Class rdf:ID="UKCountries">
      <owl:oneOf rdf:parseType="Collection">
        <eswc:Place rdf:about="#england"/>
        <eswc:Place rdf:about="#scotland"/>
        <eswc:Place rdf:about="#wales"/>
        <eswc:Place rdf:about="#northern_ireland"/>
      </owl:oneOf>
    </owl:Class>

To list the contents of this enumeration, we could do the
following:

    OntClass place = m.getOntClass( ns + "Place" );

    OntClass.OneOf ukCountries = m.createObjectOneOf(
            place.createIndividual( ns + "england" ),
            place.createIndividual( ns + "scotland" ),
            place.createIndividual( ns + "wales" ),
            place.createIndividual( ns + "northern_ireland" )
    );

    ukCountries.getList().members().forEach( System.out::println );

### Listing classes

In many applications, we need to inspect the set of classes
in an ontology.
The primary method to list any `OntObject`'s, including `OntClass`es,
is `<T extends OntObject> OntModel#ontObjects(Class<T>)`, which returns java `Stream`.
In additional to that, there are more specialized methods:

    public Stream<OntClass.Named> classes();
    public Stream<OntClass> hierarchyRoots();

In OWL, class
expressions are typically not named, but are denoted by anonymous
resources (aka *bNodes*). In many applications, such as displaying
an ontology in a user interface, we want to pick out the named
classes only, ignoring those denoted by bNodes. This is what
`classes()` does. The method `hierarchyRoots()`
identifies the classes that are uppermost in the class hierarchy
contained in the given model. These are the classes that have no
super-classes. The iteration returned by
`hierarchyRoots()` **may** contain anonymous classes.

You should also note that it is important to close the `Stream`
returned from the list methods, particularly when the underlying
store is a database. This is necessary so that any state (e.g., the
database connection resources) can be released. Closing happens
automatically when the `hasNext()` method on the underlying iterator returns
`false`. If your code does not iterate all the way to the end of the
iterator, you should call the `Stream#close()` method explicitly. Note
also that the values returned by these streams will depend on the
asserted data and the reasoner being used.

## Ontology DataRanges

The concept of OWL `DataRange` is similar to class expressions.
There is also named data range, called datatype
([OntDataRange.Named](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntDataRange.Named.html)),
and five kinds of anonymous data range expressions:
data ComplementOf, data IntersectionOf, data UnionOf, data OneOf and datatype restriction (see table below).
See the
[`OntDataRange` javadoc](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntDataRange.html)
for more details.
Example:

    m.createDataRestriction(
        XSD.integer.inModel(m).as(OntDataRange.Named.class),
        m.createFacetRestriction(OntFacetRestriction.FractionDigits.class, m.createTypedLiteral(42))
    );

The following data range expressions are supported:

Java Class | OWL2 construct
-----------|---------------
`OntDataRange.Named` | [Datatype Entity](https://www.w3.org/TR/owl2-syntax/#Datatypes)
`OntDataRange.ComplementOf` | [Complement of Data Ranges](https://www.w3.org/TR/owl2-syntax/#Complement_of_Data_Ranges),
`OntDataRange.IntersectionOf` | [Intersection of Data Ranges](https://www.w3.org/TR/owl2-syntax/#Intersection_of_Data_Ranges),
`OntDataRange.UnionOf` | [Union of Data Ranges](https://www.w3.org/TR/owl2-syntax/#Union_of_Data_Ranges),
`OntDataRange.OneOf` | [Enumeration of Literals](https://www.w3.org/TR/owl2-syntax/#Enumeration_of_Literals)
`OntDataRange.Restriction` | [Datatype Restrictions](https://www.w3.org/TR/owl2-syntax/#Datatype_Restrictions).

## Ontology properties

In an ontology, a *property* denotes the name of a relationship
between resources, or between a resource and a data value.
Usually it corresponds to a predicate in logic representations, with one exception:
in OWL2 there is also [Inverse Object Property Expression](https://www.w3.org/TR/owl2-syntax/#Inverse_Object_Properties). 
One interesting aspect of RDFS and OWL is that
properties are not defined as aspects of some enclosing class, but
are first-class objects in their own right. This means that
ontologies and ontology-applications can store, retrieve and make
assertions about properties directly. Consequently, Jena has a set
of Java classes that allow you to conveniently manipulate the
properties represented in an ontology model.

A named property in an ontology model is an extension of the core Jena
API class
[Property](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Property.html)
and allows access to the additional information that can be
asserted about properties in an ontology language. The common API
super-class for representing named and anonymous ontology properties in Java is
[OntProperty](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntProperty.html).
There is also [OntNamedProperty](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntNamedProperty.html) supertype,
which extends standard RDF `Property`, and `OntRelationalProperty`, which is supertype for `OntDataProperty` and `OntObjectProperty`.
Again, using the pattern of add, set, get, list, has, and remove
methods, we can access the following attributes of an
`OntProperty`:

Attribute | Meaning
--------- | -------
subProperty | A sub property of this property; i.e. a property which is declared to be a `rdfs:subPropertyOf` this property. If `p` is a sub property of `q`, and we know that `A p B` is true, we can infer that `A q B` is also true. For `OntObjectProperty` there is also [ObjectPropertyChain](https://www.w3.org/TR/owl2-syntax/#Object_Subproperties).
superProperty | A super property of this property, i.e. a property that this property is a `rdfs:subPropertyOf`
domain | Denotes the class or classes that form the domain of this property. Multiple domain values are interpreted as a conjunction. The domain denotes the class of value the property maps from.
range | Denotes the class or classes (for object properties) or datarange or dataranges (for datatype properties) that form the range of this property. Multiple range values are interpreted as a conjunction. The range denotes the class of values the property maps to.
equivalentProperty | Denotes a property that is the same as this property. This attribute is only for `OntRealProperty`.
disjointProperty | A disjoint object properties axiom states that all of the object property expressions `OPEi, 1 ≤ i ≤ n`, are pairwise disjoint; that is, no individual `x` can be connected to an individual `y` by both `OPEi` and `OPEj` for `i ≠ j`. Applicable only for `OntRealPropery`
inverse | Denotes a property that is the inverse of this property. Thus if `q` is the inverse of `p`, and we know that `A q B`, then we can infer that `B p A`. This attribute is only for `OntObjectProperty`.


In the example ontology, the property `hasProgramme` has a domain
of `OrganizedEvent`, a range of `Programme` and the human-readable label "has programme".
We can reconstruct this definition in an
empty ontology model as follows:

    OntModel m = OntModelFactory.createModel( OntSpecification.OWL2_FULL_MEM );
    OntClass programme = m.createOntClass( NS + "Programme" );
    OntClass orgEvent = m.createOntClass( NS + "OrganizedEvent" );

    OntObjectProperty hasProgramme = m.createObjectProperty( NS + "hasProgramme" );

    hasProgramme.addDomain( orgEvent );
    hasProgramme.addRange( programme );
    hasProgramme.addLabel( "has programme", "en" );

As a further example, we can alternatively add information to an
existing ontology. To add a super-property `hasDeadline`, to
generalise the separate properties denoting the submission
deadline, notification deadline and camera-ready deadline, do:

    String ns = "http://www.eswc2006.org/technologies/ontology#";
    OntModel m = OntModelFactory.createModel( OntSpecification.OWL2_FULL_MEM );
    m.read( "https://raw.githubusercontent.com/apache/jena/main/jena-core/src-examples/data/eswc-2006-09-21.rdf" );

    OntDataProperty subDeadline = m.getDataProperty( ns + "hasSubmissionDeadline" );
    OntDataProperty notifyDeadline = m.getDataProperty( ns + "hasNotificationDeadline" );
    OntDataProperty cameraDeadline = m.getDataProperty( ns + "hasCameraReadyDeadline" );

    OntDataProperty deadline = m.createDataProperty( ns + "deadline" );
    deadline.addDomain( m.getOntClass( ns + "Call" ) );
    deadline.addRange( XSD.dateTime.inModel(m).as(OntDataRange.class) );

    deadline.addSubPropertyOfStatement( subDeadline );
    deadline.addSubPropertyOfStatement( notifyDeadline );
    deadline.addSubPropertyOfStatement( cameraDeadline );

Note that, although we called the `addSubPropertyOfStatement` method on the
object representing the new super-property, the serialized form of
the ontology will contain `rdfs:subPropertyOf` axioms on each of
the sub-property resources, since this is what the language
defines. Jena will, in general, try to allow symmetric access to
sub-properties and sub-classes from either direction.

### Object and Datatype properties

OWL refines the basic property type from RDF into two
sub-types: *object properties* and *datatype properties*. The
difference between them is that an object property can have only
individuals in its range, while a datatype property has concrete
data literals (only) in its range. Some OWL reasoners are able to
exploit the differences between object and datatype properties to
perform more efficient reasoning over ontologies. OWL also adds an
*annotation property*, which is defined to have no semantic
entailments, and so is useful when annotating ontology documents,
for example.

### Functional properties

OWL permits object and datatype properties to be *functional* &ndash;
that is, for a given individual in the domain, the range value will
always be the same. In particular, if `father` is a functional
property, and individual `:jane` has `father :jim` and
`father :james`, a reasoner is entitled to conclude that `:jim` and
`:james` denote the same individual. A functional property is
equivalent to stating that the property has a maximum cardinality
of one.

To declare a functional property, expression `property.setFunctional(true)` can be used. 

### Other property types

There are several additional characteristics of ObjectProperty that
represent additional capabilities of ontology properties:
[transitive](https://www.w3.org/TR/owl2-syntax/#Transitive_Object_Properties), 
[symmetric](https://www.w3.org/TR/owl2-syntax/#Symmetric_Object_Properties), 
[asymmetric](https://www.w3.org/TR/owl2-syntax/#Asymmetric_Object_Properties), 
[inverse-functional](https://www.w3.org/TR/owl2-syntax/#Inverse-Functional_Object_Properties), 
[reflexive](https://www.w3.org/TR/owl2-syntax/#Reflexive_Object_Properties), 
[irreflexive](https://www.w3.org/TR/owl2-syntax/#Irreflexive_Object_Properties).

Transitive property means that if `p` is transitive, and we know `:a p :b` and also
`b p :c`, we can infer that `:a p :c`. A
Symmetric property means that if `p` is symmetric, and we know `:a p :b`, we can infer
`:b p :a`. 
An inverse functional property
means that for any given range element, the domain value is unique.
An object property asymmetry axiom states 
that the object property expression `p` is asymmetric — that is, 
if an individual `x` is connected by `p` to an individual `y`, then `y` cannot be connected by `p` to `x`.
An object property reflexivity axiom states 
that the object property expression `p` is reflexive — that is, 
each individual is connected by `p` to itself.
An object property irreflexivity axiom states 
that the object property expression `p` is irreflexive — that is, 
no individual is connected by `p` to itself. 

## Instances or individuals

The Individual (or Instance in terms of legacy OntModel) is present 
by the class [OntIndividual](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntIndividual.html). 
The definition of individual is a class-assertion `a rdf:type C.`, where `C` is `OntClass` and `a` is IRI or Blank Node. 
Thus, unlike legacy Jena OntModel, in general not every resource can be represented as an `OntIndividual`, 
although this is true in some specifications, such as `OntSpecification.OWL1_FULL_MEM_RDFS_INF`.

There are several ways to create individuals. 

    OntClass c = m.createOntClass( NS + "SomeClass" );

    // first way: use a call on OntModel
    OntIndividual ind0 = m.createOntIndividual( NS + "ind0", c );
    OntIndividual ind1 = m.createOntIndividual( null, c );

    // second way: create a named (uri) individual; this way works for OWL2 ontologies
    OntIndividual ind2 = m.createOntIndividual( NS + "ind0" );

    // third way: use a call on OntClass
    OntIndividual ind3 = c.createIndividual( NS + "ind1" );
    OntIndividual ind4 = c.createIndividual();

There is a wide range of methods for listing and manipulating related individuals, classes and properties.
For listing methods see the table:

Method | Effect
------ | ------
sameIndividuals | Lists all same individuals. The pattern to search for is `ai owl:sameAs aj`, where `ai` is this individual.
disjoints | Lists all `OntDisjoint` sections where this individual is a member.
differentIndividuals | Lists all different individuals. The pattern to search for is `ai owl:differentFrom aj`, where `ai` is this individual.
positiveAssertions | Lists all positive assertions for this individual (`ai PN aj`, `a R v`, where `PN` is named object property, `R` is a data property, `v` is a literal).
negativeAssertions | Lists all negative property assertions for this individual.
classes | Returns all class types

The most important method here is `classes`.
The interface `OntIndividual` provides a set of methods for testing and manipulating
the ontology classes to which an individual belongs. This is a
convenience: OWL and RDFS denote class membership through the
`rdf:type` property.
There are methods `OntIndividual#classes(boolean direct)`, `#classes()`, `addClassAssertion`, `hasOntClass`, `ontClass`,
`attachClass`, `dettachClass` for listing, 
getting and setting the `rdf:type` of an individual, 
which denotes a class to which the resource belongs (noting that, in RDF and OWL, a resource can belong to many classes at once).
The `rdf:type` property is one for which many entailment rules are defined in the semantic models of the various ontology languages. 
Therefore, the values that `classes()` returns is more than usually dependent on the reasoner bound to the ontology model. 
For example, suppose we have class `A`, class `B` which is a subclass of `A`, and resource `x` whose asserted `rdf:type` is `B`. 
With no reasoner, listing `x`'s RDF types will return only `B`. 
If the reasoner is able to calculate the closure of the subclass hierarchy (and most can), 
`x`'s RDF types would also include `A`. 
A complete OWL reasoner would also infer that `x` has `rdf:type` `owl:Thing` and `rdf:Resource`.

For some tasks, getting a complete list of the RDF types of a resource is exactly what is needed. 
For other tasks, this is not the case. 
If you are developing an ontology editor, for example, 
you may want to distinguish in its display between inferred and asserted types. 
In the above example, only `x rdf:type B` is asserted, everything else is inferred. 
One way to make this distinction is to make use of the base model (see Figure 4). 
Getting the resource from the base model and listing the type properties 
there would return only the asserted values. 
For example:

    // create the base model
    String source = "https://www.w3.org/TR/2003/PR-owl-guide-20031215/wine";
    String ns = "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#";
    OntModel base = OntModelFactory.createModel( OntSpecification.OWL2_DL_MEM );
    base.read( source, "RDF/XML" );

    // create the reasoning model using the base
    OntModel inf = OntModelFactory.createModel( base.getGraph(), OntSpecification.OWL2_DL_MEM_RDFS_INF );

    // create a country for this example
    OntIndividual p1 = base.getIndividual( ns + "CorbansPrivateBinSauvignonBlanc");

    // list the asserted types
    p1.classes().forEach(clazz -> System.out.println( p1.getURI() + " is asserted in class " + clazz ));

    // list the inferred types
    OntIndividual p2 = inf.getIndividual( ns + "CorbansPrivateBinSauvignonBlanc");
    p2.classes().forEach(clazz -> System.out.println( p2.getURI() + " is inferred to be in class " + clazz ));

For other user interface or presentation tasks, 
we may want something between the complete list of types and the base list of only the asserted values. 
Consider the class hierarchy in figure 5 (i):

![Diagram showing direct relationships](./direct-hierarchy.png "asserted and direct relationships")
<br />Figure 5: asserted and inferred relationships

Figure 5 (i) shows a base model, containing a class hierarchy and an instance `x`. 
Figure 5 (ii) shows the full set of relationships that might be inferred from this base model. 
In Figure 5 (iii), we see only direct or maximally specific relationships. 
For example, in 5 (iii) `x` does not have `rdf:type` `A`, 
since this is a relationship covered by the fact that `x` has `rdf:type` `D`, 
and `D` is a subclass of `A`. 
Notice also that the `rdf:type` `B` link is also removed from the direct graph, for a similar reason. 
Thus, the direct graph hides relationships from both the inferred and asserted graphs. 
When displaying instance `x` in a user interface, particularly in a tree view of some kind, 
the direct graph is often the most useful as it contains the useful information in the most compact form.

## Ontology meta-data

In OWL, but not RDFS, meta-data about the ontology
itself is encoded as properties on a resource of type
`owl:Ontology`. By convention,
the URI of this individual is the URL, or web address, of the ontology document
itself. In the XML serialisation, this is typically shown as:

    <owl:Ontology rdf:about="">
    </owl:Ontology>

Note that the construct `rdf:about=""` does *not* indicate a
resource with no URI; it is in fact a shorthand way of referencing
the *base URI* of the document containing the ontology. The base
URI may be stated in the document through an `xml:base` declaration
in the XML preamble. The base URI can also be specified when
reading the document via Jena's Model API (see the `read()` methods
on [`OntModel`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntModel.html)
for reference).

We can attach various meta-data statements to this object to
indicate attributes of the ontology as a whole, using the Java object
`OntID`:

    m.getID()
            .annotate(m.getAnnotationProperty(OWL2.backwardCompatibleWith), m.createResource("http://example.com/v1"))
            .annotate(m.getRDFSSeeAlso(), m.createResource("http://example.com/v2"))
            .addComment("xxx");


In the Jena API, the ontology's metadata properties can be accessed
through the
[`OntID`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/model/OntID.html)
interface. Suppose we wish to know the list of URI's that the
ontology imports. First, we must obtain the resource representing the
ontology itself:

    OntModel m = ...;  
    OntID id = m.getID();
    id.imports().forEach( System.out::println );

Note that in OWL2 ontology document should contain one and only one ontology header (i.e. `OntID`).
The `OntModel#getID` method will generate the ontology header if it is missing.

A common practice is also to use the Ontology element to attach
[Dublin Core metadata](http://dublincore.org/)
to the ontology document. Jena provides a copy
of the Dublin Core vocabulary, in `org.apache.jena.vocabulary.DCTerms`.
To attach a statement saying that the ontology was authored by John
Smith, we can say:

    OntID ont = m.getID();
    ont.addProperty( DCTerms.creator, "John Smith" );

It is also possible to programmatically add imports and other
meta-data to a model, for example:

    String base = ...; // the base URI of the ontology
    OntModel m = ...;

    OntID ont = m.setID( base );
    ont.addImport( "http://example.com/import1" );
    ont.addImport( "http://example.com/import2" );

Note that under default conditions, simply adding (or removing) an
`owl:imports` statement to a model will not cause the corresponding
document to be imported (or removed).
However, if model created with `GraphRepository` attached, it will start noticing
the addition or removal of `owl:imports` statements.

## Ontology inference: overview

You have the choice of whether to use the Ontology API with Jena's
reasoning capability turned on, and, if so, which of the various
reasoners to use. Sometimes a reasoner will add information to the
ontology model that it is not useful for your application to see. A
good example is an ontology editor. Here, you may wish to present
your users with the information they have entered in to their
ontology; the addition of the entailed information into the
editor's display would be very confusing. Since Jena does not have
a means for distinguishing inferred statements from those
statements asserted into the base model, a common choice for
ontology editors and similar applications is to run with no
reasoner.

In many other cases, however, it is the addition of the reasoner
that makes the ontology useful. For example, if we know that John
is the father of Mary, we would expect a 'yes' if we query whether
John is the parent of Mary. The parent relationship is not
asserted, but we know from our ontology that `fatherOf` is a
sub-property of `parentOf`. If 'John fatherOf Mary' is true, then
'John parentOf Mary' is also true. The integrated reasoning
capability in Jena exists to allow just such entailments to be seen
and used.

For a complete and thorough description of Jena's inference
capabilities, please see the
[reasoner documentation](/documentation/inference/). This section of
of the ontology API documentation is intended to serve as only a
brief guide and overview.

Recall from the introduction that the reasoners in Jena operate by
making it appear that triples *entailed* by the inference engine
are part of the model in just the same way as the asserted triples
(see Figure 2). The underlying architecture allows the reasoner to
be part of the same Java virtual machine (as is the case with the
built-in rule-based reasoners), or in a separate process on the
local computer, or even a remote computer. Of course, each of these
choices will have different characteristics of what reasoning
capabilities are supported, and what the implications for
performance are.

The reasoner attached to an ontology model, if any, is specified
through the
[`OntSpecification`](/documentation/javadoc/jena/org.apache.jena.ontapi/org/apache/jena/ontapi/OntSpecification.html).
The Java object `OntSpecification` has two parameters: `OntPersonality` and `ReasonerFactory`.
The `ReasonerRegistry` provides a collection of pre-built reasoners &ndash;
see the reasoner documentation for more details. However, it is
also possible for you to define your own reasoner that conforms to
the appropriate interface. For example, there is an in-process
interface to the open-source
[Pellet reasoner](https://github.com/stardog-union/pellet).

To facilitate the choice of reasoners for a given model, some
common choices have been included in the pre-built ontology model
specifications available as static fields on `OntSpecification`. The
available choices are described in the section on
[ont model specifications](#creating-ontology-models), above.

Depending on which of these choices is made, the statements
returned from queries to a given ontology model may vary
considerably.

### Additional notes

Jena's inference machinery defines some specialised services that
are not exposed through the addition of extra triples to the model.
These are exposed by the
[`InfModel`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/InfModel.html)
interface; for convenience there is the method `OntModel#asInferenceModel()` to make
these services directly available to the user. Please note that
calling this method on an ontology model that does
not contain a reasoner will cause an error. 

In general, inference models will add many additional
statements to a given model, including the axioms appropriate to
the ontology language. This is typically not something you will
want in the output when the model is serialized, so
*`write()` on an ontology model **will only write the statements from the base model**.*
This is typically the desired behaviour, but there are occasions
(e.g. during debugging) when you may want to write the entire
model, virtual triples included. The easiest way to achieve this is
to call the `writeAll()` method on `OntModel`. An alternative
technique, which can sometimes be useful for a variety of
use-cases, including debugging, is to snapshot the model by
constructing a temporary plain model and adding to it: the contents
of the ontology model:

    OntModel m = ...

    // snapshot the contents of ont model om
    Model snapshot = ModelFactory.createDefaultModel();
    snapshot.add( om );


## Working with persistent ontologies

A common way to work with ontology data is to load the ontology
axioms and instances at run-time from a set of source documents.
This is a very flexible approach, but has limitations. In
particular, your application must parse the source documents each
time it is run. For large ontologies, this can be a source of
significant overhead. Jena provides an implementation of the RDF
model interface that stores the triples persistently in a database.
This saves the overhead of loading the model each time, and means
that you can store RDF models significantly larger than the
computer's main memory, but at the expense of a higher overhead (a
database interaction) to retrieve and update RDF data from the
model. In this section we briefly discuss using the ontology API with
Jena's persistent database models.

For information on setting-up and accessing the persistent models
themselves, see the [TDB](/documentation/tdb/index.html)
reference sections.

There are two somewhat separate requirements for persistently
storing ontology data. The first is making the main or base model
itself persistent. The second is re-using or creating persistent
models for the imports of an ontology. These two requirements are
handled slightly differently.

To retrieve a Jena model from the database API, we have to know its
name. Fortunately, common practice for ontologies on the Semantic
Web is that each is named with a URI. We use this URI to name the
model that is stored in the database. Note carefully what is
actually happening here: we are exploiting a feature of the
database sub-system to make persistently stored ontologies easy to
retrieve, but we are not in any sense resolving the URI of the
model. Once placed into the database, the name of the model is
treated as an opaque string.

To create a persistent model for the ontology
`http://example.org/Customers`, we create a model maker that will
access our underlying database, and use the ontology URI as the
database name. We then take the resulting persistent model, and use
it as the base model when constructing an ontology model:

    Graph base = getMaker().createGraph( "http://example.org/Customers" );
    OntModel m = OntModelFactory.createModel( base, OntSpecification.OWL2_DL_MEM );

Here we assume that the `getMaker()` method returns a suitably
initialized `GraphMaker` that will open the connection to the
database. This step only creates a persistent model named with the
ontology URI. To initialise the content, we must either add
statements to the model using the OntModel API, or do a one-time
read from a document:

    m.read( "http://example.org/Customers" );

Once this step is completed, the model contents may be accessed in
future without needing to read again.

**Note on performance** The built-in Jena reasoners, including the
rule reasoners, make many small queries into the model in order to
propagate the effects of rules firing. When using a persistent
database model, each of these small queries creates an SQL
interaction with the database engine. This is a very inefficient
way to interact with a database system, and performance suffers as
a result. Efficient reasoning over large, persistent databases is
currently an open research challenge. Our best suggested
work-around is, where possible, to snapshot the contents of the
database-backed model into RAM for the duration of processing by
the inference engine. An alternative solution, that may be
applicable if your application does not write to the datastore
often, is to precompute the inference closure of the ontology and
data in-memory, then store that into a database model to be queried
by the run-time application. Such an off-line processing
architecture will clearly not be applicable to every application
problem.