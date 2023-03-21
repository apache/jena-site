---
title: Jena RDF XML
---

This is a guide to the RDF/XML I/O subsystem of Jena.

The RDF/XML parser is designed for use with RIOT and to have the same handling
of errors, IRI resolution, and treatment of base IRIs as other RIOT readers.


## RDF/XML Input

The usual way to access the RDF/XML parser is via `RDFDataMgr` or `RDFParser`.

    Model model = RDFDataMgr.loadModel("data.rdf");

or

    Model model = RDFParser.source("data.rdf").toModel();

The original "ARP" parser is still available bu tmaybe pahsed out.  To access
the legacy parser, use the context symbol `RIOT.symRDFXML0` to `true` or
`"true".

    Model model = RDFParser.source(""data.rdf")
                           .set(RIOT.symRDFXML0, true)
                           .parse(dest);

This applies to the command line:

    riot --set rdfxml:rdfxml0=true data.rdf

This can be set globally in the JVM:

    RIOT.getContext().set(RIOT.symRDFXML0, "true");

Details of [legacy RDF/XML input](rdfxml-input.html).

Details of the original Jena RDF/XML parser, [ARP](arp/arp.html).

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


Details of [legacy RDF/XML output](rdfxml-output.html).
