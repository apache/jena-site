---
title: Home
---

<div class="px-5 my-4 bg-light rounded-3" id="jumbotron">
  <div class="container-fluid py-5">
  <h1 class="display-5 fw-bold"><img alt="Apache Jena" src="/images/jena-logo/jena-logo-jumbotron.png"/> Apache Jena</h1>
  <p class="lead">A free and open source Java framework for building <a href="https://www.w3.org/standards/semanticweb/">Semantic Web</a> and <a href="https://www.w3.org/standards/semanticweb/data">Linked Data</a> applications.</p>
  <p>
    <a href="/getting_started/index.html" class="btn-jumbotron btn btn-primary btn-lg"><span class="bi-chevron-right"></span>Get started now!</a>
    <a href="/download/index.cgi" class="btn-jumbotron btn btn-primary btn-lg pl-4"><span class="bi-download"></span>Download</a>
  </p>
  </div><!-- end hero unit -->
</div>

<div class="row row-cols-1 row-cols-lg-3" id="landing-page-cards">
  <div class="col-lg-4">
    <div class="card">
      <div class="card-header">
        <h2>RDF</h2>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/rdf/index.html">RDF API</a></h3>
        <p class="card-text">Interact with the core API to create and read <a href="https://www.w3.org/RDF/">Resource Description Framework</a> (RDF) graphs. Serialise your triples using popular formats such as <a href="https://en.wikipedia.org/wiki/RDF/XML">RDF/XML</a> or <a href="https://en.wikipedia.org/wiki/Turtle_(syntax)">Turtle</a>.</p>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/query/index.html">ARQ (SPARQL)</a></h3>
        <p class="card-text">Query your RDF data using ARQ, a <a href="https://www.w3.org/TR/sparql11-query/">SPARQL 1.1</a> compliant engine. ARQ supports remote federated queries and free text search.</p>
      </div>
    </div>
  </div>

  <div class="col-lg-4 mt-4 mt-md-0">
    <div class="card">
      <div class="card-header">
        <h2>Triple store</h2>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/tdb/index.html">TDB</a></h3>
        <p class="card-text">Persist your data using TDB, a native high performance triple store. TDB supports the full range of Jena APIs.</p>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/fuseki2/index.html">Fuseki</a></h3>
        <p class="card-text">Expose your triples as a SPARQL end-point accessible over HTTP. Fuseki provides REST-style interaction with your RDF data.</p>
      </div>
    </div>
  </div>

  <div class="col-lg-4 mt-4 mt-md-0">
    <div class="card">
      <div class="card-header">
        <h2>OWL</h2>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/ontology/">Ontology API</a></h3>
        <p class="card-text">Work with models, RDFS and the <a href="https://www.w3.org/standards/techs/owl#w3c_all">Web Ontology Language</a> (OWL) to add extra semantics to your RDF data.</p>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/documentation/inference/index.html">Inference API</a></h3>
        <p class="card-text">Reason over your data to expand and check the content of your triple store. Configure your own inference rules or use the built-in OWL and RDFS <a href="https://en.wikipedia.org/wiki/Semantic_reasoner">reasoners</a>.</p>
      </div>
    </div>
  </div>
</div>
