/* Progressive enhancement JavaScript for Jena web site.
 * If JavaScript is available, we make the navigation links
 * look a bit more visually appealing and less overwhelming.
 */

var JenaNavigation = function() {
  var currentPage = {};
  var currentSection = {};
  var currentTopicListElem = null;

  var init = function(){
    getLocation();
    setTopLevelNavigation();
    setSideNavigationVisibility();
    moveToC( currentTopicListElem );
  };

  /**
   * Attache class 'selected' to the given menu element
   * @param {Object} el
   */
  var setSelectedMenu = function( el ) {
      $(el).addClass( "selected" );
  };

  /**
   * Set the top-level (horizontal) menu to show the current section
   * selection
   */
  var setTopLevelNavigation = function() {
    findTopMenu( currentSection.fileName, setSelectedMenu );
  };

  /**
   * Identify which top-level menu element matches the current file name,
   * and apply the given function to it.
   * @param {Object} fileName
   * @param {Object} fn
   */
  var findTopMenu = function( fileName, fn ) {
    var expr = (fileName == 'about_jena') ? "#home_menu" : "#topmenu a[href*='" + fileName + "']";
    $(expr).first().each( function( n ) {
        fn( this );
    } );
  };

  /**
   * Identify current page and section.
   */
  var getLocation = function() {
    var url = document.URL;
    var matches = url.match( /^.*jena.*apache\.org\/([^\/]*)\/(.*)$/ );

    if (matches) {
        currentSection.fileName = matches[1];
        currentPage.fileName = matches[2];
    }
    else {
        currentSection.fileName = "about_jena";
        currentPage.fileName = "index.html";
    }

    currentSection.title = asTitle( currentSection.fileName );
    currentPage.title = asTitle( currentPage.fileName.replace( /.html$/, '' ) );
  };

  /**
   * Hide the irrelevant parts of the side menu. We keep the
   * quick links section and the ASF section, and the section
   * containing the current page. Also styles the menu to
   * highlight the current page, and adds to the navigation
   * menu the ToC from the main page.
   */
  var setSideNavigationVisibility = function() {
    $("#navigation>h1").hide();
    $("#navigation>ul").hide();
    showMenu( "#quick-links" );
    showMenu( "#asf-links" );

    var currentTopicMenu = "#" + currentSection.fileName.replace( /\_/g, "-" );
    showMenu( currentTopicMenu );

    // make the current topic link styled as 'current'
    currentTopicListElem = $( currentTopicMenu ).next()
                                                .find( "a[href$='" + currentPage.fileName + "']" )
                                                .first()
                                                .parent();
    currentTopicListElem.toggleClass( "selected" );
  };

  /**
   * Show a menu with the given element ID, which we take to
   * that element and its next sibling
   * @param {Object} id
   */
  var showMenu = function( id ) {
    $(id).show();
    $(id).next().show();
  };

  /**
   * Return the given name as a title (space separators,
   * leading capital letter)
   * @param {Object} f
   */
  var asTitle = function( f ) {
      f = f.replace( /\_/g, " " );
      return f.slice( 0, 1 ).toUpperCase() + f.slice( 1 );
  };

  /**
   * Move the table of contents to be the child of the given node
   */
  var moveToC = function( newParent ) {
      $( "#table_of_contents" ).next().appendTo( newParent );
      $( "#table_of_contents" ).hide();
  };

  // Return the public variables/functions for this module
  return {
    init : init
  };

}();

// Initialize on load
$(function(){  JenaNavigation.init(); });


