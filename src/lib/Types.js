'use strict';

module.exports = {
	Date: function(val) {
		if(val !== null) {
			var date = Date.parse(val);

			if (isNaN(date)) {
				return null;
			}

			return new Date(val);
		} else {
			return null;
		}
	}
};
