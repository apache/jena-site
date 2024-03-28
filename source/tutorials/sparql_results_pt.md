---
title: Produzindo resultados
---

SPARQL tem quatro formas de se obter resultados:

-   SELECT – Retorna uma tabela de resultados.
-   CONSTRUCT – Retorna um grafo RDF, baseado num template da consulta.
-   DESCRIBE – Retorna um grafo RDF, baseado no quê o processador está configurado para retornar.
-   ASK – Faz uma consulta booleana.

A forma SELECT, diretamente, retorna uma tabela de soluções como conjunto de resultados, enquanto que DESCRIBE e CONSTRUCT o resultado da consulta para montar um grafo RDF.

## Modificadores de Soluções

Casamento de padrões produz um conjunto de soluções. Esse conjunto pode ser modificado de várias maneiras:

-   Projection - mantém apenas variáveis selecionadas
-   OFFSET/LIMIT - recorta o número de soluções (melhor usado com ORDER BY)
-   ORDER BY - resultados ordenados
-   DISTINCT - retorna apenas uma linha para uma combinação de variáveis e valores.

Os modificadores de solução OFFSET/LIMIT e ORDER BY sempre se aplica a todos os resultados.

### OFFSET e LIMIT

Um conjunto de soluções pode ser abreviado especificando o deslocamento (índice inicial) e o limite (número de soluções) a ser retornados. Usando apenas LIMIT é útil para garantir que nem tantas soluções vão ser retornadas, para restringir o efeito de uma situação inesperada. LIMIT e OFFSET pode ser usado em conjunção com ordenamento para pegar um fatia definida dentre as soluções encontradas.

### ORDER BY

Soluções SPARQL são ordenadas por expressões, incluindo funções padrões.

```sparql
ORDER BY ?x ?y

ORDER BY DESC(?x)

ORDER BY x:func(?x)  # Custom sorting condition
```

### DISTINCT

O SELECT pode usar o modificador DISTINCT para garantir que duas soluções retornadas sejam diferentes.

## SELECT

O `SELECT` é uma projeção, com DISTINCT aplicado, do conjunto solução. `SELECT` identifica quais variáveis nomeadas estão no conjunto resultado. Isso pode ser um "*" significando que “todas as variáveis” (blank nodes na consulta atuam como variáveis para casamento, mas nada é retornado).

## CONSTRUCT

CONSTRUCT monta um RDF baseado num grafo template. O grafo template pode ter variáveis que são definidas na clausula WHERE. O efeito é o cálculo de um fragmento de grafo, dado o template, para cada solução da clausula WHERE, depois levando em conta qualquer modificador de solução. Os fragmentos de grafo, um por solução, são juntados num único grafo RDF que é o resultado.

Qualquer blank node explicitamente mencionado no grafo template são criados novamente para cada vez que o template é usado para uma solução.

## DESCRIBE

CONSTRUCT pega um template para o grafo de resultados. O DESCRIBE também cria um grafo mas a forma deste grafo é fornecida pelo processador da consulta, não a aplicação. Pra cada URI encontrada, ou explicitamente mencionada na clausula DESCRIBE, o processor de consultas deve prover um fragmento de RDF útil, como todos os detalhes conhecidos de um livro. ARQ permite a escrita de manipuladores de descrições especificas de domínio.

## ASK

ASK retorna um booleano, true se o padrão for casado, ou false caso contrário.

[Retornar ao índice](index.html)



