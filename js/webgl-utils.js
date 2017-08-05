var WebglUtils = {
	/**
	 * Adds frame-per-second statistics to debug during development.
	 * @param left  the stats' absolute left position
	 * @param top  the stats' absolute top position
	 * @param zIndex  the stats' zIndex
	 */
	addStats: function(left, top, zIndex) {
		var stats = new Stats();
		var elem = stats.domElement;
		var s = elem.style;
		s.left = left + 'px';
		s.position = 'absolute';
		s.top = top + 'px';
		s.zIndex = zIndex;
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
	 * Sets the x, y, and z properties of any object.
	 */
	set: function(obj, x, y, z) {
		obj.x = x;
		obj.y = y;
		obj.z = z;
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
