---
title: RDF Binary using Apache Thrift
---

"RDF Binary" is a efficient format for RDF and RDF-related data using
[Apache Thrift](https://thrift.apache.org/) 
or  [Google Protocol Buffers](https://developers.google.com/protocol-buffers)
as the binary data encoding.

The W3C standard RDF syntaxes are text or XML based.  These incur costs in
parsing; the most human-readable formats also incur high costs to write, and
have limited scalability due to the need to analyse the data for pretty
printing rather than simply stream to output.

Binary formats are faster to process - they do not incur the parsing
costs of text-base formats.  "RDF Binary" defines basic encoding for RDF
terms, then builds data formats for RDF graphs, RDF datasets, and for
SPARQL result sets.  This gives a basis for high-performance linked data
systems.

[Thrift](https://thrift.apache.org/) and
[Protobuf](https://developers.google.com/protocol-buffers) provides efficient,
widely-used, binary encoding layers each with a large number of language
bindings.

For more details of [RDF Thrift](http://afs.github.io/rdf-thrift).

## Thrift encoding of RDF Terms {#encoding-terms-thrift}

RDF Thrift uses the Thrift compact protocol.

Source: [BinaryRDF.thrift](https://github.com/apache/jena/blob/main/jena-arq/Grammar/RDF-Thrift/BinaryRDF.thrift)

### RDF terms

    struct RDF_IRI {
    1: required string iri
    }
    
    # A prefix name (abbrev for an IRI)
    struct RDF_PrefixName {
    1: required string prefix ;
    2: required string localName ;
    }
    
    struct RDF_BNode {
    1: required string label
    }
    
    struct RDF_Literal {
    1: required string  lex ;
    2: optional string  langtag ;
    3: optional string  datatype ;
    4: optional RDF_PrefixName dtPrefix ;
    }
    
    struct RDF_Decimal {
    1: required i64  value ;
    2: required i32  scale ;
    }
    
    struct RDF_VAR {
    1: required string name ;
    }
    
    struct RDF_ANY { }
    
    struct RDF_UNDEF { }
    
    struct RDF_REPEAT { }
    
    union RDF_Term {
    1: RDF_IRI          iri
    2: RDF_BNode        bnode
    3: RDF_Literal      literal
    4: RDF_PrefixName   prefixName 
    5: RDF_VAR          variable
    6: RDF_ANY          any
    7: RDF_UNDEF        undefined
    8: RDF_REPEAT       repeat
    9: RDF_Triple       tripleTerm  # RDF-star
    
    # Value forms of literals.
    10: i64             valInteger
    11: double          valDouble
    12: RDF_Decimal     valDecimal
    }

### Thrift encoding of Triples, Quads and rows. {#encoding-thrift-tuples}

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
    
    struct RDF_PrefixDecl {
    1: required string prefix ;
    2: required string uri ;
    }

### Thrift encoding of RDF Graphs and RDF Datasets {#encoding-thrift-graphs-datasets}

    union RDF_StreamRow {
    1: RDF_PrefixDecl   prefixDecl
    2: RDF_Triple       triple
    3: RDF_Quad         quad
    }

RDF Graphs are encoded as a stream of `RDF_Triple` and `RDF_PrefixDecl`.

RDF Datasets are encoded as a stream of `RDF_Triple`, `RDF-Quad` and `RDF_PrefixDecl`.

### Thrift encoding of SPARQL Result Sets {#encoding-thrift-result-sets}

A SPARQL Result Set is encoded as a list of variables (the header), then
a stream of rows (the results).

    struct RDF_VarTuple {
    1: list<RDF_VAR> vars
    }
    
    struct RDF_DataTuple {
    1: list<RDF_Term> row
    }

## Protobuf encoding of RDF Terms {#encoding-terms-protobuf}

The Protobuf schema is simialr.

Source:
[binary-rdf.proto](https://github.com/apache/jena/blob/main/jena-arq/Grammar/RDF-Protobuf/binary-rdf.proto)

Streaming isused to allow for abitrary size graphs. Therefore the steram items
(`RDF_StreamRow` below) are written with an initial length (`writeDelimitedTo`
in the Java API).

See
[Protobuf Techniques Streaming](https://developers.google.com/protocol-buffers/docs/techniques#streaming).

```
syntax = "proto3";

option java_package         = "org.apache.jena.riot.protobuf.wire" ;

// Prefer one file with static inner classes.
option java_outer_classname = "PB_RDF" ;
// Optimize for speed (default)
option optimize_for = SPEED ;

//option java_multiple_files = true;
// ==== RDF Term Definitions 

message RDF_IRI {
  string iri = 1 ;
} 
 
// A prefix name (abbrev for an IRI)
message RDF_PrefixName {
  string prefix = 1 ;
  string localName = 2 ;
} 

message RDF_BNode {
  string label = 1 ;
  // 2 * fixed64
} 

// Common abbreviations for datatypes and other URIs?
// union with additional values. 

message RDF_Literal {
  string lex = 1 ;
  oneof literalKind {
    bool simple = 9 ;
    string langtag = 2 ;
    string datatype = 3 ;
    RDF_PrefixName dtPrefix = 4 ;
  }
}

message RDF_Decimal {
  sint64  value = 1 ;
  sint32  scale = 2 ;
}

message RDF_Var {
  string name = 1 ;
}

message RDF_ANY { }

message RDF_UNDEF { }

message RDF_REPEAT { }

message RDF_Term {
  oneof term {
    RDF_IRI        iri        = 1 ;
    RDF_BNode      bnode      = 2 ;
    RDF_Literal    literal    = 3 ;
    RDF_PrefixName prefixName = 4 ;
    RDF_Var        variable   = 5 ;
    RDF_Triple     tripleTerm = 6 ;
    RDF_ANY        any        = 7 ;
    RDF_UNDEF      undefined  = 8 ;
    RDF_REPEAT     repeat     = 9 ;
    
    // Value forms of literals.
    sint64         valInteger = 20 ;
    double         valDouble  = 21 ;
    RDF_Decimal    valDecimal = 22 ;
  }
}

// === StreamRDF items 

message RDF_Triple {
  RDF_Term S = 1 ;
  RDF_Term P = 2 ;
  RDF_Term O = 3 ;
}

message RDF_Quad {
  RDF_Term S = 1 ;
  RDF_Term P = 2 ;
  RDF_Term O = 3 ;
  RDF_Term G = 4 ;
}

// Prefix declaration
message RDF_PrefixDecl {
  string prefix = 1;
  string uri    = 2 ;
}

// StreamRDF
message RDF_StreamRow {
  oneof row {
    RDF_PrefixDecl   prefixDecl  = 1 ;
    RDF_Triple       triple      = 2 ;
    RDF_Quad         quad        = 3 ;
    RDF_IRI          base        = 4 ;
  }
}

message RDF_Stream {
  repeated RDF_StreamRow row = 1 ;
}

// ==== SPARQL Result Sets

message RDF_VarTuple {
  repeated RDF_Var vars = 1 ;
}

message RDF_DataTuple {
  repeated RDF_Term row = 1 ;
}

// ==== RDF Graph

message RDF_Graph {
  repeated RDF_Triple triple = 1 ;
}
```
