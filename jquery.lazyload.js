/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2009 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.5.0
 *
 *
 * UPDATE 11 Oct 2011: Cyril (www.yatahonga.com)
 * With the update it really delays the image loading from server (no HTTP request before appearing) and HTML code remains XHTML 1.0 / 1.1 valid
 * Usage: 
 * 	src: your "preloading" image
 * 	title: URL of the image
 * Example:
 *	<img src="img/load.gif" alt="Beautiful Sunrise" title="data/images/sunrise.jpg" />
 */
(function($) {

    $.fn.lazyload = function(options) {
        var settings = {
            threshold    : 100,
            failurelimit : 0,
            event        : "scroll",
            effect       : "fadeIn",
			effectspeed  : 400,
            container    : window
        };
                
        if (options) {
            $.extend(settings, options);
        }

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        var elements = this;
        if ("scroll" == settings.event) {
            $(settings.container).bind("scroll", function(event) {
                
                var counter = 0;
                elements.each(function() {
					var self = $(this);
					
					if (! (this.loaded) && ! (this.worked)) {
					  if ($.abovethetop(self, settings) ||
						  $.leftofbegin(self, settings)) {
							  /* Nothing. */
					  } else if (!$.belowthefold(self, settings) &&
						  !$.rightoffold(self, settings)) {
							  self.trigger("appear");
					  } else {
						  if (counter++ > settings.failurelimit) {
							  return false;
						  }
					  }
					}
                });
                /* Remove image from array so it is not looped next time. */
                var temp = $.grep(elements, function(element) {
                    return !element.loaded;
                });
                elements = $(temp);
            });
        }
        
        this.each(function() {
            var self = $(this);
			
            /* Save original only if it is not defined in HTML. */
            if (undefined == self.attr("original")) {
                self.attr("original", self.attr("title"));
            }

            if ("scroll" != settings.event || 
                    (undefined == self.attr("src") || '' == self.attr("src")) || 
                    settings.placeholder == self.attr("src") || 
                    ($.abovethetop(self, settings) ||
                     $.leftofbegin(self, settings) || 
                     $.belowthefold(self, settings) || 
                     $.rightoffold(self, settings) )) {

                        
                if (settings.placeholder) {
                    self.attr("src", settings.placeholder);      
                }/* else {
                    self.removeAttr("src");
                }*/
                this.loaded = false;
            } else {
                this.loaded = true;
            }
            
            this.worked = false;
            
            /* When appear is triggered load original image. */
            self.one("appear", function() {
                if (!this.loaded && !this.worked) {
					this.worked = true;
					
                    $("<img />")
                        .bind("load", function() {
                            self
                                .hide()
                                .attr("src", self.attr("original"))
                                [settings.effect](settings.effectspeed);
                            self[0].loaded = true;
                        })
                        .attr("src", self.attr("original"));
                };
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if ("scroll" != settings.event) {
                self.bind(settings.event, function(event) {
                    if (!self.loaded) {
                        self.trigger("appear");
                    }
                });
            }
        });
        
        /* Force initial check if images should appear. */
        $(settings.container).trigger(settings.event);
        
        return this;

    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var fold = $(window).height() + $(window).scrollTop();
        } else {
            var fold = $(settings.container).offset().top + $(settings.container).height();
        }
        return fold <= element.offset().top - settings.threshold;
    };
    
    $.rightoffold = function(element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var fold = $(window).width() + $(window).scrollLeft();
        } else {
            var fold = $(settings.container).offset().left + $(settings.container).width();
        }
        return fold <= element.offset().left - settings.threshold;
    };
        
    $.abovethetop = function(element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var fold = $(window).scrollTop();
        } else {
            var fold = $(settings.container).offset().top;
        }
        return fold >= element.offset().top + settings.threshold  + element.height();
    };
    
    $.leftofbegin = function(element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var fold = $(window).scrollLeft();
        } else {
            var fold = $(settings.container).offset().left;
        }
        return fold >= element.offset().left + settings.threshold + element.width();
    };
    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() */

    $.extend($.expr[':'], {
        "below-the-fold" : function(a,i,m) { return $.belowthefold($(a), {threshold : 0, container: window} )},                                                                                                                                                                                                                 
        "above-the-fold" : function(a,i,m) { return !$.belowthefold($(a), {threshold : 0, container: window} )},                                                                                                                                                                                                                
        "right-of-fold"  : function(a,i,m) { return $.rightoffold($(a), {threshold : 0, container: window} )},                                                                                                                                                                                                                  
        "left-of-fold"   : function(a,i,m) { return !$.rightoffold($(a), {threshold : 0, container: window} )} 
    });
    
})(jQuery);
