# Lava Effect Background Widget

A collection of animated fragment shader backgrounds for Flutter providing visual effects for app backgrounds.

## Effect Types

### Gradient Cycle
Smooth color transitions with wave distortions. Perfect for calm, modern backgrounds.
- Colors: Amber, blue, pink, purple transitions
- Motion: Gentle flowing waves
- Best for: Onboarding screens, auth pages

### Fire
Intense, fiery lava effect with turbulent motion.
- Colors: Deep reds, oranges, bright yellows
- Motion: High-energy turbulent flames
- Best for: Action screens, achievement pages

### Plasma
Electric, neon-colored plasma with chaotic motion.
- Colors: Electric blue, neon purple, hot pink, cyan
- Motion: Fast, chaotic electrical patterns
- Best for: Tech-themed screens, loading states

### Aurora
Ethereal, flowing northern lights effect.
- Colors: Aurora greens, sky blues, soft purples
- Motion: Slow, dreamy vertical flows
- Best for: Meditation apps, wellness screens

### Magma
Molten lava with bubbling motion.
- Colors: Dark crimsons, molten reds, glowing oranges
- Motion: Slow, viscous bubbling
- Best for: Dark mode screens, premium features

### Rose
Soft, feminine gradient with pink and peach tones.
- Colors: Soft pink, peach, coral, lavender blush
- Motion: Gentle, flowing waves
- Best for: Pregnancy apps, feminine themes, wellness apps

## Installation

1. The shaders are already configured in `pubspec.yaml`:

```yaml
flutter:
  shaders:
    - shaders/lava_gradient_cycle.frag
    - shaders/lava_fire.frag
    - shaders/lava_plasma.frag
    - shaders/lava_aurora.frag
    - shaders/lava_magma.frag
    - shaders/lava_rose.frag
```

2. Import the widget:

```dart
import 'package:mama_plus/src/common/utils/lava_effect_background.dart';
```

## Usage

### Basic Usage

```dart
Scaffold(
  body: Stack(
    children: [
      // Add lava background
      LavaEffectBackground(
        type: LavaEffectType.aurora,
      ),
      
      // Your content here
      Center(
        child: Text('Hello World'),
      ),
    ],
  ),
)
```

### Customized Usage

```dart
LavaEffectBackground(
  type: LavaEffectType.fire,
  filmGrainIntensity: 0.03,   // 0.0 to 0.1 (default: 0.02)
  animationSpeed: 1.5,         // 0.1 to 3.0 (default: 1.0)
)
```

### Testing All Effects

To test all effects with an interactive UI, use the example screen:

```dart
import 'package:mama_plus/src/common/utils/lava_effect_example.dart';

// Navigate to the example screen
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => LavaEffectExampleScreen(),
  ),
);
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `LavaEffectType` | `gradientCycle` | The visual effect style |
| `filmGrainIntensity` | `double` | `0.02` | Film grain overlay (0.0 - 0.1) |
| `animationSpeed` | `double` | `1.0` | Animation speed multiplier (0.1 - 3.0) |

## Shader Files

The following fragment shaders are included:

- `shaders/lava_gradient_cycle.frag` - Gradient cycling effect
- `shaders/lava_fire.frag` - Fire effect
- `shaders/lava_plasma.frag` - Plasma effect
- `shaders/lava_aurora.frag` - Aurora effect
- `shaders/lava_magma.frag` - Magma effect
- `shaders/lava_rose.frag` - Rose effect

## Examples

See `lava_effect_example.dart` for:
- Interactive demo screen with all effects
- Simple usage example
- Control panel implementation

## License

Based on shader work inspired by various ShaderToy creations, adapted for Flutter.
