---
title: LARQ - adding free text searches to SPARQL
slug: index
---

**As of Jena 2.11.0, LARQ is replaced by [jena-text](../query/text-query.html)**

[jena-text](../query/text-query.html) includes use of Apache Solr 
as a shared, search server, or Apache Lucene as a local text index.
From Fuseki 0.2.7, jena-text is built into Fuseki.

LARQ is not compatible with jena-text; the index format has changed and the 
integration with SPARQL is different.

<hr/>

LARQ is a combination of [ARQ](../query/index.html) and [Lucene](http://lucene.apache.org/java/docs/index.html). It gives users the ability to perform free text searches within their SPARQL queries. Lucene indexes are additional information for accessing the RDF graph, not storage for the graph itself.

Some example code is available here: [https://svn.apache.org/repos/asf/jena/Archive/jena-larq/src/test/java/org/apache/jena/larq/examples/](https://svn.apache.org/repos/asf/jena/Archive/jena-larq/src/test/java/org/apache/jena/larq/examples/).

Two helper commands are provided: `larq.larqbuilder` and `larq.larq` used respectively for updating and querying LARQ indexes.

A full description of the free text query language syntax is given in the [Lucene query syntax](http://lucene.apache.org/java/3_0_0/queryparsersyntax.html) document.

## Usage Patterns

There are three basic usage patterns supported:

 * Pattern 1 : index string literals. The index will return the literals matching the Lucene search pattern.
 * Pattern 2 : index subject resources by string literal. The index returns the subjects with property value matching a text query.
 * Pattern 3 : index graph nodes based on strings not present in the graph.

Patterns 1 and 2 have the indexed content in the graph. Both 1 and 2 can be modified by specifying a property so that only values of a given property are indexed. Pattern 2 is less flexible as [discussed below](#query-using-a-lucene-index). Pattern 3 is covered in the [external content](#external-content) section below.

LARQ can be used in other ways as well but the classes for these patterns are supplied. In both patterns 1 and 2, strings are indexed, being plain strings, string with any language tag or any literal with datatype XSD string.

## Index Creation

There are many ways to use Lucene, which can be set up to handle particular features or languages. The creation of the index is done outside of the ARQ query system proper and only accessed at query time. LARQ includes some platform classes and also utility classes to create indexes on string literals for the use cases above. Indexing can be performed as the graph is read in, or to built from an existing graph.

### Index Builders

An index builder is a class to create a Lucene index from RDF data.

 * `IndexBuilderString`: This is the most commonly used index builder. It indexes plain literals (with or without language tags) and XSD strings and stores the complete literal. Optionally, a property can be supplied which restricts indexing to strings in statements using that property.
 * `IndexBuilderSubject`: Index the subject resource by a string literal, a store the subject resource, possibly restricted by a specified property.

Lucene has many ways to create indexes and the index builder classes do not attempt to provide all possible Lucene features. Applications may need to extend or modify the standard index builders provided by LARQ.

### Index Creation

An index can be built while reading RDF into a model:

    // -- Read and index all literal strings.
    IndexBuilderString larqBuilder = new IndexBuilderString() ;

    // -- Index statements as they are added to the model.
    model.register(larqBuilder) ;

    FileManager.get().readModel(model, datafile) ;

    // -- Finish indexing
    larqBuilder.closeWriter() ;
    model.unregister(larqBuilder) ;

    // -- Create the access index  
    IndexLARQ index = larqBuilder.getIndex() ;

or it can be created from an existing model:

    // -- Create an index based on existing statements
    larqBuilder.indexStatements(model.listStatements()) ;
    // -- Finish indexing
    larqBuilder.closeWriter() ;
    // -- Create the access index  
    IndexLARQ index = larqBuilder.getIndex() ;

## Index Registration

Next the index is made available to ARQ. This can be done globally:

    // -- Make globally available
    LARQ.setDefaultIndex(index) ;

or it can be set on a per-query execution basis.

    QueryExecution qExec = QueryExecutionFactory.create(query, model) ;
    // -- Make available to this query execution only
    LARQ.setDefaultIndex(qExec.getContext(), index) ;

In both these cases, the default index is set, which is the one expected by property function `pf:textMatch`. Use of multiple indexes in the same query can be achieved by introducing new properties.  The application can subclass the search class `org.apache.jena.larq.LuceneSearch` to set different indexes with different property names.

## Query using a Lucene index

Query execution is as usual using the property function pf:textMatch. "textMatch" can be thought of as an implied relationship in the data. Note the prefix ends in ".".

    String queryString = StringUtils.join("\n", new String[]{
            "PREFIX pf: <http://jena.hpl.hp.com/ARQ/property#>",
            "SELECT * {" ,
            "    ?lit pf:textMatch '+text'",
            "}"
        }) ;
    Query query = QueryFactory.create(queryString) ;
    QueryExecution qExec = QueryExecutionFactory.create(query, model) ;
    ResultSetFormatter.out(System.out, qExec.execSelect(), query) ;

The subjects with a property value of the matched literals can be retrieved by looking up the literals in the model:

    PREFIX pf: <http://jena.hpl.hp.com/ARQ/property#>
    SELECT ?doc
    {
        ?lit pf:textMatch '+text' .
        ?doc ?p ?lit
    }

This is a more flexible way of achieving the effect of using a `IndexBuilderSubject`. `IndexBuilderSubject` can be more compact when there are many large literals (it stores the subject not the literal) but does not work for blank node subjects without extremely careful co-ordination with a persistent model. Looking the literal up in the model does not have this complication.

## Accessing the Lucene Score

The application can get access to the Lucene match score by using a list argument for the subject of `pf:textMatch`. The list must have two arguments, both unbound variables at the time of the query.

    PREFIX pf: <http://jena.hpl.hp.com/ARQ/property#>
    SELECT ?doc ?score 
    {
        (?lit ?score ) pf:textMatch '+text' .
        ?doc ?p ?lit
    }

## Limiting the number of matches

When used with just a query string, pf:textMatch returns all the Lucene matches. In many applications, the application is only interested in the first few matches (Lucene returns matches in order, highest scoring first), or only matches above some score threshold. The query argument that forms the object of the pf:textMatch property can also be a list, including a score threshold and a total limit on the number of results matched.

    ?lit pf:textMatch ( '+text' 100 ) .        # Limit to at most 100 hits

    ?lit pf:textMatch ( '+text' 0.5 ) .        # Limit to Lucene scores of 0.5 and over.

    ?lit pf:textMatch ( '+text' 0.5 100 ) .    # Limit to scores of 0.5 and limit to 100 hits

## Direct Application Use

The IndexLARQ class provides the ability to search programmatically, not just from ARQ. The searchModelByIndex method returns an iterator over RDFNodes.

    // -- Create the access index  
    IndexLARQ index = larqBuilder.getIndex() ;

    NodeIterator nIter = index.searchModelByIndex("+text") ;
    for ( ; nIter.hasNext() ; )
    {
        // if it's an index storing literals ...
        Literal lit = (Literal)nIter.nextNode() ;
    }

## External Content

 * Pattern 3: index graph nodes based on strings not present in the graph.

Sometimes, the index needs to be created based on external material and the index gives nodes in the graph. This can be done by using `IndexBuilderNode` which is a helper class to relate external material to some RDF node.

Here, the indexed content is not in the RDF graph at all.  For example, the indexed content may come from HTML.XHTML, PDFs or XML documents and the RDF graph only holds the metadata about these content items. 

The [Lucene contributions page](http://lucene.apache.org/java/3_4_0/contributions.html#Lucene%20Document%20Converters) lists some content converters.

## Getting Help and Getting Involved

If you have a problem with LARQ, make sure you read the [Getting help with Jena](../../help_and_support/index.html) page and post a message on the [users@jena.apache.org](mailto:users@jena.apache.org?s=[LARQ] ) mailing list.
You can also search the jena-users mailing list archives [here](http://markmail.org/search/?q=larq+list%3Aorg.apache.jena.users).

If you use LARQ and you want to get involved, make sure you read the [Getting Involved](../../getting_involved/index.html) page. You can help us making LARQ better by:

 * improving this documentation, writing tutorials or blog posts about LARQ
 * letting us know how you use LARQ, your use cases and what are in your opinion missing features 
 * answering users question about LARQ on the [users@jena.apache.org](mailto:users@jena.apache.org?s=[LARQ] ) mailing list
 * submitting bug reports and feature requests on JIRA: https://issues.apache.org/jira/browse/JENA
 * voting or submitting patches for the currently [open bugs or improvements](https://issues.apache.org/jira/secure/IssueNavigator.jspa?reset=true&jqlQuery=project+%3D+JENA+AND+component+%3D+LARQ+AND+status+%3D+Open+ORDER+BY+priority+DESC&mode=hide) for LARQ
 * checking out LARQ source code, playing with it and let us know your ideas for possible improvements: [https://svn.apache.org/repos/asf/jena/Archive/jena-larq](https://svn.apache.org/repos/asf/jena/Archive/jena-larq)
