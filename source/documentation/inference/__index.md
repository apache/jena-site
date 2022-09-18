---
title: "Reasoners and rule engines: Jena inference support"
slug: index
---

<p>This section of the documentation describes the current support for inference
  available within Jena. It includes an outline of the general inference API,
  together with details of the specific rule engines and configurations for RDFS
  and OWL inference supplied with Jena.</p>

<p> Not all of the fine details of the API are covered here: refer to the Jena
  <a href="/documentation/javadoc/jena/">Javadoc</a> to get the full details of the capabilities
  of the API. </p>

<p> Note that this is a preliminary version of this document, some errors or inconsistencies
  are possible, feedback to the 
  <a href="/help_and_support/index.html">mailing lists</a>
  is welcomed. </p>

## Index {#index}
<ol>
  <li><a href="#overview">Overview of inference support</a> </li>
  <li><a href="#api">The inference API</a></li>
  <li><a href="#rdfs">The RDFS reasoner</a></li>
  <li><a href="#owl">The OWL reasoner</a></li>
  <li><a href="#transitive">The transitive reasoner</a></li>
  <li><a href="#rules">The general purpose rule engine</a></li>
  <li><a href="#extensions">Extending the inference support</a></li>
  <li><a href="#futures">Futures</a></li>
</ol>

## Overview of inference support {#overview}
<p>The Jena inference subsystem is designed to allow a range of inference engines
  or reasoners to be plugged into Jena. Such engines are used to derive additional
  RDF assertions which are entailed from some base RDF together with any optional
  ontology information and the axioms and rules associated with the reasoner.
  The primary use of this mechanism is to support the use of languages such as
  RDFS and OWL which allow additional facts to be inferred from instance data
  and class descriptions. However, the machinery is designed to be quite general
  and, in particular, it includes a generic rule engine that can be used for many
  RDF processing or transformation tasks.</p>
<p>We will try to use the term <em>inference</em> to refer to the abstract process
  of deriving additional information and the term <em>reasoner</em> to refer to
  a specific code object that performs this task. Such usage is arbitrary and
  if we slip into using equivalent terms like <em>reasoning</em> and <em>inference
  engine</em> please forgive us. </p>
<p>The overall structure of the inference machinery is illustrated below. </p>
<p class="centered"><img src="reasoner-overview.png" width="544" height="305" alt="Overall structure of inference machinery"></p>
<p>Applications normally access the inference machinery by using the <a href="/documentation/javadoc/jena/org/apache/jena/rdf/model/ModelFactory.html"><code>ModelFactory</code></a>
  to associate a data set with some reasoner to create a new Model. Queries to
  the created model will return not only those statements that were present in
  the original data but also additional statements than can be derived from the
  data using the rules or other inference mechanisms implemented by the reasoner.</p>
<p>As illustrated the inference machinery is actually implemented at the level
  of the Graph SPI, so that any of the different Model interfaces can be constructed
  around an inference Graph. In particular, the <a href="../ontology/index.html">Ontology
  API</a> provides convenient ways to link appropriate reasoners into the <code>OntModel</code>s
  that it constructs. As part of the general RDF API we also provide an <a href="/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/InfModel.html"><code>InfModel</code></a>,
  this is an extension to the normal <code>Model</code> interface that provides
  additional control and access to an underlying inference graph. </p>
<p>The reasoner API supports the notion of specializing a reasoner by binding
  it to a set of schema or ontology data using the <code>bindSchema</code> call.
  The specialized reasoner can then be attached to different sets of instance
  data using <code>bind</code> calls. In situations where the same schema information
  is to be used multiple times with different sets of instance data then this
  technique allows for some reuse of inferences across the different uses of the
  schema. In RDF there is no strong separation between schema (aka Ontology AKA
  tbox) data and instance (AKA abox) data and so any data, whether class or instance
  related, can be included in either the <code>bind</code> or <code>bindSchema</code>
  calls - the names are suggestive rather than restrictive.</p>
<p>To keep the design as open ended as possible Jena also includes a <code>ReasonerRegistry</code>.
  This is a static class though which the set of reasoners currently available
  can be examined. It is possible to register new reasoner types and to dynamically
  search for reasoners of a given type. The <code>ReasonerRegistry</code> also
  provides convenient access to prebuilt instances of the main supplied reasoners.</p>

### Available reasoners
<p>Included in the Jena distribution are a number of predefined reasoners:</p>
<ol>
  <li>Transitive reasoner: Provides support for storing and traversing class and property lattices.
    This implements just the <i>transitive</i> and <i>reflexive</i> properties
    of <code>rdfs:subPropertyOf</code> and <code>rdfs:subClassOf</code>.</li>

  <li>RDFS rule reasoner: Implements a configurable subset of the RDFS entailments.</li>

  <li>OWL, OWL Mini, OWL Micro Reasoners: 
  A set of useful but incomplete implementation of the OWL/Lite subset of the OWL/Full
    language. </li>

  <li>Generic rule reasoner: A rule based reasoner that supports user defined rules. Forward chaining,
    tabled backward chaining and hybrid execution strategies are supported.</li>
</ol>

<p>[<a href="#index">Index</a>]</p>

## The Inference API {#api}
<ol>
  <li><a href="#reasonerAPI">Generic reasoner API</a></li>
  <li><a href="#generalExamples">Small examples</a></li>
  <li><a href="#operationsOnInferenceModels">Operations on inference models</a><br>
    - <a href="#validation">Validation</a><br>
    - <a href="#extendedListStatements">Extended list statements</a><br>
    - <a href="#directRelations">Direct and indirect relations</a><br>
    - <a href="#derivations">Derivations</a><br>
    - <a href="#rawAccess">Accessing raw data and deductions</a><br>
    - <a href="#processingControl">Processing control</a><br>
    - <a href="#tracing">Tracing</a> <br>
  </li>
</ol>

### Generic reasoner API {#reasonerAPI}

#### Finding a reasoner
<p>For each type of reasoner there is a factory class (which conforms to the interface
  <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/ReasonerFactory.html">ReasonerFactory</a></code>)
  an instance of which can be used to create instances of the associated
  <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/Reasoner.html">Reasoner</a></code>.
  The factory instances can be located by going directly to a known factory class
  and using the static <code>theInstance</code>() method or by retrieval from
  a global <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/ReasonerRegistry.html">ReasonerRegistry</a></code>
  which stores factory instances indexed by URI assigned to the reasoner. </p>
<p>In addition, there are convenience methods on the <code>ReasonerRegistry</code>
  for locating a prebuilt instance of each of the main reasoners (<code>getTransitiveReasoner</code>,
  <code>getRDFSReasoner</code>, <code>getRDFSSimpleReasoner</code>, <code>getOWLReasoner</code>, <code>getOWLMiniReasoner</code>, <code>getOWLMicroReasoner</code>).</p>
<p>Note that the factory objects for constructing reasoners are just there to
  simplify the design and extension of the registry service. Once you have a reasoner
  instance, the same instance can reused multiple times by binding it to different
  datasets, without risk of interference - there is no need to create a new reasoner
  instance each time.</p>
<p>If working with the <a href="../ontology/index.html">Ontology API</a> it is
  not always necessary to explicitly locate a reasoner. The prebuilt instances
  of OntModelSpec provide easy access to the appropriate reasoners to use for
  different Ontology configurations.</p>
<p>Similarly, if all you want is a plain RDF Model with RDFS inference included
  then the convenience methods <code>ModelFactory.createRDFSModel</code> can be
  used. </p>

#### Configuring a reasoner
<p>The behaviour of many of the reasoners can be configured. To allow arbitrary
  configuration information to be passed to reasoners we use RDF to encode the
  configuration details. The <code>ReasonerFactory.create</code> method can be
  passed a Jena <code>Resource</code> object, the properties of that object will
  be used to configure the created reasoner.</p>
<p>To simplify the code required for simple cases we also provide a direct Java
  method to set a single configuration parameter, <code>Reasoner.setParameter</code>.
  The parameter being set is identified by the corresponding configuration property.</p>
<p>For the built in reasoners the available configuration parameters are described
  below and are predefined in the <code><a href="/documentation/javadoc/jena/org/apache/jena/vocabulary/ReasonerVocabulary.html">ReasonerVocabulary</a></code>
  class.</p>
<p>The parameter value can normally be a String or a structured value. For example,
  to set a boolean value one can use the strings &quot;true&quot; or &quot;false&quot;,
  or in Java use a Boolean object or in RDF use an instance of xsd:Boolean</p>

#### Applying a reasoner to data
<p>Once you have an instance of a reasoner it can then be attached to a set of
  RDF data to create an inference model. This can either be done by putting all
  the RDF data into one Model or by separating into two components - schema and
  instance data. For some external reasoners a hard separation may be required.
  For all of the built in reasoners the separation is arbitrary. The prime value
  of this separation is to allow some deductions from one set of data (typically
  some schema definitions) to be efficiently applied to several subsidiary sets
  of data (typically sets of instance data).</p>
<p>If you want to specialize the reasoner this way, by partially-applying it to
  a set schema data, use the <code>Reasoner.bindSchema</code> method which returns
  a new, specialized, reasoner.</p>
<p>To bind the reasoner to the final data set to create an inference model see
  the <a href="/documentation/javadoc/jena/org/apache/jena/rdf/model/ModelFactory.html"><code>ModelFactory</code></a>
  methods, particularly <code>ModelFactory.createInfModel</code>. </p>

#### Accessing inferences
<p>Finally, having created a inference model then any API operations which access
  RDF statements will be able to access additional statements which are entailed
  from the bound data by means of the reasoner. Depending on the reasoner these
  additional <i>virtual</i> statements may all be precomputed the first time the
  model is touched, may be dynamically recomputed each time or may be computed
  on-demand but cached.</p>

#### Reasoner description
<p>The reasoners can be described using RDF metadata which can be searched to
  locate reasoners with appropriate properties. The calls <code>Reasoner.getCapabilities</code>
  and <code>Reasoner.supportsProperty</code> are used to access this descriptive
  metadata.</p>
<p>[<a href="#api">API Index</a>] [<a href="#index">Main Index</a>]</p>

### Some small examples {#generalExamples}
<p>These initial examples are not designed to illustrate the power of the reasoners
  but to illustrate the code required to set one up.</p>
<p>Let us first create a Jena model containing the statements that some property
  &quot;p&quot; is a subproperty of another property &quot;q&quot; and that we
  have a resource &quot;a&quot; with value &quot;foo&quot; for &quot;p&quot;.
  This could be done by writing an RDF/XML or N3 file and reading that in but
  we have chosen to use the RDF API:</p>

    String NS = "urn:x-hp-jena:eg/";

    // Build a trivial example data set
    Model rdfsExample = ModelFactory.createDefaultModel();
    Property p = rdfsExample.createProperty(NS, "p");
    Property q = rdfsExample.createProperty(NS, "q");
    rdfsExample.add(p, RDFS.subPropertyOf, q);
    rdfsExample.createResource(NS+"a").addProperty(p, "foo");

<p>Now we can create an inference model which performs RDFS inference over this
  data by using:</p>

    InfModel inf = ModelFactory.createRDFSModel(rdfsExample);  // [1]

<p>We can then check that resulting model shows that &quot;a&quot; also has property
  &quot;q&quot; of value &quot;foo&quot; by virtue of the subPropertyOf entailment:</p>

    Resource a = inf.getResource(NS+"a");
    System.out.println("Statement: " + a.getProperty(q));

<p>Which prints the output:</p>
<pre>   <i> Statement: [urn:x-hp-jena:eg/a, urn:x-hp-jena:eg/q, Literal&lt;foo&gt;]</i>
</pre>

<p>Alternatively we could have created an empty inference model and then added
  in the statements directly to that model.</p>
<p>If we wanted to use a different reasoner which is not available as a convenience
  method or wanted to configure one we would change line [1]. For example, to
  create the same set up manually we could replace \[1\] by:</p>

    Reasoner reasoner = ReasonerRegistry.getRDFSReasoner();
    InfModel inf = ModelFactory.createInfModel(reasoner, rdfsExample);

<p>or even more manually by</p>

    Reasoner reasoner = RDFSRuleReasonerFactory.theInstance().create(null);
    InfModel inf = ModelFactory.createInfModel(reasoner, rdfsExample);

<p>The purpose of creating a new reasoner instance like this variant would be
  to enable configuration parameters to be set. For example, if we were to listStatements
  on inf Model we would see that it also &quot;includes&quot; all the RDFS axioms,
  of which there are quite a lot. It is sometimes useful to suppress these and
  only see the &quot;interesting&quot; entailments. This can be done by setting
  the processing level parameter by creating a description of a new reasoner configuration
  and passing that to the factory method:</p>

    Resource config = ModelFactory.createDefaultModel()
                                  .createResource()
                                  .addProperty(ReasonerVocabulary.PROPsetRDFSLevel, "simple");
    Reasoner reasoner = RDFSRuleReasonerFactory.theInstance().create(config);
    InfModel inf = ModelFactory.createInfModel(reasoner, rdfsExample);

<p>This is a rather long winded way of setting a single parameter, though it can
  be useful in the cases where you want to store this sort of configuration information
  in a separate (RDF) configuration file. For hardwired cases the following alternative
  is often simpler:</p>

    Reasoner reasoner = RDFSRuleReasonerFactory.theInstance()Create(null);
    reasoner.setParameter(ReasonerVocabulary.PROPsetRDFSLevel,
                          ReasonerVocabulary.RDFS_SIMPLE);
    InfModel inf = ModelFactory.createInfModel(reasoner, rdfsExample);

<p>Finally, supposing you have a more complex set of schema information, defined
  in a Model called <i>schema,</i> and you want to apply this schema to several
  sets of instance data without redoing too many of the same intermediate deductions.
  This can be done by using the SPI level methods: </p>

    Reasoner boundReasoner = reasoner.bindSchema(schema);
    InfModel inf = ModelFactory.createInfModel(boundReasoner, data);

<p>This creates a new reasoner, independent from the original, which contains
  the schema data. Any queries to an InfModel created using the boundReasoner
  will see the schema statements, the data statements and any statements entailed
  from the combination of the two. Any updates to the InfModel will be reflected
  in updates to the underlying data model - the schema model will not be affected.</p>
<p>[<a href="#api">API Index</a>] [<a href="#index">Main Index</a>]</p>

### Operations on inference models {#operationsOnInferenceModels}
<p>For many applications one simply creates a model incorporating some inference
  step, using the <code>ModelFactory</code> methods, and then just works within
  the standard Jena Model API to access the entailed statements. However, sometimes
  it is necessary to gain more control over the processing or to access additional
  reasoner features not available as <i>virtual</i> triples.</p>

#### Validation {#validation}
<p>The most common reasoner operation which can't be exposed through additional
  triples in the inference model is that of validation. Typically the ontology
  languages used with the semantic web allow constraints to be expressed, the
  validation interface is used to detect when such constraints are violated by
  some data set. </p>
<p>A simple but typical example is that of datatype ranges in RDFS. RDFS allows
  us to specify the range of a property as lying within the value space of some
  datatype. If an RDF statement asserts an object value for that property which
  lies outside the given value space there is an inconsistency.</p>
<p>To test for inconsistencies with a data set using a reasoner we use the <code>InfModel.validate()</code>
  interface. This performs a global check across the schema and instance data
  looking for inconsistencies. The result is a <code>ValidityReport</code> object
  which comprises a simple pass/fail flag (<code>ValidityReport.isValid()</code>)
  together with a list of specific reports (instances of the <code>ValidityReport.Report</code>
  interface) which detail any detected inconsistencies. At a minimum the individual
  reports should be printable descriptions of the problem but they can also contain
  an arbitrary reasoner-specific object which can be used to pass additional information
  which can be used for programmatic handling of the violations.</p>
<p>For example, to check a data set and list any problems one could do something
  like:</p>

    Model data = RDFDataMgr.loadModel(fname);
    InfModel infmodel = ModelFactory.createRDFSModel(data);
    ValidityReport validity = infmodel.validate();
    if (validity.isValid()) {
        System.out.println("OK");
    } else {
        System.out.println("Conflicts");
        for (Iterator i = validity.getReports(); i.hasNext(); ) {
            System.out.println(" - " + i.next());
        }
    }

<p>The file <code>testing/reasoners/rdfs/dttest2.nt</code> declares a property
  <code>bar</code> with range <code>xsd:integer</code> and attaches a <code>bar</code>
  value to some resource with the value <code>&quot;25.5&quot;^^xsd:decimal</code>.
  If we run the above sample code on this file we see:</p>
<blockquote>
  <p><i>Conflicts <br>
    - Error (dtRange): Property http://www.hpl.hp.com/semweb/2003/eg#bar has a
    typed range Datatype[http://www.w3.org/2001/XMLSchema#integer -&gt; class java.math.BigInteger]that
    is not compatible with 25.5:http://www.w3.org/2001/XMLSchema#decimal </i></p>
</blockquote>
<p>Whereas the file <code>testing/reasoners/rdfs/dttest3.nt</code> uses the value
  &quot;25&quot;^^xsd:decimal instead, which is a valid integer and so passes.
</p>
<p>Note that the individual validation records can include warnings as well as
  errors. A warning does not affect the overall <code>isValid()</code> status
  but may indicate some issue the application may wish to be aware of. For example,
  it would be possible to develop a modification to the RDFS reasoner which warned
  about use of a property on a resource that is not explicitly declared to have
  the type of the domain of the property. </p>
<p>A particular case of this arises in the case of OWL. In the Description Logic
  community a class which cannot have an instance is regarded as &quot;inconsistent&quot;.
  That term is used because it generally arises from an error in the ontology.
  However, it is not a logical inconsistency - i.e. something giving rise to a
  contradiction. Having an instance of such a class is, clearly a logical error.
  In the Jena 2.2 release we clarified the semantics of <code>isValid()</code>.
  An ontology which is logically consistent but contains empty classes is regarded
  as valid (that is <code>isValid()</code> is false only if there is a logical
  inconsistency). Class expressions which cannot be instantiated are treated as
  warnings rather than errors. To make it easier to test for this case there is
  an additional method <code>Report.isClean()</code> which returns true if the
  ontology is both valid (logically consistent) and generated no warnings (such
  as inconsistent classes).</p>

#### Extended list statements {#extendedListStatements}
<p>The default API supports accessing all entailed information at the level of
  individual triples. This is surprisingly flexible but there are queries which
  cannot be easily supported this way. The first such is when the query needs
  to make reference to an expression which is not already present in the data.
  For example, in description logic systems it is often possible to ask if there
  are any instances of some class expression. Whereas using the triple-based approach
  we can only ask if there are any instances of some class already defined (though
  it could be defined by a bNode rather than be explicitly named).</p>
<p>To overcome this limitation the <code>InfModel</code> API supports a notion
  of &quot;posit&quot;, that is a set of assertions which can be used to temporarily
  declare new information such as the definition of some class expression. These
  temporary assertions can then be referenced by the other arguments to the <code>listStatements</code>
  command. With the current reasoners this is an expensive operation, involving
  the temporary creation of an entire new model with the additional posits added
  and all inference has to start again from scratch. Thus it is worth considering
  preloading your data with expressions you might need to query over. However,
  for some external reasoners, especially description logic reasoners, we anticipate
  restricted uses of this form of listStatement will be important.</p>

#### Direct and indirect relationships {#directRelations}
<p>The second type of operation that is not obviously convenient at the triple
  level involves distinguishing between direct and indirect relationships. If
  a relation is transitive, for example rdfs:subClassOf, then we can define the
  notion of the <i>minimal</i> or <i>direct</i> form of the relationship from
  which all other values of the relation can be derived by transitive closure.
</p>
<p align="center"><img src="direct-relations.png" width="473" height="204">
</p>
<p>Normally, when an InfGraph is queried for a transitive relation the results
  returned show the inferred relations, i.e. the full transitive closure (all
  the links (ii) in the illustration). However, in some cases, such when as building
  a hierarchical UI widget to represent the graph, it is more convenient to only
  see the direct relations (iii). This is achieved by defining special <i>direct</i>
  aliases for those relations which can be queried this way. For the built in
  reasoners this functionality is available for <code>rdfs:subClassOf</code> and
  <code>rdfs:subPropertyOf</code> and the direct aliases for these are defined
  in <a href="/documentation/javadoc/jena/org/apache/jena/vocabulary/ReasonerVocabulary.html"><code>ReasonerVocabulary</code></a>.</p>
<p>Typically the easiest way to work with such indirect and direct relations is
  to use the <a href="../ontology/index.html">Ontology API</a> which hides the
  grubby details of these property aliases.</p>

#### Derivations {#derivations}
<p>It is sometimes useful to be able to trace where an inferred statement was
  generated from. This is achieved using the <code>InfModel.getDerivation(Statement)</code>
  method. This returns a iterator over a set <a href="/documentation/javadoc/jena/org/apache/jena/reasoner/Derivation.html"><code>Derivation</code></a>
  objects through which a brief description of the source of the derivation can
  be obtained. Typically understanding this involves tracing the sources for other
  statements which were used in this derivation and the <code>Derivation.PrintTrace</code>
  method is used to do this recursively.</p>
<p>The general form of the Derivation objects is quite abstract but in the case
  of the rule-based reasoners they have a more detailed internal structure that
  can be accessed - see <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/RuleDerivation.html">RuleDerivation</a></code>.</p>
<p>Derivation information is rather expensive to compute and store. For this reason,
  it is not recorded by default and <code>InfModel.serDerivationLogging(true)</code>
  must be used to enable derivations to be recorded. This should be called before
  any queries are made to the inference model.</p>
<p>As an illustration suppose that we have a raw data model which asserts three
  triples:</p>

    eg:A eg:p eg:B .
    eg:B eg:p eg:C .
    eg:C eg:p eg:D .

<p>and suppose that we have a trivial rule set which computes the transitive closure
  over relation eg:p</p>

    String rules = "[rule1: (?a eg:p ?b) (?b eg:p ?c) -&gt; (?a eg:p ?c)]";
    Reasoner reasoner = new GenericRuleReasoner(Rule.parseRules(rules));
    reasoner.setDerivationLogging(true);
    InfModel inf = ModelFactory.createInfModel(reasoner, rawData);

<p>Then we can query whether eg:A is related through eg:p to eg:D and list the
  derivation route using the following code fragment: </p>

    PrintWriter out = new PrintWriter(System.out);
    for (StmtIterator i = inf.listStatements(A, p, D); i.hasNext(); ) {
        Statement s = i.nextStatement();
        System.out.println("Statement is " + s);
        for (Iterator id = inf.getDerivation(s); id.hasNext(); ) {
            Derivation deriv = (Derivation) id.next();
            deriv.printTrace(out, true);
        }
    }
    out.flush();

<p>Which generates the output:</p>

<pre><i>Statement is [urn:x-hp:eg/A, urn:x-hp:eg/p, urn:x-hp:eg/D]
    Rule rule1 concluded (eg:A eg:p eg:D) &lt-
        Fact (eg:A eg:p eg:B)
    Rule rule1 concluded (eg:B eg:p eg:D) &lt;-
        Fact (eg:B eg:p eg:C)
        Fact (eg:C eg:p eg:D)</i>
</pre>

#### Accessing raw data and deductions {#rawAccess}
<p>From an <code>InfModel</code> it is easy to retrieve the original, unchanged,
  data over which the model has been computed using the <code>getRawModel()</code>
  call. This returns a model equivalent to the one used in the initial <code>bind</code>
  call. It might not be the same Java object but it uses the same Java object
  to hold the underlying data graph. </p>
<p>Some reasoners, notably the forward chaining rule engine, store the deduced
  statements in a concrete form and this set of deductions can be obtained separately
  by using the <code>getDeductionsModel()</code> call. </p>

#### Processing control {#processingControl}
<p>Having bound a <code>Model</code> into an <code>InfModel</code> by using a
  <code>Reasoner</code> its content can still be changed by the normal <code>add</code>
  and <code>remove</code> calls to the <code>InfModel</code>. Any such change
  the model will usually cause all current deductions and temporary rules to be
  discarded and inference will start again from scratch at the next query. Some
  reasoners, such as the RETE-based forward rule engine, can work incrementally.
</p>
<p>In the non-incremental case then the processing will not be started until a
  query is made. In that way a sequence of add and removes can be undertaken without
  redundant work being performed at each change. In some applications it can be
  convenient to trigger the initial processing ahead of time to reduce the latency
  of the first query. This can be achieved using the<code> InfModel.prepare()</code>
  call. This call is not necessary in other cases, any query will automatically
  trigger an internal prepare phase if one is required.</p>
<p>There are times when the data in a model bound into an InfModel can is changed
  &quot;behind the scenes&quot; instead of through calls to the InfModel. If this
  occurs the result of future queries to the InfModel are unpredictable. To overcome
  this and force the InfModel to reconsult the raw data use the <code>InfModel.rebind()</code>
  call.</p>
<p>Finally, some reasoners can store both intermediate and final query results
  between calls. This can substantially reduce the cost of working with the inference
  services but at the expense of memory usage. It is possible to force an InfModel
  to discard all such cached state by using the <code>InfModel.reset()</code>
  call. It there are any outstanding queries (i.e. StmtIterators which have not
  been read to the end yet) then those will be aborted (the next hasNext() call
  will return false).</p>

#### Tracing {#tracing}
<p>When developing new reasoner configurations, especially new rule sets for the
  rule engines, it is sometimes useful to be able to trace the operations of the
  associated inference engine. Though, often this generates too much information
  to be of use and selective use of the <code>print</code> builtin can be more
  effective. </p>
<p>Tracing is not supported by a convenience API call but, for those reasoners
  that support it, it can be enabled using:</p>

   reasoner.setParameter(ReasonerVocabulary.PROPtraceOn, Boolean.TRUE);

<p>Dynamic tracing control is sometimes possible on the InfModel itself by retrieving
  its underlying InfGraph and calling <code>setTraceOn()</code> call. If you need
  to make use of this see the full javadoc for the relevant InfGraph implementation.</p>
<p>[<a href="#api">API Index</a>] [<a href="#index">Main Index</a>]</p>

## The RDFS reasoner {#rdfs}
<ol>
  <li><a href="#RDFSintro">RDFS reasoner - introduction and coverage</a></li>
  <li><a href="#RDFSconfiguration">RDFS Configuration</a></li>
  <li><a href="#RDFSexamples">RDFS Example</a></li>
  <li><a href="#RDFSnotes">RDFS implementation and performance notes</a></li>
</ol>

### RDFS reasoner - intro and coverage {#RDFSintro}
<p>Jena includes an RDFS reasoner (<code>RDFSRuleReasoner</code>) which supports
  almost all of the RDFS entailments described by the RDF Core working group [<a href="https://www.w3.org/TR/rdf-mt/">RDF
  Semantics</a>]. The only omissions are deliberate and are described below.</p>
<p>This reasoner is accessed using <code>ModelFactory.createRDFSModel</code> or
  manually via <code>ReasonerRegistry.getRDFSReasoner()</code>.</p>
<p>During the preview phases of Jena experimental RDFS reasoners were released,
  some of which are still included in the code base for now but applications should
  not rely on their stability or continued existence.</p>
<p>When configured in <i>full</i> mode (see below for configuration information)
  then the RDFS reasoner implements all RDFS entailments except for the bNode
  closure rules. These closure rules imply, for example, that for all triples
  of the form:</p>

    eg:a eg:p nnn^^datatype .

<p>we should introduce the corresponding blank nodes:</p>

    eg:a eg:p _:anon1 .
    _:anon1 rdf:type datatype .

<p>Whilst such rules are both correct and necessary to reduce RDF datatype entailment
  down to simple entailment they are not useful in implementation terms. In Jena
  simple entailment can be implemented by translating a graph containing bNodes
  to an equivalent query containing variables in place of the bNodes. Such a query
  is can directly match the literal node and the RDF API can be used to extract
  the datatype of the literal. The value to applications of directly seeing the
  additional bNode triples, even in <i>virtual</i> triple form, is negligible
  and so this has been deliberately omitted from the reasoner. </p>
<p>[<a href="#rdfs">RDFS Index</a>] [<a href="#index">Main Index</a>]</p>

### RDFS configuration {#RDFSconfiguration}
<p>The RDFSRuleReasoner can be configured to work at three different compliance
  levels: </p>
<dl>
  <dt>Full</dt>
  <dd>This implements all of the RDFS axioms and closure rules with the exception
    of bNode entailments and datatypes (rdfD 1). See above for comments on these.
    This is an expensive mode because all statements in the data graph need to
    be checked for possible use of container membership properties. It also generates
    type assertions for all resources and properties mentioned in the data (rdf1,
    rdfs4a, rdfs4b).</dd>
  <dt>Default</dt>
  <dd>This omits the expensive checks for container membership properties and
    the &quot;everything is a resource&quot; and &quot;everything used as a property
    is one&quot; rules (rdf1, rdfs4a, rdfs4b). The latter information is available
    through the Jena API and creating virtual triples to this effect has little
    practical value.<br>
    This mode does include all the axiomatic rules. Thus, for example, even querying
    an &quot;empty&quot; RDFS InfModel will return triples such as <code>[rdf:type
    rdfs:range rdfs:Class]</code>.</dd>
  <dt>Simple</dt>
  <dd>This implements just the transitive closure of subPropertyOf and subClassOf
    relations, the domain and range entailments and the implications of subPropertyOf
    and subClassOf. It omits all of the axioms. This is probably the most useful
    mode but is not the default because it is a less complete implementation of
    the standard. </dd>
</dl>
<p>The level can be set using the <code>setParameter</code> call, e.g.</p>

    reasoner.setParameter(ReasonerVocabulary.PROPsetRDFSLevel,
                          ReasonerVocabulary.RDFS_SIMPLE);

<p>or by constructing an RDF configuration description and passing that to the
  RDFSRuleReasonerFactory e.g.</p>

    Resource config = ModelFactory.createDefaultModel()
                      .createResource()
                      .addProperty(ReasonerVocabulary.PROPsetRDFSLevel, "simple");
    Reasoner reasoner = RDFSRuleReasonerFactory.theInstance()Create(config);

#### Summary of parameters
<table width="90%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="22%"><b>Parameter</b></td>
    <td width="16%"><b>Values</b></td>
    <td width="62%"><b>Description</b></td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPsetRDFSLevel</div>
    </td>
    <td width="16%">&quot;full&quot;, &quot;default&quot;, &quot;simple&quot;</td>
    <td width="62%">
      <div align="left">Sets the RDFS processing level as described above.</div>
    </td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPenableCMPScan</div>
    </td>
    <td width="16%">Boolean</td>
    <td width="62%">
      <div align="left">If true forces a preprocessing pass which finds all usages
        of rdf:_n properties and declares them as ContainerMembershipProperties.
        This is implied by setting the level parameter to &quot;full&quot; and
        is not normally used directly.</div>
    </td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPtraceOn</div>
    </td>
    <td width="16%">Boolean</td>
    <td width="62%">
      <div align="left">If true switches on exhaustive tracing of rule executions
        at the <i>INFO</i> level.</div>
    </td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPderivationLogging</div>
    </td>
    <td width="16%">Boolean</td>
    <td width="62%">
      <div align="left">If true causes derivation routes to be recorded internally
        so that future getDerivation calls can return useful information.</div>
    </td>
  </tr>
</table>
<p>[<a href="#rdfs">RDFS Index</a>] [<a href="#index">Main Index</a>]</p>

### RDFS Example {#RDFSexamples}
<p>As a complete worked example let us create a simple RDFS schema, some instance
  data and use an instance of the RDFS reasoner to query the two.</p>
<p>We shall use a trivial schema:</p>

      <rdf:Description rdf:about="eg:mum">
        <rdfs:subPropertyOf rdf:resource="eg:parent"/>
      </rdf:Description>
     
      <rdf:Description rdf:about="eg:parent">
        <rdfs:range  rdf:resource="eg:Person"/>
        <rdfs:domain rdf:resource="eg:Person"/>
      </rdf:Description>
    
      <rdf:Description rdf:about="eg:age">
        <rdfs:range rdf:resource="xsd:integer" />
      </rdf:Description>

<p>This defines a property <code>parent</code> from <code>Person</code> to <code>Person</code>,
  a sub-property <code>mum</code> of <code>parent</code> and an integer-valued
  property <code>age</code>.</p>
<p>We shall also use the even simpler instance file:</p>

      <Teenager rdf:about="eg:colin">
          <mum rdf:resource="eg:rosy" />
          <age>13</age>
      </Teenager>

<p>
  Which defines a <code>Teenager</code> called <code>colin</code> who has a <code>mum</code>
  <code>rosy</code> and an <code>age</code> of 13.</p>
<p>Then the following code fragment can be used to read files containing these
  definitions, create an inference model and query it for information on the <code>rdf:type</code>
  of <code>colin</code> and the <code>rdf:type</code> of <code>Person</code>:</p>

    Model schema = RDFDataMgr.loadModel("file:data/rdfsDemoSchema.rdf");
    Model data = RDFDataMgr.loadModel("file:data/rdfsDemoData.rdf");
    InfModel infmodel = ModelFactory.createRDFSModel(schema, data);
    
    Resource colin = infmodel.getResource("urn:x-hp:eg/colin");
    System.out.println("colin has types:");
    printStatements(infmodel, colin, RDF.type, null);

    Resource Person = infmodel.getResource("urn:x-hp:eg/Person");
    System.out.println("\nPerson has types:");
    printStatements(infmodel, Person, RDF.type, null);

<p>This produces the output:</p>
<pre><i>colin has types:
 - (eg:colin rdf:type eg:Teenager)
 - (eg:colin rdf:type rdfs:Resource)
 - (eg:colin rdf:type eg:Person)

Person has types:
 - (eg:Person rdf:type rdfs:Class)
 - (eg:Person rdf:type rdfs:Resource)</i></pre>

<p>This says that <code>colin</code> is both a <code>Teenager</code> (by direct
  definition), a <code>Person</code> (because he has a <code>mum</code> which
  means he has a <code>parent</code> and the domain of <code>parent</code> is
  <code>Person</code>) and an <code>rdfs:Resource</code>. It also says that <code>Person</code>
  is an <code>rdfs:Class</code>, even though that wasn't explicitly in the schema,
  because it is used as object of range and domain statements.</p>
<p>If we add the additional code:</p>
<pre>ValidityReport validity = infmodel.validate();
if (validity.isValid()) {
    System.out.println("\nOK");
} else {
    System.out.println("\nConflicts");
    for (Iterator i = validity.getReports(); i.hasNext(); ) {
        ValidityReport.Report report = (ValidityReport.Report)i.next();
        System.out.println(" - " + report);
    }
}</pre>
<p>
  Then we get the additional output:</p>
<pre><i>Conflicts
 - Error (dtRange): Property urn:x-hp:eg/age has a typed range
Datatype[http://www.w3.org/2001/XMLSchema#integer -&gt; class java.math.BigInteger]
that is not compatible with 13</i></pre>
<p>because the age was given using an RDF plain literal where as the schema requires
  it to be a datatyped literal which is compatible with xsd:integer.</p>
<p>[<a href="#rdfs">RDFS Index</a>] [<a href="#index">Main Index</a>]</p>

### RDFS implementation and performance notes {#RDFSnotes}
<p>The RDFSRuleReasoner is a hybrid implementation. The subproperty and subclass
  lattices are eagerly computed and stored in a compact in-memory form using the
  TransitiveReasoner (see below). The identification of which container membership
  properties (properties like rdf:_1) are present is implemented using a preprocessing
  hook. The rest of the RDFS operations are implemented by explicit rule sets
  executed by the general hybrid rule reasoner. The three different processing
  levels correspond to different rule sets. These rule sets are located by looking
  for files &quot;`etc/*.rules`&quot; on the classpath and so could,
  in principle, be overridden by applications wishing to modify the rules. </p>
<p>Performance for in-memory queries appears to be good. Using a synthetic dataset
  we obtain the following times to determine the extension of a class from a class
  hierarchy:</p>
<table width="77%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="6%"><b>Set</b></td>
    <td width="14%"><b>#concepts</b></td>
    <td width="18%"><b>total instances</b></td>
    <td width="25%"><b>#instances of concept</b></td>
    <td width="17%"><b>JenaRDFS</b></td>
    <td width="20%"><b>XSB*</b></td>
  </tr>
  <tr>
    <td width="6%">1</td>
    <td width="14%">155</td>
    <td width="18%">1550</td>
    <td width="25%">310</td>
    <td width="17%">0.07</td>
    <td width="20%">0.16</td>
  </tr>
  <tr>
    <td width="6%">2</td>
    <td width="14%">780</td>
    <td width="18%">7800</td>
    <td width="25%">1560</td>
    <td width="17%">0.25</td>
    <td width="20%">0.47</td>
  </tr>
  <tr>
    <td width="6%">3</td>
    <td width="14%">3905</td>
    <td width="18%">39050</td>
    <td width="25%">7810</td>
    <td width="17%">1.16</td>
    <td width="20%">2.11</td>
  </tr>
</table>
<p>The times are in seconds, normalized to a 1.1GHz Pentium processor. The XSB*
  figures are taken from a pre-published paper and may not be directly comparable
  (for example they do not include any rule compilation time) - they are just
  offered to illustrate that the RDFSRuleReasoner has broadly similar scaling
  and performance to other rule-based implementations.</p>
<p>The Jena RDFS implementation has not been tested and evaluated over database
  models. The Jena architecture makes it easy to construct such models but in
  the absence of caching we would expect the performance to be poor. Future work
  on adapting the rule engines to exploit the capabilities of the more sophisticated
  database backends will be considered.</p>
<p>[<a href="#rdfs">RDFS Index</a>] [<a href="#index">Main Index</a>]</p>

## The OWL reasoner {#owl}
<ol>
  <li><a href="#OWLintro">OWL reasoner introduction</a></li>
  <li><a href="#OWLcoverage">OWL coverage</a></li>
  <li><a href="#OWLconfiguration">OWL configuration</a></li>
  <li><a href="#OWLexamples">OWL example</a></li>
  <li><a href="#OWLnotes">OWL notes and limitations</a></li>
</ol>
<p><a name="OWLintro"></a>The second major set of reasoners supplied with Jena is a rule-based
  implementation of the OWL/lite subset of OWL/full.</p>
<p>The current release includes a default OWL reasoner and two small/faster configurations.
Each of the configurations is intended to be a sound implementation of a subset of OWL/full semantics
but none of them is complete (in the technical sense). For complete OWL DL reasoning use
an external DL reasoner such as Pellet, Racer or FaCT. Performance (especially memory use) of the fuller reasoner
configuration still leaves something to be desired and will the subject of future work - time permitting.</p>
<p>See also <a href="#OWLnotes">subsection 5</a> for notes on more specific limitations
  of the current implementation. </p>

### OWL coverage {#OWLcoverage}
<p>The Jena OWL reasoners could be described as instance-based reasoners. That
  is, they work by using rules to propagate the if- and only-if- implications of
  the OWL constructs on instance data. Reasoning about classes is done indirectly
  - for each declared class a prototypical instance is created and elaborated.
  If the prototype for a class A can be deduced as being a member of class B then
  we conclude that A is a subClassOf B. This approach is in contrast to more sophisticated
  Description Logic reasoners which work with class expressions and can be less
  efficient when handling instance data but more efficient with complex class expressions
  and able to provide complete reasoning. </p>
<p>We thus anticipate that the OWL rule reasoner will be most suited to applications
  involving primarily instance reasoning with relatively simple, regular ontologies
  and least suited to applications involving large rich ontologies. A better characterisation
  of the tradeoffs involved would be useful and will be sought.</p>
<p>We intend that the OWL reasoners should be smooth extensions of the RDFS reasoner
  described above. That is all RDFS entailments found by the RDFS reasoner will
  also be found by the OWL reasoners and scaling on RDFS schemas should be similar
  (though there are some costs, see later). The instance-based implementation
  technique is in keeping with this &quot;RDFS plus a bit&quot; approach.</p>
<p>Another reason for choosing this inference approach is that it makes it possible
  to experiment with support for different constructs, including constructs that
  go beyond OWL, by modification of the rule set. In particular, some applications
  of interest to ourselves involve ontology transformation which very often implies
  the need to support property composition. This is something straightforward
  to express in rule-based form and harder to express in standard Description
  Logics.</p>
<p>Since RDFS is not a subset of the OWL/Lite or OWL/DL languages the Jena implementation
  is an incomplete implementation of OWL/full. We provide three implementations
  a default (&quot;full&quot; one), a slightly cut down &quot;mini&quot; and a
  rather smaller/faster &quot;micro&quot;. The default OWL rule reasoner (<code>ReasonerRegistry.getOWLReasoner()</code>)
  supports the constructs as listed below. The OWLMini reasoner is nearly the
  same but omits the forward entailments from minCardinality/someValuesFrom restrictions
  - that is it avoids introducing bNodes which avoids some infinite expansions
  and enables it to meet the Jena API contract more precisely. The OWLMicro reasoner
  just supports RDFS plus the various property axioms, intersectionOf, unionOf
  (partial) and hasValue. It omits the cardinality restrictions and equality axioms,
  which enables it to achieve much higher performance. </p>
<table width="90%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="36%"><b>Constructs</b></td>
    <td width="16%"><b>Supported by</b></td>
    <td width="48%"><b>Notes</b></td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">rdfs:subClassOf, rdfs:subPropertyOf, rdf:type</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left">Normal RDFS semantics supported including meta use (e.g.
        taking the subPropertyOf subClassOf).</div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">rdfs:domain, rdfs:range</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left">Stronger if-and-only-if semantics supported</div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:intersectionOf</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">&nbsp;</td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:unionOf</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left">Partial support. If C=unionOf(A,B) then will infer that
        A,B are subclasses of C, and thus that instances of A or B are instances
        of C. Does not handle the reverse (that an instance of C must be either
        an instance of A or an instance of B).</div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:equivalentClass</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:disjointWith</div>
    </td>
    <td width="16%">full, mini</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:sameAs, owl:differentFrom, owl:distinctMembers</div>
    </td>
    <td width="16%">full, mini</td>
    <td width="48%">
      <div align="left">owl:distinctMembers is currently translated into a quadratic
        set of owl:differentFrom assertions.</div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">Owl:Thing</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">&nbsp;</td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:equivalentProperty, owl:inverseOf </div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:FunctionalProperty, owl:InverseFunctionalProperty</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:SymmetricProperty, owl:TransitiveProperty</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:someValuesFrom</div>
    </td>
    <td width="16%">full, (mini)</td>
    <td width="48%">
      <div align="left">
        <p>Full supports both directions (existence of a value implies membership
          of someValuesFrom restriction, membership of someValuesFrom implies
          the existence of a bNode representing the value).<br>
          Mini omits the latter &quot;bNode introduction&quot; which avoids some
          infinite closures.</p>
      </div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:allValuesFrom</div>
    </td>
    <td width="16%">full, mini</td>
    <td width="48%">
      <div align="left">Partial support, forward direction only (member of a allValuesFrom(p,
        C) implies that all p values are of type C). Does handle cases where the
        reverse direction is trivially true (e.g. by virtue of a global rdfs:range
        axiom). </div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:minCardinality, owl:maxCardinality, owl:cardinality</div>
    </td>
    <td width="16%">full, (mini)</td>
    <td width="48%">
      <div align="left">
        <p>Restricted to cardinalities of 0 or 1, though higher cardinalities
          are partially supported in validation for the case of literal-valued
          properties.<br>
          Mini omits the bNodes introduction in the minCardinality(1) case, see
          someValuesFrom above.</p>
      </div>
    </td>
  </tr>
  <tr>
    <td width="36%">
      <div align="left">owl:hasValue</div>
    </td>
    <td width="16%">all</td>
    <td width="48%">
      <div align="left"></div>
    </td>
  </tr>
</table>
<p>The critical constructs which go beyond OWL/lite and are not supported in the
  Jena OWL reasoner are complementOf and oneOf. As noted above the support for
  unionOf is partial (due to limitations of the rule based approach) but is useful
  for traversing class hierarchies.</p>
<p>Even within these constructs rule based implementations are limited in the
  extent to which they can handle equality reasoning - propositions provable by
  reasoning over concrete and introduced instances are covered but reasoning by
  cases is not supported.</p>
<p>Nevertheless, the full reasoner passes the normative OWL working group positive
  and negative entailment tests for the supported constructs, though some tests
  need modification for the comprehension axioms (see below).</p>
<p>The OWL rule set does include incomplete support for validation of datasets
  using the above constructs. Specifically, it tests for:</p>
<ul>
  <li>Illegal existence of a property restricted by a maxCardinality(0) restriction.</li>
  <li>Two individuals both sameAs and differentFrom each other.</li>
  <li>Two classes declared as disjoint but where one subsumes the other (currently
    reported as a violation concerning the class prototypes, error message to
    be improved).</li>
  <li>Range or a allValuesFrom violations for DatatypeProperties.</li>
  <li>Too many literal-values for a DatatypeProperty restricted by a maxCardinality(N)
    restriction.</li>
</ul>
<p>[<a href="#owl">OWL Index</a>] [<a href="#index">Main Index</a>]</p>

### OWL Configuration {#OWLconfiguration}
<p>This reasoner is accessed using <code>ModelFactory.createOntologyModel</code>
  with the prebuilt <a href="/documentation/javadoc/jena/org/apache/jena/ontology/OntModelSpec.html"><code>OntModelSpec</code></a>
  <code>OWL_MEM_RULE_INF</code> or manually via <code>ReasonerRegistry.getOWLReasoner()</code>.</p>
<p>There are no OWL-specific configuration parameters though the reasoner supports
  the standard control parameters:</p>
<table width="90%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="22%"><b>Parameter</b></td>
    <td width="16%"><b>Values</b></td>
    <td width="62%"><b>Description</b></td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPtraceOn</div>
    </td>
    <td width="16%">boolean</td>
    <td width="62%">
      <div align="left">If true switches on exhaustive tracing of rule executions
        at the <i>INFO</i> level.</div>
    </td>
  </tr>
  <tr>
    <td width="22%">
      <div align="left">PROPderivationLogging</div>
    </td>
    <td width="16%">Boolean</td>
    <td width="62%">
      <div align="left">If true causes derivation routes to be recorded internally
        so that future getDerivation calls can return useful information.</div>
    </td>
  </tr>
</table>
<p>As we gain experience with the ways in which OWL is used and the capabilities
  of the rule-based approach we imagine useful subsets of functionality emerging
  - like that supported by the RDFS reasoner in the form of the level settings.</p>
<p>[<a href="#owl">OWL Index</a>] [<a href="#index">Main Index</a>]</p>

### OWL Example {#OWLexamples}
<p>As an example of using the OWL inference support, consider the sample schema
  and data file in the data directory - <a href="data/owlDemoSchema.rdf">owlDemoSchema.rdf</a>
  and <a href="data/owlDemoData.rdf">owlDemoData.rdf</a>. </p>
<p>The schema file shows a simple, artificial ontology concerning computers which
  defines a GamingComputer as a Computer which includes at least one bundle of
  type GameBundle and a component with the value gamingGraphics. </p>
<p>The data file shows information on several hypothetical computer configurations
  including two different descriptions of the configurations &quot;whiteBoxZX&quot;
  and &quot;<code>bigName42</code>&quot;.</p>
<p>We can create an instance of the OWL reasoner, specialized to the demo schema
  and then apply that to the demo data to obtain an inference model, as follows:</p>

    Model schema = RDFDataMgr.loadModel("file:data/owlDemoSchema.rdf");
    Model data = RDFDataMgr.loadModel("file:data/owlDemoData.rdf");
    Reasoner reasoner = ReasonerRegistry.getOWLReasoner();
    reasoner = reasoner.bindSchema(schema);
    InfModel infmodel = ModelFactory.createInfModel(reasoner, data);

<p>A typical example operation on such a model would be to find out all we know
  about a specific instance, for example the <code>nForce</code> mother board.
  This can be done using:</p>

    Resource nForce = infmodel.getResource("urn:x-hp:eg/nForce");
    System.out.println("nForce *:");
    printStatements(infmodel, nForce, null, null);

<p> where <code>printStatements</code> is defined by: </p>
    public void printStatements(Model m, Resource s, Property p, Resource o) {
        for (StmtIterator i = m.listStatements(s,p,o); i.hasNext(); ) {
            Statement stmt = i.nextStatement();
            System.out.println(" - " + PrintUtil.print(stmt));
        }
    }

<p>This produces the output:</p>
<pre><i>nForce *:
 - (eg:nForce rdf:type owl:Thing)
 - (eg:nForce owl:sameAs eg:unknownMB)
 - (eg:nForce owl:sameAs eg:nForce)
 - (eg:nForce rdf:type eg:MotherBoard)
 - (eg:nForce rdf:type rdfs:Resource)
 - (eg:nForce rdf:type a3b24:f7822755ad:-7ffd)
 - (eg:nForce eg:hasGraphics eg:gamingGraphics)
 - (eg:nForce eg:hasComponent eg:gamingGraphics)</i></pre>
<p>Note that this includes inferences based on subClass inheritance (being an
  <code>eg:MotherBoard</code> implies it is an <code>owl:Thing</code> and an <code>rdfs:Resource</code>),
  property inheritance (<code>eg:hasComponent eg:gameGraphics</code> derives from
  <code>hasGraphics</code> being a subProperty of <code>hasComponent</code>) and
  cardinality reasoning (it is the sameAs <code>eg:unknownMB</code> because computers
  are defined to have only one motherboard and the two different descriptions
  of <code>whileBoxZX</code> use these two different terms for the mother board).<i>
  </i>The anonymous rdf:type statement references the <code>&quot;hasValue(eg:hasComponent,
  eg:gamingGraphics)&quot; </code>restriction mentioned in the definition of GamingComputer.</p>
<p>A second, typical operation is instance recognition. Testing if an individual
  is an instance of a class expression. In this case the <code>whileBoxZX</code>
  is identifiable as a <code>GamingComputer</code> because it is a <code>Computer</code>,
  is explicitly declared as having an appropriate bundle and can be inferred to
  have a <code>gamingGraphics</code> component from the combination of the <code>nForce</code>
  inferences we've already seen and the transitivity of <code>hasComponent</code>.
  We can test this using:</p>

    Resource gamingComputer = infmodel.getResource("urn:x-hp:eg/GamingComputer");
    Resource whiteBox = infmodel.getResource("urn:x-hp:eg/whiteBoxZX");
    if (infmodel.contains(whiteBox, RDF.type, gamingComputer)) {
        System.out.println("White box recognized as gaming computer");
    } else {
        System.out.println("Failed to recognize white box correctly");
    }

<p> Which generates the output:</p>
<pre>  <i>White box recognized as gaming computer</i></pre>
<p>Finally, we can check for inconsistencies within the data by using the validation
  interface:</p>

    ValidityReport validity = infmodel.validate();
    if (validity.isValid()) {
        System.out.println("OK");
    } else {
        System.out.println("Conflicts");
        for (Iterator i = validity.getReports(); i.hasNext(); ) {
            ValidityReport.Report report = (ValidityReport.Report)i.next();
            System.out.println(" - " + report);
        }
    }

<p>Which generates the output:</p>
<pre><i>Conflicts
 - Error (conflict): Two individuals both same and different, may be
   due to disjoint classes or functional properties
Culprit = eg:nForce2
Implicated node: eg:bigNameSpecialMB</i>

... + 3 other similar reports
</pre>
<p>This is due to the two records for the <code>bigName42</code> configuration
  referencing two motherboards which are explicitly defined to be different resources
  and thus violate the FunctionProperty nature of <code>hasMotherBoard</code>.</p>
<p>[<a href="#owl">OWL Index</a>] [<a href="#index">Main Index</a>]</p>

### OWL notes and limitations {#OWLnotes}

#### Comprehension axioms
<p>A critical implication of our variant of the instance-based approach is that
  the reasoner does not directly answer queries relating to dynamically introduced
  class expressions.</p>
<p>For example, given a model containing the RDF assertions corresponding to the
  two OWL axioms:</p>
<pre>class A = intersectionOf (minCardinality(P, 1), maxCardinality(P,1))
class B = cardinality(P,1)</pre>
<p>Then the reasoner can demonstrate that classes A and B are equivalent, in particular
  that any instance of A is an instance of B and vice versa. However, given a
  model just containing the first set of assertions you cannot directly query
  the inference model for the individual triples that make up <i>cardinality(P,1)</i>.
  If the relevant class expressions are not already present in your model then
  you need to use the list-with-posits mechanism described <a href="#extendedListStatements">above</a>,
  though be warned that such posits start inference afresh each time and can be
  expensive. </p>
<p>Actually, it would be possible to introduce comprehension axioms for simple
  cases like this example. We have, so far, chosen not to do so. First, since
  the OWL/full closure is generally infinite, some limitation on comprehension
  inferences seems to be useful. Secondly, the typical queries that Jena applications
  expect to be able to issue would suddenly jump in size and cost - causing a
  support nightmare. For example, queries such as (a, rdf:type, *) would become
  near-unusable.</p>
<p>Approximately, 10 of the OWL working group tests for the supported OWL subset
  currently rely on such comprehension inferences. The shipping version of the
  Jena rule reasoner passes these tests only after they have been rewritten to
  avoid the comprehension requirements.<br>
</p>

#### Prototypes
<p>As noted above the current OWL rule set introduces prototypical instances for
  each defined class. These prototypical instances used to be visible to queries.
  From release 2.1 they are used internally but should not longer be visible.
</p>

#### Direct/indirect
<p>We noted <a href="#directRelations">above</a> that the Jena reasoners support
  a separation of direct and indirect relations for transitive properties such
  as subClassOf. The current implementation of the full and mini OWL reasoner
  fails to do this and the direct forms of the queries will fail. The OWL Micro
  reasoner, which is but a small extension of RDFS, does support the direct queries.</p>
<p>This does not affect querying though the Ontology API, which works around this
  limitation. It only affects direct RDF accesses to the inference model.</p>

#### Performance
<p>The OWL reasoners use the rule engines for all inference. The full and mini
  configurations omit some of the performance tricks employed by the RDFS reasoner
  (notably the use of the custom transitive reasoner) making those OWL reasoner
  configurations slower than the RDFS reasoner on pure RDFS data (typically around
  x3-4 slow down). The OWL Micro reasoner is intended to be as close to RDFS performance
  while also supporting the core OWL constructs as described earlier.</p>
<p>Once the owl constructs are used then substantial reasoning can be required.
  The most expensive aspect of the supported constructs is the equality reasoning
  implied by use of cardinality restrictions and FunctionalProperties. The current
  rule set implements equality reasoning by identifying all sameAs deductions
  during the initial forward &quot;prepare&quot; phase. This may require the entire
  instance dataset to be touched several times searching for occurrences of FunctionalProperties.</p>
<p>Beyond this the rules implementing the OWL constructs can interact in complex
  ways leading to serious performance overheads for complex ontologies. Characterising
  the sorts of ontologies and inference problems that are well tackled by this
  sort of implementation and those best handled by plugging a Description Logic
  engine, or a saturation theorem prover, into Jena is a topic for future work.</p>
<p>One random hint: explicitly importing the owl.owl definitions causes much duplication
  of rule use and a substantial slow down - the OWL axioms that the reasoner can
  handle are already built in and don't need to be redeclared.</p>

#### Incompleteness
<p>The rule based approach cannot offer a complete solution for OWL/Lite, let
  alone the OWL/Full fragment corresponding to the OWL/Lite constructs. In addition
  the current implementation is still under development and may well have omissions
  and oversights. We intend that the reasoner should be sound (all inferred triples
  should be valid) but not complete. </p>

<p>[<a href="#owl">OWL Index</a>] [<a href="#index">Main Index</a>]</p>

## The transitive reasoner {#transitive}
<p>The TransitiveReasoner provides support for storing and traversing class and
  property lattices. This implements just the <i>transitive</i> and <i>symmetric</i>
  properties of <code>rdfs:subPropertyOf</code> and <code>rdfs:subClassOf</code>.
  It is not all that exciting on its own but is one of the building blocks used
  for the more complex reasoners. It is a hardwired Java implementation that stores
  the class and property lattices as graph structures. It is slightly higher performance,
  and somewhat more space efficient, than the alternative of using the pure rule
  engines to performance transitive closure but its main advantage is that it
  implements the direct/minimal version of those relations as well as the transitively
  closed version.</p>
<p>The <code>GenericRuleReasoner</code> (see below) can optionally use an instance
  of the transitive reasoner for handling these two properties. This is the approach
  used in the default RDFS reasoner.</p>
<p>It has no configuration options.</p>
<p>[<a href="#index">Index</a>]</p>

## The general purpose rule engine {#rules}
<ol>
  <li><a href="#RULEoverview">Overview of the rule engine(s)</a></li>
  <li><a href="#RULEsyntax">Rule syntax and structure</a></li>
  <li><a href="#RULEforward">Forward chaining engine</a></li>
  <li><a href="#RULEbackward">Backward chaining engine</a></li>
  <li><a href="#RULEhybrid">Hybrid engine</a></li>
  <li><a href="#RULEconfiguration">GenericRuleReasoner configuration</a></li>
  <li><a href="#RULEbuiltins">Builtin primitives</a></li>
  <li><a href="#RULEexamples">Example</a></li>
  <li><a href="#RDFSPlusRules">Combining RDFS/OWL with custom rules</a></li>
  <li><a href="#RULEnotes">Notes</a></li>
  <li><a href="#RULEextensions">Extensions</a></li>
</ol>

### Overview of the rule engine(s) {#RULEoverview}
<p>Jena includes a general purpose rule-based reasoner which is used to implement
  both the RDFS and OWL reasoners but is also available for general use. This
  reasoner supports rule-based inference over RDF graphs and provides forward
  chaining, backward chaining and a hybrid execution model. To be more exact,
  there are two internal rule engines one forward chaining RETE engine and one
  tabled datalog engine - they can be run separately or the forward engine can
  be used to prime the backward engine which in turn will be used to answer queries.</p>
<p>The various engine configurations are all accessible through a single parameterized
  reasoner <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/GenericRuleReasoner.html">GenericRuleReasoner</a></code>.
  At a minimum a <code>GenericRuleReasoner</code> requires a ruleset to define
  its behaviour. A <code>GenericRuleReasoner</code> instance with a ruleset can
  be used like any of the other reasoners described above - that is it can be
  bound to a data model and used to answer queries to the resulting inference
  model. </p>
<p>The rule reasoner can also be extended by registering new procedural primitives.
  The current release includes a starting set of primitives which are sufficient
  for the RDFS and OWL implementations but is easily extensible.</p>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Rule syntax and structure {#RULEsyntax}
<p>A rule for the rule-based reasoner is defined by a Java <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/Rule.html">Rule</a></code>
  object with a list of body terms (premises), a list of head terms (conclusions)
  and an optional name and optional direction. Each term or <a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/ClauseEntry.html"><code>ClauseEntry</code></a>
  is either a triple pattern, an extended triple pattern or a call to a builtin
  primitive. A rule set is simply a List of Rules.</p>
<p>For convenience a rather simple parser is included with Rule which allows rules
  to be specified in reasonably compact form in text source files. However, it
  would be perfectly possible to define alternative parsers which handle rules
  encoded using, say, XML or RDF and generate Rule objects as output. It would
  also be possible to build a real parser for the current text file syntax which
  offered better error recovery and diagnostics.</p>
<p>An informal description of the simplified text rule syntax is:</p>
<pre><i>Rule</i>      :=   <i>bare-rule</i> .
          or   [ <i>bare-rule</i> ]<br>       or   [ ruleName : <i>bare-rule</i> ]

<i>bare-rule</i> :=   <i>term</i>, ... <i>term</i> -&gt; <i>hterm</i>, ... <i>hterm</i>    // forward rule
          or   <i>bhterm</i> &lt;- <i>term</i>, ... <i>term   </i> // backward rule<i>

hterm     :=   term
          </i>or   [<i> bare-rule </i>]<i>

term</i>      :=   (<i>node</i>, <i>node</i>, <i>node</i>)           // triple pattern
          or   (<i>node</i>, <i>node</i>, <i>functor</i>)        // extended triple pattern
          or   builtin(<i>node</i>, ... <i>node</i>)      // invoke procedural primitive

<i>bhterm</i>      :=   (<i>node</i>, <i>node</i>, <i>node</i>)           // triple pattern

<i>functor</i>   :=   functorName(<i>node</i>, ... <i>node</i>)  // structured literal

<i>node</i>      :=   <i>uri-ref</i>                   // e.g. http://foo.com/eg
          or   prefix:localname          // e.g. rdf:type
          or   &lt;<i>uri-ref</i>&gt;          // e.g. &lt;myscheme:myuri&gt;
          or   ?<i>varname                    </i>// variable
          or   'a literal'                 // a plain string literal
          or   'lex'^^typeURI              // a typed literal, xsd:* type names supported
          or   number                      // e.g. 42 or 25.5</pre>
<p>The &quot;,&quot; separators are optional.</p>
<p>The difference between the forward and backward rule syntax is only relevant
  for the hybrid execution strategy, see below.</p>
<p>The <i>functor</i> in an extended triple pattern is used to create and access
  structured literal values. The functorName can be any simple identifier and
  is not related to the execution of builtin procedural primitives, it is just
  a datastructure. It is useful when a single semantic structure is defined across
  multiple triples and allows a rule to collect those triples together in one
  place.</p>
<p>To keep rules readable qname syntax is supported for URI refs. The set of known
  prefixes is those registered with the <code><a href="/documentation/javadoc/jena/org/apache/jena/util/PrintUtil.html">PrintUtil</a></code>
  object. This initially knows about rdf, rdfs, owl, xsd and a test namespace
  eg, but more mappings can be registered in java code. In addition it is possible to
  define additional prefix mappings in the rule file, see below. </p>
<p>Here are some example rules which illustrate most of these constructs:</p>
<pre>[allID: (?C rdf:type owl:Restriction), (?C owl:onProperty ?P),
     (?C owl:allValuesFrom ?D)  -&gt; (?C owl:equivalentClass all(?P, ?D)) ]

[all2: (?C rdfs:subClassOf all(?P, ?D)) -&gt; print('Rule for ', ?C)
    [all1b: (?Y rdf:type ?D) &lt;- (?X ?P ?Y), (?X rdf:type ?C) ] ]

[max1: (?A rdf:type max(?P, 1)), (?A ?P ?B), (?A ?P ?C)
      -&gt; (?B owl:sameAs ?C) ]
</pre>
<p>Rule <code>allID</code> illustrates the functor use for collecting the components
  of an OWL restriction into a single datastructure which can then fire further
  rules. Rule <code>all2</code> illustrates a forward rule which creates a new
  backward rule and also calls the <code>print</code> procedural primitive. Rule
  <code>max1</code> illustrates use of numeric literals.<br>
</p>
<p>
Rule files may be loaded and parsed using:
<pre>
List rules = Rule.rulesFromURL("file:myfile.rules");
</pre>
or
<pre>
BufferedReader br = /* open reader */ ;
List rules = Rule.parseRules( Rule.rulesParserFromReader(br) );
</pre>
or
<pre>
String ruleSrc = /* list of rules in line */
List rules = Rule.parseRules( rulesSrc );
</pre>
In the first two cases (reading from a URL or a BufferedReader) the rule file is
preprocessed by a simple processor which strips comments and supports some additional
macro commands:
<dl>
<dt><code># ...</code></dt>
<dd>A comment line.</dd>
<dt><code>// ...</code></dt>
<dd>A comment line.<br /><br /></dd>
<dt><code>@prefix pre: &lt;http://domain/url#&gt;.</code></dt>
<dd>Defines a prefix <code>pre</code> which can be used in the rules.
The prefix is local to the rule file.<br /><br /></dd>
<dt><code>@include &lt;urlToRuleFile&gt;.</code></dt>
<dd>Includes the rules defined in the given file in this file. The included rules
will appear before the user defined rules, irrespective of where in the file
the @include directive appears. A set of special cases is supported to allow
a rule file to include the predefined rules for RDFS and OWL - in place of a real
URL for a rule file use one of the keywords
<code>RDFS</code>
<code>OWL</code>
<code>OWLMicro</code>
<code>OWLMini</code> (case insensitive).
</dd>
</dl>

<p>
So an example complete rule file which includes the RDFS rules and defines
a single extra rule is:

    # Example rule file
    @prefix pre: <http://jena.hpl.hp.com/prefix#>.
    @include <RDFS>.

    [rule1: (?f pre:father ?a) (?u pre:brother ?f) -> (?u pre:uncle ?a)]
</p>

<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Forward chaining engine {#RULEforward}
<p>If the rule reasoner is configured to run in forward mode then only the forward
  chaining engine will be used. The first time the inference Model is queried
  (or when an explicit <code>prepare()</code> call is made, see <a href="#processingControl">above</a>)
  then all of the relevant data in the model will be submitted to the rule engine.
  Any rules which fire that create additional triples do so in an internal <i>deductions</i>
  graph and can in turn trigger additional rules. There is a <i>remove</i> primitive
  that can be used to remove triples and such removals can also trigger rules
  to fire in removal mode. This cascade of rule firings continues until no more
  rules can fire. It is perfectly possible, though not a good idea, to write rules
  that will loop infinitely at this point.</p>
<p>Once the preparation phase is complete the inference graph will act as if it
  were the union of all the statements in the original model together with all
  the statements in the internal deductions graph generated by the rule firings.
  All queries will see all of these statements and will be of similar speed to
  normal model accesses. It is possible to separately access the original raw
  data and the set of deduced statements if required, see <a href="#rawAccess">above</a>.</p>
<p>If the inference model is changed by adding or removing statements through
  the normal API then this will trigger further rule firings. The forward rules
  work incrementally and only the consequences of the added or removed triples
  will be explored. The default rule engine is based on the standard RETE algorithm
  (C.L Forgy, <i>RETE: A fast algorithm for the many pattern/many object pattern
  match problem, </i>Artificial Intelligence 1982) which is optimized for such
  incremental changes. </p>
<p>When run in forward mode all rules are treated as forward even if they were
  written in backward (&quot;&lt;-&quot;) syntax. This allows the same rule set
  to be used in different modes to explore the performance tradeoffs.</p>
<p>There is no guarantee of the order in which matching rules will fire or the
  order in which body terms will be tested, however once a rule fires its head-terms
  will be executed in left-to-right sequence.</p>
<p>In forward mode then head-terms which assert backward rules (such as <code>all1b</code>
  above) are ignored.</p>
<p>There are in fact two forward engines included within the Jena code base,
  an earlier non-RETE implementation is retained for now because it can be more
  efficient in some circumstances but has identical external semantics. This alternative
  engine is likely to be eliminated in a future release once more tuning has been
  done to the default RETE engine.</p>

<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Backward chaining engine {#RULEbackward}
<p>If the rule reasoner is run in backward chaining mode it uses a logic programming
  (LP) engine with a similar execution strategy to Prolog engines. When the inference
  Model is queried then the query is translated into a goal and the engine attempts
  to satisfy that goal by matching to any stored triples and by goal resolution
  against the backward chaining rules.</p>
<p>Except as noted below rules will be executed in top-to-bottom, left-to-right
  order with backtracking, as in SLD resolution. In fact, the rule language is
  essentially datalog rather than full prolog, whilst the functor syntax within
  rules does allow some creation of nested data structures they are flat (not
  recursive) and so can be regarded a syntactic sugar for datalog.</p>
<p>As a datalog language the rule syntax is a little surprising because it restricts
  all properties to be binary (as in RDF) and allows variables in any position
  including the property position. In effect, rules of the form:</p>
<pre>(s, p, o), (s1, p1, o1) ... &lt;- (sb1, pb1, ob1), .... </pre>
<p>Can be thought of as being translated to datalog rules of the form:</p>
<pre>triple(s, p, o)    :- triple(sb1, pb1, ob1), ...
triple(s1, p1, o1) :- triple(sb1, pb1, ob1), ...
...</pre>
<p>where &quot;triple/3&quot; is a hidden implicit predicate. Internally, this
  transformation is not actually used, instead the rules are implemented directly.</p>
<p>In addition, all the data in the raw model supplied to the engine is treated
  as if it were a set of <code>triple(s,p,o)</code> facts which are prepended to
  the front of the rule set. Again, the implementation does not actually work
  that way but consults the source graph, with all its storage and indexing capabilities,
  directly.</p>
<p>Because the order of triples in a Model is not defined then this is one violation
  to strict top-to-bottom execution. Essentially all ground facts are consulted
  before all rule clauses but the ordering of ground facts is arbitrary.</p>

#### Tabling
<p>The LP engine supports tabling. When a goal is tabled then all previously computed
  matches to that goal are recorded (memoized) and used when satisfying future
  similar goals. When such a tabled goal is called and all known answers have
  been consumed then the goal will suspend until some other execution branch has
  generated new results and then be resumed. This allows one to successfully run
  recursive rules such as transitive closure which would be infinite loops in
  normal SLD prolog. This execution strategy, SLG, is essentially the same as
  that used in the well known <a href="http://xsb.sourceforge.net/">XSB</a> system.</p>
<p>In the Jena rule engine the goals to be tabled are identified by the property
  field of the triple. One can request that all goals be tabled by calling the
  <code>tableAll()</code> primitive or that all goals involving a given property
  <code>P</code> be tabled by calling <code>table(P)</code>. Note that if any
  property is tabled then goals such as <code>(A, ?P, ?X)</code> will all be tabled
  because the property variable might match one of the tabled properties.</p>
<p>Thus the rule set:</p>
<pre>
-&gt; table(rdfs:subClassOf).
[r1: (?A rdfs:subClassOf ?C) &lt;- (?A rdfs:subClassOf ?B) (?B rdfs:subClassOf ?C)]</pre>
<p>will successfully compute the transitive closure of the subClassOf relation.
  Any query of the form (*, rdfs:subClassOf, *) will be satisfied by a mixture
  of ground facts and resolution of rule r1. Without the first line this rule
  would be an infinite loop. </p>
<p>The tabled results of each query are kept indefinitely. This means that queries
  can exploit all of the results of the subgoals involved in previous queries.
  In essence we build up a closure of the data set in response to successive queries.
  The <code>reset()</code> operation on the inference model will force these tabled
  results to be discarded, thus saving memory at the expense of response time
  for future queries.</p>
<p>When the inference Model is updated by adding or removing statements all tabled
  results are discarded by an internal <code>reset()</code> and the next query
  will rebuild the tabled results from scratch. <br>
</p>
<p>Note that backward rules can only have one consequent so that if writing rules that
might be run in either backward or forward mode then they should be limited to a single consequent each.
</p>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Hybrid rule engine {#RULEhybrid}
<p>The rule reasoner has the option of employing both of the individual rule engines
  in conjunction. When run in this <i>hybrid</i> mode the data flows look something
  like this: </p>
<p align="center"><img src="jena-inf-figure2.png"></p>
<p align="left">The forward engine runs, as described above, and maintains a set
  of inferred statements in the <i>deductions</i> store. Any forward rules which
  assert new backward rules will instantiate those rules according to the forward
  variable bindings and pass the instantiated rules on to the backward engine.</p>
<p align="left">Queries are answered by using the backward chaining LP engine,
  employing the merge of the supplied and generated rules applied to the merge
  of the raw and deduced data.</p>
<p align="left">This split allows the ruleset developer to achieve greater performance
  by only including backward rules which are relevant to the dataset at hand.
  In particular, we can use the forward rules to compile a set of backward rules
  from the ontology information in the dataset. As a simple example consider trying
  to implement the RDFS subPropertyOf entailments using a rule engine. A simple
  approach would involve rules like:</p>
<pre> (?a ?q ?b) &lt;- (?p rdfs:subPropertyOf ?q), (?a ?p ?b) .
</pre>
<p align="left">Such a rule would work but every goal would match the head of
  this rule and so every query would invoke a dynamic test for whether there was
  a subProperty of the property being queried for. Instead the hybrid rule:</p>
<pre>(?p rdfs:subPropertyOf ?q), notEqual(?p,?q) -&gt; [ (?a ?q ?b) &lt;- (?a ?p ?b) ] .</pre>
<p align="left">would precompile all the declared subPropertyOf relationships
  into simple chain rules which would only fire if the query goal references a
  property which actually has a sub property. If there are no subPropertyOf relationships
  then there will be no overhead at query time for such a rule.</p>
<p align="left">Note that there are no loops in the above data flows. The backward
  rules are not employed when searching for matches to forward rule terms. This
  two-phase execution is simple to understand and keeps the semantics of the rule
  engines straightforward. However, it does mean that care needs to be take when
  formulating rules. If in the above example there were ways that the subPropertyOf
  relation could be derived from some other relations then that derivation would
  have to be accessible to the forward rules for the above to be complete.</p>
<p align="left">Updates to an inference Model working in hybrid mode will discard
  all the tabled LP results, as they do in the pure backward case. However, the
  forward rules still work incrementally, including incrementally asserting or
  removing backward rules in response to the data changes.</p>

<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### GenericRuleReasoner configuration {#RULEconfiguration}
<p>As with the other reasoners there are a set of parameters, identified by RDF
  properties, to control behaviour of the <code>GenericRuleReasoner</code>. These
  parameters can be set using the <code>Reasoner.setParameter</code> call or passed
  into the Reasoner factory in an RDF Model.</p>
<p>The primary parameter required to instantiate a useful <code>GenericRuleReasoner</code>
  is a rule set which can be passed into the constructor, for example:</p>
<pre>String ruleSrc = "[rule1: (?a eg:p ?b) (?b eg:p ?c) -&gt; (?a eg:p ?c)]";
List rules = Rule.parseRules(ruleSrc);
...
Reasoner reasoner = new GenericRuleReasoner(rules);</pre>
<p>A short cut, useful when the rules are defined in local text files using the
  syntax described earlier, is the <code>ruleSet</code> parameter which gives
  a file name which should be loadable from either the classpath or relative to
  the current working directory.<br>
</p>

#### Summary of parameters
<table width="90%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="26%"><b>Parameter</b></td>
    <td width="23%"><b>Values</b></td>
    <td width="51%"><b>Description</b></td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPruleMode</div>
    </td>
    <td width="23%">&quot;forward&quot;, &quot;forwardRETE&quot;, &quot;backward&quot;,
      &quot;hybrid&quot; </td>
    <td width="51%">
      <div align="left">Sets the rule direction mode as discussed above. Default
        is &quot;hybrid&quot;.</div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPruleSet</div>
    </td>
    <td width="23%">filename-string</td>
    <td width="51%">
      <div align="left">The name of a rule text file which can be found on the
        classpath or from the current directory. </div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPenableTGCCaching</div>
    </td>
    <td width="23%">Boolean</td>
    <td width="51%">
      <div align="left">If true, causes an instance of the TransitiveReasoner
        to be inserted in the forward dataflow to cache the transitive closure
        of the subProperty and subClass lattices.</div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPenableFunctorFiltering</div>
    </td>
    <td width="23%">Boolean</td>
    <td width="51%">
      <div align="left">If set to true, this causes the structured literals (functors)
        generated by rules to be filtered out of any final queries. This allows
        them to be used for storing intermediate results hidden from the view
        of the InfModel's clients.</div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPenableOWLTranslation</div>
    </td>
    <td width="23%">Boolean</td>
    <td width="51%">
      <div align="left">If set to true this causes a procedural preprocessing
        step to be inserted in the dataflow which supports the OWL reasoner (it
        translates intersectionOf clauses into groups of backward rules in a way
        that is clumsy to express in pure rule form).</div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPtraceOn</div>
    </td>
    <td width="23%">Boolean</td>
    <td width="51%">
      <div align="left">If true, switches on exhaustive tracing of rule executions
        at the <i>INFO</i> level.</div>
    </td>
  </tr>
  <tr>
    <td width="26%">
      <div align="left">PROPderivationLogging</div>
    </td>
    <td width="23%">Boolean</td>
    <td width="51%">
      <div align="left">If true, causes derivation routes to be recorded internally
        so that future getDerivation calls can return useful information.</div>
    </td>
  </tr>
</table>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Builtin primitives {#RULEbuiltins}
<p>The procedural primitives which can be called by the rules are each implemented
  by a Java object stored in a registry. Additional primitives can be created
  and registered - see below for more details.</p>
<p>Each primitive can optionally be used in either the rule body, the rule head
  or both. If used in the rule body then as well as binding variables (and any
  procedural side-effects like printing) the primitive can act as a test - if
  it returns false the rule will not match. Primitives used in the rule head
  are only used for their side effects.</p>
<p>The set of builtin primitives available at the time writing are:</p>
<table width="90%" border="1" cellspacing="0" cellpadding="0">
  <tr>
    <td width="41%">Builtin</td>
    <td width="59%">Operations</td>
  </tr>
  <tr>
    <td width="41%">
      <p>isLiteral(?x) notLiteral(?x)<br>
        isFunctor(?x) notFunctor(?x)<br>
        isBNode(?x) notBNode(?x)</p>
    </td>
    <td width="59%">
      <div align="left">Test whether the single argument is or is not a literal,
        a functor-valued literal or a blank-node, respectively.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">bound(?x...) unbound(?x..)</td>
    <td width="59%">
      <div align="left">Test if all of the arguments are bound (not bound) variables</div>
    </td>
  </tr>
  <tr>
    <td width="41%">equal(?x,?y) notEqual(?x,?y)</td>
    <td width="59%">
      <div align="left">Test if x=y (or x != y). The equality test is semantic
        equality so that, for example, the xsd:int 1 and the xsd:decimal 1 would
        test equal.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">
      <p>lessThan(?x, ?y), greaterThan(?x, ?y)<br>
        le(?x, ?y), ge(?x, ?y)</p>
    </td>
    <td width="59%">
      <div align="left">Test if x is &lt;, &gt;, &lt;= or &gt;= y. Only passes
        if both x and y are numbers or time instants (can be integer or
floating point or XSDDateTime).</div>
    </td>
  </tr>
  <tr>
    <td width="41%">
      <p>sum(?a, ?b, ?c)<br>
        addOne(?a, ?c)<br>
        difference(?a, ?b, ?c)<br>
        min(?a, ?b, ?c)<br>
        max(?a, ?b, ?c)<br>
        product(?a, ?b, ?c)<br>
        quotient(?a, ?b, ?c)</p>
      </td>
    <td width="59%">
      <div align="left">Sets c to be (a+b), (a+1) (a-b), min(a,b), max(a,b), (a*b), (a/b). Note that these
        do not run backwards, if in <code>sum</code> a and c are bound and b is
        unbound then the test will fail rather than bind b to (c-a). This could
        be fixed.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">
      <p>strConcat(?a1, .. ?an, ?t)<br>
        uriConcat(?a1, .. ?an, ?t)</p>
      </td>
    <td width="59%">
      <div align="left">Concatenates the lexical form of all the arguments except
      the last, then binds the last argument to a plain literal (strConcat) or a
      URI node (uriConcat) with that lexical form. In both cases if an argument
      node is a URI node the URI will be used as the lexical form.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">
      <p>regex(?t, ?p)<br>regex(?t, ?p, ?m1, .. ?mn)</p>
      </td>
    <td width="59%">
      <div align="left">Matches the lexical form of a literal (?t) against
      a regular expression pattern given by another literal (?p).
      If the match succeeds, and if there are any additional arguments then
      it will bind the first n capture groups to the arguments ?m1 to ?mn.
      The regular expression pattern syntax is that provided by java.util.regex.
      Note that the capture groups are numbered from 1 and the first capture group
      will be bound to ?m1, we ignore the implicit capture group 0 which corresponds to
      the entire matched string. So for example
      <pre>regexp('foo bar', '(.*) (.*)', ?m1, ?m2)</pre>
      will bind <code>m1</code> to <code>"foo"</code> and <code>m2</code> to <code>"bar"</code>.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">now(?x)</td>
    <td width="59%">
      <div align="left">Binds ?x to an xsd:dateTime value corresponding to the current time.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">makeTemp(?x)</td>
    <td width="59%">
      <div align="left">Binds ?x to a newly created blank node.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">makeInstance(?x, ?p, ?v)<br>
      makeInstance(?x, ?p, ?t, ?v)</td>
    <td width="59%">
      <div align="left">Binds ?v to be a blank node which is asserted as the value
        of the ?p property on resource ?x and optionally has type ?t. Multiple
        calls with the same arguments will return the same blank node each time
        - thus allowing this call to be used in backward rules.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">makeSkolem(?x, ?v1, ... ?vn)</td>
    <td width="59%">
      <div align="left">Binds ?x to be a blank node. The blank node is generated
      based on the values of the remain ?vi arguments, so the same combination of
      arguments will generate the same bNode.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">noValue(?x, ?p)<br>
      noValue(?x ?p ?v)</td>
    <td width="59%">
      <div align="left">True if there is no known triple (x, p, *) or (x, p, v)
        in the model or the explicit forward deductions so far. </div>
    </td>
  </tr>
  <tr>
    <td width="41%">remove(n, ...)<br />drop(n, ...)</td>
    <td width="59%">
      <div align="left">Remove the statement (triple) which caused the n'th body
        term of this (forward-only) rule to match. Remove will propagate the
        change to other consequent rules including the firing rule (which must
        thus be guarded by some other clauses).
        In particular, if the removed statement (triple) appears in the body of
        a rule that has already fired, the consequences of such rule are
        retracted from the deducted model.
         Drop will silently remove the
        triple(s) from the graph but not fire any rules as a consequence.
        These are clearly non-monotonic operations and, in particular, the
        behaviour of a rule set in which different rules both drop and create the
        same triple(s) is undefined.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">isDType(?l, ?t) notDType(?l, ?t)</td>
    <td width="59%">
      <div align="left">Tests if literal ?l is (or is not) an instance of the
        datatype defined by resource ?t.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">print(?x, ...)</td>
    <td width="59%">
      <div align="left">Print (to standard out) a representation of each argument.
        This is useful for debugging rather than serious IO work.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">listContains(?l, ?x) <br />listNotContains(?l, ?x)</td>
    <td width="59%">
      <div align="left">Passes if ?l is a list which contains (does not contain) the element ?x,
      both arguments must be ground, can not be used as a generator.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">listEntry(?list, ?index, ?val)</td>
    <td width="59%">
      <div align="left">Binds ?val to the ?index'th entry
in the RDF list ?list. If there is no such entry the variable will be unbound
and the call will fail. Only usable in rule bodies.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">listLength(?l, ?len)</td>
    <td width="59%">
      <div align="left">Binds ?len to the length of the list ?l.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">listEqual(?la, ?lb) <br />listNotEqual(?la, ?lb)</td>
    <td width="59%">
      <div align="left">listEqual tests if the two arguments are both lists and contain
      the same elements. The equality test is semantic equality on literals (sameValueAs) but
      will not take into account owl:sameAs aliases. listNotEqual is the negation of this (passes if listEqual fails).</div>
    </td>
  </tr>
  <tr>
    <td width="41%">listMapAsObject(?s, ?p ?l) <br /> listMapAsSubject(?l, ?p, ?o)</td>
    <td width="59%">
      <div align="left">These can only be used as actions in the head of a rule.
      They deduce a set of triples derived from the list argument ?l : listMapAsObject asserts
      triples (?s ?p ?x) for each ?x in the list ?l, listMapAsSubject asserts triples (?x ?p ?o). </div>
    </td>
  </tr>

  <tr>
    <td width="41%">table(?p) tableAll()</td>
    <td width="59%">
      <div align="left">Declare that all goals involving property ?p (or all goals)
        should be tabled by the backward engine.</div>
    </td>
  </tr>
  <tr>
    <td width="41%">hide(p)</td>
    <td width="59%">
      <div align="left">Declares that statements involving the predicate p should be hidden.
Queries to the model will not report such statements. This is useful to enable non-monotonic
forward rules to define flag predicates which are only used for inference control and
do not "pollute" the inference results.</div>
    </td>
  </tr>
</table>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Example {#RULEexamples}
<p>As a simple illustration suppose we wish to create a simple ontology language
  in which we can declare one property as being the concatenation of two others
  and to build a rule reasoner to implement this.</p>
<p>As a simple design we define two properties eg:concatFirst, eg:concatSecond
  which declare the first and second properties in a concatenation. Thus the triples:</p>
<pre>eg:r eg:concatFirst  eg:p .
eg:r eg:concatSecond eg:q . </pre>
<p>mean that the property r = p o q.</p>
<p>Suppose we have a Jena Model rawModel which contains the above assertions together
  with the additional facts:</p>
<pre>eg:A eg:p eg:B .
eg:B eg:q eg:C .</pre>
<p>Then we want to be able to conclude that A is related to C through the composite
  relation r. The following code fragment constructs and runs a rule reasoner
  instance to implement this:</p>
<pre>String rules =
    "[r1: (?c eg:concatFirst ?p), (?c eg:concatSecond ?q) -&gt; " +
    "     [r1b: (?x ?c ?y) &lt;- (?x ?p ?z) (?z ?q ?y)] ]";
Reasoner reasoner = new GenericRuleReasoner(Rule.parseRules(rules));
InfModel inf = ModelFactory.createInfModel(reasoner, rawData);
System.out.println("A * * =&gt;");
Iterator list = inf.listStatements(A, null, (RDFNode)null);
while (list.hasNext()) {
    System.out.println(" - " + list.next());
}</pre>
<p>When run on a rawData model contain the above four triples this generates the
  (correct) output:</p>
<pre><i>A * * =&gt;
 - [urn:x-hp:eg/A, urn:x-hp:eg/p, urn:x-hp:eg/B]
 - [urn:x-hp:eg/A, urn:x-hp:eg/r, urn:x-hp:eg/C]</i></pre>

#### Example 2
<p>As a second example, we'll look at ways to define a property as being both
  symmetric and transitive. Of course, this can be done directly in OWL but there
  are times when one might wish to do this outside of the full OWL rule set and,
  in any case, it makes for a compact illustration.</p>
<p>This time we'll put the rules in a separate file to simplify editing them and
  we'll use the machinery for configuring a reasoner using an RDF specification.
  The code then looks something like this:</p>
<pre>// Register a namespace for use in the demo
String demoURI = "http://jena.hpl.hp.com/demo#";
PrintUtil.registerPrefix("demo", demoURI);

// Create an (RDF) specification of a hybrid reasoner which
// loads its data from an external file.
Model m = ModelFactory.createDefaultModel();
Resource configuration =  m.createResource();
configuration.addProperty(ReasonerVocabulary.PROPruleMode, "hybrid");
configuration.addProperty(ReasonerVocabulary.PROPruleSet,  "data/demo.rules");

// Create an instance of such a reasoner
Reasoner reasoner = GenericRuleReasonerFactory.theInstance().create(configuration);

// Load test data
Model data = RDFDataMgr.loadModel("file:data/demoData.rdf");
InfModel infmodel = ModelFactory.createInfModel(reasoner, data);

// Query for all things related to "a" by "p"
Property p = data.getProperty(demoURI, "p");
Resource a = data.getResource(demoURI + "a");
StmtIterator i = infmodel.listStatements(a, p, (RDFNode)null);
while (i.hasNext()) {
    System.out.println(" - " + PrintUtil.print(i.nextStatement()));
}</pre>
<p>Here is file <code>data/demo.rules</code> which defines property <code>demo:p</code>
  as being both symmetric and transitive using pure forward rules:</p>
<pre>[transitiveRule: (?A demo:p ?B), (?B demo:p ?C) -&gt; (?A &gt; demo:p ?C) ]
[symmetricRule: (?Y demo:p ?X) -&gt; (?X demo:p ?Y) ] </pre>
<p> Running this on <a href="data/demoData.rdf">data/demoData.rdf</a> gives the
  correct output:</p>
<pre>- (demo:a demo:p demo:c)
- (demo:a demo:p demo:a)
- (demo:a demo:p demo:d)
- (demo:a demo:p demo:b)</pre>
<p>However, those example rules are overly specialized. It would be better to
  define a new class of property to indicate symmetric-transitive properties and
  and make <code>demo:p</code> a member of that class. We can generalize the rules
  to support this:</p>
<pre>[transitiveRule: (?P rdf:type demo:TransProp)(?A ?P ?B), (?B ?P ?C)
                     -&gt; (?A ?P ?C) ]
[symmetricRule: (?P rdf:type demo:TransProp)(?Y ?P ?X)
                     -&gt; (?X ?P ?Y) ]</pre>
<p> These rules work but they compute the complete symmetric-transitive closure
  of p when the graph is first prepared. Suppose we have a lot of p values but
  only want to query some of them it would be better to compute the closure on
  demand using backward rules. We could do this using the same rules run in pure
  backward mode but then the rules would fire lots of times as they checked every
  property at query time to see if it has been declared as a <code>demo:TransProp</code>.
  The hybrid rule system allows us to get round this by using forward rules to
  recognize any <code>demo:TransProp</code> declarations once and to generate
  the appropriate backward rules:</p>
<pre>-&gt; tableAll().

[rule1: (?P rdf:type demo:TransProp) -&gt;
      [ (?X ?P ?Y) &lt;- (?Y ?P ?X) ]
      [ (?A ?P ?C) &lt;- (?A ?P ?B), (?B ?P ?C) ]
] </pre>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Combining RDFS/OWL with custom rules {#RDFSPlusRules}
<p>Sometimes one wishes to write generic inference rules but combine them
 with some RDFS or OWL inference. With the current Jena architecture limited forms of this
 is possible but you need to be aware of the limitations.</p>
<p>There are two ways of achieving this sort of configuration within Jena (not
 counting using an external engine that already supports such a combination).</p>
<p>Firstly, it is possible to cascade reasoners, i.e. to construct one InfModel
 using another InfModel as the base data. The strength of this approach is that
 the two inference processes are separate and so can be of different sorts. For
 example one could create a GenericRuleReasoner whose base model is an external
 OWL reasoner. The chief weakness of the approach is that it is "layered" - the
 outer InfModel can see the results of the inner InfModel but not vice versa.
 For some applications that layering is fine and it is clear which way the
 inference should be layered, for some it is not. A second possible weakness
 is performance. A query to an InfModel is generally expensive and involves lots
 of queries to the data. The outer InfModel in our layered case will
 typically issue a lot of queries to the inner model, each of which may
 trigger more inference. If the inner model caches all of its inferences
 (e.g. a forward rule engine) then there may not be very much redundancy there but
 if not then performance can suffer dramatically. </p>
<p>Secondly, one can create a single GenericRuleReasoner whose rules combine
 rules for RDFS or OWL and custom rules. At first glance this looks like it
 gets round the layering limitation. However, the default Jena RDFS and OWL
 rulesets use the Hybrid rule engine. The hybrid engine is itself layered, forward rules
 do not see the results of any backward rules. Thus layering is still present though you
 have finer grain control - all your inferences you want the RDFS/OWL rules to see
 should be forward, all the inferences which need all of the results of the RDFS/OWL rules
 should be backward. Note that the RDFS and OWL rulesets assume certain settings
 for the GenericRuleReasoner so a typical configuration is:</p>

    Model data = RDFDataMgr.loadModel("file:data.n3");
    List rules = Rule.rulesFromURL("myrules.rules");

    GenericRuleReasoner reasoner = new GenericRuleReasoner(rules);
    reasoner.setOWLTranslation(true);               // not needed in RDFS case
    reasoner.setTransitiveClosureCaching(true);

    InfModel inf = ModelFactory.createInfModel(reasoner, data);

<p>Where the <code>myrules.rules</code> file will use <code>@include</code> to include
 one of the RDFS or OWL rule sets.</p>
<p>One  useful variant on this option, at least in simple cases, is
 to manually include a pure (non-hybrid) ruleset for the RDFS/OWL fragment
 you want so that there is no layering problem. [The reason the default
 rulesets use the hybrid mode is a performance tradeoff - trying to
 balance the better performance of forward reasoning with the cost of
 computing all possible answers when an application might only want a few.]</p>
<p>
 A simple example of this is that the <em>interesting</em> bits of RDFS
 can be captured by enabling TransitiveClosureCaching and including just the
 four core rules:</p>
<pre>
[rdfs2:  (?x ?p ?y), (?p rdfs:domain ?c) -&gt; (?x rdf:type ?c)]
[rdfs3:  (?x ?p ?y), (?p rdfs:range ?c) -&gt; (?y rdf:type ?c)]
[rdfs6:  (?a ?p ?b), (?p rdfs:subPropertyOf ?q) -&gt; (?a ?q ?b)]
[rdfs9:  (?x rdfs:subClassOf ?y), (?a rdf:type ?x) -&gt; (?a rdf:type ?y)]
</pre>

<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Notes {#RULEnotes}
<p>One final aspect of the general rule engine to mention is that of validation
  rules. We described earlier how reasoners can implement a <code>validate</code>
  call which returns a set of error reports and warnings about inconsistencies
  in a dataset. Some reasoners (e.g. the RDFS reasoner) implement this feature
  through procedural code. Others (e.g. the OWL reasoner) does so using yet more
  rules.</p>
<p>Validation rules take the general form:</p>
<pre>(?v rb:validation on()) ...  -&gt;
    [ (?X rb:violation error('summary', 'description', args)) &lt;- ...) ] .</pre>
<p>The validation calls can be "switched on" by inserting an
  additional triple into the graph of the form:</p>
<pre>_:anon rb:validation on() .</pre>
<p>This makes it possible to build rules, such as the template above, which are
  ignored unless validation has been switched on - thus avoiding potential overhead
  in normal operation. This is optional and the &quot;validation on()&quot; guard
  can be omitted.</p>
<p>Then the validate call queries the inference graph for all triples of the form:</p>
<pre>?x rb:violation f(summary, description, args) .</pre>
<p>The subject resource is the &quot;prime suspect&quot; implicated in the inconsistency,
  the relation<code> rb:violation</code> is a reserved property used to communicate
  validation reports from the rules to the reasoner, the object is a structured
  (functor-valued) literal. The name of the functor indicates the type of violation
  and is normally <code>error</code> or <code>warning</code>, the first argument
  is a short form summary of the type of problem, the second is a descriptive
  text and the remaining arguments are other resources involved in the inconsistency.
</p>
<p>Future extensions will improve the formatting capabilities and flexibility
  of this mechanism. </p>
<p>[<a href="#rules">Rule Index</a>] [<a href="#index">Main Index</a>]</p>

### Extensions {#RULEextensions}
<p>There are several places at which the rule system can be extended by application
  code.</p>

#### Rule syntax
<p>First, as mentioned earlier, the rule engines themselves only see rules in
  terms of the Rule Java object. Thus applications are free to define an alternative
  rule syntax so long as it can be compiled into Rule objects.</p>

#### Builtins
<p>Second, the set of procedural builtins can be extended. A builtin should implement
  the <a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/Builtin.html"><code>Builtin</code></a>
  interface. The easiest way to achieve this is by subclassing <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/builtins/BaseBuiltin.html">BaseBuiltin</a></code>
  and defining a name (<code>getName</code>), the number of arguments expected
  (<code>getArgLength</code>) and one or both of <code>bodyCall</code> and <code>headAction</code>.
  The <code>bodyCall</code> method is used when the builtin is invoked in the
  body of a rule clause and should return true or false according to whether the
  test passes. In both cases the arguments may be variables or bound values and
  the supplied <code><a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/RuleContext.html">RuleContext</a></code>
  object can be used to dereference bound variables and to bind new variables.
</p>
<p>Once the Builtin has been defined then an instance of it needs to be registered
  with <a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/BuiltinRegistry.html"><code>BuiltinRegistry</code></a>
  for it to be seen by the rule parser and interpreters.</p>
<p>The easiest way to experiment with this is to look at the examples in the builtins
  directory. </p>

#### Preprocessing hooks
<p>The rule reasoner can optionally run a sequence of procedural preprocessing
  hooks over the data at the time the inference graph is <i>prepared</i>. These
  procedural hooks can be used to perform tests or translations which are slow
  or inconvenient to express in rule form. See <code>GenericRuleReasoner.addPreprocessingHook</code>
  and the <a href="/documentation/javadoc/jena/org/apache/jena/reasoner/rulesys/RulePreprocessHook.html"><code>RulePreprocessHook</code></a>
  class for more details.</p>
<p>[<a href="#index">Index</a>]</p>

## Extending the inference support {#extensions}
<p>Apart from the extension points in the rule reasoner discussed above, the intention
  is that it should be possible to plug external inference engines into Jena.
  The core interfaces of <code>InfGraph</code> and <code>Reasoner</code> are kept
  as simple and generic as we can to make this possible and the <code>ReasonerRegistry</code>
  provides a means for mapping from reasoner ids (URIs) to reasoner instances
  at run time.</p>
<p>In a future Jena release we plan to provide at least one adapter to an example,
  freely available, reasoner to both validate the machinery and to provide an
  example of how this extension can be done.</p>
<p>[<a href="#index">Index</a>]</p>

## Futures {#futures}
<p>Contributions for the following areas would be very welcome:</p>
<ul>
  <li>Develop a custom equality reasoner which can handle the &quot;owl:sameAs&quot;
    and related processing more efficiently that the plain rules engine.</li>
  <li>Tune the RETE engine to perform better with highly non-ground patterns.</li>
  <li>Tune the LP engine to further reduce memory usage (in particular explore
    subsumption tabling rather than the current variant tabling).</li>
  <li>Investigate routes to better integrating the rule reasoner with underlying
    database engines. This is a rather larger and longer term task than the others
    above and is the least likely to happen in the near future.</li>
</ul>
<p>[<a href="#index">Index</a>]</p>
