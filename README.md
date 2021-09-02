<!--
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->
# Apache Jena website

This is the source code for the website of [Apache Jena](https://jena.apache.org/), hosted at:

    https://jena.apache.org/

## Repository structure

This repository uses 3 branches for building the published website.

- The `main` branch, which contains all the sources for the website.
- The `asf-site` branch, which contains the generated website being used for the actual website.
- The `javadoc` branch, which has the javadoc to be published as part of the main website under `documentation/javadoc/`

When contributing patches, please create pull requests for the `main` branch.

Additionally the repository also has a `asf-staging` branch that can be used to preview website changes
prior to publishing them to the main website.  Any branch other than `main` that has a `Jenkinsfile` 
present in it will automatically be staged at https://jena.staged.apache.org, the Javadoc from the
`javadoc` branch is also automatically staged into this staging site.

## Content Management System

The website uses Hugo as static website generator. 
See [Hugo](https://gohugo.io/) for more info and for details how to install Hugo.

## Generate the website

To generate the static website, execute `hugo` to generate and serve the website on `localhost:1313`.

During development, it may be useful to run an incremental build. For this to
work, execute `hugo server -D` to continuously generate and serve the website on
`localhost:1313`.

## Building and publishing the website

The ASF Jenkins [Jena_Site job](https://ci-builds.apache.org/job/Jena_Site/) is
used for generating the website and committing the generated site to the
`asf-site` branch.

Separately, javadoc for a release is committed into the `javadoc` branch during
the release process.

[gitpubsub](https://www.apache.org/dev/gitpubsub.html) is used to publish the
site, using the content from the `asf-site` and `javadoc` branches.

## ASF Jenkins job

The `Jenkinsfile` was contributed in https://github.com/apache/jena-site/pull/17
(July 2020).

Steps to do to setup the Jenkins job:

* Create a new multibranch pipeline (e.g. 'Jena_Site').

* Branch source -> git

* Set the gitbox url -> `https://gitbox.apache.org/repos/asf/jena-site.git` and use
the jenkins (pub key) credentials.

* In the 'Scan Multibranch Pipeline Triggers' check the 'Periodically if not
otherwise run' checkbox and enter a sane value (e.g. 15 minutes). This is needed
because webhooks are not delivered to ci-builds (yet - 2020-07-28).

* Save the job and click the 'Scan Multibranch Pipeline Now' button to trigger an
initial scan. A first run may also happen as the SCM polls.

It is at this point that it gets the label `git-websites` so the first job may
have run on the wrong node.
