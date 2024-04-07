const vertexShaderSource = `#version 300 es

    precision mediump float; // Specify the precision for float types

    in vec3 aPosition;
    in vec2 aOffset;
    in vec3 aColor;

    out vec4 vColor;
    out vec2 vTexCoord;
    out float vDepth;

    uniform mat4 uProjectionMatrix; 
    uniform mat4 uOffsetRotationMatrix;

    void main() {
        vec4 offset = vec4(aOffset, 0.0, 0.0);
        offset = uOffsetRotationMatrix * offset;
        vec4 position = vec4(aPosition, 1.0) + offset;
        position = uProjectionMatrix * position;
        
        gl_Position = position;
        vColor = vec4(aColor, 1.0);
        vTexCoord = normalize(vec2(aOffset.x, aOffset.y));
        vDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
    }
    `;

const fragmentShaderSource = `#version 300 es

    precision mediump float; // Specify the precision for float types

    in vec4 vColor;
    in vec2 vTexCoord;
    in float vDepth;
    out vec4 fragColor;
    uniform float uSphereRadius;

    void main() {       
        float normed_rad = length(vTexCoord) * 2.0;
        
        if (normed_rad > 1.0) {
            fragColor = vec4(0.0,0.0,0.0,1.0);
            gl_FragDepth = 1.0; // Adjust fragment depth    
        } else{
            float normalized_depth_offset = sqrt(1.0 - normed_rad * normed_rad);
            vec3 normal = normalize(vec3(vTexCoord.x, vTexCoord.y, normalized_depth_offset)); // Normalize the normal vector
            
            vec3 light = normalize(vec3(-1.0, 1.0, 1.0)); // Assuming light direction is normalized
            float lightIntensity = dot(light, normal); // Clamp dot product to [0, 1]
            vec4 outColor = vColor * (0.5 + lightIntensity);
            outColor.w = 1.0;
            float depth_offset = uSphereRadius * normalized_depth_offset; // Calculate depth offset
            gl_FragDepth = vDepth - 0.5*depth_offset;
            fragColor = outColor; // Apply lighting effect
        }
    }
    `;
