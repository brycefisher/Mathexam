/*
	mathexam.js
	author bryce fisher
	date 1/15/10
	bryce.fisher@inbox.com
	for www.learn-with-math-games.com

----mathexam - global object which has everything to run all the different kinds of math exercises. the idea is that 
i would create abstract classes which each version of the exam can call on, and the file would be cached for faster
loads on repeat visits. there would be a initializer method which activates the correct parameters for the desired
type of exam

--setstate= main method of mathexam and only way to actually control the state of mathexam. it has the core switch logic
which runs the app:
	state: 1=set parameters / 2=enter answers / 3=correct answers

----exercise=a private constructor function which would be instantiated mathexam.numberofexercises number of times
when updating for state2. each exercise must retain its data between states 2 and 3, and be erased in state 1. Each
exercise would maintain its own html representatives of itself in states 2 and 3. 

*/


//Using the module pattern from http://yuiblog.com/blog/2007/06/12/module-pattern/. Thanks, Eric Miraglia!
//Everything before return { ... } are private methods and properties accessible only within the mathexam module.
//Everything within return { ... } are privileged methods and properties accessible from mathexam.mymethod() or mathexam.myproperty
var mathexam = function (){
	//private DOM interface
	document.write('<style type="text/css">@import url(\'http://github.com/brycefisher/Mathexam/raw/master/mathexam.css\');</style><form id="mathexam"></form>'); //Unorthodox, but I don't have access to <head>
	function $(id){ return document.getElementById(id); }
	function txtnode(text){ return document.createTextNode(text); }
	function setClass(obj,newclass){ try{ obj.setAttribute('class',newclass); } catch(err) { obj.setAttribute('className',newclass); } }
	var form = $('mathexam');
	function makeelem (elem,attribs,text){
		//returns DOM element elem, with attributes specified in 2d array attribs, with appended text node text.
		//elem must be a a valid HTML element, attribs must be an array (use [] for no attributes), nonstring values for text will be ignored.
		var element = document.createElement(elem);
		for(var i=0; i<attribs.length; i++){
			element.setAttribute(attribs[i][0],attribs[i][1]);
		}
		if(typeof text == 'string'){
			element.appendChild( txtnode(text) );
		}
		return element;
	}
	
	//universal config settings for the questions
	var questions = new Array();
	var numofquestions = 10;
	var operator = '+';
	var facts = new Array();
	var facttables = new Array();
	function resetfacttable(factindex){
		switch(operator){
			case '+': //just add, no weird cases to avoid
				facttables[factindex] = new Array('0','1','2','3','4','5','6','7','8','9','10');
				break;
			case '-': //no negative numbers allowed!
				facttables[factindex] = new Array('0','1','2','3','4','5','6','7','8','9','10');
				break;
			case 'x': 
				facttables[factindex] = new Array('1','2','3','4','5','6','7','8','9','10','11','12');
				break;
			case '/':
				newfacttable = new Array();
				for(var i=0; i<=12; i++){
					newfacttable.push( i*facts[factindex] );
				}
				facttables[factindex] = newfacttable;
				break;
		}
	}
	function getfactpair(factindex){
		var fact = facts[factindex];
		if(facttables[factindex].length < 1){ resetfacttable(factindex); }
		var partnerindex = Math.floor(facttables[factindex].length*Math.random() - 0.00001);
		var partner = facttables[factindex][partnerindex];
		var lowerslice = facttables[factindex].slice(0,partnerindex);
		var upperslice = facttables[factindex].slice(partnerindex+1);
		facttables[factindex] = lowerslice.concat( upperslice );
		if(operator == '/'){
			return new Array(partner,fact);
		} else if (operator == '-' && ((partner*1) > (fact*1))){
			return new Array(partner,fact);
		} else {
			return new Array(fact,partner);
		}
	}
	
	//Private constructor for the main child class, question which generates, maintains, and updates the HTML side of each question
	function question(qid){
		//Properties
		this.qid = "question" + qid;
		this.li = null;
		this.input = null;
		this.message = null;
		this.terms = new Array();
		this.solution = 0;
		this.correct = false;
		
		//Generate random questions of a beginner level
		if (facts == 'random') {
			if(operator == '+'){
				this.terms[0] = Math.floor(11*(Math.random() - 0.00001));
				this.terms[1] = Math.floor(11*(Math.random() - 0.00001));
			} else if(operator == '-'){
				this.terms[0] = Math.floor(21*(Math.random() - 0.00001));
				this.terms[1] = Math.floor(21*(Math.random() - 0.00001));
				if(this.terms[0] < this.terms[1]){
					var newterms = new Array( this.terms[1], this.terms[0] ); //make sure it comes out positive
					this.terms = newterms;
				}
			} else if (operator == 'x') {
				this.terms[0] = Math.floor(13*(Math.random() - 0.00001));
				this.terms[1] = Math.floor(13*(Math.random() - 0.00001));
			} else {
				this.terms[1] = Math.floor(12*(Math.random() - 0.00001)) + 1;
				this.terms[0] = this.terms[1] * Math.floor(13*(Math.random() - 0.00001));
			}
		} else if(typeof facts == 'object' || typeof facts == 'Array'){
			this.terms = getfactpair(Math.floor(facts.length*(Math.random() - 0.00001)));
		}
		
		//Calculate the solution and write the text for HTML element
		this.text= "";
		for(var i=0; i<this.terms.length; i++){
			this.text += this.terms[i];
			if(i+1 < this.terms.length){
				this.text += " " + operator + " ";
			} 
		}
		this.solution = (eval(this.text.replace(/x/, '*')));
		this.text += " = ";
		
		//Methods
		this.get = function(){
			this.li = makeelem('li',[],null);
			this.input = makeelem('input',[['name','question'],['id',this.qid],['title','Type only the number (ex: 4)'],['type','text']],null);
			this.message = makeelem('span',[[]],null);
			//this.p = makeelem('p',[], this.text);
			var qidnum = this.qid.split('question');
			qidnum = (qidnum[1]*1) + 1;
			this.p = makeelem('p',[], null);
			//alert(qidnum + ". " + this.text);
			var em = makeelem('em',[], qidnum+'. ');
			this.p.appendChild( em );
			this.p.appendChild( txtnode(this.text) );
			this.li.appendChild( this.p );
			this.li.appendChild(this.input);
			this.li.appendChild(this.message);
			return this.li;
		};
		this.check = function(){
			if (this.input.value == this.solution){
				this.correct = true;
				this.message.innerHTML = 'Brilliant!';
				setClass( this.message, 'correct' );
				return true;
			} else {
				if( isNaN(this.input.value) ){
					this.message.innerHTML = 'Please answer with a number.';
				} else {
					this.message.innerHTML = 'The answer is ' + this.solution;
					setClass( this.message, 'incorrect' );
				}
				return false;
			}
		};
	}
	
	//Core logic. Updates the state, internal variables, and the maintains the HTML on the page.
	function setstate(newstate){ 
		//state 1 - set options, state 2 - ask the questions, state 3 - grade the answers
		switch(newstate){
			case 1: //Let the user input the mathexam parameters (number of questions, what type, etc)
				questions = new Array(); //delete the old questions
				form.innerHTML = ''; //erase the old html
				numofquestions=0;  //reset the parameters
				operator=''; 
				facts=new Array(); 
				var paramnav = makeelem('ol',[['id','paramnav']],null); //Create the parameter progress indicator through the DOM
				var navstate="pickoperator"; //track which parameter we're getting
				var showbeginbutton=false;
				function makeparamnavli(funcname,txt){ 
					var li = makeelem('li',[['id','paramnav-'+funcname]], null);
					var a = makeelem('a',[['href','#']],txt);
					a.onclick = function(e){
						form.innerHTML = '';
						eval(funcname+"()"); 
						return false; 
					};
					li.appendChild( a );
					paramnav.appendChild(li);
				}
				function setnav(newnavstate){
					//Read the current parameter
					switch(navstate){
						case "pickoperator":
							
							break;
						case "pickfacts":
							for(var i=0; i<factol.childNodes.length; i++){
								if(factol.childNodes[i].className){
									facts.push(factol.childNodes[i].firstChild.value);
								}
							}
							if(facts.length == 0){ facts = "random"; }
							break;
						case "picknumofqs":
							
							break;
					}
					
					//Draw the progress indicator
					paramnav.innerHTML = "";
					makeparamnavli('pickoperator','Type of Exercise');
					makeparamnavli('picknumofqs','How Many Questions');
					makeparamnavli('pickfacts','Which Numbers');
					form.appendChild( paramnav );
					
					//Update the progress indicator
					switch(newnavstate){
						case "pickoperator":
							setClass( $('paramnav-pickoperator'), 'active' );
							setClass( $('paramnav-picknumofqs'), '' );
							setClass( $('paramnav-pickfacts'), '' );
							navstate = newnavstate;
							break;
						case "pickfacts":
							setClass( $('paramnav-pickoperator'), '');
							setClass( $('paramnav-picknumofqs'), '' );
							setClass( $('paramnav-pickfacts'), 'active' );
							navstate = newnavstate;
							break;
						case "picknumofqs":
							setClass( $('paramnav-pickoperator'),  '' );
							setClass( $('paramnav-picknumofqs'), 'active' );
							setClass( $('paramnav-pickfacts'), '' );
							navstate = newnavstate;
							break;
					}
					
					if(numofquestions!=0 && operator!=''){
						showbeginbutton = true;
					}
				}
				function updatebeginbutton(){
					if(showbeginbutton){
						var beginExamButton = makeelem('input',[['type','button'],['value','Begin The Exam!'],['id','beginbutton']],null);
						beginExamButton.onclick = function(e){ advancepick(null,{}); };
						form.appendChild( beginExamButton );
					}
				}
				function advancepick(e,options){ //read user values into mathexam object parameters for state 2 then load the next parameter selection function.
					var event = window.event || e; //cross-platform stuff
					if(event!=null){
						var elem = event.target || event.srcElement;
					}
					switch(navstate){
						case "picknumofqs":
							var href = elem.href;
							href = href.split('#');
							numofquestions = options[href[1]];
							form.innerHTML = '';
							break;
						case "pickoperator":
							var href = elem.href;
							href = href.split('#');
							operator = options[href[1]];
							form.innerHTML = '';
							break;
						case "pickfacts":
							for(var i=0; i<factol.childNodes.length; i++){
								if(factol.childNodes[i].className){
									facts.push(factol.childNodes[i].firstChild.value);
								}
							}
							if(facts.length == 0){ facts = "random"; }
							break;
					}
					if(operator == ''){
						pickoperator();
					} else if(numofquestions == 0){
						picknumofqs();
					} else if( facts != 'random' && facts.length==0 ){
						pickfacts();
					} else {
						setstate(2);
					}
					return false; //suppress default behavior
				}
				
				function picknumofqs(){
					form.appendChild( makeelem('h2', [], 'How Many Questions?') );
					setnav("picknumofqs");
					var numol = makeelem('ol', [['id','numofquestions']],null);
					var options = new Array('5','10','25','40','50','75','100');
					for(var i=0; i< options.length; i++){
						var li = makeelem('li', [[]], null);
						var a = makeelem('a', [['href','#' + i]], options[i]);
						a.onclick = function(e){ advancepick(e,options); };
						li.appendChild( a );
						numol.appendChild( li );
					}
					form.appendChild( numol );
					updatebeginbutton()
				}
				
				var factol = makeelem('ol', [['id','facts']],null);
				function pickfacts(){
					form.appendChild( makeelem('h2', [], 'Focus on Which Numbers?') );
					setnav("pickfacts");
					factol.innerHTML = ''; //remove the children so we don't end up with millions of child elements attached.
					switch(operator){
						case '-':
							var options = new Array('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20');
							factol.style.height='410px';
							break;
						default:
							var options = new Array('1','2','3','4','5','6','7','8','9','10','11','12');
							break;
					}
					for(var i=0; i< options.length; i++){
						var li = makeelem('li', [[]], null);
						var input = makeelem('input', [['name','fact'],['id','fact' + i],['type','checkbox'],['value',options[i]]], null);
						li.appendChild( input );
						var label = makeelem('label', [['for','fact'+i]], options[i]);
						label.onclick = function(e){
							var event = window.event || e;
							var elem = event.target || event.srcElement;
							elem = elem.parentNode;
							if(elem.className){
								setClass(elem,'');							
							} else {
								setClass(elem,'selected');
							}
						};
						li.appendChild( label );
						factol.appendChild( li );
					}
					form.appendChild(  factol );
					updatebeginbutton();
				}
				function pickoperator(){
					form.appendChild( makeelem('h2', [], 'What Type of Exercises?') );
					setnav("pickoperator");
					var opol = makeelem('ol', [['id','operator']],null);
					var options = new Array('+','-','x','/');
					for(var i=0; i< options.length; i++){
						var li = makeelem('li', [[]], null);
						var a = makeelem('a', [['href','#' + i]], options[i]);
						a.onclick = function(e){ advancepick(e,options); };
						li.appendChild( a );
						opol.appendChild( li );
					}
					form.appendChild(  opol );
					updatebeginbutton();
				}
				pickoperator();
				
				break;
			case 2://present the questions for the user to answer.
				form.innerHTML = ''; //erase the old html
				
				//Prepare the facttables
				if(typeof facts != 'string'){ //make sure that facts is not set to 'random'
					facttables = new Array(); //clear previous data, if any
					for(var i=0; i<facts.length; i++){
						facttables[i] = new Array();
					}
				}
				
				//Generate the elements
				var ol = makeelem('ol',[['id','questionlist']],null);
				for(var i=0; i<numofquestions; i++){
					questions[i] = new question(i);
					ol.appendChild(questions[i].get());
				}
				ol.style.listStyle="none";
				form.appendChild(ol);
				
				//Create user controls to switch the state.
				var checkansbutton = makeelem('input',[['type','submit'],['value','Check Answers']],null);
				form.appendChild(checkansbutton);
				form.onsubmit = function(){ setstate(3); return false; }; //suppress form submission; device independence (kybd or mouse) makes this more accessible
				var newexambutton = makeelem('input',[['type','button'],['value','Startover']],null);
				form.appendChild(newexambutton);
				newexambutton.onclick = function(){ setstate(1); return false;};
				break;
			case 3: //check the answers
				var correctanswers = 0;
				var wronganswers = "";
				for(var i = 0; i<questions.length; i++){
					if(questions[i].check()){
						correctanswers++;
					} else if(wronganswers == ""){
						wronganswers = (i+1);
					} else {
						wronganswers += ", " + (i+1);
					}
				}
				if(wronganswers == ""){
					if( confirm("Brilliant! You've answered all questions correctly. \n\nWould you like to play again?") ){
						setstate(1); //Go back to the beginning
						return false; //return stops setstate from finishing its execution. otherwise, after we called setstate in the previous line of code, the browser would come back to finishing this execution of the code
					}
				} else {
					alert( correctanswers + " right answers out of " + numofquestions + " total answers.\nYou answered incorrectly on question" + ((isNaN(wronganswers))?  "s":"") + " " +wronganswers + ".");
				}
				break;
			default:
				break; //ignore all other states
		}
	}
	
	//This anonymous function returns an object (everything within return { ... } ) whose methods and properties become the public interface of mathexam.
	return {
		init : function(){
			setstate(1);
		},
		debug : function(){
			numofquestions = 200;
			operator = '/';
			facts = new Array('12');
			setstate(2);
			
		}
	}
}(); //The parentheses here execute the anonymous function, making mathexam module ready to work right away!


mathexam.init();
