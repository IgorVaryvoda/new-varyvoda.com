// Raw WebGL ocean based on afl_ext's MIT-licensed "ocean weaves" shader.
// The daylight landscape and mountain ridge are extracted from Igor's
// Herceg Novi photograph. Night mode keeps the procedural treatment.
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
  var contextAvailable = true;
  var frameRequest = null;
  var activeElapsed = 0;
  var activeSegmentStart = null;
  var observerReady = false;
  var observerFallback = false;
  var intersectingSurfaces = new Set();
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
    uniform sampler2D u_day_photo;
    uniform float u_day_photo_ready;
    uniform sampler2D u_mountain_photo;
    uniform float u_mountain_photo_ready;
    uniform sampler2D u_ship;
    uniform float u_ship_ready;
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
    #define SUN_SCREEN_X 0.075
    #define SUN_SCREEN_Y 0.512
    #define MOON_SCREEN_X 0.70
    #define MOON_SCREEN_Y 0.80

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
    float terrainDetail(vec2 screenUv, float seed, float depthScale);

    vec2 dirToScreenUV(vec3 dir) {
      vec3 unrotated = createRotationMatrixAxisAngle(vec3(1.0, 0.0, 0.0), -0.14) * dir;
      if (unrotated.z <= 0.0) return vec2(-1.0);
      vec2 uv = (unrotated.xy / unrotated.z) * 1.5;
      vec2 ndc = uv / vec2(iResolution.x / iResolution.y, 1.0);
      return ndc * 0.5 + 0.5;
    }

    float sunGlare(vec2 screenUv) {
      // Glare bleed around the sun position, shared by the sky and the
      // mountain branch: the ridge silhouette must dissolve into the burst
      // where they meet, as in the sunrise reference.
      vec2 delta = (screenUv - vec2(SUN_SCREEN_X, SUN_SCREEN_Y)) / vec2(1.0, 1.55);
      return exp(-pow(length(delta) / 0.075, 2.0));
    }

    float sceneX(float screenX) {
      float aspect = iResolution.x / iResolution.y;
      if (aspect >= 1.5) return screenX;
      float coverage = max(aspect / 1.5, 0.48);
      return clamp((screenX - 0.5) * coverage + 0.5, 0.0, 1.0);
    }

    vec4 skylineAt(float screenX) {
      float x = sceneX(screenX);
      // Linear texture filtering already interpolates the photographed ridge.
      // The previous five-tap blur spread each 512px mask sample across roughly
      // ten screen pixels and made the daylight silhouette look blocky.
      return texture2D(u_skyline, vec2(x, 0.5));
    }

    float nearRidgeAt(float screenX) {
      return 0.395 + skylineAt(screenX).r * 0.13;
    }

    float farRidgeAt(float screenX) {
      return 0.395 + skylineAt(screenX).g * 0.13;
    }

    float mountainLayerMask(vec2 screenUv, float ridge) {
      float horizon = 0.395;
      // One-pixel antialiasing: the old 2.25px feather was tuned for the
      // half-resolution canvas and reads as a fuzzy crest at native res.
      float aa = 1.0 / iResolution.y;
      // The horizon is already a perfectly horizontal pixel boundary. Keeping
      // a soft mask here sends those partial pixels through the sky-edge blend
      // and creates a pale strip between land and water. Antialias only the
      // irregular photographed ridge above it.
      float aboveWater = step(horizon - 2.0 / iResolution.y, screenUv.y);
      float belowRidge = 1.0 - smoothstep(ridge - aa, ridge + aa, screenUv.y);
      return aboveWater * belowRidge;
    }

    float nearMountainMask(vec2 screenUv) {
      return mountainLayerMask(screenUv, nearRidgeAt(screenUv.x));
    }

    float farMountainMask(vec2 screenUv) {
      return mountainLayerMask(screenUv, farRidgeAt(screenUv.x));
    }

    vec3 srgbToLinear(vec3 color) {
      return pow(max(color, vec3(0.0)), vec3(2.2));
    }

    vec3 photoSkyColor(vec2 screenUv) {
      float horizon = 0.395;
      float skyHeight = clamp((screenUv.y - horizon) / (1.0 - horizon), 0.0, 1.0);
      float sourceY = mix(0.535, 0.995, pow(skyHeight, 0.94));
      float drift = iTime * 0.00004;
      vec2 photoUv = vec2(clamp(sceneX(screenUv.x) + drift, 0.003, 0.997), sourceY);
      vec3 photo = srgbToLinear(texture2D(u_day_photo, photoUv).rgb) * 1.42;
      float luminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
      photo = mix(vec3(luminance), photo, 1.18);
      photo *= mix(1.04, 0.72, skyHeight);
      float viewX = screenUv.x;
      float leftField = exp(-pow((viewX + 0.035) / 0.48, 2.0));
      float lowerSky = 1.0 - smoothstep(0.24, 0.78, skyHeight);
      vec3 horizonHaze = mix(vec3(0.40, 0.55, 0.68), vec3(0.92, 0.72, 0.49), leftField * lowerSky * 0.76);
      vec3 sky = mix(horizonHaze, photo, smoothstep(0.0, 0.20, skyHeight));
      float rightBlue = smoothstep(0.18, 0.96, viewX) * smoothstep(0.08, 0.72, skyHeight);
      sky = mix(sky, sky * vec3(0.78, 0.94, 1.16), rightBlue * 0.34);

      // Sunrise in this view is strongly backlit: the source is just outside
      // the far-left edge, its core is nearly white, and the warmth falls away
      // quickly into a cool blue sky. Keep the photographed cloud structure,
      // but veil it in the broad overexposure around the horizon.
      vec2 sunriseCenter = vec2(SUN_SCREEN_X, SUN_SCREEN_Y);
      vec2 haloDelta = (vec2(viewX, screenUv.y) - sunriseCenter) / vec2(0.46, 0.235);
      float halo = exp(-dot(haloDelta, haloDelta) * 0.92);
      float horizonBand = exp(-skyHeight * 5.4) * leftField;
      float cloudLight = smoothstep(0.18, 0.66, luminance) * halo;
      vec3 paleGold = vec3(1.58, 1.32, 0.98);
      // The veil must stay clearly below white: when the whole corner
      // saturates through the tonemapper, the sun has nothing brighter left
      // to be and disappears into its own halo.
      float overexposure = clamp(halo * lowerSky * 0.26 + horizonBand * 0.20, 0.0, 0.46);
      sky = mix(sky, paleGold * 0.86, overexposure);
      sky += vec3(1.05, 0.78, 0.48) * cloudLight * 0.12;

      // The reference sunrise is not a disc: it is a blown white burst
      // cresting the ridge, with faint crepuscular rays combing up through
      // the cirrus. The core gaussian clips to white over a broad soft
      // region by design; the ridge glare is added in the mountain branch.
      float sunDistance = length((vec2(viewX, screenUv.y) - sunriseCenter) / vec2(1.0, 1.55));
      float rayAngle = atan(screenUv.y - sunriseCenter.y, viewX - sunriseCenter.x);
      float rayNoise = fbm(vec2(rayAngle * 2.6, 3.1));
      float rays = pow(0.5 + 0.5 * sin(rayAngle * 9.0 + rayNoise * 5.5), 3.0);
      float rayReach = exp(-sunDistance * 4.6);
      // Contrast, not more light, is what makes the core sear: a saturated
      // amber mid-field REPLACES the sky tone around the burst (darker than
      // the core), and only the core itself clips to white.
      float goldField = exp(-pow(sunDistance / 0.20, 2.0));
      sky = mix(sky, vec3(1.30, 0.98, 0.55) * mix(0.78, 1.02, goldField), goldField * 0.58);
      sky += vec3(2.2, 1.6, 0.85) * exp(-pow(sunDistance / 0.070, 2.0)) * 0.70;
      sky += vec3(7.5, 6.6, 5.2) * exp(-pow(sunDistance / 0.040, 2.0)) * 1.9;
      sky += vec3(1.55, 1.30, 0.95) * rays * rayReach * 0.55;
      return sky;
    }

    vec3 photoMountainColor(vec2 screenUv, float ridge, float flankSlope, float depth) {
      float horizon = 0.395;
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.01), 0.0, 1.0);
      float x = sceneX(screenUv.x);

      // A dedicated 2048px terrain atlas comes from clean, full-resolution
      // patches of Igor's photograph. The top half is the near headland and
      // the bottom half is the distant range; neither contains the tower,
      // foreground foliage, or liner.
      float farX = clamp(x * 1.12 + 0.08, 0.015, 0.985);
      float nearX = clamp(x * 0.86 + 0.07, 0.015, 0.985);
      float sampleX = mix(farX, nearX, depth);
      float farY = mix(0.02, 0.48, pow(height, 0.92));
      float nearY = mix(0.52, 0.98, pow(height, 0.92));
      // Keep the warp gentle on the far layer: its stretched material turns
      // strong displacement into wavy melted smears.
      float terrainWarp = (fbm(vec2(x * 4.8 + depth * 7.3, height * 5.2 + depth * 2.1)) - 0.5) * mix(0.022, 0.034, depth);
      terrainWarp += sin(height * 8.0 + x * 4.5 + depth * 2.4) * 0.007;
      // Keep the crest-side sample shift small — a large shift drags
      // material sideways near the ridge and smears the silhouette.
      float slopeProjection = (height - 0.5) * mix(0.09, 0.06, depth);
      // Warp peaks mid-slope and calms at both the waterline and the crest,
      // so the silhouette edge stays steady.
      float warpEnvelope = 0.42 + (height - height * height) * 1.2;
      sampleX = clamp(sampleX + slopeProjection + terrainWarp * warpEnvelope, 0.015, 0.985);
      vec2 atlasUv = vec2(sampleX, mix(farY, nearY, depth));
      // The ridge band minifies the atlas ~3:1 vertically; anisotropic
      // filtering (enabled on the texture from JS) keeps the horizontal
      // detail sharp through that minification. A shader LOD bias is the
      // wrong tool here — it aliases the vertical axis into streaks.
      vec3 photo = srgbToLinear(texture2D(u_mountain_photo, atlasUv).rgb);
      vec2 atlasStep = vec2(0.0024, 0.0032);
      vec3 photoRight = srgbToLinear(texture2D(u_mountain_photo, atlasUv + vec2(atlasStep.x, 0.0)).rgb);
      vec3 photoLeft = srgbToLinear(texture2D(u_mountain_photo, atlasUv - vec2(atlasStep.x, 0.0)).rgb);
      vec3 photoUp = srgbToLinear(texture2D(u_mountain_photo, atlasUv + vec2(0.0, atlasStep.y)).rgb);
      vec3 photoDown = srgbToLinear(texture2D(u_mountain_photo, atlasUv - vec2(0.0, atlasStep.y)).rgb);
      vec3 localAverage = (photoRight + photoLeft + photoUp + photoDown) * 0.25;
      float terrainRelief = clamp(dot(photo - localAverage, vec3(0.2126, 0.7152, 0.0722)) * 6.5, -0.22, 0.22);
      photo *= 1.0 + terrainRelief;

      // The atlas is cut from the sunlit originals now — only a light
      // blue-cut remains so the forest does not go cold under the grade.
      photo *= mix(vec3(1.0), vec3(1.0, 1.03, 0.90), depth);

      // A whisper of procedural variation on top of the real texture —
      // slightly stronger than a whisper, so it survives half-resolution
      // rendering on hi-DPI displays.
      float surfaceDetail = terrainDetail(screenUv, mix(2.7, 7.1, depth), mix(0.72, 1.0, depth));
      photo *= 0.86 + 0.28 * surfaceDetail;

      // Render-resolution canopy grain: the photo patch tops out at ~1.6x
      // magnification, so the finest detail must come from a procedural
      // octave evaluated per screen pixel, like a game-engine detail map.
      float canopyGrain = fbm(vec2(sceneX(screenUv.x) * 38.0, screenUv.y * 64.0) + vec2(depth * 11.0, 0.0));
      float canopyFine = fbm(vec2(sceneX(screenUv.x) * 96.0, screenUv.y * 150.0) + vec2(depth * 5.0, 3.0));
      photo *= 1.0 + (canopyGrain - 0.5) * mix(0.10, 0.22, depth)
        + (canopyFine - 0.5) * mix(0.08, 0.18, depth);

      // Derive the light-facing normal from the photographed material. Using
      // the 2D skyline derivative here turns every ridge sample into a vertical
      // band; atlas gradients let sunlight follow actual gullies and folds.
      float gradientX = dot(photoRight - photoLeft, vec3(0.2126, 0.7152, 0.0722));
      float gradientY = dot(photoUp - photoDown, vec3(0.2126, 0.7152, 0.0722));
      vec3 terrainNormal = normalize(vec3(-gradientX * 6.0, -gradientY * 4.0, 1.0));
      // The sunrise is left of the frame but still on the camera-facing side
      // of the bay. Give left-facing slopes a low, frontal dawn light and let
      // the terrain turn away into shadow toward the right.
      vec3 sunriseDirection = normalize(vec3(-0.72, 0.34, 0.90));
      float diffuse = clamp(dot(terrainNormal, sunriseDirection), 0.0, 1.0);

      float luminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
      vec3 chroma = mix(vec3(luminance), photo, mix(0.76, 0.96, depth));
      vec3 coastalHaze = vec3(0.15, 0.25, 0.34);
      float rightExposure = 1.0;
      // The sunrise references show backlit slopes: mostly dark silhouette
      // material with texture, not sunlit green faces. Keep the exposure low
      // and let the warm rim light below carry the sunrise.
      vec3 graded = chroma * mix(1.30, 1.40, depth) * rightExposure;
      graded = mix(coastalHaze, graded, mix(0.62, 0.90, depth));

      // Preserve the cool photographic material, but model the sunrise as
      // side/front light rather than a backlight. The broad diffuse term keeps
      // the actual terrain legible while the x-facing normal decides where
      // shadows fall.
      float sunriseReach = exp(-screenUv.x * 1.62);
      vec3 shadowBase = mix(vec3(0.10, 0.17, 0.24), vec3(0.05, 0.085, 0.07), depth);
      graded = mix(shadowBase, graded, mix(0.70, 0.88, depth));
      graded *= mix(0.66, 0.62, depth) + diffuse * mix(0.56, 0.46, depth);
      float slopeLight = smoothstep(0.28, 0.84, diffuse) * sunriseReach;
      graded += vec3(0.66, 0.47, 0.28) * slopeLight * (0.115 + height * 0.115) * mix(1.0, 0.72, depth);

      // The sun rises at the far left, so light must follow geometry: each
      // ridge's west flank (rising toward its peak) catches the sunrise
      // while the east flank falls into shade. flankSlope is the ridge
      // profile's derivative — positive where the crest climbs rightward.
      float sunReach = 0.22 + 0.78 * exp(-screenUv.x * 1.35);
      float flankLit = smoothstep(0.05, 0.8, flankSlope);
      float flankShade = smoothstep(0.05, 0.9, -flankSlope);
      graded *= 1.0 + flankLit * mix(0.26, 0.42, depth) * sunReach;
      graded *= 1.0 - flankShade * mix(0.24, 0.42, depth);
      graded += vec3(0.55, 0.40, 0.24) * flankLit * (0.06 + height * 0.11) * sunReach;

      // The backlit signature of the sunrise references: a warm rim burns
      // along crest segments that FACE the sun and dies on flat or shaded
      // stretches — an even crest glow just reads as ambient light.
      float crestRim = smoothstep(0.78, 0.985, height);
      graded += vec3(1.15, 0.74, 0.38) * crestRim * sunReach * mix(0.26, 0.40, depth) * (0.10 + 0.90 * flankLit);

      // Where the ridge profile is only a sliver the full atlas column
      // compresses into jagged noise; dissolve ONLY those few pixels into
      // haze — the headland's low tail must keep its forest.
      float lowProfile = 1.0 - smoothstep(0.003, 0.016, ridge - 0.395);
      graded = mix(graded, vec3(0.42, 0.52, 0.60), lowProfile * 0.45);
      return graded;
    }

    float terrainDetail(vec2 screenUv, float seed, float depthScale) {
      // No sine strata here: a periodic horizontal term multiplied onto the
      // photo layer reads as wood-grain stripes across the whole slope.
      vec2 point = vec2(sceneX(screenUv.x) * 11.0, screenUv.y * 19.0) * depthScale;
      float broad = fbm(point + vec2(seed, seed * 0.37));
      float fine = fbm(point * 2.45 + vec2(seed * 2.1, -seed));
      float ridges = 1.0 - abs(fine * 2.0 - 1.0);
      return clamp(broad * 0.62 + ridges * 0.38, 0.0, 1.0);
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
      // The far range is a haze layer: let the stable procedural gradient
      // carry more weight so stretched-photo artifacts stay invisible.
      float flankSlope = (farRidgeAt(screenUv.x + 0.015) - farRidgeAt(screenUv.x - 0.015)) / 0.03;
      day = mix(day, photoMountainColor(screenUv, ridge, flankSlope, 0.0), u_mountain_photo_ready * 0.72);
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
      float flankSlope = (nearRidgeAt(screenUv.x + 0.015) - nearRidgeAt(screenUv.x - 0.015)) / 0.03;
      day = mix(day, photoMountainColor(screenUv, ridge, flankSlope, 1.0), u_mountain_photo_ready * 0.96);
      vec3 night = mix(vec3(0.003, 0.006, 0.009), vec3(0.019, 0.027, 0.032), detail * 0.62 + valleys * 0.12);
      return mix(day, night, u_night);
    }

    float townCluster(float x, float center, float width) {
      float distance = (x - center) / width;
      return exp(-distance * distance);
    }

    vec3 settlementLights(vec2 screenUv, float ridge, float seed, float density) {
      float horizon = 0.395;
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.008), 0.0, 1.0);
      float x = sceneX(screenUv.x);
      float leftTown = smoothstep(0.015, 0.07, x) * (1.0 - smoothstep(0.29, 0.38, x));
      float rightTown = smoothstep(0.43, 0.51, x) * (1.0 - smoothstep(0.985, 1.0, x));

      float leftPopulation = max(
        townCluster(x, 0.12, 0.045),
        max(townCluster(x, 0.20, 0.055), townCluster(x, 0.29, 0.04))
      );
      // The right shore thins toward the open sea in the reference photo:
      // a bright town at the headland's base, then progressively sparser
      // clusters trailing off to the right.
      float rightPopulation = max(
        townCluster(x, 0.52, 0.055),
        max(
          townCluster(x, 0.66, 0.06) * 0.55,
          max(townCluster(x, 0.79, 0.05) * 0.22, townCluster(x, 0.93, 0.045) * 0.12)
        )
      );
      float population = max(
        leftTown * clamp(0.10 + leftPopulation, 0.0, 1.0),
        rightTown * clamp(0.04 + rightPopulation, 0.0, 1.0)
      );

      // A dense waterfront strip, generated separately so shoreline buildings
      // do not depend on a random hillside cell landing close to the water.
      // Two staggered rows thicken the strip inside town cores (the reference
      // night photo shows towns as multi-row agglomerations, not a string).
      float shoreGrid = 265.0;
      float shorelineWarm = 0.0;
      float shorelineCool = 0.0;
      // All pixel-space sizes below were tuned at a ~900px-tall render.
      float pxScale = iResolution.y / 900.0;
      for (int row = 0; row < 2; row++) {
        float rowSeed = seed + float(row) * 37.0;
        float shoreCell = floor(screenUv.x * shoreGrid);
        float shoreX = (shoreCell + hash21(vec2(shoreCell, rowSeed + 21.0))) / shoreGrid;
        float shoreYpx = (mix(0.34, 1.7, hash21(vec2(shoreCell, rowSeed + 22.0)))
          + float(row) * mix(1.6, 3.4, hash21(vec2(shoreCell, rowSeed + 26.0)))) * pxScale;
        vec2 shoreDeltaPx = vec2(
          (screenUv.x - shoreX) * iResolution.x,
          (screenUv.y - horizon) * iResolution.y - shoreYpx
        );
        // Three widely separated size tiers — mostly window specks, some
        // street lamps, rare big soft floodlights — so the strip reads as a
        // light hierarchy instead of a string of identical dots. The feather
        // grows with radius: small lights stay crisp, big ones bloom.
        float shoreSizeClass = hash21(vec2(shoreCell, rowSeed + 23.0));
        float shoreSizeVariation = hash21(vec2(shoreCell, rowSeed + 23.5));
        float shoreRadius = mix(0.20, 0.36, shoreSizeVariation);
        shoreRadius = mix(shoreRadius, mix(0.55, 0.95, shoreSizeVariation), step(0.78, shoreSizeClass));
        shoreRadius = mix(shoreRadius, mix(1.30, 2.00, shoreSizeVariation), step(0.965, shoreSizeClass));
        shoreRadius *= pxScale;
        float shorePoint = 1.0 - smoothstep(shoreRadius, shoreRadius + 0.30 * pxScale + shoreRadius * 0.55, length(shoreDeltaPx));
        float rowGate = row == 0 ? 1.0 : smoothstep(0.5, 0.95, population);
        // Squared population keeps town cores dense while the stretches
        // between settlements fall back to genuine darkness, matching the
        // clustered shoreline of the reference night photo.
        float shoreOccupied = min(0.85, population * population * density * (row == 0 ? 1.15 : 0.85));
        float shoreKeep = step(1.0 - shoreOccupied, hash21(vec2(shoreCell, rowSeed + 24.0)));
        float shoreBrightnessVariation = hash21(vec2(shoreCell, rowSeed + 25.0));
        float shoreBrightness = mix(0.30, 0.75, shoreBrightnessVariation * shoreBrightnessVariation);
        shoreBrightness = mix(shoreBrightness, mix(0.90, 1.30, shoreBrightnessVariation), step(0.78, shoreSizeClass));
        shoreBrightness = mix(shoreBrightness, mix(1.45, 1.95, shoreBrightnessVariation), step(0.965, shoreSizeClass));
        float shoreCool = step(0.87, hash21(vec2(shoreCell, rowSeed + 27.0)));
        float shoreLight = shorePoint * shoreKeep * shoreBrightness * rowGate;
        shorelineWarm = max(shorelineWarm, shoreLight * (1.0 - shoreCool));
        shorelineCool = max(shorelineCool, shoreLight * shoreCool);
      }

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
      float radiusPx = mix(0.14, 0.26, sizeVariation);
      radiusPx = mix(radiusPx, mix(0.42, 0.68, sizeVariation), step(0.75, sizeClass));
      radiusPx = mix(radiusPx, mix(0.95, 1.35, sizeVariation), step(0.96, sizeClass));
      radiusPx *= pxScale;
      float point = 1.0 - smoothstep(radiusPx, radiusPx + 0.28 * pxScale + radiusPx * 0.5, length(deltaPx));
      float roadLow = exp(-abs(height - (0.16 + 0.045 * sin(x * 18.0 + seed))) * 24.0);
      float roadHigh = exp(-abs(height - (0.38 + 0.055 * sin(x * 13.0 + seed * 0.7))) * 21.0);
      float neighbourhood = smoothstep(0.47, 0.69, fbm(vec2(x * 8.0 + seed, height * 6.0)));
      float elevation = (1.0 - smoothstep(0.58, 0.88, height)) * max(roadLow, roadHigh * 0.66);
      float hillsideOccupied = min(0.58, population * population * density * elevation * mix(0.42, 1.85, neighbourhood));
      float randomKeep = step(1.0 - hillsideOccupied, hash21(cell + seed + 12.4));
      float brightnessVariation = hash21(cell + seed + 16.7);
      float brightness = mix(0.22, 0.62, brightnessVariation * brightnessVariation);
      brightness = mix(brightness, mix(0.85, 1.20, brightnessVariation), step(0.75, sizeClass));
      brightness = mix(brightness, mix(1.40, 1.90, brightnessVariation), step(0.96, sizeClass));
      float hillCool = step(0.88, hash21(cell + seed + 21.3));
      float shimmer = 0.975 + 0.025 * sin(iTime * 0.12 + hash21(cell + seed + 19.1) * 6.28318);
      float hillside = point * randomKeep * brightness;
      float warmLights = max(shorelineWarm, hillside * (1.0 - hillCool));
      float coolLights = max(shorelineCool, hillside * hillCool);

      // A settled slope also glows: windows and street lamps too small to
      // resolve individually still lift the hillside around each town. The
      // bloom concentrates in town cores and hugs the waterfront, leaving
      // the stretches between settlements properly dark.
      float townCore = population * population;
      float glow = townCore * exp(-height * 8.5) * (0.45 + 0.55 * neighbourhood);
      return vec3(warmLights * shimmer, coolLights * shimmer, glow);
    }

    float mountainMask(vec2 screenUv) {
      return max(farMountainMask(screenUv), nearMountainMask(screenUv));
    }

    vec3 mountainSurfaceColor(vec2 screenUv) {
      // Weight each layer by its own mask. A plain near-over-far mix pulls
      // farMountainColor into the near ridge's edge feather even where the
      // far layer has no ridge at all — its degenerate pale haze painted a
      // fringe along the entire headland crest.
      float farWeightMask = farMountainMask(screenUv);
      float nearWeight = nearMountainMask(screenUv);
      float farWeight = farWeightMask * (1.0 - nearWeight);
      vec3 color = farMountainColor(screenUv) * farWeight
        + nearMountainColor(screenUv) * nearWeight;
      return color / max(nearWeight + farWeight, 0.001);
    }

    vec3 mountainLightColor(vec2 screenUv) {
      float farMask = farMountainMask(screenUv);
      float nearMask = nearMountainMask(screenUv);
      vec3 farLights = settlementLights(screenUv, farRidgeAt(screenUv.x), 13.7, 0.95);
      vec3 nearLights = settlementLights(screenUv, nearRidgeAt(screenUv.x), 31.2, 1.18);
      vec3 background = (vec3(4.4, 2.1, 0.62) * farLights.x + vec3(2.2, 2.7, 3.2) * farLights.y
        + vec3(0.60, 0.30, 0.10) * farLights.z) * farMask * (1.0 - nearMask);
      vec3 foreground = (vec3(6.2, 2.8, 0.75) * nearLights.x + vec3(3.0, 3.6, 4.2) * nearLights.y
        + vec3(0.80, 0.40, 0.14) * nearLights.z) * nearMask;

      // Red aviation beacons on the summit masts, as in the reference photo:
      // one on the right headland's crest, one on the far range's peak.
      vec3 beacons = vec3(0.0);
      for (int b = 0; b < 2; b++) {
        float bx = b == 0 ? 0.655 : 0.205;
        float by = (b == 0 ? nearRidgeAt(bx) : farRidgeAt(bx)) - 0.004;
        vec2 beaconDeltaPx = (screenUv - vec2(bx, by)) * iResolution.xy;
        float pulse = 0.65 + 0.35 * sin(iTime * 0.9 + float(b) * 2.1);
        float beaconScale = iResolution.y / 900.0;
        float beacon = (1.0 - smoothstep(0.5 * beaconScale, 1.2 * beaconScale, length(beaconDeltaPx))) * pulse;
        beacons += vec3(1.6, 0.14, 0.10) * beacon;
      }

      return (background + foreground + beacons) * u_night;
    }

    vec3 mountainColor(vec2 screenUv) {
      return mountainSurfaceColor(screenUv) + mountainLightColor(screenUv);
    }

    vec4 cruiseShipSample(vec2 screenUv) {
      // The photographed ship faces right, so give it one slow passage across
      // the bay. Fade it outside the useful part of the frame before wrapping
      // instead of reversing direction or visibly jumping back to the start.
      float passage = fract((iTime + 149.0) / 320.0);
      float shipX = mix(0.50, 0.94, passage);
      float passageAlpha = smoothstep(0.0, 0.08, passage)
        * (1.0 - smoothstep(0.92, 1.0, passage));
      float aspect = iResolution.x / iResolution.y;
      float coverage = aspect >= 1.5 ? 1.0 : max(aspect / 1.5, 0.48);
      float shipHeight = (0.080 / coverage) * aspect / 2.0;
      float shipWaterline = 0.390 - 4.0 / iResolution.y;
      vec2 point = vec2(
        (sceneX(screenUv.x) - shipX) / 0.040,
        (screenUv.y - shipWaterline) / shipHeight
      );
      if (abs(point.x) > 1.0 || point.y < 0.0 || point.y > 1.0) {
        return vec4(0.0);
      }
      vec2 shipUv = vec2(point.x * 0.5 + 0.5, point.y);
      // The mip chain (plus anisotropic filtering) already integrates the
      // minified footprint; keep the manual taps tight or they double-blur
      // the hull into mush.
      vec2 shipTexel = vec2(1.2 / 512.0, 1.2 / 256.0);
      vec4 shipCenter = texture2D(u_ship, shipUv);
      vec4 shipLeft = texture2D(u_ship, shipUv - vec2(shipTexel.x, 0.0));
      vec4 shipRight = texture2D(u_ship, shipUv + vec2(shipTexel.x, 0.0));
      vec4 shipUp = texture2D(u_ship, shipUv + vec2(0.0, shipTexel.y));
      vec4 shipDown = texture2D(u_ship, shipUv - vec2(0.0, shipTexel.y));
      float alphaSum = shipCenter.a * 2.0 + shipLeft.a + shipRight.a + shipUp.a + shipDown.a;
      // The sprite is uploaded premultiplied, so mip and linear filtering do
      // not mix transparent black into its edge colors. Reconstruct straight
      // color only after the filtered samples have been accumulated.
      vec3 premultiplied = shipCenter.rgb * 2.0
        + shipLeft.rgb
        + shipRight.rgb
        + shipUp.rgb
        + shipDown.rgb;
      vec3 shipColor = premultiplied / max(alphaSum, 0.001);
      float alphaMaximum = max(shipCenter.a, max(max(shipLeft.a, shipRight.a), max(shipUp.a, shipDown.a)));
      vec2 edgeProbe = vec2(7.0 / 512.0, 7.0 / 256.0);
      float edgeAlphaMinimum = min(
        min(texture2D(u_ship, shipUv - vec2(edgeProbe.x, 0.0)).a, texture2D(u_ship, shipUv + vec2(edgeProbe.x, 0.0)).a),
        min(texture2D(u_ship, shipUv - vec2(0.0, edgeProbe.y)).a, texture2D(u_ship, shipUv + vec2(0.0, edgeProbe.y)).a)
      );
      float boundary = smoothstep(0.08, 0.82, alphaMaximum - edgeAlphaMinimum);
      // No color lift here: brightening edge pixels toward gray painted a
      // white outline around the hull. Premultiplied filtering already keeps
      // edge colors clean; a soft alpha feather is all the edge needs.
      float shipAlpha = smoothstep(0.10, 0.90, alphaSum / 6.0);
      shipAlpha *= mix(1.0, 0.60, boundary);
      return vec4(srgbToLinear(shipColor) * 1.48, shipAlpha * passageAlpha);
    }

    float cruiseShipSmoke(vec2 screenUv) {
      float passage = fract((iTime + 149.0) / 320.0);
      float shipX = mix(0.50, 0.94, passage);
      float passageAlpha = smoothstep(0.0, 0.08, passage)
        * (1.0 - smoothstep(0.92, 1.0, passage));
      float aspect = iResolution.x / iResolution.y;
      float coverage = aspect >= 1.5 ? 1.0 : max(aspect / 1.5, 0.48);
      float shipHeight = (0.080 / coverage) * aspect / 2.0;
      float shipWaterline = 0.390 - 4.0 / iResolution.y;
      vec2 point = vec2(
        (sceneX(screenUv.x) - shipX) / 0.040,
        (screenUv.y - shipWaterline) / shipHeight
      );

      vec2 funnel = vec2(-0.39, 0.72);
      float smoke = 0.0;
      for (int index = 0; index < 6; index++) {
        float puffIndex = float(index);
        float age = fract(iTime * 0.032 + puffIndex / 6.0);
        vec2 center = funnel + vec2(-age * 1.26, age * 0.72);
        float spread = mix(0.065, 0.29, age);
        vec2 delta = (point - center) / vec2(spread * 1.55, spread);
        float shape = exp(-dot(delta, delta) * 1.35);
        float breakup = mix(0.58, 1.0, fbm(point * vec2(6.4, 8.2) + vec2(puffIndex * 2.7, -iTime * 0.025)));
        float life = smoothstep(0.0, 0.075, age) * (1.0 - smoothstep(0.58, 1.0, age));
        smoke += shape * breakup * life;
      }
      return clamp(smoke * 0.38 * passageAlpha, 0.0, 0.55);
    }

    vec3 compositeCruiseShip(vec2 screenUv, vec3 background) {
      float visibility = u_ship_ready * (1.0 - u_night);
      if (visibility <= 0.001) return background;
      // The ship and its smoke live in a narrow band above the waterline,
      // its reflection in a band just below. Skipping everything else avoids
      // evaluating six fbm smoke puffs for every sky and water pixel.
      float aspect = iResolution.x / iResolution.y;
      float coverage = aspect >= 1.5 ? 1.0 : max(aspect / 1.5, 0.48);
      float shipHeight = (0.080 / coverage) * aspect / 2.0;
      float shipWaterline = 0.390 - 4.0 / iResolution.y;
      float reflectionDepth = shipHeight * 1.6;
      if (screenUv.y < shipWaterline - reflectionDepth || screenUv.y > shipWaterline + shipHeight * 2.2) {
        return background;
      }
      if (screenUv.y >= shipWaterline - 0.0005) {
        float smoke = cruiseShipSmoke(screenUv) * visibility;
        // Light warm-gray steam, not near-black: the plume must read against
        // the dark slope behind the funnel.
        background = mix(background, vec3(0.34, 0.37, 0.39), smoke);
        vec4 ship = cruiseShipSample(screenUv);
        // Aerial perspective: at this distance across the bay the liner sits
        // behind a veil of morning haze; without it the photo-exposed sprite
        // reads as pasted onto the scene.
        ship.rgb = mix(ship.rgb, vec3(0.50, 0.62, 0.78), 0.12);
        ship.a *= visibility;
        return mix(background, ship.rgb, ship.a);
      }
      // A broken, wave-wobbled reflection seats the hull in the water.
      float below = (shipWaterline - screenUv.y) / reflectionDepth;
      vec2 mirrorUv = vec2(
        screenUv.x + sin(screenUv.y * 240.0 + iTime * 1.3) * 0.0016,
        2.0 * shipWaterline - screenUv.y
      );
      vec4 shipReflection = cruiseShipSample(mirrorUv);
      float reflectionFade = (1.0 - below) * (1.0 - below);
      float ripple = 0.75 + 0.25 * sin(screenUv.y * 620.0 + screenUv.x * 40.0 + iTime * 2.2);
      shipReflection.a *= visibility * reflectionFade * 0.30 * ripple;
      vec3 reflectionColor = mix(shipReflection.rgb * 0.55, vec3(0.30, 0.40, 0.52), 0.35);
      return mix(background, reflectionColor, shipReflection.a);
    }

    float star(vec2 screenUv, vec2 cellId, vec2 grid) {
      float rnd = hash21(cellId);
      if (rnd > 0.8) return 0.0;
      vec2 starPos = vec2(hash21(cellId + 0.1), hash21(cellId + 0.2));
      vec2 starUv = (cellId + starPos) / grid;
      vec2 deltaPx = (screenUv - starUv) * iResolution.xy;
      // Pixel radii were tuned at a ~900px-tall render; scale with the
      // actual resolution so native hi-DPI keeps the same apparent size.
      float sizePx = (0.25 + hash21(cellId + 0.3) * 0.45) * (iResolution.y / 900.0);
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
      vec2 samplePosition = position;
      vec2 swellDirection = normalize(vec2(-0.25, 1.0));
      vec2 phaseFlow = samplePosition * 0.055 + vec2(waveTime * 0.012, -waveTime * 0.009);
      float wavePhaseShift = (fbm(phaseFlow) - 0.5) * 1.25;
      wavePhaseShift += sin(dot(samplePosition, vec2(0.037, -0.051)) + waveTime * 0.015) * 0.16;
      float iteration = 0.0;
      float frequency = 1.0;
      float timeMultiplier = 2.0;
      float weight = 1.0;
      float values = 0.0;
      float weights = 0.0;
      for (int i = 0; i < 16; i++) {
        if (i >= iterations) break;
        vec2 direction = normalize(mix(vec2(sin(iteration), cos(iteration)), swellDirection, 0.18));
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
      return baseWaves;
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
      vec3 sunDirection = normalize(vec3(-0.62, 0.10, 0.78));
      float altitude = clamp(direction.y * 1.65, 0.0, 1.0);
      vec3 horizon = vec3(0.48, 0.48, 0.62);
      vec3 zenith = vec3(0.045, 0.24, 0.58);
      vec3 color = mix(horizon, zenith, pow(altitude, 0.72));

      float sunAmount = max(dot(direction, sunDirection), 0.0);
      float sunGlow = pow(sunAmount, 9.0);
      float sunCore = pow(sunAmount, 180.0);
      color += vec3(1.0, 0.72, 0.42) * sunGlow * 0.05;
      color += vec3(1.0, 0.94, 0.79) * sunCore * 0.34;

      vec2 screenUv = dirToScreenUV(direction);
      if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.395 && screenUv.y <= 1.0) {
        color = mix(color, photoSkyColor(screenUv), u_day_photo_ready * 0.96);

        // Wind-combed sunrise cirrus over the photo sky: long streaks that
        // ignite gold around the burst and cool to pale blue further out.
        // The burst core keeps burning through them.
        float sceneUvX = sceneX(screenUv.x);
        vec2 flowUv = vec2(sceneUvX * 2.4 + iTime * 0.0016, screenUv.y * 6.5);
        float comb = fbm(flowUv * vec2(1.0, 2.6) + vec2(fbm(flowUv * vec2(2.3, 1.2)) * 0.9, 0.0));
        float strand = fbm(vec2(sceneUvX * 5.2 + iTime * 0.0011, screenUv.y * 18.0));
        float cirrus = smoothstep(0.50, 0.78, comb * 0.66 + strand * 0.34);
        cirrus *= smoothstep(0.47, 0.58, screenUv.y) * (1.0 - smoothstep(0.90, 1.0, screenUv.y));
        vec2 cirrusSunDelta = (screenUv - vec2(SUN_SCREEN_X, SUN_SCREEN_Y)) / vec2(1.0, 1.55);
        float sunProximity = exp(-length(cirrusSunDelta) * 3.2);
        float coreProximity = exp(-pow(length(cirrusSunDelta) / 0.085, 2.0));
        vec3 litCloud = mix(vec3(0.98, 1.02, 1.10), vec3(1.55, 1.18, 0.72), sunProximity);
        float cloudStrength = cirrus * (0.30 + sunProximity * 0.35) * (1.0 - coreProximity * 0.6);
        color = mix(color, litCloud, clamp(cloudStrength, 0.0, 0.62) * (0.4 + 0.6 * u_day_photo_ready));
      }

      if (u_day_photo_ready < 0.5 && screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.42 && screenUv.y <= 1.0) {
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
        // A gibbous moon opposite the day scene's sunrise. It hangs high on
        // the right so its glade lands on open water instead of the ridge.
        vec2 moonDelta = (screenUv - vec2(MOON_SCREEN_X, MOON_SCREEN_Y))
          * vec2(iResolution.x / iResolution.y, 1.0);
        float moonDistance = length(moonDelta);
        float moonRadius = 0.019;
        float moonDisc = 1.0 - smoothstep(moonRadius * 0.97, moonRadius * 1.05, moonDistance);
        if (moonDisc > 0.001) {
          // Procedural lunar surface: low-frequency maria darken the basalt
          // plains, finer speckle hints at crater fields, the limb darkens
          // toward the edge and the terminator shades the lower-left.
          vec2 moonSurface = moonDelta / moonRadius;
          float maria = fbm(moonSurface * 2.4 + vec2(4.7, 1.3));
          float craters = fbm(moonSurface * 6.5 + vec2(9.2, 3.8));
          float surface = 1.0
            - smoothstep(0.38, 0.72, maria) * 0.48
            - smoothstep(0.52, 0.86, craters) * 0.22;
          float limb = 1.0 - smoothstep(0.45, 1.0, moonDistance / moonRadius) * 0.45;
          float lit = smoothstep(-0.92, 0.05, dot(moonSurface, normalize(vec2(0.66, 0.52))));
          color += vec3(0.99, 0.98, 0.90) * moonDisc * surface * limb * mix(0.10, 1.0, lit) * 1.6;
        }
        // Fade the halo out over the disc itself so it does not wash the
        // maria contrast back out.
        float moonHalo = exp(-moonDistance * 21.0) * (1.0 - moonDisc * 0.8);
        color += vec3(0.30, 0.33, 0.38) * moonHalo * 0.24;
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
        vec3 landscape = compositeCruiseShip(screenUv, mountainColor(screenUv));
        vec3 mountainComposite = landscape;
        if (mountains < 0.999) {
          vec3 edgeRay = getRay(fragmentCoordinate);
          vec3 edgeSky = compositeCruiseShip(screenUv, skyColor(edgeRay));
          mountainComposite = mix(edgeSky, landscape, mountains);
        }
        // Sunrise glare engulfs the ridge where it crosses the sun.
        float glare = sunGlare(screenUv) * (1.0 - u_night) * u_day_photo_ready;
        mountainComposite = mix(mountainComposite, vec3(1.42, 1.20, 0.88), glare * 0.85);
        fragmentColor = vec4(acesTonemap(mountainComposite * 1.25), 1.0);
        return;
      }

      vec3 ray = getRay(fragmentCoordinate);
      if (ray.y >= 0.0) {
        vec3 sky = compositeCruiseShip(screenUv, skyColor(ray));
        fragmentColor = vec4(acesTonemap(sky * mix(1.28, 2.0, u_night)), 1.0);
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
      float daylightCalm = (1.0 - u_night) * 0.58;
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
        // Daylight water catches far more sky than mountain. A full-strength
        // terrain reflection reads as a cast shadow and wrongly implies that
        // the sun is behind the ridge; keep that stronger mirror only at night.
        float mountainReflection = mountainMask(reflectionScreen);
        float reflectionWeight = mountainReflection * mix(0.38, 0.92, u_night);
        reflection = mix(reflection, mountainSurfaceColor(reflectionScreen), reflectionWeight);
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
        reflection += reflectedLights * 1.2;
      }

      vec3 scatteringBase = mix(vec3(0.006, 0.06, 0.155), vec3(0.02, 0.02, 0.03), u_night);
      vec3 scattering = scatteringBase * (0.2 + (waterPosition.y + WATER_DEPTH) / WATER_DEPTH);
      vec3 color = fresnel * reflection + scattering;
      vec3 waterBody = mix(vec3(0.005, 0.058, 0.16), vec3(0.012, 0.014, 0.022), u_night);
      color += waterBody * (1.0 - fresnel) * 0.72;
      vec3 fogColor = mix(vec3(0.075, 0.245, 0.46), vec3(0.03, 0.035, 0.05), u_night);
      color = mix(color, fogColor, 1.0 - exp(-distanceToWater * 0.02));

      // The low sun needs a corresponding path across the water. Keep it
      // broad and woven into the ocean bands, with a clock slow enough to read
      // as distant light rather than flickering particles.
      float waterProgress = clamp((0.395 - screenUv.y) / 0.395, 0.0, 1.0);
      float pathDrift = (fbm(vec2(screenUv.y * 15.0, iTime * 0.002)) - 0.5) * mix(0.010, 0.055, waterProgress);
      float pathWidth = mix(0.028, 0.17, waterProgress);
      float pathCenter = SUN_SCREEN_X + waterProgress * 0.075 + pathDrift;
      float pathDistance = (screenUv.x - pathCenter) / pathWidth;
      float solarPath = exp(-pathDistance * pathDistance * 1.12);
      vec2 glintUv = vec2(
        screenUv.x * 18.0 + waterProgress * 2.6 - iTime * 0.004,
        screenUv.y * 42.0 + iTime * 0.002
      );
      float broadGlints = fbm(glintUv);
      float fineGlints = fbm(glintUv * vec2(2.15, 1.65) + vec2(-iTime * 0.006, iTime * 0.003));
      float brokenPath = mix(0.48, 1.0, smoothstep(0.30, 0.74, broadGlints * 0.68 + fineGlints * 0.32));
      float pathFade = smoothstep(0.01, 0.09, waterProgress) * (1.0 - smoothstep(0.82, 1.0, waterProgress));
      vec3 pathColor = mix(vec3(1.02, 0.70, 0.37), vec3(0.70, 0.68, 0.59), waterProgress);
      color += pathColor * solarPath * brokenPath * pathFade * (1.0 - u_night) * 0.23;

      // The moon gets the same treatment on the opposite side of the bay:
      // a narrower silver glade woven through the same broken glint field.
      float gladeCenter = MOON_SCREEN_X - waterProgress * 0.045 + pathDrift * 0.6;
      float gladeDistance = (screenUv.x - gladeCenter) / (pathWidth * 0.78);
      float moonGlade = exp(-gladeDistance * gladeDistance * 1.35);
      color += vec3(0.68, 0.72, 0.80) * moonGlade * brokenPath * pathFade * u_night * 0.17;

      color = compositeCruiseShip(screenUv, color);
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
      float nightGray = clamp(sourceGray + nightNoise * (1.0 - sourceGray) * 0.055, 0.0, 1.0);
      // Moonlit nights on the bay read deep indigo, not neutral gray (see
      // the night reference photo): duotone from indigo shadows to silver
      // moonlight, with the warm town lights preserved below.
      vec3 monochrome = mix(vec3(0.018, 0.026, 0.052), vec3(0.86, 0.90, 1.0), nightGray);
      float warmHighlight = smoothstep(0.03, 0.36, source.r - source.b) * smoothstep(0.14, 0.62, source.r);
      vec3 nightColor = mix(monochrome, source.rgb, warmHighlight * 0.88);

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
  var oceanDayPhoto = gl.getUniformLocation(oceanProgram, "u_day_photo");
  var oceanDayPhotoReady = gl.getUniformLocation(oceanProgram, "u_day_photo_ready");
  var oceanMountainPhoto = gl.getUniformLocation(oceanProgram, "u_mountain_photo");
  var oceanMountainPhotoReady = gl.getUniformLocation(oceanProgram, "u_mountain_photo_ready");
  var oceanShip = gl.getUniformLocation(oceanProgram, "u_ship");
  var oceanShipReady = gl.getUniformLocation(oceanProgram, "u_ship_ready");
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skylineImage);
    refreshFrame();
  };
  skylineImage.onerror = function () {
    canvas.classList.add("ambient-canvas-fallback");
  };
  skylineImage.src = canvas.dataset.skyline || "/images/herceg-novi-skyline.png";

  var dayPhotoReady = 0;
  var dayPhotoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, dayPhotoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([92, 151, 190, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var dayPhotoImage = new Image();
  dayPhotoImage.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, dayPhotoTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dayPhotoImage);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    dayPhotoReady = 1;
    refreshFrame();
  };
  dayPhotoImage.onerror = function () {
    console.error("atmosphere: day photo failed to load: " + dayPhotoImage.src);
  };
  dayPhotoImage.src = canvas.dataset.dayScene || "/images/herceg-novi-day.webp";

  var mountainPhotoReady = 0;
  var mountainPhotoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, mountainPhotoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([30, 64, 74, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var mountainPhotoImage = new Image();
  mountainPhotoImage.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, mountainPhotoTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mountainPhotoImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    // The ridge band minifies this atlas ~3:1 vertically; without
    // anisotropic filtering the mip chain blurs every rock and tree flat.
    var anisotropic = gl.getExtension("EXT_texture_filter_anisotropic")
      || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
      || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
    if (anisotropic) {
      var maxAnisotropy = gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxAnisotropy));
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    mountainPhotoReady = 1;
    refreshFrame();
  };
  mountainPhotoImage.onerror = function () {
    console.error("atmosphere: mountain atlas failed to load: " + mountainPhotoImage.src);
  };
  mountainPhotoImage.src = canvas.dataset.mountainScene || "/images/herceg-novi-mountains.webp";

  var shipReady = 0;
  var shipTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shipTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var shipImage = new Image();
  shipImage.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, shipTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shipImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    var shipAnisotropic = gl.getExtension("EXT_texture_filter_anisotropic")
      || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
      || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
    if (shipAnisotropic) {
      var shipMaxAnisotropy = gl.getParameter(shipAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, shipAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, shipMaxAnisotropy));
    }
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    shipReady = 1;
    refreshFrame();
  };
  shipImage.src = "/images/herceg-novi-cruise-ship.png";

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

  // Start at full native resolution — anything less bilinear-upscales the
  // canvas and reads as blur on every edge. If the GPU cannot sustain the
  // frame rate, adaptQuality steps the scale down instead.
  var renderScale = 1.0;
  var slowFrameCount = 0;

  function resize() {
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    var pixelRatio = window.devicePixelRatio || 1;
    var renderWidth = Math.max(1, Math.round(width * pixelRatio * renderScale));
    var renderHeight = Math.max(1, Math.round(height * pixelRatio * renderScale));
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      setupFramebuffer(renderWidth, renderHeight);
    }
  }

  function adaptQuality(now) {
    if (reducedMotion) return;
    var delta = now - lastFrame;
    // Sustained misses trigger a downscale. Severe misses count heavier so
    // a truly slow renderer converges in a few frames, while a single
    // tab-wake stall decays away against normal frames.
    if (delta > 24) slowFrameCount += delta > 100 ? 4 : 1;
    else if (slowFrameCount > 0) slowFrameCount--;
    if (slowFrameCount >= 12 && renderScale > 0.67) {
      renderScale = renderScale > 0.9 ? 0.8 : 0.66;
      slowFrameCount = 0;
      console.info("atmosphere: render scale reduced to " + renderScale + " to hold frame rate");
      resize();
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
    if (!animationEligible() || event.target.closest("a, button, input, textarea, select, label")) return;
    var time = currentSceneTime(performance.now());
    var hit = screenToWater(event.clientX, event.clientY, time);
    if (!hit) return;
    ripples.push({ x: hit.x, z: hit.z, time: time, amplitude: 0.18 });
    if (ripples.length > maxRipples) ripples.shift();
  }, { passive: true });

  function currentSceneTime(now) {
    return (activeElapsed + (activeSegmentStart === null ? 0 : now - activeSegmentStart)) * 0.001;
  }

  function animationEligible() {
    return !reducedMotion && contextAvailable && !document.hidden &&
      (!observerReady || observerFallback || intersectingSurfaces.size > 0);
  }

  function cancelFrame() {
    if (frameRequest !== null) {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = null;
    }
  }

  function updateAnimationState(now) {
    if (animationEligible()) {
      if (activeSegmentStart === null) {
        activeSegmentStart = now;
        lastFrame = now;
      }
      scheduleFrame();
      return;
    }
    if (activeSegmentStart !== null) {
      activeElapsed += now - activeSegmentStart;
      activeSegmentStart = null;
    }
    cancelFrame();
  }

  function scheduleFrame() {
    if (frameRequest === null && animationEligible()) {
      frameRequest = window.requestAnimationFrame(frame);
    }
  }

  function frame(now) {
    frameRequest = null;
    if (!animationEligible()) {
      updateAnimationState(now);
      return;
    }
    if (activeSegmentStart === null) {
      activeSegmentStart = now;
      lastFrame = now;
    }
    drawFrame(now, currentSceneTime(now), true);
    scheduleFrame();
  }

  function drawFrame(now, sceneTime, animateTheme) {
    adaptQuality(now);
    resize();
    var targetNight = document.documentElement.dataset.theme === "dark" ? 1 : 0;
    if (animateTheme) {
      nightBlend += (targetNight - nightBlend) * Math.min(1, (now - lastFrame) / 180);
    } else {
      nightBlend = targetNight;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(oceanProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
    gl.enableVertexAttribArray(oceanPosition);
    gl.vertexAttribPointer(oceanPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(oceanResolution, canvas.width, canvas.height);
    gl.uniform1f(oceanTime, sceneTime);
    gl.uniform1f(oceanNight, nightBlend);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, skylineTexture);
    gl.uniform1i(oceanSkyline, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, dayPhotoTexture);
    gl.uniform1i(oceanDayPhoto, 2);
    gl.uniform1f(oceanDayPhotoReady, dayPhotoReady);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, shipTexture);
    gl.uniform1i(oceanShip, 3);
    gl.uniform1f(oceanShipReady, shipReady);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, mountainPhotoTexture);
    gl.uniform1i(oceanMountainPhoto, 4);
    gl.uniform1f(oceanMountainPhotoReady, mountainPhotoReady);
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
    gl.uniform1f(postTime, sceneTime);
    gl.uniform1f(postNight, nightBlend);
    gl.uniform1f(postNoiseScale, (window.devicePixelRatio || 1) < 1.5 ? 1.7 : 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    canvas.classList.add("shader-ready");
    lastFrame = now;
  }

  function refreshFrame() {
    if (!contextAvailable) return;
    if (document.hidden) return;
    cancelFrame();
    var now = performance.now();
    drawFrame(now, reducedMotion ? 3 : currentSceneTime(now), animationEligible());
    scheduleFrame();
  }

  window.addEventListener("resize", function () {
    resize();
    if (animationEligible()) {
      scheduleFrame();
    } else if (!document.hidden) {
      refreshFrame();
    }
  }, { passive: true });
  window.addEventListener("varyvoda:themechange", function () {
    if (reducedMotion || !animationEligible()) refreshFrame();
  });
  document.addEventListener("visibilitychange", function () {
    updateAnimationState(performance.now());
  });
  canvas.addEventListener("webglcontextlost", function (event) {
    event.preventDefault();
    contextAvailable = false;
    updateAnimationState(performance.now());
    canvas.classList.add("ambient-canvas-fallback");
  });

  var sceneSelector = ".site-header, .home-intro, .tide-gate, .project-masthead--system, .work-masthead, .writing-masthead, .about-stage, .contact-stage, .article-hero, .site-footer";
  var sceneSurfaces = document.querySelectorAll(sceneSelector);
  if (typeof window.IntersectionObserver === "undefined" || sceneSurfaces.length === 0) {
    observerFallback = true;
  } else {
    var sceneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) intersectingSurfaces.add(entry.target);
        else intersectingSurfaces.delete(entry.target);
      });
      observerReady = true;
      updateAnimationState(performance.now());
    }, { threshold: 0.01 });
    sceneSurfaces.forEach(function (surface) {
      sceneObserver.observe(surface);
    });
  }

  resize();
  if (reducedMotion) refreshFrame();
  else updateAnimationState(performance.now());
})();
