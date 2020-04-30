---
title: Uma Introdução a RDF e à API RDF de Jena
---

<h2>Prefácio</h2>

Este é um tutorial introdutório ao framework de descrição de recursos (RDF)
e Jena, uma API Java para RDF. Ele é escrito para programadores que 
não estão familiarizados com RDF e que aprendem melhor através de prototipagem, 
ou, por outros motivos, desejam avançar rapidamente para a implementação. 
Familiaridade com XML e Java é assumido.

<p>Avançar direto para a implementação, sem conhecer inicialmente o modelo de dados de RDF, 
levará à frustração e ao desapontamento. No entanto, estudar unicamente o modelo de dados é 
desgastante e muitas vezes leva a "enigmas metafísicos torturantes". É melhor, 
então, abordar os conceitos do modelo de dados e como usá-lo, paralelamente. 
Aprender um pouco o modelo de dados, e praticá-lo. Então aprender um pouco mais e praticar. 
A teoria leva à prática , e a prática leva à teoria. O modelo de dados é 
relativamente simples, então esta abordagem não exigirá muito tempo.</p>

<p>RDF possui uma sintaxe XML, e muitos dos que são familiarizados com XML irão pensar em RDF em termos da sintaxe do XML. Isso é um erro. RDF deve ser entendido em termos do seu modelo de dados. Os dados RDF podem ser representados em XML, mas entender a sintaxe é menos importante do que entender o modelo de dados.</p>

<p>Uma implementação da API JENA, incluindo o código fonte dos exemplos usados neste tutorial, podem ser baixados em  
<a href="//jena.apache.org/download/index.cgi"><code>jena.apache.org/download/index.cgi</code></a>.</p>

<p></p>

<h2>Conteúdo</h2>
<ol>
  <li><a href="#ch-Introduction">Introdução</a></li>
  <li><a href="#ch-Statements">Sentenças</a></li>
  <li><a href="#ch-Writing-RDF">Escrita de RDF</a></li>
  <li><a href="#ch-Reading-RDF">Leitura de RDF</a></li>
  <li><a href="#ch-Prefixes">Controle de Prefixos</a></li>
  <li><a href="#ch-Jena-RDF-Packages">Pacotes de Jena RDF</a></li>
  <li><a href="#ch-Navigating-a-Model">Navegação em Modelos</a></li>
  <li><a href="#ch-Querying-a-Model">Consulta de Modelos</a></li>
  <li><a href="#ch-Operations-on-Models">Operações em Modelos</a></li>
  <li><a href="#ch-Containers">Containers</a></li>
  <li><a href="#ch-More-about-Literals-and-Datatypes">Mais sobre Literais e Datatypes</a></li>
  <li><a href="#ch-Glossary">Glossário</a></li>
</ol>

<h2><a id="ch-Introduction">Introdução</a></h2>

<p> O framework de descrição de recursos (RDF) é um padrão (tecnicamente uma recomendação da W3C) para descrever recursos. Mas o que são recursos? Isso é uma questão profunda e a definição precisa ainda é um assunto de debates. Para nossos propósitos, nós podemos pensar em recursos como tudo que podemos identificar. Você é um recurso, assim como sua página pessoal, este tutorial, o número um e a grande baleia branca em Moby Dick.</p>

<p>Nossos exemplos neste tutorial serão sobre pessoas.  Elas usam uma <a
href="http://www.w3.org/TR/vcard-rdf">representação RDF de cartão de negócios (VCARDS)</a>. RDF é melhor representado como um diagrama de nós e arcos. Um simples vcard se assemelha a isto em RDF:</p>

<p align="center">
<img border="0" src="figures/fig1.png" alt="figure 1" width="240" height="180"></p>

<p>O <a href="#glos-Resource"><i>recurso</i></a>, John Smith, é exibido como uma elipse e identificado por um Identificador Uniforme de Recurso (URI)<font
size="1"><sup><a href="#fn-01">1</a></sup></font>,  neste caso
"http://.../JohnSmith". Se você tentar acessar o recurso usando seu navegador, não vai obter sucesso. Se você não tem familiaridade com URI's, pense neles como nomes estranhos.</p>

<p>Recursos possuem <a href="#glos-Property"><i>propriedades</i></a>.  Nesses exemplos, nós estamos interessados nos tipos de propriedades que apareceriam no cartão de negócios de Jonh Smith. A figura 1 mostra somente  uma propriedade, o nome completo (full name) de Jonh Smith. Uma propriedade é representada por um arco, intitulado com o nome da propriedade. O nome da propriedade é também um URI, mas como os URIs são longos e incomodas, o diagrama o exibe em forma XML qname. A parte antes de  ':' é chamada de prefixo namespace e representa um namespace. A parte depois de ':' é um nome local e representa o nome naquele namespace. Propriedades são normalmente representadas nesta forma de qname quando escrito como RDF XML, e isso é uma maneira prática de representá-los em diagramas e textos. No entanto, propriedades são rigorosamente representadas por um URI. A forma nsprefix:localname  é um atalho para o URI do namespace concatenado com o nome local. Não há exigências de que o URI de uma propriedade resulte em algo quando acessado do navegador.</p>

<p>Toda propriedade possui um valor. Neste caso, o valor é uma <a
href="#glos-Literal"><i>literal</i></a>, que por hora podemos pensar nelas como uma cadeia de caracteres<font size="1"><sup><a href="#fn-02">2</a></sup></font>.
Literais são exibidas em retângulos.</p>

<p>Jena é uma API Java que pode ser usada para pra criar e manipular grafos RDF como o apresentado no exemplo. Jena possui classes para representar grafos, recursos, propriedades e literais. As interfaces que representam recursos, propriedades e literais são chamadas de modelo e é representada pela interface Model.</p>

<p>O código para criar este grafo, ou modelo, é simples:</p>

<pre>// some definitions
static String personURI    = "http://somewhere/JohnSmith";
static String fullName     = "John Smith";

// create an empty Model
Model model = ModelFactory.createDefaultModel();

// create the resource
Resource johnSmith = model.createResource(personURI);

// add the property
johnSmith.addProperty(VCARD.FN, fullName);
</pre>


<p>Ele começa com algumas definições de constantes e então cria um Model vazio, usando o método <code>createDefaultModel()</code> de <code>ModelFactory</code>
para criar um modelo na memória. Jena possui outras implementações da interface Model, e.g. uma que usa banco de dados relacionais: esses tipos de modelo são também disponibilizados a partir de ModelFactory.</p>

<p>O recurso Jonh Smith é então criado, e uma propriedade é adicionada a ele. A propriedade é fornecida pela a classe "constante"  VCARD, que mantém os objetos que representam todas as definições no esquema de VCARD. Jena provê classes constantes para outros esquemas bem conhecidos, bem como os próprios RDF e RDFs , Dublin Core e OWL.</p>

<p>O código para criar o recurso e adicionar a propriedade pode ser escrito de forma mais compacta usando um estilo cascata:</p>


<pre>Resource johnSmith =
       model.createResource(personURI)
            .addProperty(VCARD.FN, fullName);
</pre>

<p>Os códigos desse exemplo podem ser encontrados no diretório /src-examples no pacote de distribuição do Jena como <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial01.java">tutorial 1</a>. Como exercício, pegue este código e modifique-o para criar um próprio VCARD para você.</p>

<p>Agora vamos adicionar mais detalhes ao vcard, explorando mais recursos de RDF e Jena.</p>

<p>No primeiro exemplo, o valor da propriedade foi um número. As propriedades RDF podem também assumir outros recursos como valor. Usando uma técnica comum em RDF, este exemplo mostra como representar diferentes partes do nome de Jonh Smith:</p>

<p align="center">
<img border="0" src="figures/fig2.png" alt="figure 2" width="360" height="240"></p>

<p>Aqui, nós adicionamos uma nova propriedade, vcard:N, para representar a estrutura do nome de Jonh Smith. Há muitas coisas interessantes sobre este modelo. Note que a propriedade vcard:N usa um recurso como seu valor. Note também que a elipse que representa a composição do nome não possui URI. Isso é conhecido como <i><a href="#glos-blank node">blank Node</a>.</i></p>

<p>O código Jena para construir este exemplo é, novamente, muito simples. Primeiro algumas declarações e a criação do modelo vazio.</p>


<pre>// some definitions
String personURI    = "http://somewhere/JohnSmith";
String givenName    = "John";
String familyName   = "Smith";
String fullName     = givenName + " " + familyName;

// create an empty Model
Model model = ModelFactory.createDefaultModel();

// create the resource
//   and add the properties cascading style
Resource johnSmith
  = model.createResource(personURI)
         .addProperty(VCARD.FN, fullName)
         .addProperty(VCARD.N,
                      model.createResource()
                           .addProperty(VCARD.Given, givenName)
                           .addProperty(VCARD.Family, familyName));
</pre>


<p>Os códigos desse exemplo podem ser encontrados no diretório /src-examples no pacote de distribuição do Jena como <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial02.java">tutorial 2</a>.</p>

<h2><a id="ch-Statements">Sentenças</a></h2>

<p>Cada arco no modelo RDF é chamado de <i><a
href="#glos-Statement">sentença</a></i>. Cada sentença define um fato sobre o recurso. Uma sentença possui três partes:</p>
<ul>
  <li>o <i><a href="#glos-Subject"> sujeito</a></i> é o recurso de onde o arco começa.</li>
  <li>o <i><a href="#glos-Predicate"> predicado</a></i> é a propriedade que nomeia o arco.</li>
  <li>o <i><a href="#glos-Object"> objeto</a></i> é o recurso ou literal apontado pelo arco.</li>
</ul>

<p>Uma sentença é algumas vezes chamadas de <a href="#glos-Triple">tripla</a>,
por causa de suas três partes.</p>

<p>Um modelo RDF é representado como um <i>conjunto </i> de sentenças. Cada chamada a 
<code>addProperty</code> no tutorial2 adiciona uma nova sentença. (Já que um modelo é um conjunto de sentenças, adicionar sentenças duplicadas não afeta em nada). A interface modelo de Jena define o método  <code>listStatements()</code> que retorna um <code>StmtIterator</code>, um subtipo de 
<code>Iterator</code> Java sobre todas as sentenças de um modelo.
<code>StmtIterator</code> possui o método <code>nextStatement()</code>
que retorna a próxima sentença do iterador (o mesmo que <code>next()</code> faz, já convertido para  <code>Statement</code>). A interface <code>Statement</code> provê métodos de acesso ao sujeito, predicado e objeto de uma sentença.</p>

<p>Agora vamos usar essa interface para estender tutorial2 para listar todas as sentenças criadas e imprimi-las. O código completo deste exemplo pode ser encontrado em <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial03.java">tutorial 3</a>.</p>


<pre>// list the statements in the Model
StmtIterator iter = model.listStatements();

// print out the predicate, subject and object of each statement
while (iter.hasNext()) {
    Statement stmt      = iter.nextStatement();  // get next statement
    Resource  subject   = stmt.getSubject();     // get the subject
    Property  predicate = stmt.getPredicate();   // get the predicate
    RDFNode   object    = stmt.getObject();      // get the object

    System.out.print(subject.toString());
    System.out.print(" " + predicate.toString() + " ");
    if (object instanceof Resource) {
       System.out.print(object.toString());
    } else {
        // object is a literal
        System.out.print(" \"" + object.toString() + "\"");
    }

    System.out.println(" .");
}
</pre>


<p>Já que o objeto de uma sentença pode ser tanto um recurso quanto uma literal, o método 
<code>getObject()</code> retorna um objeto do tipo <code>RDFNode</code>, que é uma superclasse comum de ambos <code>Resource</code> e <code>Literal</code>. O objeto em si é do tipo apropriado, então o código usa <code>instanceof</code> para determinar qual e processá-lo de acordo.</p>

<p>Quando executado, o programa deve produzir a saída:</p>
<pre>http://somewhere/JohnSmith http://www.w3.org/2001/vcard-rdf/3.0#N anon:14df86:ecc3dee17b:-7fff .
anon:14df86:ecc3dee17b:-7fff http://www.w3.org/2001/vcard-rdf/3.0#Family  "Smith" .
anon:14df86:ecc3dee17b:-7fff http://www.w3.org/2001/vcard-rdf/3.0#Given  "John" .
http://somewhere/JohnSmith http://www.w3.org/2001/vcard-rdf/3.0#FN  "John Smith"
.
</pre>

<p></p>

<p>Agora você sabe o porquê de ser simples elaborar modelos. Se você olhar atentamente, você perceberá que cada linha consiste de três campos representando o sujeito, predicado e objeto de cada sentença. Há quatro arcos no nosso modelo, então há quatro sentenças. O "anon:14df86:ecc3dee17b:-7fff" é um identificador interno gerado pelo Jena. Não é uma URI e não deve ser confundido como tal. É simplesmente um nome interno usado pela implementação do Jena.</p>

<p>O W3C <a href="http://www.w3.org/2001/sw/RDFCore/">RDFCore Working
Group</a> definiu uma notação similar chamada <a href="http://www.w3.org/TR/rdf-testcases/#ntriples">N-Triples</a>. O nome significa "notação de triplas". Nós veremos na próxima sessão que o Jena possui uma interface de escrita de N-Triples também.</p>

<h2><a id="ch-Writing-RDF">Escrita de RDF</a></h2>

<p>Jena possui métodos para ler e escrever RDF como XML. Eles podem ser usados para armazenar o modelo RDF em um arquivo e carregá-lo novamente em outro momento.</p>

<p>O Tutorial 3 criou um modelo e o escreveu no formato de triplas. <a
href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial04.java">Tutorial 4</a> modifica o tutorial 3 para escrever o modelo na forma de RDF XML numa stream de saída. O código, novamente, é muito simples: <code>model.write</code> pode receber um  <code>OutputStream</code> como argumento.</p>


  <pre>// now write the model in XML form to a file
model.write(System.out);</pre>


<p>A saída deve parecer com isso:</p>


  <pre>&lt;rdf:RDF
  xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  xmlns:vcard='http://www.w3.org/2001/vcard-rdf/3.0#'
 &gt;
  &lt;rdf:Description rdf:about='http://somewhere/JohnSmith'&gt;
    &lt;vcard:FN&gt;John Smith&lt;/vcard:FN&gt;
    &lt;vcard:N rdf:nodeID=&quot;A0&quot;/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:nodeID=&quot;A0&quot;&gt;
    &lt;vcard:Given&gt;John&lt;/vcard:Given&gt;
    &lt;vcard:Family&gt;Smith&lt;/vcard:Family&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;</pre>

<p></p>

<p>As especificações de RDF especificam como representar RDF como XML. A sintaxe de RDF XML é bastante complexa. Recomendamos ao leitor dar uma olhada no <a href="http://www.w3.org/TR/rdf-primer/">primer</a>  sendo desenvolvido pelo RDFCore WG para uma introdução mais detalhada. Entretanto, vamos dar uma olhada rápida em como interpretar a saída acima.</p>

<p>RDF é normalmente encapsulada num elemento &lt;rdf:RDF&gt;. O elemento é opcional se houver outras maneiras de saber se aquele XML é RDF, mas normalmente ele é presente. O elemento RDF define os dois namespaces usados no documento. Há um elemento  &lt;rdf:Description&gt; que descreve o recurso cuja URI é "http://somewhere/JohnSmith". Se o atributo rdf:about estivesse ausente, esse elemento representaria um blank node.</p>

<p>O elemento &lt;vcard:FN&gt; descreve uma propriedade do recurso. O nome da propriedade é o "FN" no namespace do vcard. RDF o converte para uma referência URI concatenando a referência URI do prefixo presente no namespace de vcard e "FN", o nome local parte do nome. Isto nos dá a referência URI " http://www.w3.org/2001/vcard-rdf/3.0#FN". O valor da propriedade é a literal "Jonh Smith".</p>

<p>O elemento &lt;vcard:N&gt; é um recurso. Neste caso, o recurso é representado por uma referência URI relativa. RDF o converte para uma referência URI absoluta concatenando com o URI base do documento.</p>

<p>Há um erro nesse RDF XML: ele não representa exatamente o modelo que criamos. Foi dado uma URI ao blank node do modelo. Ele não é mais um blank node portanto. A sintaxe RDF/XML não é capaz de representar todos os modelos RDF; por exemplo, ela não pode representar um blank node que é o objeto de duas sentenças. O escritor que usamos para escrever este RDF/XML não é capaz de escrever corretamente o subconjunto de modelos que podem ser escritos corretamente. Ele dá uma URI a cada blank node, tornando-o não mais blank.</p>

<p>Jena possui uma interface extensível que permite novos escritores para diferentes linguagens de serialização RDF. Jena possuem também um escritor RDF/XML mais sofisticado que pode ser invocado ao especificar outro argumento à chamada de método 
<code>write()</code>:</p>

<pre>// now write the model in XML form to a file
model.write(System.out, "RDF/XML-ABBREV");
 </pre>

<p>Este escritor, chamado também de PrettyWriter, ganha vantagem ao usar as particularidades da sintaxe abreviada de RDF/XML ao criar um modelo mais compacto. Ele também é capaz de preservar os blank nodes onde é possível. Entretanto, não é recomendável para escrever modelos muito grandes, já que sua desempenho deixa a desejar. Para escrever grandes arquivos e preservar os blank nodes, escreva no formato de N-Triplas:</p>


<pre>// now write the model in XML form to a file
model.write(System.out, "N-TRIPLE");
</pre>


<p>Isso produzirá uma saída similar à do tutorial 3, que está em conformidade com a especificação de N-Triplas.</p>

<h2><a id="ch-Reading-RDF">Leitura de RDF</a></h2>

<p><a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial05.java">Tutorial 5</a> demonstra a leitura  num modelo de sentenças gravadas num RDF XML. Com este tutorial, nós teremos criado uma pequena base de dados de vcards na forma RDF/XML. O código a seguir fará leitura e escrita. <em>Note que para esta aplicação rodar, o arquivo de entrada precisa estar no diretório da aplicação.</em></p>


<pre>
// create an empty model
Model model = ModelFactory.createDefaultModel();

// use the FileManager to find the input file
InputStream in = FileManager.get().open( inputFileName );
if (in == null) {
    throw new IllegalArgumentException(
                                 "File: " + inputFileName + " not found");
}

// read the RDF/XML file
model.read(in, null);

// write it to standard out
model.write(System.out);
</pre>


<p>O segundo argumento da chamada de método <code>read()</code> é a URI que será usada para resolver URIs relativas. Como não há referências URI relativas no arquivo de teste, ele pode ser vazio. Quando executado, <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial05.java"> tutorial 5</a> produzirá uma saída XML como esta:</p>


<pre>&lt;rdf:RDF
  xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  xmlns:vcard='http://www.w3.org/2001/vcard-rdf/3.0#'
 &gt;
  &lt;rdf:Description rdf:nodeID=&quot;A0&quot;&gt;
    &lt;vcard:Family&gt;Smith&lt;/vcard:Family&gt;
    &lt;vcard:Given&gt;John&lt;/vcard:Given&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about='http://somewhere/JohnSmith/'&gt;
    &lt;vcard:FN&gt;John Smith&lt;/vcard:FN&gt;
    &lt;vcard:N rdf:nodeID=&quot;A0&quot;/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about='http://somewhere/SarahJones/'&gt;
    &lt;vcard:FN&gt;Sarah Jones&lt;/vcard:FN&gt;
    &lt;vcard:N rdf:nodeID=&quot;A1&quot;/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about='http://somewhere/MattJones/'&gt;
    &lt;vcard:FN&gt;Matt Jones&lt;/vcard:FN&gt;
    &lt;vcard:N rdf:nodeID=&quot;A2&quot;/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:nodeID=&quot;A3&quot;&gt;
    &lt;vcard:Family&gt;Smith&lt;/vcard:Family&gt;
    &lt;vcard:Given&gt;Rebecca&lt;/vcard:Given&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:nodeID=&quot;A1&quot;&gt;
    &lt;vcard:Family&gt;Jones&lt;/vcard:Family&gt;
    &lt;vcard:Given&gt;Sarah&lt;/vcard:Given&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:nodeID=&quot;A2&quot;&gt;
    &lt;vcard:Family&gt;Jones&lt;/vcard:Family&gt;
    &lt;vcard:Given&gt;Matthew&lt;/vcard:Given&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about='http://somewhere/RebeccaSmith/'&gt;
    &lt;vcard:FN&gt;Becky Smith&lt;/vcard:FN&gt;
    &lt;vcard:N rdf:nodeID=&quot;A3&quot;/&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;</pre>


<h2 id="ch-Prefixes">Controlando prefixos</h2>

<h3>Definições explícitas de prefixos</h3>

Na sessão anterior, nós vimos que a saída XML declarou um prefixo namespace  
<code>vcard</code> e o usou para abreviar URIs. Enquanto que RDF usa somente URIs completas, e não sua forma encurtada, Jena provê formas de controlar namespaces usados na saída com seu mapeamento de prefixos. Aqui vai um exemplo simples.


<pre>
 Model m = ModelFactory.createDefaultModel();
 String nsA = "http://somewhere/else#";
 String nsB = "http://nowhere/else#";
 Resource root = m.createResource( nsA + "root" );
 Property P = m.createProperty( nsA + "P" );
 Property Q = m.createProperty( nsB + "Q" );
 Resource x = m.createResource( nsA + "x" );
 Resource y = m.createResource( nsA + "y" );
 Resource z = m.createResource( nsA + "z" );
 m.add( root, P, x ).add( root, P, y ).add( y, Q, z );
 System.out.println( "# -- no special prefixes defined" );
 m.write( System.out );
 System.out.println( "# -- nsA defined" );
 m.setNsPrefix( "nsA", nsA );
 m.write( System.out );
 System.out.println( "# -- nsA and cat defined" );
 m.setNsPrefix( "cat", nsB );
 m.write( System.out );
</pre>

A saída deste fragmento são três blocos de RDF/XML, com três diferentes mapeamentos de prefixos. Primeiro o padrão, sem prefixos diferentes dos padrões:


<pre>
# -- no special prefixes defined

&lt;rdf:RDF
    xmlns:j.0="http://nowhere/else#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:j.1="http://somewhere/else#" &gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#root"&gt;
    &lt;j.1:P rdf:resource="http://somewhere/else#x"/&gt;
    &lt;j.1:P rdf:resource="http://somewhere/else#y"/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#y"&gt;
    &lt;j.0:Q rdf:resource="http://somewhere/else#z"/&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;
</pre>


Nós vimos que o namespace rdf é declarado automaticamente, já que são requeridos para tags como <code>&lt;RDF:rdf&gt;</code> e <code>&lt;rdf:resource&gt;</code>. Declarações de namespace são também necessárias para o uso das duas propriedades P e Q, mas já que seus namespaces não foram introduzidos no modelo, eles recebem nomes namespaces inventados <code>j.0</code> e <code>j.1</code>.

<p>O método <code>setNsPrefix(String prefix, String URI)</code>
declara que o namespace da <code>URI</code> deve ser abreviado por <code>prefixos</code>. Jena requer que o <code>prefixo</code> seja um namespace XML correto, e que o <code>URI</code> termine com um caractere sem-nome. O escritor RDF/XML transformará essas declarações de prefixos em declarações de namespaces XML e as usará nas suas saídas:



<pre>
# -- nsA defined

&lt;rdf:RDF
    xmlns:j.0="http://nowhere/else#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:nsA="http://somewhere/else#" &gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#root"&gt;
    &lt;nsA:P rdf:resource="http://somewhere/else#x"/&gt;
    &lt;nsA:P rdf:resource="http://somewhere/else#y"/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#y"&gt;
    &lt;j.0:Q rdf:resource="http://somewhere/else#z"/&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;
</pre>


O outro namespace ainda recebe o nome criado automaticamente, mas o nome nsA é agora usado nas tags de propriedades. Não há necessidade de que o nome do prefixo tenha alguma relação com as variáveis do código Jena:


<pre>
# -- nsA and cat defined

&lt;rdf:RDF
    xmlns:cat="http://nowhere/else#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:nsA="http://somewhere/else#" &gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#root"&gt;
    &lt;nsA:P rdf:resource="http://somewhere/else#x"/&gt;
    &lt;nsA:P rdf:resource="http://somewhere/else#y"/&gt;
  &lt;/rdf:Description&gt;
  &lt;rdf:Description rdf:about="http://somewhere/else#y"&gt;
    &lt;cat:Q rdf:resource="http://somewhere/else#z"/&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;
</pre>


Ambos os prefixos são usados na saída, e não houve a necessidade de prefixos gerados automaticamente.

<h3>Definições implícitas de prefixos</h3>

Assim como as declarações de prefixos definidas por chamadas a <code>setNsPrefix</code>, Jena vai lembrar-se dos prefixos que foram usados na entrada para <code>model.read()</code>.

<p>Pegue a saída produzida pelo fragmento anterior e cole-o dentro de algum arquivo, com a URL  <b>file:/tmp/fragment.rdf</b> say. E execute o código:


<pre>
Model m2 = ModelFactory.createDefaultModel();
m2.read( "file:/tmp/fragment.rdf" );
m2.write( System.out );
</pre>


Você verá que os prefixos da entrada são preservados na saída. Todos os prefixos são escritos, mesmo se eles não forem usados em lugar algum. Você pode remover um prefixo com <code>removeNsPrefix(String prefix)</code> se você não o quiser na saída.

<p>Como N-Triplas não possuem nenhuma forma reduzida de escrever URIs, não há prefixos nem na entrada nem na saída. A notação <b>N3</b>, também suportada pelo Jena, possui nomes prefixados reduzidos, e grava-os na entrada e usa-os na saída.

<p>Jena possui outras operações sobre mapeamento de prefixos de um modelo, como um<code>Map</code> de Java extraído a partir dos mapeamentos existentes, ou a adição de um grupo inteiro de mapeamentos de uma só vez; olhe a documentação de <code>PrefixMapping</code> para mais detalhes.


<h2 id="ch-Jena-RDF-Packages">Pacotes Jena RDF</h2>

<p>Jena é uma API JAVA para aplicações de web semântica. O pacote RDF chave para o desenvolvedor é
<code>org.apache.jena.rdf.model</code>. A API  tem sido definida em termos de interfaces, logo o código da aplicação pode trabalhar com diferentes implementações sem causar mudanças. Esse pacote contém interfaces para representar modelos, recursos, propriedades, literais, sentenças e todos os outros conceitos chaves de RDF, e um ModelFactory para criação de modelos. Portanto, o código da aplicação permanece independente da implementação, o melhor é usar interfaces onde for possível e não implementações específicas de classes.</p>

<p>O pacote <code>org.apache.jena.tutorial</code> contém o código fonte funcional de todos os exemplos usados neste tutorial.</p>

<p>Os pacotes <code>org.apache.jena...impl</code> contêm a implementação de classes que podem ser comuns a várias implementações. Por exemplo, eles definem as classes <code>ResourceImpl</code>,
<code>PropertyImpl</code>, e <code>LiteralImpl</code> que podem ser usadas diretamente ou então herdadas por diferentes implementações. As aplicações devem raramente usar essas classes diretamente. Por exemplo, em vez de criar um nova instância de  <code>ResourceImpl</code>, é melhor usar o método <code>createResource</code> do modelo que estiver sendo usado. Desta forma, se a implementação do modelo usar uma implementação otimizada de <code>Resource</code>, então não serão necessárias conversões entre os dois tipos.</p>


<h2 id="ch-Navigating-a-Model">Navegação em Modelos</h2>

<p>Até agora, este tutorial mostrou como criar, ler e escrever modelos RDF. Chegou o momento de mostrar como acessar as informações mantidas num modelo.</p>

<p> Dada a URI de um recurso, o objeto do recurso pode ser recuperado de um modelo usando o método <code>Model.getResource(String uri)</code>. Este método é definido para retornar um objeto Resource se ele existir no modelo, ou, caso contrário, criar um novo. Por exemplo, para recuperar o recurso Adam Smith do modelo lido a partir do arquivo no tutorial 5:</p>


<pre>// retrieve the John Smith vcard resource from the model
Resource vcard = model.getResource(johnSmithURI);
</pre>


<p>A interface Resource define numerosos métodos para acessar as propriedades de um recurso. O método <code>Resource.getProperty(Property p)</code> acessa uma propriedade do recurso. Este método não segue a convenção usual de Java de acesso já que o tipo do objeto retorna é  <code>Statement,</code> e não <code>Property</code> como era de se esperar. Retornando toda a sentença permite à aplicação acessar o valor da propriedade usando um de seus métodos de acesso que retornam o objeto da sentença. Por exemplo, para recuperar o recurso que é o valor da propriedade <code>vcard:N</code></p>


<pre>// retrieve the value of the N property
Resource name = (Resource) vcard.getProperty(VCARD.N)
                                .getObject();
</pre>


<p>De modo geral, o objeto de uma sentença pode ser um recurso ou uma literal, então a aplicação, sabendo que o valor precisar ser um recurso, faz o cast do objeto retornado. Uma das coisas que Jena tenta fazer é fornecer tipos específicos de métodos, então a aplicação não tem que fazer cast, e checagem de tipos pode ser feita em tempo de compilação. O fragmento de código acima poderia ser mais convenientemente escrito assim:</p>


<pre>// retrieve the value of the FN property
Resource name = vcard.getProperty(VCARD.N)
                     .getResource();</pre>


<p>Similarmente, o valor literal de uma propriedade pode ser recuperado:</p>


<pre>// retrieve the given name property
String fullName = vcard.getProperty(VCARD.FN)
                        .getString();</pre>


<p>Neste exemplo, o recurso vcard possui somente as propriedades <code>vcard:FN</code> e <code>vcard:N</code>. RDF permite a um recurso repetir uma propriedade; por exemplo, Adam pode ter mais de um apelido. Vamos dar dois apelidos a ele:</p>


<pre>// add two nickname properties to vcard
vcard.addProperty(VCARD.NICKNAME, "Smithy")
     .addProperty(VCARD.NICKNAME, "Adman");</pre>


<p>Como notado anteriormente, Jena representa um modelo RDF como um conjunto de sentenças, então, adicionar uma sentença com um sujeito, predicado e objeto igual a um já existente não terá efeito. Jena não define qual do dois apelidos será retornado. O resultado da chamada a <code>vcard.getProperty(VCARD.NICKNAME)</code> é indeterminado. Jena vai retornar um dos valores, mas não há garantia nem mesmo de que duas chamadas consecutivas irá retornar o mesmo valor.</p>

<p>Se for possível que uma propriedade ocorra mais de uma vez, então o método  Resource.listProperties(Property p) pode ser usado para retornar um iterador para lista-las. Este método retorna um iterador que retorna objetos do tipo <code>Statement</code>. Nós podemos listar os apelidos assim:</p>


<pre>// set up the output
System.out.println("The nicknames of \""
                      + fullName + "\" are:");
// list the nicknames
StmtIterator iter = vcard.listProperties(VCARD.NICKNAME);
while (iter.hasNext()) {
    System.out.println("    " + iter.nextStatement()
                                    .getObject()
                                    .toString());
}
</pre>


<p>Esse código pode ser encontrado em  <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial06.java"> tutorial 6</a>. O iterador <code>iter</code> reproduz todas as sentenças com sujeito <code>vcard</code> e predicado <code>VCARD.NICKNAME</code>, então, iterar sobre ele permite recuperar cada sentença usando
<code>nextStatement()</code>, pegar o campo do objeto, e convertê-lo para string. O código produz a seguinte saída quando executado:</p>


<pre>The nicknames of "John Smith" are:
   Smithy
   Adman
</pre>


<p>Todas as propriedades de um recurso podem ser listadas usando o método 
<code>listProperties()</code> sem argumentos.
</p>


<h2 id="ch-Querying-a-Model">Consultas em Modelos</h2>

<p>A sessão anterior mostrou como navegar um modelo a partir de um recurso com uma URI conhecida. Essa sessão mostrará como fazer buscas em um modelo. O núcleo da API Jena suporta um limitada primitiva de consulta. As consultas mais poderosas de SPARQL são descritas em outros lugares.</p>

<p>O método  <code>Model.listStatements()</code>, que lista todos as sentenças de um modelo, é talvez a forma mais crua de se consultar um modelo. Este uso não é recomendado em modelos muito grandes.
<code>Model.listSubjects()</code> é similar, mas retorna um iterador sobre todos os recursos que possuem propriedades, <i>ie</i> são sujeitos de alguma sentença.</p>

<p><code>Model.listSubjectsWithProperty(Property p, RDFNode
o)</code><code></code> retornará um iterador sobre todos os  recursos com propriedade <code>p</code> de valor <code>o</code>. Se nós assumirmos que somente recursos vcard terão a propriedade <code>vcard:FN</code> e que, em nossos dados, todos esses recursos têm essa propriedade, então podemos encontrar todos os vCards assim:</p>


  <pre>// list vcards
ResIterator iter = model.listSubjectsWithProperty(VCARD.FN);
while (iter.hasNext()) {
    Resource r = iter.nextResource();
    ...
}</pre>


<p>Todos esses métodos de consulta são açúcar sintático sobre o método primitivo de consulta <code>model.listStatements(Selector s)</code>. Esse método retorna um iterador sobre todas as sentenças no modelo 'selecionado' por <code>s</code>. A interface de selector foi feita para ser extensível, mas por hora, só há uma implementação dela, a classe  <code>SimpleSelector</code> do pacote <code>org.apache.jena.rdf.model</code>. Usar <code>SimpleSelector </code> é uma das raras ocasiões em Jena onde é necessário usar uma classe especifica em vez de uma interface. O construtor de <code>SimpleSelector</code> recebe três argumentos:</p>


<pre>Selector selector = new SimpleSelector(subject, predicate, object)</pre>


<p>Esse selector vai selecionar todas as sentenças em que o sujeito casa com
<code>subject</code>, um predicado que casa com <code>predicate</code> e um objeto que casa com <code>object</code>. Se <code>null</code> é passado para algum dos argumentos, ele vai casar com qualquer coisa, caso contrário, ele vai casar com os recursos ou literais correspondentes. (Dois recursos são iguais se eles possuem o mesmo URI ou são o mesmo blank node; dois literais são iguais se todos os seus componentes forem iguais.) Assim:</p>


  <pre>Selector selector = new SimpleSelector(null, null, null);</pre>


<p>vai selecionar todas as sentenças do modelo.</p>


  <pre>Selector selector = new SimpleSelector(null, VCARD.FN, null);</pre>


<p>vai selecionar todas as sentenças com o predicado VCARD.FN, independente do sujeito ou objeto. Como um atalho especial,

<code>listStatements( S, P, O )
</code>

é equivalente a

<code>listStatements( new SimpleSelector( S, P, O ) )
</code>




<p>
O código a seguir, que pode ser encontrado em  <a
href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial07.java">tutorial 7</a> que lista os nomes completos de todos os vcards do banco de dados.</p>


<pre>// select all the resources with a VCARD.FN property
ResIterator iter = model.listSubjectsWithProperty(VCARD.FN);
if (iter.hasNext()) {
    System.out.println("The database contains vcards for:");
    while (iter.hasNext()) {
        System.out.println("  " + iter.nextResource()
                                      .getProperty(VCARD.FN)
                                      .getString());
    }
} else {
    System.out.println("No vcards were found in the database");
}
</pre>


<p>Isso deve produzir uma saída similar a:</p>


<pre>The database contains vcards for:
  Sarah Jones
  John Smith
  Matt Jones
  Becky Smith
</pre>


<p>Seu próximo exercício é modificar o código para usar <code>SimpleSelector
</code>em vez de <code>listSubjectsWithProperty</code>.</p>

<p>Vamos ver como implementar um controle mais refinado sobre as sentenças selecionadas.
<code>SimpleSelector</code> pode ser herdado ter seus selects modificado para mais filtragens:</p>


  <pre>// select all the resources with a VCARD.FN property
// whose value ends with "Smith"
StmtIterator iter = model.listStatements(
    new SimpleSelector(null, VCARD.FN, (RDFNode) null) {
        public boolean selects(Statement s)
            {return s.getString().endsWith("Smith");}
    });</pre>


<p>Esse código usa uma técnica elegante de Java para sobrescrever a definição de um método quando criamos uma instância da classe. Aqui, o método <code>selects(...)</code> garante que o nome completo termine com “Smith”. É importante notar que a filtragem baseada nos argumentos sujeito, predicado e objeto tem lugar antes que o método <code>selects(...)</code> seja chamado, então esse teste extra só será aplicado para casar sentenças.</p>

<p>O código completo pode ser encontrado no <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial08.java">tutorial
8</a> e produz uma saída igual a:</p>


  <pre>The database contains vcards for:
  John Smith
  Becky Smith</pre>

<p></p>

<p>Você pode imaginar que:</p>


<pre>// do all filtering in the selects method
StmtIterator iter = model.listStatements(
  new
      SimpleSelector(null, null, (RDFNode) null) {
          public boolean selects(Statement s) {
              return (subject == null   || s.getSubject().equals(subject))
                  &amp;&amp; (predicate == null || s.getPredicate().equals(predicate))
                  &amp;&amp; (object == null    || s.getObject().equals(object))
          }
     }
 });
</pre>


<p>é equivalente a:</p>


  <pre>StmtIterator iter =
  model.listStatements(new SimpleSelector(subject, predicate, object)</pre>


<p>Embora possam ser funcionalmente equivalentes, a primeira forma vai listar todas as sentenças do modelo e testar cada uma individualmente, a segunda forma permite índices mantidos pela implementação para melhor a perfomance. Tente isso em modelos grandes e veja você mesmo, mas prepare uma chícara de café antes.</p>

<h2 id="ch-Operations-on-Models">Operações em Modelos</h2>

<p>Jena provê três operações para manipular modelos. Elas são operações comuns de conjunto: união, intersecção e diferença.</p>

<p>A união de dois modelos é a união do conjunto de sentenças que representa cada modelo. Esta é uma das operações chaves que RDF suporta. Isso permite que fontes de dados discrepantes sejam juntadas. Considere o seguintes modelos:</p>

<p style="text-align: center">
<img alt="figure 4" src="figures/fig4.png" width="240" height="240">and
<img alt="figure 5" src="figures/fig5.png" width="240" height="240"></p>

<p>Quando eles são juntados, os dois nós http://...JohnSmith são unidos em um, e o arco <code>vcard:FN</code> duplicado é descartado para produzir:</p>

<p style="text-align: center">
<img alt="figure 6" src="figures/fig6.png" width="540" height="240"></p>

<p>Vamos ver o código (o código completo está em  <a
href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial09.java">tutorial 9</a>) e ver o que acontece.</p>


<pre>// read the RDF/XML files
model1.read(new InputStreamReader(in1), "");
model2.read(new InputStreamReader(in2), "");

// merge the Models
Model model = model1.union(model2);

// print the Model as RDF/XML
model.write(system.out, "RDF/XML-ABBREV");</pre>


<p>A saída produzida pelo PrettyWriter se assemelha a:</p>


<pre>&lt;rdf:RDF
    xmlns:rdf=&quot;<a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#">http://www.w3.org/1999/02/22-rdf-syntax-ns#</a>&quot;
    xmlns:vcard=&quot;http://www.w3.org/2001/vcard-rdf/3.0#&quot;&gt;
  &lt;rdf:Description rdf:about=&quot;http://somewhere/JohnSmith/&quot;&gt;
    &lt;vcard:EMAIL&gt;
      &lt;vcard:internet&gt;
        &lt;rdf:value&gt;John@somewhere.com&lt;/rdf:value&gt;
      &lt;/vcard:internet&gt;
    &lt;/vcard:EMAIL&gt;
    &lt;vcard:N rdf:parseType=&quot;Resource&quot;&gt;
      &lt;vcard:Given&gt;John&lt;/vcard:Given&gt;
      &lt;vcard:Family&gt;Smith&lt;/vcard:Family&gt;
    &lt;/vcard:N&gt;
    &lt;vcard:FN&gt;John Smith&lt;/vcard:FN&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;
</pre>


<p>Mesmo que você não seja familiarizado com  os detalhes da sintaxe RDF/XML, deve ser relativamente claro que os modelos foram unidos como esperado A interseção e a diferença de modelos podem ser computados de maneira semelhante, usando os métodos <code>.intersection(Model)</code> e
<code>.difference(Model)</code>; veja a documentação de
<a href="/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#difference(org.apache.jena.rdf.model.Model)">difference</a>
e
<a href "/documentation/javadoc/jena/org/apache/jena/rdf/model/Model.html#intersection(org.apache.jena.rdf.model.Model)">intersection</a>
para mais detalhes.
</p>

<h2 id="ch-Containers">Containers</h2>

<p>RDF defina um tipo especial de recursos para representar coleções de coisas. Esses recursos são chamados de <i>containers</i>. Os membros de um container podem ser tanto literais quanto recursos. Há três tipos de containers:</p>
<ul>
  <li>um BAG é uma coleção desordenada</li>
  <li>uma ALT é uma coleção desordenada para representar alternativas</li>
  <li>uma SEQ é uma coleção ordenada</li>
</ul>

<p>Um container é representado por um recurso. Esse recurso terá uma propriedade rdf:type cujo valor deve ser rdf:Bag, rdf:Alt, rdf:Seq, ou uma subclasse deles, dependendo do tipo do container. O primeiro membro do container é o valor da propriedade rdf:_1 do container; o segundo membro é o valor da propriedade rdf:_2 e assim por diante. As propriedades rdf:_nnn são conhecidas como <i>propriedades ordinais</i>.</p>

<p>Por exemplo,  o modelo para uma bag simples contendo os vcards dos Smith pode se assemelhar a:</p>

<p align="center">
<img border="0" src="figures/fig3.png" alt="figure 3" width="720" height="420"></p>

<p align="left">Embora os membros do bag serem representados pelas propriedades rdf:_1, rdf:_2 etc. a ordem das propriedades é insignificante. Nós poderíamos trocar os valores das propriedades rdf_1 e rdf_2 o resultado do modelo representaria a mesma informação.</p>

<p align="left">ALTs representam alternativas. Por exemplo, vamos supor um recurso representando um software. Ele poderia ter uma propriedade indicando onde ele foi obtido. O valor dessa propriedade pode ser uma coleção ALT contendo vários sites de onde ele poderia ser baixado. ALTs são desordenados a menos que a propriedade rdf:_1 tenha significado especial. Ela representa a escolha padrão.</p>

<p align="left">Embora os containers sejam manipulados como recursos e propriedades, Jena têm interfaces e implementações de classes explicitas para manipulá-los. Não é uma boa ideia ter um objeto manipulando um container e ao mesmo tempo modificando o estado do container usando métodos de mais baixo nível.</p>

<p align="left">Vamos modificar o tutorial 8 para criar essa bag:</p>


<pre>// create a bag
Bag smiths = model.createBag();

// select all the resources with a VCARD.FN property
// whose value ends with "Smith"
StmtIterator iter = model.listStatements(
    new SimpleSelector(null, VCARD.FN, (RDFNode) null) {
        public boolean selects(Statement s) {
                return s.getString().endsWith("Smith");
        }
    });
// add the Smith's to the bag
while (iter.hasNext()) {
    smiths.add(iter.nextStatement().getSubject());
}
</pre>

<p>Se nós imprimirmos esse modelo, vamos obter algo do tipo:</p>

  <pre>&lt;rdf:RDF
  xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  xmlns:vcard='http://www.w3.org/2001/vcard-rdf/3.0#'
 &gt;
...
  &lt;rdf:Description rdf:nodeID=&quot;A3&quot;&gt;
    &lt;rdf:type rdf:resource='http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag'/&gt;
    &lt;rdf:_1 rdf:resource='http://somewhere/JohnSmith/'/&gt;
    &lt;rdf:_2 rdf:resource='http://somewhere/RebeccaSmith/'/&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;</pre>


<p>que representa o recurso Bag.</p>

<p>A interface do container fornece um iterador para listar o conteúdo do container:</p>


<pre>// print out the members of the bag
NodeIterator iter2 = smiths.iterator();
if (iter2.hasNext()) {
    System.out.println("The bag contains:");
    while (iter2.hasNext()) {
        System.out.println("  " +
            ((Resource) iter2.next())
                            .getProperty(VCARD.FN)
                            .getString());
    }
} else {
    System.out.println("The bag is empty");
}
</pre>


<p>que produz a seguinte saída:</p>


<pre>The bag contains:
  John Smith
  Becky Smith</pre>


<p>O código executável pode ser encontrado em  <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial10.java">
tutorial 10</a>, que coloca esses fragmentos de código juntos num exemplo completo.</p>

<p>As classes de Jena oferecem métodos para manipular containers, incluindo adição de novos membros, inserção de novos membros no meio de um container e a remoção de membros existentes. As classes de container Jena atualmente garantem que a lista ordenada de propriedades usadas começam com rdf:_1 e é contíguo. O RDFCore WG relaxou essa regra, permitindo uma representação parcial dos containers. Isso, portanto, é uma área de Jena que pode ser mudada no futuro.</p>

<h2 id="ch-More-about-Literals-and-Datatypes">Mais sobre Literais e Datatypes</h2>

<p>Literais RDF não são apenas strings. Literais devem ter uma tag para indicar a linguagem da literal. O diálogo de uma literal em Inglês é considerado diferente de um diálogo de uma literal em Francês. Esse comportamento estranho é um artefato da sintaxe RDF/XML original.</p>

<p>Há na realidade dois tipos de Literais. Em uma delas, o componente string é somente isso, uma string ordinária. Na outra, o componente string é esperado que fosse um bem balanceado fragmento de XML.  Quando um modelo RDF é escrito como RDF/XML, uma construção especial usando um atributo parseType='Literal' é usado para representar isso.</p>

<p>Em Jena, esses atributos de uma literal podem ser setados quando a literal é construída, e.g. no <a href="https://github.com/apache/jena/tree/master/jena-core/src-examples/jena/examples/rdf/Tutorial11.java">tutorial 11</a>:</p>


<pre>// create the resource
Resource r = model.createResource();

// add the property
r.addProperty(RDFS.label, model.createLiteral("chat", "en"))
 .addProperty(RDFS.label, model.createLiteral("chat", "fr"))
 .addProperty(RDFS.label, model.createLiteral("&lt;em&gt;chat&lt;/em&gt;", true));

// write out the Model
model.write(system.out);</pre>


<p>produz</p>


<pre>&lt;rdf:RDF
  xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  xmlns:rdfs='http://www.w3.org/2000/01/rdf-schema#'
 &gt;
  &lt;rdf:Description rdf:nodeID=&quot;A0&quot;&gt;
    &lt;rdfs:label xml:lang='en'&gt;chat&lt;/rdfs:label&gt;
    &lt;rdfs:label xml:lang='fr'&gt;chat&lt;/rdfs:label&gt;
    &lt;rdfs:label rdf:parseType='Literal'&gt;&lt;em&gt;chat&lt;/em&gt;&lt;/rdfs:label&gt;
  &lt;/rdf:Description&gt;
&lt;/rdf:RDF&gt;</pre>


<p>Para que duas literais sejam consideradas iguais, elas devem ser ambas literais XML ou ambas literais simples. Em adição a isso, ambas não devem possuir tag de linguagem, ou se as tags de linguagem estiverem presentes, elas devem ser iguais. Para simples literais strings, elas devem ser iguais. Literais XML têm duas noções de igualdade. A noção simples é que as condições anteriores são verdade e as strings também são iguais. A outra noção é de que elas podem ser iguais se a canonização das strings forem iguais.</p>

<p>As interfaces de Jena também suportam literais tipadas. A maneira antiga (mostrada abaixo) trata literais tipadas como atalhos para strings: valores tipados são convertidos por Java em strings, e essas strings são armazenadas no modelo. Por exemplo, tente (observando que para literais simples, nós podemos omitir a chamada code>model.createLiteral</code>(...)):</p>


<pre>// create the resource
Resource r = model.createResource();

// add the property
r.addProperty(RDFS.label, "11")
 .addProperty(RDFS.label, 11);

// write out the Model
model.write(system.out, "N-TRIPLE");
</pre>


<p>A saída produzida é:</p>


  <pre>_:A... &lt;http://www.w3.org/2000/01/rdf-schema#label&gt; "11" .</pre>


<p>Já que ambas as literais são apenas a string “’11”, então somente uma sentença é adicionada</p>

<p>O RDFCore WG definiu mecanismos para suportar datatypes em RDF. Jena os suporta usando mecanismos de <i>literais tipadas</i>; isso não é discutido neste tutorial.</p>

<h2 id="ch-Glossary">Glossário</h2>

<dl>

<dt><a id="glos-blank node">Blank Node</a></dt>
<dd>representam recursos, mas não indica a URI para este recurso. Blank nodes atuam como variáveis qualificadas existencialmente em lógica de primeira ordem.</dd>

<dt><a id="glos-dublin core">Dublin Core</a></dt>
<dd>é um padrão para metadados sobre recursos web. Mais informações podem ser encontradas no site <a href="http://purl.oclc.org/dc/">Dublin Core
web site</a>.</dd>

<dt><a id="glos-Literal">Literal</a></dt>
<dd>é uma cadeia de caracteres que pode ser o valor de uma propriedade.</dd>

<dt><a id="glos-Object">Objeto</a></dt>
<dd>é a parte da tripla que é o valor de uma sentença.</dd>

<dt><a id="glos-Predicate">Predicado</a></dt>
<dd>é a propriedade da tripla.</dd>

<dt><a id="glos-Property">Propriedade</a></dt>
<dd>é um atributo do recurso. Por exemplo, DC.Title é uma propriedade, como também RDF.type.</dd>

<dt><a id="glos-Resource">Recurso</a></dt>
<dd>é alguma entidade. Ele pode ser um recurso web como uma página, ou pode ser uma coisa concreta como um carro ou árvore. Pode ser uma ideia abstrata como xadrez ou futebol. Recursos são nomeados por URIs.</dd>

<dt><a id="glos-Statement">Sentença</a></dt>
<dd>é um arco no modelo RDF, normalmente interpretado como um fato.</dd>

<dt><a id="glos-Subject">Sujeito</a></dt>
<dd>é o recurso que é a fonte do arco num modelo RDF.</dd>

<dt><a id="glos-Triple">Tripla</a></dt>
<dd>é a estrutura contendo o sujeito, o predicado e o objeto. Outro termo para sentença.</dd>

</dl>
