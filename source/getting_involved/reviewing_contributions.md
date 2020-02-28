---
title: Reviewing Contributions
---

This page details how to review contributions submitted for Apache Jena, it is intended primarily for Jena committers but is also useful in helping contributors understand what we expect from a contribution.

# Patch Guidelines

When reviewing contributed patches to Jena the committers are going to be considered the following:

 1. Does the pull request includes tests?
 1. Does the pull request includes documentation?
 1. Does it have Apache copyright headers?
 1. Are there any @author tags?
 1. Is it contributed to Apache?
 1. What is the size and impact on Jena of the contribution?
 1. Is IP clearance required?
 1. Pull requests and commit messages

## Including Tests

Including tests is almost always a must for a patch unless the patch is for non-code
content e.g. CMS diffs, maven config tweaks.

Tests are **essential** for bug fixes but should be considered mandatory for any patch.  Jena uses JUnit for tests and uses the standard Java *src/test/* directory conventions within its modules.

## Including Documentation

Users will not find or understand new feature if there is no documentation.

## Apache Copyright Headers

Code for inclusion in Jena should contain Apache copyright headers, **only**
the contributor should remove/change copyright headers so if a different copyright
header is present then you **must** request that the contributor change the
copyright headers.

## No @author Tags

The Jena PMC have agreed not to maintain @author tags in the code since generally
authorship can be identified from the SVN history anyway and over time
committers will typically touch much code even if only briefly and in minor ways.

@author tags will not prevent a contribution being accepted but **should**
be removed by the committer who integrates the contribution.

## Code style

Jena does not have a particular formal code style specification, but here are some simple tips for keeping your contribution in good order:

- Jena uses the Java code conventions with spaces (not tabs!), an indent of 4, and opening braces on the same line. Use no trailing whitespace if avoidable. Use common sense to make your code readable for the next person.
- Don't create a method signature that throws checked exceptions that aren't ever actually thrown from the code in that method unless an API supertype specifies that signature. Otherwise, clients of your code will have to include unnecessary handling code.
- Don't leave unused imports in your code. IDEs provide facilities to clean imports.
- If a type declares a supertype that isn't a required declaration, consider whether that clarifies or confuses the intent.
- Minimize the new compiler warnings your patch creates. If you use @SuppressWarnings to hide them, please add a comment explaining the situation.
- Remove unused local variables or fields.
- If there is valuable code in some unused private method, add a @SuppressWarnings("unused") with an explanation of when it might become useful.

## Contribution to Apache

The Apache License states that any contribution to an Apache project is automatically considered
to be contributed to the Apache foundation and thus liable for inclusion in an Apache project.

Generally you will not have to worry about this but if anyone ever states that code is not
for inclusion then we **must** abide by that or request that they make a statement
that they are contributing the code to Apache.

## Size and Impact on Jena

Small patches can generally be incorporated immediately, larger patches - particularly those adding significant
features - should usually be discussed on the [dev@jena.apache.org](mailto:dev@jena.apache.org) list prior to acceptance.

Use your judgement here, a few hundred lines of code may be considered small if it isn't changing/extending functionality significantly.
Conversely a small patch that changes a core behavior should be more widely discussed.

If in doubt start a thread on dev or comment on the JIRA issue, JIRA comments get copied to the dev list
so all developers should see the comments even if they aren't explicitly watching the issue.

## IP Clearance

Depending on where a patch comes from there may be IP clearance issues, for small patches this is generally a non-issue.
Where this comes into play is when a large patch is coming in which has been developed completely externally to Jena, particularly if that patch has been developed for/on behalf of a company rather than be developers working in their free time.

For patches like this we may require that the company in question submit a [CCLA](http://www.apache.org/licenses/cla-corporate.txt) and that the developers involve submit [ICLAs](http://www.apache.org/licenses/icla.txt).  There may also need to be IP Clearance vote called on the developer list to give developers a chance to review the code and check that there isn't anything being incorporated that violates Apache policy.

## Pull Requests and Commit Messages

A pull request is a single unit so a large number of commits details the evolution internally
but does not help record the external contribution.

Consider asking the contributor to merge commits into a few with useful messages for an external reviewer.

## Project Processes

[Project Processes](https://cwiki.apache.org/confluence/display/JENA/Processes) including:

* [Release process](https://cwiki.apache.org/confluence/display/JENA/Release+Process)
* [Commit Workflow for Github-ASF](https://cwiki.apache.org/confluence/display/JENA/Commit+Workflow+for+Github-ASF)
