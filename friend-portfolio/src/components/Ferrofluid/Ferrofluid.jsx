import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Ferrofluid.css'

const MAX_COLORS = 8

const hexToRgb = (hex) => {
  const color = hex.replace('#', '').padEnd(6, '0')
  return [0, 2, 4].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
}

const prepareColors = (input) => {
  const base = (input?.length ? input : ['#c9c4ce']).slice(0, MAX_COLORS)
  return {
    colors: Array.from({ length: MAX_COLORS }, (_, index) => hexToRgb(base[Math.min(index, base.length - 1)])),
    count: base.length,
  }
}

const flowVector = (direction) => ({ up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] })[direction] ?? [0, -1]

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`

const fragment = `
precision highp float;
uniform vec3 iResolution; uniform vec2 iMouse; uniform float iTime;
uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6; uniform vec3 uColor7;
uniform int uColorCount; uniform vec2 uFlow; uniform float uSpeed; uniform float uScale;
uniform float uTurbulence; uniform float uFluidity; uniform float uRimWidth;
uniform float uSharpness; uniform float uShimmer; uniform float uGlow; uniform float uOpacity;
varying vec2 vUv;
#define PI 3.14159265
vec3 palette(float h) {
  int count = uColorCount; if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0; if (idx == 1) return uColor1; if (idx == 2) return uColor2;
  if (idx == 3) return uColor3; if (idx == 4) return uColor4; if (idx == 5) return uColor5;
  if (idx == 6) return uColor6; return uColor7;
}
float hash(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float smin(float a, float b, float k) { float r = exp2(-a / k) + exp2(-b / k); return -k * log2(r); }
float sinlerp(float a, float b, float w) { return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0); }
float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s); vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed)); float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed)); float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  return sinlerp(sinlerp(g1, g2, relp.x / s), sinlerp(g4, g3, relp.x / s), relp.y / s);
}
float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  return (2.0 * vn(p, s, seed) + 1.5 * vn(p + vec2(o), s, seed + 0.1) +
    1.25 * vn(p + vec2(-o, o), s, seed + 0.2) + 1.125 * vn(p + vec2(o, -o), s, seed + 0.3) +
    vn(p - vec2(o), s, seed + 0.4)) / 7.0;
}
void mainImage(out vec4 fragColor, vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05); vec2 p = fragCoord / iResolution.y * ref;
  float spd = 200.0 * uSpeed; float t = iTime; vec2 dir = uFlow; vec2 perp = vec2(-dir.y, dir.x);
  float d1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float d2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + d1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + d2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float merged = smin(peaks, peaks2, max(uFluidity, 0.001));
  float band = (uRimWidth - abs((merged - 0.4) * 2.0)) * 5.0;
  float light = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  light = pow(light, uSharpness) * uGlow;
  vec3 color = palette(clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0)) * light;
  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
  fragColor = vec4(color, alpha * uOpacity);
}
void main() { vec4 color; mainImage(color, vUv * iResolution.xy); gl_FragColor = color; }
`

export default function Ferrofluid({
  colors = ['#ffffff', '#ffffff', '#ffffff'], speed = 0.5, scale = 1.6,
  turbulence = 1, fluidity = 0.1, rimWidth = 0.2, sharpness = 2.5,
  shimmer = 1.5, glow = 2, flowDirection = 'down', opacity = 1,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let renderer
    let frameId
    let observer
    try {
      const mobile = window.matchMedia('(max-width: 47.99rem)').matches
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35), alpha: true, antialias: false })
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      container.appendChild(gl.canvas)
      const prepared = prepareColors(colors)
      const uniforms = {
        iResolution: { value: [1, 1, 1] }, iMouse: { value: [0, 0] }, iTime: { value: 0 },
        uColor0: { value: prepared.colors[0] }, uColor1: { value: prepared.colors[1] }, uColor2: { value: prepared.colors[2] }, uColor3: { value: prepared.colors[3] },
        uColor4: { value: prepared.colors[4] }, uColor5: { value: prepared.colors[5] }, uColor6: { value: prepared.colors[6] }, uColor7: { value: prepared.colors[7] },
        uColorCount: { value: prepared.count }, uFlow: { value: flowVector(flowDirection) }, uSpeed: { value: speed }, uScale: { value: scale },
        uTurbulence: { value: turbulence }, uFluidity: { value: fluidity }, uRimWidth: { value: rimWidth }, uSharpness: { value: sharpness },
        uShimmer: { value: shimmer }, uGlow: { value: glow }, uOpacity: { value: opacity },
      }
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) })
      const resize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight)
        uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
      }
      resize()
      observer = new ResizeObserver(resize)
      observer.observe(container)
      const render = (time) => {
        uniforms.iTime.value = time * 0.001
        renderer.render({ scene: mesh })
        frameId = requestAnimationFrame(render)
      }
      frameId = requestAnimationFrame(render)
    } catch (error) {
      console.error('Ferrofluid failed to initialize:', error)
      container.replaceChildren()
    }

    return () => {
      cancelAnimationFrame(frameId)
      observer?.disconnect()
      renderer?.gl?.canvas?.remove()
    }
  }, [colors, flowDirection, fluidity, glow, opacity, rimWidth, scale, sharpness, shimmer, speed, turbulence])

  return <div ref={containerRef} className="ferrofluid" aria-hidden="true" />
}
