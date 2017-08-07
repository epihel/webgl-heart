var WebglUtils = {
	/**
	 * Adds frame-per-second statistics to debug during development.
	 * @param styles  the stats' css styles, which must include position attributes
	 * (e.g., 'bottom,' 'left,' 'right,' and/or 'top')
	 */
	addStats: function(styles) {
		var stats = new Stats();
		var elem = stats.domElement;
		var s = elem.style;
		s.position = 'absolute';
		for (var cssProp in styles) {
			s[cssProp] = styles[cssProp];
		}
		var statsContainer = document.createElement('div');
		statsContainer.appendChild(elem);
		document.body.appendChild(statsContainer);
		return stats;
	},

	fitViewport: function(htmlId) {
		var elem = document.getElementById(htmlId);
		elem.width = window.innerWidth;
		elem.height = window.innerHeight;
		return elem;
	},

	/**
	 * Shallow copies the properties from the given object.
	 * In Three.js, `obj.position = otherPosition` doesn't work.
	 * @param srcMap  the source properties
	 * @param optionalTargetMap  the target object where we should copy the properties
	 * @return optionalTargetMap if provided; otherwise, a new object
	 */
	copyKvps: function(srcMap, optionalTargetMap) {
        if (typeof(optionalTargetMap) !== 'object') {
            optionalTargetMap = {};
        }
        for (let x in srcMap) {
            optionalTargetMap[x] = srcMap[x];
        }
        return optionalTargetMap;
    }
};
