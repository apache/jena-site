---
title: Jena RDF/XML How-To
---

This is a guide to the RDF/XML I/O subsystem of Jena, ARP.
The first section gives a quick introduction to the
I/O subsystem. The other sections are aimed at users wishing to use
advanced features within the RDF/XML I/O subsystem.

## Contents

-   [Quick Introduction](#quick-introduction)
-   [RDF/XML, RDF/XML-ABBREV](#rdfxml-rdfxml-abbrev)
-   [Character Encoding Issues](#character-encoding-issues)
    -   [Encodings Supported in Jena 2.2 and later](#encodings-supported-in-jena-22-and-later)
-   [When to Use Reader and Writer?](#when-to-use-reader-and-writer)
-   [Introduction to Advanced Jena I/O](#introduction-to-advanced-jena-io)
-   [Advanced RDF/XML Input](#advanced-rdfxml-input)
    -   [ARP properties](#arp-properties)
    -   [Interrupting ARP](#interrupting-arp)
-   [Advanced RDF/XML Output](#advanced-rdfxml-output)
-   [Conformance](#conformance)
-   [Faster RDF/XML I/O](#faster-rdfxml-io)
-   [Details of ARP, the Jena RDF/XML parser](arp.html)

## Quick Introduction

The main I/O methods in Jena use `InputStream`s and `OutputStream`s.
This is import to correctly handle character sets.

These methods are found on the
[`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) interface.
These are:

- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#read(java.io.InputStream, java.lang.String))`(java.io.InputStream in, java.lang.String base)`
  <br />Add statements from an RDF/XML serialization
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#read(java.io.InputStream, java.lang.String, java.lang.String))`(java.io.InputStream in, java.lang.String base, java.lang.String lang)`
  <br /> Add RDF statements represented in language `lang` to the model.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#read(java.lang.String))`(java.lang.String url)`
  <br />Add the RDF statements from an XML document.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.OutputStream))`(java.io.OutputStream out)`
  <br /> Write the model as an XML document.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.OutputStream, java.lang.String))`(java.io.OutputStream out, java.lang.String lang)`
  <br />Write a serialized representation of a model in a specified language.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.OutputStream, java.lang.String, java.lang.String))`(java.io.OutputStream out, java.lang.String lang, java.lang.String base)`
  <br />Write a serialized representation of a model in a specified language.

The built-in languages are `"RDF/XML"`, `"RDF/XML-ABBREV"` as well as 
`"N-TRIPLE"`, and `"TURTLE"`.

There are also methods which use `Reader`s and `Writer`s. Do not use
them, unless you are sure it is correct to. In advanced
applications, they are useful, see [below](#reader-writer); and
there is every intention to continue to support them. The RDF/XML
parser now checks to see if the `Model.read(Reader …)` calls
are being abused, and issues
[`ERR_ENCODING_MISMATCH`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#ERR_ENCODING_MISMATCH)
and
[`WARN_ENCODING_MISMATCH`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#WARN_ENCODING_MISMATCH)
errors. Most incorrect usage of `Reader`s for RDF/XML input will
result in such errors. Most incorrect usage of `Writer`s for RDF/XML
output will produce correct XML by using an appropriate XML
declaration giving the encoding - e.g.

    <?xml version='1.0' encoding='ISO-8859-15'?>

However, such XML is less portable than XML in UTF-8. Using the
`Model.write(OutputStream …)` methods allows the Jena system
code to choose UTF-8 encoding, which is the best choice.

## RDF/XML, RDF/XML-ABBREV

For input, both of these are the same, and fully implement the
[RDF Syntax Recommendation](http://www.w3.org/TR/rdf-syntax-grammar/),
see [conformance](#conformance).

For output, `"RDF/XML"`, produces regular output reasonably
efficiently, but it is not readable. In contrast,
`"RDF/XML-ABBREV"`, produces readable output without much regard to
efficiency.

All the readers and writers for RDF/XML are configurable, see
below, [input](#input) and [output](#output).

## Character Encoding Issues

The easiest way to not read or understand this section is always to
use `InputStream`s and `OutputStream`s with Jena, and to never use
`Reader`s and `Writer`s. If you do this, Jena will do the right thing,
for the vast majority of users. If you have legacy code that uses
`Reader`s and `Writer`s, or you have special needs with respect to
encodings, then this section may be helpful. The last part of this
section summarizes the character encodings supported by Jena.

Character encoding is the way that characters are mapped to bytes,
shorts or ints. There are many different character encodings.
Within Jena, character encodings are important in their
relationship to Web content, particularly RDF/XML files, which
cannot be understood without knowing the character encoding, and in
relationship to Java, which provides support for many character
encodings.

The Java approach to encodings is designed for ease of use on a
single machine, which uses a single encoding; often being a
one-byte encoding, e.g. for European languages which do not need
thousands of different characters.

The XML approach is designed for the Web which uses multiple
encodings, and some of them requiring thousands of characters.

On the Web, XML files, including RDF/XML files, are by default
encoded in "UTF-8" (Unicode). This is always a good choice for
creating content, and is the one used by Jena by default. Other
encodings can be used, but may be less interoperable. Other
encodings should be named using the canonical name registered at
[IANA](http://www.iana.org/assignments/character-sets), but other
systems have no obligations to support any of these, other than
UTF-8 and UTF-16.

Within Java, encodings appear primarily with the `InputStreamReader`
and `OutputStreamWriter` classes, which convert between bytes and
characters using a named encoding, and with their subclasses,
`FileReader` and `FileWriter`, which convert between bytes in the file
and characters using the default encoding of the platform. It is
not possible to change the encoding used by a `Reader` or `Writer`
while it is being used. The default encoding of the platform
depends on a large range of factors. This default encoding may be
useful for communicating with other programs on the same platform.
Sometimes the default encoding is not registered at IANA, and so
Jena application developers should not use the default encoding for
Web content, but use UTF-8.

### Encodings Supported in Jena 2.2 and later

On RDF/XML input any encoding supported by Java can be used. If
this is not a canonical name registered at IANA a warning message
is produced. Some encodings have better support in Java 1.5 than
Java 1.4; for such encodings a warning message is produced on Java
1.4, suggesting upgrading.

On RDF/XML output any encoding supported by Java can be used, by
constructing an `OutputStreamWriter` using that encoding, and using
that for output. If the encoding is not registered at IANA then a
warning message is produced. Some encodings have better support in
Java 1.5 than Java 1.4; for such encodings a warning message is
produced on Java 1.4, suggesting upgrading.

Java can be configured either with or without a jar of extra
encodings on the classpath. This jar is `charsets.jar` and sits in
the `lib` directory of the Java Runtime. If this jar is not on your
classpath then the range of encodings supported is fairly small.

The encodings supported by Java are listed by Sun, for
[1.4.2](http://docs.oracle.com/javase/1.4.2/docs/guide/intl/encoding.doc.html),
and
[1.5.0](http://docs.oracle.com/javase/1.5.0/docs/guide/intl/encoding.doc.html).
For an encoding that is not in these lists it is possible to write
your own transcoder as documented in the `java.nio.charset` package
documentation.

Earlier versions of Jena supported fewer encodings.

## When to Use Reader and Writer?

Infrequently.

Despite the character encoding issues, it is still sometimes
appropriate to use `Reader`s and `Writer`s with Jena I/O. A good
example is using `Reader`s and `Writer`s into `StringBuffer`s in memory.
These do not need to be encoded and decoded so a character encoding
does not need to be specified. Other examples are when an advanced
user explicitly wishes to correctly control the encoding.

- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#read(java.io.Reader, java.lang.String))`(java.io.Reader reader, java.lang.String base)`
<br />Using this method is often a mistake.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#read(java.io.Reader, java.lang.String, java.lang.String))`(java.io.Reader reader, java.lang.String base, java.lang.String lang)`
<br />Using this method is often a mistake.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.Writer))`(java.io.Writer writer)`
<br />Caution! Write the model as an XML document.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.Writer, java.lang.String))`(java.io.Writer writer, java.lang.String lang)`
<br /> Caution! Write a serialized representation of a model in a specified language.
- [`Model`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html) [`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#write(java.io.Writer, java.lang.String, java.lang.String))`(java.io.Writer writer, java.lang.String lang, java.lang.String base)`
<br /> Caution! Write a serialized representation of a model in a specified language.

Incorrect use of these `read(Reader, …)` methods results in
warnings and errors with RDF/XML and RDF/XML-ABBREV (except in a
few cases where the incorrect use cannot be automatically
detected). Incorrect use of the `write(Writer, …)` methods
results in peculiar XML declarations such as
`<?xml version="1.0" encoding="WINDOWS-1252"?>`. This would reflect
that the character encoding you used (probably without realizing)
in your Writer is registered with IANA under the name
"WINDOWS-1252". The resulting XML is of reduced portability as a
result. Glenn Marcy
[notes](http://nagoya.apache.org/bugzilla/show_bug.cgi?id=4456):

> since UTF-8 and UTF-16 are the only encodings REQUIRED to be
> understood by all conformant XML processors, even ISO-8859-1 would
> technically be on shaky ground if not for the fact that it is in
> such widespread use that every reasonable XML processor supports
> it.With N-TRIPLE incorrect use is usually benign, since N-TRIPLE is
> ascii based.

Character encoding issues of N3 are not well-defined; hence use of
these methods may require changes in the future. Use of the
InputStream and OutputStream methods will allow your code to work
with future versions of Jena which do the right thing - whatever
that is. Currently the OutputStream methods use UTF-8 encoding.

## Introduction to Advanced Jena I/O

The RDF/XML input and output is configurable.
However, to configure it, it is necessary to access an `RDFReader` or
`RDFWriter` object that remains hidden in the simpler interface
above.

The four vital calls in the `Model` interface are:

- [`RDFReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html)
[`getReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReaderF.html#getReader())`()`
<br />Return an RDFReader instance for the default serialization language.
- [`RDFReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html)
[`getReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReaderF.html#getReader(java.lang.String))`(java.lang.String lang)`
<br />Return an RDFReader instance for the specified serialization language.
- [`RDFReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html)
[`getWriter`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFWriterF.html#getWriter())`()`
<br />Return an RDFWriter instance for the default serialization language.
- [`RDFReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html)
[`getWriter`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFWriterF.html#getWriter(java.lang.String))`(java.lang.String lang)`
<br />An RDFWriter instance for the specified serialization language.

Each of these calls returns an `RDFReader` or `RDFWriter` that can be
used to read or write any `Model` (not just the one which created
it). As well as the necessary
[`read`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html#read(org.apache.jena.rdf.model.Model, java.io.InputStream, java.lang.String))
and
[`write`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFWriter.html#write(org.apache.jena.rdf.model.Model, java.io.OutputStream, java.lang.String))
methods, these interfaces provide:

- [`RDFErrorHandler`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFErrorHandler.html)
[`setErrorHandler`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html#setErrorHandler(org.apache.jena.rdf.model.RDFErrorHandler))`(` [RDFErrorHandler](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFErrorHandler.html) `errHandler )`
<br />Set an error handler for the reader
- `java.lang.Object`
[`setProperty`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReader.html#setProperty(java.lang.String, java.lang.Object))`(java.lang.String propName, java.lang.Object propValue)`
<br />Set the value of a reader property.

Setting properties, or the error handler, on an `RDFReader` or an
`RDFWriter` allows the programmer to access non-default behaviour.
Moreover, since the `RDFReader` and `RDFWriter` is not bound to a
specific `Model`, a typical idiom is to create the `RDFReader` or
`RDFWriter` on system initialization, to set the appropriate
properties so that it behaves exactly as required in your application,
and then to do all subsequent I/O through it.

    Model m = ModelFactory.createDefaultModel();
    RDFWriter writer = m.getRDFWriter();
    m = null; // m is no longer needed.
    writer.setErrorHandler(myErrorHandler);
    writer.setProperty("showXmlDeclaration","true");
    writer.setProperty("tab","8");
    writer.setProperty("relativeURIs","same-document,relative");
    …
    Model marray[];
    …
    for (int i=0; i<marray.length; i++) {
    …
        OutputStream out = new FileOutputStream("foo" + i + ".rdf");
        writer.write(marray[i],
                           out,
          "http://example.org/");
        out.close();
    }

Note that all of the current implementations are synchronized, so
that a specific `RDFReader` cannot be reading two different documents
at the same time. In a multi-threaded application this may suggest a
need for a pool of `RDFReader`s and/or `RDFWriter`s, or alternatively
to create, initialize, use and discard them as needed.

For N-TRIPLE there are currently no properties supported for
either the `RDFReader` or the `RDFWriter`. Hence this idiom above is
not very helpful, and just using the `Model.write()` methods may
prove easier.

For RDF/XML and RDF/XML-ABBREV, there are many options in both the
`RDFReader` and the `RDFWriter`. N3 has options on the `RDFWriter`. These
options are detailed below. For RDF/XML they are also found in the
JavaDoc for
`JenaReader.`[`setProperty`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
and
`RDFXMLWriterI.`[`setProperty`](/documentation/javadoc/jena/org/apache/jena/xmloutput/RDFXMLWriterI.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`.

## Advanced RDF/XML Input

For access to these advanced features, first get an `RDFReader`
object that is an instance of an ARP parser, by using the
[`getReader`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFReaderF.html#getReader())`()`
method on any `Model`. It is then configured using the
[`setProperty`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
method. This changes the properties for parsing RDF/XML. Many of
the properties change the RDF parser, some change the XML parser.
(The Jena RDF/XML parser, ARP, implements the
[RDF grammar](http://www.w3.org/TR/rdf-syntax-grammar/#section-Infoset-Grammar)
over a [Xerces2-J](http://xml.apache.org/xerces2-j/index.html) XML
parser). However, changing the features and properties of the XML
parser is not likely to be useful, but was easy to implement.

[`setProperty`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
can be used to set and get:

- ARP properties
   <br /> These allow fine grain control over the extensive error
   reporting capabilities of ARP. And are detailed directly below.
- SAX2 features
  <br />See
  [Xerces features](http://xml.apache.org/xerces2-j/features.html).
  Value should be given as a String `"true"` or `"false"` or a `Boolean`.
- SAX2 properties
  <br /> See [Xerces properties](http://xml.apache.org/xerces2-j/properties.html).
- Xerces features
  <br /> See [Xerces features](http://xml.apache.org/xerces2-j/features.html).
    Value should be given as a String `"true"` or `"false"` or a `Boolean`.
- Xerces properties
  <br /> See [Xerces properties](http://xml.apache.org/xerces2-j/properties.html).

### ARP properties

An ARP property is referred to either by its property name, (see
below) or by an absolute URL of the form
`http://jena.hpl.hp.com/arp/properties/<PropertyName>`. The value
should be a String, an Integer or a Boolean depending on the
property.

ARP property names and string values are case insensitive.

Property Name | Description | Value class | Legal Values
------------- | ----------- | ----------- | ------------
`iri-rules` | Set the engine for checking and resolving. `"strict"` sets the IRI engine with rules for valid IRIs, XLink and RDF; it does not permit spaces in IRIs. `"iri"`sets the IRI engine to IRI ([RFC 3986](http://www.ietf.org/rfc/rfc3986.txt), [RFC 3987](http://www.ietf.org/rfc/rfc3987.txt)) `.` The default is `"lax"`(for backwards compatibility)`,` the rules for RDF URI references only, which does permit spaces although the use of spaces is not good practice. | String | `lax`<br />`strict`<br />`iri`
`error-mode`| [`ARPOptions.setDefaultErrorMode()`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setDefaultErrorMode()) <br />[`ARPOptions.setLaxErrorMode()`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setLaxErrorMode())<br />[`ARPOptions.setStrictErrorMode()`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setStrictErrorMode())<br />[`ARPOptions.setStrictErrorMode(int)`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setStrictErrorMode(int))<br />  This allows a coarse-grained approach to control of error handling. Setting this property is equivalent to setting many of the fine-grained error handling properties. | `String` | `default`<br />`lax`<br />`strict`<br />`strict-ignore`<br />`strict-warning`<br />`strict-error`<br />`strict-fatal`
`embedding` | [`ARPOptions.setEmbedding(boolean)`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setEmbedding(boolean)) <br />This sets ARP to look for RDF embedded within an enclosing XML document. | `String` or `Boolean` | `true`<br />`false`
`ERR_<XXX>` <br />`WARN_<XXX>`<br />`IGN_<XXX>` | See [`ARPErrorNumbers`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html) for a complete list of the error conditions detected. Setting one of these properties is equivalent to the method [`ARPOptions.setErrorMode(int, int)`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPOptions.html#setErrorMode(int,%20int)). Thus fine-grained control over the behaviour in response to specific error conditions is possible.| `String` or `Integer` | [`EM_IGNORE`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#EM_IGNORE)<br />[`EM_WARNING`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#EM_WARNING)<br />[`EM_ERROR`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#EM_ERROR)<br />[`EM_FATAL`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#EM_FATAL)

As an example, if you are working in an environment with legacy RDF
data that uses unqualified RDF attributes such as "about" instead
of "rdf:about", then the following code is appropriate:

    Model m = ModelFactory.createDefaultModel();
    RDFReader arp = m.getReader();
    m = null; // m is no longer needed.
    // initialize arp
    // Do not warn on use of unqualified RDF attributes.
    arp.setProperty("WARN_UNQUALIFIED_RDF_ATTRIBUTE","EM_IGNORE");

    …

    InputStream in = new FileInputStream(fname);
    arp.read(m,in,url);
    in.close();

As a second example, suppose you wish to work in strict mode, but
allow `"daml:collection"`, the following works:

     …
     arp.setProperty("error-mode", "strict" );
     arp.setProperty("IGN_DAML_COLLECTION","EM_IGNORE");
     …

The other way round does not work.

     …
     arp.setProperty("IGN_DAML_COLLECTION","EM_IGNORE");
     arp.setProperty("error-mode", "strict" );
     …

This is because in strict mode
[`IGN_DAML_COLLECTION`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#IGN_DAML_COLLECTION)
is treated as an error, and so the second call to `setProperty`
overwrites the effect of the first.

The IRI rules and resolver can be set on a per-reader basis:

    InputStream in = ... ;
    String baseURI = ... ;
    Model model = ModelFactory.createDefaultModel();
    RDFReader r = model.getReader("RDF/XML");
    r.setProperty("iri-rules", "strict") ;
    r.setProperty("error-mode", "strict") ; // Warning will be errors.

    // Alternative to the above "error-mode": set specific warning to be an error.
    //r.setProperty( "WARN_MALFORMED_URI", ARPErrorNumbers.EM_ERROR) ;
    r.read(model, in, baseURI) ;
    in.close();

The global default IRI engine can be set with:

    ARPOptions.setIRIFactoryGlobal(IRIFactory.iriImplementation()) ;

or other IRI rule engine from `IRIFactory`.

### Interrupting ARP

ARP can be interrupted using the `Thread.interrupt()` method. This
causes an
[`ERR_INTERRUPTED`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/ARPErrorNumbers.html#ERR_INTERRUPTED)
error during the parse, which is usually treated as a fatal error.

Here is an illustrative code sample:

    ARP a = new ARP();
    final Thread arpt = Thread.currentThread();
    Thread killt = new Thread(new Runnable() {
         public void run() {
           try {
              Thread.sleep(tim);
           } catch (InterruptedException e) {
           }
           arpt.interrupt();
         }
      });
    killt.start();
    try {
      in = new FileInputStream(fileName);
      a.load(in);
      in.close();
      fail("Thread was not interrupted.");
    } catch (SAXParseException e) {
    }

## Advanced RDF/XML Output

The first RDF/XML output question is whether to use the `"RDF/XML"`
or `"RDF/XML-ABBREV"` writer. While some of the code is shared, these
two writers are really very different, resulting in different but
equivalent output. `RDF/XML-ABBREV` is slower, but should produce
more readable XML.

For access to advanced features, first get an RDFWriter object, of
the appropriate language, by using
[`getWriter`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFWriterF.html#getWriter(java.lang.String))`("RDF/XML")`
or
[`getWriter`](/documentation/javadoc/jena/org/apache/jena/rdf/model/RDFWriterF.html#getWriter(java.lang.String))`("RDF/XML-ABBREV")`
on any `Model`. It is then configured using the
[`setProperty`](/documentation/javadoc/jena/org/apache/jena/rdfxml/xmlinput/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
method. This changes the properties for writing RDF/XML.

### Properties to Control RDF/XML Output
<table>
<tr><th>Property Name</th><th>Description</th><th>Value class</th><th>Legal Values</th></tr>
<tr>
<td>`xmlbase`</td>
<td>The value to be included for an xml:base attribute on the root element in the file.</td>
<td>`String`</td>
<td>A URI string, or null (default)</td>
</tr>
<tr>
<td>`longId`</td>
<td>Whether to use long or short id's for anon resources. Short id's are easier to read and are the default, but can run out of memory on very large models.</td>
<td>`String` or `Boolean`</td>
<td>`"true"`, `"false"` (default)</td>
</tr>
<tr>
<td>`allowBadURIs`</td>
<td>URIs in the graph are, by default, checked prior to serialization.</td>
<td>`String` or `Boolean`</td>
<td>`"true"`, `"false"` (default)</td>
</tr>
<tr>
<td>`relativeURIs`</td>
<td>What sort of relative URIs should be used. A comma separated list of options:

- *same-document*<br />
 same-document references (e.g. "" or "\#foo")
- *network*<br />
  network paths e.g. `"//example.org/foo"` omitting the URI scheme
- *absolute*<br />
  absolute paths e.g. `"/foo"` omitting the scheme and authority
- *relative*<br />
  relative path not beginning in `"../"`
- *parent*<br />
  relative path beginning in `"../"`
- *grandparent*<br />
  relative path beginning in `"../../"`

The default value is "same-document, absolute, relative, parent".
To switch off relative URIs use the value "". Relative URIs of any
of these types are output where possible if and only if the option
has been specified.</td>
<td>String</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>`showXmlDeclaration`</td>
<td>
If true, an XML Declaration is included in the output, if false no XML declaration is included.
The default behaviour only gives an XML Declaration when asked to write to an `OutputStreamWriter`
that uses some encoding other than UTF-8 or UTF-16. In this case the encoding is shown in the
XML declaration. To ensure that the encoding attribute is shown in the XML declaration either:

- Set this option to true and use the
    `write(Model,Writer,String)` variant with an appropriate `OutputStreamWriter`.
- Or set this option to false, and write the declaration to an `OutputStream` before calling
    `write(Model,OutputStream,String)`.
</td>
<td>`true`, `"true"`, `false`, `"false"` or `"default"`</td>
<td>can be true, false or "default" (null)</td>
</tr>
<tr>
<td>`showDoctypeDeclaration`</td>
<td>
If true, an XML Doctype declaration is included in the output. This
declaration includes a `!ENTITY` declaration for each prefix mapping
in the model, and any attribute value that starts with the URI of
that mapping is written as starting with the corresponding entity
invocation.
</td>
<td>`String` or `Boolean`</td>
<td>`true`, `false`, `"true"`, `"false"`</td>
</tr>
<tr>
<td>`tab`</td>
<td>The number of spaces with which to indent XML child elements.</td>
<td>`String` or `Integer`</td>
<td>positive integer "2" is the default</td>
</tr>
<tr>
<td>`attributeQuoteChar`</td>
<td>How to write XML attributes.</td>
<td>`String`</td>
<td>`"\""` or `"'"`</td>
</tr>
<tr>
<td>`blockRules`</td>
<td>
A list of `Resource` or a `String` being a comma separated list of
fragment IDs from [http://www.w3.org/TR/rdf-syntax-grammar](http://www.w3.org/TR/rdf-syntax-grammar)
indicating grammar rules that will not be used. Rules that can be blocked are:

- [section-Reification](http://www.w3.org/TR/rdf-syntax-grammar#section-Reification)
 ([`RDFSyntax.sectionReification`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#sectionReification))
- [section-List-Expand](http://www.w3.org/TR/rdf-syntax-grammar#section-List-Expand)
 ([`RDFSyntax.sectionListExpand`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#sectionListExpand))
- [parseTypeLiteralPropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeLiteralPropertyElt)
 ([`RDFSyntax.parseTypeLiteralPropertyElt`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeLiteralPropertyElt))
- [parseTypeResourcePropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeResourcePropertyElt)
 ([`RDFSyntax.parseTypeLiteralPropertyElt`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeLiteralPropertyElt))
- [parseTypeCollectionPropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeCollectionPropertyElt)
 ([`RDFSyntax.parseTypeCollectionPropertyElt`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeCollectionPropertyElt))
- [idAttr](http://www.w3.org/TR/rdf-syntax-grammar#idAttr)
 ([`RDFSyntax.idAttr`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#idAttr))
- [propertyAttr](http://www.w3.org/TR/rdf-syntax-grammar#propertyAttr)
 ([`RDFSyntax.propertyAttr`](/documentation/javadoc/jena/org/apache/jena/vocabulary/RDFSyntax.html#propertyAttr))

In addition `"daml:collection"`
([`DAML_OIL.collection`](/documentation/javadoc/jena/org/apache/jena/vocabulary/DAML_OIL.html#collection))
can be blocked. Blocking
[idAttr](http://www.w3.org/TR/rdf-syntax-grammar#idAttr) also
blocks
[section-Reification](http://www.w3.org/TR/rdf-syntax-grammar#section-Reification).
By default, rule
[propertyAttr](http://www.w3.org/TR/rdf-syntax-grammar#propertyAttr)
is blocked. For the basic writer (RDF/XML) only
[parseTypeLiteralPropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeLiteralPropertyElt)
has any effect, since none of the other rules are implemented by
that writer.
</td>
<td>`Resource[]` or `String`</td>
<td></td>
</tr>
<tr> 
<td>`prettyTypes`</td>
<td>
Only for the RDF/XML-ABBREV writer. This is a list of the types of
the principal objects in the model. The writer will tend to create
RDF/XML with resources of these types at the top level.
</td>
<td>
`Resource[]`
</td>
<td></td>
</tr>
</table>
 
As an example,

    RDFWriter w = m.getWriter("RDF/XML-ABBREV");
    w.setProperty("attributeQuoteChar","'");
    w.setProperty("showXMLDeclaration","true");
    w.setProperty("tab","1");
    w.setProperty("blockRules",
      "daml:collection,parseTypeLiteralPropertyElt,"
      +"parseTypeResourcePropertyElt,parseTypeCollectionPropertyElt");

creates a writer that does not use rdf:parseType (preferring
rdf:datatype for rdf:XMLLiteral), indents only a little, and
produces the XMLDeclaration. Attributes are used, and are quoted
with `"'"`.

Note that property attributes are not used at all, by default.
However, the RDF/XML-ABBREV writer includes a rule to produce
property attributes when the value does not contain any spaces.
This rule is normally switched off. This rule can be turned on
selectively by using the blockRules property as detailed above.

## Conformance

The RDF/XML I/O endeavours to conform with the
[RDF Syntax Recommendation](http://www.w3.org/TR/rdf-syntax-grammar/).

The parser must be set to strict mode. (Note that, the conformant
behaviour for `rdf:parseType="daml:collection"` is to silently turn
`"daml:collection"` into `"Literal"`).

The RDF/XML writer is conformant, but does not exercise much of the
grammar.

The RDF/XML-ABBREV writer exercises all of the grammar and is
conformant except that it uses the `daml:collection` construct for
DAML ontologies. This non-conformant behaviour can be switched off
using the `blockRules` property.

## Faster RDF/XML I/O

To optimise the speed of writing RDF/XML it is suggested that all
URI processing is turned off. Also do not use RDF/XML-ABBREV. It is
unclear whether the longId attribute is faster or slower; the short
IDs have to be generated on the fly and a table maintained during
writing. The longer IDs are long, and hence take longer to write.
The following creates a faster writer:

    Model m;
    …
    …
    RDFWriter fasterWriter = m.getWriter("RDF/XML");
    fasterWriter.setProperty("allowBadURIs","true");
    fasterWriter.setProperty("relativeURIs","");
    fasterWriter.setProperty("tab","0");

When reading RDF/XML the check for reuse of rdf:ID has a memory
overhead, which can be significant for very large files. In this
case, this check can be suppressed by telling ARP to ignore this
error.

    Model m;
    …
    …
    RDFReader bigFileReader = m.getReader("RDF/XML");
    bigFileReader.setProperty("WARN_REDEFINITION_OF_ID","EM_IGNORE");
    …
