---
title: Tutorial SPARQL - Informações Opcionais
---

RDF é dado semi-estruturado então SPARQL tem a habilidade de consultá-lo, mas não para falhar quando o dado não existe. A consulta usa uma parte opcional para extender a informação encontrada na solução de uma consulta, mas para retornar a informação não opcional de qualquer maneira.

## OPICIONAIS

Essa consulta ([q-opt1.rq](sparql_data/q-opt1.rq)) pega o nome da pessoa e também sua idade se essa informação estiver disponível.

    PREFIX info:    <http://somewhere/peopleInfo#>
    PREFIX vcard:   <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?name ?age
    WHERE
    {
        ?person vcard:FN  ?name .
        OPTIONAL { ?person info:age ?age }
    }

Duas das quatro pessoas nos dados ([vc-db-2.rdf](sparql_data/vc-db-2.rdf)) possui a propriedade idade, então duas das soluções da consulta têm essa informação. No entanto, já que o padrão de tripla para a idade é opcional, há uma solução padrão para a pessoa que não tiver informação sobre a idade.

    ------------------------
    | name          | age |
    =======================
    | "Becky Smith" | 23  |
    | "Sarah Jones" |     |
    | "John Smith"  | 25  |
    | "Matt Jones"  |     |
    -----------------------

Se a clausula opcional não estivesse ali, nenhuma informação sobre idade seria retornada. Se o padrão da tripla fosse incluída, mas não fosse opcional, nós teríamos a consulta ([q-opt2.rq](sparql_data/q-opt2.rq)):

    PREFIX info:   <http://somewhere/peopleInfo#>
    PREFIX vcard:  <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?name ?age
    WHERE
    {
        ?person vcard:FN  ?name .
        ?person info:age ?age .
    }

com os dois únicos resultados:

    -----------------------
    | name          | age |
    =======================
    | "Becky Smith" | 23  |
    | "John Smith"  | 25  |
    -----------------------

porque a propriedade `info:age` deve estar presente na solução agora.	

## OPCIONAIS com FILTROS

`OPTIONAL` é um operador binário que combina dois padrões de grafo. O padrão opcional é qualquer padrão de grupo e deve envolver qualquer tipo de padrão SPARQL. Se o grupo casar, a solução é estendida, senão, a solução original é dada ([q-opt-3.rq](sparql_data/q-opt3.rq)).

    PREFIX info:        <http://somewhere/peopleInfo#>
    PREFIX vcard:      <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?name ?age
    WHERE
    {
        ?person vcard:FN  ?name .
        OPTIONAL { ?person info:age ?age . FILTER ( ?age > 24 ) }
    }

Portanto, se filtrarmos por idades maiores que 24 na parte opcional, nós ainda teremos quatro soluções (do padrão `vcard:FN`) mas somente pegaremos idades se elas passarem no teste.
	
    -----------------------
    | name          | age |
    =======================
    | "Becky Smith" |     |
    | "Sarah Jones" |     |
    | "John Smith"  | 25  |
    | "Matt Jones"  |     |
    -----------------------

Idade não incluída para  "Becky Smith"  porque é menor que 24.
	
Se a condição do filtro é movida para a parte opcional, então isso pode influenciar no número de soluções, mas deve ser necessário fazer um filtro mais complicado para permitir que a variável `age` seja não limitada ([q-opt4.rq](sparql_data/q-opt4.rq)).

    PREFIX info:        <http://somewhere/peopleInfo#>
    PREFIX vcard:      <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?name ?age
    WHERE
    {
        ?person vcard:FN  ?name .
        OPTIONAL { ?person info:age ?age . }
        FILTER ( !bound(?age) || ?age > 24 )
    }

Se a solução tiver uma variável `age`, então ela deve ser maior que 24. Isso também pode ser não limitado. Agora há 3 soluções:

    -----------------------
    | name          | age |
    =======================
    | "Sarah Jones" |     |
    | "John Smith"  | 25  |
    | "Matt Jones"  |     |
    -----------------------

Avaliar uma expressão que tem variáveis não limitadas onde uma variável limitada é esperada causa uma exceção de avaliação e toda a expressão falha.	
	

## OPCIONAIS e consultas dependentes de ordem

Uma coisa a se ter cuidado ao usar a mesma variável em duas ou mais cláusulas opcionais (e não em algum padrão básico também):

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>

    SELECT ?name
    WHERE
    {
      ?x a foaf:Person .
      OPTIONAL { ?x foaf:name ?name }
      OPTIONAL { ?x vCard:FN  ?name }
    }

Se a primeira opção liga `?name` e `?x` a algum valor, a segunda opção é uma tentativa de casar as outras triplas (`?x` e `<kbd>?name</kbd>` têm valor). Se a primeira opção não casar com a parte opcional, então a segunda é uma tentativa para casar a tripla com duas variáveis.

 
[Próximo: União de Consultas](sparql_union_pt.html)



