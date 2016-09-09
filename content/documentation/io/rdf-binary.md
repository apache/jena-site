Title: RDF Binary using Apache Thrift

"RDF Binary" is a efficient format for RDF and RDF-related data using
[Apache Thrift](https://thrift.apache.org/) as the binary encoding.

The W3C standard RDF syntaxes are text or XML based.  These incur costs in
parsing; the most human-readable formats also incur high costs to write, and
have limited scalability due to the need to analyse the data for pretty
printing rather than simply stream to output.

Binary formats are faster to process - they do not incur the parsing
costs of text-base formats.  "RDF Binary" defines basic encoding for RDF
terms, then builds data formats for RDF graphs, RDF datasets, and for
SPARQL result sets.  This gives a basis for high-performance linked data
systems.

[Apache Thrift](https://thrift.apache.org/) provides an efficient, 
wide-used binary encoding layer with a large number of language bindings.

For more details of [RDF Thrift](http://afs.github.io/rdf-thrift).

This pages gives the details of RDF Binary encoding in [Apache Thrift](http://thrift.apache.org/).

## Thrift encoding of RDF Terms {#encoding-terms}

RDF Thrift uses the Thrift compact protocol.

    struct RDF_IRI {
    1: required string iri
    }
    
    struct RDF_BNode {
    1: required string label
    }
    
    # Literals, in full form.
    struct RDF_Literal {
    1: required string lex
    2: optional string datatype
    3: optional string langtag
    }
    
    struct RDF_Decimal {
    1: required i64  value ;
    2: required i32  scale ;
    }
    
    struct RDF_VAR {
    1: required string name
    }
    
    struct RDF_ANY { }
    
    struct RDF_UNDEF { }
    
    struct RDF_REPEAT { }
    
    struct RDF_PrefixDecl {
    1: required string prefix ;
    2: required string uri ;
    }
    
    struct RDF_PrefixName {
    1: required string prefix ;
    2: required string localName ;
    }
    
    union RDF_Term {
    1: RDF_IRI          iri
    2: RDF_BNode        bnode
    3: RDF_Literal      literal
    4: RDF_PrefixName   prefixName 
    5: RDF_VAR          variable
    6: RDF_ANY          any
    7: RDF_UNDEF        undefined
    8: RDF_REPEAT       repeat
    # Value forms of literals.
    10: i64             valInteger
    11: double          valDouble
    12: RDF_Decimal     valDecimal
    }

## Thrift encoding of Triples, Quads and rows. {#encoding-tuples}

    struct RDF_Triple {
    1: required RDF_Term S
    2: required RDF_Term P
    3: required RDF_Term O
    }
    
    struct RDF_Quad {
    1: required RDF_Term S
    2: required RDF_Term P
    3: required RDF_Term O
    4: optional RDF_Term G
    }
    
    union RDF_StreamRow {
    1: RDF_PrefixDecl   prefixDecl
    2: RDF_Triple       triple
    3: RDF_Quad         quad
    }
    
## Thrift encoding of RDF Graphs and RDF Datasets {#encoding-graphs-datasets}

RDF Graphs are encoded as a stream of `RDF_Triple`.

RDF Datasets are encoded as a stream of `RDF_Triple` and `RDF-Quad`.


## Thrift encoding of SPARQL Result Sets {#encoding-result-sets}

A SPARQL Result Set is encoded as a list of variables (the header), then
a list of rows (the results).

    struct RDF_VarTuple {
    1: list<RDF_VAR> vars
    }
    
    struct RDF_DataTuple {
    1: list<RDF_Term> row
    }
