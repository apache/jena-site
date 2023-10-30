---
title: Jena RDF/XML Input How-To
---

_Legacy Documentation : may not be up-to-date_

Original [RDF/XML HowTo](rdfxml_howto.html).

---

This is a guide to the RDF/XML legacy input subsystem of Jena, ARP.

## Advanced RDF/XML Input

For access to these advanced features, first get an `RDFReader`
object that is an instance of an ARP parser, by using the
[`getReader`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFReaderF.html#getReader())`()`
method on any `Model`. It is then configured using the
[`setProperty`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml/xmlinput0/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
method. This changes the properties for parsing RDF/XML. Many of
the properties change the RDF parser, some change the XML parser.
(The Jena RDF/XML parser, ARP, implements the
[RDF grammar](http://www.w3.org/TR/rdf-syntax-grammar/#section-Infoset-Grammar)
over a [Xerces2-J](http://xml.apache.org/xerces2-j/index.html) XML
parser). However, changing the features and properties of the XML
parser is not likely to be useful, but was easy to implement.

[`setProperty`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml/xmlinput0/JenaReader.html#setProperty(java.lang.String, java.lang.Object))`(String, Object)`
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
`error-mode`| [`ARPOptions.setDefaultErrorMode()`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml/xmlinput0/ARPOptions.html#setDefaultErrorMode()) <br />[`ARPOptions.setLaxErrorMode()`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml/xmlinput0/ARPOptions.html#setLaxErrorMode())<br />[`ARPOptions.setStrictErrorMode()`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPOptions.html#setStrictErrorMode())<br />[`ARPOptions.setStrictErrorMode(int)`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPOptions.html#setStrictErrorMode(int))<br />  This allows a coarse-grained approach to control of error handling. Setting this property is equivalent to setting many of the fine-grained error handling properties. | `String` | `default`<br />`lax`<br />`strict`<br />`strict-ignore`<br />`strict-warning`<br />`strict-error`<br />`strict-fatal`
`embedding` | [`ARPOptions.setEmbedding(boolean)`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPOptions.html#setEmbedding(boolean)) <br />This sets ARP to look for RDF embedded within an enclosing XML document. | `String` or `Boolean` | `true`<br />`false`
`ERR_<XXX>` <br />`WARN_<XXX>`<br />`IGN_<XXX>` | See [`ARPErrorNumbers`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html) for a complete list of the error conditions detected. Setting one of these properties is equivalent to the method [`ARPOptions.setErrorMode(int, int)`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPOptions.html#setErrorMode(int,%20int)). Thus fine-grained control over the behaviour in response to specific error conditions is possible.| `String` or `Integer` | [`EM_IGNORE`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html#EM_IGNORE)<br />[`EM_WARNING`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html#EM_WARNING)<br />[`EM_ERROR`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html#EM_ERROR)<br />[`EM_FATAL`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html#EM_FATAL)

To set ARP properties, create a map of values to be set and put this in parser context:

```
    Map<String, Object> properties = new HashMap<>();
    // See class ARPErrorNumbers for the possible ARP properties.
    properties.put("WARN_BAD_NAME", "EM_IGNORE");

    // Build and run a parser
    Model model = RDFParser.create()
        .lang(Lang.RDFXML)
        .source(...)
        .set(SysRIOT.sysRdfReaderProperties, properties)
        .base("http://base/")
        .toModel();
    System.out.println("== Parsed data output in Turtle");
    RDFDataMgr.write(System.out,  model, Lang.TURTLE);
```

See example
[ExRIOT_RDFXML_ReaderProperties.java](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/riot/ExRIOT_RDFXML_ReaderProperties.java).

<b>Legacy Example</b>

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
[`IGN_DAML_COLLECTION`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdfxml0/xmlinput/ARPErrorNumbers.html#IGN_DAML_COLLECTION)
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

## Further details

[Details of ARP, the Jena RDF/XML parser](arp/arp.html)
