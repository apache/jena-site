Title: Apache Jena TDB2 - Migration from TDB1.

Simple migration of code is to use `TDB2Factory` in place of TDBFactory to create
datasets. `DatasetGraph` objects are now created via `DatabaseMgr`.

Beware that many classes have the same name in TDB1 and TDB2 but are in
different packages. The API package for TDB2 is `org.apache.jena.tdb2`.

Example code: **`TDB2Factory`**

```
import org.apache.jena.tdb2.TDB2Factory;
...

    public static void main(String[] args) {
         Dataset ds = TDB2Factory.createDataset() ;
         Txn.execWrite(ds, ()->{
              RDFDataMgr.read(ds, "SomeData.ttl");
         }) ;
          Txn.execRead(dsg, ()->{
             RDFDataMgr.write(System.out, ds, Lang.TRIG) ;
         }) ;
    }
```
