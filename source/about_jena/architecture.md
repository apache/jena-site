---
title: Jena architecture overview
---

There's quite a lot of code inside Jena, and it can be daunting for new Jena
users to find their way around. On this page we'll summarise the
key features and interfaces in Jena, as a general overview and guide to the
more detailed documentation.

At its core, Jena stores information as RDF triples in directed graphs, and allows
your code to add, remove, manipulate, store and publish that information. We
tend to think of Jena as a number of major subsystems with clearly
defined interfaces between them. First let's start with the big picture:

![Jena architecture overview](/images/jena-architecture.png "Jena architecture overview")

RDF triples and graphs, and their various components, are accessed through Jena's
RDF API. Typical abstractions here are <code>Resource</code> representing an
RDF resource (whether named with a URI or anonymous), <code>Literal</code> for data
values (numbers, strings, dates, etc), <code>Statement</code> representing an RDF
triple and <code>Model</code> representing the whole graph. The RDF API has basic
facilities for adding and removing triples to graphs and finding triples that match
particular patterns. Here you can also read in RDF from external sources, whether
files or URL's, and serialize a graph in correctly-formatted text form. Both input
and output support most of the commonly-used RDF syntaxes.

While the programming interface to <code>Model</code> is quite rich,
internally, the RDF graph is stored in a much simpler abstraction named <code>Graph</code>.
This allows Jena to use a variety of different storage strategies equivalently, as long
as they conform to the <code>Graph</code> interface. Out-of-the box, Jena can store
a graph as an in-memory store, or as a persistent store using a
custom disk-based tuple index. The graph interface is also a convenient extension point
for connecting other stores to Jena, such as LDAP, by writing an adapter that allows
the calls from the <code>Graph</code> API to work on that store.

A key feature of semantic web applications is that the semantic rules of RDF, RDFS and
OWL can be used to *infer* information that is not explicitly stated in the graph. For example,
if class C is a sub-class of class B, and B a sub-class of A, then by implication C is
a sub-class of A. Jena's inference API provides the means to make these *entailed triples*
appear in the store just as if they had been added explicitly. The inference API provides
a number of rule engines to perform this job, either using the built-in rulesets for OWL
and RDFS, or using application custom rules. Alternatively, the inference API can be
connected up to an external reasoner, such as description logic (DL) engine, to perform
the same job with different, specialised, reasoning algorithms.

The collection of standards that define semantic web technologies includes SPARQL -
the query language for RDF. Jena conforms to all of the published standards, and tracks
the revisions and updates in the under-development areas of the standard. Handling
SPARQL, both for query and update, is the responsibility of the SPARQL API.

Ontologies are also key to many semantic web applications. Ontologies are formal logical
descriptions, or *models*, of some aspect of the real-world that applications have to
deal with. Ontologies can be shared with other developers and researchers, making it a
good basis for building linked-data applications. There are two ontology languages
for RDF: RDFS, which is rather weak, and OWL which is much more expressive. Both languages
are supported in Jena though the Ontology API, which provides convenience methods that
know about the richer representation forms available to applications through OWL and RDFS.

While the above capabilities are typically accessed by applications directly through the
Java API, publishing data over the Internet is a common requirement in modern applications.
Fuseki is a data publishing server, which can present, and update, RDF models over the
web using SPARQL and HTTP.

There are many other pieces to Jena, including command-line tools, specialised indexes for
text-based lookup, etc. These, and further details on the pieces outlined above, can be
found in the detailed documentation on this site.
