---
title: Apache Jena Security
slug: index
aliases:
  - /about_jena/security-advisories
---

The Jena project has issued a number of security advisories during the lifetime
of the project. On this page you'll find details of our [security issue
process](#process).

**[Apache Jena Security Advisories](./advisories.html)**

## Process

Jena follows the standard [ASF Security for
Committers](https://www.apache.org/security/committers.html) policy for
reporting and addressing security issues.

If you think you have identified a Security issue in our project please refer to
that policy for how to report it, and the process that the Jena Project
Management Committee (PMC) will follow in addressing the issue.

## Policy

**Single Supported Version**

As a project, Apache Jena only has the resources to maintain a single release
version.  Any accepted security issue will be fixed in a future release in a
timeframe appropriate to the severity of the issue.

**Standard Mitigation Advice**

Note that as a project our guidance to users is *always* to use the newest
Jena version available to ensure you have any security fixes we have made
available.

Where more specific mitigations are available, these will be denoted in the
individual CVEs.

**End of Life (EOL) Components**

Where a security advisory is issued for a component that is already EOL
(sometimes referred to as archived or retired within our documentation) then we
will not fix the issue but instead reiterate our previous recommendations that
users cease using the EOL component and migrate to actively supported
components.

Such issues will follow the [CVE EOL Assignment
Process](https://cve.mitre.org/cve/cna/CVE_Program_End_of_Life_EOL_Assignment_Process.html)
and will be clearly denoted by the "*UNSUPPORTED WHEN ASSIGNED*" text at the
start of the description.

**Security Issues in Dependencies**

For our dependencies, the project relies primarily upon GitHub Dependabot Alerts
to be made aware of available dependency updates, whether security related or
otherwise.  When a security related update is released and our analysis shows
that Jena users may be affected we endeavour to take the dependency upgrade ASAP
and make a new release in timeframe appropriate to the severity of the issue.
