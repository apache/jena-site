---
title: Support for Internationalised Resource Identifiers in Jena
---

The Jena IRI Library is an implementation of [RFC 3987](http://www.ietf.org/rfc/rfc3987.txt) (IRI)
and [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt) (URI),
and a partial implementation of other related standards. It is incomplete.

## Javadoc

[The IRI Library Javadoc (Public APIs)](TODO)

The most important parts of the Javadoc are:

[ViolationCodes](TODO)
Gives the relationships between the error codes and the
specifications.

[IRI](TODO)
Gives the main interface for IRIs.

[IRIFactory](TODO)
Gives the main class for creating IRIs, including specifying
which specifications you wish to be using, and with what degree of
force.

## Minimal Documentation

Unfortunately this version of the IRI Library has badly incomplete
documentation, any help in producing good documentation would be
appreciated.

The current version is incomplete with little indication as to
where. It is primarily intended to support the functionality of
checking strings against any of the various IRI or URI
specifications. Some support for different levels of checking is
provided.

These instructions are from a mail message on the `jena-dev` mailing
list.

    Summary:
    =======
    use something like:

    import org.apache.jena.iri.*;

     static IRIFactory iriFactory = IRIFactory
                                    .semanticWebImplementation();

    ...

       boolean includeWarnings = false;
       IRI iri;
       iri = iriFactory.create(iriString); // always works
       if (iri.hasViolation(includeWarnings)) {
         // bad iri code
       }

    ...

    Since you are taking IRI rules seriously, you may want to have
    includeWarnings = true in the above.

    Full version
    ============
    The code is found in the iri.jar, which is not particularly
    well documented, and the source and documentation is in the
    separate iri download, from the Jena download area.

    As shown, you start by building an IRIFactory

    org.apache.jena.iri.IRIFactory

    this embodies some set of rules, against which you will check
    an IRI.

    The one we use is:
      IRIFactory.jenaImplementation()
        For use by Jena team only.
        This method reflects the current IRI support
        in Jena, which is a moving target at present.

    (actually it hasn't ever moved - the main issue is to do with
    file: IRIs - we definitely want to be more liberal than a
    conservative reading of the specs allow, because, e.g.
    filenames with spaces in happen, and because file uris like
    file:localFile which aren't particularly conformant, also
    happen).

    others, that allow you to control which specs you are checking
    against are:

      IRIFactory.iriImplementation()   RFC 3987
      IRIFactory.uriImplementation()   RFC 3986 (US-ASCII only)

      IRIFactory.semanticWebImplementation()
           This factory is a conservative implementation
           appropriate for Semantic Web applications.

    Having got your factory then you convert a string into an IRI
    in one of two ways, depending on how you want to handle errors:

    e.g.
       IRI iri;
       try {
         iri = iriFactory.construct{iriString);
       }
       catch (IRIException e) {
         // bad iri code

       }


    or

       boolean includeWarnings = false;
       IRI iri;
       iri = iriFactory.create{iriString); // always works
       if (iri.hasViolation(includeWarnings)) {
         // bad iri code
    // e.g.

            Iterator it = iri.violations(includeWarnings);
            while (it.hasNext()) {
                Violation v = (Violation) it.next();
       // do something:    printErrorMessages(v);

            }
       }

    various warning and error conditions are listed in the java doc
    for ViolationCodes (in the iri download).
    An error is a MUST force statement from the spec,
    a warning corresponds to a SHOULD force statement from the
    spec. There is also some support for 'minting' violations,
    which provide a stricter level of checking for
    IRIs that you are generating, as opposed to IRIs
    that have been passed to your application from elsewhere.

    So that, if I remember correctly:

    http://example.org:80/foo

    raises a warning with code DEFAULT_PORT_SHOULD_BE_OMITTED

    Like this one, many of the SHOULD force statements help avoid having
    two different IRIs that have the same operational semantics.

    Each spec is implemented as some set of active error and warning
    codes, so depending on which factory you chose in the first place,
    you may get a different collection of spec violations, some with
    SHOULD force and some with MUST force.

    There are also potentially warnings associated with security issues
    like IRI spoofing, which may not strictly violate any SHOULDs
    in any spec.
