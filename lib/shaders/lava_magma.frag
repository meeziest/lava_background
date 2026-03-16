// Molten magma shader with bubbling motion
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
    
    for(int i = 0; i < 4; i++) {
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
    
    // Slow, viscous rotation
    float degree = noise(vec2(iTime*.04, tuv.x*tuv.y));
    tuv *= Rot(radians((degree-.5)*540.));
    
    // Medium frequency for magma bubbling effect
    float frequency = 6.;
    float amplitude = 35.;
    float speed = iTime * 1.2;
    
    // Bubbling motion
    tuv.x += sin(tuv.y*frequency + speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.1 + speed)/(amplitude*.7);
    
    // Add turbulent bubbles
    float bubbles = fbm(tuv * 4.0 + vec2(0.0, iTime * 0.3));
    tuv += bubbles * 0.08;
    
    // Secondary wave layer for depth
    tuv.x += cos(tuv.y*frequency*0.6 - speed*0.8)/(amplitude*1.3);
    
    tuv.y *= aspectRatio;
    
    // Molten magma colors - deep reds, oranges, and dark blacks
    vec3 darkCrimson = vec3(60, 0, 0) / vec3(255);
    vec3 moltenRed = vec3(220, 20, 60) / vec3(255);
    vec3 hotOrange = vec3(255, 120, 0) / vec3(255);
    vec3 glowingYellow = vec3(255, 200, 50) / vec3(255);
    vec3 deepBrown = vec3(70, 30, 10) / vec3(255);
    vec3 charcoalBlack = vec3(15, 10, 5) / vec3(255);
    
    // Slow, heavy pulsing
    float cycle = sin(iTime * 0.8);
    float t = (cycle + 1.) / 2.;
    
    vec3 color1 = mix(moltenRed, glowingYellow, t);
    vec3 color2 = mix(darkCrimson, charcoalBlack, t);
    vec3 color3 = mix(hotOrange, moltenRed, t);
    vec3 color4 = mix(glowingYellow, deepBrown, t);
    
    // Layered blending for magma depth
    vec3 layer1 = mix(color3, color2, smoothstep(-.35, .25, (tuv*Rot(radians(-8.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.35, .25, (tuv*Rot(radians(6.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.55, -.35, tuv.y));
    
    // Add hot spots based on bubbles
    color += bubbles * vec3(0.2, 0.1, 0.0);
    
    // Apply film grain
    color = color - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
