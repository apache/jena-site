---
title: Reification styles (archive material)
aliases:
    - /documentation/notes/reification-previous.html
---

## Reification styles

Prior to version 2.10.0 of Jena, there were 3 styles of reification, 
"standard", "minimal" and "convenient".  As of 2.10.0 and later, only 
what was previously the "standard" style is supported.

By default and as you might expect, Jena models allow reification
quads to be manifested as `ReifiedStatement`s. Similarly,
explicitly created `ReifiedStatement`s are visible as statement
quads.

Sometimes, this is not desirable. For example, in an application
that reifies large numbers of statements in the same model as those
statements, most of the results from `listStatements()` will be
quadlets; this is inefficient and confusing. One choice is to reify
the statements in a *different* model. Another is to take advantage
of *reification styles*.

Each model has a reification style, described by constants in
`ModelFactory`. The default style is called `Standard` because it
behaves more closely to the RDF standard. There are two other
reification styles to choose from:

-   `Convenient`: reification quadlets are not visible in the
    results of `listStatements)()`. Otherwise everything is normal;
    quadlets that are added to the model contribute to
    `ReifiedStatement` construction.
-   `Minimal`: reification quadlets play no role at all in the
    construction of `ReifiedStatement`s, which can only be created by
    the methods discussed earlier. This style is most similar to that
    of Jena 1.

The method `ModelFactory.createDefaultModel()` takes an optional
`Style` argument, which defaults to `Standard`. Similarly,
`createFileModelMaker()` and `createMemModelMaker()` can take
`Style` arguments which are applied to every model they create.
To take a model with hidden reification quads and expose them as
statements, the method `ModelFactory.withHiddenStatements(Model m)`
produces a new model which does just that.
