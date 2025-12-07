import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

declare global {
    interface Window {
        modelUri: string;
        wasmPath: string;
    }
}

console.log("Viewer initialized");

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Create camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// Create renderer
const viewerContainer = document.getElementById('viewer-container');
if (!viewerContainer) {
    throw new Error('Viewer container not found');
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
viewerContainer.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight2.position.set(-10, -10, -10);
scene.add(directionalLight2);

// Add grid
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(gridHelper);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = viewerContainer.clientWidth;
    const height = viewerContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Create sidebar
const sidebarContainer = document.getElementById('sidebar-container');
if (!sidebarContainer) {
    throw new Error('Sidebar container not found');
}

// Add initial sidebar content
const welcomePanel = document.createElement('div');
welcomePanel.style.cssText = 'padding: 1rem; color: #fff;';
welcomePanel.innerHTML = `
    <h3 style="margin-top: 0; color: #4a9eff;">IFC Viewer</h3>
    <p style="font-size: 0.9em; opacity: 0.8;">Loading model...</p>
`;
sidebarContainer.appendChild(welcomePanel);

// Load IFC file
async function loadIfc() {
    if (!window.modelUri) {
        console.error("No model URI provided");
        return;
    }

    console.log("Loading IFC from " + window.modelUri);

    try {
        // Create IFC loader
        const ifcLoader = new IFCLoader();

        // Setup WASM path - use relative path since WASM files are in same dir as viewer.js
        // web-ifc will append "web-ifc.wasm" to this path
        const wasmPath = "./";
        console.log("WASM path:", wasmPath);

        await ifcLoader.ifcManager.setWasmPath(wasmPath);

        // Fetch IFC file
        const response = await fetch(window.modelUri);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Load the model
        const model = await ifcLoader.loadAsync(url) as THREE.Group;

        // Add to scene
        scene.add(model);

        console.log("Model loaded successfully", model);
        console.log("Supported IFC versions: IFC2x3, IFC4");

        // Fit camera to model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();

        // Update sidebar with model info
        if (!sidebarContainer) return;
        sidebarContainer.innerHTML = '';

        const modelInfo = document.createElement('div');
        modelInfo.style.cssText = 'padding: 1rem; color: #fff;';
        modelInfo.innerHTML = `
            <h3 style="margin-top: 0; color: #4a9eff;">Model Loaded</h3>
            <div style="font-size: 0.9em; opacity: 0.9;">
                <p><strong>Geometry:</strong> ${model.children.length} objects</p>
                <p><strong>Bounds:</strong><br/>
                   X: ${size.x.toFixed(2)}m<br/>
                   Y: ${size.y.toFixed(2)}m<br/>
                   Z: ${size.z.toFixed(2)}m
                </p>
            </div>
        `;
        sidebarContainer.appendChild(modelInfo);

        // Get all spatial structure
        const spatialStructure = await ifcLoader.ifcManager.getSpatialStructure((model as any).modelID);
        console.log("Spatial structure:", spatialStructure);

        // Add spatial tree to sidebar
        if (!sidebarContainer) return;
        const treePanel = document.createElement('div');
        treePanel.style.cssText = 'padding: 1rem; color: #fff; border-top: 1px solid #333;';
        treePanel.innerHTML = `
            <h4 style="margin-top: 0; color: #4a9eff;">Spatial Structure</h4>
            <div id="spatial-tree" style="font-size: 0.85em; max-height: 400px; overflow-y: auto;"></div>
        `;
        sidebarContainer.appendChild(treePanel);

        const treeContainer = document.getElementById('spatial-tree');
        if (treeContainer && spatialStructure) {
            renderSpatialTree(spatialStructure, treeContainer, 0, ifcLoader, (model as any).modelID);
        }

        // Clean up blob URL
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error loading IFC:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

        // Show error in sidebar
        if (!sidebarContainer) return;
        sidebarContainer.innerHTML = '';
        const errorPanel = document.createElement('div');
        errorPanel.style.cssText = 'padding: 1rem; color: #ff6b6b; background: #2a0000; margin: 1rem; border-radius: 4px;';
        errorPanel.innerHTML = `
            <h3 style="margin-top: 0;">Error Loading IFC</h3>
            <p>${error instanceof Error ? error.message : String(error)}</p>
            <p style="font-size: 0.9em; opacity: 0.8;">Check the console for more details.</p>
        `;
        sidebarContainer.appendChild(errorPanel);
    }
}

function renderSpatialTree(node: any, container: HTMLElement, level: number = 0, ifcLoader?: IFCLoader, modelID?: number) {
    const indent = level * 15;
    const nodeEl = document.createElement('div');
    nodeEl.style.cssText = `padding: 4px 0 4px ${indent}px; cursor: pointer; opacity: 0.9;`;
    nodeEl.innerHTML = `
        <span style="color: #4a9eff;">▸</span> 
        <span>${node.type || 'Unknown'}</span>
        ${node.expressID ? `<span style="opacity: 0.6; font-size: 0.8em;"> #${node.expressID}</span>` : ''}
    `;

    nodeEl.addEventListener('mouseenter', () => {
        nodeEl.style.background = '#2a2a2a';
    });
    nodeEl.addEventListener('mouseleave', () => {
        nodeEl.style.background = 'transparent';
    });

    // Add click handler to zoom to element
    if (node.expressID && ifcLoader && modelID !== undefined) {
        nodeEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                // Highlight the element in UI
                nodeEl.style.background = '#1a4d7a';

                console.log(`Attempting to zoom to element #${node.expressID} (${node.type})`);

                // Remove previous selection
                ifcLoader.ifcManager.removeSubset(modelID, undefined, 'selection');

                // Get the geometry for this element
                const geometry = await ifcLoader.ifcManager.getItemProperties(modelID, node.expressID, true);
                console.log('Element properties:', geometry);

                // Create a subset with just this element - use material instead of scene
                const subset = ifcLoader.ifcManager.createSubset({
                    modelID: modelID,
                    ids: [node.expressID],
                    removePrevious: false,
                    customID: 'selection'
                });

                console.log('Subset created:', subset);
                console.log('Subset has geometry:', subset ? 'yes' : 'no');

                if (subset) {
                    // Add subset to scene if not already there
                    if (!scene.children.includes(subset)) {
                        scene.add(subset);
                    }

                    // Calculate bounding box for the subset
                    const box = new THREE.Box3().setFromObject(subset);

                    // Check if box is valid
                    if (!box.isEmpty()) {
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());

                        console.log('Bounding box:', { center, size });

                        // Calculate camera position
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const fov = camera.fov * (Math.PI / 180);
                        let distance = Math.abs(maxDim / Math.tan(fov / 2));
                        distance *= 2; // Add more padding

                        // Position camera to look at the element from an angle
                        const direction = new THREE.Vector3(1, 1, 1).normalize();
                        const targetPos = center.clone().add(direction.multiplyScalar(distance));

                        console.log('Camera target position:', targetPos);
                        console.log('Looking at:', center);

                        // Directly set camera position
                        camera.position.copy(targetPos);
                        camera.lookAt(center);
                        controls.target.copy(center);

                        // Reset controls to apply changes
                        controls.reset();
                        controls.update();

                        // Force a render
                        renderer.render(scene, camera);

                        console.log('Camera moved to:', camera.position);
                        console.log('Camera looking at:', controls.target);
                    } else {
                        console.warn('Bounding box is empty for element');
                    }
                } else {
                    console.warn('No geometry found for element');
                }
            } catch (error) {
                console.error('Error zooming to element:', error);
            }
        });
    }

    container.appendChild(nodeEl);

    if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
            renderSpatialTree(child, container, level + 1, ifcLoader, modelID);
        });
    }
}

loadIfc();
