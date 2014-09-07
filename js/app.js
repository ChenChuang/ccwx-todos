
// boot up on page load

/*
var listSpaPage = {
	route: "",
  	classname: "listPage",
  	animate: "pushInLeft",
  	view: function() {
    	listPage.init();
  	}
};

var todoSpaPage = {
	//route: "/^(\d+)$/",
	route: "(:num)",
  	classname: "todoPage",
  	animate: "pushInLeft",
  	view: function() {
  		//console.log(viewData);
  		var $page = this;
    	$(document).trigger("spa:initview", [$page, {
    		init : function(pageData) {
    			listPage.init(pageData);
    		}
    	}]);
  	}
};

$(document).trigger("spa:route", [listSpaPage, todoSpaPage]);
*/

app  = {};

$(function () {

  window.onpopstate = function (e) {
		  if (!e.state) {
			    listPage.init();
	    } else if (e.state.index) {
			    todoPage.init(e.state.index);
		  } else if (e.state.trash) {
          trashPage.init();
      }
	};

  app.debug = (new RegExp("^debug")).test(window.location.hash.replace('#',''));
  var hash = app.debug ? '#debug' : '#lists';
  window.location.hash = hash;

  app.dataSource = (new AppDataSource()).load(app.debug);

  listPage.init();

	//todoPage.init(0);

  //trashPage.init();

});