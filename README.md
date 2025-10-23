# ⚡ Reaction Driver

A futuristic Progressive Web App (PWA) reaction time game built with Three.js and modern web technologies.

## 🎮 About

Test your reflexes in this visually stunning 3D reaction game! Wait for the target to turn green, then click as fast as you can. Challenge yourself to beat your best time!

## ✨ Features

- **3D Graphics**: Powered by Three.js with beautiful particle effects and animations
- **Progressive Web App**: Installable on mobile and desktop devices
- **Offline Support**: Play anywhere with service worker caching
- **Futuristic Design**: Neon colors, glowing effects, and smooth animations
- **Local High Scores**: Track your best reaction times
- **Responsive**: Works on all screen sizes
- **No Dependencies Required**: Just open and play!

## 🚀 Getting Started

### Play Online

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge).

### Install as PWA

1. Open the game in a supported browser
2. Click the "Install App" button when it appears
3. Enjoy the native app experience!

### Local Development

1. Clone this repository
```bash
git clone https://github.com/whoisd3/Reaction-Driver.git
cd Reaction-Driver
```

2. Serve the files using any HTTP server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open http://localhost:8000 in your browser

## 🎯 How to Play

1. Click "START GAME" to begin
2. Wait for the target to turn **GREEN** (don't click too early!)
3. Click as fast as you can when it turns green
4. Check your reaction time and rating
5. Try to beat your best score!

## 🛠️ Technologies Used

- **Three.js** (r128) - 3D graphics rendering
- **Vanilla JavaScript** - Game logic and interactivity
- **CSS3** - Animations and styling
- **Service Workers** - Offline functionality
- **Web App Manifest** - PWA capabilities

## 📊 Rating System

- 🚀 **< 200ms** - LIGHTNING FAST!
- ⚡ **< 300ms** - INCREDIBLE!
- 🔥 **< 400ms** - EXCELLENT!
- ✨ **< 500ms** - GREAT!
- 👍 **< 700ms** - GOOD!
- 😊 **> 700ms** - NICE TRY!

## 🌟 Features Breakdown

### 3D Scene
- Rotating torus geometry target
- Dynamic particle system with 1000+ particles
- Multiple light sources for dramatic effects
- Fog effects for depth perception

### Game Mechanics
- Random delay (2-5 seconds) before target activation
- Real-time reaction measurement
- Early click detection with shake animation
- Persistent high scores using localStorage

### PWA Features
- Fully offline capable
- Installable on all platforms
- Custom app icon and theme
- Standalone display mode

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🎨 Credits

Created with ❤️ using Three.js and modern web technologies.