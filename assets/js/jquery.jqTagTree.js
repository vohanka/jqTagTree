//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /assets/js/jquery.jqTagTree.php                |
// +----------------------------------------------------------+
//
(function($){
	var JQTT = {};
	
	//Setting of jqTagTree global variables.
	JQTT.globVar = {};
	JQTT.globVar.rootUlTag;
	JQTT.globVar.highlightId = -1;
	JQTT.globVar.menuShown = false;
	
	//Setting of jqTagTree global constans.
	JQTT.globConst = {};
	JQTT.globConst.allowedNameLength = 100;
	JQTT.globConst.allowedUriLength = 200;
	
	//Setting of jqTagTree global variables changeable by user.
	JQTT.globUserVar = {};
	JQTT.globUserVar.ajaxLoadTreePhpPath = 'php/loadFromDb.php';
	JQTT.globUserVar.ajaxEditNodePhpPath = 'php/editNode.php';
	JQTT.globUserVar.ajaxAddNodePhpPath = 'php/addNode.php';
	JQTT.globUserVar.ajaxAddNodeLinkPhpPath = 'php/addLink.php';
	JQTT.globUserVar.ajaxDelNodePhpPath = 'php/delNode.php';
	JQTT.globUserVar.ajaxLoadPredicatesPhpPath = 'php/loadPredicates.php';
	JQTT.globUserVar.iconLoadingPath = 'assets/images/loading.gif';
	JQTT.globUserVar.iconOpen = 'icon-plus';
	JQTT.globUserVar.iconClose = 'icon-minus';
	JQTT.globUserVar.iconEmpty = 'icon-ban-circle';
	JQTT.globUserVar.highlightAddColor= '#AEFA7F';
	JQTT.globUserVar.highlightEditColor= '#AEFA7F';
	JQTT.globUserVar.highlightDuration = 4000;
	JQTT.globUserVar.slidingDuration = 1000;
	//Setting of jqTagTree global constants
	
	/**
	 * Determinates which method should be called from public methods.
	 * 
	 * @return corectly loaded tag tree
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
	 * Context menu namespace. Everithing around context menu is done here.
	 */
	JQTT.contextMenu = {
		
		/*
		 * Creates menu and passes arguments to function chooseAction(id, action, name uri).
		 * 
		 * @param id - id of clicked element
		 * @param uri - uri of clicked element
		 * @param tagName - tag name of clicked element
		 * 
		 * @return menu - menu which could be shown
		 */
		createMenu: function (id, uri, tagName) {
			var firstItems = [ 
			{
				label:'Go to URL',
				icon:'icon-hand-right', 
				action:'go'
			}, 

			{
				label:'Edit tag',
				icon:'icon-pencil', 
				action:'edit'
			}];
			var middleItem = [
			{
				label:'Predicates',
				icon:'icon-list', 
				action:'predicates'
			}];
			var lastItems = [
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
			];
			var items
			//If node don't have any predicate no option 'predicates' shown.
			if(JQTT.contextMenu.action.predicates.changePredicatesCount(id,'get') > 0 ){
				items = firstItems.concat( middleItem , lastItems);
			}else{
				items = firstItems.concat(lastItems);
			}
				
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

		/*
		 *  On contextmenu event (right click).
		 *  
		 *  @return false - prevets to showing browser context menu
		 */
		start: function(){
			$('.showUls').bind('contextmenu', function(e){JQTT.contextMenu.bindBody(e);return false;});
		},
		
		/* 
		 * Shows context menu.
		 * 
		 * @return false - prevets to showing browser context menu
		 */
		bindBody: function(e){
				
				// Create and show menu.
				var menu = JQTT.contextMenu.createMenu(e.target.getAttribute('data-jqtt-id'), e.target.href, e.target.text)
				.show()
				.css({
					zIndex:1000001, 
					// Nudge to the right, so the pointer is covering the title.
					left:e.pageX + 5, 
					top:e.pageY + 11
				})
				.bind('contextmenu');

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

				// When clicking on a link in menu: clean up (in addition to handlers on link already).
				menu.find('a').click(function() {
					bg.remove();
					menu.remove();
				});

				// Cancel event, so real browser popup doesn't appear.
				return false;
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
				case 'predicates':
					JQTT.contextMenu.action.predicates.define(id, tagName);
					break;
				case 'add':
					JQTT.contextMenu.action.add.define(id);
					break;
				case 'del':
					JQTT.contextMenu.action.del.define(id, tagName, uri);
					break;
			}
			
		}
            
    
		
	};
	
	/*
	 * Actions executed after click.
	 */
	JQTT.contextMenu.action = {
		
		/**			
		* Edit tag
		*/
		edit : {
			
			/**
			* Sets modal window for editing tag.
			* 
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			* @param uri - uri of editing element
			*/
			define: function(id, tagName, uri){
				
				$('#jqttModal #modalLabel').text("Edit tag ");
				$('#jqttModal .modal-body').html(" \n\
				<input type='hidden' class='id' value='"+id+"'>\n\
				<label>Name:</label><input type='text' class='name' value='"+ tagName + "'> \n\
				<label>URI:</label><textarea class='uri'>"+ uri +"</textarea> \n\
				");
				$('#jqttModalSave').removeClass('btn-danger').addClass('btn-success').text('Confirm');
				$('#jqttModalCancel').removeClass('hidden');

				$('#jqttModalSave').on('click',function(){
					JQTT.contextMenu.action.edit.execute(id, tagName, uri);
				
				});
				$('#jqttModal').keypress(function(e){
					//if enter pressed.
					if(e.which == 13){
						JQTT.contextMenu.action.edit.execute(id, tagName, uri);
					}
				});
				JQTT.contextMenu.action.focusNameInput();
			},
			
			/**
			* Validates form and sends data via ajax.
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
				
				// If change unbind submiting and make array.
				if(tagName != newName || uri != newUri){
					$('#jqttModal').unbind('keypress');
					$('#jqttModalSave').unbind('click');
					changeData = new Array(id, tagName, newName, uri, newUri);
				}else{
					// Hide loading gif, show errors.
					$('#jqttModal .modal-footer img').toggleClass('visible hidden');
					$('#jqttModal #modalLabel').html("Edit tag - <span class=\"text-error headlineNotify\"> Nothing changed!</span>");
					return;
				}
			
				$.ajax({
					url: JQTT.globUserVar.ajaxEditNodePhpPath,
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
			* After changing data in database change it in browser and make it visible.
			* 
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			* @param uri - uri of editing element
			*/
			redraw : function(id, name, uri){
				$('a[data-jqtt-id = '+id+']').attr('href', uri).text(name);
				$('a[data-jqtt-id = '+id+']').effect("highlight", {
					color: JQTT.globUserVar.highlightEditColor
				}, JQTT.globUserVar.highlightDuration);
			}
		},
		
		/**
		 * Shows predicates of clicked element.
		 */
		predicates : {
			/**
			* Sets modal window for predicate.
			* 
			* @param id - id of editing element
			* @param tagName - tag name of editing element
			*/
			define: function(id, tagName){
				$('#jqttModal #modalLabel').text("Predicates of \"" + tagName + "\"");
				
				$.ajax({
					url: JQTT.globUserVar.ajaxLoadPredicatesPhpPath,
					data: {
						id : id
					},
					dataType : 'JSON',
					success : function(data){ 
						$('#jqttModal .modal-body').html(data);
					},
					error:function(data){
						console.log("ERROR updating from context menu!");
						console.log(data.responseText);
					}
				}).done(function(){
					$('.jqttButtonDel').on('click',function(){
						JQTT.contextMenu.action.predicates.execute($(this).data('jqtt-delete-id'),id, tagName);
					});
				});
				
				$('#jqttModalSave').removeClass('btn-danger').addClass('btn-success').text('Done');
				$('#jqttModalCancel').addClass('hidden');
				$('#jqttModalSave').on('click',function(){
					$('#jqttModal').modal('hide');
				});
				$('#jqttModal').keypress(function(e){
					if(e.which == 13){
						$('#jqttModal').modal('hide');
					}
				});
			},
			
			/**
			 * Deleting of predicate after click on delete button.
			 * 
			 * @param id - id of editing element
			 * @param parentId - id of parent
			 */
			execute : function(id,parentId){
				// Delete from tree
				JQTT.contextMenu.action.del.execute(id);
				// Decrement number in square brackets
				JQTT.contextMenu.action.predicates.changePredicatesCount(parentId, '-');
			},
			
			/**
			 * Change or return number of predicates in square brackets.
			 * 
			 * @param id - which id should be changed
			 * @param sign - whether should be number rised or decresed
			 * 
			 * @return count of predicates
			*/
			changePredicatesCount : function(id, sign){
				var count = $('#'+ id+' .jqttNumOfPredic:first').text();
				
				count = count.split('[');
				count = count[1].split(']');
				if(sign == '-')
					count[0]--;
				else if (sign == '+')
					count[0]++;
				else
					return count[0];
				$('#'+ id+' .jqttNumOfPredic:first').text(" ["+count[0]+"]");
				return count[0];
			}
		},
		
		/*
		 * Add tag.
		 */
		add :{
			
			/**
			* Sets modal window for adding tag.
			* 
			* @param id - id of tag where shouhld be new one inserted
			*/
			define: function(id){
				$('#jqttModal #modalLabel').text("Add tag ");
				$('#jqttModal .modal-body').html(" \n\
				<input type='hidden' class='id' value='"+id+"'>\n\
				<label>Name:</label><input type='text' class='name'> \n\
				 <select class='selectLink'></select>\n\
				<label>URI:</label><textarea class='uri'></textarea> \n\
				");
				$('#jqttModal .modal-body .selectLink').load(JQTT.globUserVar.ajaxAddNodeLinkPhpPath);
				$('.selectLink').selectpicker({
						style: 'btn-danger',
						size: 4
					});
				
				$('#jqttModalSave').removeClass('btn-danger').addClass('btn-success').text('Add');
				$('#jqttModalCancel').removeClass('hidden');
				$('#jqttModalSave').on('click',function(){
					JQTT.contextMenu.action.add.execute(id);
				});
				$('#jqttModal').keypress(function(e){
					//if enter key pressed
					if(e.which == 13){
						JQTT.contextMenu.action.add.execute(id);
					}
				});
				JQTT.contextMenu.action.focusNameInput();
			},
			
			/**
			 * Validating passed data and adding tag to database via AJAX.
			 *
			 * @param id - id of tag where shouhld be new one inserted
			 */
			execute : function(id){
				//show loading gif
				$('#jqttModal .modal-footer img').toggleClass('visible hidden');
				var name = $('#jqttModal .modal-body .name').val();
				var uri = $('#jqttModal .modal-body .uri').val();
				var link = $('#jqttModal .modal-body .selectLink').children('button').children('span:first').text();
				var changeData;
				
				// Validate data and if something changes then unbind submiting and make array of new values.
				if(name != "" && uri != "" && name.length < JQTT.globConst.allowedNameLength && uri.length<JQTT.globConst.allowedUriLength){
					$('#jqttModal').unbind('keypress');
					$('#jqttModalSave').unbind('click');
					
					changeData = new Array(id, name, uri, link);
				}else{
					//hide loading gif, show errors
					$('#jqttModal .modal-footer img').toggleClass('visible hidden');
					$('#jqttModal #modalLabel').html("Edit tag - <span class=\"text-error headlineNotify\"> Wrong data! Empty or too long.</span>");
					return;
				}
			
				$.ajax({
					url: JQTT.globUserVar.ajaxAddNodePhpPath,
					data: {
						data : changeData
					},
					dataType : 'JSON',
					success : function(data){ 
						if(link == data.pred){
							JQTT.contextMenu.action.predicates.changePredicatesCount(id, '+');
						}else{
							JQTT.contextMenu.action.add.redraw(id, data.id, name, uri);
						}
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
			 * Adding tag to tree to browser.
			 * 
			 * @param parentId - id of parent (clicked) element 
			 * @param id - id of added element
			 * @param tagName - name of added element
			 * @param uri - uri of added element
			 */
			redraw : function(parentId, id, name, uri){
				var data = new Array();
				data["name"] = name;
				data["id"] = id;
				data["uri"] = uri;
				data["predicate"] = 0;
				data["numOfPredic"] = 0;

				var newTag = $(JQTT.globVar.rootUlTag +' .tagNameTemplate').clone(true, true).removeClass('tagNameTemplate');
				var cell = JQTT.renderTree.changeTagNameTemplate(newTag, data);
				cell.find('a:first').before('<i></i>').prev().addClass(JQTT.globUserVar.iconEmpty);
				cell.css('display','block');

				//works when parent is empty
				var findCellToHighlight = false;
				if ($('#'+parentId).find('i:first').hasClass( JQTT.globUserVar.iconEmpty)) {
					$('#'+parentId).children('div').after('<ul></ul>').next('ul').addClass('treeBranch');
					$('#'+parentId).children('ul').append(cell);
					
					$('#'+parentId).find('i:first').toggleClass(JQTT.globUserVar.iconClose+ ' ' + JQTT.globUserVar.iconEmpty);
				}
				//works when parent is closed
				else if($('#'+parentId).find('i:first').hasClass( JQTT.globUserVar.iconOpen)){
					if($('#'+parentId).find('ul:first').hasClass('treeEmpty')){
						findCellToHighlight = true;
						JQTT.renderTree.showBranch($('#'+parentId));
					}else{
						$('#'+parentId).children('ul').append(cell);
						$('#'+parentId).find('i:first').toggleClass(JQTT.globUserVar.iconClose+ ' ' + JQTT.globUserVar.iconOpen);
						$('#'+parentId).children('div').nextAll('ul').slideToggle(JQTT.globUserVar.slidingDuration);
					}
				}
				//works when parent is opened
				else{
					cell.bind('contextmenu', function(e) {JQTT.contextMenu.bindBody(e);return false;});
					$('#'+parentId).children('ul').append(cell);
				}

				if(!findCellToHighlight){
					cell.find('a:first').effect("highlight", {
						color: JQTT.globUserVar.highlightAddColor
					}, JQTT.globUserVar.highlightDuration);
				}else{
					JQTT.globUserVar.highlightId = id;
				}
			}
		},
		
		/**
		 * Delete tag.
		 */
		del :{
			/**
			* Sets modal window for deleting tag.
			* 
			* @param id - id of deleting element
			* @param tagName - name of deleting element
			* @param uri - uri of deleting element			
			*/
			define: function(id, tagName, uri){
				$('#jqttModal #modalLabel').text("Delete tag ");
				$('#jqttModal .modal-body').html(" <br>\n\
				<strong style='margin-right:5px'>Name:</strong> "+tagName+"<br>\n\
				<strong style='margin-right:20px'>URI:</strong> "+uri+"<br><br>\n\
			");
				$('#jqttModalSave').removeClass('btn-success').addClass('btn-danger').text('Delete');
				$('#jqttModalCancel').removeClass('hidden');
				$('#jqttModalSave').on('click',function(){
					JQTT.contextMenu.action.del.execute(id);
				
				});
				$('#jqttModal').keypress(function(e){
					//if enter pressed
					if(e.which == 13){
						JQTT.contextMenu.action.del.execute(id);
					}
				});
			},
			
			/*
			 * Deleting tag from database.
			 * 
			 * @param id - id of deleting element
			 */
			execute : function(id){
				$('#jqttModal .modal-footer img').toggleClass('visible hidden');
				$('#jqttModal').unbind('keypress');
				$('#jqttModalSave').unbind('click');
			
				$.ajax({
					url: JQTT.globUserVar.ajaxDelNodePhpPath,
					data: {
						data : id
					},
					dataType : 'JSON',
					success : function(data){ 
						JQTT.contextMenu.action.del.redraw(id);
						$('#jqttModal').modal('hide');
					},
					error:function(data){
						console.log("ERROR deleting from context menu!");
						console.log(data.responseText);
					}
				});
				JQTT.contextMenu.action.del.redraw(id);
				$('#jqttModal').modal('hide');
				$('#jqttModal .modal-footer img').removeClass('visible').addClass('hidden');
			},
			
			/**
			 * Deleting tag from browser.
			 *
			 * @param id - id of deleted element
			 */
			redraw : function(id){
				$('#'+id).slideUp(JQTT.globUserVar.slidingDuration,function(){
					$(this).remove()
				});
			}
		},
		/*
		 * Moves focus to form where should be typed name of tag in adding and editing.
		 */
		focusNameInput : function(){
			$('#jqttModal').on('shown', function () {
				$('#jqttModal .modal-body .name').focus();
			});
			
		}
	};
	
	
	/**
	 * Methods callable by user.
	 */
	JQTT.publicMethods = {

		/**
		 * Function providing running of change of settings posted by user and loading branches.
		 * 
		 * @param options - settings posted by user
		 */
		run : function( options ) {
			// Saving changes posted by user.
			if(options)
				JQTT.renderTree.changeSetings(options);

			var rootUlTag;
			// Gets id or class where tree will be iserted.
			if(this.attr('id')== undefined) rootUlTag = '.' + this.attr('class');
			else rootUlTag = '#' + this.attr('id');
			JQTT.globVar.rootUlTag = rootUlTag;

			JQTT.insertHtml.ulStructure(rootUlTag);
			JQTT.insertHtml.modalStructure();
			
			JQTT.contextMenu.start();
			// Load first level of tree.
			JQTT.renderTree.loadLeaf(0, rootUlTag);

			// After click calls method providing showing, hiding and loading branches.
			$(".liId").on("click",{}, JQTT.renderTree.prepare);
			

		}
	};

	/*
	 * Workspace html code to be iserted to web page.
	 */
	JQTT.insertHtml={
		/**
		 * Inserts template of tag structure into webpage after rootTag.
		 * 
		 * @param rootUlTag - where is whole tree
		 */
		ulStructure: function(rootUlTag){
			var toBeAdded = "<li style='display: none' class='tagNameTemplate liId'>\n\
								<div style='position: relative'><a href='#' class='showUls name' ></a><span class='jqttNumOfPredic'></span> \n\
								<img src='"+ JQTT.globUserVar.iconLoadingPath +"' class='hidden'></div></li>";
			$(rootUlTag).append(toBeAdded);
		},
		
		/**
		 * Inserts bootrstraps moddal structure into webpage at the end of the body.
		 */
		modalStructure: function(){
			var toBeAdded = "<!-- Modal For editing tags-->\n\
							<div id='jqttModal' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>\n\
								<div class='modal-header'>\n\
									<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h3 id='modalLabel'></h3>\n\
								</div>\n\
								<div class='modal-body'></div>\n\
								<div class='modal-footer'>\n\
									<img src='"+ JQTT.globUserVar.iconLoadingPath +"' class='hidden'>\n\
									<button class='btn' id='jqttModalCancel' data-dismiss='modal' aria-hidden='true'>Cancel</button>\n\
									<button class='btn btn-success' id='jqttModalSave'>Save changes</button>\n\
								</div>\n\
							</div>"
						;
			
			$(document.body).append(toBeAdded);
		}
	}

	/**
	 * Methods called internaly for rendering tree.
	 */
	JQTT.renderTree={

		/**
		 * Changing settings of variables changable by user via reflection aka eval function.
		 * 
		 * @param options - changes of global variables required by user
		 */
		changeSetings: function(options){
			
			for(var key in options){
				eval("JQTT.globUserVar."+key+" = options."+key);
			}
		},
		
		/*
		 * Called after click. To call show branch.
		 *
		 * @return false - prevents closing parent branch
		*/
		prepare: function(){
			JQTT.renderTree.showBranch(this);
			return false;
		},
		/**
		 * Shows hidden branches if they are loaded  otherwise loads them.
		 * 
		 * @param param - parameters passed to function. Aka which tag is root tag
		 */
		showBranch: function(clickedLiTag){
			if($(clickedLiTag).children('ul').hasClass('treeEmpty')){
				$(clickedLiTag).children('ul').removeClass('treeEmpty');
			}
			//if node has "empty icon" then user will be redirected.
			if($(clickedLiTag).children('div').children('i').hasClass(JQTT.globUserVar.iconEmpty)){
				window.location = $(clickedLiTag).children('div').children('a').attr('href');
				return false;
			}
			var children = $(clickedLiTag).children('ul').children('li');

			if(children.length==0){
				//show loading.gif
				$('#'+$(clickedLiTag).attr('id')).children('div').children('img').toggleClass('hidden visible');

				//load and show data
				JQTT.renderTree.loadLeaf($(clickedLiTag).attr('id'), JQTT.globVar.rootUlTag);
			}else{ 
				//toggles branch - show/hide
				$('#'+$(clickedLiTag).attr("id")).children('div').children('i').toggleClass(JQTT.globUserVar.iconOpen + ' ' + JQTT.globUserVar.iconClose).parent().nextAll('ul').slideToggle();
			}
		},

		/**
		 * Method asynchronously load will be shown.
		 * 
		 * @param rootId - clicked <li> - will be loaded
		 * @param rootUlTag - root tad <ul> where is imported whole jqTree
		 */
		loadLeaf: function (rootId, rootUlTag) {
			$.ajax({
				url: JQTT.globUserVar.ajaxLoadTreePhpPath,
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
		 * 
		 * @param data - loaded data
		 * @param rootId - id of <li> where should be data inserted
		 * @param rootUlTag - tag where is whole jqTree included
		 */
		addLoadedData: function (data, rootId, rootUlTag){
			var newTag;
			for(var i=data.length-1; i>=0;i--){
				if(data[i].name == null)continue;
				if(data[i].predicate == 1){continue;}
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

				if(data[i].children>0 && data[i].numOfPredic < data[i].children){
					//shows "could be opened" sign if could be opened
					cell.append('<ul></ul>').children('ul').addClass('treeBranch treeEmpty').css('display', 'none').prev().find('a:first').before('<i></i>').prev().addClass(JQTT.globUserVar.iconOpen).parent().parent().show();

				}else
					//shows "couldn't be opened" sign
					cell.find('a:first').before('<i></i>').prev().addClass(JQTT.globUserVar.iconEmpty).parent().parent().show();
			}
			//shows just loaded data
			$('#'+rootId).children('div').children('i').toggleClass(JQTT.globUserVar.iconOpen + ' ' + JQTT.globUserVar.iconClose).parent().nextAll('ul').slideToggle();
			//hide loading.gif
			if(JQTT.globUserVar.highlightId > -1){
				$('a[data-jqtt-id = '+ JQTT.globUserVar.highlightId +']').effect("highlight", {
					color: JQTT.globUserVar.highlightAddColor
				}, JQTT.globUserVar.highlightDuration);
				JQTT.globUserVar.highlightId = -1;
			}
			$('#'+rootId).children('div').children('img').toggleClass('hidden visible');
		},

		/**
		 * Change properties of cloned leaf.
		 * 
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
			cell.find('.name').html(prop.name);
			cell.find('.jqttNumOfPredic').text(" ["+ prop.numOfPredic +"]");
			cell.find('.show').attr('href', prop.uri);
			//add, edit, cut, delete
			return cell;
		}
	}


})(jQuery);