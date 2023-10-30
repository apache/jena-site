---
title: Jena RDF/XML Output How-To
---

_Legacy Documentation : may not be up-to-date_

Original [RDF/XML HowTo](rdfxml_howto.html).

---

## Advanced RDF/XML Output

Two forms for output are provided: pretty printed RDF/XML ("RDF/XML-ABBREV") or plain RDF/XML

While some of the code is shared, these
two writers are really very different, resulting in different but
equivalent output. "RDF/XML-ABBREV" is slower, but should produce
more readable XML.

### Properties to Control RDF/XML Output

<table>
<tr><th>Property Name</th><th>Description</th><th>Value class</th><th>Legal Values</th></tr>
<tr>
<td><tt>xmlbase</tt></td>
<td>The value to be included for an xml:base attribute on the root element in the file.</td>
<td><tt>String</tt></td>
<td>A URI string, or null (default)</td>
</tr>
<tr>
<td><tt>longId</tt></td>
<td>Whether to use long or short id's for anon resources. Short id's are easier to read and are the default, but can run out of memory on very large models.</td>
<td><tt>String</tt> or <tt>Boolean</tt></td>
<td><tt>"true"</tt>, <tt>"false"</tt> (default)</td>
</tr>
<tr>
<td><tt>allowBadURIs</tt></td>
<td>URIs in the graph are, by default, checked prior to serialization.</td>
<td><tt>String</tt> or <tt>Boolean</tt></td>
<td><tt>"true"</tt>, <tt>"false"</tt> (default)</td>
</tr>
<tr>
<td><tt>relativeURIs</tt></td>
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
<td><tt>showXmlDeclaration</tt></td>
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
<td><tt>true</tt>, <tt>"true"</tt>, <tt>false</tt>, <tt>"false"</tt> or <tt>"default"</tt></td>
<td>can be true, false or "default" (null)</td>
</tr>
<tr>
<td><tt>showDoctypeDeclaration</tt></td>
<td>
If true, an XML Doctype declaration is included in the output. This
declaration includes a `!ENTITY` declaration for each prefix mapping
in the model, and any attribute value that starts with the URI of
that mapping is written as starting with the corresponding entity
invocation.
</td>
<td><tt>String</tt> or <tt>Boolean</tt></td>
<td><tt>true</tt>, <tt>false</tt>, <tt>"true"</tt>, <tt>"false"</tt></td>
</tr>
<tr>
<td><tt>tab</tt></td>
<td>The number of spaces with which to indent XML child elements.</td>
<td><tt>String</tt> or <tt>Integer</tt></td>
<td>positive integer "2" is the default</td>
</tr>
<tr>
<td><tt>attributeQuoteChar</tt></td>
<td>How to write XML attributes.</td>
<td><tt>String</tt></td>
<td><tt>"\""</tt> or <tt>"'"</tt></td>
</tr>
<tr>
<td><tt>blockRules</tt></td>
<td>
A list of `Resource` or a `String` being a comma separated list of
fragment IDs from [http://www.w3.org/TR/rdf-syntax-grammar](http://www.w3.org/TR/rdf-syntax-grammar)
indicating grammar rules that will not be used. Rules that can be blocked are:

- [section-Reification](http://www.w3.org/TR/rdf-syntax-grammar#section-Reification)
 ([`RDFSyntax.sectionReification`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#sectionReification))
- [section-List-Expand](http://www.w3.org/TR/rdf-syntax-grammar#section-List-Expand)
 ([`RDFSyntax.sectionListExpand`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#sectionListExpand))
- [parseTypeLiteralPropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeLiteralPropertyElt)
 ([`RDFSyntax.parseTypeLiteralPropertyElt`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeLiteralPropertyElt))
- [parseTypeResourcePropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeResourcePropertyElt)
 ([`RDFSyntax.parseTypeLiteralPropertyElt`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeLiteralPropertyElt))
- [parseTypeCollectionPropertyElt](http://www.w3.org/TR/rdf-syntax-grammar#parseTypeCollectionPropertyElt)
 ([`RDFSyntax.parseTypeCollectionPropertyElt`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#parseTypeCollectionPropertyElt))
- [idAttr](http://www.w3.org/TR/rdf-syntax-grammar#idAttr)
 ([`RDFSyntax.idAttr`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#idAttr))
- [propertyAttr](http://www.w3.org/TR/rdf-syntax-grammar#propertyAttr)
 ([`RDFSyntax.propertyAttr`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/RDFSyntax.html#propertyAttr))

In addition `"daml:collection"`
([`DAML_OIL.collection`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/vocabulary/DAML_OIL.html#collection))
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
<td><tt>Resource[]</tt> or <tt>String</tt></td>
<td></td>
</tr>
<tr> 
<td><tt>prettyTypes</tt></td>
<td>
Only for the RDF/XML-ABBREV writer. This is a list of the types of
the principal objects in the model. The writer will tend to create
RDF/XML with resources of these types at the top level.
</td>
<td>
<tt>Resource[]</tt>
</td>
<td></td>
</tr>
</table>

To set properties on the RDF/XML writer:

```
    // Properties to be set.
    Map<String, Object> properties = new HashMap<>() ;
    properties.put("showXmlDeclaration", "true");

     RDFWriter.create()
        .base("http://example.org/")
        .format(RDFFormat.RDFXML_PLAIN)
        .set(SysRIOT.sysRdfWriterProperties, properties)
        .source(model)
        .output(System.out);
```

See
[ExRIOT_RDFXML_WriterProperties.java](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/riot/ExRIOT_RDFXML_WriterProperties.java).

<b>Legacy example</b>

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
