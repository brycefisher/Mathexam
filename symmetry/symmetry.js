/*******************************************************************
symmetry.js

Description: Symmetry math game for use on learn-with-math-games.com
Last updated: March 25, 2010
Author: Bryce Fisher, bryce.fisher@inbox.com
	(soon available on github!)

TBD:
	+ Make sure the symmetry-update function in state=4 changes shape
	+ Create state=3 for the symmetryexercise object. It should confirm
		the user has created a symmetrical form to the one the computer 
		presents
	+ Have Greg explain what parameters he wants for state=1
	+ Create a file which Greg can update to change the shapes loaded
		by the app in state=2

*******************************************************************/

var symmetryexercise = function(){
	//private variables & methods
	var form; //this is the DOM interface to the #symmetry container.
	var controlbar; //allows user to pick what to color the tiles.
	var grid; //this is the grid of tiles which the user should try to mirror.
	
	var paintstate;
	
	//tile images
	var bl = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/bl.jpg";
	var br = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/br.jpg";
	var tl = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/tl.jpg";
	var tr = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/tr.jpg";
	var all = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/red.jpg";
	var none = "http://github.com/brycefisher/Mathexam/raw/master/symmetry/blank.jpg";
	var defaultpaintstate = bl;
	var tileimages = {'bl':bl, 'br':br, 'tl':tl, 'tr':tr, 'all':all, 'none':none};
	paintstate = defaultpaintstate;
	function urltopaintstatecode( url ){
		for(x in tileimages){
			if(tileimages[x] == url)
				return x;
		}
		return 'none';
	}
	
	//axes of symmetries
	var horizontal = 0;
	var vertical = 1;
	var symmetry = horizontal;
	
	//symmetry detection function
	function getReflection(originalstate){
			if(originalstate == all){
				return all;
			} else if (originalstate == none){
				return none;
			} 
			switch(symmetry){
				case horizontal:
					switch(originalstate){
						case bl:
							return tl;
							break;
						case tl:
							return bl;
							break;
						case br:
							return tr;
							break;
						case tr:
							return br;
							break;
					}
					break;
				case vertical:
					switch(originalstate){
						case bl:
							return br;
							break;
						case tl:
							return tr;
							break;
						case br:
							return bl;
							break;
						case tr:
							return tl;
							break;
					}
					break;
			}
		};
	
	var shape='|'; //data. We'll track clicks in here as they happen. for state=4
	//Constructor for state/coord pair in a shape object's tiles.
	function pair(tid,state){
		this.tid=tid;
		this.state=state;
	};
		
	//Constructor for individual tiles
	function tile(disabled,state,tid){
		var img = makeelem('img', [['alt',''],['src',state],['id',tid],['class','tile']],null); //create html elem upon being instantiated
		var src
		this.tid=tid;
		this.getstate = function(){
			return state;
		};
		this.setstate = function(e){
			if(!disabled){
				state = paintstate;
				img.setAttribute('src',state);
			}
		};
		this.getimg = function(){
			return img;
		};
		this.makeHorizontalBorder = function(){
			Core.addClass(img,'horizontalborder');
		};
		this.makeVerticalBorder = function(){
			Core.addClass(img,'verticalborder');
		};
		Core.addEventListener(img, "click", this.setstate);
		
		this.disable = function(){
			if(!disabled){
				disabled = true;
			}
			src = img.getAttribute('src');
			if(src.lastIndexOf('-disabled.jpg') < 0){
				src = src.split('.jpg');
				src = src[0] + '-disabled.jpg';
				img.setAttribute('src', src);
			}
		}
		this.enable = function(){
			if(disabled){
				disabled = false;
			}
			src = img.getAttribute('src');
			if( src.lastIndexOf('-disabled.jpg') > -1){
				src = src.split('-disabled.jpg');
				src = src[0] + '.jpg';
				img.setAttribute( 'src', src );
			}
		}
		this.reset = function(){
			Core.removeClass(img, 'horizontalborder');
			Core.removeClass(img, 'verticalborder');
			state = none;
			img.setAttribute('src',state);
			disabled=false;
		};
		this.isareflectionof = function(reflectedstate){
			if(getReflection(reflectedstate) == state){
				return true;
			} else {
				return false;
			}
		};
	}
	tiles = new Array();
	
	
	var buttons = new Array();
	button = function(tile){
		var active = false;
		var li = makeelem('li',[[]],null);
		var link = makeelem('a',[['href','#'],['title','what to make the tiles']],null);
		var img = makeelem('img',[['src',tileimages[tile]],['alt','game control']],null);
		link.appendChild( img );
		li.appendChild( link );
		this.getactive = function(){
			return active;
		}
		this.deactivate = function(){
			active = false;
			Core.removeClass(link,'active');
		}
		this.activate = function(e){
			active = true;
			for(var i=0; i<buttons.length; i++){
				buttons[i].deactivate();
			}
			Core.addClass(link,'active');
			paintstate = tileimages[tile];
			Core.preventDefault(e)
		}
		Core.addEventListener(link, "click", this.activate);
		if(tile == defaultpaintstate){ this.activate(); }
		this.getdom = function(){
			return li;
		};
	};
	
	var state=1;
	function setstate(newstate){
		switch(newstate){
			case 1: //Set options for the symmetry game
				function createAxisOption( axis ){
					var li = makeelem('li',[['id',axis]],null);
					var a = makeelem('a', [['href','']], axis);
					Core.addEventListener(a, 'click', 
						function(e){
							symmetry = (axis=='horizontal')? horizontal:vertical;
							setstate(2);
							Core.preventDefault(e);
						} );
					li.appendChild(a);
					return li;
				}
				
				form.innerHTML='';
				form.appendChild( makeelem('h2',[[]],'Symmetry Challenge') );
				form.appendChild( makeelem('p',[[]],'Pick the axis of symmetry:') );
				var symul = makeelem('ul',[['id','symul']],null);
				symul.appendChild( createAxisOption('horizontal') );
				symul.appendChild( createAxisOption('vertical') );
				form.appendChild( symul );
				break;
			case 2:
				form.innerHTML = '';
				form.appendChild( makeelem('h2',[[]],'Symmetry Challenge') );
				var symtxt = (symmetry==horizontal)? 'horizontal':'vertical';
				form.appendChild( makeelem('p',[[]],'Axis of symmetry: '+symtxt) );
				controlbar = makeelem('ol',[['id','controlbar']],null);
				form.appendChild( controlbar );
				grid = makeelem('div',[['id','grid']],null);
				form.appendChild( grid );
				
				var i=0;
				for(x in tileimages){
					buttons[i] = new button(x);
					controlbar.appendChild( buttons[i].getdom() );
					i++;
				}
				
				//Add the children
				for(var i=0; i<400; i++){
					tiles[i] = new tile(false, none, i);
					switch(symmetry){
						case horizontal:
							if(i>=200){
								tiles[i].disable();
								if(i<=219){
									tiles[i].makeHorizontalBorder();
								}
							}
							break;
						case vertical:
							if(((i/20) - Math.floor(i/20))*20 >= 10){
								tiles[i].disable();
								if( ((i/20) - Math.floor(i/20))*20 == 10){
									tiles[i].makeVerticalBorder();
								}
							}
							break;
					}
					grid.appendChild( tiles[i].getimg() );
				}
				
				break;
			case 3:
				break;
			case 4:
				form.innerHTML = '';
				form.appendChild( makeelem('h2',[[]],'Symmetry Challenge - Create Shapes') );
				
				form.appendChild( makeelem('p',[], 'Create a shape to mirror. ') );
				form.appendChild( makeelem('label',[['for','selectaxis']],'Axis of Symmetry') );
				var selectaxis = makeelem('select',[['id','selectaxis']],null);
				selectaxis.appendChild( makeelem('option',[[]],'horizontal') );
				selectaxis.appendChild( makeelem('option',[[]],'vertical') );
				form.appendChild( selectaxis );
				var symupdate = makeelem('input',[['type','submit'],['value','Update']],null);
				form.appendChild( symupdate );
				Core.addEventListener( symupdate, 'click', 
					//************** TBD: MUST UPDATE SHAPE!!!! *****************************//
					function(e){
						if(selectaxis.options[selectaxis.selectedIndex].value == 'horizontal'){
							//update the shape string
							if(shape.indexOf('horizontal') == -1){
								shape = '|symmetry:horizontal';
							}
							for(var i=0; i<400; i++){
								paintstate = tiles[i].getstate(); //remember what state the tile was in.
								tiles[i].reset();
								if(i<200){
									tiles[i].disable(); //wipe the tile state clean
								} else {
									tiles[i].setstate(null); //keep the original tile state back
									if (200<=i && i<=219) {
										tiles[i].makeHorizontalBorder();
									}
								}
							}
							symmetry = horizontal;
						} else {
							if(shape.indexOf('vertical') == -1){
								shape = shape.split('horizontal');
								shape = shape.join('vertical');
							}
							for(var i=0; i<400; i++){
								paintstate = tiles[i].getstate();
								tiles[i].reset();
								if(((i/20) - Math.floor(i/20))*20 < 10){
									tiles[i].disable();
								} else {
									tiles[i].setstate(null);
									if(paintstate!=none){ 
										shape+=';'+i+':'+paintstate; 
									}
									if (((i/20) - Math.floor(i/20))*20 == 10) {
										tiles[i].makeVerticalBorder();
									}
								}
							}
							symmetry = vertical;
						}
						Core.preventDefault(e);
					});
				var sympreview = makeelem('input',[['type','submit'],['value','Preview Symmetry']],null);
				form.appendChild(sympreview);
				Core.addEventListener(sympreview,'click',
					function(e){
						var tile;
						var tilemirror;
						Core.preventDefault(e);
						switch(symmetry){
							case horizontal:
								for(var x=0; x<20; x++){
									for(var y=19; y>=10; y--){
										tile=x+(y*20);
										tilemirror=380+x-(y*20);
										paintstate =  getReflection( tiles[tile].getstate(null) );
										tiles[tilemirror].enable();
										tiles[tilemirror].setstate(null);
										tiles[tilemirror].disable();
									}
								}
								break;
							case vertical:
								for(var y=0; y<20; y++){
									for(var x=19; x>=10; x--){
										tile=(y*20)+x;
										tilemirror=(y*20)+(19-x);
										paintstate = getReflection( tiles[tile].getstate() );
										paintstate =  getReflection( tiles[tile].getstate(null) );
										tiles[tilemirror].enable();
										tiles[tilemirror].setstate(null);
										tiles[tilemirror].disable();
									}
								}
								break;
						}
					});

				controlbar = makeelem('ol',[['id','controlbar']],null);
				form.appendChild( controlbar );
				grid = makeelem('div',[['id','grid']],null);
				form.appendChild( grid );
				var i=0;
				for(x in tileimages){
					buttons[i] = new button(x);
					controlbar.appendChild( buttons[i].getdom() );
					i++;
				}
				
				//Add the children
				shape=(symmetry==horizontal)? '|symmetry:horizontal' : '|symmetry:vertical';
				for(var i=0; i<400; i++){
					tiles[i] = new tile(false, none, i);
					switch(symmetry){
						case horizontal:
							if(i<200){
								tiles[i].disable();
							}
							if(i>=200 && i<220){
								tiles[i].makeHorizontalBorder();
							}
							break;
						case vertical:
							if(((i/20) - Math.floor(i/20))*20 >= 10){
								tiles[i].disable();
								if( ((i/20) - Math.floor(i/20))*20 == 10){
									tiles[i].makeVerticalBorder();
								}
							}
							break;
					}
					var tileimg = tiles[i].getimg();
					Core.addEventListener(tileimg,'click',
						function(e){
							var event = e || window.event;
							if(event!=null){
								var elem = event.target || event.srcElement;
								var tid = elem.getAttribute('id');
								if( tid.length == 1) {  //add leading zeros so that each tid string could not occur inside another tid string
									tid = '00' + tid;
								} else if ( tid.length == 2) {
									tid = '0' + tid;
								}
								var newshapecode = (paintstate!=none)? tid + ':' + urltopaintstatecode( paintstate ) : '';
								if( shape.indexOf(tid) != -1 ){
									var firstsection = shape.substring(0, shape.indexOf(tid));
									var nextsemicolon = shape.indexOf(';', shape.indexOf(tid));
									if(nextsemicolon == -1){
										var lastsection = '';
										if(paintstate==none)
											firstsection = firstsection.substring(0, firstsection.lastIndexOf(';') ); //trim trailing semicolon
									} else {
										var lastsection = shape.substring(nextsemicolon+1);
									}
									//alert('tid='+tid+'\nshape=\t\t'+shape+'\nfirstsection=\t'+firstsection+'\n\t\tnewshapecode='+newshapecode+'\nlastsection=\t'+lastsection);
									shape = firstsection + newshapecode + lastsection;
								} else {
									if(paintstate!=none){ //capture all paintstates except state=none
										shape += ';' + newshapecode;
									}
								}
							}
						});
					grid.appendChild( tileimg );
				}
				
				var exportshape = makeelem('input',[['type','submit'],['value','Export Shape']],null);
				form.appendChild( exportshape );
				Core.addEventListener(exportshape,'click',
					function(e){
						Core.preventDefault(e);
						alert( shape );
					});
					
				var importshape = makeelem('input',[['type','submit'],['value','Import Shape']],null);
				form.appendChild( importshape );
				Core.addEventListener(importshape,'click',
					function(e){
						Core.preventDefault(e);
						var shape=prompt('Please enter the shape code:','');
						if(shape==null){ return false; } //the user clicked 'cancel'
						shape=shape.split('|');
						if(shape.length!=2){
							alert('Invalid shape code: wrong number of line-delimiters (' + shape.length-1 + ')');
							return false;
						}
						shape = shape[1].split(';');
						if(shape[0].indexOf('symmetry')==-1){
							alert('invalid shape code: no symmetry or symmetry in the wrong place');
							return false;
						}
						if(shape[0].indexOf('horizontal') >-1){
							selectaxis.options.selectedIndex = 0;
						} else if (shape[0].indexOf('vertical') >-1) {
							selectaxis.options.selectedIndex = 1;
						}
						symupdate.click(); //symmetry should have the correct value when the browser resumes executing the next command in this function
						
						if(symmetry==horizontal){
							for(var y=10; y<20; y++){
								for(var x=0; x<20; x++){
									tiles[ y*20 + x ].reset();
								}
							}
						} else {
							for(var y=0; y<20; y++){
								for(var x=10; x<20; x++){
									tiles[ y*20 + x ].reset();
								}
							}
						}
						for(var i=1; i<shape.length; i++){
							var tiledata = shape[i].split(':');
							paintstate = tileimages[ tiledata[1] ];
							tiles[ tiledata[0] * 1].setstate(null);
						}
					});
				break;
		}
		if(!isNaN(newstate) && Math.round(newstate) == newstate && newstate>=1 && newstate <= 3){
			state = newstate;
		}
	}
	return {
		init : function(){
			form = $('symmetry');
			setstate(4);
		}
	};
}(); //execute function ¡ahorita!

Core.start( symmetryexercise );