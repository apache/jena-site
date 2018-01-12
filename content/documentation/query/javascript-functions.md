Title: ARQ - JavaScript SPARQL Functions

ARQ supports (Jena v3.7.0 onwards) writing 
[custom SPARQL functions](https://www.w3.org/TR/sparql11-query/#extensionFunctions)
in JavaScript. These functions can be used in FILTER and for calulatinfg
values for BIND and AS in SELECT expressions.

For convenience, XSD datatypes for strings, numbers and booleans are
comverted to the native JavaScript datatypes. RDFterm that do not fit
easily into JavaScript datatypes are handled with a object class `NV`.

## Loading JavaScript functions

JavaScript is loaded from an external file using the context setting
"http://jena.apache.org/ARQ#js-library". This can be written as
`arq:js-library` for commands and Fuseki configuation files.

Example:

    sparql --set arq:js-library=SomeFile.js --data ... --query ...

will execute omn teghdata with the JavaScript functions from file
"SomeFile.js" available.

JavScript functions cammn also be from a string directly from within Java using constant
`ARQ.symJavaScriptFunctions` ("http://jena.apache.org/ARQ#js-functions").

## Using JavaScript functions

SPARQL functions implemented in JavaScript are autoatica called when a
URI starting "http://jena.apache.org/ARQ/jsFunction#" used.

This can conveniently be abbreviated by:

    PREFIX js: <http://jena.apache.org/ARQ/jsFunction#>

### Arguments and Function Results

`xsd:string` (a string with no language tag), any XSD numbers
(integer, decimal, float, double and all the derived types) are
converted to JavaScript string, number and boolean respectively.

SPARQL functions must return a value. When a function returns a value,
it can be one of these JavaScript natbve dadatypes, in which case the
reverse conversion is applied back to XSD datatypes.

For numbers, the conversion is back to `xsd:integer` (if it has no
fractional part) or `xsd:double`.

The JavaScript fucntion can also create `NodeValue` (or `NV`) objects
for other datatypes.

URIs are passed as `NV` object and evaluate in JavaScript to a string.

The class `NV` is used for all other RDF terms (including URIs).

Returning JavaScript `null` is the error indicator and a SPARQL
expression error (`ExprEvalException`) is raised, like any other
expression error in SPARQL. That in turn will cause the whole
expression the function was involved in to evaluate to an error (unelss
a special form like `COALESCE` is used). In a `FILTER` that typcially
makes the filter evaluate as "false".

## Example

Suppose "functions.js" contains code to camel case words in a string.
For example, "some words to process " becomes "someWordsToProcess".

    // CamelCase a string
    // Words to be combined are separated by a space in the string.
    
    function toCamelCase(str) {
        return str.split(' ')
    	.map(cc)
    	.join('');
    }
    
    function ucFirst(word)    {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    function lcFirst(word)    {
        return word.toLowerCase();
    }
    
    function cc(word,index)   {
        return (index == 0) ? lcFirst(word) : ucFirst(word);
    }

and the query `Q.rq`

    PREFIX js: <http://jena.apache.org/ARQ/jsFunction#>
    
    SELECT ?input (js:toCamelCase(?input) AS ?X)
    {
        VALUES ?input { "some words to process" }
    }

which can be executed with:


    sparql --set arq:js-library=SomeFile.js --query Q.rq

to result in

    --------------------------------------------------
    | input                   | X                    |
    ==================================================
    | "some words to process" | "someWordsToProcess" |
    --------------------------------------------------
    
## Use with Fuseki

The content seeting can be provided on the command line starting the
server, for example:

    fuseki --set arq:js-library=functions.js --mem /ds

or it can be specificied in the server coinfiguration file `config.ttl`:

    PREFIX :        <#>
    PREFIX fuseki:  <http://jena.apache.org/fuseki#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

    [] rdf:type fuseki:Server ;
        # Set the server-wide context
        ja:context [
             ja:cxtName "arq:js-library" ;
             ja:cxtValue "/home/afs/tmp/JSF/functions.js"
        ] ;
    .

    <#service> rdf:type fuseki:Service;
        rdfs:label                   "Dataset";
        fuseki:name                  "ds";
        fuseki:serviceQuery          "sparql";
        fuseki:dataset <#dataset> ;
        .

    <#dataset> rdf:type ja:DatasetTxnMem;
        ja:data <file:D.trig>;
    .

and used as:

    fuseki --conf config.ttl
