var lowOrbit = (function (window, document, $) {
	var stats,
		vm,
		slide_no = 1;

	var lowOrbit = function () {
		var self = this;
		
		self.bindViewModel();
	};

	ko.extenders.numeric = function(target, precision) {
		var result = ko.dependentObservable({
	        read: function() {
	           	return target().toFixed(precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
	        },
	        write: target 
	    });

	    result.raw = target;
	    return result;
	};

	ko.extenders.time = function(target, stub) {
		var result = ko.dependentObservable({
	        read: function() {
    			return moment.unix(target()).format("hh:mm:ss a");
	        },
	        write: target 
	    });

	    result.raw = target;
	    return result;
	};

	var ViewModel = function(stats, lo) {
		var self = this;
		this.latitude = ko.observable(stats.latitude).extend({ numeric: 2 });
	    this.longitude = ko.observable(stats.longitude).extend({ numeric: 2 });
	    this.altitude = ko.observable(stats.altitude).extend({ numeric: 2 });
	    this.velocity = ko.observable(stats.velocity).extend({ numeric: 2 });
	    this.timestamp = ko.observable(stats.timestamp).extend({ time: true });
	    this.astronauts = ko.observableArray(stats.astronauts);
	    
	    this.displayType = ko.observable('largeHUDTemplate');
	    this.backgroundType =  ko.observable(stats.visibility != 'eclipsed' ? 'streamTemplate' : 'videoTemplate');
	    this.currentTemplate = ko.observable('issTemplate');

		this.location = ko.observable('Ocean');
		this.interval = null;

		ko.computed(function() {
			$.ajax({
				type: "GET",
				dataType: "json",
				url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDPCYl0Dyk03vGAAKAwRvzElBczHCeubYA&latlng='+self.latitude.raw()+','+self.longitude.raw()+'&sensor=true',
				success: function(data) {
					$.each(data['results'], function(index, result) {
						$.each(result['address_components'], function(index, component) {
							if ($.inArray('country', component['types']) > -1) {
								self.location(component);
							}
						});
					});
			  	}
			});
	    }, this).extend({ rateLimit: 60000 });

	    this.initUI = function() {
	    	lo.setContent();
	    }

	    this.initBackground = function() {
	    	if (self.backgroundType() == 'galleryTemplate') {
	    		self.interval = setInterval(lo.rotateSlide, 10000);
		    } else {
		    	clearInterval(self.interval);
		    }

		    if (self.backgroundType() == 'videoTemplate') {
		    	//TODO: Mute
		    }
	    }

	    this.changeView = function(event, template) {
	    	self.currentTemplate(template);
	    }

	    this.changeDisplay = function(event, display) {
	    	self.displayType(display);
	    }

	    this.changeBackground = function(event, background) {
	    	self.backgroundType(background);
	    }
	};
 
	lowOrbit.prototype = {
	    constructor: lowOrbit,
		getStats: function(success) {
			var self = this;

			return $.ajax({
				type: "GET",
				dataType: "json",
				url: '/stats',
				success: function(data) {
					success(data);
			  	}
			});
		},
		getAstronauts: function(success) {
			var self = this;

			return $.ajax({
				type: "GET",
				dataType: "json",
				url: '/astronauts',
				success: function(data) {
					success(data);
			  	}
			});
		},
		bindViewModel: function() {
			var self = this;
			var response = null;

			if (typeof vm === 'undefined') {
				response = self.getStats(function(data) {
					var astronauts = null;
					self.getAstronauts(function(data) {
						astronauts = data.people;
					}).always(function() {
						data.astronauts = astronauts;
						vm = new ViewModel(data, self)
						ko.applyBindings(vm);
					});
				});		
			} else {
				response = self.getStats(function(data) {
					vm.latitude(data.latitude);
					vm.longitude(data.longitude);
					vm.altitude(data.altitude);
					vm.velocity(data.velocity);
					vm.timestamp(data.timestamp);
				});	
			}

			response.always(function() {
				setTimeout(function() { self.bindViewModel() }, 1000);
			})
		},
		getWindowHeight: function() {
			var windowHeight = 0;
			if (typeof(window.innerHeight) == 'number') {
				windowHeight = window.innerHeight;
			}
			else {
				if (document.documentElement && document.documentElement.clientHeight) {
					windowHeight = document.documentElement.clientHeight;
				}
				else {
					if (document.body && document.body.clientHeight) {
						windowHeight = document.body.clientHeight;
					}
				}
			}
			return windowHeight;
		},
		setContent: function() {
			if (document.getElementById) {
				var windowHeight = this.getWindowHeight();
				if (windowHeight > 0) {
					var contentElement = document.getElementById('databody');
					if (contentElement) {
						var contentHeight = contentElement.offsetHeight;
						if (windowHeight - contentHeight > 0) {
							contentElement.style.position = 'relative';
							contentElement.style.top = ((windowHeight / 2) - (contentHeight / 2)) + 'px';
						}
						else {
							contentElement.style.position = 'static';
						}
					}
				}
			}
		},
		rotateSlide: function() {
			(slide_no == 11) ? slide_no = 1 : slide_no++;

			$('#galleryback').fadeOut('slow', function() {
				var imgPath = 'includes/slideimgs/'+slide_no+'.jpg';
				$('<img/>')[0].src = imgPath;
				$(this).css('background-image', 'url(' + imgPath + ')').fadeIn('slow');
			});
		}
	}		


return lowOrbit;

})(window, document, $);