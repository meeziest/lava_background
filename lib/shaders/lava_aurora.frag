// Aurora-like flowing shader with ethereal colors
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
    
    // Gentle, flowing rotation
    float degree = noise(vec2(iTime*.03, tuv.x*tuv.y));
    tuv *= Rot(radians((degree-.5)*360. + iTime * 10.));
    
    // Slow, gentler waves for aurora effect
    float frequency = 4.;
    float amplitude = 40.;
    float speed = iTime * 1.5;
    
    // Vertical flowing motion
    tuv.x += sin(tuv.y*frequency + speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*0.8 + speed*1.2)/(amplitude*.8);
    
    // Add wavy motion
    tuv.x += cos(tuv.y*frequency*1.5 - speed*0.5)/(amplitude*1.5);
    
    tuv.y *= aspectRatio;
    
    // Aurora colors - ethereal greens, blues, purples, and pinks
    vec3 deepTeal = vec3(0, 77, 64) / vec3(255);
    vec3 auroraGreen = vec3(0, 255, 127) / vec3(255);
    vec3 skyBlue = vec3(135, 206, 250) / vec3(255);
    vec3 softPurple = vec3(147, 112, 219) / vec3(255);
    vec3 darkNavy = vec3(0, 31, 63) / vec3(255);
    vec3 mintGreen = vec3(152, 255, 152) / vec3(255);
    
    // Slow, dreamy cycle
    float cycle = sin(iTime * 0.3);
    float t = (cycle + 1.) / 2.;
    
    vec3 color1 = mix(auroraGreen, skyBlue, t);
    vec3 color2 = mix(deepTeal, darkNavy, t);
    vec3 color3 = mix(mintGreen, softPurple, t);
    vec3 color4 = mix(skyBlue, auroraGreen, t);
    
    // Soft, ethereal gradients
    vec3 layer1 = mix(color3, color2, smoothstep(-.2, .3, (tuv*Rot(radians(-3.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.2, .3, (tuv*Rot(radians(3.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.4, -.2, tuv.y));
    
    // Subtle brightness shift for aurora shimmer
    float shimmer = noise(tuv * 2.0 + vec2(iTime * 0.2, 0.0));
    color += shimmer * 0.08;
    
    // Apply film grain
    color = color - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
