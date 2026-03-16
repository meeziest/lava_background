import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

/// Defines the visual style of the lava effect.
enum LavaEffectType {
  /// Smooth gradient cycling with wave distortion.
  gradientCycle,

  /// Fiery, intense lava-like effect.
  fire,

  /// Electric plasma effect with dynamic colors.
  plasma,

  /// Aurora-like flowing colors.
  aurora,

  /// Molten magma with bubbling motion.
  magma,

  /// Soft rose and peach tones for pregnancy/feminine apps.
  rose,

  /// Warm pink red, like embryo inside mama background.
  embryo,
}

/// A customizable lava effect background using fragment shaders.
///
/// This widget provides various animated lava effects perfect for
/// app backgrounds. Each effect is powered by a fragment shader
/// for smooth, GPU-accelerated animations.
class LavaEffectBackground extends StatefulWidget {
  const LavaEffectBackground({
    super.key,
    this.type = LavaEffectType.gradientCycle,
    this.filmGrainIntensity = 0.02,
    this.animationSpeed = 1.0,
  });

  /// The type of lava effect to display.
  final LavaEffectType type;

  /// Intensity of film grain overlay (0.0 to 1.0).
  final double filmGrainIntensity;

  /// Speed multiplier for the animation (1.0 is normal speed).
  final double animationSpeed;

  @override
  State<LavaEffectBackground> createState() => _LavaEffectBackgroundState();
}

class _LavaEffectBackgroundState extends State<LavaEffectBackground> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  late final ValueNotifier<double> _timeNotifier;
  ui.FragmentShader? _shader;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _timeNotifier = ValueNotifier<double>(0.0);
    _ticker = createTicker(_onTick)..start();
    _loadShader();
  }

  @override
  void didUpdateWidget(LavaEffectBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.type != widget.type) {
      _loadShader();
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    _timeNotifier.dispose();
    _shader?.dispose();
    super.dispose();
  }

  Future<void> _loadShader() async {
    setState(() => _isLoading = true);

    try {
      final program = await ui.FragmentProgram.fromAsset(
        _getShaderPath(widget.type),
      );
      if (!mounted) return;

      setState(() {
        _shader?.dispose();
        _shader = program.fragmentShader();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Failed to load shader: $e');
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  String _getShaderPath(LavaEffectType type) {
    const prefix = 'packages/lava_background/lib/shaders/';
    switch (type) {
      case LavaEffectType.gradientCycle:
        return '${prefix}lava_gradient_cycle.frag';
      case LavaEffectType.fire:
        return '${prefix}lava_fire.frag';
      case LavaEffectType.plasma:
        return '${prefix}lava_plasma.frag';
      case LavaEffectType.aurora:
        return '${prefix}lava_aurora.frag';
      case LavaEffectType.magma:
        return '${prefix}lava_magma.frag';
      case LavaEffectType.rose:
        return '${prefix}lava_rose.frag';
      case LavaEffectType.embryo:
        return '${prefix}lava_embryo.frag';
    }
  }

  void _onTick(Duration elapsed) {
    // Update time without setState - only triggers CustomPainter repaint
    _timeNotifier.value = elapsed.inMilliseconds / 1000.0 * widget.animationSpeed;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _shader == null) {
      return ColoredBox(
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // RepaintBoundary isolates animated content from rest of widget tree
    return RepaintBoundary(
      child: CustomPaint(
        painter: _LavaEffectPainter(
          shader: _shader!,
          timeNotifier: _timeNotifier,
          filmGrainIntensity: widget.filmGrainIntensity,
        ),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _LavaEffectPainter extends CustomPainter {
  _LavaEffectPainter({
    required this.shader,
    required this.timeNotifier,
    required this.filmGrainIntensity,
  }) : super(repaint: timeNotifier);

  final ui.FragmentShader shader;
  final ValueNotifier<double> timeNotifier;
  final double filmGrainIntensity;

  @override
  void paint(Canvas canvas, Size size) {
    // Set shader uniforms
    shader
      ..setFloat(0, size.width) // iResolution.x
      ..setFloat(1, size.height) // iResolution.y
      ..setFloat(2, timeNotifier.value) // iTime
      ..setFloat(3, filmGrainIntensity); // filmGrainIntensity

    final paint = Paint()..shader = shader;
    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(_LavaEffectPainter oldDelegate) {
    return oldDelegate.timeNotifier != timeNotifier || oldDelegate.filmGrainIntensity != filmGrainIntensity;
  }
}
