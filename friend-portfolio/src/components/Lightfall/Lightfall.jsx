import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Lightfall.css'

const MAX_COLORS = 8

const hexToRgb = (hex) => {
  const color = hex.replace('#', '').padEnd(6, '0')
  return [0, 2, 4].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
}

const prepareColors = (input) => {
  const base = input.slice(0, MAX_COLORS)
  const colors = Array.from({ length: MAX_COLORS }, (_, index) => hexToRgb(base[Math.min(index, base.length - 1)]))
  const average = base.reduce((sum, _, index) => sum.map((value, channel) => value + colors[index][channel]), [0, 0, 0]).map((value) => value / base.length)
  return { colors, count: base.length, average }
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`

const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6; uniform vec3 uColor7;
uniform int uColorCount;
uniform vec3 uBgColor; uniform vec3 uMouseColor;
uniform float uSpeed; uniform int uStreakCount; uniform float uStreakWidth;
uniform float uStreakLength; uniform float uGlow; uniform float uDensity;
uniform float uTwinkle; uniform float uZoom; uniform float uBgGlow;
uniform float uOpacity; uniform float uMouseEnabled; uniform float uMouseStrength;
uniform float uMouseRadius;
varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0; if (idx == 1) return uColor1;
  if (idx == 2) return uColor2; if (idx == 3) return uColor3;
  if (idx == 4) return uColor4; if (idx == 5) return uColor5;
  if (idx == 6) return uColor6; return uColor7;
}

vec3 tanhv(vec3 x) { vec3 e = exp(-2.0 * x); return (1.0 - e) / (1.0 + e); }

vec2 sceneC(vec2 frag, vec2 resolution) {
  vec2 p = (frag + frag - resolution) / resolution.x;
  float z = 0.0; float d = 1e3; vec4 o = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    o = z * normalize(vec4(p, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(o * o)); z += d;
  }
  return vec2(o.x, atan(o.z, o.y));
}

void mainImage(out vec4 outputColor, vec2 coord) {
  vec2 resolution = iResolution.xy;
  vec2 uv = (coord + coord - resolution) / resolution.x;
  float time = 0.1 * iTime * uSpeed + 9.0;
  float rings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 cell = vec2(5e-3, 6.28318530718 / rings);
  vec2 c0 = sceneC(coord, resolution);
  vec2 dx = sceneC(coord + vec2(1.0, 0.0), resolution) - c0;
  vec2 dy = sceneC(coord + vec2(0.0, 1.0), resolution) - c0;
  dx.y -= 6.28318530718 * floor(dx.y / 6.28318530718 + 0.5);
  dy.y -= 6.28318530718 * floor(dy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dx) + abs(dy);
  vec2 scene = c0;
  vec2 p = vec2(2.0, 1.0) * uv - (resolution / resolution.x) * vec2(0.0, 1.0);
  vec4 light = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(p, p) + 6.0), 0.0);
  float mouseGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mouse = (iMouse + iMouse - resolution) / resolution.x;
    float distanceToMouse = length(uv - mouse);
    mouseGlow = exp(-distanceToMouse * distanceToMouse / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    light.rgb += uMouseColor * mouseGlow * 0.25;
  }
  float radius = 5e-4 * uStreakWidth;
  vec2 antialias = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);
  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float index = float(m) + 1.0;
    float random = fract(sin(dot(vec2(index, floor(scene.x / cell.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 particle = scene - (time + time * random) * vec2(0.0, 1.0);
    particle -= floor(particle / cell + 0.5) * cell;
    float hue = fract(8663.0 * random);
    float weight = mix(1.5, 1.0 + sin(time + 7.0 * hue + 4.0), uTwinkle) * (1.0 + mouseGlow * 2.0);
    vec2 inner = vec2(length(max(particle, vec2(-1.0, 0.0))), length(particle) - radius) - radius;
    vec2 shape = vec2(1.0) - smoothstep(-antialias, antialias, inner);
    light.rgb += dot(shape, vec2(exp(tail * particle.y), 3.0)) * palette(hue) * weight;
    scene.x += cell.x / 8.0;
  }
  vec3 color = sqrt(tanhv(max(light.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  outputColor = vec4(color, uOpacity);
}

void main() { vec4 color; mainImage(color, vUv * iResolution.xy); gl_FragColor = color; }
`

export default function Lightfall({
  colors, backgroundColor, speed, streakCount, streakWidth, streakLength, glow,
  density, twinkle, zoom, backgroundGlow, opacity, mouseInteraction,
  mouseStrength, mouseRadius, mouseDampening,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 47.99rem)').matches
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5), alpha: true, antialias: true })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    const prepared = prepareColors(colors)
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] }, iMouse: { value: [0, 0] }, iTime: { value: 0 },
      uColor0: { value: prepared.colors[0] }, uColor1: { value: prepared.colors[1] }, uColor2: { value: prepared.colors[2] }, uColor3: { value: prepared.colors[3] },
      uColor4: { value: prepared.colors[4] }, uColor5: { value: prepared.colors[5] }, uColor6: { value: prepared.colors[6] }, uColor7: { value: prepared.colors[7] },
      uColorCount: { value: prepared.count }, uBgColor: { value: hexToRgb(backgroundColor) }, uMouseColor: { value: prepared.average },
      uSpeed: { value: speed }, uStreakCount: { value: streakCount },
      uStreakWidth: { value: streakWidth }, uStreakLength: { value: streakLength }, uGlow: { value: glow }, uDensity: { value: density },
      uTwinkle: { value: twinkle }, uZoom: { value: zoom }, uBgGlow: { value: backgroundGlow }, uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 }, uMouseStrength: { value: mouseStrength }, uMouseRadius: { value: mouseRadius },
    }
    const program = new Program(gl, { vertex, fragment, uniforms })
    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })
    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight)
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
    }
    const targetMouse = [0, 0]
    const onPointerMove = (event) => {
      const scale = renderer.dpr || 1
      targetMouse[0] = event.clientX * scale
      targetMouse[1] = (window.innerHeight - event.clientY) * scale
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    if (mouseInteraction) window.addEventListener('pointermove', onPointerMove, { passive: true })

    let frameId
    let lastTime = performance.now()
    const render = (time) => {
      const delta = (time - lastTime) / 1000
      lastTime = time
      const factor = 1 - Math.exp(-delta / Math.max(mouseDampening, 0.0001))
      uniforms.iMouse.value[0] += (targetMouse[0] - uniforms.iMouse.value[0]) * factor
      uniforms.iMouse.value[1] += (targetMouse[1] - uniforms.iMouse.value[1]) * factor
      uniforms.iTime.value = reducedMotion ? 0 : time * 0.001
      renderer.render({ scene: mesh })
      if (!reducedMotion) frameId = requestAnimationFrame(render)
    }
    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [backgroundColor, backgroundGlow, colors, density, glow, mouseDampening, mouseInteraction, mouseRadius, mouseStrength, opacity, speed, streakCount, streakLength, streakWidth, twinkle, zoom])

  return <div ref={containerRef} className="lightfall" aria-hidden="true" />
}
