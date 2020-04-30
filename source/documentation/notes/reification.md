---
title: Reification HowTo
---

## Introduction

This document describes the Jena API support for reification.
it.  As always, consult the Javadoc for interface
details.

Reification in RDF and Jena is the ability to treat a `Statement`
as a `Resource`, and hence to make assertions *about* that
statement. A statement may be reified as many different resources,
allowing different manifestations ("statings") of that statement to
be treated differently if required.

RDF represents a reified statement as four statements with
particular RDF properties and objects: the statement `(S, P, O)`,
reified by resource `R`, is represented by:

-   `R rdf:type rdf:Statement`
-   `R rdf:subject S`
-   `R rdf:predicate P`
-   `R rdf:object O`

We shall call these four such statements a *reification quad* and
the components *quadlets*. Users of reification in Jena may, by
default, simply manipulate reified statements as these quads.
However, just as for `Bag`, `Seq`, `Alt` and `RDF lists` in
ordinary models, or ontology classes and individuals in
`OntModel`s, Jena has additional support for manipulating reified
statements. 

The interface `ReifiedStatement` is used to represent a reified
statement as a Jena `Resource` that has direct access to the
statement it reifies. The method

-   `ReifiedStatement::getStatement()`

returns the `Statement` that the resource is reifying. All the
other `Resource` methods, of course, may be applied to a
`ReifiedStatement`.

## Converting resources to reified statements

If a resource `R` is associated with a reified statement, but might
not itself be a `ReifiedStatement` object, the conversion method
`RDFNode::as(Class)` can be used to find (or create) a
`ReifiedStatement`:
-   `(ReifiedStatement) R.as(ReifiedStatement.class)`

For example, a model that has been read in from an RDF/XML file may
have reified statements: knowing the name of the resource allows a
ReifiedStatement object to be constructed without knowing the
statement itself.

If there is no such associated reified statement, a
`CannotReifyException` is thrown. To find out in advance if the
conversion is possible, use the predicate
`RDFNode::canAs(ReifiedStatement.class)`. (Jena only counts as "an
associated reified statement" a resource with exactly one
`rdf:subject`, `rdf:predicate`, and `rdf:object` which has
`rdf:type rdf:Statement`. It can of course have *other*
properties.)

## Testing statements for reification

You may wish to know if some `Statement` is reified. The methods
`Statement::isReified()` and `Model::isReified(Statement)` return
true if (and only if) the statement has been reified in the model.
Note that the `Statement` method tests to see if the statement is
reified in its own model, and the model method tests to see if the
`Statement` is reified in *that* model; there is no test to see if
a `Statement` is reified in any other models.

## Listing reified statements

Just as `listStatements` is used to find the statements present in
some model, there are methods for finding the reified statements of
a model. Each of them returns a `RSIterator` object, which is an
iterator each of whose elements are `ReifiedStatement`s and for
which the convenience method `nextRS()` will deliver a
suitably-cast reified statement.
-   `Statement::listReifiedStatements()` - all the reifications of
    this statement in its model.
-   `Model::listReifiedStatements()` - all the reified statements
    in this model.
-   `Model::listReifiedStatements(Statement s)` - all the reified
    statements reifying `s` in this model.

## Creating reified statements directly

You do not have to create reified statements by asserting the
quad into a `Model`; they can be created directly from their
`Statement`s using one of the methods:
-   `Statement::createReifiedStatement()`
-   `Statement::createReifiedStatement(String)`
-   `Model::createReifiedStatement(Statement)`
-   `Model::createReifiedStatement(String,Statement)`

Each of these returns a `ReifiedStatement` who's `getStatement()`
method delivers the original statement (actually, a `.equals()`
statement; it may not be the identical statement object). If the creation
method passed in a (non-null) `String`, the `ReifiedStatement` is a
named resource and that string is its URI. Otherwise it is a
newly-minted bnode. The methods on `Statement` create a reified
statement in that statements model; those on `Model` create a
reified statement in that model.

It is not permitted for two different (non-equals) statements to be
reified onto the same resource. An attempt to do so will generate
an `AlreadyReifiedException`.

The additional method `Model::getAnyReifiedStatement(Statement)`
returns some reification of the supplied `Statement`; an existing
one if possible, otherwise a fresh one (reified by a fresh bnode).

## Removing reified statements

There are two methods which remove all the reifications of a
`Statement` in some `Model`:
-   `Statement::removeReification()`
-   `Model::removeAllReifications(Statement)`

All the reified statements in the model that reify the given
statement are removed, whatever their reifying resource. To remove
a particular reified statement only, use
-   `Model::removeReification(ReifiedStatement)`

## Reification styles

Prior to version 2.10.0 of Jena, there were 3 styles of reification, 
"standard", "minimal" and "convenient".  As of 2.10.0 and later, only 
what was previously the "standard" style is supported.

The old documentation is [still available](reification_previous.html).
