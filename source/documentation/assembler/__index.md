---
title: Jena assembler quickstart
slug: index
---

Jena's assembler provides a means of constructing Jena models
according to a recipe, where that recipe is itself stated in
RDF. This is the Assembler quickstart page. For more detailed
information, see the [Assembler howto](assembler-howto.html)
or [Inside assemblers](inside-assemblers.html).

## What is an Assembler specification?

An Assembler *specification* is an RDF description of how to
construct a model and its associated resources, such as reasoners,
prefix mappings, and initial content. The Assembler vocabulary is
given in the [Assembler schema](assembler.ttl),
and we'll use the prefix `ja` for its identifiers.

## What is an Assembler?

An *Assembler* is an object that implements the `Assembler`
interface and can construct objects (typically models) from
Assembler specifications. The constant `Assembler.general` is an
Assembler that knows how to construct some general patterns
of model specification.

## How can I make a model according to a specification?

Suppose the Model `M` contains an Assembler specification whose
*root* - the Resource describing the whole Model to construct is
`R` (so `R.getModel() == M)`. Invoke:

```java
Assembler.general.openModel(R)
```

The result is the desired Model. Further details about the
`Assembler` interface, the special Assembler `general`, and the
details of specific Assemblers, are deferred to the
[Assembler howto](assembler-howto.html).

## How can I specify ...

In the remaining sections, the object we want to describe is given
the root resource `my:root`.

### ... a memory model?

```turtle
my:root a ja:MemoryModel.
```

### ... an inference model?

```turtle
my:root
    ja:reasoner [ja:reasonerURL theReasonerURL] ;
    ja:baseModel theBaseModelResource
    .
```

*theReasonerURL* is one of the reasoner (factory) URLs given in the
inference documentation and code; *theBaseModelResource* is another
resource in the same document describing the base model.

### ... some initialising content?

```turtle
my:root
    ja:content [ja:externalContent <someContentURL>]
    ... rest of model specification ...
    .
```

The model will be pre-loaded with the contents of *someContentURL*.

### ... an ontology model?

```turtle
my:root
    ja:ontModelSpec ja:OntModelSpecName ;
    ja:baseModel somebaseModel
    .
```

The *OntModelSpecName* can be any of the predefined Jena
OntModelSpec names, eg `OWL_DL_MEM_RULE_INF`. The baseModel is
another model description - it can be left out, in which case you
get an empty memory model. See
[Assembler howto](assembler-howto.html) for construction of
non-predefined OntModelSpecs.


