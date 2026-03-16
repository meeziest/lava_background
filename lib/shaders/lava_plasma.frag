// Electric plasma shader with dynamic neon colors
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
    
    // Electric, chaotic rotation
    float degree = noise(vec2(iTime*.15, tuv.x*tuv.y));
    tuv *= Rot(radians((degree-.5)*900. + iTime * 50.));
    
    // High-frequency plasma waves
    float frequency = 12.;
    float amplitude = 25.;
    float speed = iTime * 4.;
    
    // Complex wave patterns
    tuv.x += sin(tuv.y*frequency + speed)/amplitude;
    tuv.y += cos(tuv.x*frequency*1.3 + speed)/(amplitude*.7);
    tuv.x += cos(tuv.y*frequency*0.7 - speed)/(amplitude*1.2);
    tuv.y += sin(tuv.x*frequency*1.8 + speed*0.5)/(amplitude*.9);
    
    tuv.y *= aspectRatio;
    
    // Electric neon colors
    vec3 electricBlue = vec3(0, 234, 255) / vec3(255);
    vec3 neonPurple = vec3(191, 0, 255) / vec3(255);
    vec3 hotPink = vec3(255, 0, 127) / vec3(255);
    vec3 brightCyan = vec3(0, 255, 255) / vec3(255);
    vec3 deepPurple = vec3(75, 0, 130) / vec3(255);
    vec3 magenta = vec3(255, 0, 255) / vec3(255);
    
    // Fast pulsing cycle for electric effect
    float cycle = sin(iTime * 2.0);
    float t = (cycle + 1.) / 2.;
    
    vec3 color1 = mix(electricBlue, neonPurple, t);
    vec3 color2 = mix(deepPurple, hotPink, t);
    vec3 color3 = mix(hotPink, brightCyan, t);
    vec3 color4 = mix(magenta, electricBlue, t);
    
    // Sharp, electric gradients
    vec3 layer1 = mix(color3, color2, smoothstep(-.5, .5, (tuv*Rot(radians(-15.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.5, .5, (tuv*Rot(radians(10.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.7, -.5, tuv.y));
    
    // Boost saturation for plasma effect
    color = color * 1.2;
    
    // Apply film grain
    color = color - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
