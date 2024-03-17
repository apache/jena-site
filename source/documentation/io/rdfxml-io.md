---
title: Jena RDF XML
---

- [RDF/XML Input](#rdfxml-input)
- [RDF/XML Output](#rdfxml-output)

## RDF/XML Input

The RIOT RDF/XML parser is called RRX.


The ARP RDF/XML parser is stil available but wil be rmoved from Apache Jena.

- Legacy ARP [RDF/XML input](rdfxml-input.html)

## RDF/XML Output

Two forms for output are provided:

* The default output `Lang.RDFXML`, historically called "RDF/XML-ABBREV", which
also has a format name `RDFFormat.RDFXML_PRETTY`. It produces readable
output. It requires working memory to analyse the data to be written and it is
not streaming.

* For efficient, streaming output, the basic RDF/XML `RDFFormat.RDFXML_PLAIN`
works for data of any size. It outputs each subject together with all property
values without using the full features of RDF/XML.

For "RDF/XML-ABBREV":

    RDFDataMgr.write(System.out, model, Lang.RDFXML);

or

    RDFWriter.source(model).lang(Lang.RDFXML).output(System.out);

and for plain RDF/XML:

    RDFDataMgr.write(System.out, model, RDFFormat.RDFXML_PLAIN);

or

    RDFWriter.source(model).format(RDFFormat.RDFXML_PLAIN).output(System.out);

- [RDF/XML advanced output](rdfxml-output.html)
