---
title: ARQ - Collation
---

ARQ supports sorting results in a query. Users are able to specify
an expression that can be a function (built-in function, custom
function, or a variable).

By default, results are sorted using the default behavior provided
by the JVM. If you have the following query.

    SELECT ?label WHERE {
        VALUES ?label { "tsahurin kieli"@fi "tšekin kieli"@fi "tulun kieli"@fi "töyhtöhyyppä"@fi }
    }
    ORDER BY ?label

The results will be returned exactly in the following order.

* "töyhtöhyyppä"@fi
* "tsahurin kieli"@fi
* "tšekin kieli"@fi
* "tulun kieli"@fi

However, in Finnish the expected order is as follows.

* "tsahurin kieli"@fi
* "tšekin kieli"@fi
* "tulun kieli"@fi
* "töyhtöhyyppä"@fi

To specify the [collation](https://en.wikipedia.org/wiki/Collation)
used for sorting, we can use the ARQ `collation` function.

    PREFIX arq: <http://jena.apache.org/ARQ/function#>
    SELECT ?label WHERE {
        VALUES ?label { "tsahurin kieli"@fi "tšekin kieli"@fi "tulun kieli"@fi "töyhtöhyyppä"@fi }
    }
    ORDER BY arq:collation("fi", ?label)

The function collation receives two parameters. The first is the desired
collation, and the second is the function (which can be a variable, or
another function).

The collation used, will be the Finnish collation algorithm provided
with the JVM. This is done through calls to methods in the `java.util.Locale`
class and in the `java.text.Collator`, to retrieve a collator.

If the desired collation is not available, or invalid, the JVM behavior is
also adopted. It may return the default collator, but it may vary depending
on the JVM vendor.

Note that this function was released with Jena 3.4.0. Mixing locales may
lead to undesired results. See JENA-1313 for more information about the
implementation details.

[ARQ documentation index](index.html)
