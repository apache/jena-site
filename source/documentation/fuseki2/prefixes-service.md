# Prefixes Service

## Overview
The prefix service provides prefix lookup, update and delete functionality on a collection of prefixes.
It provides a read access endpoint to look up a prefix name and to look up an URI to get prefixes for a URI
and also read-write access which adds the ability to add and delete prefix entries.

## Operations

The service supports fetch, remove and update operations on prefixes. 
When making requests to the API the url can have 3 parameters: prefix, uri, and prefixToRemove. 
The fetch request is an HTTP GET and the update and remove operations get invoked
via HTTP POST.

### FetchURI
If only the prefix parameter is provided and the rest are null,
the service will perform a fetch operation and return the corresponding URI.
If no such prefix exists in the database the operation returns an empty String.

### FetchPrefix
If only the URI parameter is provided and the rest are null,
the service will perform a fetch operation and return the corresponding prefixes in a JsonArray.
If no such prefix exists in the database the operation returns an empty String.

### GetAll
A HTTP GET with no parameters returns all the prefix-URI pairs present in the dataset in a JsonArray.

### Update
If only the prefixToRemove parameter is left null, the provided prefix-uri pair will be
added to the dataset. If the provided prefix already exists in the database, the pair will be overwritten.
In case the namespace already exists with a different prefix, the pair will be added to the dataset.

### Remove
The remove operation is performed when only the prefixToRemove parameters is provided
and the other parameters are null. It removes the prefix-namespace pair matching the provided
prefix. The operation is considered successful when the request is correctly formed
even if the prefix doesn't exist in the database.

If any of the arguments is not valid, (the [prefix](https://www.w3.org/TR/rdf12-turtle/#grammar-production-PN_PREFIX) 
and [URI](https://www.rfc-editor.org/rfc/rfc3986) don't have the correct syntax) the server returns 400,
it does so also when the url string is not formed correctly, for example when the parameter names are incorrect.

## Example

For a server running on localhost using an example dataset 

| prefix  | uri                           |
|---------|-------------------------------|
| prefix1 | http://www.localhost.org/uri1 |
| prefix2 | http://www.localhost.org/uri2 |

the following HTTP GET request
```
http://localhost:port/prefixes?prefix=prefix1
```
will return http://www.localhost.org/uri1.

A POST request
```
http://localhost:port/prefixes?prefix=prefix1&uri=http://www.localhost.org/newuri1
```
will result in the update of the database:

| prefix  | uri                              |
|---------|----------------------------------|
| prefix1 | http://www.localhost.org/newuri1 |
| prefix2 | http://www.localhost.org/uri2    |

Incorrectly formed requests
```
// prefix is not valid
http://localhost:port/prefixes?prefix=.prefix1&uri=http://www.localhost.org/newuri1

// incorrect parameter name
http://localhost:port/prefixes?p=prefix1&uri=http://www.localhost.org/newuri1

// illegal combination of parameter values
http://localhost:port/prefixes?prefix=prefix1&uri=http://www.localhost.org/newuri1&prefixtoremove=prefix2
```
result in HTTP exception: 400 - Bad Request.

## Configuration

The services is configured via a standard Fuseki config file. Example file for a Prefixes Services with a TDB2 database at `data/DB2`:

```
PREFIX example:  <http://example.org/fuseki/>
PREFIX ex: <http://example.org/fuseki/operation/>
PREFIX fuseki:  <http://jena.apache.org/fuseki#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX :        <http://telicent.io/config#>
PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>
PREFIX tdb2:    <http://jena.apache.org/2016/tdb#>

:service rdf:type fuseki:Service ;
    fuseki:name "dataset" ;
    fuseki:endpoint [ fuseki:operation fuseki:query ; ] ;
    fuseki:endpoint [ fuseki:operation fuseki:update ; ] ;
    
    fuseki:endpoint [ fuseki:operation ex:prefixes-r ; fuseki:name "prefixes" ] ;
    fuseki:endpoint [ fuseki:operation ex:prefixes-rw ; fuseki:name "updatePrefixes" ] ;
    fuseki:dataset :dataset ;
    .

:dataset rdf:type  tdb2:DatasetTDB2 ;
    tdb2:location "data/DB2" ;
    .
```