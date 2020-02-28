---
title: Jena Permissions - A Permissions wrapper around the Jena RDF implementation
slug: index
---

Jena Permissions is a SecurityEvaluator interface and a set of dynamic proxies that apply that interface to Jena Graphs, Models, and associated methods and classes. It does not implement any specific security policy but provides a framework for developers or integrators to implement any desired policy.

## Documentation

- [Overview](index.html#overview)
- [Usage Notes](index.html#usage-notes)
- [Design](design.html)
- [Security Evaluator implementation](evaluator.html)
- [Assembler for a Secured Model](assembler.html)
- [Adding Jena Permissions to Fuseki](example.html)

## Overview

Jena Permissions transparently intercepts calls to the Graph or Model interface, evaluates access restrictions and either allows or rejects the access. The system is authentication agnostic and will work with most authentication systems. The system uses dynamic proxies to wrap any Graph or Model implementation. The Jena Permissions module includes an Assembler module to extend the standard Assembler to include the ability to create secured models and graphs. A complete example application is also available.

The developer using Jena Permissions is required to implement a SecurityEvaluator that provides access to the Principal (User) using the system and also determines if that Principal has the proper access to execute a method. Through the SecurityEvaluator the developer may apply full CRUD (Create, Read, Update, and Delete) restrictions to graphs and optionally triples within the graphs.

The javadocs have additional annotations that specify what permissions at graph and triple levels are required for the user to execute the method.

There is an example jar that contains configuration examples for both a stand alone application and a Fuseki configuration option.

## Usage Notes

When the system is correctly configured the developer creates a SecuredGraph by calling `Factory.getInstance( SecurityEvaluator, String, Graph );`. Once created the resulting graph automatically makes the appropriate calls to the SecurityEvaluator before passing any approved requests to the underlying graph.

Secured models are created by calling `Factory.getInstance( SecurityEvaluator, String, Model );` or `ModelFactory.createModelForGraph( SecuredGraph );`

**NOTE:** when creating a model by wrapping a secured graph (e.g. `ModelFactory.createModelForGraph( SecuredGraph );`) the resulting Model does not have the same security requirements that the standard secured model. For example When creating a list on a secured model calling `model.createList( RDFNode[] );`, the standard secured model verifies that the user has the right to **update** the triples and allows or denies the entire operation accordingly. The wrapped secured graph does not have visibility to the `createList()` command and can only operate on the instructions issued by the `model.createList()` implementation. In the standard implementation the model requests the graph to delete one triple and then insert another. Thus the user must have **delete** and **add** permissions, not the **update** permission.

There are several other cases where the difference in the layer can trip up the security system. In all known cases the result is a tighter security definition than was requested. For simplicity sake we recommend that the wrapped secured graph only be used in cases where access to the graph as a whole is granted/denied. In these cases the user either has all CRUD capabilities or none.
