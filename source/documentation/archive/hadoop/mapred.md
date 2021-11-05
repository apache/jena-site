---
title: Apache Jena Elephas - Map/Reduce API
---

The Map/Reduce API provides a range of building block `Mapper` and `Reducer` implementations that can be used as a starting point for building Map/Reduce applications that process RDF.  Typically more complex applications will need to implement their own variants but these basic ones may still prove useful as part of a larger pipeline.

{% toc %}

# Tasks

The API is divided based upon implementations that support various common Hadoop tasks with appropriate `Mapper` and `Reducer` implementations provided for each.  In most cases these are implemented to be at least partially abstract to make it easy to implement customised versions of these.

The following common tasks are supported:

- Counting
- Filtering
- Grouping
- Splitting
- Transforming

Note that standard Map/Reduce programming rules apply as normal.  For example if a mapper/reducer transforms between data types then you need to make `setMapOutputKeyClass()`, `setMapOutputValueClass()`, `setOutputKeyClass()` and `setOutputValueClass()` calls on your Job configuration as necessary.

## Counting

Counting is one of the classic Map/Reduce tasks and features as both the official Map/Reduce example for both Hadoop itself and for Elephas.  Implementations cover a number of different counting tasks that you might want to carry out upon RDF data, in most cases you will use the desired `Mapper` implementation in conjunction with the `NodeCountReducer`.

### Node Usage

The simplest type of counting supported is to count the usages of individual RDF nodes within the triples/quads.  Depending on whether your data is triples/quads you can use either the `TripleNodeCountMapper` or the `QuadNodeCountMapper`.

If you want to count only usages of RDF nodes in a specific position then we also provide variants for that, for example `TripleSubjectCountMapper` counts only RDF nodes present in the subject position.  You can substitute `Predicate` or `Object` into the class name in place of `Subject` if you prefer to count just RDF nodes in the predicate/object position instead.  Similarly replace `Triple` with `Quad` if you wish to count usage of RDF nodes in specific positions of quads, an additional `QuadGraphCountMapper` if you want to calculate the size of graphs.

### Literal Data Types

Another interesting variant of counting is to count the usage of literal data types, you can use the `TripleDataTypeCountMapper` or `QuadDataTypeCountMapper` if you want to do this.

### Namespaces

Finally you may be interested in the usage of namespaces within your data, in this case the `TripleNamespaceCountMapper` or `QuadNamespaceCountMapper` can be used to do this.  For this use case you should use the `TextCountReducer` to total up the counts for each namespace.  Note that the mappers determine the namespace for a URI simply by splitting after the last `#` or `/` in the URI, if no such character exists then the full URI is considered to be the namespace.

## Filtering

Filtering is another classic Map/Reduce use case, here you want to take the data and extract only the portions that you are interested in based on some criteria.  All our filter `Mapper` implementations also support a Job configuration option named `rdf.mapreduce.filter.invert` allowing their effects to be inverted if desired e.g.

    config.setBoolean(RdfMapReduceConstants.FILTER_INVERT, true);

### Valid Data

One type of filter that may be useful particularly if you are generating RDF data that may not be strict RDF is the `ValidTripleFilterMapper` and the `ValidQuadFilterMapper`.  These filters only keep triples/quads that are valid according to strict RDF semantics i.e.

- Subject can only be URI/Blank Node
- Predicate can only be a URI
- Object can be a URI/Blank Node/Literal
- Graph can only be a URI or Blank Node

If you wanted to extract only the bad data e.g. for debugging then you can of course invert these filters by setting `rdf.mapreduce.filter.invert` to `true` as shown above.

### Ground Data

In some cases you may only be interesting in triples/quads that are grounded i.e. don't contain blank nodes in which case the `GroundTripleFilterMapper` and `GroundQuadFilterMapper` can be used.

### Data with a specific URI

In lots of case you may want to extract only data where a specific URI occurs in a specific position, for example if you wanted to extract all the `rdf:type` declarations then you might want to use the `TripleFilterByPredicateUriMapper` or `QuadFilterByPredicateUriMapper` as appropriate.  The job configuration option `rdf.mapreduce.filter.predicate.uris` is used to provide a comma separated list of the full URIs you want the filter to accept e.g.

    config.set(RdfMapReduceConstants.FILTER_PREDICATE_URIS, "http://example.org/predicate,http://another.org/predicate");

Similar to the counting of node usage you can substitute `Predicate` for `Subject`, `Object` or `Graph` as desired.  You will also need to do this in the job configuration option, for example to filter on subject URIs in quads use the `QuadFilterBySubjectUriMapper` and the `rdf.mapreduce.filter.subject.uris` configuration option e.g.

    config.set(RdfMapReduceConstants.FILTER_SUBJECT_URIS, "http://example.org/myInstance");

## Grouping

Grouping is again another frequent Map/Reduce use case, here we provide implementations that allow you to group triples or quads by a specific RDF node within the triples/quads e.g. by subject.  For example to group quads by predicate use the `QuadGroupByPredicateMapper`, similar to filtering and counting you can substitute `Predicate` for `Subject`, `Object` or `Graph` if you wish to group by another node of the triple/quad.

## Splitting

Splitting allows you to split triples/quads up into the constituent RDF nodes, we provide two kinds of splitting:

- To Nodes - Splits pairs of arbitrary keys with triple/quad values into several pairs of the key with the nodes as the values
- With Nodes - Splits pairs of arbitrary keys with triple/quad values keeping the triple/quad as the key and the nodes as the values.

## Transforming

Transforming provides some very simple implementations that allow you to convert between triples and quads.  For the lossy case of going from quads to triples simply use the `QuadsToTriplesMapper`.

If you want to go the other way - triples to quads - this requires adding a graph field to each triple and we provide two implementations that do that.  Firstly there is `TriplesToQuadsBySubjectMapper` which puts each triple into a graph based on its subject i.e. all triples with a common subject go into a graph named for the subject.  Secondly there is `TriplesToQuadsConstantGraphMapper` which simply puts all triples into the default graph, if you wish to change the target graph you should extend this class.  If you wanted to select the graph to use based on some arbitrary criteria you should look at extending the `AbstractTriplesToQuadsMapper` instead.

# Example Jobs

## Node Count

The following example shows how to configure a job which performs a node count i.e. counts the usages of RDF terms (aka nodes in Jena parlance) within the data:

    
    // Assumes we have already created a Hadoop Configuration 
    // and stored it in the variable config
    Job job = Job.getInstance(config);
    
    // This is necessary as otherwise Hadoop won't ship the JAR to all
    // nodes and you'll get ClassDefNotFound and similar errors
    job.setJarByClass(Example.class);
    
    // Give our job a friendly name
    job.setJobName("RDF Triples Node Usage Count");

    // Mapper class
    // Since the output type is different from the input type have to declare
    // our output types
    job.setMapperClass(TripleNodeCountMapper.class);
    job.setMapOutputKeyClass(NodeWritable.class);
    job.setMapOutputValueClass(LongWritable.class);
    
    // Reducer class
    job.setReducerClass(NodeCountReducer.class);

    // Input
    // TriplesInputFormat accepts any RDF triples serialisation
    job.setInputFormatClass(TriplesInputFormat.class);
    
    // Output
    // NTriplesNodeOutputFormat produces lines consisting of a Node formatted
    // according to the NTriples spec and the value separated by a tab
    job.setOutputFormatClass(NTriplesNodeOutputFormat.class);
    
    // Set your input and output paths
    FileInputFormat.setInputPath(job, new Path("/example/input"));
    FileOutputFormat.setOutputPath(job, new Path("/example/output"));
    
    // Now run the job...