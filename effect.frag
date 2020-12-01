#version 300 es
precision mediump float;
#define PI 3.1416

vec2 pixelate ( vec2 pixel, vec2 details ) { return floor(pixel * details) / details; }
float luminance ( vec3 color ) { return (color.r + color.g + color.b) / 3.0; }
out vec4 fragColor;
// in vec2 gl_FragCoord;
in vec2 vTexCoord;

uniform sampler2D cam;
uniform sampler2D tex0;
uniform vec2 resolution;

void main()
{
    // Get normalized texture coordinates
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Aspect ratio fix
   	uv.x -= 0.5;
    uv.x *= resolution.x / resolution.y;
    uv.x += 0.5;

    // Inverse texture coordinates
    uv = 1.0 - uv;

    // vec4 cam = texture2D(tex0, uv);

    // Pixelate
   	uv = pixelate(uv, resolution.xy / 4.0);

    // Maths infos about the current pixel position
    vec2 center = uv - vec2(0.5);
    float angle = atan(center.y, center.x);
    float radius = length(center);
    float ratioAngle = (angle / PI) * 0.5 + 0.5;

    // Displacement from noise
    vec2 angleUV = mod(abs(vec2(0, angle / PI)), 1.0);
    // float offset = texture(iChannel1, angleUV).r * 0.5;
    float offset = texture(cam, angleUV).r * 0.5;

    // Displaced pixel color
    vec2 p = vec2(cos(angle), sin(angle)) * offset + vec2(0.5);

    // Apply displacement
    uv = mix(uv, p, step(offset, radius));

    // Get color from texture
    // vec3 color = texture(iChannel0, uv).rgb;
    vec3 color = texture(cam, uv).rgb;
    // Treshold color from luminance
    float lum = luminance(color);
    color = mix(vec3(0), vec3(1,0,0), step(0.45, lum));
    color = mix(color, vec3(1,1,0), step(0.65, lum));
    color = mix(color, vec3(1,1,1), step(0.85, lum));

    // Voila
	fragColor = vec4(color,1.0);
}
