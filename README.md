*Version: 1.0, Last updated: 2/13/2011*

GitHub        - <a href="https://github.com/thisismedium/Elect">https://github.com/thisismedium/Elect</a><br/>
Source        - <a href="https://github.com/thisismedium/Elect/raw/master/jquery.elect.js">https://github.com/thisismedium/Elect/raw/master/jquery.elect.js</a> (9.1kb)<br/>
(Minified)    - <a href="https://github.com/thisismedium/Elect/raw/master/jquery.elect.min.js">https://github.com/thisismedium/Elect/raw/master/jquery.elect.min.js</a> (4.2kb)</br/>

License

Copyright (c) 2011 noah burney<br/>
Dual licensed under the MIT and GPL licenses.<br/>
<a href="http://timmywillison.com/licence/">http://timmywillison.com/licence/</a>

Support and Testing

Versions of jQuery and browsers this was tested on.

jQuery Versions - 1.3.2-1.5<br/>
Browsers Tested - Internet Explorer 6-8, Firefox 3-4, Safari 3-5,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Chrome, Opera.

Release History

1.0   - (2/13/2011) Initial release<br/>

*Javascript-replaced select elements*

<h1>About Elect</h1>

This plugin is used to make select elements look however you like.

<h1>PLUGIN USAGE</h1>

Javascript

<pre>
$('select').elect();
</pre>

Your CSS should have these rules:
<pre>
.elect-container { /* The main container */ }
.elect-element { /* Put your main background and border-radius here */ }
.elect-value { /* Put your arrow image here */ }
.elect-element span { /* The currently selected value */ }
.elect-options { /* This is the list of options that comes up */ }
.elect-options li {}
</pre>

<h3>Available options</h3>

<pre>
$('select').elect({
    copy_classes: true,
    copy_ids: true
});
</pre>