# IFC Viewer - Model Loading Fix

## Issue
The 3D model geometry was not visible because the `FragmentsManager` was not initialized before attempting to load IFC files.

## Error Message
```
Error loading IFC: Error: You need to initialize fragments first.
```

## Root Cause
The `@thatopen/components` library requires the `FragmentsManager` to be initialized before the `IfcLoader` can process IFC files. This initialization step was missing from the viewer setup.

## Solution
Added the following initialization steps in the `loadIfc()` function:

1. **Initialize FragmentsManager**: Call `fragments.init("")` before loading any IFC files
2. **Setup IfcLoader**: Call `await ifcLoader.setup()` to properly configure the loader
3. **Configure WASM**: Set the WASM path and absolute flag for web-ifc

## Code Changes
```typescript
async function loadIfc() {
    if (window.modelUri) {
        // Initialize FragmentsManager first
        const fragments = components.get(OBC.FragmentsManager);
        fragments.init("");
        
        const ifcLoader = components.get(OBC.IfcLoader);
        
        // Setup IfcLoader
        await ifcLoader.setup();
        
        // Setup wasm
        ifcLoader.settings.wasm.path = "./";
        ifcLoader.settings.wasm.absolute = true;
        
        // ... rest of loading logic
    }
}
```

## Supported IFC Versions
The viewer supports:
- **IFC2x3**
- **IFC4**

These are the standard IFC schema versions supported by the `web-ifc` library.

## Testing
1. Rebuild the extension: `npm run compile`
2. Press `F5` to launch the Extension Development Host
3. Open any `.ifc` file (IFC2x3 or IFC4)
4. The 3D model should now be visible in the viewer

## Additional Notes
- The model is automatically added to the scene after loading
- Camera auto-fits to the model bounds using `BoundingBoxer`
- Console logs confirm model loading and IFC version support
