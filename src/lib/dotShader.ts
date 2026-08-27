import * as THREE from "three";

/**
 * Two-pass gooey dot-matrix shader, ported from the reference build.
 *
 * Pass 1 renders a low-res animated sine field into a red-channel target.
 * Pass 2 samples that field per grid cell and unions neighbouring circles with
 * a smooth-min, producing metaball dots that swell and merge.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FIELD_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uReveal;

  varying vec2 vUv;

  void main() {
    vec2 c = 2.0 * vUv - 1.0;
    float ds = uAmplitude * uReveal;

    c += ds * 0.4 * sin(c.yx + vec2(1.2, 3.4) + uTime);
    c += ds * 0.2 * sin(5.2 * c.yx + vec2(3.5, 0.4) + uTime);
    c += ds * 0.3 * sin(3.5 * c.yx + vec2(1.2, 3.1) + uTime);
    c += ds * 1.6 * sin(0.4 * c.yx + vec2(0.8, 2.4) + uTime);

    float L = length(c);
    float v = 0.0;
    for (int i = 0; i < 4; i++) {
      v = mix(v, float(i) / 3.0, cos(float(i) * L));
    }

    gl_FragColor = vec4(clamp(v, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`;

const DOT_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uFieldTex;
  uniform vec2 uFieldRes;
  uniform vec2 uResolution;
  uniform float uReveal;

  uniform float uPixelSize;
  uniform float uGooeyness;
  uniform float uContrast;
  uniform float uBias;
  uniform int uInvert;
  uniform vec3 uBg;
  uniform vec3 uFg;
  uniform int uTransparentBg;

  uniform float uWaveTime;
  uniform float uWaveFrequency;
  uniform float uWaveAmplitude;

  varying vec2 vUv;

  float lumaToRadius(float luma, float pixelSize, float biasOffset) {
    float v = clamp((luma - 0.5 + uBias + biasOffset) * uContrast + 0.5, 0.0, 1.0);
    if (uInvert == 1) v = 1.0 - v;
    return v * pixelSize * 0.6 + pixelSize * 0.05;
  }

  float smin(float a, float b, float k) {
    if (k <= 0.001) return min(a, b);
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  void main() {
    vec2 pixelCoord = vUv * uResolution;
    vec2 baseCellIndex = floor(pixelCoord / uPixelSize);
    float minDist = 1.0e5;
    float smoothK = uGooeyness * 1.5;

    // R=1 -> 3x3 neighborhood, checkerboard skip -> 5 active cells/fragment.
    const int R = 1;
    for (int dx = -R; dx <= R; dx++) {
      for (int dy = -R; dy <= R; dy++) {
        vec2 cellIndex = baseCellIndex + vec2(float(dx), float(dy));
        if (mod(cellIndex.x + cellIndex.y, 2.0) > 0.5) continue;

        vec2 cellCenter = (cellIndex + 0.5) * uPixelSize;
        vec2 fieldUv    = (cellIndex + 0.5) / uFieldRes;
        float luma      = texture2D(uFieldTex, fieldUv).r;

        float cellY     = cellCenter.y / uResolution.y;
        float wavePhase = cellY * uWaveFrequency * 6.2831853 - uWaveTime;
        float waveBias  = sin(wavePhase) * uWaveAmplitude;

        float dist   = length(pixelCoord - cellCenter);
        float radius = lumaToRadius(luma, uPixelSize, waveBias);
        minDist = smin(minDist, dist - radius, smoothK * uPixelSize);
      }
    }

    float aa    = max(fwidth(minDist), 0.0001);
    float shape = 1.0 - smoothstep(-aa, aa, minDist);

    if (uTransparentBg == 1) {
      gl_FragColor = vec4(uFg * uReveal, shape * uReveal);
    } else {
      vec3 color = mix(uBg, uFg, shape);
      gl_FragColor = vec4(color * uReveal, 1.0);
    }
  }
`;

export type DotShaderOptions = Partial<typeof DEFAULTS>;

/** Reference defaults, with bg/fg swapped to the Figma's white/black. */
export const DEFAULTS = {
  amplitude: 0.8,
  timeSpeed: 0.0045,
  holdAmplitudeMultiplier: 2,
  holdTimeSpeedMultiplier: 1.5,
  lerpSpeed: 0.03,
  pixelSize: 4,
  gooeyness: 0.58,
  contrast: 1.5,
  bias: 0,
  invert: 1,
  bg: "#ffffff",
  fg: "#000000",
  transparentBg: 0,
  waveFrequency: 1,
  waveAmplitude: 0,
  waveTimeSpeed: 0,
  maxDpr: 1,
  interactive: true,
};

/*
 * THREE.Color cannot parse CSS Color 4's space-separated form
 * (`rgb(0 0 0 / 1)`) — it silently yields white — and the theme tokens are
 * authored that way, so handle it before delegating.
 */
function toVec3(color: string) {
  const modern = color.match(
    /^rgba?(s*([d.]+)[s,]+([d.]+)[s,]+([d.]+)(?:s*[/,]s*[d.%]+)?s*)$/i,
  );
  if (modern) {
    const [r, g, b] = modern.slice(1, 4).map((n) => Number(n) / 255);
    return new THREE.Vector3(r, g, b);
  }
  const c = new THREE.Color(color);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export type DotShaderHandle = {
  revealState: { reveal: number };
  syncReveal: () => void;
  /** Repaint the dots when the page theme changes. */
  setForeground: (color: string) => void;
  destroy: () => void;
};

export function createDotShader(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  options: DotShaderOptions = {},
): DotShaderHandle | null {
  const o = { ...DEFAULTS, ...options };

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch {
    return null; // No WebGL — caller falls back to static content.
  }
  renderer.setClearColor(0x000000, o.transparentBg ? 0 : 1);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RedFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const fieldMat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FIELD_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: o.amplitude },
      uReveal: { value: 0 },
    },
  });

  const dotMat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: DOT_FRAG,
    transparent: o.transparentBg === 1,
    uniforms: {
      uFieldTex: { value: target.texture },
      uFieldRes: { value: new THREE.Vector2(1, 1) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 0 },
      uPixelSize: { value: o.pixelSize },
      uGooeyness: { value: o.gooeyness },
      uContrast: { value: o.contrast },
      uBias: { value: o.bias },
      uInvert: { value: o.invert },
      uBg: { value: toVec3(o.bg) },
      uFg: { value: toVec3(o.fg) },
      uTransparentBg: { value: o.transparentBg },
      uWaveTime: { value: 0 },
      uWaveFrequency: { value: o.waveFrequency },
      uWaveAmplitude: { value: o.waveAmplitude },
    },
  });

  const fieldScene = new THREE.Scene();
  fieldScene.add(new THREE.Mesh(geometry, fieldMat));
  scene.add(new THREE.Mesh(geometry, dotMat));

  const revealState = { reveal: 0 };
  const syncReveal = () => {
    fieldMat.uniforms.uReveal.value = revealState.reveal;
    dotMat.uniforms.uReveal.value = revealState.reveal;
  };

  let time = 0;
  let waveTime = 0;
  let amplitude = o.amplitude;
  let raf = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    dotMat.uniforms.uResolution.value.set(w * dpr, h * dpr);

    // Field target is one texel per dot cell.
    const fw = Math.max(1, Math.ceil((w * dpr) / o.pixelSize));
    const fh = Math.max(1, Math.ceil((h * dpr) / o.pixelSize));
    target.setSize(fw, fh);
    dotMat.uniforms.uFieldRes.value.set(fw, fh);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  // Pointer hold intensifies the field, as in the reference.
  let holding = false;
  const onDown = () => (holding = true);
  const onUp = () => (holding = false);
  if (o.interactive) {
    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
  }

  const render = () => {
    raf = requestAnimationFrame(render);

    const targetAmp = holding ? o.amplitude * o.holdAmplitudeMultiplier : o.amplitude;
    const speed = holding ? o.timeSpeed * o.holdTimeSpeedMultiplier : o.timeSpeed;

    amplitude += (targetAmp - amplitude) * o.lerpSpeed;
    time += speed * 16;
    waveTime += o.waveTimeSpeed * 16;

    fieldMat.uniforms.uTime.value = time;
    fieldMat.uniforms.uAmplitude.value = amplitude;
    dotMat.uniforms.uWaveTime.value = waveTime;

    renderer.setRenderTarget(target);
    renderer.render(fieldScene, camera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  };
  render();

  return {
    revealState,
    syncReveal,
    setForeground(color: string) {
      dotMat.uniforms.uFg.value = toVec3(color);
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      if (o.interactive) {
        container.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
      }
      geometry.dispose();
      fieldMat.dispose();
      dotMat.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}
