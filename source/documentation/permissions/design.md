---
title: Jena Permissions - Design
---

Jena Permissions is designed to allow integrators to implement almost any security policy. Fundamentally it works by implementing dynamic proxies on top of the Jena Graph and Model interfaces as well as objects returned by those interfaces. The proxy verifies that the actions on those objects are permitted by the policy before allowing the actions to proceed.

The graph or model is created by the `org.apache.jena.permissions.Factory` object by wrapping a Graph or Model implementation and associating it with a URI (`graphIRI`) and a SecurityEvaluator implementation. The `graphIRI` is the URI that will be used to identify the graph/model to the security evaluator.

The SecurityEvaluator is an object implemented by the integrator to perform the necessary permission checks. A discussion of the SecurityEvaluator implementation can be found in the <a href="evaluator.html">Security Evaluator</a> documentation.

Access to methods in secured objects are determined by the CRUD (Create, Read, Update and Delete) permissions assigned to the user.

The system is designed to allow shallow (graph/model level) or deep (triple/statement level) decisions.

When a secured method is called the system performs the following checks in order:

* Determines if the user has proper access to the underlying graph/model. Generally the required permission is Update (for add or delete methods), or Read.

* If the user has access to the graph/model determine if the user has permission to execute the method against **all** triples/statements in the graph/model. This is performed by calling `SecurityEvaluator.evaluate(principal, action, graphIRI, Triple.ANY)`. If the evaluator returns `true` then the action is permitted. This is general case for shallow permission systems. For deep permissions systems `false` may be returned.

* if the user does not have permission to execute the method against **all** triples/statements the `SecurityEvaluator.evaluate(principal, action, graphIRI, triple)` method is called with the specific triple (note special cases below). If the evaluator returns `true` the action is permitted, otherwise a properly detailed PermissionDeniedException is thrown.

Special Cases
=============
SecurityEvaluator.FUTURE
------------------------

There are a couple of special cases where the Node/Resource is not known when the permission check is made. An example is the creation of a RDF List object. For example to create an empty list the following triple/statement must be constructed:

    _:b1 rdf:first rdf:nil .

However, the permissions system can not know the value of `_:b1` until after the triple/statement is constructed and added to the graph/model. To handle this situation the permissions system asks the evaluator to evaluate the triple: `(SecurityEvaluator.FUTURE, RDF.first, RDF.nill)` Similar situations are found when adding to a list, creating reified statements, RDF alt objects, RDF sequences, or RDF anonymous resources of a specific type.

SecurityEvaluator.VARIABLE
--------------------------
The `Node.ANY` node is used to identify the case where any node may be returned. Specifically it asks if the user can perform the action on **All** the nodes in this position in the triple. For example:

     Node.ANY RDF:type FOAF:Person

Asks if the operation can be performed on all of the nodes of type FOAF:Person.

The `SecurityEvaluator.VARIABLE` differs from `Node.ANY` in that the system is asking if there are any prohibitions, and not if the user may perform. Thus queries with the `VARIABLE` type node should return `true` where `ANY`
returns `false`. In general this type is used in query evaluation to determine if triple level filtering of results must be performed. Thus:

     SecurityEvaluator.VARIABLE RDF:type FOAF:Person

Asks if there are any restrictions against the user performing the action against all triples of type FOAF:Person. The assumption is that checking for restrictions may be a faster check than checking for all access. Note that by returning `true` the permissions system will check each explicit triple for access permissions. So if the system can not determine if there are access restrictions it is safe to return `true`.

Objects Returned from Secured Objects
=====================================

Models and Graphs often return objects from methods. For example the `model.createStatement()` returns a `Statement` object. That object holds a reference to the model and performs operations against the model (for example `Statement.changeLiteralObject()`). Since permissions provides a dynamic wrapper around the base model to create the secured model, returning the model `Statement` would return an object that no longer has any permissions applied. Therefore the permissions system creates a `SecuredStatement` that applies permission checks to all operations before calling the base `Statement` methods.

All secured objects return secured objects if those objects may read or alter the underlying graph/model.

All secured objects are defined as interfaces and are returned as dynamic proxies.

All secured objects have concrete implementations. These implementations must remain concrete to ensure that we handle all cases where returned objects may alter the underlying graph/model.

Secured Listeners
-----------------
Both the Graph and the Model interfaces provide a listener framework. Listeners are attached to the graph/model and changes to the graph/model are reported to them. In order to ensure that listeners do not leak information, the principal that was active when the listener was attached is preserved in a `CachedSecurityEvaluator` instance. This security evaluator implementation, wraps the original implementation and retains the current user. Thus when the listener performs the permission checks the original user is used not the current user. This is why the SecurityEvaluator **must** use the `principal` parameters and not call `getPrincipal()` directly during evaluation calls.

Proxy Implementation
====================
The proxy implementation uses a reflection `InvocationHandler` strategy. This strategy results in a proxy that implements all the interfaces of the original object. The original object along with its `InvocationHandler` instance are kept together in an `ItemHolder` instance variable in the secured instance. When the invoker is called it determines if the called method is on the secured interface or not. If the method is on the secured interface the invocation handler method is called, otherwise the method on the base class is called.
