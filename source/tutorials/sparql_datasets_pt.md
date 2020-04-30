---
title: SPARQL Tutorial - Datasets
---

Essa sessão cobre datasets RDF – um dataset RDF é a unidade consultada por um consulta SPARQL. 
Ele consiste de um grafo padrão, e certo número de grafos nomeados.

## Consultando datasets

As operações de casamento de grafos 
([padrões básicos](sparql_basic_patterns_pt.html),
[`OPTIONAL`s](sparql_optionals_pt.html), e [`UNION`s](sparql_union_pt.html)) funcionam em um grafo RDF.  Isso começa por ser o grafo padrão do conjunto de dados, 
mas pode ser alterado pela palavra-chave `GRAPH`.
    GRAPH uri { ... padrão ... }

    GRAPH var { ... padrão ... }

Se um URI é fornecido, o padrão vai ser casado contra o grafo no dataset com esse nome – se não houver um, 
então clausula `GRAPH` falhará ao tentar casar.  

Se uma variável é dada, todos os grafos nomeados (não o grafo padrão) 
são testados. A variável pode ser usada em outro lugar, então, durante a execução, esse valor 
já é conhecido para a solução, somente o grafo nomeado é testado.

### Dados de exemplo

Um dataset RDF pode ter várias formas.
A instalação comum é ter o grafo padrão sendo a união (o merge RDF)
de todos os grafos nomeados e ter o grafo padrão como um inventário de
grafos nomeados (de onde eles vieram, quando eles foram lidos, etc.). Não há limitações – um grafo pode ser incluído duas vezes sob diferentes nomes, 
ou alguns grafos podem compartilhar triplas com outros.

Nos exemplos abaixo, vamos usar o seguinte dataset que pode ocorrer para um 
RDF agregador de um livro de detalhes:

Grafo padrão ([ds-dft.ttl](sparql_data/ds-dft.ttl)):

    @prefix dc: <http://purl.org/dc/elements/1.1/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

    <ds-ng-1.ttl> dc:date "2005-07-14T03:18:56+0100"^^xsd:dateTime .
    <ds-ng-2.ttl> dc:date "2005-09-22T05:53:05+0100"^^xsd:dateTime .

Grafo nomeado ([ds-ng-1.ttl](sparql_data/ds-ng-1.ttl)):

    @prefix dc: <http://purl.org/dc/elements/1.1/> .

    [] dc:title "Harry Potter and the Philospher's Stone" .
    [] dc:title "Harry Potter and the Chamber of Secrets" .

Grafo nomeado ([ds-ng-2.ttl](sparql_data/ds-ng-2.ttl)):

    @prefix dc: <http://purl.org/dc/elements/1.1/> .

    [] dc:title "Harry Potter and the Sorcerer's Stone" .
    [] dc:title "Harry Potter and the Chamber of Secrets" .

Isto é, nós temos dois pequenos grafos descrevendo alguns livros, 
e nós temos um grafo padrão que armazena quando esses grafos foram lidos pela última vez. 

As consultas podem ser executadas via linha de comando (tudo numa linha):

    java -cp ... arq.sparql
        --graph ds-dft.ttl --namedgraph ds-ng-1.ttl --namedgraph ds-ng-2.ttl
        --query query file

Datasets não têm que ser criados só para o tempo de vida da consulta. 
Eles podem ser criados e armazenados num banco de dados, o que seria mais usual para uma aplicação agregadora.

### Acessando o Dataset

O primeiro exemplo apenas acessa o grafo padrão:
([q-ds-1.rq](sparql_data/q-ds-1.rq)):

    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX : <.>

    SELECT *
    { ?s ?p ?o }

(O "`PREFIX : <.>`"  apenas ajuda a formatar a saída)

    ----------------------------------------------------------------------
    | s            | p       | o                                         |
    ======================================================================
    | :ds-ng-2.ttl | dc:date | "2005-09-22T05:53:05+01:00"^^xsd:dateTime |
    | :ds-ng-1.ttl | dc:date | "2005-07-14T03:18:56+01:00"^^xsd:dateTime |
    ----------------------------------------------------------------------

Este é somente o grafo padrão – nada dos grafos nomeados porque eles não são consultados a menos que
seja informado explicitamente via `GRAPH`.

Nós podemos consultar todas as triplas ao consultar o grafo padrão e os grafos nomeados:
([q-ds-2.rq](sparql_data/q-ds-2.rq)):

    PREFIX  xsd:    <http://www.w3.org/2001/XMLSchema#>
    PREFIX  dc:     <http://purl.org/dc/elements/1.1/>
    PREFIX  :       <.>

    SELECT *
    {
        { ?s ?p ?o } UNION { GRAPH ?g { ?s ?p ?o } }
    }

resultando em:

    ---------------------------------------------------------------------------------------
    | s            | p        | o                                          | g            |
    =======================================================================================
    | :ds-ng-2.ttl | dc:date  | "2005-09-22T05:53:05+01:00"^^xsd:dateTime  |              |
    | :ds-ng-1.ttl | dc:date  | "2005-07-14T03:18:56+01:00"^^xsd:dateTime  |              |
    | _:b0         | dc:title | "Harry Potter and the Sorcerer's Stone"    | :ds-ng-2.ttl |
    | _:b1         | dc:title | "Harry Potter and the Chamber of Secrets"  | :ds-ng-2.ttl |
    | _:b2         | dc:title | "Harry Potter and the Chamber of Secrets"  | :ds-ng-1.ttl |
    | _:b3         | dc:title | "Harry Potter and the Philospher's Stone"  | :ds-ng-1.ttl |
    ---------------------------------------------------------------------------------------

### Consultando um grafo especifico

Se a aplicação souber o nome do grafo, ele pode consultar diretamente títulos num grafo dado:
([q-ds-3.rq](sparql_data/q-ds-3.rq)):

    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX : <.>

    SELECT ?title
    {
      GRAPH :ds-ng-2.ttl
        { ?b dc:title ?title }
    }

Resultados:

    ---------------------------------------------
    | title                                     |
    =============================================
    | "Harry Potter and the Sorcerer's Stone"   |
    | "Harry Potter and the Chamber of Secrets" |
    ---------------------------------------------

### Consulta para encontrar dados de grafos que casam com um padrão

O nome dos grafos a ser consultados podem ser determinados na consulta.  
O mesmo processo se aplica a variáveis se elas são parte de
um padrão de grafo ou na forma  `GRAPH` form. A consulta abaixo
([q-ds-4.rq](sparql_data/q-ds-4.rq)) seta uma condição nas variáveis 
usadas para selecionar grafos nomeados, baseada na informação do grafo padrão.

    PREFIX  xsd:    <http://www.w3.org/2001/XMLSchema#>
    PREFIX  dc:     <http://purl.org/dc/elements/1.1/>
    PREFIX  :       <.>

    SELECT ?date ?title
    {
      ?g dc:date ?date . FILTER (?date > "2005-08-01T00:00:00Z"^^xsd:dateTime )
      GRAPH ?g
          { ?b dc:title ?title }
    }

O resultado da consulta no dataset de exemplo são títulos em um dos grafos, o grafo com data anterior a 1 de agosto de 2005.

    -----------------------------------------------------------------------------------------
    | date                                      | title                                     |
    =========================================================================================
    | "2005-09-22T05:53:05+01:00"^^xsd:dateTime | "Harry Potter and the Sorcerer's Stone"   |
    | "2005-09-22T05:53:05+01:00"^^xsd:dateTime | "Harry Potter and the Chamber of Secrets" |
    -----------------------------------------------------------------------------------------

## Descrevendo datasets RDF  - `FROM` e `FROM NAMED`

À execução de um consulta pode ser dado o dataset quando o objeto da execução é construído ou ele pode ser 
descrito na própria consulta. Quando os detalhes estão na linha de comando,
um dataset temporário é criado, mas uma aplicação pode criar datasets e então usá-los em várias consultas.

Quando descrito na consulta, `FROM <i>url</i>` é usado para identificar o conteúdo a preencher o grafo padrão. 
Pode haver mais de uma clausula `FROM` e o grafo padrão é resultado da leitura de cada arquivo no grafo padrão. 
Isto é o merge de RDF de grafos individuais.

Não se confunda com o fato de um grafo padrão ser descrito por uma ou mais URL na clausula `FROM`. 
Esse é o lugar de onde o dado é lido, não o nome do grafo. 
Como muitas clausulas FROM podem ser fornecidas, o dado pode ser lido de vários lugares, 
mas nenhum deles se torna o nome do grafo.

`FROM NAMED <i>url</i>` é usado para identificar o grafo nomeado. Ao grafo é dado a url e o dado é lido daquela localização.
 Múltiplas clausulas `FROM NAMED` causam em muitos grafos para serem adicionados ao dataset.

Observe que os grafos são carregados com Jena FileManager que inclui a habilidade de prover localizações alternativas 
para os arquivos. Por exemplo, a consulta pode ter  `FROM NAMED <http://example/data>`,
e o dado ser lido de `file:local.rdf`. O nome do grafo vai ser <http://example/data\> como na consulta.

Por exemplo, a consulta para buscar todas as triplas em ambos o grafo padrão e os grafos nomeados poderia ser escrita como
([q-ds-5.rq](sparql_data/q-ds-5.rq)):

    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX dc:  <http://purl.org/dc/elements/1.1/>
    PREFIX :    <.>

    SELECT *
    FROM       <ds-dft.ttl>
    FROM NAMED <ds-ng-1.ttl>
    FROM NAMED <ds-ng-2.ttl>
    {
       { ?s ?p ?o } UNION { GRAPH ?g { ?s ?p ?o } }
    }

[Next: Resultados](sparql_results_pt.html)



