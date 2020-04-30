---
title:     Tutorial - Manipulando SPARQL usando ARQ
---

Quando você começa a trabalhar com SPARQL você rapidamente descobre que queries estáticas são restritivas.
 Talvez você queira mudar um valor, adicionar um filtro, alterar o limite, etc. Sendo do tipo impaciente, 
você começa a manipular a string da query e isso funciona. Mas o que dizer de little Bobby Tables? 
Além do mais, mesmo que você limpe ao máximo suas entradas, manipulação de strings é um processo 
tenso e erros de sintaxe esperam por você. Muito embora possa parecer mais difícil do que string munging, 
a API ARQ é sua amiga na longa jornada. 

*Originalmente publicado em  [Research Revealed project
blog](http://researchrevealed.ilrt.bris.ac.uk/?p=35)*

## Inserindo valores (comandos simples prontos)

Vamos começar com algo simples. Suponha que nós queiramos restringir a query a seguir a uma pessoa (person) em particular:

       select * { ?person <http://xmlns.com/foaf/0.1/name> ?name }

`String#replaceAll` deveria funcionar, mas existe um jeito mais seguro. 
`QueryExecutionFactory` em muitos casos, permite que você alimente uma  `QuerySolution`
com a qual você pode prefixar valores.

       QuerySolutionMap initialBinding = new QuerySolutionMap();
       initialBinding.add("name", personResource);
       qe = QueryExecutionFactory.create(query, dataset, initialBinding);

Isto geralmente é muito mais simples do que a string equivalente desde que você não tenha usar aspas para 
citações. (Esteja ciente de que isto não funciona para 
`sparqlService`, o que é uma pena. Seria legal gastar algum tempo consertando isto.)

## Fazendo uma Query a partir do zero

As limitações previamente mencionadas se devem ao fato de que prefixação na verdade não muda a query em nada, 
apenas a execução daquela query. Então, como nós realmente alteramos queries?

ARQ provê duas maneiras de se trabalhar com queries: no nível de sintaxe  (`Query`
and `Element`), ou no nível algébrico  (`Op`). A distinção entre eles fica claro com os filtros:

       SELECT ?s { ?s <http://example.com/val> ?val . FILTER ( ?val < 20 ) }

Se você trabalha no nível de sintaxe, você irá descobrir que isso (em pseudo código) se parece com : 

       (GROUP (PATTERN ( ?s <http://example.com/val> ?val )) (FILTER ( < ?val 20 ) ))

Isto é, existe um grupo contendo um padrão triplo e um filtro, do mesmo jeito que você vê na query. 
A álgebra é diferente e nós podemos vê-la usando  `arq.qparse --print op`

       $ java arq.qparse --print op 'SELECT ?s { ?s <http://example.com/val> ?val . FILTER ( ?val < 20 ) }'
       (base <file:///...>
           (project (?s)
               (filter (< ?val 20)
                   (bgp (triple ?s <http://example.com/val> ?val)))))

Aqui o filtro contém o padrão, ao invés de se situar próximo a ele. Esta forma torna claro que a expressão 
está filtrando o padrão.

Vamos criar esta query do zero usando ARQ. Nós começamos com algumas partes comuns: a tripla a ser comparada 
e a expressão a ser filtrada.


       // ?s ?p ?o .
       Triple pattern =
           Triple.create(Var.alloc("s"), Var.alloc("p"), Var.alloc("o"));
       // ( ?s < 20 )
       Expr e = new E_LessThan(new ExprVar("s"), new NodeValueInteger(20));

`Triple` deveria ser familiar de Jena.  `Var` é uma extensão de `Node`
para variáveis. `Expr` é a interface raíz para expressões, aquelas coisas que aparecem em `FILTER` and `LET`.

Primeiro, o caminho da sintaxe:

       ElementTriplesBlock block = new ElementTriplesBlock(); // Make a BGP
       block.addTriple(pattern);                              // Add our pattern match
       ElementFilter filter = new ElementFilter(e);           // Make a filter matching the expression
       ElementGroup body = new ElementGroup();                // Group our pattern match and filter
       body.addElement(block);
       body.addElement(filter);

       Query q = QueryFactory.make();
       q.setQueryPattern(body);                               // Set the body of the query to our group
       q.setQuerySelectType();                                // Make it a select query
       q.addResultVar("s");                                   // Select ?s

Agora a álgebra:

       Op op;
       BasicPattern pat = new BasicPattern();                 // Make a pattern
       pat.add(pattern);                                      // Add our pattern match
       op = new OpBGP(pat);                                   // Make a BGP from this pattern
       op = OpFilter.filter(e, op);                           // Filter that pattern with our expression
       op = new OpProject(op, Arrays.asList(Var.alloc("s"))); // Reduce to just ?s
       Query q = OpAsQuery.asQuery(op);                       // Convert to a query
       q.setQuerySelectType();                                // Make is a select query

Note que o tipo da query  (`SELECT, CONSTRUCT, DESCRIBE, ASK`)não é parte da álgebra, 
e que nós temos que configurar isso na query (embora SELECT seja o padrão).  `FROM` e `FROM NAMED` 
estão igualmente ausentes.

## Navegando e Aprendendo: Visitors

Você também pode olhar para a álgebra e a sintaxe usando visitors. Comece estendendo `OpVisitorBase` 
(`ElementVisitorBase`) que apaga a interface de modo que você pode se concentrar nas partes de interesse, 
então dê um passo a frente e use `OpWalker.walk(Op, OpVisitor)`
(`ElementWalker.walk(Element, ElementVisitor)`). Isso funciona no esquema “bottom up” (de baixo para cima).

Para algumas alterações, como manipulação de padrões triplos no local, visitors irão trabalhar bem.
 Eles provêm um jeito simples de manipular as partes certas da query e você pode alterar as BGPs backing
 padrões  tanto na álgebra quanto na sintaxe. Entretanto, mutações (mutation) não estão consistentemente
 disponíveis, não conte com elas. 

## Transformando a Álgebra

A primeira vista, não há vantagens óbvias em usar a álgebra. O real poder fica claro com o uso de 
transformers (transformações), que lhe permitem reorganizar uma álgebra completamente. ARQ faz amplo 
uso de transformers para simplificar e aperfeiçoar execuções de query.  

Em Research Revealed (Pesquisa revelada, em tradução livre), eu escrevi algum código para pegar certo 
número de constraints (constantes) e produzir uma query. Havia várias formas de se fazer isto, mas o 
jeito que eu achei foi gerar ops de cada constraint e juntar o resultado.  

       for (Constraint con: cons) {
           op = OpJoin.create(op, consToOp(cons)); // join
       }

O resultado foi uma bagunça incrivelmente correta, que é remotamente compreensível em apenas três condições:

       (join
           (join
               (filter (< ?o0 20) (bgp (triple ?s <urn:ex:prop0> ?o0)))
               (filter (< ?o1 20) (bgp (triple ?s <urn:ex:prop1> ?o1))))
           (filter (< ?o2 20) (bgp (triple ?s <urn:ex:prop2> ?o2))))

Cada uma das constraints é um filtro e um bgp. Isso pode ser muito mais compreensível removendo os
 filtros e juntando (merging) os padrões triplos. Nós podemos fazer isso usando  `Transform`:

       class QueryCleaner extends TransformBase
       {
           @Override
           public Op transform(OpJoin join, Op left, Op right) {
               // Bail if not of the right form
               if (!(left instanceof OpFilter && right instanceof OpFilter)) return join;
               OpFilter leftF = (OpFilter) left;
               OpFilter rightF = (OpFilter) right;

               // Add all of the triple matches to the LHS BGP
               ((OpBGP) leftF.getSubOp()).getPattern().addAll(((OpBGP) rightF.getSubOp()).getPattern());
               // Add the RHS filter to the LHS
               leftF.getExprs().addAll(rightF.getExprs());
               return leftF;
           }
       }
       ...
       op = Transformer.transform(new QueryCleaner(), op); // clean query

O código abaixo procura pelos  joins do formulário:

       (join
           (filter (exp1) (bgp1))
           (filter (exp2) (bgp2)))

E substitui ele com:

       (filter (exp1 && exp2) (bgp1 && bgp2))

Enquanto nós percorremos a query original, todos os joins são removidos e o resultado final é:

       (filter (exprlist (< ?o0 20) (< ?o1 20) (< ?o2 20))
           (bgp
               (triple ?s <urn:ex:prop0> ?o0)
               (triple ?s <urn:ex:prop1> ?o1)
               (triple ?s <urn:ex:prop2> ?o2)
       ))
Isto completa esta breve introdução. Existe muito mais em ARQ, claro, mas esperamos que você tenha tido um gostinho do que ele pode fazer.
