---
title: Inside assemblers
---

This document describes Jena's built-in assembler classes and how
to write and integrate your own assemblers. If you just need a
quick guide to the common model specifications, see the
[assembler quickstart](index.html); if you want more details on
writing assembler descriptions, see the
[assembler howto](assembler-howto.html).

## The Assembler interface

An `Assembler` is an object that builds objects (most importantly,
`Model`s) from RDF descriptions.

```java
public Object open( Assembler a, Resource root, Mode mode );

public Object open( Assembler a, Resource root );

public Object open( Resource root );

public Model openModel( Resource root );

public Model openModel( Resource root, Mode mode );
```

The fundamental method is the first: all the others are shorthands
for ways of calling it. The abstract class `AssemblerBase`
implements `Assembler` leaving only that method abstract and
defining the others in terms of it.

The definition of `a.open(Assembler sub, Resource root, Mode mode)`
is that `a` will construct the object described by the properties
of `root`. If this requires the construction of sub-objects from
descriptions hanging off `root`, `sub.open` is to be used to
construct those. If the object is to be constructed in some
persistent store, `mode` defines whether objects can be re-used or
created: see [modes](#modes) for more details.

## Builtin assemblers

Jena comes with a collection of built-in assemblers: various
*basic assemblers* and a composite *general assembler*. Each of
these assemblers has a constant instance declared as a field of
`Assembler`.

Assembler | Result class | Type  constant
--------- | ------------ | --------------
*Temporarily omitted as the source got scrambled by the Markdown import* **TODO**

## Inside Assemblers

`Assembler.general` is a particular implementation of the
`Assembler` interface. An `Assembler` knows how to build the
objects - not just models - described by an Assembler
specification. The normal route into an Assembler is through the
method:

-   open( Resource root ) ? Object

The Assembler inspects the `root` resource properties and decides
whether it can build an object with that description. If not, it
throws an exception. Otherwise, it constructs and returns a
suitable object.
Since the creation of Models is the reason for the existence of
Assemblers, there is a convenience wrapper method:

-   openModel( Resource root ) ? Model

which constructs the object and checks that it's a Model before
returning it.
When an `Assembler` requires sub-objects (for example, when an
InfModel Assembler requires a Reasoner object), it uses the
method:

-   open( Assembler sub, Resource root ) ? Model

passing in a suitable Assembler object. In fact the standard
implementation of `open(root)` is just
-   open( this, root )

passing in itself as the sub-assembler and having
`open(Assembler,Resource)` be the place where all the work is done.
(Amongst other things, this makes testing easier.)
When working with named persistent objects (typically database
models), sometimes you need to control whether new objects should
be constructed or old models can be reused. There is an additional
method

-   open( Assembler sub, Resource root, Mode mode )

where the `Mode` argument controls the creation (or not) of
persistent models. The mode is passed down to all sub-object
creation. The standard implementation of `open(sub,root)` is just:
-   open( sub, root, Mode.DEFAULT )

A `Mode` object has two methods:
-   permitCreateNew( Resource root, String name )
-   permitUseExisting( Resource root, String name )

`root` is the root resource describing the object to be created or
reused, and `name` is the name given to it. The result is `true`
iff the permission is granted. `Mode.DEFAULT` permits the reuse of
existing objects and denies the creation of new ones.
There are four `Mode constants:`

-   Mode.DEFAULT - reuse existing objects
-   Mode.CREATE - create missing objects
-   Mode.REUSE - reuse existing objects
-   Mode.ANY - reuse existing objects, create missing ones

Since the `Mode` methods are passed the resource root and name, the
user can write specialised `Mode`s that look at the name or the
other root properties to make their decision.
Note that the Modes only apply to persistent objects, so *eg*
MemoryModels or PrefixMappings ignore their Mode arguments.

## Implementing your own assemblers

(Temporary documentation pasted in from email; will be integrated
and made nice RSN.)

    You have to implement the Assembler interface, most straightforwardly
    done by subclassing AssemblerBase and overriding

        public Object open( Assembler a, Resource root, Mode mode );

        because AssemblerBase both implements the boring methods that are
        just specialisations of `open` and provides some utility methods
        such as getting the values of unique properties. The arguments are

        * a -- the assembler to use for any sub-assemblies
        * root -- the resource in the assembler description for this object
        * mode -- the persistent open vs create mode

        The pattern is to look for the known properties of the root, use
        those to define any sub-objects of the object you're assembling
        (including using `a` for anything that's itself a structured
        object) and then constructing a new result object from those
        components.

        Then you attach this new assembler object to its type in some
        AssemblerGroup using that group's `implementWith` method. You
        can attach it to the handy-but-public-and-shared group
        `Assembler.general` or you can construct your own group. The
        point about an AssemblerGroup is that it does the type-to-assembler
        mapping for you -- and when an AssemblerGroup calls a component
        assembler's `open` method, it passes /itself/ in as the `a` argument,
        so that the invoked assembler has access to all of the component
        assemblers of the Group.

## basic assemblers

There is a family of *basic assemblers*, each of which knows how to
assemble a specific kind of object so long as they're given an
Assembler that can construct their sub-objects. There are defined
constants in `Assembler` for (an instance of) each of these basic
assembler classes.

produces | Class | Type | constant
-------- | ----- | ---- | --------
default models | DefaultModelAssembler | ja:DefaultModel | defaultModel
memory models | MemoryModelAssembler | ja:MemoryModel | memoryModel
inference models| InfModelAssembler | ja:InfModel | infModel
reasoners | ReasonerAssembler | ja:Reasoner | reasoner
content | ContentAssembler | ja:Content | content
ontology models | OntModelAssembler | ja:OntModel | ontModel
rules | RuleSetAssembler | ja:RuleSet | rules
union models | UnionModelAssembler | ja:UnionModel | unionModel
prefix mappings | PrefixMappingAssembler | ja:PrefixMapping | prefixMapping
file models | FileModelAssembler | ja:FileModel | fileModel

`Assembler.general` is an *assembler group*, which ties together
those basic assemblers. `general` can be extended by Jena coders if
required. Jena components that use Assembler specifications to
construct objects will use `general` unless documented otherwise.

In the remaining sections we will discuss the `Assembler` classes
that return non-Model objects and conclude with a description of
`AssemblerGroup`.

### Basic assembler ContentAssembler

The ContentAssembler constructs Content objects (using the
`ja:Content` vocabulary) used to supply content to models. A
Content object has the method:

-   fill( Model m ) ? m

Invoking the `fill` method adds the represented content to the
model. The supplied ModelAssemblers automatically apply the
`Content` objects corresponding to `ja:content` property values.

### Basic assembler RulesetAssembler

A RulesetAssembler generates lists of Jena rules.

### Basic assembler DefaultModelAssembler

A "default model" is a model of unspecified type which is
implemented as whatever kind the assembler for `ja:DefaultModel`
generates. The default for a DefaultModel is to create a
MemoryModel with no special properties.

### AssemblerGroup

The AssemblerGroup class allows a bunch of other Assemblers to be
bundled together and selected by RDF type. AssemblerGroup
implements Assembler and adds the methods:

-   implementWith( Resource type, Assembler a ) ? this
-   assemblerFor( Resource type ) ? Assembler

AssemblerGroup's implementation of `open(sub,root)` finds the
*most specific type* of `root` that is a subclass of `ja:Object`
and looks for the Assembler that has been associated with that type
by a call of `implementWith`. It then delegates construction to
that Assembler, passing *itself* as the sub-assembler. Hence each
component Assembler only needs to know how to assemble its own
particular objects.

The `assemblerFor` method returns the assembler associated with the
argument type by a previous call of `implementWith`, or `null` if
there is no associated assembler.

### Loading assembler classes

AssemblerGroups implement the `ja:assembler` functionality. The
object of an `(type ja:assembler "ClassName")` statement is a
string which is taken as the name of an `Assembler` implementation
to load. An instance of that class is associated with `type` using
`implementWith`.

If the class has a constructor that takes a single `Resource`
object, that constructor is used to initialise the class, passing
in the `type` subject of the triple. Otherwise the no-argument
constructor of the class is used.



