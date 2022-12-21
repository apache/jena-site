---
title: SPARQL Tutorial - Data Formats
---

First, we need to be clear about what data is being queried. SPARQL
queries RDF graphs. An RDF graph is a set of triples (Jena calls
RDF graphs "models" and triples "statements" because that is what
they were called at the time the Jena API was first designed).

It is important to realize that it is the triples that matter, not
the serialization. The serialization is just a way to write the
triples down. RDF/XML is the W3C recommendation but it can be
difficult to see the triples in the serialized form because there are
multiple ways to encode the same graph.  In this tutorial, we use a
more "triple-like" serialization, called
[Turtle](http://www.ilrt.bris.ac.uk/discovery/2004/01/turtle/) (see
also N3 language described in the
[W3C semantic web primer](https://www.w3.org/2000/10/swap/Primer)).

We will start with the simple data in [vc-db-1.rdf](sparql_data/vc-db-1.rdf):
this file contains RDF for a number of vCard descriptions of
people.  vCards are described in
[RFC2426](https://www.ietf.org/rfc/rfc2426.txt) and the RDF
translation is described in the W3C note
"[Representing vCard Objects in RDF/XML](https://www.w3.org/TR/vcard-rdf.html)". 
Our example database just contains some name information.

Graphically, the data looks like:

![Graph of the vCard database](/images/vc-db.png "Graph of the vCard database")

In triples, this might look like:

    @prefix vCard:   <http://www.w3.org/2001/vcard-rdf/3.0#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix :        <#> .

    <http://somewhere/MattJones/>
        vCard:FN    "Matt Jones" ;
        vCard:N     [ vCard:Family
                                  "Jones" ;
                      vCard:Given
                                  "Matthew"
                    ] .

    <http://somewhere/RebeccaSmith/>
        vCard:FN    "Becky Smith" ;
        vCard:N     [ vCard:Family
                                  "Smith" ;
                      vCard:Given
                                  "Rebecca"
                    ] .

    <http://somewhere/JohnSmith/>
        vCard:FN    "John Smith" ;
        vCard:N     [ vCard:Family
                                  "Smith" ;
                      vCard:Given
                                  "John"
                    ] .

    <http://somewhere/SarahJones/>
        vCard:FN    "Sarah Jones" ;
        vCard:N     [ vCard:Family
                                  "Jones" ;
                      vCard:Given
                                  "Sarah"
                    ] .

or even more explicitly as triples:

    @prefix vCard:   <http://www.w3.org/2001/vcard-rdf/3.0#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

    <http://somewhere/MattJones/>  vCard:FN   "Matt Jones" .
    <http://somewhere/MattJones/>  vCard:N    _:b0 .
    _:b0  vCard:Family "Jones" .
    _:b0  vCard:Given  "Matthew" .


    <http://somewhere/RebeccaSmith/> vCard:FN    "Becky Smith" .
    <http://somewhere/RebeccaSmith/> vCard:N     _:b1 .
    _:b1 vCard:Family "Smith" .
    _:b1 vCard:Given  "Rebecca" .

    <http://somewhere/JohnSmith/>    vCard:FN    "John Smith" .
    <http://somewhere/JohnSmith/>    vCard:N     _:b2 .
    _:b2 vCard:Family "Smith" .
    _:b2 vCard:Given  "John"  .

    <http://somewhere/SarahJones/>   vCard:FN    "Sarah Jones" .
    <http://somewhere/SarahJones/>   vCard:N     _:b3 .
    _:b3 vCard:Family  "Jones" .
    _:b3 vCard:Given   "Sarah" .

It is important to realize that these are the same RDF graph and
that the triples in the graph are in no particular order.  They are
just written in related groups above for the human reader - the
machine does not care.

[Next: A Simple Query](sparql_query1.html)
