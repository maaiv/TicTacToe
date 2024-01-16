#ifdef GL_ES

precision mediump float;

#endif



uniform vec2 u_resolution;
uniform float u_time;


#define PI 3.14159

vec3 hsl2rgb( in float h, in float s, in float l ) {
    vec3 rgb = clamp( abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return l + s * (rgb-0.5)*(1.0-abs(2.0 * l - 1.0));
}

vec4 getValue( in vec2 pos, float t) {
    float l = 1.0*length(pos)/u_resolution.y;


    float a = atan(pos.y,pos.x);

    float f = abs(cos(a*t*2.))*0.5+0.3 ;

    

    vec3 rgb = hsl2rgb(l+a/PI+t*2.0,1.0, 0.2 );

    l = pow(0.1/(l - f/2.), 1.4);

    return vec4(l * rgb, 1.0);


}

void main() {


    gl_FragColor = getValue(gl_FragCoord.xy - u_resolution.xy/2.0 , u_time/10.0);
}