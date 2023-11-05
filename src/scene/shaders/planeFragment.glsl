precision mediump float;

uniform mediump int shellIndex;
uniform mediump int shellCount;
uniform mediump float density;
uniform mediump float noiseMin;
uniform mediump float noiseMax;
uniform mediump float thickness;
uniform mediump float attenuation;
uniform mediump float occlusionBias;
uniform mediump float shellDistanceAttenuation;
uniform mediump vec3 shellColor;
uniform mediump mat3 normalMatrix;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
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

    // Finalize the normal by converting it to world space
    vec3 normalWorld = normalize(normalMatrix * vNormal);

    // Calculate local UVs
    vec2 newUV = vUv * density;
    vec2 localUV = (fract(newUV) * 2.0 - 1.0);

    // Calculate local distance from the center
    float localDistanceFromCenter = length(localUV);

    // Cast local UVs to integers for use in the hashing function
    vec2 tid = vec2(newUV);
    int seed = int(tid.x + 100.0 * tid.y + 100.0 * 10.0);

    // Generate a random number for length interpolation
    float rand = mix(noiseMin, noiseMax, hash(seed));

    // Calculate normalized shell height
    float h = float(shellIndex) / float(shellCount);

    // Condition for discarding pixels outside thickness
    int outsideThickness = int(localDistanceFromCenter > (thickness * (rand - h * 0.5)));
    if(outsideThickness > 0 && shellIndex > 0) {
        discard;
    }

     // Lighting calculation
    vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.0)); // Replace with actual light direction
    float ndotl = clamp(dot(normalWorld, lightDirection), 0.0, 1.0) * 0.5 + 0.5;
    ndotl = pow(ndotl, 0.1);

    float ambientOcclusion = pow(h, attenuation);
    ambientOcclusion += occlusionBias;
    ambientOcclusion = clamp(ambientOcclusion, 0.0, 1.0);

    // Final color calculation
    vec3 finalColor = shellColor * ndotl * ambientOcclusion;

    gl_FragColor = vec4(finalColor, 1.0);

}
