/* RestMap
 *
 * SVG地图工具
 * 支持三级缩放、拖拽、双击缩放、提示图层；
 * 支持移动端、PAD、PC；
 * 支持IE10+ 、Firefox 、safari 8.0+ 、 Chrome等主流浏览器
 * auther LSY
 * */
;(function($) {
	"use strict";
	var RestMap = function(element){
		var self = this;
			self.e = element;
			self.mapdiv = self.e.children(".map-image");
			self.mapdiv.lastPos={x:0,y:0}
			self.move = {};
			self.resource = {};
			self.mapdiv.ratio = 1;

		self.init = function(options){

			self.resource = $.extend(self.resource, options);
			self.mapdiv.ratio =self.resource.levelData[0].w/self.resource.levelData[0].h;

			//强制初始化为浏览器大小
			var w = $(window).width();
			var h = $(window).height();

			if(self.resource.level ==1){
				self.mapdiv.level = 1;
				self.att = {w:w,h:h};
			}else if(self.resource.level ==2){
				self.mapdiv.level = 2;
				self.att = self.resource.levelData[1];
			}else{
				self.mapdiv.level = 3;
				self.att = self.resource.levelData[0];
			}


			if((w/h)< self.mapdiv.ratio){
				self.att = {
					w:self.att.h*self.mapdiv.ratio,
					h:self.att.h
				}
			}else{
				self.att = {
					w:self.att.w,
					h:self.att.w/self.mapdiv.ratio
				}
			}

			if(!self.tools){
				self.tools = $("<div></div>").addClass("map-tools").appendTo(self.mapdiv);
				self.resource.tips.forEach(function(o){
					var tip = $('<div><span class="map-tools-tip">'+o.title+'</span><div class="map-tools-content"><p>'+o.content.title+'</p><div>'+o.content.txt+'</div></div></div>').appendTo(self.tools);
					tip.css({
						left:(o.position.x*100)+"%",
						top:(o.position.y*100)+"%"
					})
					tip.attr('target',o.classname);
				})

			}
			$("body").on("hover",".map-tools-tip",function(e){
				e.stopPropagation();
				var t = $(this);
				var p = t.parent("div");
				if(p.hasClass("active")){return}
				p.addClass("active").siblings().removeClass("active");
			})
			$("body").on("click",".map-tools-tip",function(e){
				e.stopPropagation();
				var t = $(this);
				var p = t.parent("div");
				if(p.hasClass("active")){return}
				p.addClass("active").siblings().removeClass("active");
			})
			self.position();
		}

		$(window).resize(function() {
			self.init();
		})
		self.scale = function(e){

			//console.log(e);

			var t = new Date().getTime();

			if(self.mapdiv.time &&  t- self.mapdiv.time <500){
				return;
			}else{
				self.mapdiv.time = new Date().getTime();
			}


			var layerX = Math.abs(parseFloat(self.mapdiv.css("left"))-e.pageX);
			var layerY = Math.abs(parseFloat(self.mapdiv.css("top"))-e.pageY);

			//console.log(e,e.pageX);

			var x = layerX/self.att.w;
			var y = layerY/self.att.h;
			//console.log(layerY,self.att.h);

			var w = $(window).width();
			var h = $(window).height();

			if(e.wheelDelta > 0 || e.detail < 0){

				if(self.mapdiv.level == 3){return;}

				if(self.mapdiv.level == 1){
					self.att = self.resource.levelData[1];
					self.mapdiv.level = 2;
				}else{
					self.att = self.resource.levelData[0];
					self.mapdiv.level = 3
				}

				var left = (self.att.w*x - e.pageX);
				var top = (self.att.h*y - e.pageY);

				self.position(-left,-top,'scale');


			}else{

				if(self.mapdiv.level == 1){return;}
				if(self.mapdiv.level == 2){
					self.mapdiv.level =1;
					self.att = {w:w,h:h};
				}
				if(self.mapdiv.level == 3){
					self.mapdiv.level =2;
					self.att = self.resource.levelData[1];
				}

				if((w/h)<= self.mapdiv.ratio){
					self.att = {
						w:self.att.h*self.mapdiv.ratio,
						h:self.att.h
					}
				}else{
					self.att = {
						w:self.att.w,
						h:self.att.w/self.mapdiv.ratio
					}
				}

				if(self.att.w == w || self.att.h == h ){
					self.mapdiv.lastPos.x = 0;
					self.mapdiv.lastPos.y = 0;
				}

				var left = (self.att.w*x - e.pageX);
				var top = (self.att.h*y - e.pageY);
				//console.log(x,y);

				self.position(-left,-top,'scale');

			}


		}
		self.position = function(x,y,scale){

			var w = $(window).width();
			var h = $(window).height();

			if(x!=null&&y!=null){

				if(Math.abs(self.att.w - w) < Math.abs(x)) x = -(self.att.w - w);
				if(Math.abs(self.att.h - h) < Math.abs(y)) y = -(self.att.h - h);

				x = x>0?0:x;
				y = y>0?0:y;

				self.mapdiv.lastPos= {
					x:x,
					y:y
				}

				if(scale){
					self.mapdiv.animate({
						width:self.att.w+"px",
						height:self.att.h+"px",
						left:x+"px",
						top:y+"px",
					})
				}else{
					self.mapdiv.css({
						width:self.att.w+"px",
						height:self.att.h+"px",
						left:x+"px",
						top:y+"px",
					})
				}

				return true;
			}

			self.mapdiv.css({
				width:self.att.w+"px",
				height:self.att.h+"px",
				left:-(self.att.w - w)/2+"px",
				top:-(self.att.h - h)/2+"px",
				'position':'absolute',
				'cursor':'hand'
			})

			self.mapdiv.lastPos= {
				x:-(self.att.w - w)/2,
				y:-(self.att.h - h)/2
			}

		}


		//绑定鼠标滚轮操作
		self.mapdiv.on("mousewheel",function(e){
			self.scale(e.originalEvent);
		})

		//修复firefox鼠标BUG
		self.mapdiv[0].addEventListener("DOMMouseScroll", function(e) {
		   self.scale(e);
		});

		//绑定鼠标拖动操作
		self.mapdiv.on('mousedown', function(e) {
			document.ondragstart = function() { return false; } // IE fireFox drag fix
			self.move = {x:e.pageX,y:e.pageY}
			self.dragging = false;

			self.mapdiv.on("mousemove",function(e){
				self.mapdiv.addClass("dragging");
				var x = e.pageX-self.move.x;
				var y =e.pageY-self.move.y;

				if(!self.position(self.mapdiv.lastPos.x+x,self.mapdiv.lastPos.y+y)){
					return;
				};

				self.mapdiv.lastPos= {
					x:self.mapdiv.lastPos.x+x,
					y:self.mapdiv.lastPos.y+y
				}
				self.move = {x:e.pageX,y:e.pageY}
				self.dragging = true;

			})
		})
		//取消绑定
		self.mapdiv.on('mouseup', function() {
			if(!self.dragging){
				$(".map-tools-content").parent("div").removeClass("active");
			}
			self.dragging = false;
			self.mapdiv.off('mousemove');
			self.mapdiv.removeClass("dragging");
		});

		//绑定移动端拖动操作
		self.mapdiv.on('touchstart', function(e) {
			//e.preventDefault();
			var _touch = e.originalEvent.targetTouches[0];

			var x = Math.abs(_touch.pageX-self.move.x||0);
			var y = Math.abs(_touch.pageY-self.move.y||0);

			if(e.originalEvent.targetTouches.length>1){return;} //取消多点触控

			if(self.timeStamp && e.timeStamp - self.timeStamp < 300 && x<10 && y<10 ){
				//doubleTouch
				if(self.mapdiv.level !=3 ){
					_touch.wheelDelta = 120;
				}else{
					_touch.wheelDelta = -120;
				}

				self.timeStamp = e.timeStamp;
				self.move = {x:_touch.pageX,y:_touch.pageY};

				self.mapdiv.level = 2; //移动端只能最大，最小缩放
				self.scale(_touch);
				return;
			}
			self.timeStamp = e.timeStamp;
			self.move = {x:_touch.pageX,y:_touch.pageY};
			self.mapdiv.addClass("dragging");
			self.dragging = false;
			self.mapdiv.on("touchmove",function(e){
				e.preventDefault();
				self.dragging = true;
				if(e.originalEvent.targetTouches.length>1){
					self.mapdiv.off('touchmove');
					return;
				}
				var _mtouch = e.originalEvent.targetTouches[0];
				var x = _mtouch.pageX-self.move.x;
				var y =_mtouch.pageY-self.move.y;

				if(!self.position(self.mapdiv.lastPos.x+x,self.mapdiv.lastPos.y+y)){
					return;
				};

				self.mapdiv.lastPos= {
					x:self.mapdiv.lastPos.x+x,
					y:self.mapdiv.lastPos.y+y
				}
				self.move = {x:_mtouch.pageX,y:_mtouch.pageY}


			})
		})
		//绑定移动端拖动操作
		self.mapdiv.on('touchend', function() {
			if(!self.dragging){
				$(".map-tools-content").parent("div").removeClass("active");
			}
			self.dragging = false;
			self.mapdiv.off('touchmove');
			self.mapdiv.removeClass("dragging");
		});

	}


	// jQuery Plugin
	$.fn.restmap = function(basic) {
		return this.each(function() {
			var element = $(this);
			var instance = (new RestMap(element)).init(basic);

		});
	};

})(jQuery);