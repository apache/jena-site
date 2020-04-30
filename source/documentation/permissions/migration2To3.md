---
title: "Jena Permissions - Migration notes: Version 2.x to Version 3.x"
---

When Jena moved from version 2 to version 3 there was a major renaming of packages. One of the packages renamed was the Jena Permissions package. It was formerly named Jena Security. There are several changes that need to occur to migrate from jena-security version 2.x to jena-permissions version 3.x.

Changes
=======

Package Rename
--------------

There are two major changes to package names.

* As with the rest of the Jena code all references to _com.hp.hpl.jena_ have been changed to _org.apache.jena_. For integrator code this means that a simple rename of the includes is generally all that is required for this. See the main Migration Notes page for other hints and tips regarding this change.

* Jena Security has been renamed Jena Permissions and the Maven _artifact id_ has been changed to _jena-permissions_ to reflect this change.

* The permissions assembler namespace has been changed to `http://apache.org/jena/permissions/Assembler#`

Exceptions
==========

Formerly Jena Permissions uses a single exception to identify the access restriction violations. With the tighter integration of permission concepts into the Jena core there are now 7 exceptions. This change will probably not required modification to the SecurityEvaluator implementation but may require modification to classes that utilize the permissions based object.

All exceptions are runtime exceptions and so do not have to be explicitly caught. Javadocs indicate which methods throw which exceptions.

* Removal of org.apache.jena.permissions.AccessDeniedException. This is replace by 5 individual exceptions.

* Addition of org.apache.jena.shared.OperationDeniedException. This exception is a child of the _JenaException_ and is the root of all operation denied states whether through process errors or through permissions violations.

* Addition of org.apache.jena.shared.PermissionDeniedException. This exception is a child of the _OperationDeniedException_ and is the root of all operations denied through permission violations. These can be because the object was statically prohibited from performing an operation (e.g. a read-only graph) or due to the Jena Permissions layer.

* Addition of org.apache.jena.shared.AddDeniedException. This exception is a child of _PermissionDeniedException_ and used to indicate that an attempt was made to add to an unmodifiable object. It may be thrown by read-only graphs or by the permission layer when a create restriction is violated.

* Addition of org.apache.jena.shared.DeleteDeniedException. This exception is a child of _PermissionDeniedException_ and used to indicate that an attempt was made to delete from an unmodifiable object. It may be thrown by read-only graphs or by the permission layer when a delete restriction is violated.

* Addition of org.apache.jena.shared.ReadDeniedException. This exception is a child of _PermissionDeniedException_ and used to indicate that a read restriction was violated.

* Addition of org.apache.jena.shared.UpdateDeniedException. This exception is a child of _PermissionDeniedException_ and used to indicate that a update restriction was violated.

* Addition of org.apache.jena.shared.AuthenticationRequiredException. This exception is a child of _OperationDeniedException_ and used to indicate that user authentication is required but has not occurred. This exception should be thrown when the SecurityEvaluator attempts to evaluate an operation and there is both a permissions restriction and the object returned by getPrincipal() indicates that the user is unauthenticated.

Removal of Classes
==================

The original "security" code was intended to be graph agnostic and so injected a "shim" layer to convert from graph specific classes to security specific classes. With the renaming of the package to "permissions" and the tighter integration to the Jena core the "shim" structure has been removed. This should make the permissions layer faster and cleaner to implement.

SecNode
-------

The SecNode class has been removed. This was effectively a proxy for the Jena Node object and has been replaced with that object. The SecNode maintained its type (e.g. URI, Literal or Variable) using an internal Enumeration. The method getType() was used to identify the internal type. With the Jena node replacement statements of the form

     if (secNode.getType().equals( SecNode.Type.Literal ))
     {
         // do something
     }

are replaced with

     if (node.isLiteral())
     {
         // do something
     }

`SecNode.ANY` has been replaced with Node.ANY as it served the same purpose.

`SecNode.FUTURE` has been replaced with `SecurityEvaluator.FUTURE` and is now implemented as a blank node with the label `urn:jena-permissions:FUTURE`.

`SecNode.VARIABLE` has been replaced with `SecurityEvaluator.VARIABLE` and is now implemented as a blank node with the label `urn:jena-permissions:VARIABLE`.


SecTriple
---------

The SecTriple class has been removed. This was effectively a proxy for the Jena Triple object and has been replaced with that object.


Movement of Classes
===================

SecuredItem
-----------

The SecuredItem interface was moved from org.apache.jena.permissions.impl to org.apache.jena.permissions.

Additional Methods
==================

SecurityEvaluator
-----------------

The method `isAuthenticatedUser( Object principal )` has been added. The SecurityEvaluator should respond `true` if the principal is recognized as an authenticated user. The `principal` object is guaranteed to have been returned from an earlier `getPrincipal()` call.
