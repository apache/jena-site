---
title: ARQ - Writing Filter Functions
---

Applications can add SPARQL functions to the query engine. This is
done by writing a class implementing the right interface, then
either registering it or using the fake `java:` URI scheme to
dynamically call the function.

## Writing SPARQL Value Functions

A SPARQL value function is an extension point of the SPARQL query
language that allows URI to name a function in the query
processor.

In the ARQ engine, code to implement function must implement the
interface `org.apache.jena.sparql.function.Function` although it is
easier to work with one of the abstract classes for specific
numbers of arguments like
`org.apache.jena.sparql.function.FunctionBase1` for one argument
functions. Functions do not have to have a fixed number of
arguments.

The abstract class `FunctionBase`, the superclass of
`FunctionBase1` to `FunctionBase4`, evaluates its arguments and
calls the implementation code with argument values (if a variable
was unbound, an error will have been generated) 

It is possible to get unevaluated arguments but care must be taken
not to violate the rules of function evaluation. The standard
functions that access unevaluated arguments are the logical 'or'
and logical 'and' operations that back `||` and `&&` are special
forms to allow for the special exception handling rules.

Normally, function should be a pure evaluation based on its
argument. It should not access a graph nor return different values
for the same arguments (to allow expression optimization). Usually,
these requirements can be better met with a
[property function](library-propfunc.html). Functions can't bind
variables; this would be done in a
[property function](library-propfunc.html) as well.

Example: (this is the max function in the standard ARQ library):

    public class max extends FunctionBase2
    {
        public max() { super() ; }
        public NodeValue exec(NodeValue nv1, NodeValue nv2)
        {
            return Functions.max(nv1, nv2) ;
        }
    }

The function takes two arguments and returns a single value. The
class NodeValue represents values and supports value-based
operations. NodeValue value support includes the XSD datatypes,
xsd:decimal and all its subtypes like xsd:integer and xsd:byte,
xsd';double, xsd:float, xsd:boolean, xsd:dateTime and xsd:date.
Literals with language tags are also treated as values in
additional "value spaces" determined by the language tag without
regard to case.

The `Functions` class contains the core XML Functions and Operators
operations. Class NodeFunctions contains the implementations of
node-centric operations like `isLiteral` and `str`.

If any of the arguments are wrong, then the function should throw
`ExprEvalException`.

Example: calculate the canonical namespace from a URI (calls the
Jena operation for the actual work):

    public class namespace extends FunctionBase1
    {
        public namespace() { super() ; }

        public NodeValue exec(NodeValue v)
        {
            Node n = v.asNode() ;
            if ( ! n.isURI() )
                throw new ExprEvalException("Not a URI: "+FmtUtils.stringForNode(n)) ;
            String str = n.getNameSpace() ;
            return NodeValue.makeString(str) ;
        }
    }

This throws an evaluation exception if it is passed a value that is
not a URI.

The standard library, in package
`org.apache.jena.sparql.function.library`, contains many examples.

## Registering Functions

The query compiler finds functions based on the functions URI. 
There is a global registry of known functions, but any query
execution can have its own function registry.

For each function, there is a function factory associated with the
URI. A new function instance is created for each use of a function
in each query execution.

    // Register with the global registry.
    FunctionRegistry.get().put("http://example.org/function#myFunction", new MyFunctionFactory()) ;

A common case is registering a specific class for a function
implementation so there is an addition method that takes a class,
wraps in a built-in function factory and registers the function
implementation.

    // Register with the global registry.
    FunctionRegistry.get().put("http://example.org/function#myFunction", MyFunction.class) ;

Another convenience route to function calling is to use the
[`java:` URI scheme](java-uri.html). This dynamically loads the code,
which must be on the Java classpath. With this scheme, the function
URI gives the class name. There is automatic registration of a
wrapper into the function registry. This way, no explicit
registration step is needed by the application and queries issues
with the command line tools can load custom functions.

    PREFIX f: <java:app.myFunctions.>
    ...
       FILTER f:myTest(?x, ?y)
    ...
       FILTER (?x + f:myIntToXSD(?y))
    ...

 


[ARQ documentation index](index.html)
