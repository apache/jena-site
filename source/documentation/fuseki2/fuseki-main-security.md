---
title: Security in Fuseki2 server
---
This page covers security for Fuseki Main.

See other [documentation](./fusek0-security.html) for the webapp packaging of Fuseki.

## Serving RDF

For any use of users-password information, and especially HTTP basic
authentication, information is visible in the HTTP headers. When serving RDF and SPARQL requests, using HTTPS is necessary to avoid snooping.
Digest authentication is also stronger over HTTPS
because it protects against man-in-the-middle attacks.