---
title: Apache Jena Elephas
---

Apache Jena Elephas is a set of libraries which provide various basic building blocks which enable you to start writing Apache Hadoop based applications which work with RDF data.

Historically there has been no serious support for RDF within the Hadoop ecosystem and what support has existed has
often been limited and task specific.  These libraries aim to be as generic as possible and provide the necessary
infrastructure that enables developers to create their application specific logic without worrying about the
underlying plumbing.

## Beta

These modules are currently considered to be in a **Beta** state, they have been under active development for about a year but have not yet been widely deployed and may contain as yet undiscovered bugs.

Please see the [How to Report a Bug](../../help_and_support/bugs_and_suggestions.html) page for how to report any bugs you may encounter.

## Documentation

- [Overview](#overview)
- [Getting Started](#getting-started)
- APIs
    - [Common](common.html)
    - [IO](io.html)
    - [Map/Reduce](mapred.html)
    - [Javadoc](../javadoc/elephas/)
- Examples
    - [RDF Stats Demo](demo.html)
- [Maven Artifacts](artifacts.html)

## Overview

Apache Jena Elephas is published as a set of Maven module via its [maven artifacts](artifacts.html).  The source for these libraries
may be [downloaded](/download/index.cgi) as part of the source distribution.  These modules are built against the Hadoop 2.x. APIs and no
backwards compatibility for 1.x is provided.

The core aim of these libraries it to provide the basic building blocks that allow users to start writing Hadoop applications that
work with RDF.  They are mostly fairly low level components but they are designed to be used as building blocks to help users and developers
focus on actual application logic rather than on the low level plumbing.

Firstly at the lowest level they provide `Writable` implementations that allow the basic RDF primitives - nodes, triples and quads -
to be represented and exchanged within Hadoop applications, this support is provided by the [Common](common.html) library.

Secondly they provide support for all the RDF serialisations which Jena supports as both input and output formats subject to the specific 
limitations of those serialisations.  This support is provided by the [IO](io.html) library in the form of standard `InputFormat` and
`OutputFormat` implementations.

There are also a set of basic `Mapper` and `Reducer` implementations provided by the [Map/Reduce](mapred.html) library which contains code
that enables various common Hadoop tasks such as counting, filtering, splitting and grouping to be carried out on RDF data.  Typically these
will be used as a starting point to build more complex RDF processing applications.

Finally there is a [RDF Stats Demo](demo.html) which is a runnable Hadoop job JAR file that demonstrates using these libraries to calculate
a number of basic statistics over arbitrary RDF data.

## Getting Started

To get started you will need to add the relevant dependencies to your project, the exact dependencies necessary will depend 
on what you are trying to do.  Typically you will likely need at least the IO library and possibly the Map/Reduce library:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-io</artifactId>
      <version>x.y.z</version>
    </dependency>
    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-mapreduce</artifactId>
      <version>x.y.z</version>
    </dependency>

Our libraries depend on the relevant Hadoop libraries but since these libraries are typically provided by the Hadoop cluster those dependencies are marked as `provided` and thus are not transitive.  This means that you will typically also need to add the following additional dependencies:

    <!-- Hadoop Dependencies -->
    <!-- 
        Note these will be provided on the Hadoop cluster hence the provided 
        scope 
    -->
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-common</artifactId>
      <version>2.6.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-mapreduce-client-common</artifactId>
      <version>2.6.0</version>
      <scope>provided</scope>
    </dependency>

You can then write code to launch a Map/Reduce job that works with RDF.  For example let us consider a RDF variation of the classic Hadoop
word count example.  In this example which we call node count we do the following:

- Take in some RDF triples
- Split them up into their constituent nodes i.e. the URIs, Blank Nodes & Literals
- Assign an initial count of one to each node
- Group by node and sum up the counts
- Output the nodes and their usage counts

We will start with our `Mapper` implementation, as you can see this simply takes in a triple and splits it into its constituent nodes.  It
then outputs each node with an initial count of 1:

    package org.apache.jena.hadoop.rdf.mapreduce.count;
    
    import org.apache.jena.hadoop.rdf.types.NodeWritable;
    import org.apache.jena.hadoop.rdf.types.TripleWritable;
    import org.apache.jena.graph.Triple;
    
    /**
     * A mapper for counting node usages within triples designed primarily for use
     * in conjunction with {@link NodeCountReducer}
     *
     * @param <TKey> Key type
     */
    public class TripleNodeCountMapper<TKey> extends AbstractNodeTupleNodeCountMapper<TKey, Triple, TripleWritable> {

        @Override
        protected NodeWritable[] getNodes(TripleWritable tuple) {
            Triple t = tuple.get();
            return new NodeWritable[] { new NodeWritable(t.getSubject()), 
                                        new NodeWritable(t.getPredicate()),
                                        new NodeWritable(t.getObject()) };
        }
    }

And then our `Reducer` implementation, this takes in the data grouped by node and sums up the counts outputting the node and the final count:

    package org.apache.jena.hadoop.rdf.mapreduce.count;

    import java.io.IOException;
    import java.util.Iterator;
    import org.apache.hadoop.io.LongWritable;
    import org.apache.hadoop.mapreduce.Reducer;
    import org.apache.jena.hadoop.rdf.types.NodeWritable;

    /**
     * A reducer which takes node keys with a sequence of longs representing counts
     * as the values and sums the counts together into pairs consisting of a node
     * key and a count value.
     */
    public class NodeCountReducer extends Reducer<NodeWritable, LongWritable, NodeWritable, LongWritable> {

        @Override
        protected void reduce(NodeWritable key, Iterable<LongWritable> values, Context context) throws IOException,
                InterruptedException {
            long count = 0;
            Iterator<LongWritable> iter = values.iterator();
            while (iter.hasNext()) {
                count += iter.next().get();
            }
            context.write(key, new LongWritable(count));
        }
    }

Finally we then need to define an actual Hadoop job we can submit to run this.  Here we take advantage of the [IO](io.html) library to provide
us with support for our desired RDF input format:

    package org.apache.jena.hadoop.rdf.stats;

    import org.apache.hadoop.conf.Configuration;
    import org.apache.hadoop.fs.Path;
    import org.apache.hadoop.io.LongWritable;
    import org.apache.hadoop.mapreduce.Job;
    import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
    import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
    import org.apache.jena.hadoop.rdf.io.input.TriplesInputFormat;
    import org.apache.jena.hadoop.rdf.io.output.ntriples.NTriplesNodeOutputFormat;
    import org.apache.jena.hadoop.rdf.mapreduce.count.NodeCountReducer;
    import org.apache.jena.hadoop.rdf.mapreduce.count.TripleNodeCountMapper;
    import org.apache.jena.hadoop.rdf.types.NodeWritable;
    
    public class RdfMapReduceExample {

        public static void main(String[] args) {
            try {
                // Get Hadoop configuration
                Configuration config = new Configuration(true);

                // Create job
                Job job = Job.getInstance(config);
                job.setJarByClass(RdfMapReduceExample.class);
                job.setJobName("RDF Triples Node Usage Count");
 
                // Map/Reduce classes
                job.setMapperClass(TripleNodeCountMapper.class);
                job.setMapOutputKeyClass(NodeWritable.class);
                job.setMapOutputValueClass(LongWritable.class);
                job.setReducerClass(NodeCountReducer.class);

                // Input and Output
                job.setInputFormatClass(TriplesInputFormat.class);
                job.setOutputFormatClass(NTriplesNodeOutputFormat.class);
                FileInputFormat.setInputPaths(job, new Path("/example/input/"));
                FileOutputFormat.setOutputPath(job, new Path("/example/output/"));

                // Launch the job and await completion
                job.submit();
                if (job.monitorAndPrintJob()) {
                    // OK
                    System.out.println("Completed");
                } else {
                    // Failed
                    System.err.println("Failed");
                }
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
    }

So this really is no different from configuring any other Hadoop job, we simply have to point to the relevant input and output formats and provide our mapper and reducer.  Note that here we use the `TriplesInputFormat` which can handle RDF in any Jena supported format, if you know your RDF is in a specific format it is usually more efficient to use a more specific input format.  Please see the [IO](io.html) page for more detail on the available input formats and the differences between them.

We recommend that you next take a look at our [RDF Stats Demo](demo.html) which shows how to do some more complex computations by chaining multiple jobs together.

## APIs

There are three main libraries each with their own API:

- [Common](common.html) - this provides the basic data model for representing RDF data within Hadoop
- [IO](io.html) - this provides support for reading and writing RDF
- [Map/Reduce](mapred.html) - this provides support for writing Map/Reduce jobs that work with RDF
