# TrustMarket Icons

## Favicon Design

### Concept
The favicon represents TrustMarket's core features:
- **Chart/Graph**: Prediction markets and data-driven decisions
- **Rising Line**: Positive predictions and market growth
- **Data Points**: 
  - Green: Successful predictions
  - Yellow/Orange: Pending/Active markets
- **AI Sparkle**: AI-powered resolution
- **Blue Background**: Trust, security, and professionalism

### Files

#### favicon.svg
- Vector format for modern browsers
- Scalable without quality loss
- 64x64 base size
- Blue gradient background (#1890FF)

#### icon.tsx
- Next.js dynamic icon generation
- 32x32 favicon
- Edge runtime for fast generation
- Used for browser tabs

#### apple-touch-icon.png
- iOS home screen icon
- 180x180 recommended size
- Placeholder for now (should be generated)

### Color Palette

**Primary:**
- Blue: #1890FF (Trust, Security)
- Dark Blue: #096DD9 (Depth)

**Accents:**
- Green: #52C41A (Success, YES votes)
- Gold: #FFD700 (AI, Premium)
- Orange: #FAAD14 (Pending, Warning)
- White: #FFFFFF (Clarity, Data)

### Symbolism

1. **Chart Line**: Represents prediction markets
2. **Upward Trend**: Positive outcomes and growth
3. **Multiple Points**: Diverse markets and predictions
4. **AI Sparkle**: Cutting-edge AI resolution
5. **Axes**: Data-driven, analytical approach

### Usage

The favicon appears in:
- Browser tabs
- Bookmarks
- History
- Mobile home screen (iOS)
- PWA icons
- Search results

### Future Improvements

To generate proper PNG icons, run:
```bash
# Install sharp for image processing
npm install sharp

# Generate icons from SVG
node scripts/generate-icons.js
```

Or use online tools:
- https://realfavicongenerator.net/
- https://favicon.io/

### Brand Consistency

The icon matches TrustMarket's:
- ✅ Professional blue theme
- ✅ Data-driven approach
- ✅ AI-powered features
- ✅ Multi-chain support (represented by multiple data points)
- ✅ Trust and security focus
