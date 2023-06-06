---
title: Event handling in Jena
---

## ModelChangedListener

In Jena it is possible to monitor a `Model` for changes, so that
code can be run after changes are applied without the coding for
that Model having to do anything special. We call these changes
"events". This first
design and implementation is open for user comment and we may
refine or reduce the implementation as more experience is gained with
it.

To monitor a Model, you must *register* a *ModelChangedListener*
with that Model:

```java
Model m = ModelFactory.createDefaultModel();
ModelChangedListener L = new MyListener();
m.register( L );
```

*MyListener* must be an implementation of *ModelChangedListener*,
for example:

```java
class MyListener implements ModelChangedListener
{
    public void addedStatement( Statement s )
        { System.out.println( ">> added statement " + s ); }
    public void addedStatements( Statement [] statements ) {}
    public void addedStatements( List statements ) {}
    public void addedStatements( StmtIterator statements ) {}
    public void addedStatements( Model m ) {}
    public void removedStatement( Statement s ) {}
    public void removedStatements( Statement [] statements ) {}
    public void removedStatements( List statements ) {}
    public void removedStatements( StmtIterator statements ) {}
    public void removedStatements( Model m ) {}
}
```

This listener ignores everything except the addition of single
statements to *m*; those it prints out. The listener has a method
for each of the ways that statements can be added to a Model:

-   as a single statement, `Model::add(Statement)`
-   as an element of an array of statements,
    `Model::add(Statement[])`
-   as an element of a list of statements, `Model::add(List)`
-   as an iterator over statements, `Model::add(StmtIterator)`
-   as part of another Model, `Model::add(Model)`

(Similarly for *delete*.)

The listener method is called when the statement(s) have been added
to the Model, if no exceptions have been thrown. It does not matter
if the statement was *already* in the Model or not; it is the act
of adding it that fires the listener.

There is no guarantee that the statement, array, list, or model
that is added or removed is the same one that is passed to the
appropriate listener method, and the *StmtIterator* will never be
the same one. However, in the current design:

-   a single Statement will be .equals to the original Statement
-   a List will be .equals to the original List
-   a Statement[] will be the same length and have .equal elements
    in the same order
-   a StmtIterator will deliver .equal elements in the same order
-   a Model will contain the same statements

We advise not relying on these ordering properties; instead assume
that for any bulk update operation on the model, the listener will
be told the method of update and the statements added or removed,
but that the order may be different and duplicate statements may
have been removed.
Note in particular that a Model with any Listeners will have to
record the complete contents of any *StmtIterator* that is added or
removed to the model, so that the Model and the Listener can both
see all the statements.

Finally, there is no guarantee that *only* Statements etc added
through the Model API will be presented to the listener; any
Triples added to its underlying Graph will also be presented to the
listener as statements.

## Utility classes

The full Listener API is rather chunky and it can be inconvenient
to use, especially for the creation of inline classes. There are
four utility classes in *org.apache.jena.rdf.listeners:*

-   *NullListener*. This class's methods do nothing. This is useful
    when you want to subclass and intercept only specific ways of
    updating a Model.
-   *ChangedListener*. This class only records whether some change
    has been made, but not what it is. The method *hasChanged()*
    returns *true* if some change has been made since the last call of
    *hasChanged()* [or since the listener was created].
-   *StatementListener*. This class translates all bulk update
    calls (ie the ones other than *addedStatement()* and
    *removedStatement()*) into calls to
    *addedStatement()/removedStatement()* for each Statement in the
    collection. This allows statements to be tracked whether they are
    added one at a time or in bulk.
-   *ObjectListener*. This class translates all the listener calls
    into *added(Object)* or *removed(Object)* as appropriate; it is
    left to the user code to distinguish among the types of argument.

## When listeners are called

In the current implementation, listener methods are called
immediately the additions or removals are made, in the same thread
as the one making the update. If a model has multiple listeners
registered, the order in which they are informed about an update is
unspecified and may change from update to update. If any listener
throws an exception, that exception is thrown through the update
call, and other listeners may not be informed of the update.
Hence listener code should be brief and exception-free if at all
possible.

## Registering and unregistering

A listener may be registered with the same model multiple times. If
so, it will be invoked as many times as it is registered for each
update event on the model.

A listener *L* may be *unregistered* from a Model using the method
`unregister(L)`. If *L* is not registered with the model, nothing
happens.

If a listener is registered multiple times with the same model,
each `unregister()` for that listener will remove just one of the
registrations.

## Transactions and databases

In the current design, listeners are not informed of transaction
boundaries, and all events are fed to listeners as soon as they
happen.
