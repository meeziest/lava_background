// Rose shader with soft pink and peach tones
// Perfect for pregnancy/feminine apps
// Modified to follow lava_gradient_cycle.frag movement

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
    
    // Transformed uv
    vec2 tuv = uv - .5;

    // Rotate with noise - using cycle logic
    float degree = noise(vec2(iTime*.05, tuv.x*tuv.y));

    tuv.y *= 1./aspectRatio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= aspectRatio;

    // Wave warp with sine - using cycle logic
    float frequency = 5.;
    float amplitude = 30.;
    float speed = iTime * 2.;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    
    // Rose color palette
    vec3 peachyBeige = vec3(255, 245, 235) / vec3(255);
    vec3 coraPink = vec3(241, 76, 132) / vec3(255);
    vec3 softRose = vec3(255, 182, 193) / vec3(255);
    vec3 lavenderPink = vec3(230, 190, 220) / vec3(255);
    
    // Alt rose palette
    vec3 deepRose = vec3(200, 50, 100) / vec3(255);
    vec3 creamyWhite = vec3(255, 255, 245) / vec3(255);
    vec3 peachyPink = vec3(255, 160, 160) / vec3(255);
    vec3 darkRose = vec3(150, 40, 80) / vec3(255);
    
    // Interpolate between light and dark gradient using the power curve
    float cycle = sin(iTime * 0.5);
    float t = (sign(cycle) * pow(abs(cycle), 0.6) + 1.) / 2.;
    
    vec3 color1 = mix(peachyBeige, deepRose, t);
    vec3 color2 = mix(coraPink, creamyWhite, t);
    vec3 color3 = mix(softRose, peachyPink, t);
    vec3 color4 = mix(lavenderPink, darkRose, t);

    // Blend the gradient colors and apply transformations
    vec3 layer1 = mix(color3, color2, smoothstep(-.3, .2, (tuv*Rot(radians(-5.))).x));
    vec3 layer2 = mix(color4, color1, smoothstep(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec3 color = mix(layer1, layer2, smoothstep(.5, -.3, tuv.y));

    // Optional: Blur/Fade top and bottom edges in the shader
    float edgeFade = smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
    // Instead of pure black, we fade to the first color or a dimmed version
    vec3 bgColor = mix(color, color * 0.95, 1.0 - edgeFade); 
    
    // Apply film grain
    color = bgColor - filmGrainNoise(uv) * filmGrainIntensity;
    
    fragColor = vec4(color, 1.0);  
}
