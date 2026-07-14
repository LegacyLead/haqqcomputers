/* Signature 3D zone — a rotating signal/circuit network echoing the logo's
   concentric-ring + node motif. Kept subtle and confined to the hero. */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Node cloud arranged in concentric rings (echoes the logo mark)
  const group = new THREE.Group();
  const ringCounts = [10, 16, 22];
  const ringRadii  = [3.4, 5.6, 7.8];
  const nodePositions = [];

  const nodeGeo = new THREE.SphereGeometry(0.045, 10, 10);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x3da7da, transparent:true, opacity:.85 });
  const nodeMatBright = new THREE.MeshBasicMaterial({ color: 0x8fd1f0, transparent:true, opacity:.95 });

  ringCounts.forEach((count, ringIdx) => {
    const r = ringRadii[ringIdx];
    for(let i = 0; i < count; i++){
      const angle = (i / count) * Math.PI * 2 + ringIdx * 0.4;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.55;
      const z = (Math.random() - 0.5) * 1.6;
      const mesh = new THREE.Mesh(nodeGeo, i % 5 === 0 ? nodeMatBright : nodeMat);
      mesh.position.set(x, y, z);
      group.add(mesh);
      nodePositions.push(new THREE.Vector3(x, y, z));
    }
  });

  // Connective lines between nearby nodes (circuit feel)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x0b63d6, transparent:true, opacity:.22 });
  const linePositions = [];
  for(let i = 0; i < nodePositions.length; i++){
    for(let j = i + 1; j < nodePositions.length; j++){
      if(nodePositions[i].distanceTo(nodePositions[j]) < 1.9){
        linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
        linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // Faint outer ring arcs (torus) matching the logo's arcs
  [3.4, 5.6, 7.8].forEach((r, i) => {
    const torusGeo = new THREE.TorusGeometry(r, 0.008, 8, 96);
    const torusMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0x3da7da : 0x0b63d6, transparent:true, opacity:.18 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2 + 0.15;
    group.add(torus);
  });

  scene.add(group);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  let raf;
  function animate(){
    raf = requestAnimationFrame(animate);
    group.rotation.z += 0.0011;
    group.rotation.x += (mouseY * 0.25 - group.rotation.x) * 0.02;
    group.rotation.y += (mouseX * 0.35 - group.rotation.y) * 0.02;
    renderer.render(scene, camera);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resize();
  window.addEventListener('resize', resize);
  if(!prefersReduced){ animate(); } else { renderer.render(scene, camera); }
})();
