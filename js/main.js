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
				async: false,
				url: '/stats',
				success: function(data) {
					success(data);
			  	}
			});
		},
		bindViewModel: function() {
			var self = this;

			if (typeof vm === 'undefined') {
				this.getStats(function(data) {
					vm = new ViewModel(data)
					ko.applyBindings(vm);
					setTimeout(self.bindViewModel(), 5000);
				});		
			} else {
				this.getStats(function(data) {
					vm.lat(data.latitude);
					vm.lon(data.longitude);
					vm.alt(data.altitude);
					setTimeout(self.bindViewModel(), 5000);
				});	
			}
		}
	}		

return lowOrbit;

})(window, document, $);