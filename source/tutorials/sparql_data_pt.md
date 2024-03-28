---
title: Tutorial SPARQL - Formato de Dados
---

Primeiro, nós precisamos esclarecer quais dados estão sendo consultados. SPARQL consulta grafos RDF. Um grafo RDF é um conjunto de triplas (Jena chama os grafos de modelos e as triplas de sentenças porque assim eram chamadas quando a API foi elaborada inicialmente).

É importante perceber que o que importa são as triplas, e não a serialização. A serialização é apenas uma maneira de escrever as triplas. RDF/XML é uma recomendação da W3C, mas isso pode dificultar a visão das triplas porque há múltiplas formas de codificar o mesmo grafo. Neste tutorial, usamos uma serialização mais parecida com triplas, chamada [Turtle](http://www.ilrt.bris.ac.uk/discovery/2004/01/turtle/) (veja também a linguagem N3 descrita pela [W3C semantic web primer](https://www.w3.org/2000/10/swap/Primer)).

Nós vamos começar os dados em [vc-db-1.rdf](sparql_data/vc-db-1.rdf):
este arquivo contém RDF para uma quantidade de descrições de vcards de pessoas. Vcards são descritos em 
[RFC2426](https://www.ietf.org/rfc/rfc2426.txt) e a tradução RDF é descrita na nota da W3C 
"[Representing vCard Objects in RDF/XML](https://www.w3.org/TR/vcard-rdf.html)".
Nosso banco de dados exemplo apenas contém alguma informação sobre nomes.

Graficamente, os dados se assemelham a:

![Graph of the vCard database](/images/vc-db.png "Graph of the vCard database")

Em triplas, devem se parecer com:

```turtle
@prefix vCard:   <http://www.w3.org/2001/vcard-rdf/3.0#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix :        <#> .

<http://somewhere/MattJones/>
    vCard:FN    "Matt Jones" ;
    vCard:N     [ vCard:Family
                              "Jones" ;
                  vCard:Given
                              "Matthew"
                ] .

<http://somewhere/RebeccaSmith/>
    vCard:FN    "Becky Smith" ;
    vCard:N     [ vCard:Family
                              "Smith" ;
                  vCard:Given
                              "Rebecca"
                ] .

<http://somewhere/JohnSmith/>
    vCard:FN    "John Smith" ;
    vCard:N     [ vCard:Family
                              "Smith" ;
                  vCard:Given
                              "John"
                ] .

<http://somewhere/SarahJones/>
    vCard:FN    "Sarah Jones" ;
    vCard:N     [ vCard:Family
                              "Jones" ;
                  vCard:Given
                              "Sarah"
                ] .
```

ou então mais explicitamente como triplas:

```turtle
@prefix vCard:   <http://www.w3.org/2001/vcard-rdf/3.0#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

<http://somewhere/MattJones/>  vCard:FN   "Matt Jones" .
<http://somewhere/MattJones/>  vCard:N    _:b0 .
_:b0  vCard:Family "Jones" .
_:b0  vCard:Given  "Matthew" .


<http://somewhere/RebeccaSmith/> vCard:FN    "Becky Smith" .
<http://somewhere/RebeccaSmith/> vCard:N     _:b1 .
_:b1 vCard:Family "Smith" .
_:b1 vCard:Given  "Rebecca" .

<http://somewhere/JohnSmith/>    vCard:FN    "John Smith" .
<http://somewhere/JohnSmith/>    vCard:N     _:b2 .
_:b2 vCard:Family "Smith" .
_:b2 vCard:Given  "John"  .

<http://somewhere/SarahJones/>   vCard:FN    "Sarah Jones" .
<http://somewhere/SarahJones/>   vCard:N     _:b3 .
_:b3 vCard:Family  "Jones" .
_:b3 vCard:Given   "Sarah" .
```

É importante perceber que elas são as mesmas do grafo RDF e que as triplas no grafo não estão em alguma ordem particular. Elas são apenas escritas em grupos relacionados para a leitura humana – a máquina não se importa com isso.

[Próximo: Uma consulta simples](sparql_query1_pt.html)



