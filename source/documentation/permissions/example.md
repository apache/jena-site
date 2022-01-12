---
title: Adding Jena Permissions to Fuseki
---

## Overview

The goal of this document is to add Jena Permissions to a fuseki deployment to restrict access to graph data. This example will take the example application, deploy the data to a fuseki instance and add the Jena Permissions to achieve the same access restrictions that the example application has.

To do this you will need a Fuseki installation, the Permissions Packages and a SecurityEvaluator implementation. For this example we will use the SecurityEvaluator from the permissions-example.

## Set up

This example uses Fuseki 2.3.0 or higher, Permissions 3.1.0 or higher and Apache Commons Collections v4.

Fuseki can be downloaded from:
<https://repository.apache.org/content/repositories/releases/org/apache/jena/apache-jena-fuseki/>

Jena Permissions jars can be downloaded from:
<https://repository.apache.org/content/repositories/releases/org/apache/jena/jena-permissions/>

1. Download and unpack Fuseki. The directory that you unpack Fuseki into will be referred to as the `Fuseki Home` directory for the remainder of this document.

2. Download the permissions jar and the associated permissions-example jar.

3. Copy the permissions jar and the permissions-example jar into the Fuseki Home directory. For the rest of this document the permissions jar will be referred to as `permissions.jar` and the permissions-example.jar as `example.jar`

4. Download the [Apache Commons Collections v4](http://commons.apache.org/proper/commons-collections/download_collections.cgi).
Uncompress the `commons-collections*.jar` into the `Fuseki Home` directory.

5. Add security jars to the startup script/batch file.
    * On \*NIX edit fuseki-server script
        1. Comment out the line that reads `exec java  $JVM_ARGS -jar "$JAR" "$@"`
        2. Uncomment the line that reads `##   APPJAR=MyCode.jar`
        3. Uncomment the line that reads `##   java $JVM_ARGS -cp "$JAR:$APPJAR" org.apache.jena.fuseki.cmd.FusekiCmd "$@"`
        4. change `MyCode.jar` to `permissions.jar:example.jar:commons-collections*.jar`

    * On Windows edit fuseki-server.bat file.
        1. Comment out the line that reads `java -Xmx1200M -jar fuseki-server.jar %*`
        2. Uncomment the line that reads `@REM  java ... -cp fuseki-server.jar;MyCustomCode.jar org.apache.jena.fuseki.cmd.FusekiCmd %*`
        3. Change `MyCustomCode.jar` to `permissions.jar;example.jar;commons-collections*.jar`

6. Run the fuseki-server script or batch file.

7. Stop the server.

8. Extract the example configuration into the newly created `Fuseki Home/run` directory.
    From the example.jar archive:
    * extract `/org/apache/jena/permissions/example/example.ttl` into the `Fuseki Home/run` directory
    * extract `/org/apache/jena/permissions/example/fuseki/config.ttl` into the `Fuseki Home/run` directory
    * extract `/org/apache/jena/permissions/example/fuseki/shiro.ini` into the `Fuseki Home/run` directory

9. Run `fuseki-server –config=run/config.ttl` or `fuseki-server.bat –config=run/config.ttl`

## Review of configuration

At this point the system is configured with the following logins:

<table>
<tr><th>Login</th><th>password</th><th>Access to</th></tr>
<tr><td>admin</td><td>admin</td><td>Everything</td></tr>
<tr><td>alice</td><td>alice</td><td>Only messages to or from alice</td></tr>
<tr><td>bob</td><td>bob</td><td>Only messages to or from bob</td></tr>
<tr><td>chuck</td><td>chuck</td><td>Only messages to or from chuck</td></tr>
<tr><td>darla</td><td>darla</td><td>Only messages to or from darla</td></tr>
</table>

The messages graph is defined in the `run/example.ttl` file.

The `run/shiro.ini` file lists the users and their passwords and configures Fuseki to require authentication to access to the graphs.

The `run/config.ttl` file adds the permissions to the graph as follows by applying the
`org.apache.jena.permissions.example.ShiroExampleEvaluator` security evaluator to the message
graph.

Define all the prefixes.

    @prefix fuseki:  <http://jena.apache.org/fuseki#> .
    @prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix ja:      <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix perm:    <http://apache.org/jena/permissions/Assembler#> .
    @prefix my:     <http://example.org/#> .


Load the SecuredAssembler class from the permissions library and define the perm:Model as a subclass of ja:NamedModel.

    [] ja:loadClass    "org.apache.jena.permissions.SecuredAssembler" .
       perm:Model       rdfs:subClassOf  ja:NamedModel .


Define the base model that contains the unsecured data.  This can be any model type.  For our example we use an in memory model that reads the example.ttl file.

    my:baseModel rdf:type ja:MemoryModel;
        ja:content [ja:externalContent <file:./example.ttl>]
        .


Define the secured model. This is where permissions is applied to the my:baseModel to create a model that has permission restrictions. Note that it is using the security evaluator implementation (sec:evaluatorImpl) called my:secEvaluator which we will define next.

    my:securedModel rdf:type sec:Model ;
        perm:baseModel my:baseModel ;
        ja:modelName "https://example.org/securedModel" ;
        perm:evaluatorImpl my:secEvaluator .

Define the security evaluator. This is where we use the example ShiroExampleEvaluator. For your production environment you will replace "org.apache.jena.security.example.ShiroExampleEvaluator" with your SecurityEvaluator implementation. Note that ShiroExampleEvaluator constructor takes a Model argument. We pass in the unsecured baseModel so that the evaluator can read it unencumbered. Your implementation of SecurityEvaluator may have different parameters to meet your specific needs.

    my:secEvaluator rdf:type perm:Evaluator ;
        perm:args [
            rdf:_1 my:baseModel ;
        ] ;
        perm:evaluatorClass "org.apache.jena.permissions.example.ShiroExampleEvaluator" .


Define the dataset that we will use for in the server.  Note that in the example dataset only contains the single secured model, adding multiple models and missing secured and
unsecured models is supported.

    my:securedDataset rdf:type ja:RDFDataset ;
        ja:defaultGraph my:securedModel .


Define the fuseki:Server.

    my:fuseki rdf:type fuseki:Server ;
        fuseki:services (
            my:service1
        ) .

Define the service for the fuseki:Service. Note that the fuseki:dataset served by this server is the secured dataset defined above.

    my:service1 rdf:type fuseki:Service ;
        rdfs:label                        "My Secured Data Service" ;
        fuseki:name                       "myAppFuseki" ;       # http://host:port/myAppFuseki
        fuseki:serviceQuery               "query" ;    # SPARQL query service
        fuseki:serviceQuery               "sparql" ;   # SPARQL query service
        fuseki:serviceUpdate              "update" ;   # SPARQL query service
        fuseki:serviceReadWriteGraphStore "data" ;     # SPARQL Graph store protocol (read and write)
        # A separate read-only graph store endpoint:
        fuseki:serviceReadGraphStore      "get" ;      # SPARQL Graph store protocol (read only)
        fuseki:dataset                    my:securedDataset ;
    .

## Review of ShiroExampleEvaluator

The ShiroExampleEvaluator uses triple level permissions to limit access to the "messages" in the graph to only those people in the message is address to or from.
It is connected to the Shiro system by the `getPrincipal()` implementation where it simply calls the Shiro SecurityUtils.getSubject() method to return the current 
shiro user.

    /**
     * Return the Shiro subject.  This is the subject that Shiro currently has logged in.
     */
    @Override
    public Object getPrincipal() {
        return SecurityUtils.getSubject();
    }

This example allows any action on a graph as is seen in the `evaluate(Object principal, Action action, Node graphIRI)` and `evaluateAny(Object principal, Set<Action> actions, Node graphIRI)` methods.  This is the first permissions check.  If you wish to restrict users from specific graphs this method should be recoded to perform the check.


	/**
	 * We allow any action on the graph itself, so this is always true.
	 */
	@Override
	public boolean evaluate(Object principal, Action action, Node graphIRI) {
		// we allow any action on a graph.
		return true;
	}
    
    /**
     * As per our design, users can access any graph.  If we were to implement rules that 
     * restricted user access to specific graphs, those checks would be here and we would 
     * return <code>false</code> if they were not allowed to access the graph.  Note that this
     * method is checking to see that the user may perform ANY of the actions in the set on the
     * graph.
     */
    @Override
    public boolean evaluateAny(Object principal, Set<Action> actions, Node graphIRI) {
        return true;
    }

The other overridden methods are implemented using one of three (3) private methods that evaluate if the user should have access to the data based on our security design.
To implement your security design you should understand what each of the methods checks.  See the [SecurityEvaluator](../javadoc/permissions/org/apache/jena/permissions/SecurityEvaluator.html) javadocs and [SecurityEvaluator implementation](./evaluator.html) notes.
