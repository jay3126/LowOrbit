var lowOrbit = (function (window, document, $) {
	var stats,
		vm;

	var lowOrbit = function () {
		var self = this;
		
		self.bindViewModel();
	};

	ko.extenders.numeric = function(target, precision) {
		var result = ko.dependentObservable({
	        read: function() {
	           	return target().toFixed(precision); 
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

	var ViewModel = function(stats) {
		var self = this;
		this.latitude = ko.observable(stats.latitude).extend({ numeric: 2 });
	    this.longitude = ko.observable(stats.longitude).extend({ numeric: 2 });
	    this.altitude = ko.observable(stats.altitude).extend({ numeric: 2 });
	    this.velocity = ko.observable(stats.velocity).extend({ numeric: 2 });
	    this.timestamp = ko.observable(stats.timestamp).extend({ time: true });
	    this.astronauts = ko.observableArray(stats.astronauts);
	    this.location = ko.observable('Ocean');

	    var updateLocation = function() {
	    	$.ajax({
				type: "GET",
				dataType: "json",
				url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+self.latitude.raw()+','+self.longitude.raw()+'&sensor=true',
				success: function(data) {
					$.each(data['results'], function(index, result) {
						$.each(result['address_components'], function(index, component) {
							if ($.inArray('country', component['types']) > -1) {
								self.location(component['long_name']);
							}
						});
					});
			  	}
			});
	    };

	    this.latitude.subscribe(updateLocation);
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
						vm = new ViewModel(data)
						ko.applyBindings(vm);
					})
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
				setTimeout(function() { self.bindViewModel() }, 2000);
			})
		}
	}		

return lowOrbit;

})(window, document, $);