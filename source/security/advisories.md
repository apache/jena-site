---
title: Apache Jena Security Advisories
---

The Jena project has issued a number of security advisories during the lifetime
of the project. On this page you'll find details of our past [CVEs](#jena-cves)
and relevant [Dependency CVEs](#cves-in-jena-dependencies).

## Jena CVEs

The following CVEs specifically relate to the Jena codebase itself and have been
addressed by the project. Per our policy above we advise users to always utilise
the latest Jena release available.

Please refer to the individual CVE links for further details and mitigations.

**CVE-2025-50151 - Configuration files uploaded by administrative users are not checked properly**

[CVE-2025-50151](https://www.cve.org/CVERecord?id=CVE-2025-50151) affects Jena
Fuseki in versions up to 5.4.0.

Configuration files could be uploaded by users with administrator access via the
network. The file paths in configuration files were not validated and could
refer to directories and files outside of the Fuseki server instance.

This configuration file upload feature has been removed in Jena Fuseki 5.5.0.

**CVE-2025-49656 - Administrative users can create files outside the server directory space via the admin UI**

[CVE-2025-49656](https://www.cve.org/CVERecord?id=CVE-2025-49656)  affects Jena
Fuseki in versions up to 5.4.0.

Users with administrator access can create databases that refer to files outside
the files area of the Fuseki server.

Users are recommended to upgrade to version 5.5.0 where path names are validated
and restricted to the files area of the Fuseki server instance.

**CVE-2023-32200 - Exposure of execution in script engine expressions**

[CVE-2023-32200](https://www.cve.org/CVERecord?id=CVE-2023-32200) affects Jena
3.7.0 through Jena 4.8.0 and relates to the [Javascript SPARQL
Functions](https://jena.apache.org/documentation/query/javascript-functions.html)
feature of our ARQ SPARQL engine.

There is insufficient restrictions of called script functions in Apache Jena
versions 4.8.0 and earlier, when invoking custom scripts. It allows a remote
user to execute javascript via a SPARQL query.

From Jena 4.9.0, script functions **MUST** be added to an explicit "allow" list
for them to be called from the SPARQL query engine. This is in addition to the
script enabling controls of Jena 4.8.0 which **MUST** also be applied.

Users should upgrade to latest Jena 4.x [release](../download/) available.

**CVE-2023-22665 - Exposure of arbitrary execution in script engine expressions**

[CVE-2023-22665](https://www.cve.org/CVERecord?id=CVE-2023-22665) affects Jena
3.7.0 through 4.7.0 and relates to the [Javascript SPARQL
Functions](https://jena.apache.org/documentation/query/javascript-functions.html)
feature of our ARQ SPARQL engine.

From Jena 4.8.0 onwards this feature **MUST** be explicitly enabled by end
users, and on newer JVMs (Java 17 onwards) a JavaScript script engine **MUST**
be explicitly added to the environment.

However, when enabled this feature does expose the majority of the underlying
scripting engine directly to SPARQL queries so may provide a vector for
arbitrary code execution.  Therefore, it is recommended that this feature remain
disabled for any publicly accessible deployment that utilises the ARQ query
engine.

Users should upgrade to latest Jena 4.x [release](../download/) available.

**CVE-2022-45136 - JDBC Serialisation in Apache Jena SDB**

[CVE-2022-45136](https://www.cve.org/CVERecord?id=CVE-2022-45136) affects all
versions of [Jena SDB](../documentation/archive/sdb/) up to and including the
final `3.17.0` release.

Apache Jena SDB has been EOL since December 2020 and we recommend any remaining
users migrate to [Jena TDB 2](../documentation/tdb2/) or other 3rd party vendor
alternatives.

Apache Jena would like to thank Crilwa & LaNyer640 for reporting this issue

**CVE-2022-28890 - Processing External DTD**

[CVE-2022-28890](https://www.cve.org/CVERecord?id=CVE-2022-28890) affects the
RDF/XML parser in Jena 4.4.0 only.

Users should upgrade to latest Jena 4.x [release](../download/) available.

Apache Jena would like to thank Feras Daragma, Avishag Shapira & Amit Laish (GE
Digital, Cyber Security Lab) for their report.

**CVE-2021-39239 - XML External Entity (XXE) Vulnerabilit**

[CVE-2021-39239](https://www.cve.org/CVERecord?id=CVE-2021-39239) affects XML
parsing up to and including the Jena `4.1.0` release.

Users should upgrade to latest Jena 4.x [release](../download/) available.

**CVE-2021-33192 - Display information UI XSS in Apache Jena Fusek**

[CVE-2021-33192](https://www.cve.org/CVERecord?id=CVE-2021-33192) affected
[Fuseki](../documentation/fuseki2/) versions `2.0.0` through `4.0.0`.

Users should upgrade to latest Jena 4.x [release](../download/) available.

## Dependencies

The following advisories are CVEs in Jena's dependencies that may affect users
of Jena, as with Jena specific CVEs our standard [Security Issue
Policy](#security-issue-policy) applies and any necessary dependency updates,
dependency API and/or configuration changes have been adopted and released as
soon as appropriate.

**log4j2**

[CVE-2021-45105](https://www.cve.org/CVERecord?id=CVE-2021-45046),
[CVE-2021-45105](https://www.cve.org/CVERecord?id=CVE-2021-45105) and
[CVE-2021-44832](https://www.cve.org/CVERecord?id=CVE-2021-44832),
collectively known as [log4shell](https://en.wikipedia.org/wiki/Log4Shell) were
several vulnerabilities identified in the [Apache
Log4j](https://logging.apache.org/log4j/2.x/index.html) project that Jena uses
as the concrete logging implementation for [Fuseki](../documentation/fuseki2/)
and our command line tools.

Jena versions prior to `4.4.0` included vulnerable versions of Log4j.

Users should upgrade to latest Jena 4.x [release](../download/) available.
