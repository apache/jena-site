---
title: Typed literals how-to
---

## What are typed literals?

In the original RDF specifications there were two types of literal
values defined - plain literals (which are basically strings with
an optional language tag) and XML literals (which are more or less
plain literals plus a "well-formed-xml" flag).

Part of the remit for the 2001
[RDF Core](http://www.w3.org/2001/sw/RDFCore/) working group was to
add to RDF support for typed values, i.e. things like numbers.
These notes describe the support for typed literals in
Jena2.

Before going into the Jena details here are some informal reminders
of how typed literals work in RDF. We refer readers to the RDF core
[semantics](http://www.w3.org/TR/rdf-mt/),
[syntax](http://www.w3.org/TR/rdf-syntax-grammar) and
[concepts](http://www.w3.org/TR/rdf-concepts/) documents for more
precise details.

In RDF, typed literal values comprise a string (the lexical form of
the literal) and a datatype (identified by a URI). The datatype is
supposed to denote a mapping from lexical forms to some space of
values. The pair comprising the literal then denotes an element of
the value space of the datatype. For example, a typed literal
comprising `("true", xsd:boolean)` would denote the abstract true
value `T`.

In the RDF/XML syntax typed literals are notated with syntax such
as:

    <age rdf:datatype="http://www.w3.org/2001/XMLSchema#int">13</age>

In NTriple syntax the notation is:

    "13"^^<http://www.w3.org/2001/XMLSchema#int>

In Turtle, it can be abbreviated:

    "13"^^xsd:int

This `^^` notation will appear in literals printed by Jena.

Note that a literal is either typed or plain (an old style literal)
and which it is can be determined statically. There is no way to
define a literal as having a lexical value of, say "13" but leave
its datatype open and then infer the datatype from some schema or
ontology definition.

In the new scheme of things well-formed XML literals are treated as
typed literals whose datatype is the special type
`rdf:XMLLiteral`.

## Basic API operations

Jena will correctly parse typed literals within RDF/XML, NTriple
and Turtle source files. The same Java object,
[`Literal`](/documentation/javadoc/jena/org/apache/jena/rdf/model/Literal.html)
will represent "plain" and "typed" literals. Literal now supports
some new methods:

- `getDatatype()`
Returns null for a plain literal or a Java object which represents
the datatype of a typed Literal.

- `getDatatypeURI()`
Returns null for a plain literal or the URI of the datatype of a
typed Literal.

- `getValue()`
Returns a Java object representing the value of the literal, for
example for an xsd:int this will be a java.lang.Integer, for plain
literals it will be a String.
The converse operation of creating a Java object to represent a
typed literal in a model can be achieved using:

- `model.createTypedLiteral(value, datatype)`
This allows the `value` to be specified by a lexical form (i.e. a
String) or by a Java object representing the typed value; the
`datatype` can be specified by a URI string or a Java object
representing the datatype.

In addition there is a built in mapping from standard Java wrapper
objects to XSD datatypes (see later) so that the simpler call:

    model.createTypedLiteral(Object)

will create a typed literal with the datatype appropriate for
representing that java object. For example,

    Literal l = model.createTypedLiteral(new Integer(25));

will create a typed literal with the lexical value "25", of type
`xsd:int`.

Note that there are also functions which look similar but do not
use typed literals. For example::

    Literal l = model.createLiteral(25);
    int age = l.getInt();

These worked by converting the primitive to a string and storing
the resulting string as a plain literal. The inverse operation then
attempts to parse the string of the plain literal (as an int in
this example). These are for backward compatibility with earlier
versions of Jena and older datasets. In normal circumstances
`createTypedLiteral` is preferable.

### Equality issues

There is a well defined notion of when two typed literals should be
equal, based on the equality defined for the datatype in question.
Jena2 implements this equality function by using the method
`sameValueAs`. Thus two literals ("13", xsd:int) and ("13",
xsd:decimal) will test as sameValueAs each other but neither will
test sameValueAs ("13", xsd:string).

Note that this is a different function from the Java `equals`
method. Had we changed the equals method to test for semantic
equality problems would have arisen because the two objects are not
substitutable in the Java sense (for example they return different
values from a getDatatype() call). This would, for example, have
made it impossible to cache literals in a hash table.

## How datatypes are represented

Datatypes for typed literals are represented by instances of the
interface
[`org.apache.jena.datatypes.RDFDatatype`](/documentation/javadoc/jena/org/apache/jena/datatypes/RDFDatatype.html).
Instances of this interface can be used to parse and serialized
typed data, test for equality and test if a typed or lexical value
is a legal value for this datatype.

Prebuilt instances of this interface are included for all the main
XSD datatypes (see [below](#xsd)).

In addition, it is possible for an application to define new
datatypes and register them against some URI (see
[below](#userdef)).

### Error detection

When Jena parses a datatype whose lexical value is not legal for
the declared datatype is does not immediately throw an error. This
is because the RDFCore working group has defined that illegal
datatype values are errors but are not syntactic errors so we try
to avoid have parsers break at this point. Instead a literal is
created which is marked internally as ill-formed and the first time
an application attempts to access its value (with `getValue()`) an
error will be thrown.

When Jena is reading a file there is also the issue of what to do
when it encounters a typed value whose datatype URI is not one that
is knows about. The default behaviour is to create a new datatype
object (whose value space is the same as its lexical space). Again
this behaviour seems in keeping with the working group preference
that illegal datatypes are semantic but not syntactic errors.

However, both of these behaviours can mean that simple common
errors (such as mis-spelling the xsd namespace) may go unnoticed
until very late on. To overcome this we have hidden some global
switches that allow you to force Jena to report such syntactic
errors earlier. These are static Boolean parameters:

    org.apache.jena.shared.impl.JenaParameters.enableEagerLiteralValidation
    org.apache.jena.shared.impl.JenaParameters.enableSilentAcceptanceOfUnknownDatatypes

They are placed here in an impl package (and thus only visible in
the full javadoc, not the API javadoc) because they should not be
regarded as stable. We plan to develop a cleaner way of setting
mode switches for Jena and these switches will migrate there in due
course, if they prove to be useful.

## XSD data types

Jena includes prebuilt, and pre-registered, instances of
`RDFDatatype` for all of the relevant XSD types:

    float double int long short byte unsignedByte unsignedShort
    unsignedInt unsignedLong decimal integer nonPositiveInteger
    nonNegativeInteger positiveInteger negativeInteger Boolean string
    normalizedString anyURI token Name QName language NMTOKEN ENTITIES
    NMTOKENS ENTITY ID NCName IDREF IDREFS NOTATION hexBinary
    base64Binary date time dateTime duration gDay gMonth gYear
    gYearMonth gMonthDay

These are all available as static member variables from
[`org.apache.jena.datatypes.xsd.XSDDatatype`](/documentation/javadoc/jena/org/apache/jena/datatypes/xsd/XSDDatatype.html).

Of these types, the following are registered as the default type to
use to represent certain Java classes:

Java class | xsd type
----------- | ---------
Float | float
Double | double
Integer | int
Long | long
Short | short
Byte | byte
BigInteger | integer
BigDecimal | decimal
Boolean | Boolean
String | string

Thus when creating a typed literal from a Java `BigInteger` then
`xsd:integer` will be used. The converse mapping is more adaptive.
When parsing an xsd:integer the Java value object used will be an
Integer, Long or BigInteger depending on the size of the specific
value being represented.

## User defined XSD data types

XML schema allows derived types to be defined in which a base type
is modified through some facet restriction such as limiting the
min/max of an integer or restricting a string to a regular
expression. It also allows new types to be created by unioning
other types or by constructing lists of other types.

Jena provides support for derived and union types but not for list
types.

These are supported through the `XSDDatatype.loadUserDefined`
method which allows an XML schema datatype file to be loaded. This
registers a new `RDFDatatype` that can be used to create, parse,
serialize, test instances of that datatype.

There is one difficult issue in here, what URI to give to the user
defined datatype? This is not defined by XML Schema, nor RDF nor
OWL. Jena2 adopts the position that the defined
datatype should have the base URI of the schema file with a
fragment identifier given by the datatype name.

To illustrate working with the defined types, the following code
then tries to create and use two instances of the over 12 type:

    Model m = ModelFactory.createDefaultModel();
    RDFDatatype over12Type = tm.getSafeTypeByName(uri + "#over12");
    Object value = null;
    try {
        value = "15";
        m.createTypedLiteral((String)value, over12Type).getValue();
        System.out.println("Over 12 value of " + value + " is ok");
        value = "12";
        m.createTypedLiteral((String)value, over12Type).getValue();
        System.out.println("Over 12 value of " + value + " is OK");
    } catch (DatatypeFormatException e) {
        System.out.println("Over 12 value of " + value + " is illegal");
    }

which products the output:

    Over 12 value of 15 is OK
    Over 12 value of 12 is illegal

## User defined non-XSD data types

RDF allows any URI to be used as a datatype but provides no
standard for how to map the datatype URI to a datatype definition.

Within Jena2 we allow new datatypes to be created and registered by
using the
[`TypeMapper`](/documentation/javadoc/jena/org/apache/jena/datatypes/TypeMapper.html)
class.

The easiest way to define a new RDFDatatype is to subclass
BaseDatatype and define implementations for parse, unparse and
isEqual.

For example here is the outline of a type used to represent
rational numbers:

    class RationalType extends BaseDatatype {
        public static final String theTypeURI = "urn:x-hp-dt:rational";
        public static final RDFDatatype theRationalType = new RationalType();

        /** private constructor - single global instance */
        private RationalType() {
            super(theTypeURI);
        }

        /**
         * Convert a value of this datatype out
         * to lexical form.
         */
        public String unparse(Object value) {
            Rational r = (Rational) value;
            return Integer.toString(r.getNumerator()) + "/" + r.getDenominator();
        }

        /**
         * Parse a lexical form of this datatype to a value
         * @throws DatatypeFormatException if the lexical form is not legal
         */
        public Object parse(String lexicalForm) throws DatatypeFormatException {
            int index = lexicalForm.indexOf("/");
            if (index == -1) {
                throw new DatatypeFormatException(lexicalForm, theRationalType, "");
            }
            try {
                int numerator = Integer.parseInt(lexicalForm.substring(0, index));
                int denominator = Integer.parseInt(lexicalForm.substring(index+1));
                return new Rational(numerator, denominator);
            } catch (NumberFormatException e) {
                throw new DatatypeFormatException(lexicalForm, theRationalType, "");
            }
        }

        /**
         * Compares two instances of values of the given datatype.
         * This does not allow rationals to be compared to other number
         * formats, Lang tag is not significant.
         */
        Public Boolean isEqual(LiteralLabel value1, LiteralLabel value2) {
            return value1.getDatatype() == value2.getDatatype()
                 && value1.getValue().equals(value2.getValue());
        }
    }

To register and use this type you simply need the call:

    RDFDatatype rtype = RationalType.theRationalType;
    TypeMapper.getInstance().registerDatatype(rtype);
    ...
    // Create a rational literal
    Literal l1 = m.createTypedLiteral("3/5", rtype);

Note that whilst any serialization of RDF containing such user
defined literals will be perfectly legal a client application has
no standard way of looking up the datatype URI you have chosen.
This has to be done "out of band" as they say.

## A note on xml:Lang

Plain literals have an xml:Lang tag as well as a string value. Two
plain literals with the same string but different Lang tags are not
equal.

XML Schema states that xml:Lang is not meaningful on xsd
datatypes.

Thus for almost all typed literals there is no xml:Lang tag.

At the time of last call the RDF specifications allowed the special
case that `rdf:XMLLiteral`s could have a Lang tag that would be
significant in equality testing. Thus in preview releases of Jena2
the createTypedLiterals calls took an extra Lang tag argument.

However, at the time of writing that specification has been changed
so that Lang tags will never be significant on typed literals
(whether this means that xml:Lang is not significant on XMLLiterals
or means that XMLLiteral will cease to be a typed literal is not
completely certain).

For this reason we have removed the Lang tag from the
createTypedLiterals calls and deprecated the createLiteral call
which allowed both wellFormedXML and Lang tag to be specified.

We do not expect to need to change the API even if the working
group decision changes again, the most we might expect to do would
be to undeprecate the 3-argument version of createLiteral.


