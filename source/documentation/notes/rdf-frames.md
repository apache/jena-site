---
title: Presenting RDF as frames
---

The origins of RDF as a representation language include
*frame languages*, in which an object, or frame, was the main unit
of structuring data. Frames have *slots*, for example a `Person`
frame might have an `age` slot, a `height`slot etc. RDF, however,
has taken a step beyond frame languages by making `rdf:Property` a
first class value, not an element of a frame or resource *per se*.
In RDF, for example, an age property can be defined:
`<rdf:Property rdf:ID="age">`, and then applied to any resource,
including, but not limited to a `Person` resource.

While this introduces an extra element of modelling flexibility in
RDF, it is often the case that users want to treat some components
in their models in a more structured way, similar to the original
idea of frames. It is often assumed that `rdfs:domain` restricts a
property to be used only on resources that are in the domain class.
For example, a frequently asked question on the Jena support list
is why the following is not an error:

      <rdfs:Class rdf:ID="Person" />
      <rdfs:Class rdf:ID="Truck" />
      <rdf:Property rdf:ID="age">
        <rdfs:domain rdf:resource="Person" />
      </rdf:Property>

      <Truck rdf:ID="truck1">
        <age>2</age>
      </Truck>

Whereas many object-oriented or frame-oriented representations
would regard it as an error that the `age` property was not being
applied to a `Person`, RDF-based applications are simply entitled
to infer that `truck1` is a (that is, has `rdf:type`) `Truck` as
well as a `Person`. This is unlikely to be the case in any
real-world domain, but it is a valid RDF inference.

A consequence of RDF's design is that it is not really possible to
answer the commonly asked question "Which properties can be applied
to resources of class *C*?". Strictly speaking, the RDF answer is
"Any property". However, many developers have a legitimate
requirement to present a composite view of classes and their
associated properties, forming more a more succinct structuring of
an ontology or schema. The purpose of this note is to explain the
mechanisms built-in to Jena to support a frame-like view of
resources, while remaining correct with respect to RDF (and OWL)
semantics.

## Basic principles: the properties of a class

Since any RDF property can be applied to any RDF resource, we
require a definition of the properties of a given class that
respects RDF semantics. Consider the following RDF fragment:

      <rdfs:Class rdf:ID="Person" />
      <rdf:Property rdf:ID="age" />

      <Person rdf:ID="jane_doe">
        <age>23</a>
      </Person>

Now consider that we add to this fragment that:

      <rdf:Property rdf:about="age">
        <rdfs:domain rdf:resource="Person" />
      </rdf:Property>

This additional information about the domain of the `age` property
does not add any new entailments to the model. Why? Because we
already know that `jane_doe` is a Person. So we can consider `age`
to be one of the properties of `Person` type resources, because if
we use the property as a predicate of that resource, it doesn't add
any new `rdf:type` information about the resource. Conversely, if
we know that some resource has an `age`, we don't learn any new
information by declaring that it has `rdf:type Person`. In summary,
for the purposes of this HOWTO we define the
*properties of a class* as just those properties that don't entail
any new type information when applied to resources that are already
known to be of that class.

## Sub-classes, and more complex class expressions

Given these basic principles, now consider the following RDF
fragment:

      <rdfs:Class rdf:ID="LivingThing" />

      <rdfs:Class rdf:ID="Animal">
        <rdfs:subClassOf rdf:resource="#LivingThing">
      </rdfs:Class>

      <rdfs:Class rdf:ID="Mammal">
        <rdfs:subClassOf rdf:resource="#Animal">
      </rdfs:Class>

      <rdf:Property rdf:ID="hasSkeleton">
        <rdfs:domain rdf:resource="Animal" />
      </rdf:Property>

Is `hasSkeleton` one of the properties of `Animal`? Yes, because
any resource of `rdf:type Animal` can have a `hasSkeleton` property
(with value either true or false) without adding type information.
Similarly, any resource that is a `Mammal` also has
`rdf:type Animal` (by the sub-class relation), so `hasSkeleton` is
a property of `Mammal`. However, `hasSkeleton` is *not* a property
of `LivingThing`, since we don't automatically know that a living
thing is an animal - it may be a plant. Stating that a given
`LivingThing` has a `hasSkeleton` property, even if the value is
false, would entail the additional `rdf:type` statement that the
`LivingThing` is also an `Animal`.

For more complex class expressions in the domain, we look to see
what simple domain constraints are entailed. For example, a domain
constraint `A ∩ B` (i.e. "A intersection B") for property `p`
entails that both `p rdfs:domain A` and `p rdfs:domain B` are true.
However, the properties of neither `A` nor `B` will include `p`. To
see this, suppose we have a resource `x` that we already know is of
type `A`, and a statement `x p y`. This entails `x rdf:type A`
which we already know, but also `x rdf:type B`. So information is
added, even if we know that `x` is an instance `A`, so `p` is not a
property of `A`. The symmetrical argument holds for `p` not being a
property of `B`.

However, if the domain of `p` is `A ∪ B` (i.e. "A union B"), then
both `A` and `B` will have `p` as a property, since an occurrence
of, say `x p y` does not allow us to conclude that either
`x rdf:type A` or `x rdf:type B`.

## Property hierarchies

Since sub-properties inherit the domain constraints of their parent
property, the properties of a class will include the closure over
the sub-property hierarchy. Extending the previous example, the
properties of `Animal` and `Mammal` include both `hasSkeleton` and
`hasEndoSkeleton`:

      <rdf:Property rdf:ID="hasSkeleton">
        <rdfs:domain rdf:resource="Animal" />
      </rdf:Property>

      <rdf:Property rdf:ID="hasEndoSkeleton">
        <rdfs:subPropertyOf rdf:resource="#hasSkeleton" />
      </rdf:Property>

In general, there may be many different ways of deducing simple
domain constraints from the axioms asserted in the ontology.
Whether or not all of these possible deductions are present in any
given RDF model depends on the power and completeness of the
reasoner bound to that model.

## Global properties

Under the principled definition that we propose here, properties
which do not express a domain value are *global*, in the sense that
they can apply to any resource. They do not, by definition, entail
any new type information about the individuals they are applied to.
Put another way, the domain of a property, if unspecified, is
either `rdfs:Resource` or `owl:Thing`, depending on the ontology
language. These are simply the types that all resources have by
default. Therefore, every class has all of the global properties as
one of the properties of the class.

A commonly used idiom in some OWL ontologies is to use
*Restrictions* to create an association between a class and the
properties of instances of that class. For example, the following
fragment shows that all instances of `Person` should have a
`familyName` property:

      <owl:Class rdf:ID="Person">
        <rdfs:subClassOf>
          <owl:Restriction>
            <owl:onProperty rdf:resource="#familyName" />
            <owl:minCardinality rdf:datatype="&xsd;int">1</owl:minCardinality>
          </owl:Restriction>
        </rdfs:subClassOf>
      </owl:Class>

This approach shows the intent of the ontology designer that
`Person` instances have `familyName` properties. We do regard
`familyName` as one of the *properties of* `Person`, but only
because of the global properties principle. Unless a domain
constraint is also specified for `familyName`, it will appear as
one of the properties of classes other than `Person`.
**Note that this is a behaviour change from versions of Jena prior to release 2.2**.
Prior to this release, Jena used a heuristic method to attempt to
associate restriction properties with the classes sub-classing that
restriction. Since there were problems with precisely defining the
heuristic, and ensuring correct behaviour (especially with
inference models), we have dropped the use of this heuristic from
Jena 2.2 onwards.

## The Java API

Support for frame-like views of classes and properties is provided
through the [ontology API](../ontology/index.html). The following
methods are used to access the properties of a class, and the
converse for properties:

      OntClass.listDeclaredProperties();
      OntClass.listDeclaredProperties( boolean direct );
      OntClass.hasDeclaredProperty( Property prop, boolean direct );
      OntProperty.listDeclaringClasses();
      OntProperty.listDeclaringClasses( boolean direct );

All of the above API methods return a Jena
[`ExtendedIterator`](/documentation/javadoc/jena/org/apache/jena/util/iterator/ExtendedIterator.html).

**Note a change from the Jena 2.1 interface:** the optional Boolean
parameter on `listDeclaredProperties` has changed name from `all`
(Jena 2.1 and earlier) to `direct` (Jena 2.2 and later). The
meaning of the parameter has also changed: `all` was intended to
simulate some reasoning steps in the absence of a reasoner, whereas
`direct` is used to restrict the associations to only the local
associations. See more on
[direct associations](../ontology/index.html#direct_relationships).

A further difference from Jena 2.1 is that the models that are
constructed without reasoners perform only very limited simulation
of the inference closure of the model. Users who wish the declared
properties to include entailments will need to construct their
models with one of the built-in or external reasoners. The
difference is illustrated by the following code fragment:

      <rdfs:Class rdf:ID="A" />
      <rdfs:Property rdf:ID="p">
        <rdfs:domain rdf:resource="#A" />
      </rdfs:Property>
      <rdfs:Property rdf:ID="q">
        <rdfs:subPropertyOf rdf:resource="#p" />
      </rdfs:Property>

      OntModel mNoInf = ModelFactory.createOntologyModel( OntModelSpec.OWL_MEM );
      OntClass a0 = mNoInf.getOntClass( NS + "A" );
      Iterator i0 = a0.listDeclaredProperties();

      OntModel mInf = ModelFactory.createOntologyModel( OntModelSpec.OWL_MEM_RULE_INF );
      OntClass a1 = mInf.getOntClass( NS + "A" );
      Iterator i1 = a1.listDeclaredProperties();

Iterator `i1` will return `p` and `q`, while `i0` will return only
`p`.

## Summary of changes from Jena 2.2-beta-2 and older

For users updating code that uses `listDeclaredProperties` from
versions of Jena prior to 2.2-final, the following changes should
be noted:

-   Global properties
    `listDeclaredProperties` will treat properties with no specified
    domain as global, and regard them as properties of all classes. The
    use of the `direct` flag can hide global properties from non-root
    classes.
-   Restriction properties
    `listDeclaredProperties` no longer heuristically returns properties
    associated with a class via the `owl:onProperty` predicate of a
    restriction.
-   Limited simulated inference
    The old version of `listDeclaredProperties` attempted to simulate
    the entailed associations between classes and properties. Users are
    now advised to attach a reasoner to their models to do this.
-   Change in parameter semantics
    The old version of `listDeclaredProperties(boolean all)` took one
    parameter, a Boolean flag to indicate whether additional declared
    (implied) properties should be listed. Since this is now covered by
    the use, or otherwise, of a reasoner attached to the model, the new
    method signature is `listDeclaredProperties(boolean direct)`, where
    calling the method with `direct = true` will compress the returned
    results to use only the
    [direct](../ontology/index.html#direct_relationships)
    associations.



