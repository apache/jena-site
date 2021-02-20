---
title: Support for XSD Datatype and XQuery/Xpath Functions and Operations.
---

ARQ supports the functions and operators from "[XQuery 1.0 and XPath 2.0 Functions and Operators v3.1](https://www.w3.org/TR/xpath-functions-3/)".

ARQ supports all the XSD atomic datatypes.

The prefix `fn` is `<http://www.w3.org/2005/xpath-functions#>` (the
XPath and XQuery function namespace).

The prefix `math` is `<http://www.w3.org/2005/xpath-functions/math#>`

To check the exact registrations for a specific version, see
<tt>[function/StandardFunctions.java](https://github.com/apache/jena/blob/main/jena-arq/src/main/java/org/apache/jena/sparql/function/StandardFunctions.java)</tt>
in the source code for that version.

The supported datatypes (including those required by SPARQL 1.1), including
full operator support, are the XSD atomic datatypes except for XML-related
ones.  Sequences are not supported.

`xsd:string`, `xsd:boolean`, 
`xsd:decimal`, `xsd:integer`, `xsd:double`, `xsd:float`, `xsd:double`

`xsd:long`, `xsd:int`, `xsd:short`, `xsd:byte`,
`xsd:nonPositiveInteger`, `xsd:negativeInteger`,
`xsd:nonNegativeInteger`, `xsd:positiveInteger`, 
`xsd:unsignedLong`, `xsd:unsignedInt`, `xsd:unsignedShort`

`xsd:duration`, `xsd:dayTimeDuration`, `xsd:yearMonthDuration`

`xsd:anyURI`
        
`xsd:dateTime`, `xsd:dateTimeStamp`, `xsd:date`, `xsd:time`
`xsd:gYear`, `xsd:gYearMonth`, `xsd:gMonth`, `xsd:gMonthDay`, `xsd:gDay`

Functions on atomic types not currently supported are list below (but check
for later additions).

Supported functions:

`fn:concat`, `fn:substring`, `fn:string-length`, 
`fn:upper-case`, `fn:lower-case`, `fn:contains`, `fn:starts-with`, `fn:ends-with`,
`fn:substring-before`, `fn:substring-after`, `fn:matches`, `fn:replace`, 
`fn:abs`, `fn:ceiling`, `fn:floor`, `fn:round`,
`fn:encode-for-uri`,

`fn:year-from-dateTime`, `fn:month-from-dateTime`, `fn:day-from-dateTime`,
`fn:hours-from-dateTime`, `fn:minutes-from-dateTime`, `fn:seconds-from-dateTime`,
`fn:timezone-from-dateTime`,
`fn:years-from-duration`, `fn:months-from-duration`,
`fn:days-from-duration`, `fn:hours-from-duration`,
`fn:minutes-from-duration`, `fn:seconds-from-duration`,

`fn:boolean`, `fn:not`,
`fn:normalize-space`, `fn:normalize-unicode`,
`fn:format-number`,
`fn:round-half-to-even`,

`math:pi`,  `math:exp`, `math:exp10`, `math:log`, `math:log10`, `math:pow`, `math:sqrt`,
`math:sin`, `math:cos`, `math:tan`, `math:asin`, `math:acos`, `math:atan`, `math:atan2`

#### F&O Functions not currently supported:

`fn:format-dateTime`,
`fn:format-date`,
`fn:format-time`.
