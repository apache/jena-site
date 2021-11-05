---
title: HTTP Authentication in ARQ (Superseded)
---

<i>Documentation for HTTP Authentication (Jena3.1.1 to Jena 4.2.0) using Apache Commons HttpClient.</i>

---

After [Jena 3.1.0](#http-authentication-from-jena-311), Jena exposes the underlying HTTP Commons functionality to support a range of authentication mechanisms as well as [other HTTP configuration][16]. From [Jena 3.0.0 through Jena 3.1.0](#http-authentication-from-jena-300-through-310) there is a Jena-specific framework that provides a uniform mechanism for HTTP authentication. This documentation is therefore divided into two sections. The first explains how to use HTTP Commons code, and the second explains the older Jena-specific functionality.

## HTTP Authentication from Jena 3.1.1

APIs that support authentication typically provide methods for providing an [HttpClient][15] for use with the given instance of that API class. Since it may not always be possible/practical to configure authenticators on a per-request basis the API includes a means to specify a default client that is used when no other client is explicitly specified.  This may be configured via the 
`setDefaultHttpClient(HttpClient httpClient)` method of the [HttpOp][13] class. This allows for static-scoped configuration of HTTP behavior.

### Examples of authentication

This section includes a series of examples showing how to use HTTP Commons classes to perform authenticated work. Most of them take advantage of `HttpOp.setDefaultHttpClient` as described above.

#### Simple authentication using username and password

First we build an authenticating client:

    CredentialsProvider credsProvider = new BasicCredentialsProvider();
    Credentials credentials = new UsernamePasswordCredentials("user", "passwd");
    credsProvider.setCredentials(AuthScope.ANY, credentials);
    HttpClient httpclient = HttpClients.custom()
        .setDefaultCredentialsProvider(credsProvider)
        .build();
    HttpOp.setDefaultHttpClient(httpclient);

Notice that we gave no scope for use with the credentials (`AuthScope.ANY`). We can make further use of that parameter if we want to assign a scope for some credentials:

    CredentialsProvider credsProvider = new BasicCredentialsProvider();
    Credentials unscopedCredentials = new UsernamePasswordCredentials("user", "passwd");
    credsProvider.setCredentials(AuthScope.ANY, unscopedCredentials);
    Credentials scopedCredentials = new UsernamePasswordCredentials("user", "passwd");
    final String host = "http://example.com/sparql";
    final int port = 80;
    final String realm = "aRealm";
    final String schemeName = "DIGEST";
    AuthScope authscope = new AuthScope(host, port, realm, schemeName);
    credsProvider.setCredentials(authscope, scopedCredentials);
    HttpClient httpclient = HttpClients.custom()
        .setDefaultCredentialsProvider(credsProvider)
        .build();
    HttpOp.setDefaultHttpClient(httpclient);
	
#### Authenticating via a form

For this case we introduce an [HttpClientContext][17], which we can use to retrieve the cookie we get from logging into a form. We then use the cookie to authenticate elsewhere.

    // we'll use this context to maintain our HTTP "conversation"
    HttpClientContext httpContext = new HttpClientContext();

    // first we use a method on HttpOp to log in and get our cookie
    Params params = new Params();
    params.addParam("username", "Bob Wu");
    params.addParam("password", "my password");
    HttpOp.execHttpPostForm("http://example.com/loginform", params , null, null, null, httpContext);

    // now our cookie is stored in httpContext
    CookieStore cookieStore = httpContext.getCookieStore();

    // lastly we build a client that uses that cookie
    HttpClient httpclient = HttpClients.custom()
	    .setDefaultCookieStore(cookieStore)
		.build();
    HttpOp.setDefaultHttpClient(httpclient);
	
	// alternatively we could use the context directly
	Query query = ...
	QueryEngineHTTP qEngine = QueryExecutionFactory.createServiceRequest("http:example.com/someSPARQL", query);
	qEngine.setHttpContext(httpContext);
	ResultSet results = qEngine.execSelect();
	

### Using authentication functionality in direct query execution

Jena offers support for [directly creating](sparql-remote.html#from-your-application) SPARQL queries against remote services. To use [QueryExecutionFactory][18] in this case, select the methods (`sparqlService`, `createServiceRequest`) that offer an `HttpClient` parameter and use an authenticating client in that slot. In the case of [QueryEngineHTTP][9], it is possible to use constructors that have a parameter slot for an `HttpClient`, but it is also possible post-construction to use `setClient(HttpClient client)` and `setHttpContext(HttpClientContext context)` (as shown above). These techniques allow control over HTTP behavior when requests are made to remote services.

## HTTP Authentication from Jena 3.0.0 through 3.1.0

APIs that support authentication typically provide two methods for providing authenticators, a `setAuthentication(String username, char[] password)` method
which merely configures a `SimpleAuthenticator`.  There will also be a `setAuthenticator(HttpAuthenticator authenticator)` method
that allows you to configure an arbitrary authenticator.

Authenticators applied this way will only be used for requests by that specific API.  APIs that currently support this are as follows:

  - [QueryEngineHTTP][9] - This is the `QueryExecution` implementation returned by `QueryExecutionFactory.sparqlService()` calls
  - [UpdateProcessRemoteBase][10] - This is the base class of `UpdateProcessor` implementations returned by `UpdateExecutionFactory.createRemote()` and `UpdateExecutionFactory.createRemoteForm()` calls
  - [DatasetGraphAccessorHTTP][11] - This is the `DatasetGraphAccessor` implementation underlying remote dataset accessors.

From 2.11.0 onwards the relevant factory methods include overloads that allow providing a `HttpAuthenticator` at creation time which
avoids the needs to cast and manually set the authenticator afterwards e.g.

    HttpAuthenticator authenticator = new SimpleAuthenticator("user", "password".toCharArray());
    try(QueryExecution qe = QueryExecutionFactory.sparqlService("http://example.org/sparql",
                                                                "SELECT * WHERE { ?s a ?type }", 
                                                                authenticator)) {
        ...
    }

### Authenticators

Authentication mechanisms are provided by [HttpAuthenticator][1] implementations of which a number are provided built into ARQ.

This API provides the authenticator with access to the `HttpClient`, `HttpContext` and target `URI` of the request that is about to be carried 
out.  This allows for authenticators to add credentials to requests on a per-request basis and/or to use different mechanisms and credentials for different services.

#### SimpleAuthenticator

The [simple authenticator][2] is as the name suggests the simplest implementation.  It takes a single set of credentials which is applied to
any service.

Authentication however is not preemptive so unless the remote service sends a HTTP challenge (401 Unauthorized or 407 Proxy Authorization
 Required) then credentials will not actually be submitted.

#### ScopedAuthenticator

The [scoped authenticator][3] is an authenticator which maps credentials to different service URIs.  This allows you to specify different 
credentials for different services as appropriate.  Similarly to the simple authenticator this is not preemptive authentication so credentials are 
not sent unless the service requests them.

Scoping of credentials is not based on exact mapping of the request URI to credentials but rather on a longest match approach.  For example
if you define credentials for `http://example.org` then these are used for any request that requires authentication under that URI 
e.g. `http://example.org/some/path`.  However, if you had also defined credentials for `http://example.org/some/path` then these would be 
used in favor of those for `http://example.org`

#### ServiceAuthenticator

The [service authenticator][4] is an authenticator which uses information encoded in the ARQ context and basically provides access to the 
existing credential provision mechanisms provided for the `SERVICE` clause, see [Basic Federated Query][5] for more information on 
configuration for this.

#### FormsAuthenticator

The [forms authenticator][6] is an authenticator usable with services that require form based logins and use session cookies to verify login state.
This is intended for use with services that don't support HTTP's built-in authentication mechanisms for whatever reason.  One example of this 
are servers secured using Apache HTTP Server [mod_auth_form][7].

This is one of the more complex authenticators to configure because it requires you to know certain details of the form login mechanism of 
the service you are authenticating against.  In the simplest case where a site is using Apache [mod_auth_form][7] in its default configuration you
merely need to know the URL to which login requests should be POSTed and your credentials.  Therefore you can do the following to configure 
an authenticator:

    URI targetService = new URI("http://example.org/sparql");
    FormLogin formLogin = new ApacheModAuthFormLogin("http://example.org/login", "user", "password".toCharArray());
    FormsAuthenticator authenticator = new FormsAuthenticator(targetService, formLogin);

In the above example the service we want to authenticate against is `http://example.org/sparql` and it requires us to first login by POSTing
our credentials to `http://example.org/login`.

However if the service is using a more complicated forms login setup you will additionally need to know what the names of the form fields used 
to submit the username and password.  For example say we were authenticating to a service where the form fields were called **id** and **pwd**
we'd need to configure our authenticator as follows:

    URI targetService = new URI("http://example.org/sparql");
    FormLogin formLogin = new ApacheModAuthFormLogin("http://example.org/login", "id", "pwd", "user", "password".toCharArray());
    FormsAuthenticator authenticator = new FormsAuthenticator(targetService, formLogin);

Note that you can also create a forms authenticator that uses different login forms for different services by creating a `Map<URI, FormLogin>`
that maps each service to an associated form login and passing that to the `FormsAuthenticator` constructor.

Currently forms based login that require more than just a username and password are not supported.

#### PreemptiveBasicAuthenticator

This [authenticator][8] is a decorator over another authenticator that enables preemptive basic authentication, this **only** works for servers 
that support basic authentication and so will cause authentication failures when any other authentication scheme is required.  You should **only**
use this when you know the remote server uses basic authentication.

Preemptive authentication is not enabled by default for two reasons:

 1. It reduces security as it can result in sending credentials to servers that don't actually require them.
 2. It **only** works for basic authentication and not for other HTTP authentication mechanisms e.g. digest authentication

The 2nd point is important to emphasise, this **only** works for servers using Basic authentication.

Also be aware that basic authentication is very insecure since it sends credentials over the wire with only obfuscation for protection.  Therefore
many servers will use more secure schemes like Digest authentication which **cannot** be done preemptively as they require more complex
challenge response sequences.

#### DelegatingAuthenticator

The [delegating authenticator][12] allows for mapping different authenticators to different services, this is useful when you need to mix and 
match the types of authentication needed.

### The Default Authenticator

Since it may not always be possible/practical to configure authenticators on a per-request basis the API includes a means to specify a default 
authenticator that is used when no authenticator is explicitly specified.  This may be configured via the 
`setDefaultAuthenticator(HttpAuthenticator authenticator)` method of the [HttpOp][13] class.

By default there is already a default authenticator configured which is the `ServiceAuthenticator` since this preserves behavioural 
backwards compatibility with prior versions of ARQ.

You can configure the default authenticator to whatever you need so even if you don't directly control the code that is making HTTP requests 
provided that it is using ARQs APIs to make these then authentication will still be applied.

Note that the default authenticator may be disabled by setting it to `null`.

## Other concerns

### Debugging Authentication

ARQ uses [Apache Http Client][14] for all its HTTP operations and this provides detailed logging information that can be used for debugging.  To
see this information you need to configure your logging framework to set the `org.apache.http` package to either `DEBUG` or `TRACE` level.

The `DEBUG` level will give you general diagnostic information about requests and responses while the `TRACE` level will give you detailed 
HTTP traces i.e. allow you to see the exact HTTP requests and responses which can be extremely useful for debugging authentication problems.

### Authenticating to a SPARQL federated service

ARQ allows the user to configure HTTP behavior to use on a per-`SERVICE` basis, including authentication behavior such as is described above. This works via the ARQ context. See [Basic Federated Query][5] for more information on configuring this functionality.

  [1]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/HttpAuthenticator.html
  [2]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/SimpleAuthenticator.html
  [3]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/ScopedAuthenticator.html
  [4]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/ServiceAuthenticator.html
  [5]: service.html
  [6]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/FormsAuthenticator.html
  [7]: https://httpd.apache.org/docs/2.4/mod/mod_auth_form.html
  [8]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/PreemptiveBasicAuthenticator.html
  [9]: /documentation/javadoc/arq/org/apache/jena/sparql/engine/http/QueryEngineHTTP.html
  [10]: /documentation/javadoc/arq/org/apache/jena/sparql/modify/UpdateProcessRemoteBase.html
  [11]: /documentation/javadoc/arq/org/apache/jena/web/DatasetGraphAccessorHTTP.html
  [12]: /documentation/javadoc/arq/org/apache/jena/atlas/web/auth/DelegatingAuthenticator.html
  [13]: /documentation/javadoc/arq/org/apache/jena/riot/web/HttpOp.html
  [14]: http://hc.apache.org
  [15]: https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/client/HttpClient.html
  [16]: https://hc.apache.org/httpcomponents-client-ga/examples.html
  [17]: https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/client/protocol/HttpClientContext.html
  [18]: /documentation/javadoc/arq/org/apache/jena/query/QueryExecutionFactory.html
