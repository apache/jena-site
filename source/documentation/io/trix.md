---
title: TriX support in Apache Jena
---

Jena supports [TriX](http://www.hpl.hp.com/techreports/2004/HPL-2004-56.html), a
simple XML format for RDF, for both reading and writing RDF data.

The support is of the TriX core, without processing instructions.

Both the original HPlabs and W3C DTDs are supported for reading. Writing is
according to the W3C DTD, that is using root element `<trix>`,
rather than `<TriX>`.

Note: This format should not be confused with RDF/XML, the W3C standardised XML
format for RDF.

### TriX History

TriX originated from work by Jeremy Carroll (then at HP Labs, Bristol) and Patrick
Stickler (then at Nokia) and published as a tech report 
[HPL-2004-56](https://www.hpl.hp.com/techreports/2004/HPL-2004-56.html) 
There is also  earlier work published in [HPL-2003-268](https://www.hpl.hp.com/techreports/2003/HPL-2003-268.html).

The work within the Semantic Web Interest Group on Named Graphs, including TriX,
is documented at [https://www.w3.org/2004/03/trix/](https://www.w3.org/2004/03/trix/).

TriX DTD: http://www.w3.org/2004/03/trix/trix-1/trix-1.0.dtd<br/>
Trix XML Schema: http://www.w3.org/2004/03/trix/trix-1/trix-1.0.xsd

The [W3C DTD](https://www.w3.org/2004/03/trix/trix-1/trix-1.0.dtd) differs from
HPL-2004-56 by having root element `<trix>` not `<TriX>`.

```
<!-- TriX: RDF Triples in XML -->
<!ELEMENT trix         (graph*)>
<!ATTLIST trix         xmlns CDATA #FIXED "http://www.w3.org/2004/03/trix/trix-1/">
<!ELEMENT graph        (uri, triple*)>
<!ELEMENT triple       ((id|uri|plainLiteral|typedLiteral), uri, (id|uri|plainLiteral|typedLiteral))>
<!ELEMENT id           (#PCDATA)>
<!ELEMENT uri          (#PCDATA)>
<!ELEMENT plainLiteral (#PCDATA)>
<!ATTLIST plainLiteral xml:lang CDATA #IMPLIED>
<!ELEMENT typedLiteral (#PCDATA)>
<!ATTLIST typedLiteral datatype CDATA #REQUIRED>
```

### TriX-star

The format is extended for [RDF-star](https://w3c.github.io/rdf-star/) with
embedded triples by allowing nested `<triple>`.

Trix-star (2021) adds 'triple' to subject and object positions
of `ELEMENT triple`.

```
<!ELEMENT triple       ((id|uri|plainLiteral|typedLiteral|triple), uri, (id|uri|plainLiteral|typedLiteral|triple))>
```

#### Example

The Turtle:
```
PREFIX :      <http://example/>

:s      :p      "ABC" .
<< :s :p :o >>  :q  :r .
```
is written in Trix as:
```
<trix xmlns="http://www.w3.org/2004/03/trix/trix-1/">
  <graph>
    <triple>
      <uri>http://example/s</uri>
      <uri>http://example/p</uri>
      <plainLiteral>ABC</plainLiteral>
    </triple>
    <triple>
      <triple>
        <uri>http://example/s</uri>
        <uri>http://example/p</uri>
        <uri>http://example/o</uri>
      </triple>
      <uri>http://example/q</uri>
      <uri>http://example/r</uri>
    </triple>
  </graph>
</trix>
```
