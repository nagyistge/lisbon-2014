(function(window){var HAS_HASHCHANGE=function(){var doc_mode=window.documentMode;return"onhashchange"in window&&(doc_mode===undefined||doc_mode>7)}();L.Hash=function(map,torque){this.onHashChange=L.Util.bind(this.onHashChange,this);if(map){this.init(map,torque)}};L.Hash.parseHash=function(hash){if(hash.indexOf("#")===0){hash=hash.substr(1)}var args=hash.split("/");if(args.length==5){var zoom=parseInt(args[1],10),lat=parseFloat(args[2]),lon=parseFloat(args[3]);var obj={};if(isNaN(zoom)||isNaN(lat)||isNaN(lon)){return false}else{obj={center:new L.LatLng(lat,lon),zoom:zoom}}obj.step=parseFloat(args[4]);if(!this.torque._last_step){this.torque._last_step=obj.step}return obj}else{return false}};L.Hash.formatHash=function(map,torque){var center=map.getCenter(),zoom=map.getZoom(),precision=Math.max(0,Math.ceil(Math.log(zoom)/Math.LN2)),step=torque._last_step||0;return"#/"+[zoom,center.lat.toFixed(precision),center.lng.toFixed(precision),step].join("/")},L.Hash.prototype={map:null,lastHash:null,parseHash:L.Hash.parseHash,formatHash:L.Hash.formatHash,init:function(map,torque){this.map=map;this.torque=torque;this.lastHash=null;this.onHashChange();if(!this.isListening){this.startListening()}},removeFrom:function(map){if(this.changeTimeout){clearTimeout(this.changeTimeout)}if(this.isListening){this.stopListening()}this.map=null},onMapMove:function(){if(this.movingMap||!this.map._loaded){return false}var hash=this.formatHash(this.map,this.torque);if(this.lastHash!=hash){location.replace(hash);this.lastHash=hash}},movingMap:false,update:function(){var hash=location.hash;if(hash===this.lastHash){return}var parsed=this.parseHash(hash);if(parsed){this.movingMap=true;this.map.setView(parsed.center,parsed.zoom);this.torque.setStep(parsed.step);this.movingMap=false}else{this.onMapMove(this.map)}},changeDefer:100,changeTimeout:null,onHashChange:function(){if(!this.changeTimeout){var that=this;this.changeTimeout=setTimeout(function(){that.update();that.changeTimeout=null},this.changeDefer)}},isListening:false,hashChangeInterval:null,startListening:function(){this.map.on("moveend",this.onMapMove,this);if(HAS_HASHCHANGE){L.DomEvent.addListener(window,"hashchange",this.onHashChange)}else{clearInterval(this.hashChangeInterval);this.hashChangeInterval=setInterval(this.onHashChange,50)}this.isListening=true},stopListening:function(){this.map.off("moveend",this.onMapMove,this);if(HAS_HASHCHANGE){L.DomEvent.removeListener(window,"hashchange",this.onHashChange)}else{clearInterval(this.hashChangeInterval)}this.isListening=false}};L.hash=function(map){return new L.Hash(map)};L.Map.prototype.addHash=function(){this._hash=L.hash(this)};L.Map.prototype.removeHash=function(){this._hash.removeFrom()}})(window);var torqueLayer;var count=1;function main(){cdb.vis.Overlay.register("match_slider",function(data,viz){data.template=$("#match_slider").html();var slider=new MatchSlider(data);return slider.render()});cartodb.createVis("map","http://srogers.cartodb.com/api/v2/viz/a43ea07a-e3f2-11e3-92f9-0e230854a1cb/viz.json",{center_lat:24.5,center_lon:-7,zoom:2,time_slider:false,fullscreen:true}).done(function(vis,layers){vis.map.set({minZoom:1,maxZoom:10});var map=vis.getNativeMap();var layer=layers[2];var hash=new L.Hash(map,layer);var share=vis.addOverlay({type:"share",layer:layer});slider=vis.addOverlay({type:"match_slider",layer:layer});torqueLayer=layer;torqueLayer.stop();if(location.hash)++count;torqueLayer.on("load",onTorqueLoad);torqueLayer.on("change:time",checkTime)}).on("error",manageError)}function onTorqueLoad(){--count;torqueLayer.play();drawStartEnd();if(count===0)torqueLayer.off("load",onTorqueLoad)}function manageError(err,layer){$("#not_supported_dialog").show();var overlays=this.getOverlays();for(var i=0;i<overlays.length;++i){var o=overlays[i];o.hide&&o.hide()}}function checkTime(data){_.each(match_data.highlights,function(d,i){var block=d.team.indexOf("Atlético")!==-1?"atletico":"madrid";if(new Date(data.time)>=new Date(i)){if(!d.el){var div=$("<div>").addClass("highlight "+block);div.append($("<i>").addClass("icon "+d.type+" ").attr("data-tipsy",d.text).append(d.type));div.append($("<span>").addClass("line"));d.el=div;var pos=getHighlightPos(new Date(i).getTime());d.el.css({left:pos+"%"});$(".highlights").find("."+block+" .timeline").append(d.el);generateTooltip(d.el.find("i"));if(d.type==="goal"){var goals=parseInt($("em."+block).text());$("em."+block).text(++goals)}}d.el.show()}else{if(d.el&&d.type==="goal"){var goals=parseInt($("em."+block).text());$("em."+block).text(--goals)}if(d.el){d.el.hide().remove();delete d.el}}})}function destroyTooltip($el){}function generateTooltip($el){}function getHighlightPos(timestamp){var tb=torqueLayer.getTimeBounds();return(timestamp-tb.start)*100/(tb.end-tb.start)}function drawStartEnd(){if($(".icon.start").length>0){return false}var div=$("<div>").addClass("highlight");div.append($("<i>").addClass("icon start"));div.append($("<span>").addClass("separator"));div.append($("<p>").text(match_data.start.text));var pos=getHighlightPos(new Date(match_data.start.time).getTime());div.css({left:pos+"%"});$(".highlights .timeslider").find(".wrap_slider").append(div).append($("<span>").addClass("slider_mamufas start").css({left:0,width:pos+"%"}));var div=$("<div>").addClass("highlight");div.append($("<i>").addClass("icon end"));div.append($("<span>").addClass("separator"));div.append($("<p>").text(match_data.end.text));var pos=getHighlightPos(new Date(match_data.end.time).getTime());div.css({left:pos+"%"});$(".highlights .timeslider").find(".wrap_slider").append(div).append($("<span>").addClass("slider_mamufas end").css({right:0,left:pos+"%"}))}window.onload=main;var match_data={start:{time:"Sat May 24 2014 20:47:00 GMT+0000",text:"0'"},end:{time:"Sat May 24 2014 23:21:00 GMT+0000",text:"122'"},highlights:{"Sat May 24 2014 20:57:00 GMT+0000":{type:"substitution",text:"9' - <b>Adrian</b> replaces <b>Diego Costa</b>",team:"Atlético de Madrid"},"Sat May 24 2014 21:14:00 GMT+0000":{type:"yellow",text:"27' - <b>Raul García</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 21:14:00 GMT+0000":{type:"yellow",text:"27' - <b>Ramos</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 21:25:00 GMT+0000":{type:"goal",text:"36' - GOAL by <b>Godín</b>!",team:"Atlético de Madrid"},"Sat May 24 2014 21:32:00 GMT+0000":{type:"yellow",text:"45' +1 - <b>Khedira</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 21:56:00 GMT+0000":{type:"yellow",text:"53' - <b>Miranda</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:02:00 GMT+0000":{type:"substitution",text:"59' - Double substitution <b>Marcelo and Isco</b> replaces <b>F. Coentrao and Khedira</b>",team:"Real Madrid"},"Sat May 24 2014 22:10:00 GMT+0000":{type:"substitution",text:"66' - <b>José Sosa</b> replaces <b>Raul García</b>",team:"Atlético de Madrid"},"Sat May 24 2014 22:16:00 GMT+0000":{type:"yellow",text:"72' - <b>David Villa</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:18:00 GMT+0000":{type:"yellow",text:"74' - <b>Juanfran</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:23:00 GMT+0000":{type:"substitution",text:"79' - <b>Alvaro Morata</b> replaces <b>Karim Benzema</b>",team:"Real Madrid"},"Sat May 24 2014 22:26:00 GMT+0000":{type:"substitution",text:"83' - <b>Alderweireld</b> replaces <b>Filipe Luis</b>",team:"Atlético de Madrid"},"Sat May 24 2014 22:30:00 GMT+0000":{type:"yellow",text:"86' - <b>Koke</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:37:00 GMT+0000":{type:"goal",text:"90' +3 - GOAL by <b>Ramos</b>!",team:"Real Madrid"},"Sat May 24 2014 22:54:00 GMT+0000":{type:"yellow",text:"100' - <b>Gabi</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 23:09:00 GMT+0000":{type:"goal",text:"110' - GOAL by <b>Bale</b>!",team:"Real Madrid"},"Sat May 24 2014 23:16:00 GMT+0000":{type:"goal",text:"118' - GOAL by <b>Marcelo</b>!",team:"Real Madrid"},"Sat May 24 2014 23:17:00 GMT+0000":{type:"yellow",text:"119' - <b>Marcelo</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 23:18:00 GMT+0000":{type:"yellow",text:"120' - <b>Godín</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 23:19:00 GMT+0000":{type:"goal",text:"121' - GOAL by <b>Cristiano</b>!",team:"Real Madrid"}}};var MatchSlider=cdb.geo.ui.TimeSlider.extend({defaultTemplate:"",initialize:function(){this.defaultTemplate=this.options.template;cdb.geo.ui.TimeSlider.prototype.initialize.call(this)}});(function($){var MOVE_OFFSET=6;function maybeCall(thing,ctx){return typeof thing=="function"?thing.call(ctx):thing}function isElementInDOM(ele){while(ele=ele.parentNode){if(ele==document)return true}return false}function Tipsy(element,options){this.$element=$(element);this.options=options;this.enabled=true;this.fixTitle()}Tipsy.prototype={show:function(){var title=this.getTitle();if(title&&this.enabled){var $tip=this.tip();$tip.find(".tipsy-inner")[this.options.html?"html":"text"](title);$tip[0].className="tipsy";$tip.remove().css({top:0,left:0,visibility:"hidden",display:"block"}).prependTo(document.body);if(this.options.className){$tip.addClass(maybeCall(this.options.className,this.$element[0]))}var pos=$.extend({},this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight});var actualWidth=$tip[0].offsetWidth,actualHeight=$tip[0].offsetHeight,gravity=maybeCall(this.options.gravity,this.$element[0]);var tp;switch(gravity.charAt(0)){case"n":tp={top:pos.top+pos.height+this.options.offset,left:pos.left+pos.width/2-actualWidth/2};mo={top:parseInt(pos.top+pos.height+this.options.offset+MOVE_OFFSET),opacity:this.options.opacity};break;case"s":tp={top:pos.top-actualHeight-this.options.offset,left:pos.left+pos.width/2-actualWidth/2};mo={top:parseInt(pos.top-actualHeight-this.options.offset-MOVE_OFFSET),opacity:this.options.opacity};break;case"e":tp={top:pos.top+pos.height/2-actualHeight/2,left:pos.left-actualWidth-this.options.offset};mo={left:parseInt(pos.left-actualWidth-this.options.offset-MOVE_OFFSET),opacity:this.options.opacity};break;case"w":tp={top:pos.top+pos.height/2-actualHeight/2,left:pos.left+pos.width+this.options.offset};mo={left:parseInt(pos.left+pos.width+this.options.offset+MOVE_OFFSET),opacity:this.options.opacity};break}if(gravity.length==2){if(gravity.charAt(1)=="w"){tp.left=pos.left+pos.width/2-15}else{tp.left=pos.left+pos.width/2-actualWidth+15}}$tip.css(tp).addClass("tipsy-"+gravity);$tip.find(".tipsy-arrow")[0].className="tipsy-arrow tipsy-arrow-"+gravity.charAt(0);if(this.options.fade){$tip.stop().css({opacity:0,display:"block",visibility:"visible"}).animate(mo,200)}else{$tip.css({visibility:"visible",opacity:this.options.opacity})}}},hide:function(){gravity=maybeCall(this.options.gravity,this.$element[0]);switch(gravity.charAt(0)){case"n":mo={top:parseInt(this.tip().css("top"))+MOVE_OFFSET,opacity:0};break;case"s":mo={top:parseInt(this.tip().css("top"))-MOVE_OFFSET,opacity:0};break;case"e":mo={left:parseInt(this.tip().css("left"))-MOVE_OFFSET,opacity:0};break;case"w":mo={left:parseInt(this.tip().css("left"))+MOVE_OFFSET,opacity:0};break}if(this.options.fade){this.tip().stop().animate(mo,200,function(){$(this).remove()})}else{this.tip().remove()}},fixTitle:function(){var $e=this.$element;if($e.attr("title")||typeof $e.attr("original-title")!="string"){$e.attr("original-title",$e.attr("title")||"").removeAttr("title")}},getTitle:function(){var title,$e=this.$element,o=this.options;this.fixTitle();var title,o=this.options;if(typeof o.title=="string"){title=$e.attr(o.title=="title"?"original-title":o.title)}else if(typeof o.title=="function"){title=o.title.call($e[0])}title=(""+title).replace(/(^\s*|\s*$)/,"");return title||o.fallback},tip:function(){if(!this.$tip){this.$tip=$('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');this.$tip.data("tipsy-pointee",this.$element[0])}return this.$tip},validate:function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}},remove:function(){this.enabled=false;this.$tip&&this.$tip.remove()},enable:function(){this.enabled=true},disable:function(){this.enabled=false},toggleEnabled:function(){this.enabled=!this.enabled}};$.fn.tipsy=function(options){if(options===true){return this.data("tipsy")}else if(typeof options=="string"){var tipsy=this.data("tipsy");if(tipsy)tipsy[options]();return this}options=$.extend({},$.fn.tipsy.defaults,options);function get(ele){var tipsy=$.data(ele,"tipsy");if(!tipsy){tipsy=new Tipsy(ele,$.fn.tipsy.elementOptions(ele,options));$.data(ele,"tipsy",tipsy)}return tipsy}function enter(){var tipsy=get(this);tipsy.hoverState="in";if(options.delayIn==0){tipsy.show()}else{tipsy.fixTitle();setTimeout(function(){if(tipsy.hoverState=="in")tipsy.show()},options.delayIn)}}function leave(){var tipsy=get(this);tipsy.hoverState="out";if(options.delayOut==0){tipsy.hide()}else{setTimeout(function(){if(tipsy.hoverState=="out")tipsy.hide()},options.delayOut)}}if(!options.live)this.each(function(){get(this)});if(options.trigger!="manual"){var binder=options.live?"live":"bind",eventIn=options.trigger=="hover"?"mouseenter":"focus",eventOut=options.trigger=="hover"?"mouseleave":"blur";this[binder](eventIn,enter)[binder](eventOut,leave)}return this};$.fn.tipsy.defaults={className:null,delayIn:0,delayOut:0,fade:false,fallback:"",gravity:"n",html:false,live:false,offset:0,opacity:.8,title:"title",trigger:"hover"};$.fn.tipsy.revalidate=function(){$(".tipsy").each(function(){var pointee=$.data(this,"tipsy-pointee");if(!pointee||!isElementInDOM(pointee)){$(this).remove()}})};$.fn.tipsy.elementOptions=function(ele,options){return $.metadata?$.extend({},options,$(ele).metadata()):options};$.fn.tipsy.autoNS=function(){return $(this).offset().top>$(document).scrollTop()+$(window).height()/2?"s":"n"};$.fn.tipsy.autoWE=function(){return $(this).offset().left>$(document).scrollLeft()+$(window).width()/2?"e":"w"};$.fn.tipsy.autoBounds=function(margin,prefer){return function(){var dir={ns:prefer[0],ew:prefer.length>1?prefer[1]:false},boundTop=$(document).scrollTop()+margin,boundLeft=$(document).scrollLeft()+margin,$this=$(this);if($this.offset().top<boundTop)dir.ns="n";if($this.offset().left<boundLeft)dir.ew="w";if($(window).width()+$(document).scrollLeft()-$this.offset().left<margin)dir.ew="e";if($(window).height()+$(document).scrollTop()-$this.offset().top<margin)dir.ns="s";return dir.ns+(dir.ew?dir.ew:"")}}})(jQuery);(function(window){var HAS_HASHCHANGE=function(){var doc_mode=window.documentMode;return"onhashchange"in window&&(doc_mode===undefined||doc_mode>7)}();L.Hash=function(map,torque){this.onHashChange=L.Util.bind(this.onHashChange,this);if(map){this.init(map,torque)}};L.Hash.parseHash=function(hash){if(hash.indexOf("#")===0){hash=hash.substr(1)}var args=hash.split("/");if(args.length==5){var zoom=parseInt(args[1],10),lat=parseFloat(args[2]),lon=parseFloat(args[3]);var obj={};if(isNaN(zoom)||isNaN(lat)||isNaN(lon)){return false}else{obj={center:new L.LatLng(lat,lon),zoom:zoom}}obj.step=parseFloat(args[4]);if(!this.torque._last_step){this.torque._last_step=obj.step}return obj}else{return false}};L.Hash.formatHash=function(map,torque){var center=map.getCenter(),zoom=map.getZoom(),precision=Math.max(0,Math.ceil(Math.log(zoom)/Math.LN2)),step=torque._last_step||0;return"#/"+[zoom,center.lat.toFixed(precision),center.lng.toFixed(precision),step].join("/")},L.Hash.prototype={map:null,lastHash:null,parseHash:L.Hash.parseHash,formatHash:L.Hash.formatHash,init:function(map,torque){this.map=map;this.torque=torque;this.lastHash=null;this.onHashChange();if(!this.isListening){this.startListening()}},removeFrom:function(map){if(this.changeTimeout){clearTimeout(this.changeTimeout)}if(this.isListening){this.stopListening()}this.map=null},onMapMove:function(){if(this.movingMap||!this.map._loaded){return false}var hash=this.formatHash(this.map,this.torque);if(this.lastHash!=hash){location.replace(hash);this.lastHash=hash}},movingMap:false,update:function(){var hash=location.hash;if(hash===this.lastHash){return}var parsed=this.parseHash(hash);if(parsed){this.movingMap=true;this.map.setView(parsed.center,parsed.zoom);this.torque.setStep(parsed.step);this.movingMap=false}else{this.onMapMove(this.map)}},changeDefer:100,changeTimeout:null,onHashChange:function(){if(!this.changeTimeout){var that=this;this.changeTimeout=setTimeout(function(){that.update();that.changeTimeout=null},this.changeDefer)}},isListening:false,hashChangeInterval:null,startListening:function(){this.map.on("moveend",this.onMapMove,this);if(HAS_HASHCHANGE){L.DomEvent.addListener(window,"hashchange",this.onHashChange)}else{clearInterval(this.hashChangeInterval);this.hashChangeInterval=setInterval(this.onHashChange,50)}this.isListening=true},stopListening:function(){this.map.off("moveend",this.onMapMove,this);if(HAS_HASHCHANGE){L.DomEvent.removeListener(window,"hashchange",this.onHashChange)}else{clearInterval(this.hashChangeInterval)}this.isListening=false}};L.hash=function(map){return new L.Hash(map)};L.Map.prototype.addHash=function(){this._hash=L.hash(this)};L.Map.prototype.removeHash=function(){this._hash.removeFrom()}})(window);var torqueLayer;var count=1;function main(){cdb.vis.Overlay.register("match_slider",function(data,viz){data.template=$("#match_slider").html();var slider=new MatchSlider(data);return slider.render()});cdb.vis.Overlay.register("share",function(data,vis){if(location.href){data.share_url=encodeURIComponent(location.href)}else{data.share_url=data.url}var template=cdb.core.Template.compile(data.template||'          <div class="mamufas">            <div class="block modal {{modal_type}}">              <a href="#close" class="close">x</a>              <div class="head">                <h3>Share this map</h3>              </div>              <div class="content">                <div class="buttons">                  <h4>Social</h4>                  <ul>                    <li><a class="facebook" target="_blank" href="{{ facebook_url }}">Share on Facebook</a></li>                    <li><a class="twitter" href="{{ twitter_url }}" target="_blank">Share on Twitter</a></li>                    <li><a class="link" href="{{ public_map_url }}" target="_blank">Link to this map</a></li>                  </ul>                </div><div class="embed_code">                 <h4>Embed this map</h4>                 <textarea id="" name="" cols="30" rows="10">{{ code }}</textarea>               </div>              </div>            </div>          </div>        ',data.templateType||"mustache");var url=location.href;url=url.replace("public_map","embed_map");var public_map_url=url.replace("embed_map","public_map");var code="<iframe width='100%' height='520' frameborder='0' src='"+url+"' allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>";var dialog=new cdb.ui.common.ShareDialog({title:"Real Madrid v Atlético Madrid: how the #UCL final played out on Twitter",description:"Visualization about the amount of tweets during 2014 Champions League final between Real Madrid and Atlético de Madrid",model:vis.map,code:code,url:data.url,public_map_url:public_map_url,share_url:data.share_url,template:template,target:$(".cartodb-share a"),size:$(document).width()>400?"":"small",width:$(document).width()>400?430:216});return dialog.render()});cartodb.createVis("map","http://srogers.cartodb.com/api/v2/viz/a43ea07a-e3f2-11e3-92f9-0e230854a1cb/viz.json",{center_lat:24.5,center_lon:-7,zoom:2,time_slider:false,fullscreen:true}).done(function(vis,layers){vis.map.set({minZoom:1,maxZoom:10});var map=vis.getNativeMap();var layer=layers[2];var hash=new L.Hash(map,layer);var share=vis.addOverlay({type:"share",layer:layer});slider=vis.addOverlay({type:"match_slider",layer:layer});torqueLayer=layer;torqueLayer.stop();if(location.hash)++count;torqueLayer.on("load",onTorqueLoad);torqueLayer.on("change:time",checkTime)}).on("error",manageError)}function onTorqueLoad(){--count;torqueLayer.play();drawStartEnd();if(count===0)torqueLayer.off("load",onTorqueLoad)}function manageError(err,layer){$("#not_supported_dialog").show();var overlays=this.getOverlays();for(var i=0;i<overlays.length;++i){var o=overlays[i];o.hide&&o.hide()}}function checkTime(data){_.each(match_data.highlights,function(d,i){var block=d.team.indexOf("Atlético")!==-1?"atletico":"madrid";if(new Date(data.time)>=new Date(i)){if(!d.el){var div=$("<div>").addClass("highlight "+block);div.append($("<i>").addClass("icon "+d.type+" ").attr("data-tipsy",d.text).append(d.type));div.append($("<span>").addClass("line"));d.el=div;var pos=getHighlightPos(new Date(i).getTime());d.el.css({left:pos+"%"});$(".highlights").find("."+block+" .timeline").append(d.el);generateTooltip(d.el.find("i"));if(d.type==="goal"){var goals=parseInt($("em."+block).text());$("em."+block).text(++goals)}}d.el.show()}else{if(d.el&&d.type==="goal"){var goals=parseInt($("em."+block).text());$("em."+block).text(--goals)}if(d.el){d.el.hide();destroyTooltip(d.el.find("i"));d.el.remove();delete d.el}}})}function destroyTooltip($el){$el.unbind("click");var tipsy=$el.data("tipsy");if(tipsy.$tip){tipsy.$tip.remove()}}function generateTooltip($el){$el.tipsy({trigger:"manual",title:function(){return this.getAttribute("data-tipsy")+'<a href="" class="twitter">t</a><a href="" class="facebook">f</a>'},html:true,gravity:$.fn.tipsy.autoBounds(250,"s"),fade:true,delayIn:300,delayOut:750});$el.click(function(){var $i=$(this);$i.tipsy("show");setTimeout(function(){$i.data("tipsy").$tip.bind("mouseleave",function(){$i.tipsy("hide")})},600)})}function getHighlightPos(timestamp){var tb=torqueLayer.getTimeBounds();return(timestamp-tb.start)*100/(tb.end-tb.start)}function drawStartEnd(){if($(".icon.start").length>0){return false}var div=$("<div>").addClass("highlight");div.append($("<i>").addClass("icon start"));div.append($("<span>").addClass("separator"));div.append($("<p>").text(match_data.start.text));var pos=getHighlightPos(new Date(match_data.start.time).getTime());div.css({left:pos+"%"});$(".highlights .timeslider").find(".wrap_slider").append(div).append($("<span>").addClass("slider_mamufas start").css({left:0,width:pos+"%"}));var div=$("<div>").addClass("highlight");div.append($("<i>").addClass("icon end"));div.append($("<span>").addClass("separator"));div.append($("<p>").text(match_data.end.text));var pos=getHighlightPos(new Date(match_data.end.time).getTime());div.css({left:pos+"%"});$(".highlights .timeslider").find(".wrap_slider").append(div).append($("<span>").addClass("slider_mamufas end").css({right:0,left:pos+"%"}))}window.onload=main;var match_data={start:{time:"Sat May 24 2014 20:47:00 GMT+0000",text:"0'"},end:{time:"Sat May 24 2014 23:21:00 GMT+0000",text:"122'"},highlights:{"Sat May 24 2014 20:57:00 GMT+0000":{type:"substitution",text:"9' - <b>Adrian</b> replaces <b>Diego Costa</b>",team:"Atlético de Madrid"},"Sat May 24 2014 21:14:00 GMT+0000":{type:"yellow",text:"27' - <b>Raul García</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 21:14:00 GMT+0000":{type:"yellow",text:"27' - <b>Ramos</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 21:25:00 GMT+0000":{type:"goal",text:"36' - GOAL by <b>Godín</b>!",team:"Atlético de Madrid"},"Sat May 24 2014 21:32:00 GMT+0000":{type:"yellow",text:"45' +1 - <b>Khedira</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 21:56:00 GMT+0000":{type:"yellow",text:"53' - <b>Miranda</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:02:00 GMT+0000":{type:"substitution",text:"59' - Double substitution <b>Marcelo and Isco</b> replaces <b>F. Coentrao and Khedira</b>",team:"Real Madrid"},"Sat May 24 2014 22:10:00 GMT+0000":{type:"substitution",text:"66' - <b>José Sosa</b> replaces <b>Raul García</b>",team:"Atlético de Madrid"},"Sat May 24 2014 22:16:00 GMT+0000":{type:"yellow",text:"72' - <b>David Villa</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:18:00 GMT+0000":{type:"yellow",text:"74' - <b>Juanfran</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:23:00 GMT+0000":{type:"substitution",text:"79' - <b>Alvaro Morata</b> replaces <b>Karim Benzema</b>",team:"Real Madrid"},"Sat May 24 2014 22:26:00 GMT+0000":{type:"substitution",text:"83' - <b>Alderweireld</b> replaces <b>Filipe Luis</b>",team:"Atlético de Madrid"},"Sat May 24 2014 22:30:00 GMT+0000":{type:"yellow",text:"86' - <b>Koke</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 22:37:00 GMT+0000":{type:"goal",text:"90' +3 - GOAL by <b>Ramos</b>!",team:"Real Madrid"},"Sat May 24 2014 22:54:00 GMT+0000":{type:"yellow",text:"100' - <b>Gabi</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 23:09:00 GMT+0000":{type:"goal",text:"110' - GOAL by <b>Bale</b>!",team:"Real Madrid"},"Sat May 24 2014 23:16:00 GMT+0000":{type:"goal",text:"118' - GOAL by <b>Marcelo</b>!",team:"Real Madrid"},"Sat May 24 2014 23:17:00 GMT+0000":{type:"yellow",text:"119' - <b>Marcelo</b> is shown the yellow card",team:"Real Madrid"},"Sat May 24 2014 23:18:00 GMT+0000":{type:"yellow",text:"120' - <b>Godín</b> is shown the yellow card",team:"Atlético de Madrid"},"Sat May 24 2014 23:19:00 GMT+0000":{type:"goal",text:"121' - GOAL by <b>Cristiano</b>!",team:"Real Madrid"}}};var MatchSlider=cdb.geo.ui.TimeSlider.extend({defaultTemplate:"",initialize:function(){this.defaultTemplate=this.options.template;cdb.geo.ui.TimeSlider.prototype.initialize.call(this)}});(function($){var MOVE_OFFSET=6;function maybeCall(thing,ctx){return typeof thing=="function"?thing.call(ctx):thing}function isElementInDOM(ele){while(ele=ele.parentNode){if(ele==document)return true}return false}function Tipsy(element,options){this.$element=$(element);this.options=options;this.enabled=true;this.fixTitle()}Tipsy.prototype={show:function(){var title=this.getTitle();if(title&&this.enabled){var $tip=this.tip();$tip.find(".tipsy-inner")[this.options.html?"html":"text"](title);$tip[0].className="tipsy";$tip.remove().css({top:0,left:0,visibility:"hidden",display:"block"}).prependTo(document.body);if(this.options.className){$tip.addClass(maybeCall(this.options.className,this.$element[0]))}var pos=$.extend({},this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight});var actualWidth=$tip[0].offsetWidth,actualHeight=$tip[0].offsetHeight,gravity=maybeCall(this.options.gravity,this.$element[0]);var tp;switch(gravity.charAt(0)){case"n":tp={top:pos.top+pos.height+this.options.offset,left:pos.left+pos.width/2-actualWidth/2};mo={top:parseInt(pos.top+pos.height+this.options.offset+MOVE_OFFSET),opacity:this.options.opacity};break;case"s":tp={top:pos.top-actualHeight-this.options.offset,left:pos.left+pos.width/2-actualWidth/2};mo={top:parseInt(pos.top-actualHeight-this.options.offset-MOVE_OFFSET),opacity:this.options.opacity};break;case"e":tp={top:pos.top+pos.height/2-actualHeight/2,left:pos.left-actualWidth-this.options.offset};mo={left:parseInt(pos.left-actualWidth-this.options.offset-MOVE_OFFSET),opacity:this.options.opacity};break;case"w":tp={top:pos.top+pos.height/2-actualHeight/2,left:pos.left+pos.width+this.options.offset};mo={left:parseInt(pos.left+pos.width+this.options.offset+MOVE_OFFSET),opacity:this.options.opacity};break}if(gravity.length==2){if(gravity.charAt(1)=="w"){tp.left=pos.left+pos.width/2-15}else{tp.left=pos.left+pos.width/2-actualWidth+15}}$tip.css(tp).addClass("tipsy-"+gravity);$tip.find(".tipsy-arrow")[0].className="tipsy-arrow tipsy-arrow-"+gravity.charAt(0);if(this.options.fade){$tip.stop().css({opacity:0,display:"block",visibility:"visible"}).animate(mo,200)}else{$tip.css({visibility:"visible",opacity:this.options.opacity})}}},hide:function(){gravity=maybeCall(this.options.gravity,this.$element[0]);switch(gravity.charAt(0)){case"n":mo={top:parseInt(this.tip().css("top"))+MOVE_OFFSET,opacity:0};break;case"s":mo={top:parseInt(this.tip().css("top"))-MOVE_OFFSET,opacity:0};break;case"e":mo={left:parseInt(this.tip().css("left"))-MOVE_OFFSET,opacity:0};break;case"w":mo={left:parseInt(this.tip().css("left"))+MOVE_OFFSET,opacity:0};break}if(this.options.fade){this.tip().stop().animate(mo,200,function(){$(this).remove()})}else{this.tip().remove()}},fixTitle:function(){var $e=this.$element;if($e.attr("title")||typeof $e.attr("original-title")!="string"){$e.attr("original-title",$e.attr("title")||"").removeAttr("title")}},getTitle:function(){var title,$e=this.$element,o=this.options;this.fixTitle();var title,o=this.options;if(typeof o.title=="string"){title=$e.attr(o.title=="title"?"original-title":o.title)}else if(typeof o.title=="function"){title=o.title.call($e[0])}title=(""+title).replace(/(^\s*|\s*$)/,"");return title||o.fallback},tip:function(){if(!this.$tip){this.$tip=$('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');this.$tip.data("tipsy-pointee",this.$element[0])}return this.$tip},validate:function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}},remove:function(){this.enabled=false;this.$tip&&this.$tip.remove()},enable:function(){this.enabled=true},disable:function(){this.enabled=false},toggleEnabled:function(){this.enabled=!this.enabled}};$.fn.tipsy=function(options){if(options===true){return this.data("tipsy")}else if(typeof options=="string"){var tipsy=this.data("tipsy");if(tipsy)tipsy[options]();return this}options=$.extend({},$.fn.tipsy.defaults,options);function get(ele){var tipsy=$.data(ele,"tipsy");if(!tipsy){tipsy=new Tipsy(ele,$.fn.tipsy.elementOptions(ele,options));$.data(ele,"tipsy",tipsy)}return tipsy}function enter(){var tipsy=get(this);tipsy.hoverState="in";if(options.delayIn==0){tipsy.show()}else{tipsy.fixTitle();setTimeout(function(){if(tipsy.hoverState=="in")tipsy.show()},options.delayIn)}}function leave(){var tipsy=get(this);tipsy.hoverState="out";if(options.delayOut==0){tipsy.hide()}else{setTimeout(function(){if(tipsy.hoverState=="out")tipsy.hide()},options.delayOut)}}if(!options.live)this.each(function(){get(this)});if(options.trigger!="manual"){var binder=options.live?"live":"bind",eventIn=options.trigger=="hover"?"mouseenter":"focus",eventOut=options.trigger=="hover"?"mouseleave":"blur";this[binder](eventIn,enter)[binder](eventOut,leave)}return this};$.fn.tipsy.defaults={className:null,delayIn:0,delayOut:0,fade:false,fallback:"",gravity:"n",html:false,live:false,offset:0,opacity:.8,title:"title",trigger:"hover"};$.fn.tipsy.revalidate=function(){$(".tipsy").each(function(){var pointee=$.data(this,"tipsy-pointee");if(!pointee||!isElementInDOM(pointee)){$(this).remove()}})};$.fn.tipsy.elementOptions=function(ele,options){return $.metadata?$.extend({},options,$(ele).metadata()):options};$.fn.tipsy.autoNS=function(){return $(this).offset().top>$(document).scrollTop()+$(window).height()/2?"s":"n"};$.fn.tipsy.autoWE=function(){return $(this).offset().left>$(document).scrollLeft()+$(window).width()/2?"e":"w"};$.fn.tipsy.autoBounds=function(margin,prefer){return function(){var dir={ns:prefer[0],ew:prefer.length>1?prefer[1]:false},boundTop=$(document).scrollTop()+margin,boundLeft=$(document).scrollLeft()+margin,$this=$(this);if($this.offset().top<boundTop)dir.ns="n";if($this.offset().left<boundLeft)dir.ew="w";if($(window).width()+$(document).scrollLeft()-$this.offset().left<margin)dir.ew="e";if($(window).height()+$(document).scrollTop()-$this.offset().top<margin)dir.ns="s";return dir.ns+(dir.ew?dir.ew:"")}}})(jQuery);(function(window) {
  var HAS_HASHCHANGE = (function() {
    var doc_mode = window.documentMode;
    return ('onhashchange' in window) &&
      (doc_mode === undefined || doc_mode > 7);
  })();

  L.Hash = function(map, torque) {
    this.onHashChange = L.Util.bind(this.onHashChange, this);

    if (map) {
      this.init(map, torque);
    }
  };

  L.Hash.parseHash = function(hash) {
    if(hash.indexOf('#') === 0) {
      hash = hash.substr(1);
    }
    var args = hash.split("/");
    if (args.length == 5) {
      var zoom = parseInt(args[1], 10),
      lat = parseFloat(args[2]),
      lon = parseFloat(args[3]);
      var obj = {};

      if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
        return false;
      } else {
        obj = {
          center: new L.LatLng(lat, lon),
          zoom: zoom
        };
      }

      obj.step = parseFloat(args[4]);
      if (!this.torque._last_step) {
        this.torque._last_step = obj.step
      }

      return obj;
    } else {
      return false;
    }
  };


  L.Hash.formatHash = function(map,torque) {
    var center = map.getCenter(),
        zoom = map.getZoom(),
        precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2)),
        step = torque._last_step || 0;

    return "#/" + [zoom,
      center.lat.toFixed(precision),
      center.lng.toFixed(precision),
      step
    ].join("/");
  },

  L.Hash.prototype = {
    map: null,
    lastHash: null,

    parseHash: L.Hash.parseHash,
    formatHash: L.Hash.formatHash,

    init: function(map,torque) {
      this.map = map;
      this.torque = torque;

      // reset the hash
      this.lastHash = null;
      this.onHashChange();

      if (!this.isListening) {
        this.startListening();
      }
    },

    removeFrom: function(map) {
      if (this.changeTimeout) {
        clearTimeout(this.changeTimeout);
      }

      if (this.isListening) {
        this.stopListening();
      }

      this.map = null;
    },

    onMapMove: function() {
      // bail if we're moving the map (updating from a hash),
      // or if the map is not yet loaded

      if (this.movingMap || !this.map._loaded) {
        return false;
      }

      var hash = this.formatHash(this.map, this.torque);
      if (this.lastHash != hash) {
        location.replace(hash);
        this.lastHash = hash;
      }
    },

    movingMap: false,
    update: function() {
      var hash = location.hash;
      if (hash === this.lastHash) {
        return;
      }
      var parsed = this.parseHash(hash);
      if (parsed) {
        this.movingMap = true;

        this.map.setView(parsed.center, parsed.zoom);

        this.torque.setStep(parsed.step);

        this.movingMap = false;
      } else {
        this.onMapMove(this.map);
      }
    },

    // defer hash change updates every 100ms
    changeDefer: 100,
    changeTimeout: null,
    onHashChange: function() {
      // throttle calls to update() so that they only happen every
      // `changeDefer` ms
      if (!this.changeTimeout) {
        var that = this;
        this.changeTimeout = setTimeout(function() {
          that.update();
          that.changeTimeout = null;
        }, this.changeDefer);
      }
    },

    isListening: false,
    hashChangeInterval: null,
    startListening: function() {
      this.map.on("moveend", this.onMapMove, this);

      if (HAS_HASHCHANGE) {
        L.DomEvent.addListener(window, "hashchange", this.onHashChange);
      } else {
        clearInterval(this.hashChangeInterval);
        this.hashChangeInterval = setInterval(this.onHashChange, 50);
      }
      this.isListening = true;
    },

    stopListening: function() {
      this.map.off("moveend", this.onMapMove, this);

      if (HAS_HASHCHANGE) {
        L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
      } else {
        clearInterval(this.hashChangeInterval);
      }
      this.isListening = false;
    }
  };
  L.hash = function(map) {
    return new L.Hash(map);
  };
  L.Map.prototype.addHash = function() {
    this._hash = L.hash(this);
  };
  L.Map.prototype.removeHash = function() {
    this._hash.removeFrom();
  };
})(window);
  var URL = 'http://cartodb.github.io/lisbon-2014/#/';
  var SHARE_TEXT = 'Champions League 2014 Tweets - ';
  var torqueLayer;
  var map;
  var count = 1;

  function main() {
  
    cdb.vis.Overlay.register('match_slider', function(data, viz) {
      data.template = $('#match_slider').html(); 
      var slider = new MatchSlider(data);
      return slider.render();
    });

    // share content
    cdb.vis.Overlay.register('share', function(data, vis) {

      // Add the complete url for facebook and twitter
      if (location.href) {
        data.share_url = encodeURIComponent(location.href);
      } else {
        data.share_url = data.url;
      }

      var template = cdb.core.Template.compile(
        data.template || '\
          <div class="mamufas">\
            <div class="block modal {{modal_type}}">\
              <a href="#close" class="close">x</a>\
              <div class="head">\
                <h3>Share this map</h3>\
              </div>\
              <div class="content">\
                <div class="buttons">\
                  <h4>Social</h4>\
                  <ul>\
                    <li><a class="facebook" target="_blank" href="{{ facebook_url }}">Share on Facebook</a></li>\
                    <li><a class="twitter" href="{{ twitter_url }}" target="_blank">Share on Twitter</a></li>\
                    <li><a class="link" href="{{ public_map_url }}" target="_blank">Link to this map</a></li>\
                  </ul>\
                </div><div class="embed_code">\
                 <h4>Embed this map</h4>\
                 <textarea id="" name="" cols="30" rows="10">{{ code }}</textarea>\
               </div>\
              </div>\
            </div>\
          </div>\
        ',
        data.templateType || 'mustache'
      );

      var url = location.href;

      url = url.replace("public_map", "embed_map");

      var public_map_url = url.replace("embed_map", "public_map"); // TODO: get real URL

      var code = "<iframe width='100%' height='520' frameborder='0' src='" + url + "' allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>";

      var dialog = new cdb.ui.common.ShareDialog({
        title:        "Real Madrid v Atlético Madrid: how the #UCL final played out on Twitter",
        description:  "Visualization about the amount of tweets during 2014 Champions League final between Real Madrid and Atlético de Madrid",
        model: vis.map,
        code: code,
        url: data.url,
        public_map_url: public_map_url,
        share_url: data.share_url,
        template: template,
        target: $(".cartodb-share a"),
        size: $(document).width() > 400 ? "" : "small",
        width: $(document).width() > 400 ? 430 : 216
      });

      return dialog.render();

    });





    cartodb.createVis('map', 'http://srogers.cartodb.com/api/v2/viz/a43ea07a-e3f2-11e3-92f9-0e230854a1cb/viz.json', {
      center_lat: 24.5,
      center_lon: -7,
      zoom: 2,
      time_slider: false,
      fullscreen: true
    })
      .done(function(vis, layers) {

        vis.map.set({
          minZoom: 1,
          maxZoom: 10
        });

        map = vis.getNativeMap();
        var layer = layers[2];

        var hash = new L.Hash(map, layer);

        var share = vis.addOverlay({
          type: 'share',
          layer: layer
        })

        slider = vis.addOverlay({
          type: 'match_slider',
          layer: layer
        });
        
        torqueLayer = layer;
        torqueLayer.stop();

        if (location.hash) ++count

        torqueLayer.on('load', onTorqueLoad);
        torqueLayer.on('change:time', checkTime);
      })
      .on('error', manageError);
  }

  function onTorqueLoad() {
    --count;
    torqueLayer.play();
    drawStartEnd();
    if (count === 0) torqueLayer.off('load', onTorqueLoad)
  }

  function manageError(err, layer) {
    $('#not_supported_dialog').show();
    // hide all the overlays
    var overlays = this.getOverlays()
    for (var i = 0; i < overlays.length; ++i) {
      var o = overlays[i];
      o.hide && o.hide();
    }
  }

  function checkTime(data) {

    _.each(match_data.highlights, function(d,i) {
      
      // Block
      var block = d.team.indexOf('Atlético') !== -1 ? 'atletico' : 'madrid';

      if (new Date(data.time) >= new Date(i)) {
        
        if (!d.el) {

          var div = $('<div>').addClass('highlight ' + block);

          div.append($('<i>')
              .addClass("icon " + d.type + " ")
              .attr('data-tipsy', d.text)
              .append(d.type));
          
          div.append($('<span>').addClass('line'));

          d.el = div;

          var pos = getHighlightPos(new Date(i).getTime());

          // Position
          d.el.css({
            left: pos + "%"
          });

          $('.highlights').find('.' + block + ' .timeline').append(d.el);

          generateTooltip(d, i);

          if (d.type === "goal") {
            var goals = parseInt($('em.' + block).text());
            $('em.' + block).text(++goals);
          }
        }

        d.el.show();
      } else {
        
        if (d.el && d.type === "goal") {
          var goals = parseInt($('em.' + block).text());
          $('em.' + block).text(--goals);
        }

        if (d.el) {
          d.el.hide();
          destroyTooltip(d.el.find('i'));
          d.el.remove();

          delete d.el;
        }
      }
      
    })
  }

  function destroyTooltip($el) {
    $el.unbind('click');
    var tipsy = $el.data('tipsy');
    if (tipsy.$tip) {
      tipsy.$tip.remove();
    }
  }

  function closeTipsys() {
    $('i').each(function() {
      if ($(this).data('tipsy')) {
        $(this).tipsy('hide');
      }
    });
  }

  function getURL(timestamp) {
    var tb = torqueLayer.getTimeBounds();
    var step = Math.floor(((timestamp-tb.start)*tb.steps)/(tb.end-tb.start));
    var center = map.getCenter();
    return encodeURIComponent(URL + map.getZoom() + "/" + center.lat + "/" + center.lng + "/" + step)
  }

  function getShareText(d) {
    return SHARE_TEXT + d.text.replace(/<(?:.|\n)*?>/gm, '');
  }

  function generateTooltip(d, t) {

    var $el = d.el.find('i')
    var url = getURL(new Date(t).getTime());
    
    $el.tipsy({
      trigger:  'manual',
      title:    function() {
        return this.getAttribute('data-tipsy') +
        '<div class="highlight-share">' + 
        '<p>Share this moment</p>' + 
        '<span class="buttons">' +
        '<a target="_blank" href="http://www.facebook.com/sharer.php?u=' + url + '&text=' + getShareText(d) + '" class="facebook"></a>'+
        '<a target="_blank" href="https://twitter.com/share?url=' + url + '&text=' + getShareText(d) + '" class="twitter"></a>'+
        '</span>'+
        '</div>'
      },
      html:     true,
      gravity:  $.fn.tipsy.autoBounds(250, 's'),
      fade:     true,
      delayIn:  300,
      delayOut: 750
    })

    $el.click(function(){
      closeTipsys();

      var $i = $(this);
      $i.tipsy('show');
      
      setTimeout(function() {
        $i.data('tipsy').$tip.bind('mouseleave', function(){
          $i.tipsy('hide');
        });
      },600);
    })
  }

  function getHighlightPos(timestamp)  {
    var tb = torqueLayer.getTimeBounds();
    return ((timestamp-tb.start)*100)/(tb.end-tb.start);
  }

  function drawStartEnd() {

    if ($('.icon.start').length > 0) {
      return false;
    }

    // Draw start
    var div = $('<div>').addClass('highlight');
    div.append($('<i>').addClass("icon start"));
    div.append($('<span>').addClass('separator'));
    div.append($('<p>').text(match_data.start.text));
    var pos = getHighlightPos(new Date(match_data.start.time).getTime());
    
    div.css({ left: pos + "%" });
    $('.highlights .timeslider').find('.wrap_slider')
      .append(div)
      .append(
        $('<span>')
          .addClass('slider_mamufas start')
          .css({
            left: 0,
            width: pos + '%'
          })
      );

    // Draw end
    var div = $('<div>').addClass('highlight');
    div.append($('<i>').addClass("icon end"));
    div.append($('<span>').addClass('separator'));
    div.append($('<p>').text(match_data.end.text));
    var pos = getHighlightPos(new Date(match_data.end.time).getTime());
    
    div.css({ left: pos + "%" });
    $('.highlights .timeslider').find('.wrap_slider')
      .append(div)
      .append(
        $('<span>')
          .addClass('slider_mamufas end')
          .css({
            right: 0,
            left: pos + "%"
          })
      );
  }

  window.onload = main;
  var match_data = {

    start:  {
      time: 'Sat May 24 2014 20:47:00 GMT+0000',
      text: '0\''
    },

    end: {
      time: 'Sat May 24 2014 23:21:00 GMT+0000',
      text:  '122\''
    },

    highlights: {
      'Sat May 24 2014 20:57:00 GMT+0000': {
        type: 'substitution',
        text: '9\' - <b>Adrian</b> replaces <b>Diego Costa</b>',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 21:14:00 GMT+0000': {
        type: 'yellow',
        text: '27\' - <b>Raul García</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 21:14:00 GMT+0000': {
        type: 'yellow',
        text: '27\' - <b>Ramos</b> is shown the yellow card',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 21:25:00 GMT+0000': {
        type: 'goal',
        text: '36\' - GOAL by <b>Godín</b>!',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 21:32:00 GMT+0000': {
        type: 'yellow',
        text: '45\' +1 - <b>Khedira</b> is shown the yellow card',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 21:56:00 GMT+0000': {
        type: 'yellow',
        text: '53\' - <b>Miranda</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:02:00 GMT+0000': {
        type: 'substitution',
        text: '59\' - Double substitution <b>Marcelo and Isco</b> replaces <b>F. Coentrao and Khedira</b>',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 22:10:00 GMT+0000': {
        type: 'substitution',
        text: '66\' - <b>José Sosa</b> replaces <b>Raul García</b>',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:16:00 GMT+0000': {
        type: 'yellow',
        text: '72\' - <b>David Villa</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:18:00 GMT+0000': {
        type: 'yellow',
        text: '74\' - <b>Juanfran</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:23:00 GMT+0000': {
        type: 'substitution',
        text: '79\' - <b>Alvaro Morata</b> replaces <b>Karim Benzema</b>',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 22:26:00 GMT+0000': {
        type: 'substitution',
        text: '83\' - <b>Alderweireld</b> replaces <b>Filipe Luis</b>',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:30:00 GMT+0000': {
        type: 'yellow',
        text: '86\' - <b>Koke</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 22:37:00 GMT+0000': {
        type: 'goal',
        text: '90\' +3 - GOAL by <b>Ramos</b>!',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 22:54:00 GMT+0000': {
        type: 'yellow',
        text: '100\' - <b>Gabi</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 23:09:00 GMT+0000': {
        type: 'goal',
        text: '110\' - GOAL by <b>Bale</b>!',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 23:16:00 GMT+0000': {
        type: 'goal',
        text: '118\' - GOAL by <b>Marcelo</b>!',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 23:17:00 GMT+0000': {
        type: 'yellow',
        text: '119\' - <b>Marcelo</b> is shown the yellow card',
        team: 'Real Madrid'
      },

      'Sat May 24 2014 23:18:00 GMT+0000': {
        type: 'yellow',
        text: '120\' - <b>Godín</b> is shown the yellow card',
        team: 'Atlético de Madrid'
      },

      'Sat May 24 2014 23:19:00 GMT+0000': {
        type: 'goal',
        text: '121\' - GOAL by <b>Cristiano</b>!',
        team: 'Real Madrid'
      }
    }
  }
  var MatchSlider = cdb.geo.ui.TimeSlider.extend({

    defaultTemplate: '',

    initialize: function() {
      this.defaultTemplate = this.options.template;
      cdb.geo.ui.TimeSlider.prototype.initialize.call(this)
    }

  });// tipsy, facebook style tooltips for jquery with fancy fading
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com] and modificated by Sergio Alvarez @saleiva
// released under the MIT license
//
//  Changes:
//  June 3 2013: Added the custom class before the calc of the position. @javier

(function($) {

  var MOVE_OFFSET = 6;

  function maybeCall(thing, ctx) {
    return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
  };

  function isElementInDOM(ele) {
    while (ele = ele.parentNode) {
      if (ele == document) return true;
    }
    return false;
  };

  function Tipsy(element, options) {
    this.$element = $(element);
    this.options = options;
    this.enabled = true;
    this.fixTitle();
  };

  Tipsy.prototype = {
    show: function() {
      var title = this.getTitle();
      if (title && this.enabled) {
        var $tip = this.tip();

        $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
            $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
            $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);

            // Modified by @javier so we can use custom class names
            if (this.options.className) {
              $tip.addClass(maybeCall(this.options.className, this.$element[0]));
            }

            //  Fixed by Arce
            var pos = $.extend({}, this.$element.offset(), {
              width: this.$element[0].offsetWidth,
              height: this.$element[0].offsetHeight
            });

            var actualWidth = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight,
            gravity = maybeCall(this.options.gravity, this.$element[0]);

            var tp;
            switch (gravity.charAt(0)) {
              case 'n':
              tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
              mo = {top: parseInt(pos.top + pos.height + this.options.offset + MOVE_OFFSET), opacity: this.options.opacity};
              break;
              case 's':
              tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
              mo = {top: parseInt(pos.top - actualHeight - this.options.offset - MOVE_OFFSET), opacity: this.options.opacity};
              break;
              case 'e':
              tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
              mo = {left: parseInt(pos.left - actualWidth - this.options.offset - MOVE_OFFSET), opacity: this.options.opacity};
              break;
              case 'w':
              tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
              mo = {left: parseInt(pos.left + pos.width + this.options.offset + MOVE_OFFSET), opacity: this.options.opacity};
              break;
            }

            if (gravity.length == 2) {
              if (gravity.charAt(1) == 'w') {
                tp.left = pos.left + pos.width / 2 - 15;
              } else {
                tp.left = pos.left + pos.width / 2 - actualWidth + 15;
              }
            }

            $tip.css(tp).addClass('tipsy-' + gravity);
            $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);

            if (this.options.fade) {
              $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate(mo, 200);
            } else {
              $tip.css({visibility: 'visible', opacity: this.options.opacity});
            }
          }
        },

        hide: function() {

          gravity = maybeCall(this.options.gravity, this.$element[0]);

          switch (gravity.charAt(0)) {
            case 'n':
            mo = {top: parseInt(this.tip().css("top")) + MOVE_OFFSET, opacity: 0};
            break;
            case 's':
            mo = {top: parseInt(this.tip().css("top")) - MOVE_OFFSET, opacity: 0};
            break;
            case 'e':
            mo = {left: parseInt(this.tip().css("left")) - MOVE_OFFSET, opacity: 0};
            break;
            case 'w':
            mo = {left: parseInt(this.tip().css("left")) + MOVE_OFFSET, opacity: 0};
            break;
          }

          if (this.options.fade) {
            this.tip().stop().animate(mo, 200, function(){$(this).remove();});
          } else {
            this.tip().remove();
          }
        },

        fixTitle: function() {
          var $e = this.$element;
          if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
            $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
          }
        },

        getTitle: function() {
          var title, $e = this.$element, o = this.options;
          this.fixTitle();
          var title, o = this.options;
          if (typeof o.title == 'string') {
            title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
          } else if (typeof o.title == 'function') {
            title = o.title.call($e[0]);
          }
          title = ('' + title).replace(/(^\s*|\s*$)/, "");
          return title || o.fallback;
        },

        tip: function() {
          if (!this.$tip) {
            this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            this.$tip.data('tipsy-pointee', this.$element[0]);
          }
          return this.$tip;
        },

        validate: function() {
          if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options = null;
          }
        },

        remove: function() { this.enabled = false; this.$tip && this.$tip.remove(); },
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
      };

      $.fn.tipsy = function(options) {

        if (options === true) {
          return this.data('tipsy');
        } else if (typeof options == 'string') {
          var tipsy = this.data('tipsy');
          if (tipsy) tipsy[options]();
          return this;
        }

        options = $.extend({}, $.fn.tipsy.defaults, options);

        function get(ele) {
          var tipsy = $.data(ele, 'tipsy');
          if (!tipsy) {
            tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
            $.data(ele, 'tipsy', tipsy);
          }
          return tipsy;
        }

        function enter() {
          var tipsy = get(this);
          tipsy.hoverState = 'in';
          if (options.delayIn == 0) {
            tipsy.show();
          } else {
            tipsy.fixTitle();
            setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
          }
        };

        function leave() {
          var tipsy = get(this);
          tipsy.hoverState = 'out';
          if (options.delayOut == 0) {
            tipsy.hide();
          } else {
            setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
          }
        };

        if (!options.live) this.each(function() { get(this); });

        if (options.trigger != 'manual') {
          var binder   = options.live ? 'live' : 'bind',
          eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
          eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
          this[binder](eventIn, enter)[binder](eventOut, leave);
        }

        return this;

      };

      $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
      };

      $.fn.tipsy.revalidate = function() {
        $('.tipsy').each(function() {
          var pointee = $.data(this, 'tipsy-pointee');
          if (!pointee || !isElementInDOM(pointee)) {
            $(this).remove();
          }
        });
      };

    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
      return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };

    $.fn.tipsy.autoNS = function() {
      return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };

    $.fn.tipsy.autoWE = function() {
      return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };

    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
      return function() {
       var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
       boundTop = $(document).scrollTop() + margin,
       boundLeft = $(document).scrollLeft() + margin,
       $this = $(this);

       if ($this.offset().top < boundTop) dir.ns = 'n';
       if ($this.offset().left < boundLeft) dir.ew = 'w';
       if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
       if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

       return dir.ns + (dir.ew ? dir.ew : '');
     }
   };

 })(jQuery);
