// Raw WebGL ocean based on afl_ext's MIT-licensed "ocean weaves" shader.
// The mountain ridge is extracted from Igor's Herceg Novi photograph.
(function () {
  var canvas = document.querySelector("[data-atmosphere]");
  if (!canvas) return;

  var gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false
  });

  if (!gl) {
    canvas.classList.add("ambient-canvas-fallback");
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var running = true;
  var startTime = performance.now();
  var lastFrame = 0;
  var nightBlend = document.documentElement.dataset.theme === "dark" ? 1 : 0;

  var vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // afl_ext 2017-2024, MIT License. This is the same ocean-weaves shader
  // family used by Earendil, adapted with a photo-derived mountain mask.
  var oceanFragmentSource = `
    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;
    uniform float u_night;
    uniform sampler2D u_skyline;
    uniform vec4 u_ripples[8];
    uniform int u_rippleCount;

    #define PI 3.14159265359
    #define DRAG_MULT 0.38
    #define WATER_DEPTH 1.0
    #define CAMERA_HEIGHT 1.5
    #define ITERATIONS_RAYMARCH 8
    #define ITERATIONS_NORMAL 16
    #define RAYMARCH_STEPS 32
    #define FBM_OCTAVES 4

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise21(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < FBM_OCTAVES; i++) {
        value += amplitude * noise21(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    mat3 createRotationMatrixAxisAngle(vec3 axis, float angle);

    vec2 dirToScreenUV(vec3 dir) {
      vec3 unrotated = createRotationMatrixAxisAngle(vec3(1.0, 0.0, 0.0), -0.14) * dir;
      if (unrotated.z <= 0.0) return vec2(-1.0);
      vec2 uv = (unrotated.xy / unrotated.z) * 1.5;
      vec2 ndc = uv / vec2(iResolution.x / iResolution.y, 1.0);
      return ndc * 0.5 + 0.5;
    }

    float sceneX(float screenX) {
      float aspect = iResolution.x / iResolution.y;
      if (aspect >= 1.5) return screenX;
      float coverage = max(aspect / 1.5, 0.48);
      return clamp((screenX - 0.5) * coverage + 0.5, 0.0, 1.0);
    }

    vec4 skylineAt(float screenX) {
      return texture2D(u_skyline, vec2(sceneX(screenX), 0.5));
    }

    float nearRidgeAt(float screenX) {
      return 0.395 + skylineAt(screenX).r * 0.13;
    }

    float farRidgeAt(float screenX) {
      return 0.395 + skylineAt(screenX).g * 0.13;
    }

    float mountainLayerMask(vec2 screenUv, float ridge) {
      float horizon = 0.395;
      float aa = 1.75 / iResolution.y;
      float aboveWater = smoothstep(horizon - aa, horizon + aa, screenUv.y);
      float belowRidge = 1.0 - smoothstep(ridge - aa, ridge + aa, screenUv.y);
      return aboveWater * belowRidge;
    }

    float nearMountainMask(vec2 screenUv) {
      return mountainLayerMask(screenUv, nearRidgeAt(screenUv.x));
    }

    float farMountainMask(vec2 screenUv) {
      return mountainLayerMask(screenUv, farRidgeAt(screenUv.x));
    }

    float terrainDetail(vec2 screenUv, float seed, float depthScale) {
      vec2 point = vec2(sceneX(screenUv.x) * 11.0, screenUv.y * 19.0) * depthScale;
      float broad = fbm(point + vec2(seed, seed * 0.37));
      float fine = fbm(point * 2.45 + vec2(seed * 2.1, -seed));
      float ridges = 1.0 - abs(fine * 2.0 - 1.0);
      float strata = 0.5 + 0.5 * sin((screenUv.y + broad * 0.018) * 235.0 + sceneX(screenUv.x) * 9.0);
      return clamp(broad * 0.58 + ridges * 0.32 + strata * 0.10, 0.0, 1.0);
    }

    vec3 farMountainColor(vec2 screenUv) {
      float horizon = 0.395;
      float ridge = farRidgeAt(screenUv.x);
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.01), 0.0, 1.0);
      float detail = terrainDetail(screenUv, 2.7, 0.72);
      float haze = 1.0 - height;
      vec3 day = mix(vec3(0.045, 0.105, 0.15), vec3(0.19, 0.30, 0.37), haze * 0.66 + detail * 0.14);
      day += vec3(0.012, 0.025, 0.035) * (1.0 - height) * (0.35 + detail * 0.65);
      day *= 0.90 + detail * 0.18;
      vec3 night = mix(vec3(0.018, 0.028, 0.041), vec3(0.052, 0.065, 0.078), haze * 0.30 + detail * 0.24);
      return mix(day, night, u_night);
    }

    vec3 nearMountainColor(vec2 screenUv) {
      float horizon = 0.395;
      float ridge = nearRidgeAt(screenUv.x);
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.01), 0.0, 1.0);
      float detail = terrainDetail(screenUv, 7.1, 1.0);
      float valleys = fbm(vec2(sceneX(screenUv.x) * 17.0 + 4.0, screenUv.y * 28.0));
      vec3 day = mix(vec3(0.012, 0.045, 0.052), vec3(0.052, 0.14, 0.145), detail * 0.58 + valleys * 0.14 + height * 0.08);
      day += vec3(0.005, 0.018, 0.016) * detail * (0.35 + height * 0.65);
      day *= 0.80 + detail * 0.34 + valleys * 0.06;
      vec3 night = mix(vec3(0.003, 0.006, 0.009), vec3(0.019, 0.027, 0.032), detail * 0.62 + valleys * 0.12);
      return mix(day, night, u_night);
    }

    float townCluster(float x, float center, float width) {
      float distance = (x - center) / width;
      return exp(-distance * distance);
    }

    float settlementLights(vec2 screenUv, float ridge, float seed, float density) {
      float horizon = 0.395;
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.008), 0.0, 1.0);
      float x = sceneX(screenUv.x);
      float leftTown = smoothstep(0.015, 0.07, x) * (1.0 - smoothstep(0.29, 0.38, x));
      float rightTown = smoothstep(0.43, 0.51, x) * (1.0 - smoothstep(0.985, 1.0, x));

      float leftPopulation = max(
        townCluster(x, 0.12, 0.045),
        max(townCluster(x, 0.20, 0.055), townCluster(x, 0.29, 0.04))
      );
      float rightPopulation = max(
        townCluster(x, 0.52, 0.055),
        max(
          townCluster(x, 0.68, 0.075),
          max(townCluster(x, 0.79, 0.06), townCluster(x, 0.91, 0.055))
        )
      );
      float population = max(
        leftTown * clamp(0.10 + leftPopulation, 0.0, 1.0),
        rightTown * clamp(0.16 + rightPopulation, 0.0, 1.0)
      );

      // A dense, nearly continuous waterfront row. It is generated separately
      // so shoreline buildings do not depend on a random hillside cell landing
      // close enough to the water.
      float shoreGrid = 265.0;
      float shoreCell = floor(screenUv.x * shoreGrid);
      float shoreX = (shoreCell + hash21(vec2(shoreCell, seed + 21.0))) / shoreGrid;
      float shoreYpx = mix(0.34, 1.55, hash21(vec2(shoreCell, seed + 22.0)));
      vec2 shoreDeltaPx = vec2(
        (screenUv.x - shoreX) * iResolution.x,
        (screenUv.y - horizon) * iResolution.y - shoreYpx
      );
      float shoreSizeClass = hash21(vec2(shoreCell, seed + 23.0));
      float shoreSizeVariation = hash21(vec2(shoreCell, seed + 23.5));
      float shoreRadius = mix(0.18, 0.35, shoreSizeVariation);
      shoreRadius = mix(shoreRadius, mix(0.38, 0.58, shoreSizeVariation), step(0.78, shoreSizeClass));
      shoreRadius = mix(shoreRadius, mix(0.62, 0.82, shoreSizeVariation), step(0.96, shoreSizeClass));
      float shorePoint = 1.0 - smoothstep(shoreRadius, shoreRadius + mix(0.30, 0.46, shoreSizeClass), length(shoreDeltaPx));
      float shoreOccupied = min(0.72, population * density * 0.62);
      float shoreKeep = step(1.0 - shoreOccupied, hash21(vec2(shoreCell, seed + 24.0)));
      float shoreBrightnessVariation = hash21(vec2(shoreCell, seed + 25.0));
      float shoreBrightness = mix(0.38, 0.92, shoreBrightnessVariation * shoreBrightnessVariation) + step(0.96, shoreSizeClass) * 0.28;
      float shoreline = shorePoint * shoreKeep * shoreBrightness;

      // Smaller hillside points gather into neighbourhoods and follow two
      // loose elevation contours instead of scattering evenly over the slope.
      vec2 grid = vec2(220.0, 72.0);
      vec2 gridUv = screenUv * grid;
      vec2 cell = floor(gridUv);
      vec2 offset = vec2(hash21(cell + seed), hash21(cell + seed + 3.7));
      vec2 lightUv = (cell + offset) / grid;
      vec2 deltaPx = (screenUv - lightUv) * iResolution.xy;
      float sizeClass = hash21(cell + seed + 8.3);
      float sizeVariation = hash21(cell + seed + 9.1);
      float radiusPx = mix(0.08, 0.18, sizeVariation);
      radiusPx = mix(radiusPx, mix(0.21, 0.36, sizeVariation), step(0.72, sizeClass));
      radiusPx = mix(radiusPx, mix(0.40, 0.60, sizeVariation), step(0.95, sizeClass));
      float point = 1.0 - smoothstep(radiusPx, radiusPx + mix(0.28, 0.48, sizeClass), length(deltaPx));
      float roadLow = exp(-abs(height - (0.16 + 0.045 * sin(x * 18.0 + seed))) * 24.0);
      float roadHigh = exp(-abs(height - (0.38 + 0.055 * sin(x * 13.0 + seed * 0.7))) * 21.0);
      float neighbourhood = smoothstep(0.47, 0.69, fbm(vec2(x * 8.0 + seed, height * 6.0)));
      float elevation = (1.0 - smoothstep(0.58, 0.88, height)) * max(roadLow, roadHigh * 0.66);
      float hillsideOccupied = min(0.46, population * density * elevation * mix(0.32, 1.55, neighbourhood));
      float randomKeep = step(1.0 - hillsideOccupied, hash21(cell + seed + 12.4));
      float brightnessVariation = hash21(cell + seed + 16.7);
      float brightness = mix(0.22, 0.88, brightnessVariation * brightnessVariation) + step(0.95, sizeClass) * 0.32;
      float shimmer = 0.975 + 0.025 * sin(iTime * 0.12 + hash21(cell + seed + 19.1) * 6.28318);
      float hillside = point * randomKeep * brightness;
      return max(shoreline, hillside) * shimmer;
    }

    float mountainMask(vec2 screenUv) {
      return max(farMountainMask(screenUv), nearMountainMask(screenUv));
    }

    vec3 mountainSurfaceColor(vec2 screenUv) {
      float nearMask = nearMountainMask(screenUv);
      vec3 color = farMountainColor(screenUv);
      return mix(color, nearMountainColor(screenUv), nearMask);
    }

    vec3 mountainLightColor(vec2 screenUv) {
      float farMask = farMountainMask(screenUv);
      float nearMask = nearMountainMask(screenUv);
      float farLights = settlementLights(screenUv, farRidgeAt(screenUv.x), 13.7, 0.68) * farMask;
      float nearLights = settlementLights(screenUv, nearRidgeAt(screenUv.x), 31.2, 1.18) * nearMask;
      vec3 background = vec3(2.8, 1.35, 0.42) * farLights * (1.0 - nearMask);
      vec3 foreground = vec3(4.1, 1.8, 0.48) * nearLights;
      return (background + foreground) * u_night;
    }

    vec3 mountainColor(vec2 screenUv) {
      return mountainSurfaceColor(screenUv) + mountainLightColor(screenUv);
    }

    float star(vec2 screenUv, vec2 cellId, vec2 grid) {
      float rnd = hash21(cellId);
      if (rnd > 0.8) return 0.0;
      vec2 starPos = vec2(hash21(cellId + 0.1), hash21(cellId + 0.2));
      vec2 starUv = (cellId + starPos) / grid;
      vec2 deltaPx = (screenUv - starUv) * iResolution.xy;
      float sizePx = 0.25 + hash21(cellId + 0.3) * 0.45;
      float core = smoothstep(sizePx, sizePx * 0.2, length(deltaPx));
      float phase = hash21(cellId + 0.4) * 6.28318;
      float speed = 0.2 + hash21(cellId + 0.5) * 0.3;
      float flickerAmount = mix(0.1, 0.35, hash21(cellId + 0.7));
      float flicker = mix(1.0 - flickerAmount, 1.0 + flickerAmount, 0.5 + 0.5 * sin(iTime * speed + phase));
      float brightness = mix(0.6, 1.4, hash21(cellId + 0.6));
      return core * flicker * brightness;
    }

    vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
      float x = dot(direction, position) * frequency + timeshift;
      float wave = exp(sin(x) - 1.0);
      float dx = wave * cos(x);
      return vec2(wave, -dx);
    }

    float getRipples(vec2 position) {
      float sum = 0.0;
      for (int i = 0; i < 8; i++) {
        if (i >= u_rippleCount) break;
        vec4 ripple = u_ripples[i];
        float age = iTime - ripple.z;
        if (age < 0.0 || age > 10.0) continue;
        float distanceFromRipple = length(position - ripple.xy);
        float phase = distanceFromRipple * 4.0 - age * 3.2;
        float envelope = exp(-0.45 * age) * exp(-distanceFromRipple * 0.16);
        sum += ripple.w * envelope * smoothstep(0.0, 0.3, age) * sin(phase);
      }
      return sum;
    }

    float getWavesBaseAtTime(vec2 position, int iterations, float waveTime) {
      float wavePhaseShift = length(position) * 0.1;
      vec2 swellDirection = normalize(vec2(-0.25, 1.0));
      float iteration = 0.0;
      float frequency = 1.0;
      float timeMultiplier = 2.0;
      float weight = 1.0;
      float values = 0.0;
      float weights = 0.0;
      for (int i = 0; i < 16; i++) {
        if (i >= iterations) break;
        vec2 direction = normalize(mix(vec2(sin(iteration), cos(iteration)), swellDirection, 0.35));
        vec2 result = wavedx(position, direction, frequency, waveTime * timeMultiplier + wavePhaseShift);
        position += direction * result.y * weight * DRAG_MULT;
        values += result.x * weight;
        weights += weight;
        weight = mix(weight, 0.0, 0.2);
        frequency *= 1.18;
        timeMultiplier *= 1.07;
        iteration += 1232.399963;
      }
      float baseWaves = values / weights;
      float swell = sin(dot(position, swellDirection) * 0.18 - waveTime * 0.08);
      vec2 cameraPosition = vec2(waveTime * 0.2, 1.0);
      float swellFade = smoothstep(28.0, 4.0, length(position - cameraPosition));
      return baseWaves + swell * swellFade * 0.35;
    }

    float getWavesBase(vec2 position, int iterations) {
      return getWavesBaseAtTime(position, iterations, iTime);
    }

    float getWaves(vec2 position, int iterations) {
      return getWavesBase(position, iterations) + getRipples(position);
    }

    float raymarchWater(vec3 camera, vec3 start, vec3 end, float depth) {
      vec3 position = start;
      vec3 direction = normalize(end - start);
      for (int i = 0; i < RAYMARCH_STEPS; i++) {
        float height = getWavesBase(position.xz, ITERATIONS_RAYMARCH) * depth - depth;
        if (height + 0.01 > position.y) return distance(position, camera);
        position += direction * (position.y - height);
      }
      return distance(start, camera);
    }

    vec3 normalAt(vec2 position, float epsilon, float depth) {
      vec2 ex = vec2(epsilon, 0.0);
      float height = getWaves(position.xy, ITERATIONS_NORMAL) * depth;
      vec3 center = vec3(position.x, height, position.y);
      return normalize(cross(
        center - vec3(position.x - epsilon, getWaves(position.xy - ex.xy, ITERATIONS_NORMAL) * depth, position.y),
        center - vec3(position.x, getWaves(position.xy + ex.yx, ITERATIONS_NORMAL) * depth, position.y + epsilon)
      ));
    }

    vec3 slowLightNormalAt(vec2 position, float epsilon, float depth, float waveTime) {
      vec2 ex = vec2(epsilon, 0.0);
      float height = getWavesBaseAtTime(position.xy, 8, waveTime) * depth;
      vec3 center = vec3(position.x, height, position.y);
      return normalize(cross(
        center - vec3(position.x - epsilon, getWavesBaseAtTime(position.xy - ex.xy, 8, waveTime) * depth, position.y),
        center - vec3(position.x, getWavesBaseAtTime(position.xy + ex.yx, 8, waveTime) * depth, position.y + epsilon)
      ));
    }

    mat3 createRotationMatrixAxisAngle(vec3 axis, float angle) {
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      return mat3(
        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
      );
    }

    vec3 getRay(vec2 fragmentCoordinate) {
      vec2 uv = ((fragmentCoordinate / iResolution) * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
      vec3 projection = normalize(vec3(uv.x, uv.y, 1.5));
      return createRotationMatrixAxisAngle(vec3(1.0, 0.0, 0.0), 0.14) * projection;
    }

    float intersectPlane(vec3 origin, vec3 direction, vec3 point, vec3 planeNormal) {
      return clamp(dot(point - origin, planeNormal) / dot(direction, planeNormal), -1.0, 9991999.0);
    }

    vec3 atmosphere(vec3 rayDirection, vec3 sunDirection) {
      float trick = 1.0 / (rayDirection.y + 0.1);
      float trick2 = 1.0 / (sunDirection.y * 11.0 + 1.0);
      float raySun = pow(abs(dot(sunDirection, rayDirection)), 2.0);
      vec3 sunColor = mix(vec3(1.0), max(vec3(0.0), vec3(1.0) - vec3(5.5, 13.0, 22.4) / 22.4), trick2);
      vec3 blueSky = vec3(12.0, 12.0, 13.0) / 22.4 * sunColor;
      vec3 result = max(vec3(0.0), blueSky - vec3(12.0, 12.0, 13.0) * 0.002 * (trick - 6.0 * sunDirection.y * sunDirection.y));
      result *= trick * (0.24 + raySun * 0.24);
      return result * (1.0 + pow(1.0 - rayDirection.y, 3.0));
    }

    vec3 daySky(vec3 direction) {
      vec3 sunDirection = normalize(vec3(-0.42, 0.58, 0.70));
      float altitude = clamp(direction.y * 1.65, 0.0, 1.0);
      vec3 horizon = vec3(0.30, 0.55, 0.73);
      vec3 zenith = vec3(0.055, 0.27, 0.61);
      vec3 color = mix(horizon, zenith, pow(altitude, 0.72));

      float sunAmount = max(dot(direction, sunDirection), 0.0);
      float sunGlow = pow(sunAmount, 9.0);
      float sunCore = pow(sunAmount, 180.0);
      color += vec3(1.0, 0.72, 0.42) * sunGlow * 0.05;
      color += vec3(1.0, 0.94, 0.79) * sunCore * 0.34;

      vec2 screenUv = dirToScreenUV(direction);
      if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.42 && screenUv.y <= 1.0) {
        float sceneUvX = sceneX(screenUv.x);
        vec2 broadUv = vec2(sceneUvX * 2.35 + iTime * 0.0016, screenUv.y * 5.4);
        float broad = fbm(broadUv);
        vec2 wispUv = vec2(sceneUvX * 6.8 - iTime * 0.0022 + broad * 0.75, screenUv.y * 16.0);
        float wisps = fbm(wispUv) * 0.72 + fbm(wispUv * vec2(0.48, 0.72) + vec2(3.7, -1.4)) * 0.28;
        float clouds = smoothstep(0.49, 0.64, wisps);
        float cloudBand = smoothstep(0.53, 0.64, screenUv.y) * (1.0 - smoothstep(0.87, 0.97, screenUv.y));
        float cloudTaper = smoothstep(0.03, 0.16, sceneUvX) * (1.0 - smoothstep(0.72, 0.96, sceneUvX));
        clouds *= cloudBand * cloudTaper;
        color = mix(color, vec3(0.86, 0.93, 0.97), clouds * 0.26);
      }

      return color;
    }

    vec3 nightSky(vec3 direction) {
      vec2 screenUv = dirToScreenUV(direction);
      float vertical = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 color = mix(vec3(0.03, 0.035, 0.05), vec3(0.015, 0.02, 0.04), vertical);
      if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y > 0.35 && screenUv.y <= 1.0) {
        vec2 grid = vec2(40.0, 30.0);
        vec2 baseCell = floor(screenUv * grid);
        float stars = 0.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 cell = baseCell + vec2(float(x), float(y));
            if (cell.y < 0.0 || cell.y >= grid.y) continue;
            cell.x = mod(cell.x + grid.x, grid.x);
            stars += star(screenUv, cell, grid);
          }
        }
        color += vec3(1.0, 0.97, 0.9) * stars * smoothstep(0.35, 0.55, screenUv.y);
      }
      return color;
    }

    vec3 skyColor(vec3 direction) {
      return mix(daySky(direction), nightSky(direction), u_night);
    }

    vec3 acesTonemap(vec3 color) {
      mat3 first = mat3(
        0.59719, 0.07600, 0.02840,
        0.35458, 0.90834, 0.13383,
        0.04823, 0.01566, 0.83777
      );
      mat3 second = mat3(
        1.60475, -0.10208, -0.00327,
        -0.53108, 1.10813, -0.07276,
        -0.07367, -0.00605, 1.07602
      );
      vec3 value = first * color;
      vec3 numerator = value * (value + 0.0245786) - 0.000090537;
      vec3 denominator = value * (0.983729 * value + 0.4329510) + 0.238081;
      return pow(clamp(second * (numerator / denominator), 0.0, 1.0), vec3(1.0 / 2.2));
    }

    void mainImage(out vec4 fragmentColor, vec2 fragmentCoordinate) {
      vec2 screenUv = fragmentCoordinate / iResolution;
      float mountains = mountainMask(screenUv);
      if (mountains > 0.001) {
        fragmentColor = vec4(acesTonemap(mountainColor(screenUv) * 1.25), 1.0);
        return;
      }

      vec3 ray = getRay(fragmentCoordinate);
      if (ray.y >= 0.0) {
        fragmentColor = vec4(acesTonemap(skyColor(ray) * mix(1.28, 2.0, u_night)), 1.0);
        return;
      }

      vec3 origin = vec3(iTime * 0.2, CAMERA_HEIGHT, 1.0);
      float highHit = intersectPlane(origin, ray, vec3(0.0), vec3(0.0, 1.0, 0.0));
      float lowHit = intersectPlane(origin, ray, vec3(0.0, -WATER_DEPTH, 0.0), vec3(0.0, 1.0, 0.0));
      vec3 highPosition = origin + ray * highHit;
      vec3 lowPosition = origin + ray * lowHit;
      float distanceToWater = raymarchWater(origin, highPosition, lowPosition, WATER_DEPTH);
      vec3 waterPosition = origin + ray * distanceToWater;

      float epsilon = max(0.01, distanceToWater * 0.004);
      vec3 normal = normalAt(waterPosition.xz, epsilon, WATER_DEPTH);
      float distanceFlatten = 0.8 * min(1.0, sqrt(distanceToWater * 0.01) * 1.1);
      float daylightCalm = (1.0 - u_night) * 0.64;
      normal = mix(normal, vec3(0.0, 1.0, 0.0), clamp(distanceFlatten + daylightCalm, 0.0, 0.95));

      float fresnelSharp = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(-normal, ray)), 5.0);
      float fresnelFlat = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(vec3(0.0, 1.0, 0.0), -ray)), 5.0);
      float fresnelBlend = min(1.0, sqrt(distanceToWater * 0.01) * 1.1);
      float fresnel = mix(fresnelSharp, fresnelFlat, fresnelBlend);

      vec3 reflectionDirection = normalize(reflect(ray, normal));
      reflectionDirection.y = abs(reflectionDirection.y);
      vec3 reflection = skyColor(reflectionDirection);
      vec2 reflectionScreen = dirToScreenUV(reflectionDirection);
      if (reflectionScreen.x >= 0.0 && reflectionScreen.x <= 1.0 && reflectionScreen.y >= 0.0 && reflectionScreen.y <= 1.0) {
        reflection = mix(reflection, mountainSurfaceColor(reflectionScreen), mountainMask(reflectionScreen));
      }

      // Reuse the woven ocean geometry for reflected lights, but evaluate it
      // on a slower clock and remove the camera's forward drift. This retains
      // the broken streak shape without making it chase every surface wave.
      vec2 lightWavePosition = waterPosition.xz - vec2(iTime * 0.2, 0.0);
      float lightEpsilon = max(0.035, distanceToWater * 0.009);
      vec3 lightNormal = slowLightNormalAt(lightWavePosition, lightEpsilon, WATER_DEPTH, iTime * 0.14);
      lightNormal = normalize(mix(lightNormal, vec3(0.0, 1.0, 0.0), 0.91));
      vec3 lightReflectionDirection = normalize(reflect(ray, lightNormal));
      lightReflectionDirection.y = abs(lightReflectionDirection.y);
      vec2 lightScreen = dirToScreenUV(lightReflectionDirection);
      if (lightScreen.x >= 0.0 && lightScreen.x <= 1.0 && lightScreen.y >= 0.0 && lightScreen.y <= 1.0) {
        vec2 blurStep = vec2(1.9 / iResolution.x, 0.0);
        vec3 reflectedLights = mountainLightColor(lightScreen) * 0.50;
        reflectedLights += mountainLightColor(lightScreen - blurStep) * 0.25;
        reflectedLights += mountainLightColor(lightScreen + blurStep) * 0.25;
        reflection += reflectedLights * 0.82;
      }

      vec3 scatteringBase = mix(vec3(0.008, 0.055, 0.13), vec3(0.02, 0.02, 0.03), u_night);
      vec3 scattering = scatteringBase * (0.2 + (waterPosition.y + WATER_DEPTH) / WATER_DEPTH);
      vec3 color = fresnel * reflection + scattering;
      vec3 waterBody = mix(vec3(0.006, 0.05, 0.13), vec3(0.012, 0.014, 0.022), u_night);
      color += waterBody * (1.0 - fresnel) * 0.72;
      vec3 fogColor = mix(vec3(0.10, 0.29, 0.48), vec3(0.03, 0.035, 0.05), u_night);
      color = mix(color, fogColor, 1.0 - exp(-distanceToWater * 0.02));
      fragmentColor = vec4(acesTonemap(color * mix(1.12, 1.9, u_night)), 1.0);
    }

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `;

  var postVertexSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Film-grain post pass based on Martin Upitis's film grain shader.
  var postFragmentSource = `
    precision highp float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_night;
    uniform float u_noiseScale;
    varying vec2 v_texCoord;

    float gaussian(float value, float mean, float deviation) {
      return (1.0 / (deviation * sqrt(6.283))) * exp(-(((value - mean) * (value - mean)) / (2.0 * deviation * deviation)));
    }

    void main() {
      vec4 source = texture2D(u_image, v_texCoord);
      float sourceGray = dot(source.rgb, vec3(0.299, 0.587, 0.114));
      vec2 uv = gl_FragCoord.xy * u_noiseScale / u_resolution;
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noiseSample = fract(sin(seed) * 43758.5453 + u_time * 1.5);

      vec3 dayColor = mix(vec3(sourceGray), source.rgb, 1.10);
      dayColor = (dayColor - 0.5) * 1.055 + 0.5;
      dayColor += (noiseSample - 0.5) * 0.018 * (0.55 + sourceGray * 0.45);
      dayColor = clamp(dayColor, 0.0, 1.0);

      float nightNoise = gaussian(noiseSample, 0.0, 0.36);
      float nightGray = clamp(sourceGray + nightNoise * (1.0 - sourceGray) * 0.065, 0.0, 1.0);
      vec3 monochrome = mix(vec3(0.02), vec3(1.0), nightGray);
      float warmHighlight = smoothstep(0.04, 0.42, source.r - source.b) * smoothstep(0.34, 0.86, source.r);
      vec3 nightColor = mix(monochrome, source.rgb, warmHighlight * 0.82);

      gl_FragColor = vec4(mix(dayColor, nightColor, u_night), 1.0);
    }
  `;

  function compile(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function link(vertexSourceText, fragmentSourceText) {
    var vertex = compile(gl.VERTEX_SHADER, vertexSourceText);
    var fragment = compile(gl.FRAGMENT_SHADER, fragmentSourceText);
    if (!vertex || !fragment) return null;
    var linked = gl.createProgram();
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.linkProgram(linked);
    if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(linked));
      return null;
    }
    return linked;
  }

  var oceanProgram = link(vertexSource, oceanFragmentSource);
  var postProgram = link(postVertexSource, postFragmentSource);
  if (!oceanProgram || !postProgram) {
    canvas.classList.add("ambient-canvas-fallback");
    return;
  }

  var oceanBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  var postPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, postPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var postTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, postTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  var oceanPosition = gl.getAttribLocation(oceanProgram, "position");
  var oceanResolution = gl.getUniformLocation(oceanProgram, "iResolution");
  var oceanTime = gl.getUniformLocation(oceanProgram, "iTime");
  var oceanNight = gl.getUniformLocation(oceanProgram, "u_night");
  var oceanSkyline = gl.getUniformLocation(oceanProgram, "u_skyline");
  var oceanRipples = gl.getUniformLocation(oceanProgram, "u_ripples");
  var oceanRippleCount = gl.getUniformLocation(oceanProgram, "u_rippleCount");

  var postPosition = gl.getAttribLocation(postProgram, "a_position");
  var postTexCoord = gl.getAttribLocation(postProgram, "a_texCoord");
  var postImage = gl.getUniformLocation(postProgram, "u_image");
  var postResolution = gl.getUniformLocation(postProgram, "u_resolution");
  var postTime = gl.getUniformLocation(postProgram, "u_time");
  var postNight = gl.getUniformLocation(postProgram, "u_night");
  var postNoiseScale = gl.getUniformLocation(postProgram, "u_noiseScale");

  var skylineTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, skylineTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var skylineImage = new Image();
  skylineImage.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, skylineTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skylineImage);
  };
  skylineImage.onerror = function () {
    canvas.classList.add("ambient-canvas-fallback");
  };
  skylineImage.src = canvas.dataset.skyline || "/images/herceg-novi-skyline.png";

  var framebuffer = gl.createFramebuffer();
  var renderTexture = gl.createTexture();
  var framebufferWidth = 0;
  var framebufferHeight = 0;

  function setupFramebuffer(width, height) {
    if (framebufferWidth === width && framebufferHeight === height) return;
    framebufferWidth = width;
    framebufferHeight = height;
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resize() {
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    var lowDpi = (window.devicePixelRatio || 1) < 1.5;
    var scale = lowDpi ? 0.82 : 0.5;
    var pixelRatio = window.devicePixelRatio || 1;
    var renderWidth = Math.max(1, Math.round(width * pixelRatio * scale));
    var renderHeight = Math.max(1, Math.round(height * pixelRatio * scale));
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      setupFramebuffer(renderWidth, renderHeight);
    }
  }

  var ripples = [];
  var maxRipples = 8;

  function rippleUniforms() {
    var values = new Float32Array(maxRipples * 4);
    for (var index = 0; index < ripples.length; index++) {
      values[index * 4] = ripples[index].x;
      values[index * 4 + 1] = ripples[index].z;
      values[index * 4 + 2] = ripples[index].time;
      values[index * 4 + 3] = ripples[index].amplitude;
    }
    return values;
  }

  function screenToWater(clientX, clientY, time) {
    var bounds = canvas.getBoundingClientRect();
    var x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
    var y = -(((clientY - bounds.top) / bounds.height) * 2 - 1);
    var aspect = canvas.width / canvas.height;
    var rayX = x * aspect;
    var rayY = y;
    var rayZ = 1.5;
    var length = Math.hypot(rayX, rayY, rayZ);
    rayX /= length;
    rayY /= length;
    rayZ /= length;
    var cosine = Math.cos(0.14);
    var sine = Math.sin(0.14);
    var rotatedY = rayY * cosine + rayZ * sine;
    var rotatedZ = -rayY * sine + rayZ * cosine;
    if (rotatedY >= 0) return null;
    var distance = -CAMERA_HEIGHT_JS / rotatedY;
    return {
      x: time * 0.2 + rayX * distance,
      z: 1.0 + rotatedZ * distance
    };
  }

  var CAMERA_HEIGHT_JS = 1.5;

  window.addEventListener("pointerdown", function (event) {
    if (reducedMotion || event.target.closest("a, button, input, textarea, select, label")) return;
    var time = (performance.now() - startTime) * 0.001;
    var hit = screenToWater(event.clientX, event.clientY, time);
    if (!hit) return;
    ripples.push({ x: hit.x, z: hit.z, time: time, amplitude: 0.18 });
    if (ripples.length > maxRipples) ripples.shift();
  }, { passive: true });

  function render(now) {
    resize();
    var time = reducedMotion ? 3 : (now - startTime) * 0.001;
    var targetNight = document.documentElement.dataset.theme === "dark" ? 1 : 0;
    nightBlend += (targetNight - nightBlend) * Math.min(1, (now - lastFrame) / 180);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(oceanProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
    gl.enableVertexAttribArray(oceanPosition);
    gl.vertexAttribPointer(oceanPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(oceanResolution, canvas.width, canvas.height);
    gl.uniform1f(oceanTime, time);
    gl.uniform1f(oceanNight, nightBlend);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, skylineTexture);
    gl.uniform1i(oceanSkyline, 1);
    gl.uniform4fv(oceanRipples, rippleUniforms());
    gl.uniform1i(oceanRippleCount, ripples.length);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(postProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, postPositionBuffer);
    gl.enableVertexAttribArray(postPosition);
    gl.vertexAttribPointer(postPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, postTexCoordBuffer);
    gl.enableVertexAttribArray(postTexCoord);
    gl.vertexAttribPointer(postTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.uniform1i(postImage, 0);
    gl.uniform2f(postResolution, canvas.width, canvas.height);
    gl.uniform1f(postTime, time);
    gl.uniform1f(postNight, nightBlend);
    gl.uniform1f(postNoiseScale, (window.devicePixelRatio || 1) < 1.5 ? 1.7 : 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    canvas.classList.add("shader-ready");
    lastFrame = now;
    if (running && !reducedMotion) window.requestAnimationFrame(render);
  }

  function renderOnce() {
    var wasRunning = running;
    running = false;
    render(performance.now());
    running = wasRunning;
  }

  window.addEventListener("resize", function () {
    resize();
    if (reducedMotion) renderOnce();
  }, { passive: true });
  window.addEventListener("varyvoda:themechange", function () {
    if (reducedMotion) renderOnce();
  });
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running && !reducedMotion) window.requestAnimationFrame(render);
  });
  canvas.addEventListener("webglcontextlost", function (event) {
    event.preventDefault();
    running = false;
    canvas.classList.add("ambient-canvas-fallback");
  });

  resize();
  if (reducedMotion) renderOnce();
  else window.requestAnimationFrame(render);
})();
