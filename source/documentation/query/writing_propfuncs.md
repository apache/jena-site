---
title: ARQ - Writing Property Functions
---

**ARQ - Writing Property Functions**

See also [Writing Filter Functions](writing_functions.html).

Applications can add SPARQL property functions to the query engine. This is done by first implementing the
 [`PropertyFunction`](/documentation/javadoc/arq/org/apache/jena/sparql/pfunction/PropertyFunction.html)
 interface, and then either registering that function or using the fake `java:` URI scheme to dynamically
 load the function.

**Writing SPARQL Property Functions**

Similar to SPARQL Filter Functions, a SPARQL Property Function is an extension point of the SPARQL query language
 that allows a URI to name a function in the query processor. A key difference is that Property Functions may
 generate new bindings.

Just like
 [org.apache.jena.sparql.function.Function](/documentation/javadoc/arq/org/apache/jena/sparql/function/Function.html)
 there are various utility classes provided to simplify the creation of a Property Function. The selection of
 one depends on the 'style' of the desired built-in. For example, `PFuncSimple` is expected to be the predicate
 of triple patterns `?such ex:as ?this`, where neither argument is an `rdf:list`, and either may be a variable.
 Alternatively, `PFuncAssignToObject` assumes that the subject will be bound, while the object will be a variable.

    PropertyFunction
        |
        |--PropertyFunctionBase
              |
              |--PropertyFunctionEval
                    |
                    |--PFuncSimpleAndList
                    |
                    |--PFuncSimple
                         |
                         |--PFuncAssignToObject
                         |
                         |--PFuncAssignToSubject
                    |
                    |--PFuncListAndSimple
                    |
                    |--PFuncListAndList

The choice of extension point determines the function signature that the developer will need to implement, and
 primarily determines whether some of the arguments will be 
 [`org.apache.jena.graph.Node`](/documentation/javadoc/jena/org/apache/jena/graph/Node.html)s or 
 [`org.apache.jena.sparql.pfunction.PropFuncArg`](/documentation/javadoc/arq/org/apache/jena/sparql/pfunction/PropFuncArg.html)s.
 In the latter case, the programmer can determine whether the argument is a list as well as how many
 arguments it consists of.


**Registration**

Every property function is associated with a particular 
 [`org.apache.jena.sparql.util.Context`](/documentation/javadoc/arq/org/apache/jena/sparql/util/Context.html).
 This allows you to limit the availability of the function to be global or associated with a particular dataset.
 For example, a custom Property Function may expose an index which only has meaning with respect to some set
 of data.

Assuming you have an implementation of
 [`org.apache.jena.sparql.pfunction.PropertyFunctionFactory`](/documentation/javadoc/arq/org/apache/jena/sparql/pfunction/PropertyFunctionFactory.html) 
 (shown later), you can register a function as follows:


    final PropertyFunctionRegistry reg = PropertyFunctionRegistry.chooseRegistry(ARQ.getContext());
    reg.put("urn:ex:fn#example", new ExamplePropertyFunctionFactory());
    PropertyFunctionRegistry.set(ARQ.getContext(), reg);


The only difference between global and dataset-specific registration is where the `Context` object comes from:

    final Dataset ds = DatasetFactory.createGeneral();
    final PropertyFunctionRegistry reg = PropertyFunctionRegistry.chooseRegistry(ds.getContext());
    reg.put("urn:ex:fn#example", new ExamplePropertyFunctionFactory());
    PropertyFunctionRegistry.set(ds.getContext(), reg);

Note that 
 [`org.apache.jena.sparql.pfunction.PropertyFunctionRegistry`](/documentation/javadoc/arq/org/apache/jena/sparql/pfunction/PropertyFunctionRegistry.html)
 has other `put` methods that allow registration by passing a `Class` object, as well.

**Implementation**

The implementation of a Property Function is actually quite straight forward once one is aware of the tools
 at their disposal to do so. For example, if we wished to create a Property Function that returns no results
 regardless of their arguments we could do so as follows:

    public class ExamplePropertyFunctionFactory implements PropertyFunctionFactory {
    	@Override
    	public PropertyFunction create(final String uri)
    	{	
    		return new PFuncSimple()
    		{
    			@Override
    			public QueryIterator execEvaluated(final Binding parent, final Node subject, final Node predicate, final Node object, final ExecutionContext execCtx) 
    			{	
                    return QueryIterNullIterator.create(execCtx);
    			}
    		};
    	}
    }

`Node` and `PropFuncArg` objects allow the developer to reflect on the state of the arguments, and choose what
 bindings to generate given the intended usage of the Property Function. For example, if the function expects a
 list of three bound arguments for the object of the property, then it can throw a `ExprEvalException`
 (or derivative) to indicate incorrect use. It is the responsibility of the developer to identify what parts
 of the argument are bound, and to respond appropriately.

For example, if `?a ex:f ?b` were a triple pattern in a query, it could be called with `?a` bound, `?b` bound,
 or neither. It may make sense to return new bindings that include `?b` if passed a concrete value for `?a`,
 or conversely to generate new bindings for `?a` when passed a concrete `?b`. If both `?a` and `?b` are bound,
 and the function wishes to confirm that the pairing is valid, it can return the existing binding. If there are
 no valid solutions to return, then an empty solution may be presented.

There are several extremely useful implementations of `QueryIterator` within the Jena library that make it
easy to support typical use cases.

Of particular note:

  - [`QueryIterNullIterator`](/documentation/javadoc/arq/org/apache/jena/sparql/engine/iterator/QueryIterNullIterator.html) - to indicate that there are no valid solutions/bindings for the given values
  - [`QueryIterSingleton`](/documentation/javadoc/arq/org/apache/jena/sparql/engine/iterator/QueryIterSingleton.html) - to provide a single solution/binding for the given values
  - [`QueryIterPlainWrapper`](/documentation/javadoc/arq/org/apache/jena/sparql/engine/iterator/QueryIterPlainWrapper.html) - to provide multiple solutions/bindings for the given values

The second two cases require instances of `Binding` objects which can be obtained through static methods of
 [`BindingFactory`](/documentation/javadoc/arq/org/apache/jena/sparql/engine/binding/BindingFactory.html).
 Creation of `Binding` objects will also require references to [`Var`](/documentation/javadoc/arq/org/apache/jena/sparql/core/Var.html)
 and [`NodeFactory`](/documentation/javadoc/jena/org/apache/jena/graph/NodeFactory.html)

Note that it can make a lot of sense to generate the `Iterator<Binding>` for `QueryIterPlainWrapper` by means of
 Jena's `ExtendedIterator`. This can allow domain-specific value to be easily mapped to `Binding` objects in
 a lazy fashion.

**Graph Operations**

Additional operations on the current, or another, Graph can be achieved through the Execution Context.
Once retrieved the Graph can be operated upon directly, queried or wrapped in a Model, if preferred.

      // Retrieve current Graph.
      Graph graph = execCxt.getActiveGraph();
      
      // Wrap Graph in a Model.
      Model model = ModelFactory.createModelForGraph(graph);

Access another graph:

      // Retrieve DatasetGraph of current Graph.
      DatasetGraph datasetGraph = execCxt.getDataset();

      // Retrieve a different Graph in the Dataset.
      Node otherGraphNode = NodeFactory.createURI("http://example.org/otherGraph");
      Graph otherGraph = datasetGraph.getNamedGraph(otherGraphNode);

      // Access the other graph
      ExtendedIterator<Triple> iter = otherGraph.find(...);
