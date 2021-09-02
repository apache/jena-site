---
title: Fuseki File System Layout
---

There are two areas: the fixed files provided by the distribution and the
changing files for the local deployment,including the default location
for TDB databases.

Two environment variables control the file system usage. 
Symbolic links can be used to create variations on the standard layout.

`FUSEKI_HOME` - this contains the fixed files from the distribution and
is used for Unix service deployments.  When deployment as a WAR file,
everything is in the WAR file itself.

`FUSEKI_BASE` - this contains the deployment files.

| Mode        | Environment Variable   | Default Setting     |  
|-------------|------------------------|---------------------|
| Service     | `FUSEKI_HOME`       | `/usr/share/fuseki`    |
|             | `FUSEKI_BASE`       | `/etc/fuseki`          |
| Webapp      | `FUSEKI_HOME`       | N/A (Files in the Fuseki .war file) |
|             | `FUSEKI_BASE`       | `/etc/fuseki`          |
| Standalone  | `FUSEKI_HOME`       | Current directory      |
|             | `FUSEKI_BASE`       | `${FUSEKI_HOME}/run/`   |

When run in a web application container (e.g. [Tomcat](http://http://tomcat.apache.org/),
[Jetty](http://eclipse.org/jetty/) or other webapp compliant server), 
`FUSEKI_BASE` will be `/etc/fuseki`.

If `FUSEKI_BASE` is the same as `FUSEKI_HOME`, be careful when upgrading not to delete
server deployment files and directories.

# Distribution area -- `FUSEKI_HOME`

| Directory or File     | Usage |
|-----------------------|-------|
| `fuseki`              | Fuseki Service (Linux)            |
| `fuseki-server`       | Fuseki standalone command         |
| `fuseki-server.bat`   | Fuseki standalone command         |
| `fuseki-server.jar`   | The Fuseki Server binary          |
| `fuseki.war`          | The Fuseki Server as a WAR file   |
| `bin/`                | Helper scripts                    |
| `webapp/`             | The webapp for the UI             |

# Runtime area -- `FUSEKI_BASE`

| Directory or File | Usage |
|-------------------|-------|
| `config.ttl`      | Server configuration        |
| `shiro.ini`       | Apache Shiro configuration  |
| `databases/`		| TDB Databases               |
| `backups/`		| Write area for live backups |
| `configuration/`  | Assembler files             |
| `logs/`           | Log file area               |
| `system/`         | System configuration database |
| `system_files/`   | Uploaded data service descriptions (copies) |
| `templates/`	    | Templates for build-in configurations |


The `system_files/` keeps a copy of any assemblers uploaded to
configure the server. The primary copy is kept in the system database.

# Resetting

To reset the server, stop the server, and delete the system database in `system/`,
the `system_files/` and any other unwanted deployment files,
then restart the server.
