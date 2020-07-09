---
title: Eyeball - checking RDF/OWL for common problems
---

Eyeball is a Jena-based tool for checking RDF models (including OWL)
for common problems. It is user-extensible using plugins.

<b>This page is historical "for information only" - there is no Apache
release of Eyeball and the code has not been updated for Jena3.  
<br/>
The [original source code is available](https://svn.apache.org/viewvc/jena/Scratch/Eyeball/trunk/).
</b>


## Documentation index

  - The [brief guide](eyeball-guide.html).
  - The [manual](eyeball-manual.html).
  - The [JavaDoc](#todo/documentation/javadoc/eyeball/index.html).

## Getting the Eyeball release

<!--Please see the [downloads page](/download/index.cgi) for details.-->

## Installation

Eyeball needs to be compiled from source.

If you have Ant installed, run the Eyeball test suite:

    ant test

Ensure all the jars in the Eyeball `lib` directory are on your
classpath.

## Using Eyeball with Apache Maven

TODO

## Trying it out

Pick one of your RDF files; we'll call it FOO for now. Run the
command-line command

    java jena.eyeball -check FOO

You will likely get a whole bunch of messages about your RDF. The
messages are supposed to be self-explanatory, so you may be able to
go ahead and fix some problems straight away. If you get a Java
error about **NoClassDefFoundError**, you've forgotten to set the
classpath up or use the *-cp myClassPath* option to Java.

You may also want to try the experimental GUI, see below.

If the messages aren't self-explanatory, or you want more details,
please consult the [guide](eyeball-guide.html).

## Experimental Eyeball GUI

Eyeball includes a simple GUI tool which will allow multiple files to be
checked at once and multiple schemas to be assumed. It will also allow you
to select which inspectors are used.

To start the GUI, use the following (assuming your classpath is set up, as above):
    java jena.eyeballGUI

