---
title: RDF/XML Input in Jena
---

___Legacy Documentation : not up-to-date___

___The original ARP parser will be removed from Jena___

The current RDF/XML parser is RRX.

---

This section details the Jena RDF/XML parser.
ARP is the parsing subsystem in Jena for handling the RDF/XML syntax.

-   [ARP Features](#arp-features)
-   [Using ARP without Jena](arp_standalone.html)
-   [Using other SAX and DOM XML sources](arp_sax.html)

## ARP Features

-   Java based RDF parser.
-   Compliant with
    [RDF Syntax](http://www.w3.org/TR/rdf-syntax-grammar) and
    [RDF Test Cases](http://www.w3.org/TR/rdf-testcases)
    Recommendations.
-   Compliant with following standards and recommendations:
    - **xml:lang**<br />
      [xml:lang](http://www.w3.org/TR/REC-xml#sec-lang-tag) is fully
        supported, both in RDF/XML and any document embedding RDF/XML.
        Moreover, the language tags are checked against
        [RFC1766](http://www.isi.edu/in-notes/rfc1766.txt),
        [RFC3066](http://www.isi.edu/in-notes/rfc3066.txt), ISO639-1,
        [ISO3166](http://www.din.de/gremien/nas/nabd/iso3166ma/codlstp1/db_en.html).
    - **xml:base**<br />
      [xml:base](http://www.w3.org/TR/xmlbase/) is fully supported,
        both in RDF/XML and any document embedding RDF/XML.
    - **URI**<br />
      All URI references are checked against
        [RFC2396](http://www.isi.edu/in-notes/rfc2396.txt). The treatment
        of international URIs implements the concept of
        [RDF URI Reference](http://www.w3.org/TR/rdf-concepts/#dfn-URI-reference).
    - **XML Names**<br />
       All rdf:ID's are checked against the
        [XML Names](http://www.w3.org/TR/REC-xml#dt-name) specification.
    - **Unicode Normal Form C**<br />
      String literals are checked for conformance with an early
        uniform normalization processing model.
    - **XML Literals**<br />
       `rdf:parseType='Literal'` is processed respecting namespaces,
        processing instructions and XML comments. This follows the XML
        exclusive canonicalizations recommendation with comments.
    - **Relative Namespace URI references**<br />
       Namespace URI references are checked in light of the
        [W3C XML Plenary decision](http://www.w3.org/2000/09/xppa).
-   Command-line RDF/XML error checking.
-   Can be used independently of Jena, with customizable
    `StatementHandler`.
-   Highly configurable error processing.
-   Xerces based XML parsing.
-   Processes both standalone and embedded RDF/XML.
-   Streaming parser, suitable for large files.
-   Supports SAX and DOM, for integration with non-file XML
    sources.
