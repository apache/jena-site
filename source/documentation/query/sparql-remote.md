---
title: ARQ - Querying Remote SPARQL Services
---

SPARQL is a
[query language](http://www.w3.org/TR/sparql11-query/) and a
[remote access protocol](http://www.w3.org/2001/sw/DataAccess/proto-wd/).
The remote access protocol runs over HTTP.

See [Fuseki](../fuseki2/index.html) for an implementation of the
SPARQL protocol over HTTP. Fuseki uses ARQ to provide SPARQL 
query access to Jena models, including Jena persistent models.

ARQ includes a query engine capable of using the HTTP version.

## From your application

The `QueryExecutionHTTP` has methods for creating a
`QueryExecution` object for remote use. There are various
HTTP specific settings; the default should work in most cases.

The remote request is made when the `execSelect`, `execConstruct`,
`execDescribe` or `execAsk` method is called.

The results are held locally after remote execution and can be
processed as usual.

## From the command line

The [`arq.sparql` command](cmds.html#arq.sparql) can issue remote
query requests using the `--service` argument:

    java -cp ... arq.query --service 'http://host/service' 'SELECT ?s WHERE {?s [] []}'

This takes a URL that is the service location.

The query given is parsed locally to check for syntax errors before
sending.

## Authentication

ARQ provides a flexible API for authenticating against remote services, see the [HTTP Authentication](../sparql-apis/http-auth.html) documentation for more details.

## Firewalls and Proxies

Don't forget to set the proxy for Java if you are accessing a
public server from behind a blocking firewall. Most home firewalls
do not block outgoing requests; many corporate firewalls do block
outgoing requests.

If, to use your web browser, you need to set a proxy, you need to
do so for a Java program.

Simple examples include:

    -DsocksProxyHost=YourSocksServer

    -DsocksProxyHost=YourSocksServer -DsocksProxyPort=port

    -Dhttp.proxyHost=WebProxy -Dhttp.proxyPort=Port

This can be done in the application
*if it is done before any network connection are made*:

       System.setProperty("socksProxyHost", "socks.corp.com");

Consult the Java documentation for more details. Searching the web
is also very helpful.


[ARQ documentation index](index.html)
