---
title: Tutorial - Manipulating SPARQL using ARQ
---

When you've been working with SPARQL you quickly find that static
queries are restrictive. Maybe you want to vary a value, perhaps add a
filter, alter the limit, etc etc. Being an impatient sort you dive in to
the query string, and it works. But what about [little Bobby
Tables](http://xkcd.com/327/)? And, even if you
sanitise your inputs, string manipulation is a fraught process and
syntax errors await you. Although it might seem harder than string
munging, the ARQ API is your friend in the long run.

*Originally published on the [Research Revealed project
blog](https://web.archive.org/web/20151107135044/http://researchrevealed.ilrt.bris.ac.uk/?p=35)*

## Inserting values (simple prepared statements)

Let's begin with something simple. Suppose we wanted to restrict the
following query to a particular person:

       select * { ?person <http://xmlns.com/foaf/0.1/name> ?name }

`String#replaceAll` would work, but there is a safer way.
`QueryExecutionFactory` in most cases lets you supply a `QuerySolution`
with which you can prebind values.

       QuerySolutionMap initialBinding = new QuerySolutionMap();
       initialBinding.add("name", personResource);
       qe = QueryExecutionFactory.create(query, dataset, initialBinding);

This is often much simpler than the string equivalent since you don't
have to escape quotes in literals. (Beware that this doesn't work for
`sparqlService`, which is a great shame. It would be nice to spend some
time remedying that.)

## Making a Query from Scratch

The previously mentioned limitation is due to the fact that prebinding
doesn't actually change the query at all, but the execution of that
query. So what how do we really alter queries?

ARQ provides two ways to work with queries: at the syntax level (`Query`
and `Element`), or the algebra level (`Op`). The distinction is clear in
filters:

       SELECT ?s { ?s <http://example.com/val> ?val . FILTER ( ?val < 20 ) }

If you work at the syntax level you'll find that this looks (in pseudo
code) like:

       (GROUP (PATTERN ( ?s <http://example.com/val> ?val )) (FILTER ( < ?val 20 ) ))

That is there's a group containing a triple pattern and a filter, just
as you see in the query. The algebra is different, and we can see it
using `arq.qparse --print op`

       $ java arq.qparse --print op 'SELECT ?s { ?s <http://example.com/val> ?val . FILTER ( ?val < 20 ) }'
       (base <file:///...>
           (project (?s)
               (filter (< ?val 20)
                   (bgp (triple ?s <http://example.com/val> ?val)))))

Here the filter contains the pattern, rather than sitting next to it.
This form makes it clear that the expression is filtering the pattern.

Let's create that query from scratch using ARQ. We begin with some
common pieces: the triple to match, and the expression for the filter.

       // ?s ?p ?o .
       Triple pattern =
           Triple.create(Var.alloc("s"), Var.alloc("p"), Var.alloc("o"));
       // ( ?s < 20 )
       Expr e = new E_LessThan(new ExprVar("s"), new NodeValueInteger(20));

`Triple` should be familiar from jena. `Var` is an extension of `Node`
for variables. `Expr` is the root interface for expressions, those
things that appear in `FILTER` and `LET`.

First the syntax route:

       ElementTriplesBlock block = new ElementTriplesBlock(); // Make a BGP
       block.addTriple(pattern);                              // Add our pattern match
       ElementFilter filter = new ElementFilter(e);           // Make a filter matching the expression
       ElementGroup body = new ElementGroup();                // Group our pattern match and filter
       body.addElement(block);
       body.addElement(filter);

       Query q = QueryFactory.make();
       q.setQueryPattern(body);                               // Set the body of the query to our group
       q.setQuerySelectType();                                // Make it a select query
       q.addResultVar("s");                                   // Select ?s

Now the algebra:

       Op op;
       BasicPattern pat = new BasicPattern();                 // Make a pattern
       pat.add(pattern);                                      // Add our pattern match
       op = new OpBGP(pat);                                   // Make a BGP from this pattern
       op = OpFilter.filter(e, op);                           // Filter that pattern with our expression
       op = new OpProject(op, Arrays.asList(Var.alloc("s"))); // Reduce to just ?s
       Query q = OpAsQuery.asQuery(op);                       // Convert to a query
       q.setQuerySelectType();                                // Make is a select query

Notice that the query form (`SELECT, CONSTRUCT, DESCRIBE, ASK`) isn't
part of the algebra, and we have to set this in the query (although
SELECT is the default). `FROM` and `FROM NAMED` are similarly absent.

## Navigating and Tinkering: Visitors

You can also look around the algebra and syntax using visitors. Start by
extending `OpVisitorBase` (`ElementVisitorBase`) which stubs out the
interface so you can concentrate on the parts of interest, then walk
using `OpWalker.walk(Op, OpVisitor)`
(`ElementWalker.walk(Element, ElementVisitor)`). These work bottom up.

For some alterations, like manipulating triple matches in place,
visitors will do the trick. They provide a simple way to get to the
right parts of the query, and you can alter the pattern backing BGPs in
both the algebra and syntax. Mutation isn't consistently available,
however, so don't depend on it.

## Transforming the Algebra

So far there is no obvious advantage in using the algebra. The real
power is visible in transformers, which allow you to reorganise an
algebra completely. ARQ makes extensive use of transformations to
simplify and optimise query execution.

In Research Revealed I wrote some code to take a number of constraints
and produce a query. There were a number of ways to do this, but one way
I found was to generate ops from each constraint and join the results:

       for (Constraint con: cons) {
           op = OpJoin.create(op, consToOp(cons)); // join
       }

The result was a perfectly correct mess, which is only barely readable
with just three conditions:

       (join
           (join
               (filter (< ?o0 20) (bgp (triple ?s <urn:ex:prop0> ?o0)))
               (filter (< ?o1 20) (bgp (triple ?s <urn:ex:prop1> ?o1))))
           (filter (< ?o2 20) (bgp (triple ?s <urn:ex:prop2> ?o2))))

Each of the constraints is a filter on a bgp. This can be made much more
readable by moving the filters out, and merging the triple patterns. We
can do this with the following `Transform`:

       class QueryCleaner extends TransformBase
       {
           @Override
           public Op transform(OpJoin join, Op left, Op right) {
               // Bail if not of the right form
               if (!(left instanceof OpFilter && right instanceof OpFilter)) return join;
               OpFilter leftF = (OpFilter) left;
               OpFilter rightF = (OpFilter) right;

               // Add all of the triple matches to the LHS BGP
               ((OpBGP) leftF.getSubOp()).getPattern().addAll(((OpBGP) rightF.getSubOp()).getPattern());
               // Add the RHS filter to the LHS
               leftF.getExprs().addAll(rightF.getExprs());
               return leftF;
           }
       }
       ...
       op = Transformer.transform(new QueryCleaner(), op); // clean query

This looks for joins of the form:

       (join
           (filter (exp1) (bgp1))
           (filter (exp2) (bgp2)))

And replaces it with:

       (filter (exp1 && exp2) (bgp1 && bgp2))

As we go through the original query all joins are removed, and the
result is:

       (filter (exprlist (< ?o0 20) (< ?o1 20) (< ?o2 20))
           (bgp
               (triple ?s <urn:ex:prop0> ?o0)
               (triple ?s <urn:ex:prop1> ?o1)
               (triple ?s <urn:ex:prop2> ?o2)
       ))

That completes this brief introduction. There is much more to ARQ, of
course, but hopefully you now have a taste for what it can do.
