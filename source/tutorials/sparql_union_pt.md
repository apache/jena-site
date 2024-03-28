---
title: Alternativas num padrão
---

Outra forma de lidar com dado semiestruturado é consultar uma de um número de possibilidades. Essa sessão cobre O padrão `UNION`, onde uma de um número de possibilidades é testado.

## UNION - duas maneiras para o mesmo dado

Ambos os vocabulários de vcard e de FOAF possuem propriedades para nome de pessoas. Em vcard, é vcard:FN, o nome formatado, e em FOAF, é foaf:name. Nesta sessão, vamos olhar um pequeno conjunto de dados onde o nome das pessoas podem ser dados por ambos os vocabulários de FOAF e vcard.

Suponha que temos um [an RDF graph](sparql_data/vc-db-3.ttl) que contém a informação de nome usando os vocabulários de vcard e FOAF.

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2001/vcard-rdf/3.0#> .

_:a foaf:name   "Matt Jones" .

_:b foaf:name   "Sarah Jones" .

_:c vcard:FN    "Becky Smith" .

_:d vcard:FN    "John Smith" .
```

Uma consulta para acessar a informação do nome, poderia ser ([q-union1.rq](sparql_data/q-union1.rq)):

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?name
WHERE
{
   { [] foaf:name ?name } UNION { [] vCard:FN ?name }
}
```

isso retorna:

```turtle
-----------------
| name          |
=================
| "Matt Jones"  |
| "Sarah Jones" |
| "Becky Smith" |
| "John Smith"  |
-----------------
```

Não importa que forma de expressão usasse para o nome, a variável ?name é preenchida. Isso pode ser obtido usando um `FILTER` como mostra essa consulta ([q-union-1alt.rq](sparql_data/q-union1alt.rq)):

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?name
WHERE
{
  [] ?p ?name
  FILTER ( ?p = foaf:name || ?p = vCard:FN )
}
```

testando se a propriedade é uma URI ou a outra. As soluções podem não vir na mesma ordem. A primeira forma é conhecida como a mais rápida, dependendo dos dados e do armazenamento utilizado, porque a segunda forma tem que pegar todas as triplas do grafo para casar com o padrão da tripla  com variáveis não ligadas (ou blank nodes) em cada slot, então testa cada ?p para ver se casa com algum dos valores. Isso vai depender da sofisticação do otimizador de consultas para saber se ele vai executar a consulta mais eficientemente e transcender para a camada de armazenamento.

## Union - relembrando onde o dado foi encontrado.

O exemplo acima usou a mesma variável em cada ramo. Se diferentes variáveis forem usadas, a aplicação pode descobrir que sub-padrão causou o casamento ([q-union2.rq](sparql_data/q-union2.rq)):

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?name1 ?name2
WHERE
{
   { [] foaf:name ?name1 } UNION { [] vCard:FN ?name2 }
}
```

```turtle
---------------------------------
| name1         | name2         |
=================================
| "Matt Jones"  |               |
| "Sarah Jones" |               |
|               | "Becky Smith" |
|               | "John Smith"  |
---------------------------------
```

Essa segunda consulta guardou informação sobre onde o name da pessoa se originou atribuindo o nome para diferentes variáveis.

## OPTIONAL e UNION

Na prática, `OPTIONAL` é mais comum que `UNION` mas ambas têm seu uso. `OPTIONAL` é útil para aumentar as soluções encontradas, `UNION` é útil para concatenar soluções de diferentes possibilidades. Eles não retornam necessariamente a informação da mesma maneira.

Consulta([q-union3.rq](sparql_data/q-union3.rq)):

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>

SELECT ?name1 ?name2
WHERE
{
  ?x a foaf:Person
  OPTIONAL { ?x  foaf:name  ?name1 }
  OPTIONAL { ?x  vCard:FN   ?name2 }
}
```

```turtle
---------------------------------
| name1         | name2         |
=================================
| "Matt Jones"  |               |
| "Sarah Jones" |               |
|               | "Becky Smith" |
|               | "John Smith"  |
---------------------------------
```

Mas cuidado ao usar `?name` em cada `OPTIONAL` porque isso é uma consulta dependente da ordem.

[Próximo: Grafos Nomeados](sparql_datasets_pt.html)



