// Fiery lava shader with intense heat effect
// Modified for Flutter

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

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float filmGrainNoise(in vec2 uv) {
    return length(hash(vec2(uv.x, uv.y)));
}

void main()
{
    vec2 fragCoord = FlutterFragCoord().xy;
    vec2 uv = fragCoord / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    vec2 tuv = uv - .5;
    tuv.y *= 1./aspectRatio;
    
    // Fire-like turbulent motion
    float degree = noise(vec2(iTime*.1, tuv.x*tuv.y));
    tuv *= Rot(radians((degree-.5)*360.));
    
    // Multiple layers of distortion for fire effect
    float frequency = 8.;
    float amplitude = 20.;
    float speed = iTime * 3.;
    
    tuv.x += sin(tuv.y*frequency + speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.2 + speed)/(amplitude*.6);
    
    // Add turbulence
    float turbulence = fbm(tuv * 3.0 + vec2(0.0, iTime * 0.5));
    tuv += turbulence * 0.1;
    
    tuv.y *= aspectRatio;
    
    // Hot fire colors
    vec3 darkRed = vec3(139, 0, 0) / vec3(255);
    vec3 fieryRed = vec3(255, 69, 0) / vec3(255);
    vec3 orange = vec3(255, 140, 0) / vec3(255);
    vec3 brightYellow = vec3(255, 215, 0) / vec3(255);
    vec3 deepOrange = vec3(255, 99, 71) / vec3(255);
    vec3 almostBlack = vec3(20, 0, 0) / vec3(255);
    
    // Intense pulsing cycle
    float cycle = sin(iTime * 1.5);
    float t = (cycle + 1.) / 2.;
    
    // More intense color mixing
    vec3 color1 = mix(fieryRed, brightYellow, t);
    vec3 color2 = mix(darkRed, almostBlack, t);
    vec3 color3 = mix(orange, deepOrange, t);
    vec3 color4 = mix(brightYellow, fieryRed, t);
    
    // Layer blending with more dramatic gradients
    vec3 layer1 = mix(color2, color3, smoothstep(-.4, .3, (tuv*Rot(radians(-10.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.4, .3, (tuv*Rot(radians(5.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.6, -.4, tuv.y));
    
    // Add brightness variation based on turbulence
    color += turbulence * 0.15;
    
    // Apply film grain
    color = color - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
