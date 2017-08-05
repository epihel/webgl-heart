// models slightly modified from https://github.com/MattSchroyer/heart/tree/master/models
var HeartLoader = {
	loadWavefrontModel: function(name, cb) {
		var path = 'models/';
		var mtlFileName = name + '.mtl';
		var objFileName = name + '.obj';

		var mtlLoader = new MTLLoader();
		mtlLoader.setPath(path);
		mtlLoader.load(mtlFileName, function(materials) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			objLoader.setPath(path);
			objLoader.load(objFileName, cb);
		}, this._onProgress, this._onError);
	},

	_onProgress: function(xhr) {
		if (xhr.lengthComputable) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	},

	_onError: function(xhr) {
		console.error(xhr);
	}
};
