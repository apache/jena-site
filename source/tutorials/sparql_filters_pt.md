---
title: Tutorial SPARQL – Filtros
---

Casamento em Grafos permite que sejam encontrados padrões no grafo. Essa seção descreve como os valores numa solução podem ser restritas. Há muitas comparações disponíveis – vamos apenas cobrir dois casos destes.

## Casamento de Strings

SPARQL fornece uma operação para testar strings, baseada em expressões regulares. Isso inclui a habilidade de testes como SQL "LIKE", no entanto, a sintaxe de expressões regulares é diferente de SQL.

A sintaxe é:

    FILTER regex(?x, "pattern" [, "flags"])

O argumento flags é opcional. A flag "i" significa casamento de padrão case-insensitivo.

A consulta ([q-f1.rq](sparql_data/q-f1.rq)) procura nomes com um “r” ou “R” neles.

    PREFIX vcard: <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?g
    WHERE
    { ?y vcard:Given ?g .
      FILTER regex(?g, "r", "i") }

resultados:

    -------------
    | g         |
    =============
    | "Rebecca" |
    | "Sarah"   |
    -------------

A linguagem de expressão regular 
[XQuery regular expression language](https://www.w3.org/TR/xpath-functions/#regex-syntax)
é a versão codificada da mesma encontrada em Perl.

## Testando valores

Muitas vezes, a aplicação necessita filtrar com o valor de uma variável. No arquivo [vc-db-2.rdf](sparql_data/vc-db-2.rdf), nós adicionamos um campo extra para idade. Idade não é definida no esquema de vcard então tivemos que criar uma nova propriedade para usar neste tutorial. RDF permite a mistura de diferentes definições de informação porque URIs são únicas. Note também que a propriedade info:age é tipada.

Nesse pedaço de dado, nós mostramos o valor tipado.

    <http://somewhere/RebeccaSmith/>
        info:age "23"^^xsd:integer ;
        vCard:FN "Becky Smith" ;
        vCard:N [ vCard:Family "Smith" ;
                  vCard:Given  "Rebecca" ] .

Então a consulta ([q-f2.rq](sparql_data/q-f2.rq)) para procurar as pessoas mais velhas que 24 anos é:

    PREFIX info: <http://somewhere/peopleInfo#>

    SELECT ?resource
    WHERE
      {
        ?resource info:age ?age .
        FILTER (?age >= 24)
      }

A expressão aritmética precisa estar em parêntesis. A única solução é:

    ---------------------------------
    | resource                      |
    =================================
    | <http://somewhere/JohnSmith/> |
    ---------------------------------

Apenas um resultado, resultando na URI para o recurso Jonh Smith. Se consultássemos os mais novos que 24 anos, resultaria em Rebecca Smith. Nada sobre os Jones.

O banco de dados não contém informação sobre a idade dos Jones: não há propriedades info:age nos seus vcards, então a variável `age` não recebe um valor, então não é testada. 

[Próximo: Opcionais](sparql_optionals_pt.html)



