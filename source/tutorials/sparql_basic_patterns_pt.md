---
title: Tutorial SPARQL – Padrões Básicos
---

Esta sessão cobre os padrões básicos e as soluções, os principais blocos das consultas SPARQL.

## Soluções

Soluções são um conjunto de pares de variáveis com um valor. Uma consulta `SELECT` expõe diretamente as soluções (depois de ordenar/limitar/deslocar) como o conjunto resultado – outras formas de consulta usam as soluções para fazer um grafo. Solução é a maneira como o padrão é casado – em que os valores das variáveis são utilizados para casar com o padrão.

A primeira consulta de exemplo teve uma solução simples. Mude o padrão para esta segunda consulta: ([q-bp1.rq](sparql_data/q-bp1.rq)):

```sparql
SELECT ?x ?fname
WHERE {?x  <http://www.w3.org/2001/vcard-rdf/3.0#FN>  ?fname}
```

Isso tem quatro soluções, uma pra cada propriedade nome de VCARD das triplas na fonte de dados.

```turtle
----------------------------------------------------
| x                                | name          |
====================================================
| <http://somewhere/RebeccaSmith/> | "Becky Smith" |
| <http://somewhere/SarahJones/>   | "Sarah Jones" |
| <http://somewhere/JohnSmith/>    | "John Smith"  |
| <http://somewhere/MattJones/>    | "Matt Jones"  |
----------------------------------------------------
```

Até agora, com padrões de triplas e padrões básicos, cada variável será definida em cada solução. As soluções de uma consulta podem ser pensadas como uma tabela, mas no caso geral, é uma tabela onde nem sempre cada linha vai ter um valor para cada coluna. Todas as soluções para uma consulta SPARQL não têm que ter valores para todas as variáveis em todas as soluções como veremos depois.

## Padrões Básicos

Um padrão básico é um conjunto de padrões de triplas. Ele casa quando todo o padrão da tripla casa com o mesmo valor usado cada vez que a variável com o mesmo nome é usada.

```sparql
SELECT ?givenName
WHERE
  { ?y  <http://www.w3.org/2001/vcard-rdf/3.0#Family>  "Smith" .
    ?y  <http://www.w3.org/2001/vcard-rdf/3.0#Given>  ?givenName .
  }
```

Essa consulta ([q-bp2.rq](sparql_data/q-bp2.rq))envolve dois padrões de triplas, cada tripla termina com '.' (mas o ponto depois do último pode ser omitido como foi omitido no exemplo de padrão de uma tripla). A variável y tem que ser a mesma para cada casamento de padrão de tripla. As soluções são:

```turtle
-------------
| givenName |
=============
| "John"    |
| "Rebecca" |
-------------
```

### QNames

Aqui temos um mecanismo prático para escrever longas URIs usando prefixos. A consulta acima poderia ser escrita mais claramente como a consulta:
([q-bp3.rq](sparql_data/q-bp3.rq)):

```sparql
PREFIX vcard:      <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?givenName
WHERE
 { ?y vcard:Family "Smith" .
   ?y vcard:Given  ?givenName .
 }
```

Isso é um mecanismo de prefixagem – as duas partes do URI, da declaração do prefixo e da parte depois de ":" no qname são concatenadas. Isso não é exatamente como um qname XML é, mas usa as regras de RDF para transformar o qname numa URI concatenando as partes.

### Blank Nodes

Mude a consulta só para retornar y da seguinte forma:
([q-bp4.rq](sparql_data/q-bp4.rq)) :

```sparql
PREFIX vcard:      <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?y ?givenName
WHERE
 { ?y vcard:Family "Smith" .
   ?y vcard:Given  ?givenName .
 }
```

e os blank nodes aparecem

```turtle
--------------------
| y    | givenName |
====================
| _:b0 | "John"    |
| _:b1 | "Rebecca" |
--------------------
```

como os estranhos qnames iniciados com  `_:`. Isso não é o título interno do blank node – isso é o ARQ imprimindo-os, atribuindo `_:b0`, `_:b1`para mostrar quando dois blank nodes são o mesmo. Aqui eles são diferentes. Isso não revela o título interno usado para um blank node, mas isso está disponível quando usar a API Java.

[Próximo: Filtros](sparql_filters_pt.html)



