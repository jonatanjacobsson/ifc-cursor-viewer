# IFC Cursor Viewer

A [Cursor](https://cursor.com) extension that allows you to view IFC files directly within the Cursor IDE using [That Open Engine](https://github.com/ThatOpen/engine_components).

> **Note**: This is a fork of [chuongmep/ifc-vscode-viewer](https://github.com/chuongmep/ifc-vscode-viewer), adapted to work seamlessly with Cursor IDE.

![IFC Viewer Screenshot](./docs/iShot_2025-12-07_10.57.52.png)

## Features

- **IFC Viewer**: Open `.ifc` files in a high-performance 3D viewer.
- **3D Navigation**: Orbit, pan, and zoom to inspect your BIM models.
- **Model Properties**: View basic model information in the sidebar.
- **Split Layout**: Adjustable sidebar and viewer area.
- **Cursor Compatible**: Configured to work with Cursor's VS Code-based architecture.

## Usage

1. Install the extension.
2. Open any `.ifc` file in Cursor.
3. The viewer will automatically load and display the model.
4. Use the sidebar to view model properties.

## Requirements

- Cursor IDE (or VS Code 1.74.0 or higher)

## Development

1. Clone the repository.
2. Run `npm install`.
3. Run `npm run compile` to build the extension and webview.
4. Press `F5` to start debugging.

## Changes from Original

This fork includes the following modifications for Cursor compatibility:

- Lowered VS Code engine requirement for broader compatibility
- Added ES module interop settings for TypeScript
- Configured separate ts-loader instances for extension and webview builds
- Enabled async WebAssembly support for web-ifc
- Fixed module resolution configuration

## Credits

Original project by [@chuongmep](https://github.com/chuongmep) - [ifc-vscode-viewer](https://github.com/chuongmep/ifc-vscode-viewer)

## License

See the original project for license information.
