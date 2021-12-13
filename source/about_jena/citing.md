---
title: Citing Jena
---

[comment]: <> (https://lists.apache.org/thread/jl8npmty96j1gkflmlpx5c0kcfdjr3f6)

The name of the project is “Apache Jena”. That should appear as the first
use in a paper and in a reference. After that "Jena" can be used.
It is also a [trademark](https://www.apache.org/foundation/marks/#books)
of the Apache Software Foundation. This is also the industry practice.

The reference should indicate the website <https://jena.apache.org/>
(`https` is preferable). If relevant to reproducibility, or discussing
performance, the release version number **MUST** also be included. The date
of access would also be helpful to the reader.

You can use names such as “TDB” and “Fuseki” on their own. They are informal
names to parts of the whole system. They also change over time and versions.
You could say “Apache Jena Fuseki” for the triplestore but as the components
function as part of the whole, “Apache Jena” would be accurate.

The first paper citing Jena is [Jena: implementing the semantic web recommendations](https://dl.acm.org/doi/10.1145/1013367.1013381).
That only covers the API and its implementation. Some parts of the system
mentioned in that paper have been dropped a long time ago (e.g. the “RDB”
system). The paper is also prior to the move to under the Apache Software
Foundation. It is also good to acknowledge Brian McBride, who started the
project.

Here is an example of what a citation may look like:

```
Apache Software Foundation, 2021. Apache Jena, Available at: https://jena.apache.org/.
```
