window.addEventListener("load", function () {
    "use strict";

    var w = 800, h = 800;
   var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(w, h);
    var view = document.getElementById("view");
    view.appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    camera.position.set(0, 0, 200);
    var controls = new THREE.TrackballControls(camera, view);

    // The earth object                                                         
    // curl -Lo mercator.jpg http://goo.gl/xNgf4d                               
    // convert -resize 1024x1024! mercator.jpg earth.jpg                        
    // the side border is laongitude 180deg: -180 -> 0 -> 180                   
    var tex = new THREE.TextureLoader().load("earth.jpg.jpg");
    var earth = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 32),
        new THREE.MeshBasicMaterial({map: tex}));
    // note: sphere geometry and tex coords                                     
    // (x,z) = (-1, 0) -> (0, 1) -> (1, 0) -> (0, -1) -> (-1, 0)                
    // mercator maps's long 0deg is on (1, 0)                                   

    // marker object                                                            
    var pointer = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({color: 0xcc9900}));
    pointer.position.set(55, 0, 0); // rotating obj should set (X > 0, 0, 0)    
    var marker = new THREE.Object3D();
    marker.add(pointer);


    // setup scene                                                              
    var obj = new THREE.Object3D();
    obj.add(marker);
    obj.add(earth);
    var scene = new THREE.Scene();
    scene.add(obj);

    // [initial position] rotate by lat/long                                    
    // For ball is at (X,0,0), the lat rotation should be around Z axis         
    var rad = Math.PI / 180;
    var rot = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 135 * rad, 45 * rad, "YZX"));
    marker.quaternion.copy(rot);

    var loop = function loop() {
	requestAnimationFrame(loop);
        obj.rotation.y += 0.01;
        controls.update();
        renderer.clear();
	renderer.render(scene, camera);
    };
    loop();
    plot();
     function plot() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://api.wheretheiss.at/v1/satellites/25544',
        async: false,
        crossDomain: true,
        complete: function(data) {
            if (data.readyState === 4 && data.status === 200) {
                const lat = data.responseJSON.latitude;
              const long = data.responseJSON.longitude;
	var rot = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, lat * rad, long * rad, "YZX"));
	marker.quaternion.copy(rot);
      
     }
        }
    });
}




}, false);		