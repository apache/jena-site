---
title: "Fuseki: Server Information"
---

A Fuseki server keeps detailed statistics for each dataset and each service
of a dataset keeps counters as to the number
of incoming requests, number of successful requests, number of bad requests
(i.e client errors), and number of failing requests (i.e. server errors).

Statistics are available in JSON and in [Prometheus](https://prometheus.io/)
format. The Prometheus data includes both database and JVM metrics.

## Endpoints

The following servers endpoints are available. They are present in Fuseki/UI;
they need to be enabled with [Fuseki/main](fuseki-main.html), either on the
command line or in the server configuration file with a boolean setting.

| Endpoint | Config Property | Usage |
|----------|-----------------|-------|
|`/$/ping`   | `fuseki:pingEP`     | Server liveness endpoint   |
|`/$/stats`  | `fuseki:statsEP`    | JSON format endpoint       |   
|`/$/metrics`| `fuseki:metricsEP`  | Prometheus format endpoint |   

## Ping

The "ping" service can be used to test whether a Fuseki server is running.
Calling this endpoint imposes minimal overhead on the server.  Requests return
the current time as a plain text string so to show the ping is current.

HTTP GET and HTTP POST are supported. The GET request is marked "no-cache".  

## Structure of the Statistics Report

The statistics report shows the endpoints for each dataset with total counts of requests,
good request and bad requests.


## Example

Endpoints with the format "_1" etc are unnamed services of the dataset.

    { 
      "datasets" : {
          "/ds" : {
              "Requests" : 0 ,
              "RequestsGood" : 0 ,
              "RequestsBad" : 0 ,
              "endpoints" : {
                  "data" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "gsp-rw" ,
                      "description" : "Graph Store Protocol"
                    } ,
                  "_1" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "gsp-rw" ,
                      "description" : "Graph Store Protocol"
                    } ,
                  "_2" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "query" ,
                      "description" : "SPARQL Query"
                    } ,
                  "query" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "query" ,
                      "description" : "SPARQL Query"
                    } ,
                  "sparql" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "query" ,
                      "description" : "SPARQL Query"
                    } ,
                  "get" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "gsp-r" ,
                      "description" : "Graph Store Protocol (Read)"
                    } ,
                  "update" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "update" ,
                      "description" : "SPARQL Update"
                    } ,
                  "_3" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "update" ,
                      "description" : "SPARQL Update"
                    } ,
                  "upload" : {
                      "RequestsBad" : 0 ,
                      "Requests" : 0 ,
                      "RequestsGood" : 0 ,
                      "operation" : "upload" ,
                      "description" : "File Upload"
                    }
                }
            }
        }
    }
