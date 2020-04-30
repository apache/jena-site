---
title: Parameterized SPARQL String
---

A Parameterized SPARQL String is a SPARQL query/update into which values
may be injected.

The intended usage of this is where using a <code>QuerySolutionMap</code> as
initial bindings is either inappropriate or not possible e.g.

-   Generating query/update strings in code without lots of error prone
    and messy string concatenation
-   Preparing a query/update for remote execution
-   Where you do not want to simply say some variable should have a
    certain value but rather wish to insert constants into the
    query/update in place of variables
-   Defending against SPARQL injection when creating a query/update
    using some external input, see SPARQL Injection notes for
    limitations.
-   Provide a more convenient way to prepend common prefixes to your
    query

This class is useful for preparing both queries and updates hence the
generic name as it provides programmatic ways to replace variables in
the query with constants and to add prefix and base declarations. A
`Query` or `UpdateRequest` can be created using 
the `asQuery()` and `asUpdate()` methods assuming the command an
instance represents is actually valid as a query/update.

## Building parameterised commands

A [ParameterizedSparqlString][1] is created as follows:

    ParameterizedSparqlString pss = new ParameterizedSparqlString();

There are also constructor overloads that take in an initial command text, parameter values, namespace prefixes etc.
which may allow you to simplify some code.

Once you have an instance you first set your template command with the `setCommandText()` method like so:

    pss.setCommandText("SELECT * WHERE {\n" +
         "  ?s a ?type .\n" +
         "  OPTIONAL { ?s rdfs:label ?label . }\n" +
         "}");

Note that in the above example we did not define the `rdfs:` prefix so as it stands the query is invalid.  However 
you can automatically populate `BASE` and `PREFIX` declarations for your command without having to explicitly 
declare them in your command text by using the `setBaseUri()` and `setNsPrefix()` method e.g.

    // Add a Base URI and define the rdfs prefix
    pss.setBaseUri("http://example.org/base#");
    pss.setNsPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");

You can always call `toString()` to see the current state of your instance e.g.

    // Print current state to stdout
    System.out.println(pss.toString());

Which based on the calls so far would print the following:

    BASE <http://example.org/base#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT * WHERE {
      ?s a ?type .
      OPTIONAL { ?s rdfs:label ?label . }
    }

Note that the state of the instance returned by `toString()` will include any injected values.  Part of what the `toString()` method
does is check that your command is not subject to SPARQL injection attacks so in some cases where a possible
injection is detected an `ARQException` will be thrown.

[1]: /documentation/javadoc/arq/org/apache/jena/query/ParameterizedSparqlString.html

### Injecting Values

Once you have a command text prepared then you want to actually inject values into it, values may be injected in several ways:

-   By treating a variable in the SPARQL string as a parameter
-   Using JDBC style positional parameters
-   Appending values directly to the command text being built

See the [ParameterizedSparqlString][1] javadocs for a comprehensive reference of available methods for setting values,
the following sections shows some basic examples of this.

#### Variable Parameters

Any SPARQL variable in the command text may have a value injected to it, injecting a value replaces all usages of 
that variable in the command i.e. substitutes the variable for a constant.  Importantly injection is done by textual 
substitution so in some cases may cause unexpected side effects.

Variables parameters are set via the various `setX()` methods which take a `String` as their first argument e.g.

    // Set an IRI
    pss.setIri("x", "http://example.org");
    
    // Set a Literal
    pss.setLiteral("x", 1234);
    pss.setLiteral("x", true);
    pss.setLiteral("x", "value");

Where you set a value for a variable you have already set the existing value is overwritten.  Setting any value
to `null` has the same effect as calling the `clearParam("x")` method

If you have the value already as a `RDFNode` or `Node` instance you can call the `setParam()` method instead e.g.

    // Set a Node
    Node n = NodeFactory.createIRI("http://example.org");
    pas.setParam("x", n);

#### Positional Parameters

You can use JDBC style positional parameters if you prefer, a JDBC style parameter is a single `?` followed by 
whitespace or certain punctuation characters (currently `; , .`). Positional parameters have a unique index which 
reflects the order in which they appear in the string. Note that positional parameters use a zero based index.

Positional parameters are set via the various `setX()` methods which take an `int` as their first argument e.g.

    // Set an IRI
    pss.setIri(0, "http://example.org");
    
    // Set a Literal
    pss.setLiteral(0, 1234);
    pss.setLiteral(0, true);
    pss.setLiteral(0, "value");

Where you set a value for a variable you have already set the existing value is overwritten.  Setting any value
to `null` has the same effect as calling the `clearParam(0)` method

If you have the value already as a `RDFNode` or `Node` instance you can call the `setParam()` method instead e.g.

    // Set a Node
    Node n = NodeFactory.createIRI("http://example.org");
    pas.setParam(0, n);

#### Non-existent parameters

Where you try to set a variable/positional parameter that does not exist there will be no feedback that the parameter
does not exist, however the value set will not be included in the string produced when calling the `toString()` method.

#### Buffer Usage

Additionally you may use this purely as a `StringBuffer` replacement for creating commands since it provides a 
large variety of convenience methods for appending things either as-is or as nodes (which causes appropriate 
formatting to be applied).

For example we could add an `ORDER BY` clause to our earlier example like so:

    // Add ORDER BY clause
    pss.append("ORDER BY ?s");

Be aware that the basic `append()` methods append the given value as-is without any special formatting applied, if you
wanted to use the value being appended as a constant in the SPARQL query then you should use the appropriate `appendLiteral()`,
`appendIri()` or `appendNode()` method e.g.

    // Add a LIMIT clause
    pss.append("LIMIT ");
    pss.appendLiteral(50);

#### Getting a Query/Update

Once you've prepared your command you should then call the `asQuery()` or `asUpdate()` method to get it as a `Query`
or `UpdateRequest` object as appropriate.  Doing this calls `toString()` to produce the final version of your command with
all values injected and runs it through the appropriate parser (either `QueryFactory` or `UpdateFactory`).

You can then use the returned `Query` or `UpdateRequest` object as you would normally to make a query/update.

### SPARQL Injection Notes

First a couple of warnings:

1.  This class does not in any way check that your command is syntactically correct until such time as you try and parse 
it as a `Query` or `UpdateRequest`.
2.  Injection is done purely based on textual replacement, it does not understand or respect variable scope in any
way. For example if your command text contains sub queries you should ensure that variables within the sub query
which you don't want replaced have distinct names from those in the outer query you do want replaced (or vice versa)

While this class was in part designed to prevent SPARQL injection it is by no means foolproof because it works purely 
at the textual level. The current version of the code addresses some possible attack vectors that the developers have 
identified but we do not claim to be sufficiently devious to have thought of and prevented every possible attack vector.

Therefore we <strong>strongly</strong> recommend that users concerned about SPARQL Injection attacks perform 
their own validation on provided parameters and test their use of this class themselves prior to its use in any security
conscious deployment. We also recommend that users do not use easily  guess-able variable names for their parameters
as these can allow a chained injection attack though generally speaking the code should prevent these.
