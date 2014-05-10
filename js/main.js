var lowOrbit = (function (window, document, $) {
	var stats,
		vm;

	var lowOrbit = function () {
		var self = this;
		
		self.bindViewModel();
	};

	var ViewModel = function(stats) {
		this.lat = ko.observable(stats.latitude);
	    this.lon = ko.observable(stats.longitude);
	    this.alt = ko.observable(stats.altitude);
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
					setTimeout(self.bindViewModel(), 60000);
				});		
			} else {
				self.getStats(function(data) {
					vm.lat(data.latitude);
					vm.lon(data.longitude);
					vm.alt(data.altitude);
					setTimeout(self.bindViewModel(), 60000);
				});	
			}
		}
	}		

return lowOrbit;

})(window, document, $);