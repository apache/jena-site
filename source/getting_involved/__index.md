---
title: Getting involved in Apache Jena
slug: index
---

We welcome your contribution towards making Jena a better platform for semantic web and linked data applications.
We appreciate feature suggestions, bug reports and patches for code or documentation.

If you need help using Jena, please see our [getting help](../help_and_support) page.

### How to contribute

You can help us sending your suggestions, feature requests and bug reports (as well as patches) using the [Jena issue tracker](https://issues.apache.org/jira/browse/JENA).

You can discuss your contribution, before or after adding it to Jira, on the [`dev@jena.apache.org`](mailto:dev@jena.apache.org) mailing list.
You can also help other users by answering their questions on the [`users@jena.apache.org`](mailto:users@jena.apache.org) mailing list.
See the [subscription instructions](../help_and_support) for details.

Please see the [Reviewing Contributions](reviewing_contributions.html) page for details of what committers will be looking for when reviewing contributions.

#### Improving the Website

You can also help us improve the documentation on this website via Pull Request.

The website source lives in an Apache git repository at [gitbox.apache.org repo
jena-site](https://gitbox.apache.org/repos/asf/jena-site.git). There is also a
full read-write mirror on GitHub, see 
[jena-site on GitHub](https://github.com/apache/jena-site):

    git clone https://github.com/apache/jena-site.git
    cd jena-site

You can then make a branch, prepare your changes and submit a pull request.  Please see the `README.md` in that repository for more details.

### SNAPSHOTs

If you use Apache Maven and you are not afraid of being on the bleeding-edge, you can help us by testing our SNAPSHOTs which you can find in the [Apache Maven repository](https://repository.apache.org/content/repositories/snapshots/org/apache/jena/).

Here is, for example, how you can add TDB version X.Y.Z-SNAPSHOT to your project (please ask if you are unsure what the latest snapshot version number currently is):

    <dependency>
        <groupId>org.apache.jena</groupId>
        <artifactId>jena-tdb</artifactId>
        <version>X.Y.Z-SNAPSHOT</version>
    </dependency>

See also how to [use Jena with Maven](/download/maven.html).

If you have problems with any of our SNAPSHOTs, [let us know](/help_and_support/).

You can check the state of each Jena development builds
on the [Apache Jenkins continuous integration server](https://builds.apache.org/job/Jena/).

### Git repository

You can find the Jena source code in the Apache git repository: 
[https://gitbox.apache.org/repos/asf/jena.git](https://gitbox.apache.org/repos/asf/jena.git)

There is also a full read-write mirror of [Jena on GitHub](https://github.com/apache/jena):

    git clone https://github.com/apache/jena.git
    cd jena
    mvn clean install

You can [fork Jena on GitHub](https://github.com/apache/jena/fork) and also submit [pull requests](https://github.com/apache/jena/pulls) to 
contribute your suggested changes to the code.

### Open issues

You can find a list of the [open issues](https://issues.apache.org/jira/secure/IssueNavigator.jspa?reset=true&jqlQuery=project+%3D+JENA+AND+status+%3D+Open+ORDER+BY+priority+DESC&mode=hide) on JIRA (sorted by priority).
Or, you can look at the [last week activity](https://issues.apache.org/jira/secure/QuickSearch.jspa?searchString=jena+updated:-1w) to get a sense of what people are working on.

### Submit your patches

You can develop new contributions and work on patches using either the
Apache-hosted git repository or the [mirror on GitHub](https://github.com/apache/jena
).  

[GitHub pull requests](https://github.com/apache/jena/pulls) are forwarded to the
[dev@jira mailing list](/help_and_support/) for review by the Jena committers. 
You should subscribe to dev@jira to follow the feedback on your pull request. 


Alternatively, patches can be attached directly to issues in Jira 
(click on `More Actions > Attach Files`).

Please, inspect your contribution/patch and make sure it includes all (and
only) the relevant changes for a single issue. Don't forget tests!

If you want to test if a patch applies cleanly you can use:

    patch -p0 < JENA-XYZ.patch

If you use Eclipse: right click on the project name in `Package Explorer`,
select `Team > Create Patch` or `Team > Apply Patch`.

You can also use git:

    git format-patch origin/trunk

### IRC channel

Some Jena developers hang out on #jena on irc.freenode.net.

### How Apache Software Foundation works

To better understand how to get involved and how the Apache Software Foundation works we recommend you read:

 * [http://www.apache.org/foundation/getinvolved.html](http://www.apache.org/foundation/getinvolved.html)
 * [http://www.apache.org/foundation/how-it-works.html](http://www.apache.org/foundation/how-it-works.html)
 * [http://www.apache.org/dev/contributors.html](http://www.apache.org/dev/contributors.html)