# FloatChat Frontend Design Specification

This document details the visual design, UI architecture, and styling principles of the FloatChat frontend application. It serves as a comprehensive guide to understanding how the application looks, feels, and is structured.

## 🎨 1. Theme & Aesthetics

The application embraces a **Deep Ocean / Cyber-Nautical** aesthetic. The design uses dark, rich gradients to simulate the depth of the ocean, paired with vibrant, luminous cyan accents to represent data and technology.

### Typography
- **Primary Font:** `Inter` (sans-serif)
- **Fallback Fonts:** `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
- **Characteristics:** Clean, highly legible, and modern. Ensures data and numbers are easy to read.

### Color Palette (CSS Variables)
The color palette is defined globally in `index.css` using CSS custom properties to ensure consistency:
- **`--bg`**: `#05080d` (Near black/deep abyss)
- **`--bg-2`**: `#071725` (Deep navy)
- **`--bg-3`**: `#02111d` (Darker navy)
- **`--card`**: `#0a1e30` (Card surface/UI panels)
- **`--muted`**: `#8ba1b7` (Muted text/axes for charts)
- **`--accent`**: `#13b8ff` (Vibrant cyan/primary action color)
- **`--accent-2`**: `#4cc9ff` (Lighter cyan for hover states)
- **`--border`**: `rgba(76, 201, 255, 0.2)` (Subtle cyan borders)

### Backgrounds & Environment
The main application body utilizes a complex CSS radial and linear gradient to create an immersive, glowing underwater effect:
```css
body {
  background: radial-gradient(1200px 600px at 80% -100px, rgba(19, 184, 255, 0.12), transparent 50%),
    radial-gradient(1000px 500px at -200px 40%, rgba(0, 61, 102, 0.25), transparent 60%),
    linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 60%, var(--bg) 100%);
  color: #e6f0fa;
}
```

---

## 🧩 2. Reusable UI Components (Design System)

We use Tailwind CSS paired with a few highly specific custom CSS classes in `index.css` to create reusable design tokens.

### Glassmorphism Panels (`.glass`)
Used for floating elements like the Navbar or the Chatbot window to ensure the underlying ocean map remains partially visible.
- Combines a semi-transparent gradient (`rgba(10, 30, 48, 0.55)`).
- Applies a backdrop blur (`blur(8px)`).
- Uses a subtle cyan border and drop shadow.

### Solid Cards (`.card`)
Used for data-heavy panels or dashboards that require a solid, readable background.
- Employs a dark gradient (`rgba(3, 38, 61, 0.85)`).
- Rounded corners (`16px`).

### Primary Buttons (`.btn-primary`)
Used for primary actions (like the Chatbot toggle).
- Vibrant cyan gradient.
- Inner shadows for depth.
- Hover effects (`brightness(1.08)`) and active press animations (`translateY(1px)`).

---

## 🗺️ 3. Application Layout & Navigation

The application (`App.jsx`) is structured as a Single Page Application (SPA) utilizing conditional rendering based on a local `activePage` state. It ensures a persistent full-screen map/background experience.

### Structure
1. **Navbar (Top)**: Persistent navigation bar allowing users to switch between views (`Home`, `Argo Floats`, `Salinity`, `Temperature`, `Pressure`, `Depth Profiles`).
2. **Main Content Area (Center)**: Flexibly adapts based on the active page.
   - For **Map Views** (`Argo Floats`, Metrics): The content takes up the full width/height without margins to allow edge-to-edge mapping.
   - For **Dashboard/Home**: A glassmorphism wrapper (`bg-white/10 rounded-2xl backdrop-blur-md`) is applied with margins to frame the content beautifully.
3. **Floating Chatbot Button (Bottom Right)**: Fixed `z-50` button that persists across all pages to summon the AI assistant.

---

## 📱 4. Key Page Designs

### The Maps (`OceanMap`, `MetricMap`)
- **Engine:** Deck.GL / React Map GL.
- **Visuals:** Edge-to-edge dark map tiles. Data points (floats) are rendered as glowing scatterplot dots or hexagonal bins (depending on layer settings).
- **Interactions:** Users can pan, zoom, and click to view tooltips or define bounding boxes for the AI context.

### Depth Profiles Dashboard
- **Engine:** D3.js.
- **Visuals:** Rendered inside solid `.card` containers.
- **Layout:** A grid or flexbox layout displaying multiple line charts (Temperature vs Depth, Salinity vs Depth, etc.). Axes use the `--muted` color to recede visually, allowing the cyan data lines to pop.

### AI Chatbot Interface
- **State:** Toggled via the fixed bottom-right button.
- **Visuals:** A slide-out or floating `.glass` panel.
- **Components:**
  - A scrollable message history area with customized thin scrollbars (defined in `index.css`).
  - Differentiated message bubbles (e.g., darker blue for user, cyan-tinted for AI).
  - An input field anchored to the bottom.

---

## 🛠️ 5. Scrollbars & Selection
- **Selection:** Highlighting text results in a translucent cyan background (`rgba(19, 184, 255, 0.35)`).
- **Scrollbars:** Custom Webkit scrollbars are implemented. They are thin (`10px`), with a transparent track and a subtle, rounded cyan thumb (`rgba(138, 184, 210, 0.25)`) that brightens on hover.
