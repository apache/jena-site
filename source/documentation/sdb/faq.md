---
title: SDB FAQ
---

## Tune your database

Database performance depends on the database being tuned. Some
databases default to "developer setup" which does not use much of
the RAM but is only for functional testing.

## Improving loading rates
For a large bulk load into an existing store, dropping the indexes,
doing the load and then recreating the indexes can be noticeably
faster.

     sdbconfig --drop
     sdbload file
     sdbconfig --index

For a large bulk load into a new store, just format it, and not
create the indexes, do the load and then recreating the indexes can
be noticeably faster.

     sdbconfig --format
     sdbload --time file
     sdbconfig --index
