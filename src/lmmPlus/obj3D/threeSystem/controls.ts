import { TrackballControls  } from 'three/examples/jsm/controls/TrackballControls.js';
import { OrthographicCamera } from 'three';


function createControls(camera:OrthographicCamera, canvas:HTMLElement) {
  const controls = new TrackballControls (camera, canvas);
  controls.enabled = false;
  controls.rotateSpeed=20
  return controls;
}

export default createControls