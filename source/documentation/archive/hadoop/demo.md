---
title: Apache Jena Elephas - RDF Stats Demo
---

The RDF Stats Demo is a pre-built application available as a ready to run Hadoop Job JAR with all dependencies embedded within it.  The demo app uses the other libraries to allow calculating a number of basic statistics over any RDF data supported by Elephas.

To use it you will first need to build it from source or download the relevant Maven artefact:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-elephas-stats</artifactId>
      <version>x.y.z</version>
      <classifier>hadoop-job</classifier>
    </dependency>
    
Where `x.y.z` is the desired version.

# Pre-requisites

In order to run this demo you will need to have a Hadoop 2.x cluster available, for simple experimentation purposes a [single node cluster](http://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/SingleCluster.html) will be sufficient.

# Running

Assuming your cluster is started and running and the `hadoop` command is available on your path you can run the application without any arguments to see help:

    > hadoop jar jena-elephas-stats-VERSION-hadoop-job.jar org.apache.jena.hadoop.rdf.stats.RdfStats
    NAME
        hadoop jar PATH_TO_JAR org.apache.jena.hadoop.rdf.stats.RdfStats - A
        command which computes statistics on RDF data using Hadoop

    SYNOPSIS
        hadoop jar PATH_TO_JAR org.apache.jena.hadoop.rdf.stats.RdfStats
                [ {-a | --all} ] [ {-d | --data-types} ] [ {-g | --graph-sizes} ]
                [ {-h | --help} ] [ --input-type <inputType> ] [ {-n | --node-count} ]
                [ --namespaces ] {-o | --output} <OutputPath> [ {-t | --type-count} ]
                [--] <InputPath>...

    OPTIONS
        -a, --all
            Requests that all available statistics be calculated

        -d, --data-types
            Requests that literal data type usage counts be calculated

        -g, --graph-sizes
            Requests that the size of each named graph be counted

        -h, --help
            Display help information

        --input-type <inputType>
            Specifies whether the input data is a mixture of quads and triples,
            just quads or just triples. Using the most specific data type will
            yield the most accurate statistics

            This options value is restricted to the following value(s):
                mixed
                quads
                triples

        -n, --node-count
            Requests that node usage counts be calculated

        --namespaces
            Requests that namespace usage counts be calculated

        -o <OutputPath>, --output <OutputPath>
            Sets the output path

        -t, --type-count
            Requests that rdf:type usage counts be calculated

        --
            This option can be used to separate command-line options from the
            list of argument, (useful when arguments might be mistaken for
            command-line options)

        <InputPath>
            Sets the input path(s)

If we wanted to calculate the node count on some data we could do the following:

    > hadoop jar jena-elephas-stats-VERSION-hadoop-job.jar org.apache.jena.hadoop.rdf.stats.RdfStats --node-count --output /example/output /example/input

This calculates the node counts for the input data found in `/example/input` placing the generated counts in `/example/output`

## Specifying Inputs and Outputs

Inputs are specified simply by providing one or more paths to the data you wish to analyse.  You can provide directory paths in which case all files within the directory will be processed.

To specify the output location use the `-o` or `--output` option followed by the desired output path.

By default the demo application assumes a mixture of quads and triples data, if you know your data is only in triples/quads then you can use the `--input-type` argument followed by `triples` or `quads` to indicate the type of your data.  Not doing this can skew some statistics as the default is to assume mixed data and so all triples are upgraded into quads when calculating the statistics.
    
## Available Statistics

The following statistics are available and are activated by the relevant command line option:

<table>
  <tr><th>Command Line Option</th><th>Statistic</th><th>Description & Notes</th></tr>
  <tr><td><code>-n</code> or <code>--node-count</code></td><td>Node Count</td><td>Counts the occurrences of each unique RDF term i.e. node in Jena parlance</td></tr>
  <tr><td><code>-t</code> or <code>--type-count</code></td><td>Type Count</td><td>Counts the occurrences of each declared <code>rdf:type</code> value</td></tr>
  <tr><td><code>-d</code> or <code>--data-types</code></td><td>Data Type Count</td><td>Counts the occurrences of each declared literal data type</td></tr>
  <tr><td><code>--namespaces</code></td><td>Namespace Counts</td><td>Counts the occurrences of namespaces within the data.<br />Namespaces are determined by splitting URIs at the <code>#</code> fragment separator if present and if not the last <code>/</code> character
  <tr><td><code>-g</code> or <code>--graph-sizes</code></td><td>Graph Sizes</td><td>Counts the sizes of each graph declared in the data</td></tr>
</table>

You can also use the `-a` or `--all` option if you simply wish to calculate all statistics.