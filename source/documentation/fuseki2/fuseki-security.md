---
title: Security in Fuseki2
---

Fuseki2 webapp provides security by using  [Apache Shiro](http://shiro.apache.org/).
This is controlled by the configuration file `shiro.ini` located at
`$FUSEKI_BASE/shiro.ini`. If not found, the server initializes with a default
configuration. This can then be replaced or edited as required. An existing file
is never overwritten by the server.

In its default configuration, SPARQL endpoints are open to the public but
administrative functions are limited to `localhost`. One can access it via
`http://localhost:.../...`. Or the according IPv4 or IPv6 address, for example
`127.0.0.1` (IPv4), or `[::1]` (IPv6). Access from an external machine is not
considered as localhost and thus restricted.

A simple example to enable basic user/password authentication is shown in the
default `shiro.ini` configuration. The default admin user is `admin` and the
password is `pw`. This can be changed directly in the INI file. Note that this
setup is not recommended for production for various reasons (no TLS, passwords
in plain text etc.), consult the [Shiro
INI](https://shiro.apache.org/configuration.html#Configuration-INIConfiguration-Sections)
documentation for best practices.

As mentioned above, the default setup only restricts access to the admin pages
of Fuseki. To avoid clashes with dataset names, the namespace of the admin
interface starts with '/$/', consult the [Fuseki HTTP Administration Protocol
](../fuseki2/fuseki-server-protocol.html) documentation for more details.

If access to SPARQL endpoints should be restricted, additional [Shiro
ACLs](https://shiro.apache.org/web.html#web_ini) are necessary.
This is done in the `[urls]` section of the configuration. As an example,
restricting access to the `../query` SPARQL endpoint for all datasets on Fuseki
could be done with this wildcard pattern:

`/**/query = authcBasic,user[admin]`

Anonymous SPARQL queries would no longer be possible in this example.

Note that this `authcBasic,user[admin]` configuration construct allows any authenticated user to access the
endpoint, regardless of the value of user. See the simple user/password/group example below for
more fine-grained control, using roles.

Again, please consult the [Apache Shiro](https://shiro.apache.org/) website for
details and more sophisticated setups. The default configuration of Fuseki is
kept simple but is *not* recommended for setups where sensitive data is
provided.

Changing the security setup requires a server restart.

Contributions of more examples are very welcome.

## Examples

The shipped `shiro.ini` has additional comments.

### The default configuration

This is a minimal configuration for the default configuration.

    [main]
    localhost=org.apache.jena.fuseki.authz.LocalhostFilter

    [urls]
    ## Control functions open to anyone
    /$/server = anon
    /$/ping   = anon
    ## and the rest are restricted to localhost.
    ## See above for 'localhost'
    /$/** = localhost
    /**=anon

### Simple user/password/group setup

This extract shows the simple user/password/group setup.

It adds a `[users]` section with admin in group admins, and user in group users, limits one path to accept both groups, and one for admin only in `[urls]`

    [users]
    admin=password,admins
    user=password,users

    [urls]
    # Control function open to users and admins groups
    /$/status = authcBasic,roles[users,admins]
    # Control functions open to anyone
    /$/ping   = anon
    # Other administration API paths only available for users in admins group
    /$/** = authcBasic,roles[admins]
    # Everything else
    /**=anon

### Example of using a more secure password setup

Apache Shiro provides a [command line hasher tool](https://shiro.apache.org/command-line-hasher.html) to generate password hashes

    # Set to the newest Shiro version
    export SHIRO_VERSION=N.N.N
    # download shiro-tools-hasher to local repository
    mvn dependency:get -DgroupId=org.apache.shiro.tools -DartifactId=shiro-tools-hasher -Dclassifier=cli -Dversion=$SHIRO_VERSION
    # run shiro tool from local repository (prompts for password)
    java -jar ~/.m2/repository/org/apache/shiro/tools/shiro-tools-hasher/${SHIRO_VERSION}/shiro-tools-hasher-${SHIRO_VERSION}-cli.jar -p

This outputs something like: `*$shiro2$argon2id$v=19$t=1,m=65536,p=4$Wr/2XKxWeYZt8JE5HCONQw$yev4bLiGzbeIZ8qDWrIY7J2msL2vRO/aYksb4RMeX7Y*`

A simple configuration using this password looks like:

    [main]
    passwordMatcher = org.apache.shiro.authc.credential.PasswordMatcher
    iniRealm.credentialsMatcher = $passwordMatcher

    [users]
    # user "user" with hashed password
    # quote required for password
    # in group users
    user="$shiro2$argon2id$v=19$t=1,m=65536,p=4$Wr/2XKxWeYZt8JE5HCONQw$yev4bLiGzbeIZ8qDWrIY7J2msL2vRO/aYksb4RMeX7Y",users
