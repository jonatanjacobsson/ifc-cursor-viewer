# IFC Viewer - Current Status & Next Steps

## What's Working ✅
- Extension activation and custom editor registration
- Webview creation with proper CSP
- Three.js scene initialization
- UI layout (sidebar + 3D viewer)
- WASM file configuration and path resolution
- All required files copied to dist folder

## Current Blocker ❌
**Web Worker Incompatibility with VS Code Webviews**

The `@thatopen/components` library (and underlying `web-ifc`) uses Web Workers with dynamic ES module imports, which VS Code webviews cannot support due to:
- Strict MIME type checking for module scripts
- Webview resource loading restrictions
- CSP limitations on dynamic imports

Error: `Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html"`

## Recommended Solutions

### Option 1: Use IFC.js (Simpler Alternative) ⭐ RECOMMENDED
Switch to `ifc.js` which has better webview compatibility:
```bash
npm install web-ifc-three
```

Pros:
- Simpler API
- Better documented
- Works without workers (optional)
- Direct Three.js integration

Cons:
- Less feature-rich than @thatopen/components
- May need custom UI components

### Option 2: Hybrid Architecture
Process IFC files in the Node.js extension host, send geometry to webview:
- Use `web-ifc` in Node.js (no webview restrictions)
- Extract geometry and properties
- Send simplified data to webview for rendering

Pros:
- Full access to web-ifc features
- No webview limitations
- Better performance for large files

Cons:
- More complex architecture
- Requires data serialization
- More development time

### Option 3: External Viewer
Open IFC files in an external browser window:
- Full web capabilities
- No CSP restrictions
- Can use any IFC library

Cons:
- Less integrated with VS Code
- Separate window management

## Immediate Next Steps

1. **Decision Required**: Choose which approach to pursue
2. **If Option 1**: I can refactor to use `ifc.js`
3. **If Option 2**: I can design the hybrid architecture
4. **If Option 3**: I can implement external viewer

## Files Modified So Far
- `src/extension.ts` - Custom editor provider
- `src/webview/viewer.ts` - Viewer initialization
- `webpack.config.js` - Build configuration
- `package.json` - Dependencies

All changes are committed and working except for the worker issue.
