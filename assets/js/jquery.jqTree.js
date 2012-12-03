(function($){
	var JQTT = {};
	
	/**
	 * Determinates which method should be called from public methods.
	 */
	$.fn.jqTagTree = function(method) {
		if ( typeof method === 'object' || ! method ) {
			//if called run with some arguments 
			return JQTT.publicMethods.run.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}    
		return false;
	};
	
	
	/**
	 *Shows and hides context menu.
	 *
	 */
	JQTT.contextMenu = {
		
		/*
		 * Creates menu and passes arguments to function chooseAction(id, action, name uri)
		 * 
		 * @param id - id of clicked element
		 * @param uri - uri of clicked element
		 * @param tagName - tag name of clicked element
		 */
		createMenu: function (id, uri, tagName) {
			var items = [ 
			{
				label:'Go to URL',
				icon:'icon-hand-right', 
				action:'go'
			}, 

			{
				label:'Edit tag',
				icon:'icon-pencil', 
				action:'edit'
			}, 
			null,// divider 
			{
				label:'Add tag', 
				icon:'icon-plus', 
				action:'add'
			}, 
			null, // divider 
			{
				label:'Delete tag', 
				icon:'icon-trash', 
				action: 'del'
			} 
			] ;
				
			var menu = $('<ul class=contextMenuPlugin><div class=gutterLine></div></ul>')
			.appendTo(document.body);

			items.forEach(function(item) {
				if (item) {
					var row = $('<li><a href="#"><i></i><span></span></a></li>').appendTo(menu);
					row.find('i').addClass(item.icon);
					row.find('span').text(item.label);
					if (item.action != 'go') {
						row.find('a').attr('href', '#jqttModal').attr('data-toggle','modal');
						row.find('a').click(function() {
							JQTT.contextMenu.chooseAction(id,item.action, tagName, uri);
						});
					}else{
						row.find('a').attr('href', uri);
					}
				} else {
					$('<li class=divider></li>').appendTo(menu);
				}
			});
			return menu;
		},

		// On contextmenu event (right click)
		start: function(){
			$('.showUls').bind('contextmenu', function(e) {
				// Create and show menu
				var menu = JQTT.contextMenu.createMenu(e.target.getAttribute('data-jqtt-id'), e.target.href, e.target.text)
				.show()
				.css({
					zIndex:1000001, 
					left:e.pageX + 5 /* nudge to the right, so the pointer is covering the title */, 
					top:e.pageY + 11
				})
				.bind('contextmenu', function() {
					return false;
				});

				// Cover rest of page with invisible div that when clicked will cancel the popup.
				var bg = $('<div></div>')
				.css({
					left:0, 
					top:0, 
					width:'100%', 
					height:'100%', 
					position:'absolute', 
					zIndex:1000000
				})
				.appendTo(document.body)
				.bind('contextmenu click', function() {
					// If click or right click anywhere else on page: remove clean up.
					bg.remove();
					menu.remove();
					return false;
				});

				// When clicking on a link in menu: clean up (in addition to handlers on link already)
				menu.find('a').click(function() {
					bg.remove();
					menu.remove();
				});

				// Cancel event, so real browser popup doesn't appear.
				return false;
			})

		},
		/**
		 * Recognizing of actions and calling relevant methods.
		 * 
		 * @param id - id of clicked element
		 * @param action - action to be executed
		 * @param uri - uri of clicked element
		 * @param tagName - tag name of clicked element
		 */
		chooseAction: function (id, action, tagName, uri){
			
			switch(action){
				case 'edit':
					JQTT.contextMenu.action.edit.define(id, tagName, uri);
					break;
				case 'add':
					JQTT.contextMenu.action.add(id);
					break;
				case 'del':
					JQTT.contextMenu.action.del(id, tagName, uri);
					break;
			}
			
		}
            
    
		
	};
	
	/*
	 *Actions executed on click.
	 */
	JQTT.contextMenu.action = {
		/**			
		* Edit tag
		*/
		edit : {
			/**
			* Sets modal window for edit
			* 
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			* @param uri - uri of editing element
			*/
			define: function(id, tagName, uri){
				
				$('#jqttModal #modalLabel').text("Edit tag ");
				$('#jqttModal .modal-body').html(" \n\
				<input type='hidden' class='id' value='"+id+"'>\n\
				<label>Name:</label><input type=text class='name' value='"+ tagName + "'> \n\
				<label>URI:</label><textarea class='uri'>"+ uri +"</textarea> \n\
			");
				$('#jqttModalSave').removeClass('btn-danger').addClass('btn-success').text('Confirm');
				$('#jqttModalSave').on('click',function(){
					JQTT.contextMenu.action.edit.execute(id, tagName, uri);
				
				});
				$('#jqttModal').keypress(function(e){
					if(e.which == 13){
						JQTT.contextMenu.action.edit.execute(id, tagName, uri);
					}
				});
			},
			
			/**
			*Secures unchanged form and sends data via ajax
			*
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			* @param uri - uri of editing element
			*/
			execute : function(id, tagName, uri){
				//show loading gif
				$('#jqttModal .modal-footer img').toggleClass('visible hidden');
				var newName = $('#jqttModal .modal-body .name').val();
				var newUri = $('#jqttModal .modal-body .uri').val();
				var changeData;
				
				//if change unbind submiting and make array
				if(tagName != newName || uri != newUri){
					$('#jqttModal').unbind('keypress');
					$('#jqttModalSave').unbind('click');
					changeData = new Array(id, tagName, newName, uri, newUri);
				}else{
					//hide loading gif, show errors
					$('#jqttModal .modal-footer img').toggleClass('visible hidden');
					$('#jqttModal #modalLabel').html("Edit tag - <span class=\"text-error headlineNotify\"> Nothing changed!</span>");

					//$('#jqttModal .modal-head .name').before('<span class="text-error"> Nezměněno!</span>');
					//$('#jqttModal .modal-body .uri').before('<span class="text-error"> Nezměněno!</span>');
					return;
				}
			
				$.ajax({
					url: JQTT.globVar.ajaxEditNodePhpPath,
					data: {
						data : changeData
					},
					dataType : 'JSON',
					success : function(){ 
						JQTT.contextMenu.action.edit.redraw(id, newName, newUri);
						$('#jqttModal').modal('hide');
						$('#jqttModal .modal-footer img').toggleClass('visible hidden');
					},
					error:function(data){
						$('#jqttModal .modal-footer img').toggleClass('visible hidden');
						console.log("ERROR updating from context menu!");
						console.log(data.responseText);
					}
				});
			
				$('#jqttModal').modal('hide');
			},
			
			/**
			* After changing data in database change it in browser and make it visible 
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			* @param uri - uri of editing element
			*/
			redraw : function(id, name, uri){
				$('a[data-jqtt-id = '+id+']').attr('href', uri).text(name);
				$('a[data-jqtt-id = '+id+']').effect("highlight", {
					color: JQTT.globVar.highlightColor
				}, 3000);
			}
		},
		/*
		 *
		 */
		add : function(id){
			$('#jqttModal #modalLabel').text("Add tag ");
			$('#jqttModal .modal-body').html(" \n\
				<input type='hidden' class='id' value='"+id+"'>\n\
				<label>Name:</label><input type=text' class='name'> \n\
				<label>URI:</label><textarea class='uri'></textarea> \n\
			");
			$('#jqttModalSave').removeClass('btn-danger').addClass('btn-success').text('Add');
			$('#jqttModalSave').on('click',function(){
				JQTT.contextMenu.action.executeAdd();
				
			});
			$('#jqttModal').keypress(function(e){
				if(e.which == 13){
					JQTT.contextMenu.action.executeAdd();
				}
			});
		},
		executeAdd : function(){
			$('#jqttModal').unbind('keypress');
			$('#jqttModalSave').unbind('click');
			
			console.log("Add confirmed");
			$('#jqttModal').modal('hide');
		},
		del : function(id, tagName, uri){
			$('#jqttModal #modalLabel').text("Delete tag ");
			$('#jqttModal .modal-body').html(" <br>\n\
				<strong style='margin-right:5px'>Name:</strong> "+tagName+"<br>\n\
				<strong style='margin-right:20px'>URI:</strong> "+uri+"<br><br>\n\
			");
			$('#jqttModalSave').removeClass('btn-success').addClass('btn-danger').text('Delete');
			$('#jqttModalSave').on('click',function(){
				JQTT.contextMenu.action.executeDel();
				
			});
			$('#jqttModal').keypress(function(e){
				if(e.which == 13){
					JQTT.contextMenu.action.executeDel();
				}
			});
		},
		executeDel : function(){
			$('#jqttModal').unbind('keypress');
			$('#jqttModalSave').unbind('click');
			
			console.log("Del confirmed");
			$('#jqttModal').modal('hide');
		}
	};
	
	//Setting of jqTree changeable by user.
	JQTT.globVar = {};
	JQTT.globVar.ajaxLoadTreePhpPath = '/php/loadFromDb.php';
	JQTT.globVar.ajaxEditNodePhpPath = '/php/editNode.php';
	JQTT.globVar.ajaxAddNodePhpPath = '/php/addNode.php';
	JQTT.globVar.ajaxDelNodePhpPath = '/php/delNode.php';
	JQTT.globVar.iconOpen = 'icon-plus';
	JQTT.globVar.iconClose = 'icon-minus';
	JQTT.globVar.iconNotOpen = 'icon-ban-circle';
	JQTT.globVar.menuShown = false;
	JQTT.globVar.highlightColor= '#AEFA7F';
	
	/**
	 * Methods callable by user.
	 */
	JQTT.publicMethods = {

		/**
		 * Function providing running of change of settings posted by user and loading branches.
		 * @param options - settings posted by user
		 */
		run : function( options ) {

			//Saving changes posted by user.
			if(options)
				JQTT.renderTree.changeSetings(options);

			var rootUlTag;
			//Gets id or class where tree will be iserted.
			if(this.attr('id')== undefined) rootUlTag = '.' + this.attr('class');
			else rootUlTag = '#' + this.attr('id');

			JQTT.insertHtml.ulStructure(rootUlTag);
			JQTT.insertHtml.modalStructure();
			
			JQTT.contextMenu.start();
			//Load first level of tree.
			JQTT.renderTree.loadLeaf(0, rootUlTag);

			//After click calls method providing showing, hiding and loading branches.
			$(".liId").on("click",{
				"this" : this, 
				"rootUlTag" : rootUlTag
			}, JQTT.renderTree.showBranch);
		}
	};

	JQTT.insertHtml={
		ulStructure: function(rootUlTag){
			var toBeAdded = "<li style='display: none' class='tagNameTemplate liId'>\n\
								<div style='position: relative'><a href='#' class='showUls name' ></a> \n\
								<img src='/assets/images/loading.gif' class='hidden'></div></li>";
			$(rootUlTag).append(toBeAdded);
		},
		modalStructure: function(){
			var toBeAdded = "<!-- Modal For editing tags-->\n\
							<div id='jqttModal' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>\n\
								<div class='modal-header'>\n\
									<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h3 id='modalLabel'></h3>\n\
								</div>\n\
								<div class='modal-body'></div>\n\
								<div class='modal-footer'>\n\
									<img src='/assets/images/loading.gif' class='hidden'>\n\
									<button class='btn' data-dismiss='modal' aria-hidden='true'>Cancel</button>\n\
									<button class='btn btn-success' id='jqttModalSave'>Save changes</button>\n\
								</div>\n\
							</div>";
			$(document.body).append(toBeAdded);
		}
	}

	/**
	 * Methods called internaly.
	 */
	JQTT.renderTree={

		changeSetings: function(options){
			if(options.ajaxLoadTreePhpPath)
				JQTT.globVar.ajaxLoadTreePhpPath = options.ajaxLoadTreePhpPath;
			if(options.iconOpen)
				JQTT.globVar.iconOpen = options.iconOpen;
			if(options.iconClose)
				JQTT.globVar.iconClose = options.iconClose;
			if(options.iconNotOpen)
				JQTT.globVar.iconNotOpen = options.iconNotOpen;
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
			if($(this).children('div').children('i').hasClass(JQTT.globVar.iconNotOpen)){
				window.location = $(this).children('div').children('a').attr('href');
				return false;
			}
			var children = $(this).children('ul').children('li');

			if(children.length==0){
				//show loading.gif
				$('#'+$(this).attr('id')).children('div').children('img').toggleClass('hidden visible');

				//load and show data
				JQTT.renderTree.loadLeaf($(this).attr('id'), param.data.rootUlTag);
			}else{ 
				//toggles branch - show/hide
				$('#'+$(this).attr("id")).children('div').children('i').toggleClass(JQTT.globVar.iconOpen + ' ' + JQTT.globVar.iconClose).parent().nextAll('ul').slideToggle();
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
				url: JQTT.globVar.ajaxLoadTreePhpPath,
				data: {
					id : rootId
				},
				dataType : 'JSON',
				success : function(data){ 
					JQTT.renderTree.addLoadedData(data, rootId, rootUlTag);
				},
				error: function(data){
					console.log("---------- Error loading tree ----------");
					console.log(data.responseText);
					console.log("----------------------------------------");
				}
			});
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
				if(data[i].name == null)continue;
				//clones template and removes template class
				newTag = $(rootUlTag +' .tagNameTemplate').clone(true, true).removeClass('tagNameTemplate');
				var cell;
				//change properties of new tag
				if(rootId==0) {
					// for first load of jqTree
					cell = JQTT.renderTree.changeTagNameTemplate(newTag, data[i]).prependTo(rootUlTag);
				}else{
					//just clicked li id
					cell = JQTT.renderTree.changeTagNameTemplate(newTag, data[i]).prependTo($('#'+rootId).children('ul'));
				} 

				if(data[i].child>0){
					//shows "could be opened" sign if could be opened
					cell.append('<ul></ul>').children('ul').addClass('treeBranch treeEmpty').css('display', 'none').prev().find('a:first').before('<i></i>').prev().addClass(JQTT.globVar.iconOpen).parent().parent().show();

				}else
					//shows "couldn't be opened" sign
					cell.find('a:first').before('<i></i>').prev().addClass(JQTT.globVar.iconNotOpen).parent().parent().show();
			}
			//shows just loaded data
			$('#'+rootId).children('div').children('i').toggleClass(JQTT.globVar.iconOpen + ' ' + JQTT.globVar.iconClose).parent().nextAll('ul').slideToggle();
			//hide loading.gif
			$('#'+rootId).children('div').children('img').toggleClass('hidden visible');
		},

		/**
		 * Change properties of cloned leaf.
		 * @param cell - cell to be changed
		 * @param prop - properties to by applied on cell
		 * @return changed cell 
		 */
		changeTagNameTemplate: function (cell, prop){
			//change of liId
			cell.attr('id', prop.id);
			//change of <a> id
			cell.children('div').children('a').attr('data-jqtt-id', prop.id);
			cell.children('div').children('a').attr('href', prop.uri);
			cell.find('.name').text(prop.name);
			cell.find('.show').attr('href', prop.uri);
			//add, edit, cut, delete
			return cell;
		}
	}


})(jQuery);