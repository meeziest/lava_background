#version 460 core

precision highp float;

#include <flutter/runtime_effect.glsl>

uniform vec2 uSize;
uniform float uTime;
uniform float uIntensity;

out vec4 fragColor;

// Simple hash function
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = FlutterFragCoord().xy / uSize;
    vec2 center = vec2(0.5);
    vec2 distVec = uv - center;
    float dist = length(distVec);

    // Create rays
    float angle = atan(distVec.y, distVec.x);
    float rayCount = 12.0;
    float rays = sin(angle * rayCount + uTime * 0.5);
    
    // Add some noise/texture to rays
    float noise = hash(uv * 10.0 + uTime * 0.1);
    
    // Soften rays
    rays = smoothstep(0.0, 1.0, rays * 0.5 + 0.5);

    // Radial falloff (core is bright, edges fade)
    float core = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Combine for shine effect
    float shine = core * (0.8 + 0.2 * rays) * uIntensity;
    
    // Add pulsing glow
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    shine *= pulse;

    // Output white with alpha based on shine
    fragColor = vec4(1.0, 1.0, 1.0, shine * core); // Fade out at edges
}
