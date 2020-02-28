---
title: Command-line and other tools for Jena developers
slug: index
---

Jena includes various command-line utilities which can help you with
a variety of tasks in developing Jena-based applications.

### Index of tools

  - [schemagen](schemagen.html)
  - [using schemagen from maven](schemagen-maven.html)

### Setting up your Environment

An environment variable `JENA_HOME` is used by all the command line tools to configure the class path automatically for you.  You can set this up as follows:

**On Linux / Mac**

  - `export JENA_HOME=`*the directory you downloaded Jena to*
  - `export PATH=$PATH:$JENA_HOME/bin`

**On Windows**

  - `SET JENA_HOME =`*the directory you downloaded Jena to*
  - `SET PATH=%PATH%;%JENA_HOME%\bat`

### Running the Tools

Once you've done the above you should now be able to run the tools from the command line like so:

**On Linux / Mac**

 - `sparql --version`

**On Windows**

 - `sparql.bat --version`

This command will simply print the versions of Jena and ARQ used in your distribution, all the tools support the `--version ` option.  To find out how to use a specific tool add the `--help` flag instead.

Note that many examples of using Jena tools typically use the Linux style invocation because most of the Jena developers work on Linux/Mac platforms.  When running on windows simply add `.bat` as an extension to the name of the command line tool to run it, on some versions of Windows this may not be required.


### Common Issues with Running the Tools

If you receive errors stating that a class is not found then it is most likely that `JENA_HOME` is not set correctly.  As a quick sanity check you can try the following to see if it is set appropriately:

**On Linux / Mac**

 - `cd $JENA_HOME`

**On Windows**

 - `cd %JENA_HOME%`

If this command fails then `JENA_HOME` is not correctly set, please ensure you have set it correctly and try again.

Windows users may experience problems if trying to run the tools when their `JENA_HOME` path contains spaces in it, there are two workarounds for this:

 1. Move your Jena install to a path without spaces
 1. Grab the latest scripts from [master][1] where they have been fixed to safely handle this.  Future releases will include this fix and resolve this issue

[1]: https://github.com/apache/jena/tree/master/apache-jena/bat/

