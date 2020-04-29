---
title: Tutorial SPARQL 
---

O objetivo deste tutorial é dar um curso rápido sobre SPARQL. Esse tutorial cobre os principais aspectos desta linguagem de consulta através de exemplos, mas não tem como objetivo ser completo.

Se você estiver procurando uma pequena introdução a SPARQL e Jena, experimente 
[Search RDF data with SPARQL](http://www.ibm.com/developerworks/xml/library/j-sparql/).  Se você quer executar consultas SPARQL e já sabe como ele funciona, então você deveria ler a [ARQ Documentation][1].

[1]: /documentation/query/index.html

SPARQL é uma
[linguagem de consulta](http://www.w3.org/TR/sparql11-query/) e um
[protocolo](http://www.w3.org/TR/rdf-sparql-protocol/) para acesso a
RDF elaborado pelo
[W3C RDF Data Access Working Group](http://www.w3.org/2001/sw/DataAccess/). 

Como uma linguagem de consulta, SPARQL é orientada a dados de forma que só consulta as informações presentes nos modelos, não há inferência propriamente dita nesta linguagem de consulta.  Por acaso, os modelos de Jena são “inteligentes” quanto a isso, e nos dá a impressão de que certas triplas são criadas sob demanda, incluindo raciocínio OWL. SPARQL nada mais faz do que pegar a descrição do que a aplicação quer, na forma de uma consulta, e retornar a informação, na forma de um conjunto de ligações ou grafo RDF.

## Tutorial SPARQL 

1.  [Preliminares: dados!](sparql_data_pt.html)
2.  [Executando uma consulta simples](sparql_query1_pt.html)
3.  [Padrões básicos](sparql_basic_patterns_pt.html)
4.  [Restrição de valores](sparql_filters_pt.html)
5.  [Informação opcional](sparql_optionals_pt.html)
6.  [Alternativas](sparql_union_pt.html)
7.  [Grafos nomeados](sparql_datasets_pt.html)
8.  [Resultados](sparql_results_pt.html)

## Outros Materiais

-   [SPARQL query language definition document](http://www.w3.org/TR/sparql11-query/) -
    contem muitos exemplos.
-   [Search RDF data with SPARQL](http://www.ibm.com/developerworks/xml/library/j-sparql/)
    (by Phil McCarthy) - artigo publicado por um desenvolvedor da IBM sobre SPARQL e Jena
-   [Guia de referência SPARQL ](http://www.ilrt.bris.ac.uk/people/cmdjb/2005/04-sparql/)
    (por [Dave Beckett](http://www.ilrt.bristol.ac.uk/people/cmdjb/))

Detalhado [ARQ documentation](/documentation/query/)