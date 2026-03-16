import 'package:flutter/material.dart';
import 'package:lava_background/lava_background.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lava Background Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple, brightness: Brightness.dark),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  LavaEffectType _currentEffect = LavaEffectType.gradientCycle;
  double _animationSpeed = 1.0;
  double _filmGrainIntensity = 0.02;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Lava Background Default Demo', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stack(
        children: [
          // The lava effect background widget
          Positioned.fill(
            child: LavaEffectBackground(
              type: _currentEffect,
              animationSpeed: _animationSpeed,
              filmGrainIntensity: _filmGrainIntensity,
            ),
          ),
          
          // Foreground content
          SafeArea(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(128),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withAlpha(51)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Choose Shader Effect:',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Wrap with effect types
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      alignment: WrapAlignment.center,
                      children: LavaEffectType.values.map((type) {
                        return ChoiceChip(
                          visualDensity: VisualDensity.compact,
                          labelStyle: const TextStyle(fontSize: 12),
                          labelPadding: const EdgeInsets.symmetric(horizontal: 4),
                          label: Text(type.name),
                          selected: _currentEffect == type,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _currentEffect = type;
                              });
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 8),
                    // Simulation sliders
                    SizedBox(
                      height: 32,
                      child: Row(
                        children: [
                          const Icon(Icons.speed, color: Colors.white70, size: 16),
                          Expanded(
                            child: Slider(
                              value: _animationSpeed,
                              min: 0.1,
                              max: 3.0,
                              onChanged: (val) => setState(() => _animationSpeed = val),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 32,
                      child: Row(
                        children: [
                          const Icon(Icons.grain, color: Colors.white70, size: 16),
                          Expanded(
                            child: Slider(
                              value: _filmGrainIntensity,
                              min: 0.0,
                              max: 0.1,
                              onChanged: (val) => setState(() => _filmGrainIntensity = val),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
