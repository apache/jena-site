---
title: Support Request
---

# Writing a Support Request

A good support request or bug report is clear and concise. For ARQ,
reduce the problem to a short dataset (20 triples should be enough;
Turtle, N3 or N-triples preferred) and a query that illustrates the
problem. State what you expected to happen as well as what did
happen.

It also a good idea to check the documentation.

-   [ARQ FAQ](faq.html)
-   [ARQ Documentation](index.html)

### Parse Errors

The SPARQL parser outputs a line and column number - it is usually
correct in identifying the first point of a syntax error.

### Execution failure

If you are reporting a failure that produces a stack trace, please
include the message, exception and the stack trace. Only if it is
very long, should you truncate the trace but please include the
whole trace to the point where it indicates it is entering ARQ (a
package name starting `org.apache.jena.query`) and then one level
which is your code.

### Unexpected results

If you are getting unexpected results, show the results you expect
as well as what you actually get.

If you are getting no results, or less than you expected, try
cutting parts out of the query until something changes.

There are various formatters for result sets included in ARQ. 
Print your results in text form if possible. There is a
[testing format](http://www.w3.org/2001/sw/DataAccess/tests/README.html)
used by the Data Access Working Group and that is used for the
scripted tests in the distribution.

### Reports

A bug report or support request should be **complete** and
**minimal**. It helps you to develop a concise description of the
problem - often, you will discover the solution yourself.

*Complete* means that any query included should include prefixes
and the whole syntax string, not a fragment.  Any program code
should be ready to run, not a fragment of a large program.

*Minimal* means that the data sent should be an abbreviated
selection to illustrate the point.

Typically, any program will be less that 20 lines, and any data
less than 20 triples.

The report should also include details of the execution
environment:

Environment:
-   ARQ version
-   Java version
-   Operating system
-   What's the CLASSPATH?

How are you running the query?
-   Are you running in an application server? Which one?
-   Have you used the command line tools?

Data:
-   Does your data parse as RDF?
-   Are you querying an inference model?

Query:
-   Have you printed out the query exactly as it is (especially if
    the string has been assembled in by java code)? It is a good idea
    to print the query out after building it programmatically.
-   Have you passed the query through the
    [SPARQL syntax checker](cmds.html#arq.qparse)?
    `java -cp ... arq.qparse 'your query'`

Bug reports should be sent to the
[mailto:users@jena.apache.org](mailto:users@jena.apache.org)
(you need to subscribe to send to this list).

[ARQ documentation index](index.html)



