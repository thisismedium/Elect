/**
*	@preserve jquery.elect.js
*	Javascript-replaced select elements
*	Copyright 2011 Noah Burney
*/
(function( $ ) {

	// Add an array of all the Elect object to the global
	// jQuery object if there's not one
	if ( !$.election ) {
		$.election = [];
	}

	// A regex for matching html tags, borrowed from jQuery
	var htmlTag = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
	// The next two things are also borrowed from jQuery.
	// eee is just a reference to the Elect prototype
	eee,
	// and Elect, when called, returns an Elect object that's
	// been init()ed with whatever arguments are supplied
	Elect = function() {
		return new eee.init( arguments );
	};

	// And here's the actual Elect object
	eee = Elect.prototype = {
		opts: {
			copy_classes: true,
			copy_ids: true
		},

		init: function(a) {
			// Make a handy array out of arguments from Elect()
			var args = Array.prototype.slice.call( a );

			// The first arg is the <select>; extract it
			this.el = $(args.shift());

			// Merge in new options
			$.extend( this.opts, args[0] || {} );

			// If there's not already an Elect object bound to the <select>
			// run all of the other DOM building stuff
			if ( typeof this.el[0].elect === 'undefined' ) {

				// Find an available DOM ID for the container
				var id = 'elect-0';
				for ( var i = 1; $('#' + id).length; i++ ) {
				   id = id.replace(/-\d{1,}$/g, '-' + i);
				}
				// Make container to hold all the new DOM elements, hide <select>
				this.el.wrap('<div class="elect-container" id="' + id + '"></div>').hide();
				// Make an <input> to intercept focus and blur events
				this.fokus = $('<input id="' + id + '-fokus" type="text" />')
				   .css({
					   'display': 'block',
					   'position': 'absolute',
					   'left': '-3000px'
				   })
				   .insertAfter(this.el);
				this.con = $('#' + id);
				if ( this.opts.copy_classes ) {
					this.con.addClass( this.el[ 0 ].className );
				}
				// Add <span> to be the visual replacement for the <select>
				this.span = $('<span class="elect-element"></span>').appendTo( this.con );
				// Add a <ul> to hold all the faux-<option>
				this.ul = $('<ul class="elect-options"></ul>').appendTo( this.con );

				// Make another <span> to show the actual value
				this.val = $('<span class="elect-value"></span>').appendTo( this.span );

				// Add the basicmost styles to make it function
				this.con.css('position', 'relative');
				this.ul.css({
					'position': 'absolute',
					'z-index': '33333'
				});

				// Build an array of hashes the <option>s' data,
				// and make <li>s to replace them in the DOM
				this.optionize();

				// scope
				var kore = this;
				// Add click event to <span>
				this.span.mousedown(function() {
					kore.fokus.focus();
					kore.toggle();
					return false;
				});
				this.span.mouseup(function() {
					return false;
				});
				$('input, select, textarea, button').not( this.fokus ).focus(function( e ) {
					kore.blur( e );
				});
				// Hook in to fokus's focus event
				this.fokus.focus(function( e ) {
					kore.focus( e );
				});
				// Blur when user clicks another element
				$(document).mouseup(function( e ) {
					kore.blur();
				});

				this.el[ 0 ].elect = this;
				return this;

			} else {
				this.el[ 0 ].elect.optionize();
				return this.el[ 0 ].elect;
			}

		},
		// Build an array of hashes the <option>s' data,
		// and make <li>s to replace them in the DOM
		optionize: function() {
			this.selected = 0;
			this.opts = [];
			var kore = this;
			this.ul.empty();
			this.el.children('option').each(function( i, tem ) {
				var item = $(this),
				n = i;
				// Get infos
				var opt = {
					classes: item[0].className,
					name: item.attr('name'),
					id: item.attr('id'),
					value: item.val(),
					content: item.html()
				};
				// Make <li> with whatever info actually exists
				var li = $('<li class="elect-option' +
				   ((i == 0) ? ' first': '') +
				   ((opt.classes && kore.opts.copy_classes) ? ' ' + opt.classes: '') + '"' +
				   (opt.name ? ' name="' + opt.name + '"': '') +
				   ((opt.id && kore.opts.copy_ids) ? ' id="elect-' + opt.id + '"': '') +
				   (opt.value ? ' value="' + opt.value + '"': '') +
				   '>' + opt.content + '</li>');
				kore.ul.append( li );
				kore.opts.push( opt );

				// Add click event to <li>
				li.mouseup(function( e ) {
					kore.change( n );
					kore.close();
				});
				//Add/remove class on <li> hover
				li.hover(function() {
					$(this).addClass('hover');
				},
				function() {
					$(this).removeClass('hover');
				});
			});

			// Select the first option, making its value show
			var select_n = 0;
			this.el.children('option').each(function( i, tem ) {
				if ($(tem).attr('selected')) select_n = i;
			});
			this.change( select_n );
			this.close();

			this.searchString = '';
		},

		// Called whenver this should gain focus
		focus: function(e) {
			var kore = this;
			
			for ( var i = 0, l = $.election.length; i < l; i++ ) {
				if ( $.election[ i ] !== this ) {
					$.election[ i ].blur( e );
				}
			}
			this.span.addClass('focused');
			this.con.removeClass('invalid');
			this.clearsearch();
		},
		
		// Called whenever this should lose focus
		blur: function() {
			this.span.removeClass('focused');
			this.close();
		},

		// Returns boolean for whether this is focused or not
		focused: function() {
			return this.span.hasClass('focused');
		},

		// Called when any keypress document-wide is fired
		// _and_ this.span has a class of 'focused'
		keyup: function(e) {
			var code = e.keyCode;
			switch( code ) {
				case 9:
					break;
				case 40:
					this.next();
					break;
				case 38:
					this.prev();
					break;
				case 13:
					this.change( this.selected );
					break;
				default:
					var kore = this;
					clearTimeout( this.cleartime );
					this.cleartime = setTimeout(function() {
						kore.clearsearch.apply( kore );
					}, 1200);
					this.searchString += String.fromCharCode( code );
					this.search();
			}
		},

		clearsearch: function() {
			this.searchString = '';
		},

		search: function() {
			var el,	found = false,
				str = this.searchString.toLowerCase();
			for ( var i = 0, l = this.opts.length; i < l; i++ ) {
				var val = (this.opts[i].content || '').toLowerCase().substr( 0, str.length );
				if ( val.match( str ) ) {
					this.change( i );
					break;
				}
			}
		},

		// Toggles the <ul>
		toggle: function() {
			this.ul.toggle();
		},

		// Hides the <ul>
		close: function() {
			this.ul.hide();
			this.ul.children('li').removeClass('hover');
		},

		// Move to next option in list if it exists
		next: function() {
			var num = this.selected;
			if ( num + 1 < this.opts.length ) {
				num++;
			}
			this.change( num );
		},

		// Move to prev option in list if it exists
		prev: function() {
			var num = this.selected;
			if ( num - 1 >= 0 ){
				num--;
			}
			this.change( num );
		},

		// Fires on mouseup or blur
		change: function( num ) {
			// var n = num || this.selected;
			this.select( num );

			// Update the real <select> element such that the <option>
			// at the same position DOM-tree-order-wise as the selected <li>
			// gets the selected attr, for form submission
			this.el.children('option').removeAttr('selected')
				.eq( this.selected ).attr('selected', 'selected');

			// Call the change event on the select element in case
			// change bindings are neeeded
			this.el.change();
		},

		// Changes the <span> and <li> and this.selected
		// to reflect new selected option
		select: function(num) {
			// Try to find the requested <li>
			var l = this.ul.children('li').eq( num );
			if ( !l ) return;
			this.selected = num;

			// Give it a class of 'selected', and change this.val
			this.ul.children('li').removeClass('selected');
			l.addClass('selected').addClass( this.opts[ num ].classes );
			this.val.attr('value', this.opts[ num ].value)
				.html( this.opts[ num ].content );

			return this;
		}
	};
	eee.init.prototype = eee;

	// Intercept global key events
	// and dispatch them to appropriate Elect
	var activeElect = function() {
		var e, found = false, i, l;
		for ( i = 0, l = $.election.length; i < l; i++ ) {
			if ( e = $.election[i], e.focused() ) {
				found = true;
				break;
			}
		}
		return found ? e : null;
	};
	var electKeyUp = function( e ) {
		var el = activeElect();
		if ( el ) el.keyup( e );
	};

	$(document).keyup( electKeyUp );

	// Extend jQuery
	$.fn.elect = function() {
		// Takes arbitrary args, and make an array
		var args = Array.prototype.slice.call( arguments );
		// Loop through all elements of the selection
		return this.each(function( i ) {
			var a = args;
			// Add the actual <select> to the array of args
			a.unshift( this );
			// Make a new Elect, and add it to array of them
			$.election.push( Elect.apply( null, args ) );
			// Apply z-indexes for ie7 and below
			this.elect.con.css('z-index', 1000 - i).closest('tr').css('z-index', 1000 - i);

			// Add invalid state if needed
			if ( $(this).hasClass('invalid') ) {
				this.elect.span.addClass('invalid');
			}
		});
	};
	
})( jQuery );