precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform mediump int shellIndex;
uniform mediump int shellCount;
uniform mediump float shellLength;
uniform mediump float shellDistanceAttenuation;
uniform float uTime;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;
float simpleHash(float x) {
    float result = sin(x) * 43758.5453;
    result = fract(result);
    result += sin(result * 67.345) * 43141.59265;
    result = fract(result);
    result += sin(result * 91.345) * 54325.32134;
    result = fract(result);
    return result;
}

float hash(int n) {
    float seed = float(n);
    return simpleHash(seed);
}
void main() {
    // Calculate normalized height of the shell
    float shellHeight = float(shellIndex) / float(shellCount);
    shellHeight = pow(shellHeight, shellDistanceAttenuation);

    int seed = int(uv.x + 100.0 * uv.y + 100.0 * 10.0);
    float noise = hash(seed);
    float noise2 = hash(seed + 1);

    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vPosition = position + normal * shellLength * shellHeight;

    vPosition.z += noise2 * 0.2;
    vPosition.z = smoothstep(0.0, 1.0, vPosition.z);

    float wind = sin(uTime * 0.002 + uv.x * 10.0 + uv.y * 10.0) * 0.1;
    vPosition.x += wind * noise;

    // Transform the vertex position to clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
