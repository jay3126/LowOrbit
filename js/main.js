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
		this.latitude = ko.observable(stats.latitude).extend({ numeric: 2 });
	    this.longitude = ko.observable(stats.longitude).extend({ numeric: 2 });
	    this.altitude = ko.observable(stats.altitude).extend({ numeric: 2 });
	    this.velocity = ko.observable(stats.velocity).extend({ numeric: 2 });
	    this.timestamp = ko.observable(stats.timestamp).extend({ time: true });
	};
 
	lowOrbit.prototype = {
	    constructor: lowOrbit,
		getStats: function(success) {
			var self = this;

			$.ajax({
				type: "GET",
				dataType: "json",
				url: '/stats',
				success: function(data) {
					success(data);
			  	}
			});
		},
		bindViewModel: function() {
			var self = this;

			if (typeof vm === 'undefined') {
				self.getStats(function(data) {
					vm = new ViewModel(data)
					ko.applyBindings(vm);
					setTimeout(function() { self.bindViewModel() }, 2000);
				});		
			} else {
				self.getStats(function(data) {
					vm.latitude(data.latitude);
					vm.longitude(data.longitude);
					vm.altitude(data.altitude);
					vm.velocity(data.velocity);
					vm.timestamp(data.timestamp);
					setTimeout(function() { self.bindViewModel() }, 2000);
				});	
			}
		}
	}		

return lowOrbit;

})(window, document, $);