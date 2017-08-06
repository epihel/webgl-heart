if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}
var ADD_STATS = true;
var HEART = {
	front: {
		id: 'heartFront',
		pos: { x: -7.6, y: -9.4, z: 24.2 }
	},
	back: {
		id: 'heartBack'
	},
	rotation: { x: -1.6, y: .4, z: .05 }
};
var LABEL = {
	bgColor: 'green',
	fgColor: 'white',
	font: 'bold 16px monospace',
	positions: [
		// aorta
		new THREE.Vector3(-4, 4.2, -1.2),
		// arch of the aorta
		new THREE.Vector3(-3.4, 7.6, 2.6),
		// left auricular appendage
		new THREE.Vector3(-4.2, .8, 3.4),
		// pulmonary artery
		new THREE.Vector3(-5, 3.2, 1.4),
		// pulmonary veins
		new THREE.Vector3(1, 2.4, 6),
		// vena cava superior
		new THREE.Vector3(-1, 6, -5)
	]
};
var movingHeart = false;
var heartIsMoved = false;
var camera, labelCanvas, renderer, scene, stats, trackballControls;

/***** start application *****/
init();

function init() {
	createScene();
	loadModels(function modelsLoaded() {
		createRenderer();
		// start rendering loop
		animate();
	});	
}

function createScene() {
	// camera
	var viewField = 45;
	var aspectRatio = window.innerWidth / window.innerHeight;
	var near = 1;
	var far = 2000;
	camera = new THREE.PerspectiveCamera(viewField, aspectRatio, near, far);
	WebglUtils.set(camera.position, -42, 4, -1);

	// enable rotating the heart
	trackballControls = new THREE.TrackballControls(camera);
	// don't keep moving the heart after user has stopped dragging
	trackballControls.staticMoving = false;
	
	// scene
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x444444));
	addLight(0, 0, 1);
	addLight(0, 0, -1);
	addLight(1, 0, 0);
	addLight(-1, 0, 0);
	addLight(0, 1, 0);
	addLight(0, -1, 0);
}

function createRenderer() {
	camera.position.z = 5;
	
	labelCanvas = WebglUtils.fitViewport('label-canvas');
	var canvas = WebglUtils.fitViewport('webgl-canvas');

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	if (ADD_STATS) {
		stats = WebglUtils.addStats({ left: '20px', top: '0px', 'z-index': 2 });
	}
	
	window.addEventListener('resize', viewportResized);
}

function loadModels(cb) {
	HeartLoader.loadWavefrontModel('heart-back', function(heartBack) {
		heartBack.name = HEART.back.id;
		WebglUtils.set(heartBack.position, 32, -3, 3);
		heartBack.rotation.x = HEART.rotation.x;
		scene.add(heartBack);

		HeartLoader.loadWavefrontModel('heart-front', function(heartFront) {
			heartFront.name = HEART.front.id;
			WebglUtils.copyKvps(HEART.front.pos, heartFront.position);
			WebglUtils.copyKvps(HEART.rotation, heartFront.rotation);
			WebglUtils.set(heartFront.scale, 4, 4, 4);
			scene.add(heartFront);
			cb();
		});
	});
}

function animate() {
	if (stats) {
		stats.update();	
	}
	trackballControls.update();
	if (movingHeart) {
		TWEEN.update();
	}
	if (labelCanvas.style.display === 'inline') {
		checkLabels();
	}
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function viewportResized() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	trackballControls.handleResize();
}

function addLight(x, y, z) {
	var light = new THREE.DirectionalLight(0xffeedd, 0.7);
	WebglUtils.set(light.position, x, y, z);
	light.position.normalize();
	scene.add(light);
}

function checkLabels() {
	// why is this needed? without it, the labels don't get redrawn when rotating the heart
	labelCanvas.width = labelCanvas.width;

	// calculate if we should render the label based on the current rotation
	var raycaster = new THREE.Raycaster();
	var heartBack = scene.getObjectByName(HEART.back.id, true);
	var vector = new THREE.Vector3();

	LABEL.positions.forEach(function(labelPos, i) {
		var origin = labelPos.clone();
		// turns vector into a directional vector pointing from origin to camera
		vector.sub(origin).normalize();
		raycaster.set(origin, vector);
		if (raycaster.intersectObject(heartBack, true).length > 0) {
			// label wouldn't be seen, so don't bother rendering
		}
		else {
			createLabel(origin, i + 1);
		}
		vector.set(camera.position.x, camera.position.y, camera.position.z);
	});
}

function createLabel(labelPos, labelNumber) {
	labelPos.project(camera);
	labelPos.x = Math.round((labelPos.x + 1) * window.innerWidth / 2);
	labelPos.y = Math.round(((-1 * labelPos.y) + 1) * window.innerHeight / 2);
	labelPos.z = 0;
	var cxt = labelCanvas.getContext('2d');

	// label
	cxt.beginPath();
	cxt.arc(labelPos.x, labelPos.y, 15, 0, 2 * Math.PI);
	cxt.fillStyle = LABEL.bgColor;
	cxt.fill();

	// text
	cxt.font = LABEL.font;
	cxt.fillStyle = LABEL.fgColor;
	// make all heights the same
	var height = cxt.measureText('w').width;
	cxt.fillText(labelNumber, labelPos.x - (cxt.measureText(labelNumber).width / 2), labelPos.y + (height / 2));
}

function toggleLabels() {
	var style = labelCanvas.style;
	var show = style.display === '' || style.display === 'none';

	style.display = show ? 'inline' : 'none';
	document.getElementById('legend').style.display = show ? 'block' : 'none';
	document.getElementById('label-button').innerHTML = (show ? 'Hide' : 'Show') + ' Labels';
}

function toggleHeartFront() {
	movingHeart = true;
	var duration = 1000;
	var heartFront = scene.getObjectByName(HEART.front.id, true);

	var newPos = heartIsMoved ? HEART.front.pos : { x: 3.4, y: -15, z: -6.2 };
	new TWEEN.Tween(heartFront.position)
		.to(newPos, duration)
		.onComplete(function() {
			movingHeart = false;
			heartIsMoved = !heartIsMoved;
			document.getElementById('heart-button').innerHTML = (heartIsMoved ? 'Integrate' : 'Separate');
		})
		.start();
}
