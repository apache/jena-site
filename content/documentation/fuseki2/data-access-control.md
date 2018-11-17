## Data Access Control.

Fuseki can provide access control at the level of the server, on datasets,
on endpoints and also at the graph level within a dataset. It also
provides native https to protect data in-flight.

[Fuseki Main](http://jena.apache.org/documentation/fuseki2/fuseki-main.html)
provides some common patterns of authentication.

Fuseki Full (Fuseki with the UI) can be used when
[run in a web application server such as Tomcat](http://jena.apache.org/documentation/fuseki2/fuseki-run.html#fuseki-web-application)
to provide authentication of the user.

Graph level Data Access Control provides control over the visibility of
graphs within a dataset, and including the union graph of a dataset and
the default graph. Currently, Graph level access control only applies to
read-only datasets.

See "[Fuseki Security](fuseki-security)" for configuring security over
the whole of the Fuseki UI.

## Contents

- [HTTPS](#https)
- [Authentication](#authentication)
- [Access control lists](#acl)
- [Graph level access control](#graph-acl)
- [Configuring Jetty directly](#jetty-configuration)
- [Confuguring Fuseki in Java code](#embedded-setup)

## HTTPS

This section applies to Fuseki Main.
Https support is configured from the fuseki server command line.

| Argument |    |  |
|----------|----|--|
| `--https=<i>SETUP</i>`         | Name of file for certificate details.   | |
| `--httpsPort=<i>PORT</i>`     | The port for https   | Default: 3043 |

The `--https` argument names a file in JSON which includes the name of
the certificate file and password for the certificate.

    { "cert": <i>KEYSTORE</i> , "passwd": <i>SECRET</i> } 

This file must be protected by file access settings so that it can only
be read by the userid running the server.  One way is to put the
keystore certificate and the certificate details file in the same
directory, then making the directory secure.

### Self-signed certificates

A self-signed certificate provides an encrypted link to the server and
stops some attacks. What it does not do is gaurantee the identity of the
host name of the Fuseki server to the client system.

A self-signed certificate can be generated with:

    keytool -keystore keystore -alias jetty -genkey -keyalg RSA

For information on creating a certificate, see the Jetty documentation
for [generating certificates](http://www.eclipse.org/jetty/documentation/current/configuring-ssl.html#generating-key-pairs-and-certificates).

## Authentication

This section applies to Fuskei Main.

[Authentication](https://en.wikipedia.org/wiki/Authentication),
is establishing the identity of the principal (user or program) accessing the
system. Fuseki Main provides users/password setup and HTTP authentication,
[digest](https://en.wikipedia.org/wiki/Digest_access_authentication) or 
[basic](https://en.wikipedia.org/wiki/Basic_access_authentication)).

These should be [used with HTTPS](#https).

| Argument         |  |  |
| `--passwd=FILE`  | Password file | |
| `--auth=`        | "basic" or "digest"   | Default is "digest" |

These can also be given in the server configuration file:

    <#server> rdf:type fuseki:Server ;
        fuseki:passwd  "<i>password_file</i>" ;
        fuseki:auth    "<i>digest</i>" ;
        ...

The format of the password file is:

    username: password

and passwords can be stored in hash or obfuscated form. 

[Password file format](http://www.eclipse.org/jetty/documentation/current/configuring-security.html#hash-login-service).

If different authentication is required, the full facilities of 
[Eclipse Jetty configuration](http://www.eclipse.org/jetty/documentation/current/configuring-security.html)
are available.

### Using `curl`

See the [curl documentation](https://curl.haxx.se/docs/manpage.html) for full
details.  This section is a breif summary of some relevant options:

| curl argument  | Value |--|
|----------------|-------|--|
| `-n`, `--netrc` | |  Take passwords from `.netrc` (`_netrc` on windows) |
| `--user=`       | `user:password` | Set the uses and password (visible to all on the local machine) |
| `--anyauth`     |  | Use server nominated authentication scheme            |
| `--basic`       |  | Use HTTP basic auth                                   |
| `--digest`      |  | Use HTTP digest auth                                  |
| `-k`, `--insecure` |  | Don't check HTTPS certifcate. This allows for self-signed or expired, certificates or ones with the wrong host name. |

### Using `wget`

See the [wget documentation](https://www.gnu.org/software/wget/manual/wget.html) for full
details.  This section is a breif summary of some relevant options:

| wget argument  | Value |--|
|----------------|-------|--|
| --http-user | user | Set the user.
| --http-password | password |  Set the password (visible to all on the local machine) |
|   | | `wget` uses users/password from `.wgetrc` or `.netrc` by default. |
| `--no-check-certificate` | |  Don't check HTTPS certifcate. This allows for self-signed or expired, certificates or ones with the wrong host name. |

## Access Control Lists {#acl}

ACLs can be applied to the server as a whole, to a dataset, to endpoints, and to
graphs within a dataset. This section covers server, dataset and endpoint access control
lists. Graph-level access control is [covered below](#graph-acl).

Access control lists (ACL) as part of the server configuration file.

    fuseki --conf assembler.ttl ...

ACLs are provided by the `ja:allowedUsers` property 

### Format of `ja:allowedUsers`

The list of users allowed access can be an RDF list or repeated use of
the property or a mixture. The different seting are combined into one ACL.

     fuseki:allowedUsers    "user1", "user2", "user3";
     fuseki:allowedUsers    "user3";
     fuseki:allowedUsers    ( "user1" "user2" "user3") ;

There is a special user name "*" which means "any authenticated user".

    fuseki:allowedUsers  "*" ;

### Server Level ACLs {#server-acl}

    <#server> rdf:type fuseki:Server ;
       <i>fuseki:allowedUsers    "user1", "user2", "user3";</i>
       ...
       fuseki:services ( ... ) ;
       ...
       .

A useful pattern is:

    <#server> rdf:type fuseki:Server ;
       <i>fuseki:allowedUsers    "*";</i>
       ...
       fuseki:services ( ... ) ;
       ...
       .

whcih requires all access to authenticated and the allowed users are
those in the password file.

### Dataset Level {#dataset-acl}

When there is an access control list on the `fuseki:Service`, it applies
to all requests to the endpoints of the server. 

Any server-wide "allowedUsers" configuration also applies and both
levels must allow the user access.

    <#service_auth> rdf:type fuseki:Service ;
        rdfs:label                      "ACL controlled dataset" ;
        fuseki:name                     "db-acl" ;
    
        <i>fuseki:allowedUsers             "user1", "user3";</i>
    
        ## Chocie of operations.
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceReadGraphStore    "get" ;
    
        fuseki:serviceUpdate            "update" ;
        fuseki:serviceUpload            "upload" ;
        fuseki:serviceReadWriteGraphStore "data" ;
    
        fuseki:dataset                  <#base_dataset>;
        .

### Endpoint Level {#endpoint-acl}

An access control list can be applied to an individual endpoint.
Again, any  other "allowedUsers" configuration, service-wide, or
server-wide) also applies.

        fuseki:serviceQuery  [ fuseki:name "query ;
                               fuseki:allowedUsers "user1", "user2"] ;
        fuseki:serviceUpdate [ fuseki:name "update ;
                               fuseki:allowedUsers "user1"] ;

Only <em>user1</em> can use SPARQL udpate both <em>user1</em> and
<em>user2</em> can use SPARQl query.

## Graph Level {#graph-acl}

Graph level access control is defined using a specific dataset
implmentation for the service.

    <#access_dataset>  rdf:type access:AccessControlledDataset ;
        access:registry   ... ;
        access:dataset    ... ;
        .

ACLs are defined in a [Graph Security Registry](#graph-security-registry) which lists the
users and graph URIs.

    <#service_tdb2> rdf:type fuseki:Service ;
        rdfs:label                      "Graph-level access controlled dataset" ;
        fuseki:name                     "db-graph-acl" ;
        ## Read-only operations.
        fuseki:serviceQuery             "query" ;
        fuseki:serviceQuery             "sparql" ;
        fuseki:serviceReadGraphStore    "get" ;
        fuseki:dataset                  <#access_dataset>;
        .

    <#access_dataset>  rdf:type access:AccessControlledDataset ;
        access:registry   <#securityRegistry> ;
        access:dataset    <#tdb_dataset_shared> ;
        .

    <#tdb_dataset_shared> rdf:type tdb:DatasetTDB ;
        . . .

All dataset stroage types are supported.

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
the deployed server can be run using a Jetty comnfiguration.

Server command line: <tt>--jetty=<i>jetty.xml</i></tt>.

[Documentation for
`jetty.xml`](https://www.eclipse.org/jetty/documentation/current/jetty-xml-config.html).
