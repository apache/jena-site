---
title: Jena schemagen HOWTO
---

The `schemagen` provided with Jena is used to convert an OWL or RDFS vocabulary into a Java class file that contains static
constants for the terms in the vocabulary. This documents outlines
the use of schemagen, and the various options and templates that
may be used to control the output.

Schemagen is typically invoked from the command line or from a
built script (such as Ant). Synopsis of the command:

    java jena.schemagen -i <input> [-a <namespaceURI>] [-o <output file>] [-c <config uri>] [-e <encoding>] ...

Schemagen is highly configurable, either with command line options
or by RDF information read from a configuration file. **Many**
other options are defined, and these are described in detail below.
Note that the `CLASSPATH` environment variable must be set to
include the Jena `.jar` libraries.

## Summary of configuration options

For quick reference, here is a list of all of the schemagen options
(both command line and configuration file). The use of these
options is explained in detail below.

Table 1: schemagen options

Command line option | RDF config file property | Meaning
------------------- | ------------------------ | -------
`-a <uri>` | `sgen:namespace` | The namespace URI for the vocabulary. Names with this URI as prefix are automatically included in the generated vocabulary. If not specified, the base URI of the ontology is used as a default (but note that some ontology documents don't define a base URI).
`-c <filename>`<br />`-c <url>` | | Specify an alternative config file.
`--classdec <string>` | `sgen:classdec` | Additional decoration for class header (such as `implements`)
`--classnamesuffix <string>` | `sgen:classnamesuffix` | Option for adding a suffix to the generated class name, e.g. "Vocab".
`--classSection <string>` |  `sgen:classSection` | Section declaration comment for class section.
`--classTemplate <string>`  | `sgen:classTemplate` | Template for writing out declarations of class resources.
`--datatypesSection <string>` | `sgen:datatypesSection` | Section declaration comment for datatypes section.
`--datatypeTemplate <string>` | `sgen:datatypeTemplate` | Template for writing out declarations of datatypes.
`--declarations <string>` | `sgen:declarations` | Additional declarations to add at the top of the class.
`--dos` | `sgen:dos` | Use MSDOS-style line endings (i.e. \\r\\n). Default is Unix-style line endings.
`-e <string>` | `sgen:encoding` | The surface syntax of the input file (e.g. RDF/XML, N3). Defaults to RDF/XML.
`--footer <string>` | `sgen:footer` | Template for standard text to add to the end of the file.
`--header <string>` | `sgen:header` | Template for the file header, including the class comment.
`-i <filename>` <br />`-i <url>` | `sgen:input` | Specify the input document to load
`--include <uri>` | `sgen:include` | Option for including non-local URI's in vocabulary
`--individualsSection <string>` | `sgen:individualsSection` | Section declaration comment for individuals section.
`--individualTemplate <string>` | `sgen:individualTemplate` | Template for writing out declarations of individuals.
`--inference` | `sgen:inference` | Causes the model that loads the document prior to being processed to apply inference rules appropriate to the language. E.g. OWL inference rules will be used on a `.owl` file.
`--marker <string>` | `sgen:marker` | Specify the marker string for substitutions, default is '%'
`-n <string>` | `sgen:classname` | The name of the generated class. The default is to synthesise a name based on input document name.
`--noclasses` | `sgen:noclasses`|  Option to suppress classes in the generated vocabulary file
`--nocomments` | `sgen:noComments` | Turn off all comment output in the generated vocabulary
`--nodatatypes` | `sgen:nodatatypes` | Option to suppress datatypes in the generated vocabulary file.
`--noheader` | `sgen:noHeader` | Prevent the output of a file header, with class comment etc.
`--noindividuals` | `sgen:noindividuals` | Option to suppress individuals in the generated vocabulary file.
`--noproperties` | `sgen:noproperties` | Option to suppress properties in the generated vocabulary file.
`-o <filename>`  <br /> `-o <dir>` | `sgen:output` | Specify the destination for the output. If the given value evaluates to a directory, the generated class will be placed in that directory with a file name formed from the generated (or given) class name with ".java" appended.
`--nostrict` | `sgen:noStrict` | Option to turn off strict checking for ontology classes and properties (prevents `ConversionExceptions`).
`--ontology` | `sgen:ontology` | The generated vocabulary will use the ontology API terms, in preference to RDF model API terms.
`--owl` | `sgen:owl` | Specify that the language of the source is OWL (the default). Note that RDFS is a subset of OWL, so this setting also suffices for RDFS.
`--package <string>` | `sgen:package` | Specify the Java package name and directory.
`--propSection <string>` | `sgen:propSection` | Section declaration comment for properties section.
`--propTemplate <string>` | `sgen:propTemplate` | Template for writing out declarations of property resources.
`-r <uri>` | | Specify the uri of the root node in the RDF configuration model.
`--rdfs` | `sgen:rdfs` | Specify that the language of the source ontology is RDFS.
`--strictIndividuals` | `sgen:strictIndividuals` | When selecting the individuals to include in the output class, schemagen will normally include those individuals whose `rdf:type` is in the included namespaces for the vocabulary. However, if `strictIndividuals` is turned on, then all individuals in the output class must themselves have a URI in the included namespaces.
`--uppercase`  | `sgen:uppercase` | Option for mapping constant names to uppercase (like Java constants). Default is to leave the case of names unchanged.
`--includeSource` | `sgen:includeSource` | Serializes the source code of the vocabulary, and includes this into the generated class file. At class load time, creates a `Model` containing the definitions from the source

## What does schemagen do?

RDFS and OWL provide a very convenient means to define a
controlled vocabulary or ontology. For general ontology processing,
Jena provides various API's to allow the source files to be read in
and manipulated. However, when developing an application, it is
frequently convenient to refer to the controlled vocabulary terms
directly from Java code. This leads typically to the declaration of
constants, such as:

        public static final Resource A_CLASS = new ResourceImpl( "http://example.org/schemas#a-class" );

When these constants are defined manually, it is tedious and
error-prone to maintain them in sync with the source ontology
file. Schemagen automates the production of Java constants that
correspond to terms in an ontology document. By automating the step
from source vocabulary to Java constants, a source of error and
inconsistency is removed.

### Example

Perhaps the easiest way to explain the detail of what schemagen
does is to show an example. Consider the following mini-RDF
vocabulary:

    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
                xmlns="http://example.org/eg#"
             xml:base="http://example.org/eg">
      <rdfs:Class rdf:ID="Dog">
          <rdfs:comment>A class of canine companions</rdfs:comment>
      </rdfs:Class>
      <rdf:Property rdf:ID="petName">
          <rdfs:comment>The name that everyone calls a dog</rdfs:comment>
          <rdfs:domain rdf:resource="http://example.org/eg#Dog" />
      </rdf:Property>
      <rdf:Property rdf:ID="kennelName">
          <rdfs:comment>Posh dogs have a formal name on their KC certificate</rdfs:comment>
      </rdf:Property>
      <Dog rdf:ID="deputy">
          <rdfs:comment>Deputy is a particular Dog</rdfs:comment>
          <kennelName>Deputy Dawg of Chilcompton</kennelName>
      </Dog>
    </rdf:RDF>

We process this document with a command something like:
`Java jena.schemagen -i deputy.rdf -a http://example.org/eg#`
to produce the following generated class:

    /* CVS $Id: schemagen.html,v 1.16 2010-06-11 00:08:23 ian_dickinson Exp $ */

    import org.apache.jena.rdf.model.*;

    /**
     * Vocabulary definitions from deputy.rdf
     * @author Auto-generated by schemagen on 01 May 2003 21:49
     */
    public class Deputy {
        /** <p>The RDF model that holds the vocabulary terms</p> */
        private static Model m_model = ModelFactory.createDefaultModel();
        
        /** <p>The namespace of the vocabulary as a string {@value}</p> */
        public static final String NS = "http://example.org/eg#";
        
        /** <p>The namespace of the vocabulary as a resource {@value}</p> */
        public static final Resource NAMESPACE = m_model.createResource( "http://example.org/eg#" );
        
        /** <p>The name that everyone calls a dog</p> */
        public static final Property petName = m_model.createProperty( "http://example.org/eg#petName" );
        
        /** <p>Posh dogs have a formal name on their KC certificate</p> */
        public static final Property kennelName = m_model.createProperty( "http://example.org/eg#kennelName" );
        
        /** <p>A class of canine companions</p> */
        public static final Resource Dog = m_model.createResource( "http://example.org/eg#Dog" );
        
        /** <p>Deputy is a particular Dog</p> */
        public static final Resource deputy = m_model.createResource( "http://example.org/eg#deputy" );
        
    }

Some things to note in this example. All of the named classes,
properties and individuals from the source document are translated
to Java constants (below we show how to be more selective than
this). The properties of the named resources are *not* translated:
schemagen is for giving access to the names in the vocabulary or
schema, not to perform a general translation of RDF to Java. The
RDFS comments from the source code are translated to Javadoc
comments. Finally, we no longer directly call `new ResourceImpl`:
this idiom is no longer recommended by the Jena team.

We noted earlier that schemagen is highly configurable. One
additional argument generates a vocabulary file that uses Jena's
ontology API, rather than the RDF model API. We change `rdfs:Class`
to `owl:Class`, and invoke
`Java jena.schemagen -i deputy.rdf -b http://example.org/eg# --ontology`
to get:

    /* CVs $Id: schemagen.html,v 1.16 2010-06-11 00:08:23 ian_dickinson Exp $ */

    import org.apache.jena.rdf.model.*;
    import org.apache.jena.ontology.*;
    /**
     * Vocabulary definitions from deputy.rdf
     * @author Auto-generated by schemagen on 01 May 2003 22:03
     */
    public class Deputy {
        /** <p>The ontology model that holds the vocabulary terms</p> */
        private static OntModel m_model = ModelFactory.createOntologyModel( ProfileRegistry.OWL_LANG );
        
        /** <p>The namespace of the vocabulary as a string {@value}</p> */
        public static final String NS = "http://example.org/eg#";
        
        /** <p>The namespace of the vocabulary as a resource {@value}</p> */
        public static final Resource NAMESPACE = m_model.createResource( "http://example.org/eg#" );
        
        /** <p>The name that everyone calls a dog</p> */
        public static final Property petName = m_model.createProperty( "http://example.org/eg#petName" );
        
        /** <p>Posh dogs have a formal name on their KC certificate</p> */
        public static final Property kennelName = m_model.createProperty( "http://example.org/eg#kennelName" );
        
        /** <p>A class of canine companions</p> */
        public static final OntClass Dog = m_model.createClass( "http://example.org/eg#Dog" );
        
        /** <p>Deputy is a particular Dog</p> */
        public static final Individual deputy = m_model.createIndividual( Dog, "http://example.org/eg#deputy" );
        
    }

## General principles

In essence, schemagen will load a single vocabulary file,
and generate a Java
class that contains static constants for the named classes,
properties and instances of the vocabulary. Most of the generated
components of the output Java file can be controlled by option
flags, and formatted with a template. Default templates are
provided for all elements, so the minimum amount of necessary
information is actually very small.

Options can be specified on the command line (when invoking
schemagen), or may be preset in an RDF file. Any mixture of command
line and RDF option specification is permitted. Where a given
option is specified both in an RDF file and on the command line,
the command line setting takes precedence. Thus the options in the
RDF file can be seen as defaults.

### Specifying command line options

To specify a command line option, add its name (and optional value)
to the command line when invoking the schemagen tool. E.g:
`Java jena.schemagen -i myvocab.owl --ontology --uppercase`

### Specifying options in an RDF file

To specify an option in an RDF file, create a resource of type
`sgen:Config`, with properties corresponding to the option names
listed in Table 1. The following fragment shows a small options
file. A complete example configuration file is shown in
[appendix A](#appendixa).

By default, schemagen will look for a configuration file named
`schemagen.rdf` in the current directory. To specify another
configuration, use the `-c` option with a URL to reference the
configuration. Multiple configurations (i.e. multiple `sgen:Config`
nodes) can be placed in one RDF document. In this case, each
configuration node must be named, and the URI specified in the `-r`
command line option. If there is no `-r` option, schemagen will
look for a node of type `rdf:type sgen:Config`. If there are
multiple such nodes in the model, it is indeterminate which one
will be used.

### Using templates

We have several times referred to a template being used to
construct part of the generated file. What is a template? Simply
put, it is a fragment of output file. Some templates will be used
at most once (for example the file header template), some will be
used many times (such as the template used to generate a class
constant). In order to make the templates adaptable to the job
they're doing, before it is written out a template has
*keyword substitution* performed on it. This looks for certain
keywords delimited by a pair of special characters (% by default),
and replaces them with the current binding for that keyword. Some
keyword bindings stay the same throughout the processing of the
file, and some are dependent on the language element being
processed. The substitutions are:

Table 2: Substitutable keywords in templates

Keyword  | Meaning | Typical value
------- | -------- | -------------
classname The name of the Java class being generated | Automatically defined from the document name, or given with the `-n` option
date | The date and time the class was generated
imports | The Java imports for this class
nl | The newline character for the current platform
package  | The Java package name | As specified by an option. The option just gives the package name, schemagen turns the name into a legal Java statement.
sourceURI | The source of the document being processed | As given by the `-i` option or in the config file.
valclass | The Java class of the value being defined | E.g. Property for vocabulary properties, Resource for classes in RDFS, or OntClass for classes using the ontology API
valcreator | The method used to generate an instance of the Java representation | E.g. `createResource` or `createClass`
valname | The name of the Java constant being generated | This is generated from the name of the resource in the source file, adjusted to be a legal Java identifier. By default, this will preserve the case of the RDF constant, but setting `--uppercase` will map all constants to upper-case names (a common convention in Java code).
valtype | The rdf:type for an individual | The class name or URI used when creating an individual in the ontology API
valuri | The full URI of the value being defined | From the RDF, without adjustment.

## Details of schemagen options

We now go through each of the configuration options in detail.

**Note**: for brevity, we assume a standard prefix `sgen` is
defined for resource URI's in the schemagen namespace. The
expansion for `sgen` is:
`http://jena.hpl.hp.com/2003/04/schemagen#`, thus:

    xmlns:sgen="http://jena.hpl.hp.com/2003/04/schemagen#"

### Note on legal Java identifiers

Schemagen will attempt to ensure that all generated code will
compile as legal Java. Occasionally, this means that identifiers
from input documents, which are legal components of RDF URI
identifiers, have to be modified to be legal Java identifiers.
Specifically, any character in an identifier name that is not a
legal Java identifier character will be replaced with the character
'\_' (underscore). Thus the name '`trading-price`' might become
`'trading_price`'. In addition, Java requires that identifiers be
distinct. If a name clash is detected (for example, `trading-price`
and `trading+price` both map to the same Java identifier),
schemagen will add disambiguators to the second and subsequent
uses. These will be based on the role of the identifier; for
example property names are disambiguated by appending `_PROPn` for
increasing values of `n`. In a well-written ontology, identifiers
are typically made distinct for clarity and ease-of-use by the
ontology users, so the use of the disambiguation tactic is rare.
Indeed, it may be taken as a hint that refactoring the ontology
itself is desirable.

### Specifying the configuration file

 |
--- | ---
**Command line** | `-c <*config-file-path*>`<br />`-c <*config-file-URL*>`
**Config file** | n/a

The default configuration file name is `schemagen.rdf` in the
current directory. To specify a different configuration file,
either as a file name on the local file system, or as a URL (e.g.
an `http:` address), the config file location is passed with the
`-c` option. If no `-c` option is given, and there is no
configuration file in the current directory, schemagen will
continue and use default values (plus the other command line
options) to configure the tool. If a file name or URL is given with
`-c`, and that file cannot be located, schemagen will stop with an
error.

Schemagen will assume the language encoding of the
configuration file is implied by the filename/URL suffix: ".n3"
means N3, ".nt" means NTRIPLES, ".rdf" and ".owl" mean "RDF/XML".
By default it assumes RDF/XML.

### Specifying the configuration root in the configuration file

 |
--- | ---
**Command line** | `-r <*config-root-URI*>`
**Config file** | n/a

It is possible to have more than one set of configuration options
in one configuration file. If there is only one set of
configuration options, schemagen will locate the root by searching
for a resource of rdf:type sgen:Config. If there is more than one,
and no root is specified on the command line, it is not specified
which set of configuration options will be used. The root URI given
as a command line option must match exactly with the URI given in
the configuration file. For example:

    Java jena.schemagen -c config/localconf.rdf -r http://example.org/sg#project1

matches:

    ...
     <sgen:Config rdf:about="http://example.org/SG#project1">
       ....
     </sgen:Config>

### Specifying the input document

 |
--- | ---
**Command line** | `-i <*input-file-path*>`<br />`-i <*input-URL*>`
**Config file** | `<sgen:input rdf:resource="*inputURL*" />`

The only mandatory argument to schemagen is the input document to
process. This can be specified in the configuration file, though
this does, of course, mean that the same configuration cannot be
applied to multiple different input files for consistency. However,
by specifying the input document in the default configuration file,
schemagen can easily be invoked with the minimum of command line
typing. For other means of automating schemagen, see
[using schemagen with Ant](#ant).

### Specifying the output location

 |
--- | ---
**Command line** | `-o <*input-file-path*>`<br />`-o <*output-dir*>`
**Config file** | `<sgen:output rdf:datatype="&xsd;string">*output-path-or-dir*</sgen:output>`

Schemagen must know where to write the generated Java file. By
default, the output is written to the standard output. Various
options exist to change this. The output location can be specified
either on the command line, or in the configuration file. If
specified in the configuration file, the resource must be a string
literal, denoting the file path. If the path given resolves to an
existing directory, then it is assumed that the output will be
based on the [name](#class-name) of the generated class (i.e. it
will be the class name with Java appended). Otherwise, the path is
assumed to point to a file. Any existing file that has the given
path name will be overwritten.

By default, schemagen will create files that have the Unix
convention for line-endings (i.e. '\\n'). To switch to DOS-style
line endings, use `--dos`.

 |
--- | ---
**Command line** | `--dos`
**Config file** | `<sgen:dos rdf:datatype="&xsd;boolean">true</sgen:dos>`


### Specifying the class name

 |
--- | ---
**Command line** | `-n <*class-name*>`
**Config file** | `<sgen:classname rdf:datatype="&xsd;string">*classname*</sgen:classname>`

By default, the name of the class will be based on the name of the
input file. Specifically, the last component of the input
document's path name, with the prefix removed, becomes the class
name. By default, the initial letter is adjusted to a capital to
conform to standard Java usage. Thus `file:vocabs/trading.owl`
becomes `Trading.java`. To override this default algorithm, a class
name specified by `-n` or in the config file is used exactly as
given.

Sometimes it is convenient to have all vocabulary files
distinguished by a common suffix, for example `xyzSchema.java` or
`xyzVocabs.java`. This can be achieved by the classname-suffix
option:

 |
--- | ---
**Command line** | `--classnamesuffix <*suffix*>`
**Config file** | `<sgen:classnamesuffix rdf:datatype="&xsd;string">*suffix*</sgen:classnamesuffix>`


See also the [note on legal Java identifiers](#java-ids), which
applies to generated class names.



### Specifying the vocabulary namespace

 |
--- | ---
**Command line** | `-a <*namespace-URI*>`
**Config file** | `<sgen:namespace rdf:datatype="&xsd;string">*namespace*</sgen:namespace>`

Since ontology files are often modularised, it is not the case that
all of the resource names appearing in a given document are being
defined by that ontology. They may appear simply as part of the
definitions of other terms. Schemagen assumes that there is one
primary namespace for each document, and it is names from that
namespace that will appear in the generated Java file.

In an OWL ontology, this namespace is computed by
finding the owl:Ontology element, and using its
namespace as the primary namespace of the ontology. This may not be
available (it is not, for example, a part of RDFS) or correct, so
the namespace may be specified directly with the `-a` option or in
the configuration file.

Schemagen does not, in the present version, permit more than one
primary namespace per generated Java class. However, constants from
namespaces other than the primary namespace may be included in the
generated Java class by the include option:

 |
--- | ---
**Command line** | `--include <*namespace-URI*>`
**Config file** | `<sgen:include rdf:datatype="&xsd;string">*namespace*</sgen:include>`


The include option may repeated multiple times to include a variety
of constants from other namespaces in the output class.

Since OWL and RDFS ontologies may include individuals that are
named instances of declared classes, schemagen will include
individuals among the constants that it generates in Java. By
default, an individual will be included if its class has a URI that
is in one of the permitted namespaces for the vocabulary, even if
the individual itself is not in that namespace. If the option
`strictIndividuals` is set, individuals are **only** included if
they have a URI that is in the permitted namespaces for the
vocabulary.

 |
--- | ---
**Command line** | `--strictIndividuals`
**Config file** | `<sgen:strictIndividuals />`


### Specifying the syntax (encoding) of the input document

 |
--- | ---
**Command line** | `-e <*encoding*>`
**Config file** | `<sgen:encoding rdf:datatype="&xsd;string">*encoding*</sgen:encoding>`

Jena can parse a number of different presentation syntaxes for RDF
documents, including RDF/XML, N3 and NTRIPLE. By default, the
encoding will be derived from the name of the input document (e.g.
a document `xyz.n3` will be parsed in N3 format), or, if the
extension is non-obvious the default is RDF/XML. The encoding, and
hence the parser, to use on the input document may be specified by
the encoding configuration option.

### Choosing the style of the generated class: ontology or plain RDF

 |
--- | ---
**Command line** | `--ontology`
**Config file** | `<sgen:ontology rdf:datatype="&xsd;boolean">*true or false*</sgen:ontology>`

By default, the Java class generated by schemagen will generate
constants that are plain RDF Resource, Property or Literal
constants. When working with OWL or RDFS ontologies, it may
be more convenient to have constants that are OntClass,
ObjectProperty, DatatypeProperty and Individual Java objects. To
generate these ontology constants, rather than plain RDF constants,
set the ontology configuration option.

Furthermore, since Jena can handle input ontologies in
OWL (the default), and RDFS, it is necessary to be able to specify
which language is being processed. This will affect both the
parsing of the input documents, and the language profile selected
for the constants in the generated Java class.

 |
--- | ---
**Command line** | `--owl`
**Config file** | `<sgen:owl rdf:datatype="&xsd;boolean">true</sgen:owl>`

 |
--- | ---
**Command line** | `--rdfs`
**Config file** | `<sgen:rdfs rdf:datatype="&xsd;boolean">true</sgen:owl>`

Prior to Jena 2.2, schemagen used a Jena model to load the input
document that also applied some *rules of inference* to the input
data. So, for example, a resource that is mentioned as the
`owl:range` of a property can be inferred to be
`rdf:type owl:Class`, and hence listed in the class constants in
the generated Java class, even if that fact is not directly
asserted in the input model. From Jena 2.2 onwards, this option is
now **off by default**. If correct handling of an input document by
schemagen requires the use of inference rules, this must be
specified by the `inference` option. 

 |
--- | ---
**Command line** | `--inference`
**Config file** | `<sgen:inference rdf:datatype="&xsd;boolean">true</sgen:owl>`

### Specifying the Java package

 |
--- | ---
**Command line** | `--package <*package-name*>`
**Config file** | `<sgen:package rdf:datatype="&xsd;string">*package-name*</sgen:package>`

By default, the Java class generated by schemagen will not be in a
Java package. Set the package configuration option to specify the
Java package name. **Change from Jena 2.6.4-SNAPSHOT onwards:**
Setting the package name will affect the directory into which the
generated class will be written: directories will be appended to
the [output directory](#output) to match the Java package.

### Additional decorations on the main class declaration

 |
--- | ---
**Command line** | `--classdec <*class-declaration*>`
**Config file** | `<sgen:classdec rdf:datatype="&xsd;string">*class-declaration*</sgen:classdec>`

In some applications, it may be convenient to add additional
information to the declaration of the Java class, for example that
the class implements a given interface (such as
`java.lang.Serializable`). Any string given as the value of the
class-declaration option will be written immediately after
"`public class <i>ClassName</i>`".

### Adding general declarations within the generated class

 |
--- | ---
**Command line** | `--declarations <*declarations*>`
**Config file** | `<sgen:declarations rdf:datatype="&xsd;string">*declarations*</sgen:declarations>`

Some more complex vocabularies may require access to static
constants, or other Java objects or factories to fully declare the
constants defined by the given templates. Any text given by the
declarations option will be included in the generated class after
the class declaration but before the body of the declared
constants. The value of the option should be fully legal Java code
(though the [template](#templates) substitutions will be performed
on the code). Although this option can be declared as a command
line option, it is typically easier to specify as a value in a
configuration options file.

### Omitting sections of the generated vocabulary

 |
--- | ---
**Command line** | `--noclasses`<br />`--nodatatypes`<br />`--noproperties`<br />`--noindividuals`
**Config file** | `<sgen:noclassses rdf:datatype="&xsd;boolean">true</sgen:noclassses>`<br />`<sgen:nodatatypes rdf:datatype="&xsd;boolean">true</sgen:nodatatypes>`<br />`<sgen:noproperties rdf:datatype="&xsd;boolean">true</sgen:noproperties>`<br />`<sgen:noindividuals rdf:datatype="&xsd;boolean">true</sgen:noindividuals>`

By default, the vocabulary class generated from a given ontology
will include constants for each of the included classes, datatypes, properties
and individuals in the ontology. To omit any of these groups, use
the corresponding *noXYZ* configuration option. For example,
specifying `--noproperties` means that the generated class will not
contain any constants corresponding to predicate names from the
ontology, irrespective of what is in the input document.

### Section header comments

 |
--- | ---
**Command line** | `--classSection *<section heading>*`<br />`--datatypeSection *<section heading>*`<br />`--propSection *<section heading>*`<br />`--individualSection *<section heading*>`<br />`--header *<file header section>*`<br />`--footer *<file footer section>*`
**Config file** | `<sgen:classSection rdf:datatype="&xsd;string">*section heading*</sgen:classSection>`<br />`<sgen:datatypeSection rdf:datatype="&xsd;string">*section heading*</sgen:datatypeSection>`<br />`<sgen:propSection rdf:datatype="&xsd;string">*section heading*</sgen:propSection>`<br />`<sgen:individualSection rdf:datatype="&xsd;string">*section heading*</sgen:individualSection>`<br />`<sgen:header rdf:datatype="&xsd;string">*file header*</sgen:header>`<br />`<sgen:footer rdf:datatype="&xsd;string">*file footer*</sgen:footer>`

Some coding styles use block comments to delineate different
sections of a class. These options allow the introduction of
arbitrary Java code, though typically this will be a comment block,
at the head of the sections of class constant declarations,
datatype constant declarations, property constant declarations,
and individual constant declarations.

### Include vocabulary source code

 |
--- | ---
**Command line** | `--includeSource`
**Config file** | `\<sgen:includeSource rdf:datatype="&xsd;boolean">true\</sgen:includeSource>`

Schemagen's primary role is to provide Java constants corresponding to the names in
a vocabulary. Sometimes, however, we may need more information from the vocabulary
source file to available. For example, to know the domain and range of the properties
in the vocabulary. If you set the configuration parameter `--includeSource`, schemagen
will:

- convert the input vocabulary into string form and include that string form in the
  generated Java class
- create a Jena model when the Java vocabulary class is first loaded, and load the string-ified
  vocabulary into that model
- attach the generated constants to that model, so that, for example, you can look up the
  declared domain and range of a property or the declared super-classes of a class.

Note that Java compilers typically impose some limit on the size of a Java source file (or, more
specifically, on the size of `.class` file they will generate. Loading a particularly large
vocabulary with `--includeSource` may risk breaching that limit.

## Using schemagen with Maven

[Apache Maven](http://maven.apache.org/) is a build automation tool typically used for Java.  You can use `exec-maven-plugin` and `build-helper-maven-plugin` to run `schemagen` as part of the `generate-sources` goal of your project.  The following example shows one way of performing this task.  The developer should customize command-line options or use a configuration file instead as needed.

      <build>
        <plugins>
          <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <executions>
              <execution>
                <phase>generate-sources</phase>
                <goals>
                  <goal>java</goal>
                </goals>
                <configuration>
                  <mainClass>jena.schemagen</mainClass>
                  <commandlineArgs>
                    --inference \
                    -i ${basedir}/src/main/resources/example.ttl \
                    -e TTL \
                    --package org.example.ont \
                    -o ${project.build.directory}/generated-sources/java \
                    -n ExampleOnt
                  </commandlineArgs>
                </configuration>
              </execution>
            </executions>
          </plugin>
          <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>build-helper-maven-plugin</artifactId>
            <executions>
              <execution>
                <id>add-source</id>
                <goals>
                  <goal>add-source</goal>
                </goals>
                <configuration>
                  <sources>
                    <source>${project.build.directory}/generated-sources/java</source>
                  </sources>
                </configuration>
              </execution>
            </executions>
          </plugin>
        </plugins>
      </build>

At this point you can run `mvn generate-sources` in your project to cause `schemagen` to run and create your Java source (note that this goal is run automatically from `mvn compile` or `mvn install`, so there really isn't any reason to run it manually unless you wish to just generate the source).  The source file is placed in the maven standard `target/generated-sources/java` directory, which is added to the project classpath by `build-helper-maven-plugin`.


## Using schemagen with Ant

[Apache Ant](http://ant.apache.org/) is a tool for automating build
steps in Java (and other language) projects. For example, it is the
tool used to compile the Jena sources to the jena.jar file, and to
prepare the Jena distribution prior to download. Although it would
be quite possible to create an Ant *taskdef* to automate the
production of Java classes from input vocabularies, we have not yet
done this. Nevertheless, it is straightforward to use schemagen
from an ant build script, by making use of Ant's built-in Java
task, which can execute an arbitrary Java program.

The following example shows a complete ant target definition for
generating ExampleVocab.java from example.owl. It ensures that the
generation step is only performed when example.owl has been updated
more recently than ExampleVocab.java (e.g. if the definitions in
the owl file have recently been changed).

      <!-- properties -->
      <property name="vocab.dir"       value="src/org/example/vocabulary" />
      <property name="vocab.template"  value="${rdf.dir}/exvocab.rdf" />
      <property name="vocab.tool"      value="jena.schemagen" />

      <!-- Section: vocabulary generation -->
      <target name="vocabularies" depends="exVocab" />

      <target name="exVocab.check">
        <uptodate
           property="exVocab.nobuild"
           srcFile="${rdf.dir}/example.owl"
           targetFile="${vocab.dir}/ExampleVocab.java" />
      </target>

      <target name="exVocab" depends="exVocab.check" unless="exVocab.nobuild">
        <Java classname="${vocab.tool}" classpathref="classpath" fork="yes">
          <arg value="-i" />
          <arg value="file:${rdf.dir}/example.owl" />
          <arg value="-c" />
          <arg value="${vocab.template}" />
          <arg value="--classnamesuffix" />
          <arg value="Vocab" />
          <arg value="--include" />
          <arg value="http://example.org/2004/01/services#" />
          <arg value="--ontology" />
        </Java>
      </target>

Clearly it is up to each developer to find the appropriate balance
between options that are specified via the command line options,
and those that are specified in the configuration options file
(`exvocab.rdf` in the above example). This is not the only, nor
necessarily the "right" way to use schemagen from Ant, but if it
points readers in the appropriate direction to produce a custom
target for their own application it will have served its purpose.

## Appendix A: Complete example configuration file

The source of this example is provided in the Jena download as
`etc/schemagen.rdf`. For clarity, RDF/XML text is highlighted in
blue.

    <?xml version='1.0'?>

    <!DOCTYPE rdf:RDF [
        <!ENTITY jena    'http://jena.hpl.hp.com/'>

        <!ENTITY rdf     'http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
        <!ENTITY rdfs    'http://www.w3.org/2000/01/rdf-schema#'>
        <!ENTITY owl     'http://www.w3.org/2002/07/owl#'>
        <!ENTITY xsd     'http://www.w3.org/2001/XMLSchema#'>
        <!ENTITY base    '&jena;2003/04/schemagen'>
        <!ENTITY sgen    '&base;#'>
    ]>

    <rdf:RDF
      xmlns:rdf   ="&rdf;"
      xmlns:rdfs  ="&rdfs;"
      xmlns:owl   ="&owl;"
      xmlns:sgen  ="&sgen;"
      xmlns       ="&sgen;"
      xml:base    ="&base;"
    >

    <!--
        Example schemagen configuration for use with jena.schemagen
        Not all possible options are used in this example, see Javadoc and Howto for full details.

        Author: Ian Dickinson, mailto:ian.dickinson@hp.com
        CVs:    $Id: schemagen.html,v 1.16 2010-06-11 00:08:23 ian_dickinson Exp $
    -->

    <sgen:Config>
        <!-- specifies that the  source document uses OWL -->
        <sgen:owl rdf:datatype="&xsd;boolean">true</sgen:owl>

        <!-- specifies that we want the generated vocab to use OntClass, OntProperty, etc, not Resource and Property -->
        <sgen:ontology rdf:datatype="&xsd;boolean">true</sgen:ontology>

        <!-- specifies that we want names mapped to uppercase (as standard Java constants) -->
        <sgen:uppercase rdf:datatype="&xsd;boolean">true</sgen:uppercase>

        <!-- append Vocab to class name, so input beer.owl becomes BeerVocab.java -->
        <sgen:classnamesuffix rdf:datatype="&xsd;string">Vocab</sgen:classnamesuffix>

        <!-- the Java package that the vocabulary is in -->
        <sgen:package rdf:datatype="&xsd;string">com.example.vocabulary</sgen:package>

        <!-- the directory or file to write the results out to -->
        <sgen:output rdf:datatype="&xsd;string">src/com/example/vocabulary</sgen:output>

        <!-- the template for the file header -->
    <sgen:header rdf:datatype="&xsd;string">/*****************************************************************************
     * Source code information
     * -----------------------
     * Original author    Jane Smart, example.com
     * Author email       jane.smart@example.com
     * Package            @package@
     * Web site           @website@
     * Created            %date%
     * Filename           $RCSfile: schemagen.html,v $
     * Revision           $Revision: 1.16 $
     * Release status     @releaseStatus@ $State: Exp $
     *
     * Last modified on   $Date: 2010-06-11 00:08:23 $
     *               by   $Author: ian_dickinson $
     *
     * @copyright@
     *****************************************************************************/


    // Package
    ///////////////////////////////////////
    %package%


    // Imports
    ///////////////////////////////////////
    %imports%



    /**
     * Vocabulary definitions from %sourceURI%
     * @author Auto-generated by schemagen on %date%
     */</sgen:header>

    <!-- the template for the file footer (note @footer@ is an Ant-ism, and will not be processed by SchemaGen) -->
    <sgen:footer rdf:datatype="&xsd;string">
    /*
    @footer@
    */
    </sgen:footer>

    <!-- template for extra declarations at the top of the class file -->
    <sgen:declarations rdf:datatype="&xsd;string">
        /** Factory for generating symbols */
        private static KsValueFactory s_vf = new DefaultValueFactory();
    </sgen:declarations>

    <!-- template for introducing the properties in the vocabulary -->
    <sgen:propSection rdf:datatype="&xsd;string">
        // Vocabulary properties
        ///////////////////////////
    </sgen:propSection>

    <!-- template for introducing the classes in the vocabulary -->
    <sgen:classSection rdf:datatype="&xsd;string">
        // Vocabulary classes
        ///////////////////////////
    </sgen:classSection>

    <!-- template for introducing the datatypes in the vocabulary -->
    <sgen:datatypeSection rdf:datatype="&xsd;string">
        // Vocabulary datatypes
        ///////////////////////////
    </sgen:datatypeSection>

    <!-- template for introducing the individuals in the vocabulary -->
    <sgen:individualsSection rdf:datatype="&xsd;string">
        // Vocabulary individuals
        ///////////////////////////
    </sgen:individualsSection>

    <!-- template for doing fancy declarations of individuals -->
    <sgen:individualTemplate rdf:datatype="&xsd;string">public static final KsSymbol %valname% = s_vf.newSymbol( "%valuri%" );

        /** Ontology individual corresponding to {@link #%valname%} */
        public static final %valclass% _%valname% = m_model.%valcreator%( %valtype%, "%valuri%" );
    </sgen:individualTemplate>

    </sgen:Config>

    </rdf:RDF>



