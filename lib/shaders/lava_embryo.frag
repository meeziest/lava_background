// Embryo shader using the lava_gradient_cycle logic
// Soft, rhythmic motion with deep pinkish-red and dark crimson tones

#version 460 core
precision mediump float;

#include <flutter/runtime_effect.glsl>

uniform vec2 iResolution;
uniform float iTime;
uniform float filmGrainIntensity;

out vec4 fragColor;

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
    return fract(sin(p)*43758.5453);
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f*f*(3.0-2.0*f);

    float n = mix(mix(dot(-1.0+2.0*hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(-1.0+2.0*hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    return 0.5 + 0.5*n;
}

float filmGrainNoise(in vec2 uv) {
    return length(hash(vec2(uv.x, uv.y)));
}

void main()
{
    vec2 fragCoord = FlutterFragCoord().xy;
    vec2 uv = fragCoord / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    // Double heartbeat effect (lub-dub rhythm)
    float t_hb = iTime * 2.2;
    float beat1 = pow(max(0.0, sin(t_hb)), 6.0);
    float beat2 = pow(max(0.0, sin(t_hb - 0.45)), 6.0) * 0.5;
    float pulseFactor = beat1 + beat2;
    
    // Initialize tuv as centered UV coordinates
    vec2 tuv = uv - 0.5;
    
    // Fluid rotation and STRONG zoom pulse (scale heartbeat)
    float rotAngle = iTime * 0.12 + noise(vec2(iTime * 0.15, 0.0)) * 2.5;
    tuv *= Rot(rotAngle);
    
    // Scale effect: 1.0 minus pulse means coordinates shrink -> texture zooms IN (expands)
    // Increased intensity for distinct "scale heartbeat"
    tuv *= (1.0 - pulseFactor * 0.12);

    // Second layer of noise-based rotation for "fluidity"
    float degree = noise(vec2(iTime * 0.04, tuv.x * tuv.y));
    tuv.y *= 1. / aspectRatio;
    tuv *= Rot(radians((degree - .5) * 360.0));
    tuv.y *= aspectRatio;

    // Wave warp with sine
    float frequency = 5.;
    float amplitude = 30.;
    float speed = iTime * 1.8;
    tuv.x += sin(tuv.y * frequency + speed) / amplitude;
    tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * .5);
    
    // Warm Red/Pink & Light Accent Palette (Set 1)
    vec3 brightPinkRed = vec3(225, 60, 80) / 255.0;
    vec3 lightPeach = vec3(255, 215, 180) / 255.0;
    vec3 softRose = vec3(240, 100, 120) / 255.0;
    vec3 palePink = vec3(255, 210, 220) / 255.0;
    
    // Deeper Dark & Warm Glow Palette (Set 2)
    vec3 darkBurgundy = vec3(80, 5, 20) / 255.0;
    vec3 softCoral = vec3(255, 160, 140) / 255.0;
    vec3 deepMagenta = vec3(140, 20, 70) / 255.0;
    vec3 brightSalmon = vec3(255, 120, 110) / 255.0;
    
    // Interpolate between sets for evolving atmosphere
    float cycle = sin(iTime * 0.4);
    float t = (sign(cycle) * pow(abs(cycle), 0.6) + 1.) / 2.;
    
    vec3 color1 = mix(brightPinkRed, darkBurgundy, t);
    vec3 color2 = mix(lightPeach, softCoral, t);
    vec3 color3 = mix(softRose, deepMagenta, t);
    vec3 color4 = mix(palePink, brightSalmon, t);

    // Blend layers following the logic of lava_gradient_cycle
    vec3 layer1 = mix(color3, color2, smoothstep(-.3, .2, (tuv*Rot(radians(-5.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.5, -.3, tuv.y));

    // Dynamic color "flush" during heartbeats
    // Make it more vibrant/warm during the beat
    color = mix(color, color * vec3(1.15, 1.05, 1.1), pulseFactor * 0.4);

    // Apply pulse to final brightness
    color *= (0.94 + pulseFactor * 0.12);

    // Apply film grain
    color = color - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
