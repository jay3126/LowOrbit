var lowOrbit = (function (window, document, $) {
	var stats,
		astronauts;

	var lowOrbit = function () {
		var self = this;
		
		self.bindViewModel();
	};

	var ViewModel = function(stats, astronauts) {
		console.log(stats);
	    this.lat = ko.observable(stats.latitude);
	    this.lon = ko.observable(stats.longitude);
	    this.alt = ko.observable(stats.altitude);
	    this.astronauts = ko.observableArray(astronauts.people);
	 
	    this.fullName = ko.computed(function() {
	        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
	        return this.firstName() + " " + this.lastName();
	    }, this);
	};
 
	lowOrbit.prototype = {
	    constructor: lowOrbit,
		getStats: function() {
			var stats = null;
			$.ajax({
			  type: "GET",
			  dataType: "json",
			  async: false,
			  url: 'http://whateverorigin.org/get?url=' + encodeURIComponent('https://api.wheretheiss.at/v1/satellites/25544') + '&callback=?',
			  success: function(data) {
			  	console.log(data);
			  	stats = data.contents;
	  		  }
		  	});
		  	return stats;
		},
		getAstronauts: function() {
			var astronauts = null;
			$.ajax({
			  type: "GET",
			  dataType: "json",
			  async: false,
			  url: 'http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.howmanypeopleareinspacerightnow.com/space.json') + '&callback=?',
			  success: function(data) {
			  	console.log(data);
			  	astronauts = data.contents;
	  		  }
		  	});
		  	return astronauts;
		},
		bindViewModel: function() {
			//astronauts = (!astronauts) ? this.getAstronauts() : astronauts;
			//stats = this.getStats();
			
			ko.applyBindings(new ViewModel(stats, astronauts));
		}
	}		

return lowOrbit;

})(window, document, $);