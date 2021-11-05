---
title: Apache Jena Elephas - IO API
---

The IO API provides support for reading and writing RDF within Apache Hadoop applications.  This is done by providing `InputFormat` and `OutputFormat` implementations that cover all the RDF serialisations that Jena supports.

{% toc %}

# Background on Hadoop IO

If you are already familiar with the Hadoop IO paradigm then please skip this section, if not please read as otherwise some of the later information will not make much sense.

Hadoop applications and particularly Map/Reduce exploit horizontally scalability by dividing input data up into *splits* where each *split* represents a portion of the input data that can be read in *isolation* from the other pieces.  This *isolation* property is very important to understand, if a file format requires that the entire file be read sequentially in order to properly interpret it then it cannot be split and must be read as a whole.

Therefore depending on the file formats used for your input data you may not get as much parallel performance because Hadoop's ability to *split* the input data may be limited.

In some cases there are file formats that may be processed in multiple ways i.e. you can *split* them into pieces or you can process them as a whole.  Which approach you wish to use will depend on whether you have a single file to process or many files to process.  In the case of many files processing files as a whole may provide better overall throughput than processing them as chunks.  However your mileage may vary especially if your input data has many files of uneven size.

## Compressed IO

Hadoop natively provides support for compressed input and output providing your Hadoop cluster is appropriately configured.  The advantage of compressing the input/output data is that it means there is less IO workload on the cluster however this comes with the disadvantage that most compression formats block Hadoop's ability to *split* up the input.

Hadoop generally handles compression automatically and all our input and output formats are capable of handling compressed input and output as necessary.  However in order to use this your Hadoop cluster/job configuration must be appropriately configured to inform Hadoop about what compression codecs are in use.

For example to enable BZip2 compression (assuming your cluster doesn't enable this by default):

    // Assumes you already have a Configuration object you are preparing 
    // in the variable config
    
    config.set(HadoopIOConstants.IO_COMPRESSION_CODECS, BZip2Codec.class.getCanonicalName());

See the Javadocs for the Hadoop [CompressionCodec](https://hadoop.apache.org/docs/current/api/org/apache/hadoop/io/compress/CompressionCodec.html) API to see the available out of the box implementations.  Note that some clusters may provide additional compression codecs beyond those built directly into Hadoop.

# RDF IO in Hadoop

There are a wide range of RDF serialisations supported by ARQ, please see the [RDF IO](../io/) for an overview of the formats that Jena supports.  In this section we go into a lot more depth of how exactly we support RDF IO in Hadoop.

## Input

One of the difficulties posed when wrapping these for Hadoop IO is that the formats have very different properties in terms of our ability to *split* them into distinct chunks for Hadoop to process.  So we categorise the possible ways to process RDF inputs as follows:

1. Line Based - Each line of the input is processed as a single line
2. Batch Based - The input is processed in batches of N lines (where N is configurable)
3. Whole File - The input is processed as a whole

There is then also the question of whether a serialisation encodes triples, quads or can encode both.  Where a serialisation encodes both we provide two variants of it so you can choose whether you want to process it as triples/quads.

### Blank Nodes in Input

Note that readers familiar with RDF may be wondering how we cope with blank nodes when splitting input and this is an important issue to address.

Essentially Jena contains functionality that allows it to predictably generate identifiers from the original identifier present in the file e.g. `_:blank`.  This means that wherever `_:blank` appears  in the original file we are guaranteed to assign it the same internal identifier.  Note that this functionality uses a seed value to ensure that blank nodes coming from different input files are not assigned the same identifier.

When used with Hadoop this seed is chosen based on a combination of the Job ID and the input file path.  This means that the same file processed by different jobs will produce different blank node identifiers each time.  However within a job every read of the file will predictably generate blank node identifiers so splitting does not prevent correct blank node identification.

Additionally the binary serialisation we use for our RDF primitives (described on the [Common API](common.html)) page guarantees that internal identifiers are preserved as-is when communicating values across the cluster.

### Mixed Inputs

In many cases your input data may be in a variety of different RDF formats in which case we have you covered.  The `TriplesInputFormat`, `QuadsInputFormat` and `TriplesOrQuadsInputFormat` can handle mixture of triples/quads/both triples & quads as desired.  Note that in the case of `TriplesOrQuadsInputFormat` any triples are up-cast into quads in the default graph.

With mixed inputs the specific input format to use for each is determined based on the file extensions of each input file, unrecognised extensions will result in an `IOException`.  Compression is handled automatically you simply need to name your files appropriately to indicate the type of compression used e.g. `example.ttl.gz` would be treated as GZipped Turtle, if you've used a decent compression tool it should have done this for you.  The downside of mixed inputs is that it decides quite late what the input format is which means that it always processes inputs as whole files because it doesn't decide on the format until after it has been asked to split the inputs.

## Output

As with input we also need to be careful about how we output RDF data.  Similar to input some serialisations can be output in a streaming fashion while other serialisations require us to store up all the data and then write it out in one go at the end.  We use the same categorisations for output though the meanings are slightly different:

1. Line Based - Each record is written as soon as it is received
2. Batch Based - Records are cached until N records are seen or the end of output and then the current batch is output (where N is configurable)
3. Whole File - Records are cached until the end of output and then the entire output is written in one go

However both the batch based and whole file approaches have the downside that it is possible to exhaust memory if you have large amounts of output to process (or set the batch size too high for batch based output).

### Blank Nodes in Output

As with input blank nodes provide a complicating factor in producing RDF output.  For whole file output formats this is not an issue but it does need to be considered for line and batch based formats.

However what we have found in practise is that the Jena writers will predictably map internal identifiers to the blank node identifiers in the output serialisations.  What this means is that even when processing output in batches we've found that using the line/batch based formats correctly preserve blank node identity.

If you are concerned about potential data corruption as a result of this then you should make sure to always choose a whole file output format but be aware that this can exhaust memory if your output is large.

#### Blank Node Divergence in multi-stage pipelines

The other thing to consider with regards to blank nodes in output is that Hadoop will by default create multiple output files (one for each reducer) so even if consistent and valid blank nodes are output they may be spread over multiple files.

In multi-stage pipelines you may need to manually concatenate these files back together (assuming they are in a format that allows this e.g. NTriples) as otherwise when you pass them as input to the next job the blank node identifiers will diverge from each other.  [JENA-820](https://issues.apache.org/jira/browse/JENA-820) discusses this problem and introduces a special configuration setting that can be used to resolve this.  Note that even with this setting enabled some formats are not capable of respecting it, see the later section on [Job Configuration Options](#job-configuration-options) for more details.

An alternative workaround is to always use RDF Thrift as the intermediate output format since it preserves blank node identifiers precisely as they are seen.  This also has the advantage that RDF Thrift is extremely fast to read and write which can speed up multi-stage pipelines considerably.

### Node Output Format

We also include a special `NTriplesNodeOutputFormat` which is capable of outputting pairs composed of a `NodeWritable` key and any value type.  Think of this as being similar to the standard Hadoop `TextOutputFormat` except it understands how to format nodes as valid NTriples serialisation.  This format is useful when performing simple statistical analysis such as node usage counts or other calculations over nodes.

In the case where the value of the key value pair is also a RDF primitive proper NTriples formatting is also applied to each of the nodes in the value

## RDF Serialisation Support

### Input

The following table categorises how each supported RDF serialisation is processed for input.  Note that in some cases we offer multiple ways to process a serialisation.

<table>
  <tr>
    <th>RDF Serialisation</th>
    <th>Line Based</th>
    <th>Batch Based</th>
    <th>Whole File</th>
  </tr>
  <tr>
    <th colspan="4">Triple Formats</th>
  </tr>
  <tr><td>NTriples</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
  <tr><td>Turtle</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>RDF/XML</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>RDF/JSON</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr>
    <th colspan="4">Quad Formats</th>
  </tr>
  <tr><td>NQuads</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
  <tr><td>TriG</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>TriX</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr>
    <th colspan="4">Triple/Quad Formats</th>
  </tr>
  <tr><td>JSON-LD</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>RDF Thrift</td><td>No</td><td>No</td><td>Yes</td></tr>
</table>

### Output
  
The following table categorises how each supported RDF serialisation can be processed for output.  As with input some serialisations may be processed in multiple ways.

<table>
  <tr>
    <th>RDF Serialisation</th>
    <th>Line Based</th>
    <th>Batch Based</th>
    <th>Whole File</th>
  </tr>
  <tr>
    <th colspan="4">Triple Formats</th>
  </tr>
  <tr><td>NTriples</td><td>Yes</td><td>No</td><td>No</td></tr>
  <tr><td>Turtle</td><td>Yes</td><td>Yes</td><td>No</td></tr>
  <tr><td>RDF/XML</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>RDF/JSON</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr>
    <th colspan="4">Quad Formats</th>
  </tr>
  <tr><td>NQuads</td><td>Yes</td><td>No</td><td>No</td></tr>
  <tr><td>TriG</td><td>Yes</td><td>Yes</td><td>No</td></tr>
  <tr><td>TriX</td><td>Yes</td><td>No</td><td>No</td></tr>
  <tr>
    <th colspan="4">Triple/Quad Formats</th>
  </tr>
  <tr><td>JSON-LD</td><td>No</td><td>No</td><td>Yes</td></tr>
  <tr><td>RDF Thrift</td><td>Yes</td><td>No</td><td>No</td></tr>
</table>

## Job Setup

To use RDF as an input and/or output format you will need to configure your Job appropriately, this requires setting the input/output format and setting the data paths:

    // Create a job using default configuration
    Job job = Job.createInstance(new Configuration(true));
    
    // Use Turtle as the input format
    job.setInputFormatClass(TurtleInputFormat.class);
    FileInputFormat.setInputPath(job, "/users/example/input");
    
    // Use NTriples as the output format
    job.setOutputFormatClass(NTriplesOutputFormat.class);
    FileOutputFormat.setOutputPath(job, "/users/example/output");
    
    // Other job configuration...

This example takes in input in Turtle format from the directory `/users/example/input` and outputs the end results in NTriples in the directory `/users/example/output`.
    
Take a look at the [Javadocs](../javadoc/hadoop/io/) to find the actual available input and output format implementations.

### Job Configuration Options

There are a several useful configuration options that can be used to tweak the behaviour of the RDF IO functionality if desired.

#### Input Lines per Batch

Since our line based input formats use the standard Hadoop `NLineInputFormat` to decide how to split up inputs we support the standard `mapreduce.input.lineinputformat.linespermap` configuration setting for changing the number of lines processed per map.

You can set this directly in your configuration:

    job.getConfiguration().setInt(NLineInputFormat.LINES_PER_MAP, 100);
    
Or you can use the convenience method of `NLineInputFormat` like so:

    NLineInputFormat.setNumLinesPerMap(job, 100);
    
#### Max Line Length

When using line based inputs it may be desirable to ignore lines that exceed a certain length (for example if you are not interested in really long literals).  Again we use the standard Hadoop configuration setting `mapreduce.input.linerecordreader.line.maxlength` to control this behaviour:

    job.getConfiguration().setInt(HadoopIOConstants.MAX_LINE_LENGTH, 8192);
    
#### Ignoring Bad Tuples

In many cases you may have data that you know contains invalid tuples, in such cases it can be useful to just ignore the bad tuples and continue.  By default we enable this behaviour and will skip over bad tuples though they will be logged as an error.  If you want you can disable this behaviour by setting the `rdf.io.input.ignore-bad-tuples` configuration setting:

    job.getConfiguration().setBoolean(RdfIOConstants.INPUT_IGNORE_BAD_TUPLES, false);
    
#### Global Blank Node Identity

The default behaviour of this library is to allocate file scoped blank node identifiers in such a way that the same syntactic identifier read from the same file is allocated the same blank node ID even across input splits within a job.  Conversely the same syntactic identifier in different input files will result in different blank nodes within a job.

However as discussed earlier in the case of multi-stage jobs the intermediate outputs may be split over several files which can cause the blank node identifiers to diverge from each other when they are read back in by subsequent jobs.  For multi-stage jobs this is often (but not always) incorrect and undesirable behaviour in which case you will need to set the `rdf.io.input.bnodes.global-identity` property to true for the subsequent jobs:

    job.getConfiguration.setBoolean(RdfIOConstants.GLOBAL_BNODE_IDENTITY, true);
    
**Important** - This should only be set for the later jobs in a multi-stage pipeline and should rarely (if ever) be set for single jobs or the first job of a pipeline.
    
Even with this setting enabled not all formats are capable of honouring this option, RDF/XML and JSON-LD will ignore this option and should be avoided as intermediate output formats.

As noted earlier an alternative workaround to enabling this setting is to instead use RDF Thrift as the intermediate output format since it guarantees to preserve blank node identifiers as-is on both reads and writes.

#### Output Batch Size

The batch size for batched output formats can be controlled by setting the `rdf.io.output.batch-size` property as desired.  The default value for this if not explicitly configured is 10,000:

    job.getConfiguration.setInt(RdfIOConstants.OUTPUT_BATCH_SIZE, 25000);