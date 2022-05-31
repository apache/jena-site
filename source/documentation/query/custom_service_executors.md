---
title: ARQ - Custom Service Executors
---

Since Jena 4.2.0, ARQ features a plugin system for custom service executors.
The relevant classes are located in the package `org.apache.jena.sparql.service` and are summarized as follows:

* `ServiceExecutorRegistry`: A registry that holds a list of service executors. When Jena starts up, it configures a default registry to handle `SERVICE` requests against HTTP SPARQL endpoints and registers it with the global ARQ context accessible under `ARQ.getContext()`.

* `ServiceExecutorFactory`: This is the main interface for custom SERVICE handler implementations:
```java
public interface ServiceExecutorFactory {
    public ServiceExecution createExecutor(OpService substituted, OpService original, Binding binding, ExecutionContext execCxt);
}
```
The second OpService parameter represents the original `SERVICE` clause as it occurs in the query, whereas the first parameter is the OpService obtained after substitution of all mentioned variables w.r.t. the current binding.
A `ServiceExecutorFactory` can indicate its non-applicability for handling a request simply by returning `null`. In that case, Jena will ask the next service executor factory in the registry. If a request remains unhandled then the QueryExecException `No SERVICE handler` is raised.


* `ServiceExecution`: If a `ServiceExectorFactory` can handle a request then it needs to returns a `ServiceExecution` instance:
```java
public interface ServiceExecution {
    public QueryIterator exec();
}
```
The actual execution is started by calling the `exec()` method which returns a `QueryIterator`.
Note, that there are uses cases where ServiceExecution instances may not have to be executed. For example, one may analyze which service executor factories among a set of them claim to be capable of handling a request. This can be useful for debugging or display in a dashboard of applicable service executors.

## Examples
A runnable example suite is located in the jena-examples module at [CustomServiceExecutor.java](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/service/CustomServiceExecutor.java).

In the remainder we summarize the essentials of setting up a custom service executor.
The following snippet sets up a simple service executor factory that relays queries targeted at Wikidata to DBpedia:

```java
Node WIKIDATA = NodeFactory.createURI("http://query.wikidata.org/sparql");
Node DBPEDIA = NodeFactory.createURI("http://dbpedia.org/sparql");

ServiceExecutorFactory myExecutorFactory = (opExecute, original, binding, execCxt) -> {
    if (opExecute.getService().equals(WIKIDATA)) {
        opExecute = new OpService(DBPEDIA, opExecute.getSubOp(), opExecute.getSilent());
        return ServiceExecutorRegistry.httpService.createExecutor(opExecute, original, binding, execCxt);
    }
    return null;
};
```

### Global vs Local Service Executor Registration
The global registry can be accessed and modified as shown below:
```java
ServiceExecutorRegistry globalRegistry = ServiceExecutorRegistry.get();

// Note: registry.add() prepends executor factories to the internal list such
// that they are consulted first!
globalRegistry.add(myExecutorFactory);

```

The following snippet shows how a custom service executor can be configured locally for an individual query execution:
```java
Context cxt = ARQ.getContext().copy();
ServiceExecutorRegistry localRegistry = ServiceExecutorRegistry().get().copy();
localRegistry.add(myExecutorFactory);

String queryStr = "SELECT * { SERVICE <http://query.wikidata.org/sparql> { ?s ?p "Apache Jena"@en } }";
try (QueryExecution qe = QueryExecutionFactory.create(queryStr)) {
  ServiceExecutorRegistry.set(qe.getContext(), registry);
  // ...
}

```
