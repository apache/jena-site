---
title: Jena Security Advisories
---

The Jena project has issued a number of security advisories during the lifetime of the project.  On this page you'll
find details of our [security issue process](#process), as well as a listing of our past [CVEs](#jena-cves) as well as relevant [Dependency CVEs](#cves-in-jena-dependencies).


## Process

Jena follows the standard [ASF Security for Committers](https://www.apache.org/security/committers.html) policy for
reporting and addressing security issues.

If you think you have identified a Security issue in our project please refer to that policy for how to report it, and
the process that the Jena Project Management Committee (PMC) will follow in addressing the issue.

## Single Supported Version

As a project, Apache Jena only has the resources to maintain a single release
version.  Any accepted security issue will be fixed in a future release in a timeframe appropriate to the severity of the issue.  

## Standard Mitigation Advice

Note that as a project our guidance to users is **always** to use the newest Jena version available to ensure you have
any security fixes we have made available.

Where more specific mitigations are available these will be denoted in the individual CVEs.

## End of Life (EOL) Components

Where a security advisory is issued for a component that is already EOL (sometimes referred to as archived or retired
within our documentation) then we will not fix the issue but instead reiterate our previous recommendations that users
cease using the EOL component and migrate to actively supported components.

Such issues will follow the [CVE EOL Assignment
Process](https://cve.mitre.org/cve/cna/CVE_Program_End_of_Life_EOL_Assignment_Process.html) and will be clearly denoted
by the **UNSUPPORTED WHEN ASSIGNED** text at the start of the description.

## Security Issues in Dependencies

For our dependencies the project relies primarily upon GitHub Dependabot Alerts to be made aware of available dependency
updates, whether security related or otherwise.  When a security related update is released and our analysis shows that
Jena users may be affected we endeavour to take the dependency upgrade ASAP and make a new release in timeframe
appropriate to the severity of the issue.

# Jena CVEs

The following CVEs specifically relate to the Jena codebase itself and have been addressed by the project. Per our
policy above we advise users to always utilise the latest Jena release available.

Please refer to the individual CVE links for further details and mitigations.

## CVE-2022-45136 - JDBC Serialisation in Apache Jena SDB

[CVE-2022-45136](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-45136) affects all versions of [Jena
SDB](../documentation/archive/sdb/) up to and including the final `3.17.0` release.

Apache Jena SDB has been EOL since December 2020 and we recommend any remaining users migrate to [Jena TDB
2](../documentation/tdb2/) or other 3rd party vendor alternatives.

Apache Jena would like to thank Crilwa & LaNyer640 for reporting this issue

## CVE-2022-28890 - Processing External DTDs

[CVE-2022-28890](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-28890) affects the RDF/XML parser in Jena 4.4.0
only.

Users should upgrade to latest Jena 4.x [release](../download/) available.

Apache Jena would like to thank Feras Daragma, Avishag Shapira & Amit Laish (GE Digital, Cyber Security Lab) for their
report.

## CVE-2021-39239 - XML External Entity (XXE) Vulnerability

[CVE-2021-39239](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-39239) affects XML parsing up to and including the Jena `4.1.0` release.

Users should upgrade to latest Jena 4.x [release](../download/) available.

## CVE-2021-33192 - Display information UI XSS in Apache Jena Fuseki

[CVE-2021-33192](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-33192) affected
[Fuseki](../documentation/fuseki2/) versions `2.0.0` through `4.0.0`.

Users should upgrade to latest Jena 4.x [release](../download/) available.

# CVEs in Jena Dependencies

The following advisories are CVEs in Jena's dependencies that may affect users of Jena, as with Jena specific CVEs our
standard [Security Issue Policy](#security-issue-policy) applies and any necessary dependency updates, dependency API
and/or configuration changes have been adopted and released as soon as appropriate.

## log4shell

[CVE-2021-45105](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-45046),
[CVE-2021-45105](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-45105) and
[CVE-2021-44832](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44832), collectively known as
[log4shell](https://en.wikipedia.org/wiki/Log4Shell) were several vulnerabilities identified in the [Apache
Log4j](https://logging.apache.org/log4j/2.x/index.html) project that Jena uses as the concrete logging implementation
for [Fuseki](../documentation/fuseki2/) and our command line tools.

Jena versions prior to `4.4.0` included vulnerable versions of Log4j.

Users should upgrade to latest Jena 4.x [release](../download/) available.

