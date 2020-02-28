---
title: Usando o Jena com o Eclipse
---

Este tutorial mostrar&aacute; como importar o projeto do Jena no Eclipse. A vers&atilde;o do Eclipse utilizada foi 4.7.0, e do Java foi 1.8.0_121. O sistema operacional n&atilde;o deve ser um problema, ent&atilde; os &utilde;nicos requisitos s&atilde;o Eclipse, Java 1.8.x, e git para baixar o c&oacute;digo-fonte do Jena.

## Configurando seu ambiente

O primeiro passo &eacute; instalar o Java JDK 1.8.x. As instru&ccedil;&otilde;es para a instala&ccedil;&atilde;o variam dependendo do sistema operacional, e n&atilde;o ser&atilde;o abordadas neste tutorial.

Ap&oacute;s a instala&ccedil;&atilde;o do Java, o pr&oacute;ximo passo &eacute; o Eclipse. Voc&ecirc; pode baixar uma vers&atilde;o do Eclipse, ou baixar o instalador e escolher entre as diferentes vers&otilde;es dispon&iacute;veis. As instru&ccedil;&otilde;es e screenshots a seguir foram feitos com a vers&atilde;o _&ldquo;Eclipse IDE for Java Developers&rdquo;_.

O Eclipse vem com uma vers&atilde;o do Apache Maven embutida, mas talvez voc&ecirc; prefira utilizar uma vers&atilde;o externa para que voc&ecirc; possa customizar as configura&ccedil;&otilde;es para o seu ambiente. Este passo n&atilde;o &eacute; necess&aacute;rio para este tutorial, e tamb&eacute;m n&atilde;o ser&aacute; discutido neste tutorial.

## Baixando o c&oacute;digo-fonte

Siga as instru&ccedil;&otilde;es da p&aacute;gina _[Getting involved in Apache Jena](/getting_involved/index.html)_ para baixar o c&oacute;digo-fonte do reposit&oacute;rio Git. Muitos desenvolvedores baixam o c&oacute;digo-fonte em um diret&oacute;rio dentro do _workspace_ do Eclipse. Mas voc&ecirc; pode importar o c&oacute;digo-fonte no Eclipse de qualquer diret&oacute;rio, como ser&aacute; demonstrado a seguir.

E n&atilde;o esque&ccedil;a de executar `mvn clean install`, para que o Eclipse possa encontrar todos as depend&ecirc;ncias necess&aacute;rias.

## Importando o c&oacute;digo-fonte no Eclipse

Por padr&atilde;o, o Eclipse prov&ecirc; uma integra&ccedil;&atilde;o com Maven. Antigamente voc&ecirc; teria que instalar um plug-in primeiro. Mas se voc&ecirc; tiver seguido as intru&ccedil;&otilde;es anteriores, voc&ecirc; deve estar pronto para importar o c&oacute;digo-fonte.

<img src="figures/using_jena_with_eclipse-001.png" class="img-responsive" alt="Eclipse workspace">

Na figura anterior, o _workspace_ do Eclipse est&aacute; n&atilde;o tem nenhum projeto ainda. A perspectiva foi configurada para mostrar _&ldquo;working sets&rdquo;_, e j&aacute; h&aacute; um _working set_ criado para o Jena. Este passo n&atilde;o &eacute; necess&aacute;rio para este tutorial, mas pode ser &uacute;til se voc&ecirc; tiver v&aacute;rios projetos no seu _workspace_ (por exemplo, se voc&ecirc; tiver importado Apache Commons RDF e Apache Jena no mesmo _workspace_).

Padr&atilde;o o Eclipse mant&eacute;m seus projetos no painel &agrave; esquerda. Clique com o bot&atilde;o direito do mouse sobre este painel e escolha _&ldquo;Import&rdquo;_. Se voc&ecirc; preferir, voc&ecirc; pode utilizar o menu superior e ir para _File_ / _Import_.

<img src="figures/using_jena_with_eclipse-002.png" class="img-responsive" alt="Import project context menu">

Voc&ecirc; dever&aacute; ver um di&aacute;logo, onde poder&aacute; escolher entre diferentes tipos de projetos para importar no seu _workspace_. Para o Jena, voc&ecirc; deve selecionar importar _Existing Maven Project_, que fica na categoria de projetos _Maven_.

<img src="figures/using_jena_with_eclipse-003.png" class="img-responsive" alt="Import existing Maven project">

Clicando em _Next_, voc&ecirc; ver&aacute; uma nova tela onde voc&ecirc; poder&aacute; escolher a localiza&ccedil;&atilde;o do c&oacute;digo-fonte do Jena. Escolha o diret&oacute;rio onde voc&ecirc; baixou o c&oacute;digo-fonte na se&ccedil;&atilde;o anterior deste tutorial.

<img src="figures/using_jena_with_eclipse-004.png" class="img-responsive" alt="Choosing source code location">

Agora clique em _Finish_ e o Eclipse dever&aacute; come&ccedil;ar a importar o projeto. Este passo pode levar v&aacute;rios minutos, dependendo dos recursos dispon&iacute;veis no seu sistema operacional e hardware. Voc&ecirc; pode acompanhar o progresso na aba _Progress_, no painel inferior.

Assim que o projeto tiver sido importado no seu _workspace_, voc&ecirc; dever&aacute; ver algo similar &agrave; tela seguinte.

<img src="figures/using_jena_with_eclipse-005.png" class="img-responsive" alt="Jena in Eclipse">

<!-- this can be removed when we fix shading guava -->

Quando o projeto tiver sido importado, o Eclipse dever&aacute; come&ccedil;ar a construir o projeto automaticamente se voc&ecirc; estiver com as configura&ccedil;&otilde;es padr&otilde;es, sen&atilde;o voc&ecirc; pode clicar em _Project_ / _ Build All_.

O Eclipse mostrar&aacute; um &iacute;cone vermelho nos projetos importados que tiverem problemas. Agora veremos como arrumar estes problemas.

<img src="figures/using_jena_with_eclipse-006.png" class="img-responsive" alt="Eclipse build problems">

Os problemas s&atilde;o geralmente relacionados a um [problema conhecido por como um dos projetos utiliza o Maven Shade Plugin nas classes do Google Guava](http://jena.markmail.org/thread/hdu22kg6qtgsfpn6#query:+page:1+mid:tl3tfxtmfa3hh734+state:results).

A solu&ccedil;&atilde;o &eacute; garantir que o projeto _jena-shaded-guava_ fique fechado no _workspace_ do Eclipse. Voc&ecirc; pode simplesmente clicar com o bot&atilde;o direito sobre o projeto, e escolher _Close_. O &iacute;cone do projeto dever&aacute; mudar, indicando que ele foi fechado com sucesso.

<img src="figures/using_jena_with_eclipse-007.png" class="img-responsive" alt="Close jena-shaded-maven module">

Feito isso, &eacute; uma boa ideia selecionar a op&ccedil;&atilde;o para limpar (_Clean_) todos os projetos abertos, para que o Eclipse ent&atilde;o comece a construir os projetos novamente.

<img src="figures/using_jena_with_eclipse-008.png" class="img-responsive" alt="Clean all Eclipse projects">

Voc&ecirc; tamb&eacute;m pode atualizar as configura&ccedil;&otilde;es dos projetos Maven, para que o Eclipse entenda que um projeto foi fechado e utilize a depend&ecirc;ncia do seu reposit&oacute;rio Maven local, ao inv&eacute;s do projeto importado no _workspace_.

<img src="figures/using_jena_with_eclipse-009.png" class="img-responsive" alt="Update Maven projects settings">

Se voc&ecirc; seguiu todos os passos at&eacute; aqui, e n&atilde;o h&aacute; nenhuma tarefa rodando em segundo-plano (verifique a aba _Progress_) ent&atilde;o o seu projeto deve estar sendo constru&iacute;do com sucesso.

<img src="figures/using_jena_with_eclipse-010.png" class="img-responsive" alt="Jena built in Eclipse">

Se voc&ecirc; quiser testar o Fuseki agora, por exemplo, abra o projeto _jena-fuseki-core_, navegue at&eacute; o pacote _org.apache.jena.fuseki.cmd_, e execute _FusekiCmd_ como _Java Application_.

<img src="figures/using_jena_with_eclipse-011.png" class="img-responsive" alt="Run Fuseki in Eclipse">

O Fuseki dever&aacute; iniciar, e estar&aacute; dispon&iacute;vel em [http://localhost:3030](http://localhost:3030).

<img src="figures/using_jena_with_eclipse-012.png" class="img-responsive" alt="Fuseki running in Eclipse">

Agora voc&ecirc; j&aacute; pode debugar o Jena, modificar o c&oacute;digo-fonte e construir o projeto novamente, ou importar ou criar outros projetos no seu _workspace_, e utiliz&aacute;-los com a &uacute;ltima vers&atilde;o do Jena.
