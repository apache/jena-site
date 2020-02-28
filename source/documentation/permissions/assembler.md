---
title: Jena Permissions - Assembler for a Secured Model
---

Jena Permissions provides a standard Jena assembler making it easy to use the `SecuredModel` in an Assembler based environment. To use the permissions assembler the assembler file must contain the lines:

    [] ja:loadClass    "org.apache.jena.permissions.SecuredAssembler" .
     sec:Model       rdfs:subClassOf  ja:NamedModel .

The secured assembler provides XXXXXXXXXXXx properties for the assembler files.

Assuming we define:

     @prefix sec:    <http://apache.org/jena/permissions/Assembler#> .

Then the following resources are defined:

* `sec:Model` - A secured model. One against which the security evaluator is running access checks. All sec:Model instances must have a ja:ModelName to identify it to the `SecurityEvaluator`

* `sec:Evaluator` - An instance of `SecurityEvaluator`.

The following are properties are also defined:

* `sec:evaluatorFactory` - Identifies the class name of a factory class that implements a no-argument `getInstance()` method that returns an instance of `SecurityEvaluator`.

* `sec:baseModel` - Identifies the ja:Model that is to have permissions applied to it.

* `sec:evaluatorImpl` - Identifies an instance of `SecurityEvaluator`.

* `sec:evaluatorClass` - Identifies a class that implements `SecurityEvaluator`

* `sec:args` - Identifies arguments to the sec:evaluatorClass constructor.

The secured assembler provides two (2) mechanisms to create a secured graph. The first is to use a `SecurityEvaluator` factory.

    my:securedModel rdf:type sec:Model ;
        sec:baseModel my:baseModel ;
        ja:modelName "https://example.org/securedBaseModel" ;
        sec:evaluatorFactory "the.evaluator.factory.class.name" .

In the above example static method `getInstance()` is called on the.evaluator.factory.class.name and the result is used as the SecurityEvaluator. This is used to create a secured model (`my:securedModel`) that wraps the model `my:baseModel` and identifies itself to the `SecurityEvaluator` with the URI `"https://example.org/securedBaseModel"`.

The second mechanism is to use the `sec:Evaluator` method.

    my:secEvaluator rdf:type sec:Evaluator ;
        sec:args [
            rdf:_1 my:secInfoModel ;
        ] ;
        sec:evaluatorClass    "your.implementation.SecurityEvaluator"
    .

    my:securedModel rdf:type sec:Model ;
        sec:baseModel my:baseModel ;
        ja:modelName "https://example.org/securedBaseModel" ;
        sec:evaluatorImpl  my:secEvaluator .

In the above example `my:secEvaluator` is defined as a `sec:Evaluator` implemented by the class `"your.implementation.SecurityEvaluator"`. When the instance is constructed the constructor with one argument is used and it is passed `my:secInfoModel` as an argument. `my:secInfoModel` may be any type supported by the assembler. If more than one argument is desired then `rdf:_2`, `rdf:_3`, `rdf:_4`, etc. may be added to the `sec:args` list. The `"your.implementation.SecurityEvaluator"` with the proper number of arguments will be called. It is an error to have more than one argument with the proper number of arguments.

After construction the value of `my:securedModel` is used to construct the `my:securedModel` instance. This has the same properties as the previous example other than that the `SecurityEvaluator` instance is different.
