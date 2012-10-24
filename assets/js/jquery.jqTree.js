(function($){
	
	/**
	 * Determinates which method should be called from public methods.
	 */
	$.fn.jqTree = function(method) {
		if ( JQT.publicMethods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return JQT.publicMethods.run.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}    
	};
	
	var JQT = {};
	
	//Setting of jqTree changeable by user.
	JQT.globVar = {};
		JQT.globVar.ajaxPhpPath = '/php/loadFromDb.php';
		JQT.globVar.iconOpen = 'icon-plus';
		JQT.globVar.iconClose = 'icon-minus';
	
	/**
	 * Methods callable by user.
	 */
	JQT.publicMethods = {

		/**
		 * Function providing running of change of settings posted by user and loading branches.
		 * @param options - settings posted by user
		 */
	    run : function( options ) {
	    	
	    	//Saving changes posted by user.
	    	if(options)
	    		JQT.privateMethods.changeSetings(options);
	    	
	    	//Gets id or class where tree will be iserted.
	    	if(this.attr('id')== undefined) var rootUlTag = '.' + this.attr('class');
	    	else var rootUlTag = '#' + this.attr('id');
	    	
	    	//Load first level of tree.
	    	JQT.privateMethods.loadLeaf(0, rootUlTag);
	    	
	    	//After click calls method providing showing, hiding and loading branches.
	    	$(".liId").on("click",{"this" : this, "rootUlTag" : rootUlTag}, JQT.privateMethods.showBranch);
	    }
	  };


	/**
	 * Methods called internaly.
	 */
	JQT.privateMethods={

		changeSetings: function(options){
			if(options.ajaxPhpPath)
				JQT.globVar.ajaxPhpPath = options.ajaxPhpPath;
			if(options.iconOpen)
				JQT.globVar.iconOpen = options.iconOpen;
			if(options.iconClose)
				JQT.globVar.iconClose = options.iconClose;
		},
			
		/**
		 * Called after click. Shows hidden branches if they are loaded  otherwise loads them.
		 * @param param - parameters passed to function
		 * @return false - prevents closing parent branch
		 */
		showBranch: function(param){
			if($(this).children('ul').hasClass('treeEmpty')){
				$(this).children('ul').removeClass('treeEmpty');
			}
			var children = $(this).children('ul').children('li');
			
			if(children.length==0){
				JQT.privateMethods.loadLeaf($(this).attr('id'), param.data.rootUlTag);
			}else{ 
				//toggles branch - show/hide
				$('#'+$(this).attr("id")).children('div').children('i').toggleClass(JQT.globVar.iconOpen + ' ' + JQT.globVar.iconClose).parent().nextAll('ul').slideToggle();
			}
			return false;	
		},
	
		/**
		 * Method asynchronously load will be shown.
		 * @param rootId - clicked <li> - will be loaded
		 * @param rootUlTag - root tad <ul> where is imported whole jqTree
		 */
		loadLeaf: function (rootId, rootUlTag) {
			$.ajax({
				url: JQT.globVar.ajaxPhpPath,
				data: {id : rootId},
				dataType : 'JSON',
				success : function(data){ 
					JQT.privateMethods.addLoadedData(data, rootId, rootUlTag);
				}
			});
		},
		/**
		* Change properties of cloned leaf.
		* @param cell - cell to be changed
		* @param prop - properties to by applied on cell
		* @return changed cell 
		*/
		changeTagNameTemplate: function (cell, prop){
			if(prop.name == null)prop.name=prop.uri;
			cell.attr('id', prop.id);
			cell.find('.name').text(prop.name);
			cell.find('.show').attr('href', prop.uri);
			//add, edit, cut, delete
			return cell;
		},
		
		/**
		* Inserts and shows loaded data in document.
		* @param data - loaded data
		* @param rootId - id of <li> where should be data inserted
		* @param rootUlTag - tag where is whole jqTree included
		* 
		*/
		addLoadedData: function (data, rootId, rootUlTag){
			var newTag;
			for(var i=data.length-1; i>=0;i--){
				//clones template and removes template class
				newTag = $(rootUlTag +' .tagNameTemplate').clone(true, true).removeClass('tagNameTemplate');
				var cell;
				//change properties of new tag
				if(rootId==0) {
					// for first load of jqTree
					cell = JQT.privateMethods.changeTagNameTemplate(newTag, data[i]).prependTo(rootUlTag);
				}else{
					//just clicked li id
					cell = JQT.privateMethods.changeTagNameTemplate(newTag, data[i]).prependTo($('#'+rootId).children('ul'));
				} 
				
				if(data[i].child>0){
					//shows plus sign if could be open
					cell.append('<ul></ul>').children('ul').addClass('treeBranch treeEmpty').css('display', 'none').prev().find('a:first').before('<i></i>').prev().addClass(JQT.globVar.iconOpen).parent().parent().show();
	
				}else
					//just shows final record
					cell.show();
			}
			//shows just loaded data
			$('#'+rootId).children('div').children('i').toggleClass(JQT.globVar.iconOpen + ' ' + JQT.globVar.iconClose).parent().nextAll('ul').slideToggle();
		}
		
	}

	
})(jQuery);