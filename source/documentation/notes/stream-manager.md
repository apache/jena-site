---
title: The Jena StreamManager and LocationMapper
---

The StreamManager is a utility to find and read files into models.
There is a standard global StreamManager and applications may also
define specific ones by constructing additional StreamManagers.

The LocationMapper provides alternative locations for RDF data.

## The Stream Manager

Files are named by a string, according to the conventions of their
storage system. Typically this is by URI. There are a number of
storage system adapters provided:

- File locator (with own current directory)
- URL locator (HTTP and FTP)
- Class loader locator
- Zip file locator

The global stream manager has a file location, a URL locator and a
class loader (tried in that order).

A StreamManager can have an associated LocationMapper that transforms
names before use. This means local copies of documents can be used
transparently to the rest of the application.

A StreamManager provides an "open" operation to get an `InputStream`
to the resource.

## The LocationMapper configuration file

Location mapping files are RDF - they may be written in RDF/XML, Turtle
(file suffix `.ttl`) or N-Triples (file suffix `.nt`). The default
is RDF/XML unless one of these suffices is found.

    @prefix lm: <http://jena.hpl.hp.com/2004/08/location-mapping#> .

    [] lm:mapping
       [ lm:name "file:foo.ttl" ;     lm:altName "file:etc/foo.ttl" ] ,
       [ lm:prefix "file:etc/" ;      lm:altPrefix "file:ETC/" ] ,
       [ lm:name "file:etc/foo.ttl" ; lm:altName "file:DIR/foo.ttl" ]
       .

There are two types of location mapping: exact match renaming and
prefix renaming. When trying to find an alternative location, a
LocationMapper first tries for an exact match; if none is found,
the LocationMapper will search for the longest matching prefix. If
two are the same length, there is no guarantee on order tried;
there is no implied order in a location mapper configuration file
(it sets up two hash tables).

In the example above, `file:etc/foo.ttl` becomes `file:DIR/foo.ttl`
because that is an exact match. The prefix match of file:etc/ is
ignored.

All string tests are done case sensitively because the primary use
is for URLs.

Notes:

- Property values are not URIs, but strings. This is a system
  feature, not an RDF feature. Prefix mapping is name rewriting;
  alternate names are not treated as equivalent resources in the rest
  of Jena. While application writers are encouraged to use URIs to
  identify files, this is not always possible.
- There is no check to see if the alternative system resource is
  equivalent to the original.

A LocationMapper finds its configuration file by looking for the
following files, in order:

- `location-mapping.ttl`
- `location-mapping.rdf`
- `etc/location-mapping.rdf`
- `etc/location-mapping.ttl`

This is specified as a path - note the path separator is always
the character ';' regardless of operating system because URLs
contain ':'.

`location-mapping.ttl;location-mapping.rdf;etc/location-mapping.rdf;etc/location-mapping.ttl`

Applications can also set mappings programmatically.
No configuration file is necessary.

The base URI for reading models with the StreamManager will be the
original URI, not the alternative location.

### Debugging

If log4j2, set the logging level of the classes:

    logger.filemanager.name        = org.apache.jena.riot.system.stream.StreamManager
    logger.filemanager.level       = ALL
    logger.location-manager.name   = org.apache.jena.riot.system.stream.LocationMapper
    logger.location-manager.level  = ALL

### See also

Javadoc:

- [StreamManager](/documentation/javadoc/arq/org/apache/jena/riot/system/stream/StreamManager.html)
- [LocationMapper](/documentation/javadoc/arq/org/apache/jena/riot/system/stream/LocationMapper.html)
