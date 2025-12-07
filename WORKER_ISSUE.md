# Web Worker Issue in VS Code Webview

## Problem
The IFC viewer cannot load IFC files because `web-ifc` library tries to dynamically import a worker file (`web-ifc-mt.worker.js`) as an ES module, which VS Code webviews don't support properly.

## Error
```
Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html"
```

## Root Cause
- `web-ifc` uses Web Workers for better performance
- It tries to dynamically import the worker using `import()` 
- VS Code webviews can't serve the worker file with the correct MIME type
- The webview's CSP and resource loading restrictions prevent dynamic module imports

## Current Status
✅ WASM path is correctly configured
✅ All files are copied to dist folder
✅ CSP allows `unsafe-eval` and `wasm-unsafe-eval`
❌ Worker file cannot be loaded as ES module

## Attempted Solutions
1. ✅ Added worker-loader to webpack
2. ✅ Copied worker files to dist
3. ✅ Updated CSP to allow eval and WASM
4. ❌ Dynamic import still fails in webview

## Potential Solutions

### Option 1: Disable Multi-threading (Recommended)
Find a way to configure `web-ifc` to not use workers. This might involve:
- Using a different build of web-ifc (IIFE version)
- Configuring `@thatopen/components` to disable workers
- Patching web-ifc to skip worker initialization

### Option 2: Use Alternative IFC Library
Switch to a simpler IFC loading library that doesn't use workers:
- `ifc.js` (if it has a non-worker version)
- Custom IFC parser
- Server-side IFC processing

### Option 3: Inline Worker
Bundle the worker code inline using webpack:
- Use `worker-loader` with `inline: 'no-fallback'`
- Convert worker to blob URL
- May still face CSP issues

### Option 4: Use iframe instead of webview
- Load the viewer in an iframe with relaxed CSP
- More complex communication with extension
- Better compatibility with web libraries

## Recommended Next Steps
1. Check if `@thatopen/components` has a configuration to disable workers
2. Try using the IIFE version of web-ifc directly
3. Consider using a simpler IFC viewer library
4. As last resort, implement server-side IFC processing
