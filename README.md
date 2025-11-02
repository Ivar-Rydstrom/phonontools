# phonontools

Thermal calculation tool primarily for low temperature engineering.

## Thermal Conductivity Chain Calculator

An interactive web application for simulating steady-state temperatures in thermal systems. Build thermal chains by connecting thermal masses through thermal conductances to temperature baths.

### Features

- **Visual Interface**: Intuitive drag-and-drop interface powered by React Flow
- **Real-time Calculations**: Automatic steady-state temperature calculations
- **Flexible Modeling**: 
  - Add thermal masses with configurable heat capacity
  - Define temperature baths with fixed temperatures
  - Connect elements with thermal conductances
  - Add heat sources to thermal masses
- **Interactive**: Click nodes and edges to edit properties in real-time

### Live Demo

Visit the app at: https://ivar-rydstrom.github.io/phonontools/

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Usage

1. **Add Nodes**: Use the buttons to add thermal masses or temperature baths
2. **Connect Nodes**: Drag from one node's handle to another to create thermal connections
3. **Edit Properties**: Click on nodes or edges to modify their properties
4. **View Results**: Temperature calculations update automatically

### Example

The default configuration shows a simple cryogenic cooling chain:
- Cold bath at 4K
- Two thermal stages with different heat capacities
- A 10W heat load on the second stage
- Thermal conductances linking the components

The calculator solves the steady-state heat balance equations to determine equilibrium temperatures.

### Technology Stack

- React with TypeScript
- React Flow for visual node editing
- Vite for fast development and building
- GitHub Pages for static hosting

