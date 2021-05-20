---
title: Jena Permissions - SecurityEvaluator implementation
---

## Overview

The SecurityEvaluator interface defines the access control operations. It provides the interface between the authentication (answers the question: "who are you?") and the authorization (answers the question: "what can you do?"), as such it provides access to the current principal (user). The javadocs contain detailed requirements for implementations of the SecurityEvaluator interface, short notes are provided below.

**NOTE** The permissions system caches intermediate results and will only call the evaluator if the answer is not already in the cache. There is little or no advantage to implementing caching in the SecurityEvaluator itself.

**NOTE** In earlier versions ReadDeniedException was thrown whenever read permissions were not granted.  The current version defines a `isHardReadError` method that defines what action should be taken.  **The default implementation has changed**.  See Configuration Methods section below for information.

### Actions

Principals may perform Create, Read, Update or Delete operations on secured resources. These operations are defined in the `Action` enum in the SecurityEvaluator interface.

### Node

The permission system uses the standard Node.ANY to represent a wild-card in a permission check and the standard `Triple.ANY` to represent a triple with wild-cards in each of the three positions: subject, predicate and object.

The permission system introduces two new node types `SecurityEvaluator.VARIABLE`, which represents a variable in a permissions query, and `SecurityEvaluator.FUTURE`, which represents an anonymous node that will be created in the future.

### Evaluator Methods

The SecurityEvaluator connects the Jena permissions system with the authentication system used by the application. The SecurityEvaluator must be able to query the authentication system, or its proxy, to determine who the "current user" is. In this context the "current user" is the one making the request. In certain instances (specifically when using listeners on secured graphs and models) the "current user" may not be the user identified by the authentication system at the time of the query.

The SecurityEvaluator must implement the following methods. Any of these methods may throw an `AuthenticationRequiredException` if there is no authenticated user.

Most of these methods have a `principal` parameter. The value of that parameter is guaranteed to be a value returned from an earlier calls to getPrincipal(). The `principal` parameter, not the "current user" as identified by `getPrincipal()`, should be used for the permissions evaluation.

None of these methods should throw any of the PermissionDeniedException based exceptions. That is handled in a different layer.

See the <a href="../javadoc/permissions/org/apache/jena/permissions/SecurityEvaluator.html">SecurityEvaluator javadocs</a> for detailed implementation notes.

    public boolean evaluate( Object principal, Action action, Node graphIRI ) throws AuthenticationRequiredException;
Determine if the action is permitted on the graph.

    public boolean evaluate( Object principal, Action action, Node graphIRI, Triple triple ) throws AuthenticationRequiredException;
Determine if the action is allowed on the triple within the graph.

    public boolean evaluate( Object principal, Set<Action> actions, Node graphIRI )throws AuthenticationRequiredException;
Determine if all actions are allowed on the graph.

    public boolean evaluate( Object principal, Set<Action> actions, Node graphIRI, Triple triple ) throws AuthenticationRequiredException;
Determine if all the actions are allowed on the triple within the graph.

    public boolean evaluateAny( Object principal, Set<Action> actions, Node graphIRI ) throws AuthenticationRequiredException;
Determine if any of the actions are allowed on the graph.

    public boolean evaluateAny( Object principal, Set<Action> actions, Node graphIRI, Triple triple ) throws AuthenticationRequiredException;
Determine if any of the actions are allowed on the triple within the graph.

    public boolean evaluateUpdate( Object principal, Node graphIRI, Triple from, Triple to ) throws AuthenticationRequiredException;
Determine if the user is allowed to update the "from" triple to the "to" triple.

    public Object getPrincipal() throws AuthenticationRequiredException;
Return the current principal or null if there is no current principal.

### Configuration Methods

The evaluator has one configuration method. 

    public default boolean isHardReadError()
This method determines how the system will deal with read denied restrictions when attempting to create iterators, counts, or perform existential checks.   If set `true` the system will throw a `ReadDeniedException`.  This is the action that was perfomed in Jena version 3 and earlier.  If set `false`, the default,  methods that return iterators return empty iterators, methods that perform existential checks return `false`, and methods that return counts return 0 (zero).

## Sample Implementation

This sample is for a graph that contains a set of messages, access to the messages are limited to
principals that the messages are to or from. Any triple that is not a message is not affected. This
implementation simply has a `setPrincipal(String name)` method. A real implementation would request the user principal or name from the authentication system. This implementation also requires access to the underlying model to determine if the user has access, however, that is not a requirement of the SecurityEvaluator in general. Determining access from the information provided is an exercise for the implementer.

Note that this implementation does not vary based on the graph being evaluated (graphIRI). The `graphIRI` parameter is provided for implementations where such variance is desired.

See the example jar for another implementation example.

<!-- language: lang-java -->

    public class ExampleEvaluator implements SecurityEvaluator {
    
        private Principal principal;
        private Model model;
        private RDFNode msgType = ResourceFactory.createResource( "http://example.com/msg" );
        private Property pTo = ResourceFactory.createProperty( "http://example.com/to" );
        private Property pFrom = ResourceFactory.createProperty( "http://example.com/from" );
    
        /**
         *
         * @param model The graph we are going to evaluate against.
         */
        public ExampleEvaluator( Model model )
        {
            this.model = model;
        }
    
        @Override
        public boolean evaluate(Object principal, Action action, Node graphIRI) {
            // we allow any action on a graph.
            return true;
        }
    
        // not that in this implementation all permission checks flow through
        // this method. We can do this because we have a simple permissions
        // requirement. A more complex set of permissions requirement would
        // require a different strategy.
        private boolean evaluate( Object principalObj, Resource r )
        {
            Principal principal = (Principal)principalObj;
            // we do not allow anonymous (un-authenticated) reads of data.
            // Another strategy would be to only require authentication if the
            // data being requested was restricted -- but that is a more complex
            // process and not suitable for this simple example.
            if (principal == null)
            {
                throw new AuthenticationRequiredException();
            }
    
            // a message is only available to sender or recipient
            if (r.hasProperty( RDF.type, msgType ))
            {
                return r.hasProperty( pTo, principal.getName() ) ||
                        r.hasProperty( pFrom, principal.getName());
            }
            return true;
        }
    
        // evaluate a node.
        private boolean evaluate( Object principal, Node node )
        {
            if (node.equals( Node.ANY )) {
                // all wildcards are false. This forces each triple
                // to be explicitly checked.
                return false;
            }
    
            // if the node is a URI or a blank node evaluate it as a resource.
            if (node.isURI() || node.isBlank()) {
    		     Resource r = model.getRDFNode( node ).asResource();
    		     return evaluate( principal, r );
    	     }
    
            return true;
        }
    
        // evaluate the triple by evaluating the subject, predicate and object.
        private boolean evaluate( Object principal, Triple triple ) {
            return evaluate( principal, triple.getSubject()) &&
                    evaluate( principal, triple.getObject()) &&
                    evaluate( principal, triple.getPredicate());
        }
    
        @Override
        public boolean evaluate(Object principal, Action action, Node graphIRI, Triple triple) {
            return evaluate( principal, triple );
        }
    
        @Override
        public boolean evaluate(Object principal, Set<Action> actions, Node graphIRI) {
            return true;
        }
    
        @Override
        public boolean evaluate(Object principal, Set<Action> actions, Node graphIRI,
                Triple triple) {
            return evaluate( principal, triple );
        }
    
        @Override
        public boolean evaluateAny(Object principal, Set<Action> actions, Node graphIRI) {
            return true;
        }
    
        @Override
        public boolean evaluateAny(Object principal, Set<Action> actions, Node graphIRI,
                Triple triple) {
            return evaluate( principal, triple );
        }
    
        @Override
        public boolean evaluateUpdate(Object principal, Node graphIRI, Triple from, Triple to) {
            return evaluate( principal, from ) && evaluate( principal, to );
        }
    
        public void setPrincipal( String userName )
        {
            if (userName == null)
            {
                principal = null;
            }
            principal = new BasicUserPrincipal( userName );
        }
    
        @Override
        public Principal getPrincipal() {
            return principal;
        }
        
        @Override
        public boolean isPrincipalAuthenticated(Object principal) {
            return principal != null;
        }
    }
