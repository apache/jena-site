---
title: Data Access Control for Fuseki
---

Fuseki can provide access control at the level on the server, on datasets,
on endpoints and also on specific graphs within a dataset. It also
provides native https to protect data in-flight.

[Fuseki Main](/documentation/fuseki2/fuseki-main.html)
provides some common patterns of authentication and also 
[Graph level Data Access Control](#graph-acl) to provide control over the visibility of
graphs within a dataset, including the union graph of a dataset and
the default graph. Currently, Graph level access control only applies to
read-only datasets.

Fuseki Full (Fuseki with the UI) can be used when [run in a web application
server such as
Tomcat](/documentation/fuseki2/fuseki-webapp.html#fuseki-web-application) to
provide authentication of the user.  See "[Fuseki Security](fuseki-security)"
for configuring security over the whole of the Fuseki UI.

This page applies to Fuseki Main.

## Contents

- [HTTPS](#https)
- [Authentication](#authentication)
    - [Using curl](#using-curl)
    - [Using wget](#using-wget)
- [Access control lists](#acl)
    - [Format of ja:allowedUsers](#alloweduser)
    - [Server Level ACLs](#server-acl)
    - [Dataset Level ACLs](#dataset-acl)
    - [Endpoint Level ACLs](#endpoint-acl)
- [Graph Access Control Lists](#graph-acl)
    - [Graph Security Registry](#graph-security-registry)
- [Configuring Jetty directly](#jetty-configuration)

## HTTPS

HTTPS support is configured from the fuseki server command line.

| Server Argument |    |  |
| ----------------|----|--|
| <tt>--https=<i>SETUP</i></tt>       | Name of file for certificate details.   | |
| <tt>--httpsPort=<i>PORT</i></tt>    | The port for https   | Default: 3043 |

The `--https` argument names a file in JSON which includes the name of
the certificate file and password for the certificate.

### HTTPS certificate details file {#https-details}

The file is a simple JSON file:
<pre>
    { "cert": <i>KEYSTORE</i> , "passwd": <i>SECRET</i> }
</pre>

This file must be protected by file access settings so that it can only
be read by the userid running the server.  One way is to put the
keystore certificate and the certificate details file in the same
directory, then make the directory secure.

### Self-signed certificates

A self-signed certificate provides an encrypted link to the server and
stops some attacks. What it does not do is guarantee the identity of the
host name of the Fuseki server to the client system. A signed certificate provides that through the chain of trust. A self-signed certificate does protect data in HTTP responses.

A self-signed certificate can be generated with:

<pre>
    keytool -keystore <i>keystore</i> -alias <i>jetty</i> -genkey -keyalg RSA
</pre>

For information on creating a certificate, see the Jetty documentation
for [generating certificates](http://www.eclipse.org/jetty/documentation/current/configuring-ssl.html#generating-key-pairs-and-certificates).

## Authentication

[Authentication](https://en.wikipedia.org/wiki/Authentication),
is establishing the identity of the principal (user or program) accessing the
system. Fuseki Main provides users/password setup and HTTP authentication,
[digest](https://en.wikipedia.org/wiki/Digest_access_authentication) or
[basic](https://en.wikipedia.org/wiki/Basic_access_authentication)).

These should be [used with HTTPS](#https).

| Server Argument  |     |     |
|------------------|-----|-----|
| <tt>--passwd=<i>FILE</i></tt>  | Password file | |
| <tt>--auth=</tt>               | "basic" or "digest"   | Default is "digest" |

These can also be given in the server configuration file:

<pre>
    &lt;#server&gt; rdf:type fuseki:Server ;
        fuseki:passwd  "<i>password_file</i>" ;
        fuseki:auth    "<i>digest</i>" ;
        ...
</pre>

The format of the password file is:

    username: password

and passwords can be stored in hash or obfuscated form.

Documentation of the [Eclipse Jetty Password file format](http://www.eclipse.org/jetty/documentation/current/configuring-security.html#hash-login-service).

If different authentication is required, the full facilities of
[Eclipse Jetty configuration](http://www.eclipse.org/jetty/documentation/current/configuring-security.html)
are available - see [the section below](#jetty-configuration).

### Using `curl`

See the [curl documentation](https://curl.haxx.se/docs/manpage.html) for full
details.  This section is a brief summary of some relevant options:

| curl argument  | Value |--|
|----------------|-------|--|
| `-n`, `--netrc` | |  Take passwords from `.netrc` (`_netrc` on windows) |
| `--user=`       | `user:password` | Set the user and password (visible to all on the local machine) |
| `--anyauth`     |  | Use server nominated authentication scheme            |
| `--basic`       |  | Use HTTP basic auth                                   |
| `--digest`      |  | Use HTTP digest auth                                  |
| `-k`, `--insecure` |  | Don't check HTTPS certificate.<br/> This allows for self-signed or expired certificates, or ones with the wrong host name. |

### Using `wget`

See the [wget documentation](https://www.gnu.org/software/wget/manual/wget.html) for full
details.  This section is a brief summary of some relevant options:

| wget argument  | Value |--|
|----------------|-------|--|
| `--http-user`     | user name | Set the user. |
| `--http-password` | password  |  Set the password (visible to all on the local machine) |
|                   |           |  `wget` uses users/password from `.wgetrc` or `.netrc` by default. |
| `--no-check-certificate` |    |  Don't check HTTPS certificate.<br/> This allows for self-signed or expired, certificates or ones with the wrong host name. |

## Access Control Lists {#acl}

ACLs can be applied to the server as a whole, to a dataset, to endpoints, and to
graphs within a dataset. This section covers server, dataset and endpoint access control
lists. Graph-level access control is [covered below](#graph-acl).

Access control lists (ACL) as part of the server configuration file.

<pre>
    fuseki --conf <i>configFile.ttl</i>
</pre>

ACLs are provided by the `ja:allowedUsers` property

### Format of `ja:allowedUsers` {#alloweduser}

The list of users allowed access can be an RDF list or repeated use of
the property or a mixture. The different settings are combined into one ACL.

     fuseki:allowedUsers    "user1", "user2", "user3";
     fuseki:allowedUsers    "user3";
     fuseki:allowedUsers    ( "user1" "user2" "user3") ;

There is a special user name "*" which means "any authenticated user".

    fuseki:allowedUsers  "*" ;

### Server Level ACLs {#server-acl}

<pre>
    &lt;#server&gt; rdf:type fuseki:Server ;
       <b>fuseki:allowedUsers    "user1", "user2", "user3";</b>
       ...
       fuseki:services ( ... ) ;
       ...
       .
</pre>

A useful pattern is:

<pre>
    &lt;#server&gt; rdf:type fuseki:Server ;
       <b>fuseki:allowedUsers    "*";</b>
       ...
       fuseki:services ( ... ) ;
       ...
       .
</pre>

which requires all access to to be authenticated and the allowed users are
those in the password file.

### Dataset Level ACLs{#dataset-acl}

When there is an access control list on the `fuseki:Service`, it applies
to all requests to the endpoints of the dataset.

Any server-wide "allowedUsers" configuration also applies and both
levels must allow the user access.

<pre>
    &lt;#service_auth&gt; rdf:type fuseki:Service ;
        rdfs:label                      "ACL controlled dataset" ;
        fuseki:name                     "db-acl" ;

        <b>fuseki:allowedUsers             "user1", "user3";</b>

        ## Choice of operations.

        fuseki:endpoint [ 
            fuseki:operation fuseki:query ;
            fuseki:name "sparql" 
        ];
        fuseki:endpoint [
            fuseki:operation fuseki:update ;
            fuseki:name "sparql"
        ] ;
        fuseki:endpoint [
            fuseki:operation fuseki:gsp-r ;
            fuseki:name "get"
        ] ;
        fuseki:dataset                  &lt;#base_dataset&gt;;
        .
</pre>

### Endpoint Level ACLs {#endpoint-acl}

An access control list can be applied to an individual endpoint.
Again, any  other "allowedUsers" configuration, service-wide, or
server-wide) also applies.

         fuseki:endpoint [ 
            fuseki:operation fuseki:query ;
            fuseki:name "query" ;
            fuseki:allowedUsers "user1", "user2" ;
        ];
        fuseki:endpoint [
            fuseki:operation fuseki:update ;
            fuseki:name "update" ;
            fuseki:allowedUsers "user1"
        ] ;

Only <em>user1</em> can use SPARQL update; both <em>user1</em> and
<em>user2</em> can use SPARQL query.

## Graph Access Control Lists {#graph-acl}

Graph level access control is defined using a specific dataset
implementation for the service.

    <#access_dataset>  rdf:type access:AccessControlledDataset ;
        access:registry   ... ;
        access:dataset    ... ;
        .

Graph ACLs are defined in a [Graph Security Registry](#graph-security-registry) which lists the users and graph URIs.

<pre>
    &lt;#service_tdb2&gt; rdf:type fuseki:Service ;
        rdfs:label                      "Graph-level access controlled dataset" ;
        fuseki:name                     "db-graph-acl" ;
        ## Read-only operations on the dataset URL.
        fuseki:endpoint [ fuseki:operation fuseki:query ] ;
        fuseki:endpoint [ fuseki:operation fuseki:gsp_r ] ;
        fuseki:dataset                  <b>&lt;#access_dataset&gt;</b> ;
        .

    # Define access on the dataset.
    &lt;#access_dataset&gt;  rdf:type access:AccessControlledDataset ;
        access:registry   &lt;#securityRegistry&gt; ;
        access:dataset    &lt;#tdb_dataset_shared&gt; ;
        .

    &lt;#securityRegistry&gt;rdf:type access:SecurityRegistry ;
       . . .

    &lt;#tdb_dataset_shared&gt; rdf:type tdb:DatasetTDB ;
        . . .
</pre>

All dataset storage types are supported. TDB1 and TDB2 have special implementations for handling graph access control.

### Graph Security Registry {#graph-security-registry}

The Graph Security Registry is defined as a number of access entries in
either a list format "(user graph1 graph2 ...)" or as RDF properties
`access:user` and `access:graphs`. The property `access:graphs` has graph URI or a
list of URIs as its object.

    <#securityRegistry> rdf:type access:SecurityRegistry ;
        access:entry ( "user1" <http://host/graphname1>  <http://host/graphname2> ) ;
        access:entry ( "user1" <http://host/graphname3> ) ;

        access:entry ( "user1" <urn:x-arq:DefaultGraph> ) ;

        access:entry ( "user2" <http://host/graphname9> ) ;
        access:entry [ access:user "user3" ; access:graphs ( <http://host/graphname3> <http://host/graphname4> ) ] ;
        access:entry [ access:user "user3" ; access:graphs <http://host/graphname5> ] ;
        access:entry [ access:user "userZ" ; access:graphs <http://host/graphnameZ> ] ;
        .

## Jetty Configuration {#jetty-configuration}

For authentication configuration not covered by Fuseki configuration,
the deployed server can be run using a Jetty configuration.

Server command line: <tt>--jetty=<i>jetty.xml</i></tt>.

[Documentation for `jetty.xml`](https://www.eclipse.org/jetty/documentation/current/jetty-xml-config.html).
