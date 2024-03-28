---
title: Tutorial SPARQL - A primeira consulta SPARQL
---

Nesta sessão, vamos olhar para a primeira consulta simples e mostrar como executá-la em Jena.

## O "hello world" de consultas

O arquivo "[q1.rq](sparql_data/q1.rq)" contem a seguinte consulta:

```sparql
SELECT ?x
WHERE { ?x  <http://www.w3.org/2001/vcard-rdf/3.0#FN>  "John Smith" }
```

executando esta consulta com a aplicação de consultas em linhas de comando:

```turtle
---------------------------------
| x                             |
=================================
| <http://somewhere/JohnSmith/> |
---------------------------------
```

Isso funciona casando o padrão da tripla na clausula `WHERE` contra as triplas no grafo RDF. O predicado e o objeto da tripla são valores fixos, então o padrão vai casar somente triplas com estes valores. O sujeito é a variável, e não há outras restrições para a variável. O padrão casa qualquer tripla com aquele predicado e aquele objeto, e isso casa com soluções para `x`.

O item entre  `<\>` é a URI (atualmente, é uma IRI) e o item entre "" é uma literal. Assim como Turtle, N3 ou N-Triplas, literais tipadas são escritas com \^\^e tags de linguagem podem ser adicionadas com @.

`?x` é uma variável chamada x. A ? não faz parte do nome e por conta disso não aparece nos resultados.

Há um casamento. A consulta retorna o casamento na variável x da consulta. A saída mostrada foi obtida usando uma das aplicações de ARQ em linhas de comando.

## Executando a consulta

Há [scripts de ajuda](/documentation/query/cmds.html) nos diretórios de  ARQ `bat/` e
`bin/` de sua distribuição. Eles podem não estar na distribuição do Jena. Você deve checar esses scripts antes de usá-los.

### Instalação no Windows

Aponte a variável de ambiente `ARQROOT` para a localização do arquivo na distribuição do ARQ.

```
> set ARQROOT=c:\MyProjects\ARQ
```

A distribuição normalmente contém o número da versão no nome do diretório.

No diretório do ARQ, execute:

```
> bat\sparql.bat --data=doc\Tutorial\vc-db-1.rdf --query=doc\Tutorial\q1.rq
```
 
Você pode simplesmente colocar o diretório `bat/` no seu classpath ou copiar os programas lá. Todos eles dependem de ARQROOT.

### scripts bash para Linux/Cyqwin/Unix

Aponte a variável de ambiente `ARQROOT` para a localização do arquivo na distribuição do ARQ.

```bash
$ export ARQROOT=$HOME/MyProjects/ARQ
```

A distribuição normalmente contém o número da versão no nome do diretório.

No diretório do ARQ, execute:

```bash
$ bin/sparql --data=doc/Tutorial/vc-db-1.rdf --query=doc/Tutorial/q1.rq
```

Você pode simplesmente colocar o diretório `bin/` no seu classpath ou copiar os programas lá. Todos eles dependem de ARQROOT.

[Cygwin](https://www.cygwin.com/) é um ambiente Linux para Windows.

### Usando a aplicação de linhas de comando de Jena diretamente

Você precisará modificar o classpath para incluir *todos* os arquivos jar do diretório `lib/` do ARQ.

Por exemplo, no Windows:

```
ARQdir\lib\antlr-2.7.5.jar;ARQdir\lib\arq-extra.jar;ARQdir\lib\arq.jar;
ARQdir\lib\commons-logging-1.1.jar;ARQdir\lib\concurrent.jar;ARQdir\lib\icu4j_3_4.jar;
ARQdir\lib\iri.jar;ARQdir\lib\jena.jar;ARQdir\lib\jenatest.jar;
ARQdir\lib\json.jar;ARQdir\lib\junit.jar;ARQdir\lib\log4j-1.2.12.jar;
ARQdir\lib\lucene-core-2.2.0.jar;ARQdir\lib\stax-api-1.0.jar;
ARQdir\lib\wstx-asl-3.0.0.jar;ARQdir\lib\xercesImpl.jar;ARQdir\lib\xml-apis.jar
```

onde `ARQdir` é onde você descompactou o ARQ. Isso tudo precisa estar numa linha.

Os nomes dos arquivos JAR muitas vezes mudam e novos arquivos são adicionados – verifique essa lista com sua versão do ARQ.

Os comandos estão no pacote ARQ.

[Próximo: Padrões Básicos](sparql_basic_patterns_pt.html)



