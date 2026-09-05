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

  // GPU-less environments (Lighthouse/PageSpeed bots, VMs, remote desktops)
  // expose WebGL through a software rasterizer where one frame costs seconds
  // of CPU — take the CSS gradient fallback instead of running the scene.
  // SwiftShader-based testing opts back in with ?atmosphere=force.
  if (!/[?&]atmosphere=force/.test(window.location.search)) {
    var rendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
    var rendererName = String(gl.getParameter(
      rendererInfo ? rendererInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER
    ));
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(rendererName)) {
      canvas.classList.add("ambient-canvas-fallback");
      var loseContext = gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();
      return;
    }
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
    uniform float u_sunProgress;
    uniform float u_sunScreenY;
    uniform float u_noiseScale;
    uniform sampler2D u_skyline;
    uniform sampler2D u_star_field;
    uniform sampler2D u_day_photo;
    uniform float u_day_photo_ready;
    uniform sampler2D u_mountain_photo;
    uniform float u_mountain_photo_ready;
    uniform sampler2D u_ship;
    uniform float u_ship_ready;
    uniform vec4 u_ripples[8];
    uniform int u_rippleCount;
    uniform vec2 u_waveDirections[16];

    #define PI 3.14159265359
    #define DRAG_MULT 0.38
    #define WATER_DEPTH 1.0
    #define CAMERA_HEIGHT 1.5
    #define ITERATIONS_RAYMARCH 6
    #define ITERATIONS_NORMAL 16
    #define RAYMARCH_STEPS 24
    #define FBM_OCTAVES 4
    #define SUN_SCREEN_X 0.075
    #define MOON_SCREEN_X 0.70
    #define MOON_SCREEN_Y 0.80

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    uniform sampler2D u_noise;

    float noise21(vec2 p) {
      // Value noise baked into a repeating LUT: one filtered fetch replaces
      // four hashes (each a sin) and three lerps. fbm is four of these.
      return texture2D(u_noise, p * 0.00390625).r;
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

    float terrainDetail(vec2 screenUv, float seed, float depthScale);

    // cos(0.14) / sin(0.14): the camera tilt never changes, so neither do
    // these matrices — rebuilding them per call paid sin+cos+18 multiplies.
    const mat3 CAMERA_TILT = mat3(
      1.0, 0.0, 0.0,
      0.0, 0.9902160, -0.1395431,
      0.0, 0.1395431, 0.9902160
    );
    const mat3 CAMERA_TILT_INVERSE = mat3(
      1.0, 0.0, 0.0,
      0.0, 0.9902160, 0.1395431,
      0.0, -0.1395431, 0.9902160
    );

    vec2 dirToScreenUV(vec3 dir) {
      vec3 unrotated = CAMERA_TILT_INVERSE * dir;
      if (unrotated.z <= 0.0) return vec2(-1.0);
      vec2 uv = (unrotated.xy / unrotated.z) * 1.5;
      vec2 ndc = uv / vec2(iResolution.x / iResolution.y, 1.0);
      return ndc * 0.5 + 0.5;
    }

    float sunProgress() {
      // Computed once per frame on the CPU; every per-pixel call site was
      // re-running smoothstep+clamp several times per fragment.
      return u_sunProgress;
    }

    float sunScreenY() {
      return u_sunScreenY;
    }

    vec2 sunDelta(vec2 screenUv) {
      // The burst was tuned on a 1440x900 canvas; without this correction
      // its screen-uv gaussians stretch into a wide ellipse on ultrawide
      // monitors (the moon already aspect-corrects the same way).
      vec2 delta = screenUv - vec2(SUN_SCREEN_X, sunScreenY());
      delta.x *= (iResolution.x / iResolution.y) / 1.6;
      return delta;
    }

    float sunGlare(vec2 screenUv) {
      // Keep ridge bloom local to the light source. The sun's compact core
      // and this halo use height-normalized coordinates on every aspect.
      vec2 delta = sunDelta(screenUv) * vec2(1.6, 1.0);
      delta.y *= 1.25;
      float radius = mix(0.050, 0.034, sunProgress());
      return exp(-dot(delta, delta) / (radius * radius));
    }

    vec3 daylightSun(vec3 color, vec2 screenUv) {
      // One source for the photographed sky, texture-free fallback and
      // reflected sky. Reserve white for a small core instead of clipping
      // the whole corner. Contrast, not more light, makes the core read:
      // additive gold on the pale horizon sky tonemaps to neutral white, so
      // a saturated amber field REPLACES the sky tone around the source
      // (darker than the core) and only the core itself clips.
      vec2 delta = sunDelta(screenUv) * vec2(1.6, 1.0);
      float distanceSquared = dot(delta, delta);
      float core = exp(-distanceSquared / (0.026 * 0.026));
      float bloom = exp(-distanceSquared / (0.06 * 0.06));
      float goldField = exp(-distanceSquared / (0.24 * 0.24));
      vec3 warmth = mix(vec3(1.0, 0.71, 0.36), vec3(1.0, 0.87, 0.65), sunProgress());
      vec3 amber = vec3(1.02, 0.66, 0.28) * mix(0.62, 0.95, goldField);
      color = mix(color, amber, goldField * 0.70);
      // Crepuscular rays comb up from the burst through the cirrus. They
      // are additive gold and only read because they land on the amber
      // field; on the pale sky alone they tonemapped to nothing.
      float rayAngle = atan(delta.y, delta.x);
      float rayNoise = fbm(vec2(rayAngle * 2.6, 3.1));
      float rays = pow(0.5 + 0.5 * sin(rayAngle * 9.0 + rayNoise * 5.5), 3.0);
      float rayReach = exp(-sqrt(distanceSquared) * 3.4);
      color += warmth * rays * rayReach * 0.55;
      return color + vec3(8.0, 7.2, 5.8) * core + warmth * bloom * 0.55;
    }

    vec3 sunDirection3D() {
      // The 3D ray through the sun's screen position: the one light vector
      // the water's specular, refraction, and subsurface terms all agree on.
      // Everything else about the sun is painted in screen space, so this is
      // derived from the same screen anchor rather than the other way round.
      vec2 uv = (vec2(SUN_SCREEN_X, sunScreenY()) * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
      return CAMERA_TILT * normalize(vec3(uv, 1.5));
    }

    vec3 lowSunColor(float elevation) {
      // afl_ext's getSunColorDirectly (shadertoy M3fGDl, public domain):
      // amber right at the horizon, bleaching toward gold-white as the sun
      // climbs. Drives every sunlight term on the day water.
      float st = 1.0 / (1.0 + max(elevation, 0.0) * 11.0);
      vec3 tone = max(vec3(0.0), vec3(1.0) - st * 4.0 * pow(vec3(0.196, 0.435, 0.6), vec3(2.4)));
      return tone * 4.0;
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

    vec3 photoSkyColor(vec2 screenUv, float detail) {
      float horizon = 0.395;
      float skyHeight = clamp((screenUv.y - horizon) / (1.0 - horizon), 0.0, 1.0);
      float sourceY = mix(0.535, 0.995, pow(skyHeight, 0.94));
      float drift = iTime * 0.00004;
      vec2 photoUv = vec2(clamp(sceneX(screenUv.x) + drift, 0.003, 0.997), sourceY);
      vec3 photo = srgbToLinear(texture2D(u_day_photo, photoUv).rgb) * 1.42;
      float luminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
      photo = mix(vec3(luminance), photo, 1.10);
      photo *= mix(1.04, 0.72, skyHeight);
      float viewX = screenUv.x;
      float leftField = exp(-pow((viewX + 0.035) / 0.48, 2.0));
      float lowerSky = 1.0 - smoothstep(0.24, 0.78, skyHeight);
      vec3 horizonHaze = mix(vec3(0.40, 0.55, 0.68), vec3(0.92, 0.72, 0.49), leftField * lowerSky * 0.52);
      vec3 sky = mix(horizonHaze, photo, smoothstep(0.0, 0.20, skyHeight));
      float rightBlue = smoothstep(0.18, 0.96, viewX) * smoothstep(0.08, 0.72, skyHeight);
      sky = mix(sky, sky * vec3(0.78, 0.94, 1.16), rightBlue * 0.34);

      // A restrained, local veil lets the photographed clouds survive.
      // All scales here use the existing halo coordinate system; only the
      // compact source below uses circular, height-normalized coordinates.
      vec2 haloDelta = sunDelta(screenUv) / vec2(0.30, 0.18);
      float halo = exp(-dot(haloDelta, haloDelta));
      float horizonBand = exp(-skyHeight * 5.4) * leftField;
      float cloudLight = smoothstep(0.18, 0.66, luminance) * halo;
      float veil = clamp(halo * lowerSky * 0.12
        + horizonBand * 0.08 * mix(1.0, 0.55, sunProgress()), 0.0, 0.18);
      sky = mix(sky, vec3(1.10, 0.94, 0.72), veil);
      sky += vec3(1.05, 0.78, 0.48) * cloudLight * 0.07;
      // Angular noise/ray fans are deliberately absent: they created broad
      // spokes in both the sky and the water and cost an fbm per sample.
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
      // The far band's top rows are pale summit limestone. Only columns
      // where the ridge is genuinely tall should reach them — on low tails
      // those rows compress into a blown pale lip along the silhouette, so
      // short columns stop at mid-slope forest instead.
      float farBandTop = mix(0.30, 0.48, smoothstep(0.012, 0.10, ridge - 0.395));
      float farY = mix(0.02, farBandTop, pow(height, 0.92));
      // Same summit-row gate as the far band: low columns must not drag
      // crest material down their compressed flanks.
      float nearBandTop = mix(0.76, 0.98, smoothstep(0.012, 0.10, ridge - 0.395));
      float nearY = mix(0.52, nearBandTop, pow(height, 0.92));
      // Almost no warp on the near layer: fbm displacement snakes straight
      // through the photographed villages. It only ever existed to hide
      // stretch banding, which the zoned single-orientation atlas no longer
      // has. The featureless far haze keeps a whisper for variety.
      float terrainWarp = (fbm(vec2(x * 4.8 + depth * 7.3, height * 5.2 + depth * 2.1)) - 0.5) * mix(0.004, 0.006, depth);
      terrainWarp += sin(height * 8.0 + x * 4.5 + depth * 2.4) * 0.003;
      float slopeProjection = (height - 0.5) * mix(0.02, 0.03, depth);
      // Warp peaks mid-slope and calms at both the waterline and the crest,
      // so the silhouette edge stays steady.
      float warpEnvelope = 0.42 + (height - height * height) * 1.2;
      sampleX = clamp(sampleX + slopeProjection + terrainWarp * warpEnvelope, 0.015, 0.985);
      vec2 atlasUv = vec2(sampleX, mix(farY, nearY, depth));
      // The ridge band minifies the atlas ~3:1 vertically; anisotropic
      // filtering (enabled on the texture from JS) keeps the horizontal
      // detail sharp through that minification. A shader LOD bias is the
      // wrong tool here — it aliases the vertical axis into streaks.
      vec3 photoRaw = texture2D(u_mountain_photo, atlasUv).rgb;
      vec3 photo = srgbToLinear(photoRaw);
      float rawLuminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
      // Demosaic fringes around blown village texels carry extreme chroma
      // (magenta specks on screen). Soft-limit chroma outliers only; forest
      // texels sit far below the threshold and pass through untouched.
      vec3 chromaOffset = photo - vec3(rawLuminance);
      photo = vec3(rawLuminance) + chromaOffset / (1.0 + 3.0 * max(0.0, length(chromaOffset) - 0.15));
      // Bright texels are already blown in the source: amplifying them with
      // relief or grain turns settlements into torn white paper.
      float highlightGuard = 1.0 - smoothstep(0.40, 0.78, rawLuminance);
      vec2 atlasStep = vec2(0.0024, 0.0032);
      // The neighbor taps feed only relative detail (average, relief,
      // gradient normals) — gamma-2 space costs one multiply per texel
      // where the exact 2.2 conversion costs three pow calls. The squared
      // center tap keeps every delta in the same space.
      vec3 photoCenter2 = photoRaw * photoRaw;
      vec3 photoRight = texture2D(u_mountain_photo, atlasUv + vec2(atlasStep.x, 0.0)).rgb;
      photoRight *= photoRight;
      vec3 photoLeft = texture2D(u_mountain_photo, atlasUv - vec2(atlasStep.x, 0.0)).rgb;
      photoLeft *= photoLeft;
      vec3 photoUp = texture2D(u_mountain_photo, atlasUv + vec2(0.0, atlasStep.y)).rgb;
      photoUp *= photoUp;
      vec3 photoDown = texture2D(u_mountain_photo, atlasUv - vec2(0.0, atlasStep.y)).rgb;
      photoDown *= photoDown;
      vec3 localAverage = (photoRight + photoLeft + photoUp + photoDown) * 0.25;
      // The far band is interpolation mush at this stretch — amplifying its
      // "relief" just renders oily marks. Only the near layer has real
      // detail worth lifting.
      // The far band carries transplanted canopy grain now — real material,
      // worth amplifying (the old 0.2 floor guarded interpolation mush).
      float terrainRelief = clamp(dot(photoCenter2 - localAverage, vec3(0.2126, 0.7152, 0.0722)) * 6.5, -0.22, 0.22);
      photo *= 1.0 + terrainRelief * mix(0.45, 1.0, depth) * highlightGuard;

      // The atlas is cut from the sunlit originals now — only a light
      // blue-cut remains so the forest does not go cold under the grade.
      // The references show the range across the bay staying green through
      // the haze, so the far layer gets a gentler cut of the same move.
      photo *= mix(vec3(1.0, 1.015, 0.95), vec3(1.0, 1.03, 0.90), depth);

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
      photo *= 1.0 + ((canopyGrain - 0.5) * mix(0.14, 0.22, depth)
        + (canopyFine - 0.5) * mix(0.11, 0.18, depth)) * highlightGuard;

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
      // Bay haze leans blue-green in the references, not steel blue — the
      // far layer takes 38% of this tone and was reading slate because of it.
      vec3 coastalHaze = vec3(0.15, 0.255, 0.30);
      // The sunrise references show backlit slopes: mostly dark silhouette
      // material with texture, not sunlit green faces. Keep the exposure low
      // and let the warm rim light below carry the sunrise.
      vec3 graded = chroma * mix(1.30, 1.40, depth);
      // The far band is real crag material now (DSC_4377) — retain more of
      // its structure through the haze or it flattens back into vinyl.
      graded = mix(coastalHaze, graded, mix(0.74, 0.90, depth));

      // Preserve the cool photographic material, but model the sunrise as
      // side/front light rather than a backlight. The broad diffuse term keeps
      // the actual terrain legible while the x-facing normal decides where
      // shadows fall.
      // As the sun climbs, its light reaches further across the bay.
      float sunriseReach = exp(-screenUv.x * mix(1.62, 1.0, sunProgress()));
      vec3 shadowBase = mix(vec3(0.09, 0.155, 0.19), vec3(0.05, 0.085, 0.07), depth);
      graded = mix(shadowBase, graded, mix(0.80, 0.88, depth));
      // The photograph already carries its own baked lighting. Re-lighting
      // it from atlas-gradient normals paints organic pale wisps over the
      // hazed far range — keep the synthetic relight mostly for the near
      // layer, where the atlas is sharp enough to support it.
      float diffuseShading = mix(0.62, diffuse, mix(0.30, 1.0, depth));
      graded *= mix(0.66, 0.62, depth) + diffuseShading * mix(0.56, 0.46, depth);
      float slopeLight = smoothstep(0.28, 0.84, diffuseShading) * sunriseReach;

      // The sun rises at the far left, so light must follow geometry: each
      // ridge's west flank (rising toward its peak) catches the sunrise
      // while the east flank falls into shade. flankSlope is the ridge
      // profile's derivative — positive where the crest climbs rightward.
      float sunReach = 0.22 + 0.78 * exp(-screenUv.x * mix(1.35, 0.85, sunProgress()));
      float flankLit = smoothstep(0.05, 0.8, flankSlope);
      float flankShade = smoothstep(0.05, 0.9, -flankSlope);
      graded *= 1.0 + flankLit * mix(0.26, 0.42, depth) * sunReach;
      graded *= 1.0 - flankShade * mix(0.24, 0.42, depth);
      // Warmth REPLACES tone instead of adding light: additive warm over the
      // desaturated slate painted a flat airbrushed beige smear with no
      // texture inside it. Warm-grading the photo itself keeps the canopy
      // legible inside the light, and surfaceDetail lets it breathe — but
      // only gently: a strong fbm gate stamps pale wisps onto lit flanks
      // that read as scars floating over the terrain, and the hazed far
      // range must catch far less flank warmth than the near headland.
      float warmAmount = slopeLight * (0.30 + height * 0.30) * mix(0.55, 0.72, depth)
        + flankLit * (0.16 + height * 0.28) * sunReach * mix(0.6, 1.0, depth);
      // A dissolving tail is distant haze — it must not catch warm flank
      // light or rim burn, and its tone must stay BELOW the sky's: warm +
      // morning lift on a pale haze target read as blowout.
      float lowProfile = 1.0 - smoothstep(0.003, mix(0.045, 0.022, depth), ridge - 0.395);
      warmAmount *= (0.75 + 0.40 * surfaceDetail) * (1.0 - lowProfile);
      // Low sun paints deep amber; risen sun bleaches toward gold-white.
      vec3 warmTone = mix(vec3(2.0, 1.42, 0.70), vec3(1.55, 1.32, 1.02), sunProgress());
      graded = mix(graded, graded * warmTone, clamp(warmAmount, 0.0, 0.6));

      // The backlit signature of the sunrise references: a warm rim burns
      // along crest segments that FACE the sun and dies on flat or shaded
      // stretches — an even crest glow just reads as ambient light.
      // The rim burn belongs to the backlit minutes; once the sun clears
      // the ridge the crest is lit like everything else and the rim fades.
      float crestRim = smoothstep(0.78, 0.985, height) * mix(1.0, 0.35, sunProgress()) * (1.0 - lowProfile);
      graded += vec3(1.15, 0.74, 0.38) * crestRim * sunReach * mix(0.15, 0.40, depth) * (0.10 + 0.90 * flankLit);

      // Where the ridge tapers, the land dissolves into sea haze — a broad,
      // squared falloff so it reads as atmospheric depth. The old narrow
      // hard fade left the saddle a pale vertical seam and the headland's
      // long tail a flat dark wedge stretching to the frame edge.
      // Sea haze belongs to DISTANT land. The far layer dissolves broadly;
      // the near layer only in its last stretch — and scaled by how far
      // away that stretch actually is: the left ridge's tail at the saddle
      // is the closest thing in the scene and must stay dark forest, while
      // the right headland genuinely recedes toward the open sea.
      float hazeStrength = mix(0.55, mix(0.20, 0.50, smoothstep(0.35, 0.90, screenUv.x)), depth);
      graded = mix(graded, vec3(0.37, 0.45, 0.52), lowProfile * lowProfile * hazeStrength);
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

    float moonlitFlank(float flankSlope, float height, float detail) {
      // The moon hangs high on the right, so flanks that fall away to the
      // right face it and take a faint silver wash; the rest stays a
      // silhouette. Kept subtle: the reference night photo shows dark
      // masses with tonal separation, not lit hills.
      float facing = smoothstep(0.05, 0.9, -flankSlope);
      return facing * (0.35 + 0.65 * height) * (0.6 + 0.4 * detail);
    }

    vec3 farMountainColor(vec2 screenUv) {
      float horizon = 0.395;
      float ridge = farRidgeAt(screenUv.x);
      float height = clamp((screenUv.y - horizon) / max(ridge - horizon, 0.01), 0.0, 1.0);
      float detail = terrainDetail(screenUv, 2.7, 0.72);
      float haze = 1.0 - height;
      // Per the daylight references the range across the bay reads hazed
      // GREEN, not slate blue — haze pools at the waterline, the crest
      // stays defined.
      vec3 day = mix(vec3(0.05, 0.105, 0.125), vec3(0.19, 0.295, 0.33), haze * 0.66 + detail * 0.14);
      day += vec3(0.012, 0.025, 0.032) * (1.0 - height) * (0.35 + detail * 0.65);
      day *= 0.90 + detail * 0.18;
      // The atlas far band now carries real transplanted canopy grain, so
      // the photo layer earns more weight than the old interpolation mush.
      // Skip the whole photo pipeline at full night — it mixes to nothing.
      float flankSlope = (farRidgeAt(screenUv.x + 0.015) - farRidgeAt(screenUv.x - 0.015)) / 0.03;
      if (u_night < 0.999) {
        day = mix(day, photoMountainColor(screenUv, ridge, flankSlope, 0.0), u_mountain_photo_ready * 0.78);
      }
      vec3 night = mix(vec3(0.018, 0.028, 0.041), vec3(0.052, 0.065, 0.078), haze * 0.30 + detail * 0.24);
      night += vec3(0.008, 0.010, 0.014) * moonlitFlank(flankSlope, height, detail);
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
      if (u_night < 0.999) {
        day = mix(day, photoMountainColor(screenUv, ridge, flankSlope, 1.0), u_mountain_photo_ready * 0.96);
      }
      vec3 night = mix(vec3(0.003, 0.006, 0.009), vec3(0.019, 0.027, 0.032), detail * 0.62 + valleys * 0.12);
      night += vec3(0.012, 0.015, 0.021) * moonlitFlank(flankSlope, height, detail);
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
      // Between settlements there is nothing to light — every downstream
      // term scales by population, so skip the whole hashing machinery.
      if (population < 0.002) return vec3(0.0);

      // A dense waterfront strip, generated separately so shoreline buildings
      // do not depend on a random hillside cell landing close to the water.
      // Two staggered rows thicken the strip inside town cores (the reference
      // night photo shows towns as multi-row agglomerations, not a string).
      float shoreGrid = 265.0;
      float shorelineWarm = 0.0;
      float shorelineCool = 0.0;
      // All pixel-space sizes below were tuned at a ~900px-tall render.
      float pxScale = iResolution.y / 900.0;
      // The waterfront strip lives within a few pixels of the horizon;
      // hillside pixels above it must not pay for two rows of hashing.
      float heightPx = (screenUv.y - horizon) * iResolution.y;
      if (heightPx < 16.0 * pxScale) {
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
      // Each layer's full photo pipeline (9 texture taps + several fbm
      // octaves) runs only where its own mask contributes; interior pixels
      // of one layer skip the other's entirely.
      vec3 color = vec3(0.0);
      if (farWeight > 0.001) color += farMountainColor(screenUv) * farWeight;
      if (nearWeight > 0.001) color += nearMountainColor(screenUv) * nearWeight;
      return color / max(nearWeight + farWeight, 0.001);
    }

    vec3 mountainLightColor(vec2 screenUv) {
      // The entire settlement machinery multiplies by u_night at the end —
      // skip it wholesale in day mode instead of computing it into zero.
      if (u_night <= 0.001) return vec3(0.0);
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

    vec3 mountainSurfaceColorFast(vec2 screenUv) {
      // Procedural-only tones for wave-distorted reflections, where the
      // full photographic pipeline would be invisible anyway.
      float farM = farMountainMask(screenUv);
      float nearM = nearMountainMask(screenUv);
      float nearWeight = nearM;
      float farWeight = farM * (1.0 - nearM);
      // The ridge tails dissolve into sea haze above the waterline; their
      // reflections must dissolve the same way or a dark mirror wedge
      // hangs below an already-hazed tail.
      float farTail = 1.0 - smoothstep(0.004, 0.045, farRidgeAt(screenUv.x) - 0.395);
      float nearTail = (1.0 - smoothstep(0.003, 0.022, nearRidgeAt(screenUv.x) - 0.395))
        * smoothstep(0.35, 0.90, screenUv.x);
      vec3 dayHaze = vec3(0.30, 0.37, 0.43);
      vec3 farTone = mix(mix(vec3(0.12, 0.18, 0.22), dayHaze, farTail * farTail * 0.6), vec3(0.035, 0.045, 0.058), u_night);
      vec3 nearTone = mix(mix(vec3(0.05, 0.10, 0.09), dayHaze, nearTail * nearTail * 0.6), vec3(0.012, 0.018, 0.024), u_night);
      vec3 color = farTone * farWeight + nearTone * nearWeight;
      return color / max(nearWeight + farWeight, 0.001);
    }

    vec4 cruiseShipSample(vec2 screenUv) {
      // The photographed ship faces right, so give it one slow passage across
      // the bay. Fade it outside the useful part of the frame before wrapping
      // instead of reversing direction or visibly jumping back to the start.
      // The route starts at the middle range's foot and crosses the bay.
      float passage = fract((iTime + 149.0) / 320.0);
      float shipX = mix(0.43, 1.08, passage);
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
      float shipX = mix(0.43, 1.08, passage);
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
      // The puff field spans a few ship-lengths around the funnel; the rest
      // of the full-width band must not pay for six fbm calls per pixel.
      if (point.x < -2.8 || point.x > 0.8 || point.y < 0.25) return 0.0;
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

    vec4 cruiseShipNightLights(vec2 screenUv, float pointWeight) {
      // rgb: the lit liner. a: hull coverage, so the composite can occlude
      // the shore lights behind the ship instead of adding on top of them.
      // pointWeight 0 drops the window points and deck rows: the water
      // mirror wants only the smooth spill, or it paints a barcode.
      // After dark the liner is its lights: rows of cabin windows across
      // the hull silhouette (the sprite's alpha), mostly sodium-warm with a
      // few cool deck lamps, over a faint glow the windows throw on the hull.
      float passage = fract((iTime + 149.0) / 320.0);
      float shipX = mix(0.43, 1.08, passage);
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
      // A margin past the hull for the bloom the lit decks throw into the haze.
      if (abs(point.x) > 1.4 || point.y < 0.0 || point.y > 1.35) return vec4(0.0);
      vec2 shipUv = vec2(point.x * 0.5 + 0.5, point.y);
      vec4 shipTexel = texture2D(u_ship, clamp(shipUv, 0.0, 1.0));
      float hull = shipTexel.a * step(abs(point.x), 1.0) * step(point.y, 1.0);
      // Per Igor's dusk reference: the liner reads as one bright cream-white
      // mass. Its own lights flood the white superstructure while the dark
      // hull paint stays dark, so light the sprite's actual paint instead of
      // drawing lights over a black silhouette. The warm ratio has to be
      // strong enough to pass the night duotone's warm gate, or the ship
      // comes out cool gray.
      // The windows are the light sources. Flooding the sprite's daytime
      // paint lit the ship from above — its baked daylight shading showed
      // through. Here the paint only supplies material: a flattened
      // luminance that says where white superstructure is and where the
      // dark hull is, so window glow spills onto the one and not the other.
      vec3 paint = srgbToLinear(shipTexel.rgb / max(shipTexel.a, 0.001));
      float material = pow(dot(paint, vec3(0.2126, 0.7152, 0.0722)), 0.6);
      // Simulated through ACES + the duotone: mild warm tones come out
      // neutral gray, this sodium ratio comes out cream at the cores.
      vec3 warm = vec3(1.0, 0.48, 0.18);
      // The band starts above the dark waterline strip and runs to the top
      // decks: in the reference the whole superstructure glows cream, and
      // only the lowest hull band stays dark.
      float deck = smoothstep(0.16, 0.34, shipUv.y) * (1.0 - smoothstep(0.84, 1.04, shipUv.y));
      float rows = 0.55 + 0.45 * sin(shipUv.y * 25.0 + 1.2);
      float runs = 0.40 + 0.60 * noise21(vec2(shipUv.x * 90.0 + 13.0, shipUv.y * 12.0 + 7.0));
      // Dense window rows along the decks: small hot points, close enough
      // that at this distance they merge into lit bands with visible grain.
      vec2 grid = vec2(48.0, 7.0);
      vec2 cell = floor(shipUv * grid);
      vec2 local = fract(shipUv * grid) - 0.5;
      vec2 cellPx = vec2(0.080 * iResolution.x / coverage / grid.x, shipHeight * iResolution.y / grid.y);
      float pxScale = iResolution.y / 900.0;
      float window = 1.0 - smoothstep(0.30 * pxScale, 1.0 * pxScale, length(local * cellPx));
      float keep = step(0.28, hash21(cell + vec2(3.1, 7.7)));
      float cool = step(0.82, hash21(cell + vec2(9.7, 2.3)));
      vec3 lights = mix(warm, vec3(0.75, 0.85, 1.0), cool) * window * keep * hull * deck * (0.6 + 0.4 * runs) * 4.5 * pointWeight;
      // Spill: the windows light the white superstructure around them in
      // soft deck bands; the dark hull reflects almost none of it.
      lights += warm * material * hull * deck * mix(1.0, 0.7 + 0.3 * rows, pointWeight) * (0.6 + 0.4 * runs) * 3.4;
      // Bloom: the lit superstructure glows into the marine haze, which is
      // what makes it read as one bright object across the bay.
      vec2 bloomDelta = vec2(point.x * 1.1, (shipUv.y - 0.55) / 0.55);
      float bloom = exp(-dot(bloomDelta, bloomDelta) * 2.0);
      lights += vec3(0.30, 0.21, 0.13) * bloom * 0.40;
      return vec4(lights, hull) * passageAlpha;
    }

    vec3 compositeCruiseShip(vec2 screenUv, vec3 background) {
      if (u_ship_ready <= 0.001) return background;
      float visibility = 1.0 - u_night;
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
        if (visibility > 0.001) {
          float smoke = cruiseShipSmoke(screenUv) * visibility;
          // Light warm-gray steam against the dark slope — but a fixed gray is
          // darker than the sky, so where the plume climbs past the crest it
          // read as a floating soot blot. Against bright backdrops the tint
          // becomes a whisper-darker shade of whatever is behind it instead.
          float backgroundLuminance = dot(background, vec3(0.2126, 0.7152, 0.0722));
          vec3 smokeTone = mix(vec3(0.34, 0.37, 0.39), background * 0.90 + vec3(0.02),
            smoothstep(0.30, 0.75, backgroundLuminance));
          background = mix(background, smokeTone, smoke);
          vec4 ship = cruiseShipSample(screenUv);
          // Aerial perspective: at this distance across the bay the liner sits
          // behind a veil of morning haze; without it the photo-exposed sprite
          // reads as pasted onto the scene.
          ship.rgb = mix(ship.rgb, vec3(0.50, 0.62, 0.78), 0.12);
          ship.a *= visibility;
          background = mix(background, ship.rgb, ship.a);
        }
        if (u_night > 0.001) {
          vec4 liner = cruiseShipNightLights(screenUv, 1.0);
          // The hull is opaque: the shore lights behind it must not shine
          // through. Cover them with the dark hull first, then add the glow.
          background = mix(background, vec3(0.006, 0.007, 0.010), liner.a * u_night);
          background += liner.rgb * u_night;
        }
        return background;
      }
      // A broken, wave-wobbled reflection seats the hull in the water.
      float below = (shipWaterline - screenUv.y) / reflectionDepth;
      float ripple = 0.75 + 0.25 * sin(screenUv.y * 620.0 + screenUv.x * 40.0 + iTime * 2.2);
      if (visibility > 0.001) {
        vec2 mirrorUv = vec2(
          screenUv.x + sin(screenUv.y * 240.0 + iTime * 1.3) * 0.0016,
          2.0 * shipWaterline - screenUv.y
        );
        vec4 shipReflection = cruiseShipSample(mirrorUv);
        float reflectionFade = (1.0 - below) * (1.0 - below);
        shipReflection.a *= visibility * reflectionFade * 0.30 * ripple;
        vec3 reflectionColor = mix(shipReflection.rgb * 0.55, vec3(0.30, 0.40, 0.52), 0.35);
        background = mix(background, reflectionColor, shipReflection.a);
      }
      if (u_night > 0.001) {
        // The reference reflection is a smooth warm column nearly as bright
        // as the ship: the flood-lit body mirrored, stretched down the
        // reflection depth, blurred sideways and wobbled so it stays a
        // column rather than a second ship.
        vec2 mirrorUv = vec2(
          screenUv.x + sin(screenUv.y * 260.0 + iTime * 1.5) * 0.0022,
          shipWaterline + (shipWaterline - screenUv.y) * 0.7
        );
        vec2 blur = vec2(5.0 / iResolution.x, 0.0);
        vec2 smear = vec2(0.0, 3.0 / iResolution.y);
        vec3 column = cruiseShipNightLights(mirrorUv, 0.0).rgb * 0.30
          + cruiseShipNightLights(mirrorUv - blur, 0.0).rgb * 0.20
          + cruiseShipNightLights(mirrorUv + blur, 0.0).rgb * 0.20
          + cruiseShipNightLights(mirrorUv - smear, 0.0).rgb * 0.15
          + cruiseShipNightLights(mirrorUv + smear, 0.0).rgb * 0.15;
        // Under the mirrored texture, a smooth hull-wide glow: in the
        // reference the column is a continuous warm sheet, not a row of
        // mirrored points.
        float passage = fract((iTime + 149.0) / 320.0);
        float shipX = mix(0.43, 1.08, passage);
        float passageAlpha = smoothstep(0.0, 0.08, passage) * (1.0 - smoothstep(0.92, 1.0, passage));
        float acrossHull = (sceneX(screenUv.x) - shipX) / 0.040 + sin(screenUv.y * 260.0 + iTime * 1.5) * 0.06;
        float across = 1.0 - smoothstep(0.55, 1.1, abs(acrossHull));
        float streaks = smoothstep(0.25, 0.8, fbm(vec2(screenUv.x * 420.0, screenUv.y * 110.0 + iTime * 0.3)));
        column += vec3(1.0, 0.50, 0.20) * across * (0.45 + 0.55 * streaks) * 0.55 * passageAlpha;
        // The reference column is about one ship height deep; the faster
        // falloff keeps it from flaring into a flame shape.
        float columnFade = pow(1.0 - below, 2.2) * (0.78 + 0.22 * ripple);
        background += column * columnFade * 0.55 * u_night;
      }
      return background;
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

    float wavePhaseAt(vec2 samplePosition, float waveTime) {
      // The phase field's 0.055 scale means march steps and normal-tap
      // offsets move it by well under a hundredth of a radian — computing
      // it per wave evaluation burned an fbm and a sin ~27 times per pixel.
      vec2 phaseFlow = samplePosition * 0.055 + vec2(waveTime * 0.012, -waveTime * 0.009);
      float wavePhaseShift = (fbm(phaseFlow) - 0.5) * 1.25;
      wavePhaseShift += sin(dot(samplePosition, vec2(0.037, -0.051)) + waveTime * 0.015) * 0.16;
      return wavePhaseShift;
    }

    float getWavesBaseAtTime(vec2 position, int iterations, float waveTime, float wavePhaseShift) {
      // Directions are per-iteration constants uploaded from JS — the old
      // per-call sin/cos/normalize chain rebuilt them 16 times per sample.
      float frequency = 1.0;
      float timeMultiplier = 2.0;
      float weight = 1.0;
      float values = 0.0;
      float weights = 0.0;
      for (int i = 0; i < 16; i++) {
        if (i >= iterations) break;
        vec2 direction = u_waveDirections[i];
        vec2 result = wavedx(position, direction, frequency, waveTime * timeMultiplier + wavePhaseShift);
        position += direction * result.y * weight * DRAG_MULT;
        values += result.x * weight;
        weights += weight;
        weight = mix(weight, 0.0, 0.2);
        frequency *= 1.18;
        timeMultiplier *= 1.07;
      }
      float baseWaves = values / weights;
      return baseWaves;
    }

    float getWavesBase(vec2 position, int iterations, float wavePhaseShift) {
      return getWavesBaseAtTime(position, iterations, iTime, wavePhaseShift);
    }

    float getWaves(vec2 position, int iterations, float wavePhaseShift) {
      return getWavesBase(position, iterations, wavePhaseShift) + getRipples(position);
    }

    float raymarchWater(vec3 camera, vec3 start, vec3 end, float depth, float wavePhaseShift) {
      vec3 position = start;
      vec3 direction = normalize(end - start);
      for (int i = 0; i < RAYMARCH_STEPS; i++) {
        float height = getWavesBase(position.xz, ITERATIONS_RAYMARCH, wavePhaseShift) * depth - depth;
        if (height + 0.01 > position.y) return distance(position, camera);
        position += direction * (position.y - height);
      }
      return distance(start, camera);
    }

    vec3 normalAt(vec2 position, float epsilon, float depth, float wavePhaseShift) {
      vec2 ex = vec2(epsilon, 0.0);
      float height = getWaves(position.xy, ITERATIONS_NORMAL, wavePhaseShift) * depth;
      vec3 center = vec3(position.x, height, position.y);
      return normalize(cross(
        center - vec3(position.x - epsilon, getWaves(position.xy - ex.xy, ITERATIONS_NORMAL, wavePhaseShift) * depth, position.y),
        center - vec3(position.x, getWaves(position.xy + ex.yx, ITERATIONS_NORMAL, wavePhaseShift) * depth, position.y + epsilon)
      ));
    }

    vec3 slowLightNormalAt(vec2 position, float epsilon, float depth, float waveTime) {
      vec2 ex = vec2(epsilon, 0.0);
      float wavePhaseShift = wavePhaseAt(position, waveTime);
      float height = getWavesBaseAtTime(position.xy, 8, waveTime, wavePhaseShift) * depth;
      vec3 center = vec3(position.x, height, position.y);
      return normalize(cross(
        center - vec3(position.x - epsilon, getWavesBaseAtTime(position.xy - ex.xy, 8, waveTime, wavePhaseShift) * depth, position.y),
        center - vec3(position.x, getWavesBaseAtTime(position.xy + ex.yx, 8, waveTime, wavePhaseShift) * depth, position.y + epsilon)
      ));
    }

    vec3 getRay(vec2 fragmentCoordinate) {
      vec2 uv = ((fragmentCoordinate / iResolution) * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
      vec3 projection = normalize(vec3(uv.x, uv.y, 1.5));
      return CAMERA_TILT * projection;
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

    vec3 daySky(vec3 direction, float detail) {
      float altitude = clamp(direction.y * 1.65, 0.0, 1.0);
      vec3 horizon = vec3(0.48, 0.48, 0.62);
      vec3 zenith = vec3(0.045, 0.24, 0.58);
      vec3 color = mix(horizon, zenith, pow(altitude, 0.72));

      vec2 screenUv = dirToScreenUV(direction);
      if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.395 && screenUv.y <= 1.0) {
        color = mix(color, photoSkyColor(screenUv, detail), u_day_photo_ready * 0.96);

        // Wind-combed cirrus complement the photographed clouds rather
        // than painting over them. Keep the compact sun unobscured and
        // skip this detail in wave-broken reflections.
        if (detail > 0.5) {
        float sceneUvX = sceneX(screenUv.x);
        vec2 flowUv = vec2(sceneUvX * 2.4 + iTime * 0.0016, screenUv.y * 6.5);
        float comb = fbm(flowUv * vec2(1.0, 2.6) + vec2(fbm(flowUv * vec2(2.3, 1.2)) * 0.9, 0.0));
        float strand = fbm(vec2(sceneUvX * 5.2 + iTime * 0.0011, screenUv.y * 18.0));
        float cirrus = smoothstep(0.50, 0.78, comb * 0.66 + strand * 0.34);
        cirrus *= smoothstep(0.47, 0.58, screenUv.y) * (1.0 - smoothstep(0.90, 1.0, screenUv.y));
        vec2 cirrusSunDelta = sunDelta(screenUv) * vec2(1.6, 1.0);
        float sunProximity = exp(-length(cirrusSunDelta) * 5.0);
        float coreProximity = exp(-dot(cirrusSunDelta, cirrusSunDelta) / (0.045 * 0.045));
        vec3 litCloud = mix(vec3(0.90, 0.98, 1.08), vec3(1.22, 1.08, 0.83), sunProximity);
        float cloudStrength = cirrus * (0.18 + sunProximity * 0.16) * (1.0 - coreProximity);
        color = mix(color, litCloud, clamp(cloudStrength, 0.0, 0.34) * (0.4 + 0.6 * u_day_photo_ready));
        }
      }

      if (detail > 0.5 && u_day_photo_ready < 0.5 && screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y >= 0.42 && screenUv.y <= 1.0) {
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

      // Apply the same source once, after either sky and its clouds.
      color = daylightSun(color, screenUv);
      return color;
    }

    vec3 nightSky(vec3 direction, float detail) {
      vec2 screenUv = dirToScreenUV(direction);
      // The bay is never a black observatory sky. Herceg Novi and the towns
      // across the water lift the low atmosphere while the zenith stays deep
      // indigo. A little uneven marine haze keeps the gradient photographic
      // instead of reading as a flat grey backdrop.
      float skyHeight = smoothstep(0.35, 0.98, screenUv.y);
      vec3 horizon = vec3(0.038, 0.044, 0.060);
      vec3 zenith = vec3(0.006, 0.011, 0.027);
      vec3 color = mix(horizon, zenith, pow(skyHeight, 0.62));
      if (screenUv.x >= 0.0 && screenUv.x <= 1.0 && screenUv.y > 0.35 && screenUv.y <= 1.0) {
        float coastalHaze = (1.0 - smoothstep(0.38, 0.70, screenUv.y));
        coastalHaze *= 0.72 + noise21(vec2(sceneX(screenUv.x) * 2.2, screenUv.y * 7.0)) * 0.28;
        color += vec3(0.012, 0.010, 0.009) * coastalHaze;
        // Light domes: the towns throw a faint warm glow up into the haze
        // above their ridges, strongest over Herceg Novi on the left and a
        // smaller one over the headland-base town on the right. Without it
        // the sky is one flat gradient from ridge to zenith.
        float sceneUvX = sceneX(screenUv.x);
        float domeRise = exp(-max(screenUv.y - 0.40, 0.0) * 7.5);
        float domes = exp(-pow((sceneUvX - 0.20) / 0.20, 2.0))
          + exp(-pow((sceneUvX - 0.53) / 0.10, 2.0)) * 0.45;
        color += vec3(0.020, 0.015, 0.010) * domes * domeRise;
        // A gibbous moon opposite the day scene's sunrise. It hangs high on
        // the right so its glade lands on open water instead of the ridge.
        vec2 moonDelta = (screenUv - vec2(MOON_SCREEN_X, MOON_SCREEN_Y))
          * vec2(iResolution.x / iResolution.y, 1.0);
        float moonDistance = length(moonDelta);
        float moonRadius = 0.019;
        // Reflection rays see a soft lobe, not the hard disc: a wave facet
        // that happens to mirror the disc otherwise paints a hard-edged
        // white splat on the water. Real glitter is the disc smeared by
        // surface roughness, so the mirrored moon is wider and dimmer.
        float moonDisc = detail > 0.5
          ? 1.0 - smoothstep(moonRadius * 0.97, moonRadius * 1.05, moonDistance)
          : exp(-pow(moonDistance / (moonRadius * 1.9), 2.0)) * 0.55;
        if (moonDisc > 0.001) {
          // Procedural lunar surface: low-frequency maria darken the basalt
          // plains, finer speckle hints at crater fields, the limb darkens
          // toward the edge and the terminator shades the lower-left.
          vec2 moonSurface = moonDelta / moonRadius;
          float surface = 1.0;
          if (detail > 0.5) {
            // Maria and crater speckle are invisible in wave-broken
            // reflections - only primary rays pay for the fbm.
            float maria = fbm(moonSurface * 2.4 + vec2(4.7, 1.3));
            float craters = fbm(moonSurface * 6.5 + vec2(9.2, 3.8));
            surface = 1.0
              - smoothstep(0.38, 0.72, maria) * 0.48
              - smoothstep(0.52, 0.86, craters) * 0.22;
          }
          float limb = 1.0 - smoothstep(0.45, 1.0, moonDistance / moonRadius) * 0.45;
          float lit = smoothstep(-0.92, 0.05, dot(moonSurface, normalize(vec2(0.66, 0.52))));
          color += vec3(0.99, 0.98, 0.90) * moonDisc * surface * limb * mix(0.10, 1.0, lit) * 1.6;
        }
        // Fade the halo out over the disc itself so it does not wash the
        // maria contrast back out.
        float moonHalo = exp(-moonDistance * 21.0) * (1.0 - moonDisc * 0.8);
        color += vec3(0.30, 0.33, 0.38) * moonHalo * 0.24;
        // The CPU projects real Bright Star Catalogue positions for a
        // 23:00 local sky over Herceg Novi. Keep that screen-space texture
        // out of wave-broken reflections, where individual stars disappear.
        if (detail > 0.5) {
          vec4 starSample = texture2D(u_star_field, screenUv);
          vec3 starField = starSample.rgb;
          float starLuminance = max(starField.r, max(starField.g, starField.b));
          if (starLuminance > 0.002) {
            // Scintillation. Three beating tones give an irregular flicker
            // instead of a metronome, and the phase is baked per star in the
            // texture's alpha channel, so a star never tears across a
            // screen-space cell boundary.
            float phase = starSample.a * 47.0;
            float flicker = sin(iTime * 3.1 + phase)
              + sin(iTime * 5.7 + phase * 2.7) * 0.62
              + sin(iTime * 9.4 + phase * 5.3) * 0.31;
            flicker *= 0.52;
            // Air mass: a star just above the ridge boils, one overhead is
            // nearly steady.
            float airMass = 1.0 - smoothstep(0.42, 0.95, screenUv.y);
            float twinkleStrength = 0.09 + airMass * 0.35;
            twinkleStrength *= smoothstep(0.006, 0.05, starLuminance);
            starField *= 1.0 + flicker * twinkleStrength;
            // Low stars split colour while they scintillate, the way Sirius
            // flashes red and blue over the water.
            float prism = flicker * twinkleStrength * 0.5;
            starField.r *= 1.0 + prism;
            starField.b *= 1.0 - prism;
            starField = max(starField, vec3(0.0));
          }
          // A bright moon lowers contrast across a broad patch of sky, not
          // just in the immediate halo around the disc.
          float moonWash = exp(-moonDistance * 5.2);
          color += starField * mix(1.0, 0.20, moonWash);
        }
      }
      return color;
    }

    vec3 skyColor(vec3 direction, float detail) {
      // At full day or full night, skip the other sky entirely: the moon's
      // fbm surface (every daytime reflection ray) or the whole photo-sky
      // pipeline (every night pixel) otherwise runs just to be weighted by
      // zero. Single call sites keep the inlined shader small.
      vec3 day = vec3(0.0);
      vec3 night = vec3(0.0);
      if (u_night < 0.999) day = daySky(direction, detail);
      if (u_night > 0.001) night = nightSky(direction, detail);
      return mix(day, night, u_night);
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
          vec3 edgeSky = compositeCruiseShip(screenUv, skyColor(edgeRay, 1.0));
          mountainComposite = mix(edgeSky, landscape, mountains);
        }
        // Local bloom softens only the ridge immediately next to the sun;
        // the photographed slope remains legible outside that small halo.
        float glare = sunGlare(screenUv) * (1.0 - u_night) * u_day_photo_ready;
        // Keep the terrain breathing inside the dissolve: a flat amber
        // replacement painted the ridge as a featureless khaki wedge.
        float compositeLuma = dot(mountainComposite, vec3(0.2126, 0.7152, 0.0722));
        vec3 glareTone = vec3(1.35, 1.04, 0.62) * (0.70 + 0.55 * min(compositeLuma, 0.8));
        mountainComposite = mix(mountainComposite, glareTone, glare * 0.50);
        float mountainLift = 1.0 + 0.13 * sunProgress() * (1.0 - u_night);
        fragmentColor = vec4(acesTonemap(mountainComposite * 1.25 * mountainLift), 1.0);
        return;
      }

      vec3 ray = getRay(fragmentCoordinate);
      if (ray.y >= 0.0) {
        vec3 sky = compositeCruiseShip(screenUv, skyColor(ray, 1.0));
        float skyLift = 1.0 + 0.10 * sunProgress() * (1.0 - u_night);
        fragmentColor = vec4(acesTonemap(sky * mix(1.28, 2.0, u_night) * skyLift), 1.0);
        return;
      }

      vec3 origin = vec3(iTime * 0.2, CAMERA_HEIGHT, 1.0);
      float highHit = intersectPlane(origin, ray, vec3(0.0), vec3(0.0, 1.0, 0.0));
      float lowHit = intersectPlane(origin, ray, vec3(0.0, -WATER_DEPTH, 0.0), vec3(0.0, 1.0, 0.0));
      vec3 highPosition = origin + ray * highHit;
      vec3 lowPosition = origin + ray * lowHit;
      float wavePhaseShift = wavePhaseAt(highPosition.xz, iTime);
      // The bay lies calmer after dark: half the swell height, so the night
      // water reads as a dark mirror instead of rolling gray lumps.
      float waveDepth = WATER_DEPTH * mix(1.0, 0.5, u_night);
      float distanceToWater = raymarchWater(origin, highPosition, lowPosition, waveDepth, wavePhaseShift);
      vec3 waterPosition = origin + ray * distanceToWater;

      // At grazing rows near the waterline the raymarch distance flickers
      // per pixel, dithering the fog weight and reflection hits into rows of
      // dark dashes. Pin the last stretch to the flat plane instead.
      float horizonProximity = 1.0 - smoothstep(0.0, 0.035, 0.395 - screenUv.y);
      float stableDistance = mix(distanceToWater, highHit, horizonProximity);

      float epsilon = max(0.008, distanceToWater * 0.0028);
      vec3 normal = normalAt(waterPosition.xz, epsilon, waveDepth, wavePhaseShift);
      float distanceFlatten = 0.8 * min(1.0, sqrt(distanceToWater * 0.01) * 1.1);
      distanceFlatten = max(distanceFlatten, horizonProximity * 0.95);
      // Daylight used to flatten normals 58% toward up for a calm-bay look —
      // which also erased the per-facet fresnel variation that makes sunlit
      // water sparkle. Keep only a light touch; distance flattening already
      // handles the far field (M3fGDl port, 2026-07-22).
      float daylightCalm = (1.0 - u_night) * 0.08;
      normal = mix(normal, vec3(0.0, 1.0, 0.0), clamp(distanceFlatten + daylightCalm, 0.0, 0.95));

      // Micro facets live on a SEPARATE normal used only by the sun terms:
      // folding them into the base normal raised fresnel everywhere and
      // sheened the whole bay gray. The base normal keeps the water dark and
      // smooth; the glint normal makes individual wavelets catch the sun.
      // Night keeps the facets too: the moon glade is built from them.
      float microReach = 1.0 - smoothstep(3.0, 60.0, distanceToWater);
      vec3 glintNormal = normal;
      if (microReach > 0.001) {
        vec2 microUv = waterPosition.xz * 4.5 + vec2(iTime * 0.35, -iTime * 0.22);
        vec3 micro = vec3(fbm(microUv) - 0.5, 0.0, fbm(microUv + vec2(37.7, 11.3)) - 0.5);
        glintNormal = normalize(normal + micro * 0.55 * microReach);
      }

      vec3 sunDir = sunDirection3D();
      vec3 lowSun = lowSunColor(sunDir.y) * (1.0 - u_night);

      float fresnelSharp = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(-normal, ray)), 5.0);
      float fresnelFlat = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(vec3(0.0, 1.0, 0.0), -ray)), 5.0);
      float fresnelBlend = min(1.0, sqrt(distanceToWater * 0.01) * 1.1);
      float fresnel = mix(fresnelSharp, fresnelFlat, fresnelBlend);

      vec3 reflectionDirection = normalize(reflect(ray, normal));
      reflectionDirection.y = abs(reflectionDirection.y);
      // Grazing rows are repainted almost entirely by the fog — computing
      // the full sky/mirror/lights reflection there is wasted work.
      float fogAmount = 1.0 - exp(-stableDistance * mix(0.013, 0.02, u_night));
      vec3 reflection = vec3(0.0);
      if (fogAmount < 0.985) {
      reflection = skyColor(reflectionDirection, 0.0);
      vec2 reflectionScreen = dirToScreenUV(reflectionDirection);
      if (reflectionScreen.x >= 0.0 && reflectionScreen.x <= 1.0 && reflectionScreen.y >= 0.0 && reflectionScreen.y <= 1.0) {
        // Daylight water catches far more sky than mountain. A full-strength
        // terrain reflection reads as a cast shadow and wrongly implies that
        // the sun is behind the ridge; keep that stronger mirror only at night.
        float mountainReflection = mountainMask(reflectionScreen);
        float reflectionWeight = mountainReflection * mix(0.38, 0.92, u_night);
        reflection = mix(reflection, mountainSurfaceColorFast(reflectionScreen), reflectionWeight);
      }

      // Reuse the woven ocean geometry for reflected lights, but evaluate it
      // on a slower clock and remove the camera's forward drift. This retains
      // the broken streak shape without making it chase every surface wave.
      // The whole block only matters at night — skip it in daylight.
      if (u_night > 0.001) {
        vec2 lightWavePosition = waterPosition.xz - vec2(iTime * 0.2, 0.0);
        float lightEpsilon = max(0.035, distanceToWater * 0.009);
        vec3 lightNormal = slowLightNormalAt(lightWavePosition, lightEpsilon, waveDepth, iTime * 0.14);
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

          // Long streaked columns under the towns, as in the reference night
          // photo. The mirror above only reaches a few rows below the shore
          // because the lights sit a few rows above it; here the reflected
          // point is pulled back toward the horizon so each light smears
          // down into the bay, wobbling and breaking with the surface.
          float below = 0.395 - screenUv.y;
          if (below < 0.11) {
            float columnWobble = sin(screenUv.y * 240.0 + iTime * 0.9) * 0.0018
              + (fbm(vec2(screenUv.x * 60.0, screenUv.y * 25.0 - iTime * 0.12)) - 0.5) * 0.004;
            vec2 columnScreen = vec2(
              lightScreen.x + columnWobble,
              0.3955 + max(lightScreen.y - 0.395, 0.0) * 0.16
            );
            float columnBreak = 0.45 + 0.55 * fbm(vec2(screenUv.x * 120.0, screenUv.y * 45.0 + iTime * 0.25));
            float columnFade = exp(-below * 26.0) * columnBreak;
            reflection += mountainLightColor(columnScreen) * columnFade * 0.42;
          }
        }
      }

      }

      // Day water body is DARK — near-black olive troughs are what make the
      // fresnel glints and subsurface glow read. All of the day water's light
      // now comes from the sky it reflects and the sun shining through it
      // (M3fGDl port).
      // Night water is near-black indigo: the old body and fog sat brighter
      // than the sky above the ridge, so the bay read as a pewter sheet and
      // every swell showed as a gray lump. Only what the surface mirrors
      // (sky, moon, town lights) should carry light after dark.
      vec3 scatteringBase = mix(vec3(0.0025, 0.022, 0.05), vec3(0.006, 0.007, 0.012), u_night);
      vec3 scattering = scatteringBase * (0.2 + (waterPosition.y + waveDepth) / waveDepth);
      vec3 color = fresnel * reflection + scattering;
      vec3 waterBody = mix(vec3(0.003, 0.03, 0.075), vec3(0.004, 0.005, 0.010), u_night);
      color += waterBody * (1.0 - fresnel) * 0.72;

      vec3 moonGlitter = vec3(0.0);
      if (u_night > 0.001) {
        // Moon glitter from the same micro facets the sun uses by day: a
        // silver specular lobe toward the moon's mirror direction, with
        // hard pinpoint cores on top. The facets, not an airbrushed cone,
        // decide where the glade breaks. Added after the fog so the column
        // stays brightest toward the horizon, as a real glade does.
        vec2 moonUv = (vec2(MOON_SCREEN_X, MOON_SCREEN_Y) * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
        vec3 moonDir = CAMERA_TILT * normalize(vec3(moonUv, 1.5));
        vec3 moonReflection = normalize(reflect(ray, glintNormal));
        moonReflection.y = abs(moonReflection.y);
        float moonDot = max(0.0, dot(moonReflection, moonDir));
        float moonFresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(-glintNormal, ray)), 5.0);
        vec3 moonSilver = vec3(0.72, 0.78, 0.92);
        // The pinpoint lobe alone traces the smooth micro-noise contours and
        // draws foam-like ribbons. A fine noise gate breaks it into beads,
        // and the near field thins out: real glitter is densest toward the
        // horizon and sparse at the viewer's feet.
        float bead = smoothstep(0.40, 0.70, fbm(waterPosition.xz * 16.0 + vec2(iTime * 0.6, -iTime * 0.4)));
        float nearGate = mix(0.22, 1.0, smoothstep(2.0, 18.0, distanceToWater));
        moonGlitter = moonSilver * (pow(moonDot, 90.0) * 0.05 + pow(moonDot, 600.0) * 3.0 * bead) * moonFresnel * nearGate * u_night;
      }

      // Subsurface scattering, the pair of terms that make M3fGDl's water
      // look like water: crests between the camera and the sun transmit
      // teal-green light along the refracted ray, and wave height adds a
      // faint body glow gated by sun elevation.
      if (u_night < 0.999) {
        // The reflected sun itself: a tight specular spike (afl_ext's
        // pow-1228 train, relaxed for our calmer facets) in HDR range so
        // ACES shapes it into hard golden glints along the sun's azimuth.
        // Fresnel comes from the glint facet, not the smooth base normal —
        // a tilted wavelet is what the sun actually flashes off.
        vec3 glintReflection = normalize(reflect(ray, glintNormal));
        glintReflection.y = abs(glintReflection.y);
        float glintDot = max(0.0, dot(glintReflection, sunDir));
        float glintFresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(-glintNormal, ray)), 5.0);
        // Keep the warm train narrow enough to read as reflected sunlight,
        // not a copper-colored repaint of the bay. Fresnel retains the dark
        // troughs between facets; only the small sparkle cores reach white.
        float trainField = pow(glintDot, 36.0);
        float dayBlend = 1.0 - u_night;
        vec3 trainTint = mix(vec3(1.0, 0.72, 0.38), vec3(1.0, 0.86, 0.63), sunProgress());
        vec3 warmReflection = trainTint * (0.28 + glintFresnel * 0.85);
        color = mix(color, warmReflection, trainField * 0.58 * dayBlend);
        color += lowSun * pow(glintDot, 480.0) * 12.0 * glintFresnel;

        vec3 refracted = normalize(refract(ray, glintNormal, 0.66));
        float crestGlow = pow(max(0.0, dot(refracted, sunDir)), 16.0);
        float elevationGate = 1.0 - 1.0 / (1.0 + 5.0 * max(0.0, sunDir.y));
        color += vec3(0.5, 0.9, 0.8) * crestGlow * lowSun * 30.0 * elevationGate;
        float relativeHeight = (waterPosition.y + WATER_DEPTH) / WATER_DEPTH;
        color += vec3(0.01, 0.33, 0.55) * 0.34 * lowSun * (0.3 + relativeHeight) * 0.3 * max(0.0, sunDir.y);
      }
      // Day fog is pale haze, not deep blue: the old vec3(0.075, 0.245, 0.46)
      // made the FAR water the darkest, most saturated blue in the scene —
      // atmospheric perspective inverted, and a hard graphic band under the
      // shore. Distance should wash toward the sky's horizon haze.
      vec3 fogColor = mix(vec3(0.145, 0.215, 0.30), vec3(0.016, 0.019, 0.030), u_night);
      // Sunrise haze: distance fog on the sun's side of the bay carries the
      // burst's warmth, so the far water pools gold under the sun instead of
      // cutting to neutral blue-gray at the fog line.
      float fogWarmth = exp(-pow((screenUv.x - SUN_SCREEN_X) / 0.15, 2.0)) * (1.0 - u_night);
      fogColor = mix(fogColor, vec3(0.66, 0.57, 0.43), fogWarmth * 0.34);
      color = mix(color, fogColor, fogAmount);
      color += moonGlitter * (1.0 - fogAmount * 0.55);

      // Open-sea horizon after dark: grazing water mirrors the sky, so the
      // last rows blend up to the sky's own horizon tone instead of meeting
      // it along a razor line. Only where sky, not land, stands above.
      if (u_night > 0.001 && horizonProximity > 0.001) {
        float skyAbove = 1.0 - mountainMask(vec2(screenUv.x, 0.79 - screenUv.y));
        color = mix(color, vec3(0.040, 0.046, 0.063),
          horizonProximity * horizonProximity * skyAbove * 0.85 * u_night);
      }

      // Fog at full strength erased every trace of the shore in the water,
      // leaving a razor-straight cut along the entire waterline. A hazed
      // mirror of the slopes hugs the first stretch below the shore and
      // seats the land in the bay; night keeps its own stronger mirror.
      float shoreBand = 1.0 - smoothstep(0.0, 0.026, 0.395 - screenUv.y);
      if (shoreBand > 0.001 && u_night < 0.999) {
        vec2 shoreMirror = vec2(screenUv.x, 0.79 - screenUv.y);
        float shoreMask = mountainMask(shoreMirror);
        vec3 shoreTone = mix(mountainSurfaceColorFast(shoreMirror), fogColor, 0.45);
        color = mix(color, shoreTone, shoreBand * shoreBand * shoreMask * 0.65 * (1.0 - u_night));
      }

      // The low sun needs a corresponding path across the water. Keep it
      // broad and woven into the ocean bands, with a clock slow enough to read
      // as distant light rather than flickering particles.
      float waterProgress = clamp((0.395 - screenUv.y) / 0.395, 0.0, 1.0);
      float pathDrift = (fbm(vec2(screenUv.y * 15.0, iTime * 0.002)) - 0.5) * mix(0.010, 0.055, waterProgress);
      float pathWidth = mix(0.028, 0.17, waterProgress);
      float pathCenter = SUN_SCREEN_X + waterProgress * 0.075 + pathDrift;
      // Narrow only the solar path; the moon reuses pathWidth below.
      float pathDistance = (screenUv.x - pathCenter) / (pathWidth * 0.68);
      float solarPath = exp(-pathDistance * pathDistance * 1.12);
      vec2 glintUv = vec2(
        screenUv.x * 18.0 + waterProgress * 2.6 - iTime * 0.004,
        screenUv.y * 42.0 + iTime * 0.002
      );
      float broadGlints = fbm(glintUv);
      float fineGlints = fbm(glintUv * vec2(2.15, 1.65) + vec2(-iTime * 0.006, iTime * 0.003));
      float brokenPath = mix(0.48, 1.0, smoothstep(0.30, 0.74, broadGlints * 0.68 + fineGlints * 0.32));
      float pathFade = smoothstep(0.01, 0.09, waterProgress) * (1.0 - smoothstep(0.82, 1.0, waterProgress));
      vec3 pathColor = mix(vec3(0.94, 0.76, 0.48), vec3(0.64, 0.67, 0.66), waterProgress);
      // The path strengthens as the sun climbs and pours more light onto
      // the water.
      // Physical glints own the near and mid train now; the painted path
      // only carries the far pool where fog has flattened the geometry.
      float pathZone = mix(0.35, 1.0, smoothstep(0.12, 0.55, fogAmount));
      color += pathColor * solarPath * brokenPath * pathFade * (1.0 - u_night)
        * mix(0.20, 0.30, sunProgress()) * pathZone;

      // The moon gets the same treatment on the opposite side of the bay:
      // a narrower silver glade woven through the same broken glint field.
      float gladeCenter = MOON_SCREEN_X - waterProgress * 0.045 + pathDrift * 0.6;
      float gladeDistance = (screenUv.x - gladeCenter) / (pathWidth * 0.78);
      float moonGlade = exp(-gladeDistance * gladeDistance * 1.35);
      // Only a faint painted glade remains under the facet glitter above; the
      // old 0.17 airbrushed a milky cone over the whole right bay.
      color += vec3(0.68, 0.72, 0.80) * moonGlade * brokenPath * pathFade * u_night * 0.05;

      color = compositeCruiseShip(screenUv, color);
      float waterLift = 1.0 + 0.13 * sunProgress() * (1.0 - u_night);
      fragmentColor = vec4(acesTonemap(color * mix(1.12, 1.9, u_night) * waterLift), 1.0);
    }

    float gaussian(float value, float mean, float deviation) {
      return (1.0 / (deviation * sqrt(6.283))) * exp(-(((value - mean) * (value - mean)) / (2.0 * deviation * deviation)));
    }

    vec3 filmGrade(vec3 source, vec2 fragmentCoordinate) {
      float sourceGray = dot(source, vec3(0.299, 0.587, 0.114));
      vec2 uv = fragmentCoordinate * u_noiseScale / iResolution;
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noiseSample = fract(sin(seed) * 43758.5453 + iTime * 1.5);

      vec3 dayColor = mix(vec3(sourceGray), source, 1.06);
      dayColor = (dayColor - 0.5) * 1.035 + 0.5;
      dayColor += (noiseSample - 0.5) * 0.006 * (0.55 + sourceGray * 0.45);
      dayColor = clamp(dayColor, 0.0, 1.0);

      float nightNoise = gaussian(noiseSample, 0.0, 0.36);
      float nightGray = clamp(sourceGray + nightNoise * (1.0 - sourceGray) * 0.030, 0.0, 1.0);
      // Deeper indigo duotone: measured R-B was only 12/255 across sky, ridge
      // and water, which reads as gray dusk rather than a moonlit night.
      vec3 monochrome = mix(vec3(0.010, 0.016, 0.052), vec3(0.80, 0.86, 1.0), nightGray);
      float warmHighlight = smoothstep(0.03, 0.36, source.r - source.b) * smoothstep(0.14, 0.62, source.r);
      vec3 nightColor = mix(monochrome, source, warmHighlight * 0.88);

      return mix(dayColor, nightColor, u_night);
    }

    void main() {
      vec4 sceneColor;
      mainImage(sceneColor, gl_FragCoord.xy);
      gl_FragColor = vec4(filmGrade(sceneColor.rgb, gl_FragCoord.xy), 1.0);
    }
  `;

  // Querying compile/link status forces a synchronous wait, so none happens
  // here: with KHR_parallel_shader_compile the driver compiles this large
  // shader on its own threads while textures decode and calibration runs,
  // and the first draw performs the one-time validation instead.
  gl.getExtension("KHR_parallel_shader_compile");

  function link(vertexSourceText, fragmentSourceText) {
    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSourceText);
    gl.compileShader(vertex);
    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSourceText);
    gl.compileShader(fragment);
    var linked = gl.createProgram();
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.linkProgram(linked);
    return linked;
  }

  var oceanProgram = link(vertexSource, oceanFragmentSource);
  var programValidated = false;

  function validateProgramOnce() {
    if (programValidated) return contextAvailable;
    programValidated = true;
    if (!gl.getProgramParameter(oceanProgram, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(oceanProgram));
      canvas.classList.add("ambient-canvas-fallback");
      contextAvailable = false;
      return false;
    }
    initLocations();
    return true;
  }

  var oceanBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  var oceanPosition, oceanResolution, oceanTime, oceanNight, oceanNoiseScale,
    oceanSkyline, oceanStarField, oceanDayPhoto, oceanDayPhotoReady, oceanMountainPhoto,
    oceanMountainPhotoReady, oceanShip, oceanShipReady, oceanRipples,
    oceanRippleCount, oceanSunProgress, oceanSunScreenY, oceanWaveDirections, oceanNoise;

  function initLocations() {
    oceanPosition = gl.getAttribLocation(oceanProgram, "position");
    oceanResolution = gl.getUniformLocation(oceanProgram, "iResolution");
    oceanTime = gl.getUniformLocation(oceanProgram, "iTime");
    oceanNight = gl.getUniformLocation(oceanProgram, "u_night");
    oceanNoiseScale = gl.getUniformLocation(oceanProgram, "u_noiseScale");
    oceanSkyline = gl.getUniformLocation(oceanProgram, "u_skyline");
    oceanStarField = gl.getUniformLocation(oceanProgram, "u_star_field");
    oceanDayPhoto = gl.getUniformLocation(oceanProgram, "u_day_photo");
    oceanDayPhotoReady = gl.getUniformLocation(oceanProgram, "u_day_photo_ready");
    oceanMountainPhoto = gl.getUniformLocation(oceanProgram, "u_mountain_photo");
    oceanMountainPhotoReady = gl.getUniformLocation(oceanProgram, "u_mountain_photo_ready");
    oceanShip = gl.getUniformLocation(oceanProgram, "u_ship");
    oceanShipReady = gl.getUniformLocation(oceanProgram, "u_ship_ready");
    oceanRipples = gl.getUniformLocation(oceanProgram, "u_ripples");
    oceanRippleCount = gl.getUniformLocation(oceanProgram, "u_rippleCount");
    oceanSunProgress = gl.getUniformLocation(oceanProgram, "u_sunProgress");
    oceanSunScreenY = gl.getUniformLocation(oceanProgram, "u_sunScreenY");
    oceanWaveDirections = gl.getUniformLocation(oceanProgram, "u_waveDirections");
    oceanNoise = gl.getUniformLocation(oceanProgram, "u_noise");
  }

  // The ocean's 16 wave directions are fixed constants; the shader used to
  // rebuild each with sin/cos/normalize on every wave sample.
  function waveDirectionValues() {
    var values = new Float32Array(32);
    var swellX = -0.25 / Math.hypot(-0.25, 1.0);
    var swellY = 1.0 / Math.hypot(-0.25, 1.0);
    var iteration = 0;
    for (var index = 0; index < 16; index++) {
      var x = Math.sin(iteration) * 0.82 + swellX * 0.18;
      var y = Math.cos(iteration) * 0.82 + swellY * 0.18;
      var length = Math.hypot(x, y);
      values[index * 2] = x / length;
      values[index * 2 + 1] = y / length;
      iteration += 1232.399963;
    }
    return values;
  }
  var waveDirections = waveDirectionValues();

  // J2000 right ascension, declination, visual magnitude and B-V color from
  // the Bright Star Catalogue, 5th Revised Edition (CDS V/50), limited to
  // magnitude 4.5. The catalog anchors recognizable constellations; a faint
  // projected galactic plane supplies structure between them.
  var starCatalog = new Float32Array([
    2.097, 29.091, 2.06, -0.11, 2.295, 59.150, 2.27, 0.34, 2.353, -45.748, 3.88, 1.03, 3.309, 15.184, 2.83, -0.23, 3.660, -18.933, 4.44, 1.66, 4.857, -8.824, 3.56, 1.22,
    5.018, -64.875, 4.23, 0.58, 6.438, -77.254, 2.80, 0.62, 6.571, -42.306, 2.39, 1.09, 6.551, -43.680, 3.94, 0.17, 7.886, -62.958, 4.37, -0.07, 8.250, 62.932, 4.16, 0.14,
    9.243, 53.897, 3.66, -0.20, 9.220, 33.719, 4.36, -0.14, 9.639, 29.312, 4.37, 0.87, 9.832, 30.861, 3.27, 1.28, 10.127, 56.537, 2.23, 1.17, 10.898, -17.987, 2.04, 1.02,
    10.838, -57.463, 4.36, 0.00, 11.835, 24.267, 4.06, 1.12, 12.275, 57.816, 3.44, 0.57, 12.171, 7.585, 4.43, 1.50, 14.177, 60.717, 2.47, -0.15, 14.188, 38.499, 3.87, 0.13,
    14.302, 23.418, 4.42, 0.94, 14.652, -29.358, 4.31, -0.16, 17.186, 86.257, 4.25, 1.21, 15.736, 7.890, 4.28, 0.96, 16.521, -46.719, 3.31, 0.89, 17.148, -10.182, 3.45, 1.16,
    17.376, 47.242, 4.25, -0.07, 17.433, 35.621, 2.06, 1.58, 17.096, -55.246, 3.92, -0.08, 17.776, 55.150, 4.33, 0.17, 21.006, -8.183, 3.60, 1.06, 21.454, 60.235, 2.68, 0.13,
    37.953, 89.264, 2.02, 0.60, 22.091, -43.318, 3.41, 1.57, 22.871, 15.346, 3.62, 0.97, 22.813, -49.073, 3.95, 0.99, 24.199, 41.406, 4.09, 0.54, 24.498, 48.628, 3.57, 1.28,
    24.429, -57.237, 0.46, -0.16, 25.358, 5.487, 4.44, 1.36, 25.915, 50.689, 4.07, -0.04, 26.017, -15.938, 3.50, 0.72, 26.348, 9.158, 4.26, 0.96, 27.865, -10.335, 3.73, 1.14,
    28.599, 63.670, 3.38, -0.15, 28.270, 29.579, 3.41, 0.49, 28.660, 20.808, 2.64, 0.13, 28.412, -46.302, 4.41, 1.59, 28.990, -51.609, 3.70, 0.85, 30.859, 72.421, 3.98, -0.01,
    30.001, -21.078, 4.00, 1.57, 29.692, -61.570, 2.86, 0.28, 30.512, 2.764, 4.33, 0.03, 30.975, 42.330, 2.26, 1.37, 31.793, 23.462, 2.00, 1.15, 32.386, 34.987, 3.00, 0.14,
    33.250, 8.847, 4.37, 0.89, 34.329, 33.847, 4.01, 0.02, 34.128, -51.512, 3.56, -0.12, 34.836, -2.978, 3.04, 1.42, 35.437, -68.659, 4.09, 0.03, 37.040, 8.460, 4.28, -0.06,
    36.746, -47.704, 4.25, -0.14, 39.871, 0.329, 4.07, -0.22, 40.167, -39.856, 4.11, 1.02, 41.050, 49.228, 4.12, 0.49, 40.825, 3.236, 3.47, 0.09, 39.898, -68.267, 4.11, -0.06,
    41.031, -13.859, 4.25, -0.14, 41.235, 10.114, 4.27, 0.31, 41.276, -18.572, 4.47, 0.48, 42.674, 55.896, 3.76, 1.68, 42.496, 27.261, 3.63, -0.10, 42.646, 38.319, 4.23, 0.34,
    42.272, -32.406, 4.46, 0.99, 43.565, 52.763, 3.95, 0.74, 43.470, -49.890, 4.00, 2.11, 44.107, -8.898, 3.89, 1.11, 44.565, -40.305, 3.24, 0.14, 44.568, -40.304, 4.35, 0.08,
    45.570, 4.090, 2.53, 1.64, 46.199, 53.506, 2.93, 0.70, 45.598, -23.624, 4.09, 0.16, 46.294, 38.840, 3.39, 1.65, 47.042, 40.956, 2.12, -0.05, 47.267, 49.613, 4.05, 0.59,
    47.374, 44.857, 3.80, 0.98, 47.907, 19.727, 4.35, 1.03, 48.018, -28.987, 3.87, 0.52, 50.085, 29.048, 4.47, 1.55, 49.879, -21.758, 3.69, 1.62, 49.982, -43.070, 4.27, 0.71,
    51.081, 49.861, 1.79, 0.48, 51.203, 9.029, 3.60, 0.89, 52.267, 59.940, 4.21, 0.41, 51.793, 9.733, 3.74, -0.09, 52.644, 47.995, 4.36, 1.35, 52.718, 12.937, 4.11, 1.12,
    53.232, -9.458, 3.73, 0.88, 54.123, 48.193, 4.23, -0.06, 53.447, -21.633, 4.27, -0.11, 54.218, 0.402, 4.28, 0.58, 55.731, 47.788, 3.01, -0.13, 56.080, 32.288, 3.83, 0.05,
    56.298, 42.579, 3.77, 0.42, 55.812, -9.763, 3.54, 0.92, 56.219, 24.113, 3.70, -0.11, 56.302, 24.467, 4.30, -0.11, 56.457, 24.368, 3.87, -0.07, 57.380, 65.526, 4.47, 1.88,
    56.582, 23.948, 4.18, -0.06, 56.535, -12.102, 4.42, 1.63, 56.871, 24.105, 2.87, -0.09, 56.712, -23.250, 4.23, 0.42, 56.050, -64.807, 3.85, 1.13, 57.290, 24.053, 3.63, -0.09,
    57.364, -36.200, 4.17, 0.95, 58.533, 31.884, 2.85, 0.12, 56.810, -74.239, 3.24, 1.62, 59.463, 40.010, 2.89, -0.18, 59.741, 35.791, 4.04, 0.01, 59.508, -13.509, 2.95, 1.59,
    60.170, 12.490, 3.47, -0.12, 60.789, 5.989, 3.91, 0.03, 61.174, 22.082, 4.36, 1.07, 61.646, 50.351, 4.29, 0.02, 62.165, 47.713, 4.04, -0.03, 62.966, -6.837, 4.04, 0.33,
    63.725, 48.409, 4.14, 0.95, 63.884, 8.892, 4.29, -0.06, 63.818, -7.653, 4.43, 0.82, 63.500, -42.294, 3.86, 1.10, 63.606, -62.474, 3.35, 0.91, 64.007, -51.487, 4.25, 0.30,
    64.948, 15.628, 3.65, 0.99, 64.474, -33.798, 3.56, -0.12, 64.120, -59.302, 4.44, 1.08, 65.734, 17.543, 3.76, 0.98, 66.342, 22.294, 4.22, 0.13, 66.373, 17.928, 4.29, 0.05,
    66.577, 22.814, 4.28, 0.26, 66.009, -34.017, 3.96, 1.49, 66.587, 15.618, 4.49, 0.25, 67.154, 19.180, 3.53, 1.01, 67.144, 15.962, 3.84, 0.95, 67.165, 15.871, 3.40, 0.18,
    69.172, 41.265, 4.25, 1.22, 68.980, 16.509, 0.85, 1.54, 68.914, 10.161, 4.25, 0.18, 69.080, -3.353, 3.93, -0.21, 68.887, -30.562, 3.82, 0.98, 68.499, -55.045, 3.27, -0.10,
    69.540, 12.511, 4.27, 0.12, 69.545, -14.304, 3.87, 1.09, 70.110, -19.672, 4.32, 1.61, 70.561, 22.957, 4.28, -0.13, 70.140, -41.864, 4.45, 0.34, 71.375, -3.255, 4.02, -0.15,
    73.513, 66.343, 4.29, 0.03, 72.460, 6.961, 3.19, 0.45, 72.653, 8.900, 4.36, 0.01, 72.802, 5.605, 3.69, -0.17, 73.224, -5.453, 4.39, 0.25, 73.563, 2.441, 3.72, -0.18,
    74.322, 53.752, 4.47, -0.02, 74.248, 33.166, 2.69, 1.53, 74.093, 13.514, 4.07, 1.15, 74.637, 1.714, 4.47, 1.40, 75.855, 60.442, 4.03, 0.92, 75.492, 43.823, 2.99, 0.54,
    75.620, 41.076, 3.75, 1.22, 76.629, 41.234, 3.17, -0.18, 76.365, -22.371, 3.19, 1.46, 76.963, -5.086, 2.79, 0.13, 77.287, -8.754, 4.27, -0.19, 78.075, -11.869, 4.45, -0.10,
    78.323, 2.861, 4.46, 1.19, 78.233, -16.206, 3.31, -0.11, 78.308, -12.941, 4.36, -0.10, 79.172, 45.998, 0.08, 0.80, 78.635, -8.202, 0.12, -0.03, 79.402, -6.844, 3.60, -0.11,
    79.894, -13.177, 4.29, -0.26, 80.987, -7.808, 4.14, 0.96, 81.119, -2.397, 3.36, -0.17, 81.283, 6.350, 1.64, -0.22, 81.573, 28.608, 1.65, -0.13, 82.061, -20.759, 2.84, 0.82,
    82.696, 5.948, 4.20, -0.14, 83.053, 18.594, 4.38, 2.07, 83.002, -0.299, 2.23, -0.22, 82.803, -35.471, 3.87, 1.14, 83.182, -17.822, 2.58, 0.21, 83.705, 9.489, 4.41, -0.16,
    83.785, 9.934, 3.54, -0.18, 83.858, -5.910, 2.77, -0.24, 84.053, -1.202, 1.70, -0.19, 84.226, 9.291, 4.09, 0.95, 84.411, 21.142, 3.00, -0.19, 83.406, -62.490, 3.76, 0.82,
    84.687, -2.600, 3.81, -0.24, 85.190, -1.943, 2.05, -0.21, 85.190, -1.943, 4.21, 0.40, 84.912, -34.074, 2.64, -0.12, 86.116, -22.448, 3.60, 0.47, 86.739, -14.822, 3.55, 0.10,
    86.939, -9.670, 2.06, -0.17, 87.873, 39.149, 3.97, 1.13, 86.193, -65.736, 4.35, 0.21, 86.821, -51.066, 3.85, 0.17, 87.830, -20.879, 3.81, 0.99, 87.740, -35.768, 3.12, 1.16,
    88.595, 20.276, 4.41, 0.59, 88.793, 7.407, 0.50, 1.85, 89.882, 54.285, 3.72, 1.00, 89.101, -14.168, 3.71, 0.33, 89.882, 44.947, 1.90, 0.03, 89.984, 45.937, 4.26, 1.72,
    89.930, 37.213, 2.62, -0.08, 89.384, -35.283, 4.36, -0.18, 89.787, -42.815, 3.96, 1.14, 90.596, 9.647, 4.12, 0.16, 91.030, 23.263, 4.16, 0.82, 91.893, 14.768, 4.42, -0.17,
    92.985, 14.209, 4.48, -0.18, 93.719, 22.507, 3.28, 1.60, 93.845, 29.498, 4.35, 1.02, 93.714, -6.275, 3.98, 1.32, 94.906, 59.011, 4.48, 0.01, 94.138, -35.141, 4.37, 1.00,
    95.078, -30.063, 3.02, -0.19, 95.740, 22.514, 2.88, 1.64, 95.675, -17.956, 1.98, -0.23, 95.528, -33.436, 3.85, 0.88, 95.942, 4.593, 4.44, 0.18, 95.988, -52.696, -0.72, 0.15,
    97.241, 20.212, 4.15, -0.13, 97.042, -32.580, 4.48, -0.17, 98.226, 7.333, 4.50, 0.00, 97.964, -23.418, 4.33, -0.24, 99.428, 16.399, 1.93, 0.00, 99.171, -19.256, 3.95, 1.06,
    98.744, -52.976, 4.39, -0.02, 99.473, -18.238, 4.43, 1.15, 99.440, -43.196, 3.17, -0.11, 100.983, 25.131, 2.98, 1.40, 100.997, 13.228, 4.49, 1.16, 101.322, 12.896, 3.36, 0.43,
    101.287, -16.716, -1.46, 0.00, 101.965, 2.412, 4.47, 1.11, 102.460, -32.509, 3.96, -0.23, 103.197, 33.961, 3.60, 0.10, 102.047, -61.941, 3.27, 0.21, 102.484, -50.615, 2.93, 1.20,
    102.464, -53.622, 4.40, 0.92, 104.319, 58.422, 4.35, 0.85, 103.548, -12.039, 4.07, 1.43, 103.533, -24.184, 3.87, 1.73, 104.034, -17.054, 4.37, -0.07, 104.656, -28.972, 1.50, -0.21,
    105.430, -27.935, 3.47, 1.73, 106.027, 20.570, 3.79, 0.79, 105.756, -23.833, 3.02, -0.08, 105.940, -15.633, 4.12, -0.12, 107.098, -26.393, 1.84, 0.68, 107.785, 30.245, 4.41, 1.26,
    107.966, -0.493, 4.15, -0.01, 107.187, -70.499, 3.78, 1.04, 108.140, -46.759, 4.49, 0.32, 108.703, -26.773, 3.85, -0.17, 109.523, 16.540, 3.58, 0.11, 109.286, -37.098, 2.70, 1.62,
    110.031, 21.982, 3.53, 0.34, 109.677, -24.954, 4.40, -0.15, 109.207, -67.957, 3.98, 0.79, 111.432, 27.798, 3.79, 1.03, 111.024, -29.303, 2.45, -0.08, 111.788, 8.289, 2.90, -0.09,
    112.278, 31.784, 4.18, 0.32, 112.041, 8.926, 4.32, 1.43, 112.308, -43.301, 3.25, 1.51, 113.650, 31.889, 2.88, 0.04, 113.650, 31.888, 1.98, 0.03, 113.980, 26.896, 4.06, 1.54,
    113.513, -22.296, 4.45, 0.51, 114.825, 5.225, 0.38, 0.42, 114.705, -26.802, 4.50, -0.17, 115.312, -9.551, 3.93, 1.02, 115.828, 28.884, 4.28, 1.12, 116.112, 24.398, 3.57, 0.93,
    116.329, 28.026, 1.14, 1.00, 115.952, -28.955, 3.96, 0.18, 116.314, -37.969, 3.61, 1.73, 115.455, -72.606, 3.95, 1.04, 117.022, -25.937, 4.50, -0.05, 117.324, -24.860, 3.34, 1.24,
    117.310, -46.373, 4.11, -0.18, 118.054, -40.576, 3.73, 1.04, 118.161, -38.863, 4.49, -0.19, 118.326, -48.103, 4.24, -0.14, 119.215, -22.880, 4.20, 0.72, 119.195, -52.982, 3.47, -0.18,
    119.560, -49.245, 4.41, -0.17, 120.566, 2.334, 4.39, 1.25, 120.896, -40.003, 2.25, -0.26, 121.886, -24.304, 2.81, 0.43, 122.148, -2.984, 4.34, 0.97, 122.257, -19.245, 4.40, -0.15,
    122.372, -47.346, 4.27, -0.23, 122.383, -47.337, 1.78, -0.22, 121.983, -68.617, 4.35, -0.11, 122.840, -39.619, 4.45, 1.62, 123.512, -40.348, 4.44, 1.17, 124.129, 9.186, 3.52, 1.48,
    124.639, -36.659, 4.45, 0.22, 125.709, 43.188, 4.25, 1.55, 125.628, -59.510, 1.86, 1.28, 126.415, -3.906, 3.90, -0.02, 124.632, -76.920, 4.07, 0.39, 127.566, 60.718, 3.36, 0.84,
    125.160, -77.484, 4.35, 1.16, 126.434, -66.137, 3.77, 1.13, 129.414, 5.704, 4.16, 0.00, 129.689, 3.341, 4.44, 1.21, 129.411, -42.989, 4.14, 0.11, 130.026, -35.308, 3.97, 0.94,
    130.157, -46.649, 3.84, 0.71, 130.073, -52.922, 3.62, -0.18, 130.806, 3.399, 4.30, -0.20, 130.154, -59.761, 4.33, -0.11, 131.171, 18.154, 3.94, 1.08, 130.898, -33.186, 3.68, -0.18,
    131.674, 28.760, 4.02, 1.01, 131.100, -42.649, 4.07, 0.87, 131.694, 6.419, 3.38, 0.68, 131.594, -13.548, 4.32, 0.90, 131.176, -54.708, 1.96, 0.04, 131.507, -46.042, 3.91, 0.00,
    132.108, 5.838, 4.36, -0.04, 131.677, -56.770, 4.49, -0.17, 132.633, -27.710, 4.01, 1.27, 133.848, 5.946, 3.11, 1.00, 134.802, 48.042, 3.14, 0.19, 133.762, -60.645, 3.84, -0.10,
    134.622, 11.858, 4.25, 0.14, 135.160, 41.783, 3.97, 0.44, 135.023, -41.254, 4.45, 0.65, 135.906, 47.157, 3.60, 0.00, 136.039, -47.098, 3.75, 1.20, 135.612, -66.396, 4.00, 0.14,
    137.218, 51.605, 4.48, 0.27, 136.999, -43.432, 2.21, 1.66, 136.287, -72.603, 4.48, 0.61, 137.742, -58.967, 3.44, -0.19, 137.819, -62.317, 3.97, -0.18, 138.591, 2.314, 3.88, -0.06,
    138.300, -69.717, 1.68, 0.00, 139.711, 36.802, 3.82, 0.06, 139.051, -57.541, 4.34, 1.63, 139.273, -59.275, 2.25, 0.18, 140.264, 34.392, 3.13, 1.55, 141.164, 26.182, 4.46, 1.23,
    140.528, -55.011, 2.50, -0.18, 141.897, -8.659, 1.98, 1.44, 144.272, 81.326, 4.29, 1.48, 142.882, 63.062, 3.67, 0.33, 142.930, 22.968, 4.31, 1.54, 143.214, 51.677, 3.17, 0.46,
    142.675, -40.467, 3.60, 0.36, 143.706, 52.051, 4.50, 0.01, 142.805, -57.034, 3.13, 1.55, 143.611, -59.229, 4.08, 0.01, 144.207, -49.355, 4.35, 0.17, 144.964, -1.143, 3.91, 1.32,
    145.287, 9.892, 3.52, 0.49, 146.463, 23.774, 2.98, 0.80, 146.312, -62.508, 3.69, 1.22, 147.748, 59.039, 3.80, 0.29, 146.775, -65.072, 3.01, 0.28, 147.870, -14.847, 4.12, 0.92,
    148.191, 26.007, 3.88, 1.22, 149.216, -54.568, 3.54, -0.08, 151.858, 35.245, 4.48, 0.18, 151.833, 16.763, 3.52, -0.03, 151.976, 9.997, 4.37, 1.45, 151.985, -0.372, 4.49, -0.04,
    152.093, 11.967, 1.35, -0.11, 152.647, -12.354, 3.61, 1.01, 153.684, -42.122, 3.85, 0.05, 154.173, 23.417, 3.44, 0.31, 154.274, 42.914, 3.45, 0.03, 153.434, -70.038, 3.32, -0.08,
    154.271, -61.332, 3.40, 1.54, 154.993, 19.842, 2.61, 1.15, 154.994, 19.841, 3.80, 0.40, 155.582, 41.499, 3.05, 1.59, 155.228, -56.043, 4.50, -0.12, 156.523, -16.836, 3.81, 1.48,
    156.971, 36.707, 4.21, 0.90, 156.099, -74.032, 4.00, 0.35, 156.788, -31.068, 4.25, 1.45, 156.970, -58.739, 3.82, 0.31, 158.203, 9.307, 3.85, -0.14, 158.006, -61.685, 3.32, -0.09,
    158.897, -57.558, 4.45, 1.62, 159.325, -48.226, 3.84, 0.30, 158.867, -78.608, 4.11, 1.58, 159.827, -55.603, 4.28, 1.04, 160.739, -64.394, 2.76, -0.22, 161.692, -49.420, 2.69, 0.90,
    162.406, -16.194, 3.11, 1.25, 161.445, -80.540, 4.45, -0.19, 163.328, 34.215, 3.83, 1.04, 163.373, -58.853, 3.78, 0.95, 163.903, 24.750, 4.50, 0.01, 164.944, -18.299, 4.08, 1.09,
    165.039, -42.226, 4.39, 0.11, 165.460, 56.383, 2.37, -0.02, 165.582, 20.180, 4.42, 0.05, 165.932, 61.751, 1.79, 1.07, 167.416, 44.499, 3.01, 1.14, 167.147, -58.975, 3.91, 1.23,
    167.915, -22.826, 4.48, 0.03, 168.527, 20.524, 2.56, 0.12, 168.560, 15.429, 3.34, -0.01, 169.165, -3.652, 4.47, 0.21, 169.546, 31.529, 4.41, 0.59, 169.620, 33.094, 3.48, 1.40,
    169.835, -14.779, 3.56, 1.12, 170.284, 6.029, 4.05, -0.06, 170.252, -54.491, 3.89, -0.15, 170.981, 10.529, 3.94, 0.41, 171.220, -17.684, 4.08, 0.21, 172.851, 69.331, 3.84, 1.62,
    173.250, -31.858, 3.54, 0.94, 173.945, -63.020, 3.13, -0.04, 174.237, -0.824, 4.30, 1.00, 176.465, 6.529, 4.03, 1.51, 176.512, 47.779, 3.71, 1.18, 176.402, -66.729, 3.64, 0.16,
    176.628, -61.178, 4.11, 0.90, 177.265, 14.572, 2.14, 0.09, 177.421, -63.788, 4.32, -0.15, 177.674, 1.765, 3.61, 0.55, 177.786, -45.174, 4.46, 1.30, 178.228, -33.908, 4.28, -0.10,
    178.457, 53.695, 2.44, 0.00, 180.756, -63.313, 4.33, 0.27, 181.302, 8.733, 4.12, 0.98, 181.720, -64.614, 4.15, 0.34, 182.022, -50.661, 4.47, -0.15, 182.090, -50.723, 2.60, -0.12,
    182.103, -24.729, 4.02, 0.32, 182.531, -22.620, 3.00, 1.33, 182.913, -52.369, 3.96, -0.15, 183.786, -58.749, 2.80, -0.23, 183.857, 57.032, 3.31, 0.08, 183.952, -17.542, 2.59, -0.11,
    184.392, -67.961, 4.11, 1.58, 184.586, -79.312, 4.26, -0.12, 184.609, -64.003, 4.04, -0.17, 184.977, -0.667, 3.89, 0.02, 185.340, -60.401, 3.59, 1.42, 186.650, -63.099, 1.33, -0.24,
    186.652, -63.099, 1.73, -0.26, 186.735, 28.268, 4.36, 1.13, 187.010, -50.231, 3.91, -0.19, 187.466, -16.516, 2.95, -0.05, 187.791, -57.113, 1.63, 1.59, 188.117, -72.133, 3.87, -0.15,
    188.017, -16.196, 4.31, 0.38, 188.435, 41.358, 4.26, 0.59, 188.597, -23.397, 2.65, 0.89, 188.371, 69.788, 3.87, -0.13, 189.296, -69.136, 2.69, -0.20, 189.426, -48.541, 3.86, 0.05,
    190.379, -48.960, 2.17, -0.01, 190.415, -1.449, 3.65, 0.36, 190.415, -1.449, 3.68, 0.40, 191.570, -68.108, 3.05, -0.18, 191.930, -59.689, 1.25, -0.23, 193.279, -48.943, 4.33, 1.37,
    193.359, -40.179, 4.27, 0.21, 193.648, -57.178, 4.03, -0.17, 193.507, 55.960, 1.77, -0.02, 193.901, 3.397, 3.38, 1.58, 194.007, 38.318, 2.90, -0.12, 195.567, -71.549, 3.62, 1.18,
    195.544, 10.959, 2.83, 0.94, 196.728, -49.906, 4.27, -0.19, 197.488, -5.539, 4.38, -0.01, 197.968, 27.878, 4.26, 0.57, 199.730, -23.172, 3.00, 0.92, 200.149, -36.712, 2.75, 0.04,
    200.981, 54.925, 2.27, 0.02, 200.985, 54.922, 3.95, 0.13, 201.298, -11.161, 0.98, -0.23, 201.306, 54.988, 4.01, 0.16, 202.761, -39.407, 3.88, 1.17, 203.673, -0.596, 3.37, 0.11,
    204.972, -53.466, 2.30, -0.22, 206.422, -33.044, 4.23, 0.38, 206.815, 17.457, 4.50, 0.48, 207.376, -41.688, 3.41, -0.22, 206.885, 49.313, 1.86, -0.19, 207.361, -34.451, 4.19, 1.50,
    207.404, -42.474, 3.04, -0.17, 207.369, 15.798, 4.07, 1.52, 208.885, -47.288, 2.55, -0.22, 208.671, 18.398, 2.68, 0.58, 209.568, -42.101, 3.83, -0.21, 209.670, -44.804, 3.87, -0.20,
    210.431, -45.604, 4.34, 0.60, 210.412, 1.544, 4.26, 0.10, 210.956, -60.373, 0.61, -0.23, 211.512, -41.180, 4.36, -0.19, 211.593, -26.683, 3.27, 1.12, 211.671, -36.370, 2.06, 1.01,
    211.097, 64.376, 3.65, -0.05, 213.224, -10.274, 4.19, 1.33, 214.004, -6.001, 4.08, 0.52, 216.729, -83.668, 4.32, 1.31, 213.915, 19.183, -0.04, 1.23, 214.096, 46.088, 4.18, 0.08,
    214.851, -46.058, 3.55, -0.18, 215.081, -56.387, 4.33, 0.12, 215.139, -37.885, 4.05, -0.03, 215.759, -39.512, 4.42, -0.18, 216.545, -45.379, 4.35, 0.43, 216.299, 51.851, 4.05, 0.50,
    218.154, -50.457, 4.42, -0.19, 217.958, 30.371, 3.58, 1.30, 216.881, 75.696, 4.25, 1.44, 218.020, 38.308, 3.03, 0.19, 218.877, -42.158, 2.31, -0.19, 218.670, 29.745, 4.46, 0.36,
    219.472, -49.426, 4.05, -0.15, 219.900, -60.835, -0.01, 0.71, 219.900, -60.836, 1.33, 0.88, 220.627, -64.975, 3.19, 0.24, 220.482, -47.388, 2.30, -0.20, 221.965, -79.045, 3.83, 1.43,
    220.490, -37.794, 4.00, -0.17, 220.287, 13.728, 4.43, 0.05, 220.914, -35.174, 4.05, 1.35, 220.765, -5.658, 3.88, 0.38, 221.247, 27.074, 2.70, 0.97, 221.562, 1.893, 3.72, -0.01,
    222.572, -27.960, 4.41, 1.40, 222.910, -43.576, 4.32, -0.15, 222.720, -16.042, 2.75, 0.15, 222.676, 74.156, 2.08, 1.47, 224.296, -4.346, 4.49, 0.32, 224.633, -43.134, 2.68, -0.22,
    224.790, -42.104, 3.13, -0.20, 225.725, 2.091, 4.40, 1.04, 225.487, 40.391, 3.50, 0.97, 226.017, -25.282, 3.29, 1.70, 227.211, -45.280, 4.05, -0.18, 227.984, -48.738, 3.87, -0.05,
    228.071, -52.099, 3.41, 0.92, 229.378, -58.801, 4.07, 0.09, 229.728, -68.679, 2.89, 0.00, 228.876, 33.315, 3.47, 0.95, 229.633, -47.875, 4.27, -0.08, 229.252, -9.383, 2.61, -0.11,
    229.458, -30.149, 4.34, 1.10, 230.343, -40.648, 3.22, -0.22, 230.452, -36.261, 3.56, 1.54, 230.670, -44.689, 3.37, -0.18, 231.123, 37.377, 4.31, 0.31, 230.182, 71.834, 3.05, 0.05,
    231.232, 58.966, 3.29, 1.16, 231.957, 29.106, 3.68, 0.28, 234.180, -66.317, 4.11, 1.17, 233.785, -41.167, 2.78, -0.20, 233.232, 31.359, 4.14, -0.13, 233.882, -14.789, 3.91, 1.01,
    233.700, 10.537, 3.80, 0.26, 233.700, 10.539, 3.80, 0.26, 233.672, 26.715, 2.23, -0.02, 234.256, -28.135, 3.58, 1.38, 234.513, -42.568, 4.33, 1.42, 234.664, -29.778, 3.66, -0.17,
    235.686, 26.296, 3.84, 0.00, 236.067, 6.426, 2.65, 1.17, 236.547, 15.422, 3.67, 0.06, 236.611, 7.353, 4.43, 0.60, 237.185, 18.142, 4.09, 1.62, 237.405, -3.430, 3.53, -0.04,
    237.740, -33.627, 3.95, -0.04, 237.704, 4.478, 3.71, 0.15, 238.785, -63.431, 2.85, 0.29, 236.015, 77.794, 4.32, 0.04, 238.456, -16.729, 4.15, 1.02, 239.221, -29.214, 3.88, -0.20,
    239.113, 15.662, 3.85, 0.48, 239.713, -26.114, 2.89, -0.19, 239.397, 26.878, 4.15, 1.23, 240.030, -38.397, 3.41, -0.22, 240.083, -22.622, 2.32, -0.12, 239.876, 25.920, 2.00, 0.10,
    241.359, -19.806, 2.62, -0.07, 240.472, 58.565, 4.01, 0.52, 241.648, -36.802, 4.23, -0.17, 241.702, -20.669, 3.96, -0.04, 241.851, -20.869, 4.32, 0.84, 242.192, 44.935, 4.26, -0.07,
    242.999, -19.461, 4.01, 0.04, 243.860, -63.686, 3.85, 1.11, 243.586, -3.694, 2.74, 1.58, 244.960, -50.156, 4.02, 1.08, 244.580, -4.692, 3.24, 0.96, 245.297, -25.593, 2.89, 0.13,
    244.935, 46.313, 3.89, -0.15, 245.480, 19.153, 3.75, 0.27, 248.363, -78.897, 3.89, 0.91, 246.026, -20.038, 4.50, 1.01, 246.796, -47.555, 4.47, -0.07, 246.756, -18.456, 4.42, 0.28,
    245.998, 61.514, 2.74, 0.91, 247.352, -26.432, 0.96, 1.83, 247.845, -34.704, 4.23, -0.16, 247.785, -16.613, 4.28, 0.92, 247.555, 21.490, 2.77, 0.94, 247.728, 1.984, 3.82, 0.01,
    248.034, -21.466, 4.45, 0.13, 250.769, -77.517, 4.24, 1.06, 248.971, -28.216, 2.82, -0.25, 249.094, -35.256, 4.16, 1.57, 248.526, 42.437, 4.20, -0.01, 249.290, -10.567, 2.56, 0.02,
    250.322, 31.603, 2.81, 0.65, 252.166, -69.028, 1.92, 1.44, 250.724, 38.922, 3.53, 0.92, 252.446, -59.041, 3.76, 1.57, 252.541, -34.293, 2.29, 1.15, 252.968, -38.047, 3.08, -0.20,
    253.084, -38.017, 3.57, -0.21, 253.646, -42.361, 3.62, 1.37, 253.502, 10.165, 4.38, -0.08, 254.655, -55.990, 3.13, 1.60, 254.896, -53.161, 4.06, 1.45, 254.417, 9.375, 3.20, 1.15,
    251.492, 82.037, 4.23, 0.89, 255.073, 30.926, 3.92, -0.01, 257.595, -15.725, 2.43, 0.06, 258.038, -43.239, 3.33, 0.41, 257.197, 65.715, 3.17, -0.12, 258.662, 14.390, 3.48, 1.44,
    258.758, 24.839, 3.14, 0.08, 258.762, 36.809, 3.16, 1.44, 260.251, -21.113, 4.39, 0.39, 260.207, -12.847, 4.33, 0.03, 260.502, -24.999, 3.27, -0.22, 261.325, -55.530, 2.85, 1.46,
    261.348, -56.377, 3.34, -0.13, 261.592, -24.175, 4.17, 0.28, 261.839, -29.867, 4.29, 0.40, 261.629, 4.140, 4.34, 1.50, 262.775, -60.684, 3.62, -0.10, 262.691, -37.296, 2.69, -0.22,
    262.960, -49.876, 2.95, -0.17, 262.685, 26.111, 4.41, 1.44, 263.402, -37.104, 1.63, -0.22, 262.608, 52.301, 2.79, 0.98, 264.137, -38.635, 4.29, 1.09, 264.330, -42.998, 1.87, 0.40,
    263.734, 12.560, 2.08, 0.15, 264.397, -15.399, 3.54, 0.26, 265.622, -39.030, 2.41, -0.22, 265.354, -12.875, 4.26, 0.08, 266.433, -64.724, 3.62, 1.19, 264.866, 46.006, 3.80, -0.18,
    265.868, 4.567, 2.77, 1.16, 266.896, -40.127, 3.03, 0.51, 266.615, 27.721, 3.42, 0.75, 266.973, 2.707, 3.75, 0.04, 267.465, -37.043, 3.21, 1.17, 268.382, 56.873, 3.75, 1.18,
    269.063, 37.251, 3.86, 1.35, 269.757, -9.774, 3.34, 0.99, 269.441, 29.248, 3.70, 0.94, 269.152, 51.489, 2.23, 1.52, 269.626, 30.189, 4.41, 0.39, 270.161, 2.932, 3.97, 0.02,
    270.438, 1.305, 4.45, 0.02, 271.658, -50.092, 3.66, -0.08, 272.145, -63.668, 4.35, 0.22, 271.452, -30.424, 2.99, 1.00, 271.364, 2.499, 4.03, 0.86, 271.837, 9.564, 3.73, 0.12,
    271.886, 28.762, 3.83, -0.03, 272.190, 20.814, 4.36, -0.16, 263.054, 86.586, 4.36, 0.02, 273.441, -21.059, 3.86, 0.23, 274.407, -36.762, 3.11, 1.56, 275.807, -61.494, 4.36, 1.48,
    275.249, -29.828, 2.70, 1.38, 275.328, -2.899, 3.26, 0.94, 274.965, 36.064, 4.33, 1.17, 276.043, -34.385, 1.85, -0.03, 275.925, 21.770, 3.84, 1.18, 276.743, -45.968, 3.51, -0.17,
    277.208, -49.071, 4.13, 1.02, 276.993, -25.422, 2.81, 1.04, 275.190, 71.338, 4.22, -0.10, 275.264, 72.733, 3.57, 0.49, 278.802, -8.244, 3.85, 1.33, 280.759, -71.428, 4.01, 1.14,
    279.235, 38.784, 0.03, 0.00, 281.414, -26.991, 3.17, -0.11, 281.193, 37.605, 4.36, 0.19, 281.415, 20.546, 4.19, 0.46, 281.794, -4.748, 4.22, 1.10, 281.755, 18.181, 4.36, 0.13,
    283.054, -62.188, 4.22, -0.14, 282.520, 33.363, 3.45, 0.00, 284.238, -67.234, 4.44, 0.71, 283.816, -26.297, 2.02, -0.22, 283.626, 36.899, 4.30, 1.68, 284.432, -21.107, 3.51, 1.18,
    283.834, 43.946, 4.04, 1.59, 284.906, 15.068, 4.02, 1.08, 284.736, 32.689, 3.24, -0.05, 285.420, -5.739, 4.02, 1.09, 285.653, -29.880, 2.60, 0.08, 286.171, -21.742, 3.77, 1.01,
    286.735, -27.671, 3.32, 1.19, 286.352, 13.863, 2.99, 0.01, 286.562, -4.883, 3.44, -0.09, 287.368, -37.904, 4.11, 0.04, 287.507, -39.341, 4.11, 1.20, 287.441, -21.024, 2.89, 0.35,
    288.440, 39.146, 4.39, -0.15, 288.139, 67.662, 3.07, 1.00, 289.092, 38.134, 4.36, 1.26, 289.276, 53.369, 3.77, 0.96, 290.660, -44.459, 4.01, -0.10, 290.418, -17.847, 3.93, 0.22,
    290.805, -44.800, 4.29, 0.34, 290.972, -40.616, 3.97, -0.10, 288.887, 73.356, 4.45, 1.25, 291.375, 3.115, 3.36, 0.32, 292.176, 24.665, 4.44, 1.50, 292.680, 27.960, 3.08, 1.13,
    292.426, 51.730, 3.79, 0.14, 293.522, 7.379, 4.45, 1.17, 294.180, -1.286, 4.36, -0.08, 294.110, 50.221, 4.48, 0.38, 295.024, 18.014, 4.37, 0.78, 295.262, 17.476, 4.37, 1.05,
    296.565, 10.613, 2.72, 1.52, 296.244, 45.131, 2.87, -0.03, 296.847, 18.534, 3.82, 1.41, 297.696, 8.868, 0.77, 0.22, 297.641, 32.914, 4.23, 1.82, 298.118, 1.006, 3.90, 0.89,
    298.815, -41.868, 4.13, 1.08, 297.043, 70.268, 3.83, 0.89, 300.148, -72.911, 3.96, -0.03, 298.828, 6.407, 3.71, 0.86, 299.077, 35.083, 3.89, 1.02, 299.934, -35.276, 4.37, -0.15,
    299.689, 19.492, 3.47, 1.57, 302.182, -66.182, 3.56, 0.76, 302.826, -0.821, 3.23, -0.07, 303.408, 46.741, 3.79, 1.28, 303.350, 56.568, 4.30, 0.11, 304.412, -12.508, 4.24, 1.07,
    302.222, 77.711, 4.39, -0.05, 303.868, 47.714, 3.98, 1.52, 304.514, -12.545, 3.57, 0.94, 305.253, -14.781, 3.08, 0.79, 306.412, -56.735, 1.94, -0.20, 305.557, 40.257, 2.20, 0.68,
    305.965, 32.190, 4.43, 1.33, 307.349, 30.369, 4.01, 0.40, 307.395, 62.994, 4.22, 0.20, 308.303, 11.303, 4.03, -0.13, 309.392, -47.291, 3.11, 1.00, 309.387, 14.595, 3.63, 0.44,
    309.585, -1.105, 4.32, 0.95, 309.910, 15.912, 3.77, -0.06, 311.240, -66.203, 3.42, 0.16, 310.358, 45.280, 1.25, 0.09, 310.865, 15.074, 4.43, 0.32, 311.524, -25.271, 4.14, 0.43,
    311.415, 30.720, 4.22, 1.05, 311.665, 16.124, 4.27, 1.04, 311.553, 33.970, 2.46, 1.03, 311.919, -9.496, 3.77, 0.00, 311.934, -5.028, 4.42, 1.65, 311.322, 61.839, 3.43, 0.92,
    312.955, -26.919, 4.11, 1.64, 313.702, -58.454, 3.65, 1.25, 314.293, 41.167, 3.94, 0.02, 316.487, -17.233, 4.07, -0.01, 316.233, 43.928, 3.72, 1.65, 316.782, -25.006, 4.50, 1.61,
    318.234, 30.227, 3.20, 0.99, 318.620, 10.007, 4.49, 0.50, 318.698, 38.046, 3.72, 0.39, 318.956, 5.248, 3.92, 0.53, 319.967, -53.450, 4.39, 0.19, 319.354, 39.395, 4.23, 0.12,
    319.480, 34.897, 4.43, -0.11, 319.645, 62.586, 2.44, 0.22, 320.562, -16.834, 4.28, 0.90, 320.522, 19.804, 4.08, 1.11, 321.611, -65.366, 4.22, 0.49, 321.667, -22.411, 3.74, 1.00,
    322.890, -5.571, 2.91, 0.83, 322.165, 70.561, 3.23, -0.22, 323.495, 45.592, 4.02, 0.89, 325.369, -77.390, 3.76, 1.00, 325.023, -16.662, 3.68, 0.32, 326.237, -33.026, 4.34, -0.05,
    326.047, 9.875, 2.39, 1.53, 326.128, 17.350, 4.34, 1.17, 326.161, 25.645, 4.13, 0.43, 325.877, 58.780, 4.08, 2.35, 326.760, -16.127, 2.87, 0.29, 326.362, 61.121, 4.29, 0.52,
    326.698, 49.309, 4.23, -0.12, 328.482, -37.365, 3.01, -0.12, 329.480, -54.992, 4.40, 0.28, 331.529, -39.543, 4.46, 1.37, 331.446, -0.320, 2.96, 0.98, 330.947, 64.628, 4.29, 0.34,
    331.609, -13.870, 4.27, -0.07, 332.058, -46.961, 1.74, -0.13, 331.753, 25.345, 3.76, 0.44, 332.096, -32.989, 4.50, 0.05, 332.550, 6.198, 3.53, 0.08, 332.497, 33.178, 4.29, 0.46,
    332.714, 58.201, 3.35, 1.57, 333.470, 39.715, 4.49, 1.39, 333.758, 57.044, 4.19, 0.28, 333.993, 37.749, 4.13, 1.46, 334.208, -7.783, 4.16, 0.98, 334.625, -60.260, 2.86, 1.39,
    335.414, -1.387, 3.84, -0.05, 335.890, 52.229, 4.43, 1.02, 336.833, -64.966, 4.48, -0.03, 337.317, -43.496, 3.97, 1.03, 337.209, -0.020, 4.42, 0.38, 337.440, -43.749, 4.11, 1.57,
    337.293, 58.415, 3.75, 0.60, 337.382, 47.707, 4.36, 1.68, 337.876, -32.346, 4.29, 0.01, 337.823, 50.282, 3.77, 0.01, 338.839, -0.118, 4.02, -0.09, 340.164, -27.044, 4.17, -0.11,
    341.514, -81.382, 4.15, 0.20, 340.129, 44.276, 4.46, 1.33, 340.365, 10.831, 3.40, -0.09, 340.667, -46.885, 2.10, 1.60, 340.750, 30.221, 2.94, 0.86, 341.673, 12.173, 4.19, 0.50,
    341.633, 23.566, 3.95, 1.07, 342.139, -51.317, 3.49, 0.08, 342.398, -13.593, 4.01, 1.57, 342.501, 24.602, 3.48, 0.93, 342.420, 66.201, 3.52, 1.05, 343.132, -32.876, 4.46, -0.04,
    343.154, -7.580, 3.74, 1.64, 343.662, -15.821, 3.27, 0.05, 343.987, -32.540, 4.21, 0.97, 344.413, -29.622, 1.16, 0.09, 345.220, -52.754, 4.12, 0.98, 345.480, 42.326, 3.62, -0.09,
    345.944, 28.083, 2.42, 1.67, 346.190, 15.205, 2.49, -0.04, 346.720, -43.521, 4.28, 0.42, 346.670, -23.743, 4.47, 0.90, 347.362, -21.172, 3.66, 1.22, 346.975, 75.388, 4.41, 0.80,
    347.590, -45.247, 3.90, 1.02, 348.581, -6.049, 4.22, 1.56, 348.973, -9.088, 4.21, 1.11, 349.358, -58.236, 3.99, 0.40, 349.291, 3.282, 3.69, 0.92, 349.476, -9.182, 4.39, -0.15,
    349.706, -32.532, 4.41, 1.13, 350.743, -20.101, 3.97, 1.10, 351.345, 23.404, 4.40, 0.61, 351.512, -20.642, 4.39, 1.47, 351.992, 6.379, 4.28, 1.07, 353.243, -37.818, 4.37, -0.09,
    354.391, 46.458, 3.82, 1.01, 354.534, 43.268, 4.29, -0.10, 354.987, 5.626, 4.13, 0.51, 354.837, 77.632, 3.21, 1.03, 355.102, 44.334, 4.14, -0.08, 355.512, 1.780, 4.50, 0.20,
    355.680, -14.545, 4.49, -0.04, 359.828, 6.863, 4.01, 0.42, 359.979, -65.577, 4.50, -0.08, 0.490, -6.014, 4.41, 1.63,
  ]);

  var starFieldTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, starFieldTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Must match the focal length used by dirToScreenUV in the shader.
  var PROJECTION_SCALE = 1.5;
  var starFieldKey = "";

  function podgoricaParts(date) {
    var values = {};
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Podgorica",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23"
      }).formatToParts(date).forEach(function (part) {
        if (part.type !== "literal") values[part.type] = Number(part.value);
      });
    } catch (_) {
      values = {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds()
      };
    }
    return values;
  }

  function hercegNoviNight() {
    var localToday = podgoricaParts(new Date());
    var desiredWallTime = Date.UTC(localToday.year, localToday.month - 1, localToday.day, 23, 0, 0);
    var guess = desiredWallTime;
    // Convert the desired wall-clock time without depending on the visitor's
    // own time zone. Two passes cover daylight-saving offset transitions.
    for (var pass = 0; pass < 2; pass++) {
      var localGuess = podgoricaParts(new Date(guess));
      var representedWallTime = Date.UTC(
        localGuess.year, localGuess.month - 1, localGuess.day,
        localGuess.hour, localGuess.minute, localGuess.second
      );
      guess += desiredWallTime - representedWallTime;
    }
    return new Date(guess);
  }

  function localSiderealTime(date) {
    var julianDate = date.getTime() / 86400000 + 2440587.5;
    var centuries = (julianDate - 2451545.0) / 36525.0;
    var greenwichDegrees = 280.46061837
      + 360.98564736629 * (julianDate - 2451545.0)
      + 0.000387933 * centuries * centuries
      - centuries * centuries * centuries / 38710000.0;
    var hercegNoviDegrees = (greenwichDegrees + 18.5375) % 360;
    if (hercegNoviDegrees < 0) hercegNoviDegrees += 360;
    return hercegNoviDegrees * Math.PI / 180;
  }

  function projectEquatorial(raDegrees, decDegrees, siderealTime, aspect) {
    var latitude = 42.45306 * Math.PI / 180;
    var cameraAzimuth = 105 * Math.PI / 180;
    var ra = raDegrees * Math.PI / 180;
    var dec = decDegrees * Math.PI / 180;
    var hourAngle = siderealTime - ra;
    var cosDec = Math.cos(dec);
    var east = -cosDec * Math.sin(hourAngle);
    var north = Math.sin(dec) * Math.cos(latitude)
      - cosDec * Math.cos(hourAngle) * Math.sin(latitude);
    var up = Math.sin(dec) * Math.sin(latitude)
      + cosDec * Math.cos(hourAngle) * Math.cos(latitude);
    var altitude = Math.asin(Math.max(-1, Math.min(1, up)));
    var azimuth = Math.atan2(east, north);
    var relativeAzimuth = azimuth - cameraAzimuth;
    while (relativeAzimuth > Math.PI) relativeAzimuth -= Math.PI * 2;
    while (relativeAzimuth < -Math.PI) relativeAzimuth += Math.PI * 2;
    var horizontal = Math.cos(altitude);
    var x = Math.sin(relativeAzimuth) * horizontal;
    var y = Math.sin(altitude);
    var z = Math.cos(relativeAzimuth) * horizontal;
    var unrotatedY = 0.9902160 * y - 0.1395431 * z;
    var unrotatedZ = 0.1395431 * y + 0.9902160 * z;
    if (unrotatedZ <= 0) return null;
    // PROJECTION_SCALE must equal the focal length in the shader's
    // dirToScreenUV, or the constellations sit at the wrong angular size
    // against the bay: 1.5 gives the camera's real 100 by 67 degree field.
    return {
      u: ((x / unrotatedZ) * PROJECTION_SCALE / aspect) * 0.5 + 0.5,
      v: ((unrotatedY / unrotatedZ) * PROJECTION_SCALE) * 0.5 + 0.5,
      altitude: altitude
    };
  }

  function galacticToEquatorial(longitudeDegrees, latitudeDegrees) {
    var longitude = longitudeDegrees * Math.PI / 180;
    var latitude = latitudeDegrees * Math.PI / 180;
    var cosLatitude = Math.cos(latitude);
    var gx = cosLatitude * Math.cos(longitude);
    var gy = cosLatitude * Math.sin(longitude);
    var gz = Math.sin(latitude);
    // Transpose of the standard J2000 equatorial-to-galactic rotation.
    var x = -0.0548755604 * gx + 0.4941094279 * gy - 0.8676661490 * gz;
    var y = -0.8734370902 * gx - 0.4448296300 * gy - 0.1980763734 * gz;
    var z = -0.4838350155 * gx + 0.7469822445 * gy + 0.4559837762 * gz;
    var ra = Math.atan2(y, x) * 180 / Math.PI;
    if (ra < 0) ra += 360;
    return { ra: ra, dec: Math.asin(z) * 180 / Math.PI };
  }

  // A sin hash keeps the faint background field identical on every rebuild:
  // a resize must not reshuffle the sky.
  function starHash(seed) {
    var value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  // The Bright Star Catalogue stops at magnitude 4.5, but a coastal sky shows
  // stars down to about 5.8. Nobody recognises an individual sixth-magnitude
  // star, so the filler is generated rather than tabulated. Only the density
  // has to be right, and density climbs steeply toward the galactic plane.
  var faintCatalog = null;
  function buildFaintCatalog() {
    if (faintCatalog) return faintCatalog;
    var values = [];
    for (var index = 0; index < 7000; index++) {
      var sinDeclination = starHash(index * 2.0 + 1.0) * 2 - 1;
      var rightAscension = starHash(index * 2.0 + 2.0) * Math.PI * 2;
      var keepRoll = starHash(index * 0.5 + 97.3);
      var declination = Math.asin(sinDeclination);
      var cosDeclination = Math.cos(declination);
      // Third column of the equatorial-to-galactic rotation: the sine of the
      // galactic latitude.
      var galacticZ = -0.8676661490 * cosDeclination * Math.cos(rightAscension)
        - 0.1980763734 * cosDeclination * Math.sin(rightAscension)
        + 0.4559837762 * sinDeclination;
      var galacticLatitude = Math.abs(Math.asin(Math.max(-1, Math.min(1, galacticZ)))) * 180 / Math.PI;
      if (keepRoll > 0.42 + 0.58 * Math.exp(-galacticLatitude / 15)) continue;
      // Counts rise about two and a half times per magnitude, so the faint
      // end has to carry most of the population.
      var magnitude = 4.5 + 1.4 * Math.pow(starHash(index * 3.7 + 41.9), 0.42);
      values.push(
        rightAscension * 180 / Math.PI,
        declination * 180 / Math.PI,
        magnitude,
        starHash(index * 5.3 + 12.7) * 1.7 - 0.2
      );
    }
    faintCatalog = new Float32Array(values);
    return faintCatalog;
  }

  function starColor(bv) {
    if (bv < 0.0) return [188, 210, 255];
    if (bv < 0.45) {
      var coolMix = bv / 0.45;
      return [Math.round(188 + 58 * coolMix), Math.round(210 + 36 * coolMix), 255];
    }
    if (bv < 1.05) {
      var warmMix = (bv - 0.45) / 0.60;
      return [255, Math.round(246 - 22 * warmMix), Math.round(250 - 54 * warmMix)];
    }
    var orangeMix = Math.min(1, (bv - 1.05) / 0.80);
    return [255, Math.round(224 - 30 * orangeMix), Math.round(196 - 60 * orangeMix)];
  }

  function rebuildStarField(renderWidth, renderHeight) {
    // One texel per rendered pixel. A fixed 1024 texture had to be magnified
    // across the canvas, and bilinear magnification is exactly what turns a
    // star into a small fuzzy disc.
    var width = Math.max(1, renderWidth);
    var height = Math.max(1, renderHeight);
    var sizeLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;
    // Both caps scale the two axes together: a texture whose aspect drifts
    // from the canvas would slide every star sideways.
    var fit = Math.min(
      1,
      width * height > 3600000 ? Math.sqrt(3600000 / (width * height)) : 1,
      sizeLimit / Math.max(width, height)
    );
    var textureWidth = Math.max(64, Math.round(width * fit));
    var textureHeight = Math.max(64, Math.round(height * fit));
    var key = textureWidth + "x" + textureHeight;
    if (key === starFieldKey) return;
    starFieldKey = key;
    var aspect = width / height;

    var starCanvas = document.createElement("canvas");
    starCanvas.width = textureWidth;
    starCanvas.height = textureHeight;
    var context = starCanvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, textureWidth, textureHeight);
    context.globalCompositeOperation = "lighter";

    var night = hercegNoviNight();
    var siderealTime = localSiderealTime(night);

    // Coastal light pollution leaves the Milky Way as a suggestion, not a
    // long-exposure stripe. Two offset rows of low-contrast cloud knots
    // follow its real projected arc and leave a natural central dust lane.
    context.globalCompositeOperation = "lighter";
    var galacticLatitudes = [-5.5, 5.5];
    for (var latitudeIndex = 0; latitudeIndex < galacticLatitudes.length; latitudeIndex++) {
      for (var galacticLongitude = 0; galacticLongitude < 360; galacticLongitude += 3.0) {
        var cloudEquatorial = galacticToEquatorial(galacticLongitude, galacticLatitudes[latitudeIndex]);
        var cloudPoint = projectEquatorial(cloudEquatorial.ra, cloudEquatorial.dec, siderealTime, aspect);
        if (!cloudPoint || cloudPoint.altitude < 0 || cloudPoint.u < -0.08 || cloudPoint.u > 1.08
          || cloudPoint.v < 0.36 || cloudPoint.v > 1.08) continue;
        var cloudX = cloudPoint.u * textureWidth;
        var cloudY = (1 - cloudPoint.v) * textureHeight;
        var cloudShape = 0.5 + 0.5 * Math.sin(
          galacticLongitude * 0.173 + Math.sin(galacticLongitude * 0.047) * 2.1 + latitudeIndex * 1.7
        );
        var cloudRadius = textureHeight * (0.030 + cloudShape * 0.034);
        var cloudAlpha = 0.012 + cloudShape * 0.028;
        var cloudGradient = context.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudRadius);
        cloudGradient.addColorStop(0, "rgba(126, 138, 166, " + cloudAlpha + ")");
        cloudGradient.addColorStop(0.48, "rgba(101, 116, 148, " + (cloudAlpha * 0.55) + ")");
        cloudGradient.addColorStop(1, "rgba(80, 96, 130, 0)");
        context.fillStyle = cloudGradient;
        context.fillRect(cloudX - cloudRadius, cloudY - cloudRadius, cloudRadius * 2, cloudRadius * 2);
      }
    }

    var pointScale = Math.max(1, Math.round(textureHeight / 900));
    var phaseWrites = [];
    context.globalCompositeOperation = "lighter";

    function drawStar(raDegrees, decDegrees, magnitude, bv, seed) {
      var point = projectEquatorial(raDegrees, decDegrees, siderealTime, aspect);
      if (!point || point.altitude <= 0) return;
      if (point.u < 0 || point.u > 1 || point.v < 0.39 || point.v > 1) return;
      var altitudeDegrees = point.altitude * 180 / Math.PI;
      var altitudeVisibility = Math.min(1, altitudeDegrees / 22);
      // Extinction and the town light dome eat the faint end near the ridge.
      var apparent = magnitude + Math.pow(1 - altitudeVisibility, 2) * 0.85;
      var magnitudeLimit = 4.85 + altitudeVisibility * 1.15;
      if (apparent > magnitudeLimit) return;
      // Peak brightness follows the flux, heavily compressed. A screen cannot
      // hold the real sixty-to-one range against a light-polluted sky, so the
      // hierarchy is carried by bloom and spikes as much as by peak value.
      var peak = Math.min(1, 0.10 + 0.90 * Math.pow(Math.pow(10, -0.4 * apparent), 0.30));
      peak *= Math.min(1, (magnitudeLimit - apparent) / 0.55);
      if (peak < 0.02) return;
      var color = starColor(bv);
      var colorText = color[0] + "," + color[1] + "," + color[2];
      var x = point.u * textureWidth;
      var y = (1 - point.v) * textureHeight;
      // Bloom, kept tight. A bright star glows; it does not become a disc.
      var haloRadius = (0.75 + peak * 2.8) * pointScale;
      var halo = context.createRadialGradient(x, y, 0, x, y, haloRadius);
      halo.addColorStop(0, "rgba(" + colorText + "," + (peak * 0.45) + ")");
      halo.addColorStop(0.3, "rgba(" + colorText + "," + (peak * 0.16) + ")");
      halo.addColorStop(0.6, "rgba(" + colorText + "," + (peak * 0.05) + ")");
      halo.addColorStop(1, "rgba(" + colorText + ",0)");
      context.fillStyle = halo;
      context.fillRect(x - haloRadius, y - haloRadius, haloRadius * 2, haloRadius * 2);
      var footprint = Math.ceil(haloRadius) + 2;

      if (peak > 0.50) {
        // Four faint diffraction spikes. The eye reads spikes as a star and
        // a clean round blob as a planet.
        var spikeLength = (2.0 + (peak - 0.50) * 16.0) * pointScale;
        var spikeWidth = Math.max(1, pointScale * 0.9);
        var spikeAlpha = peak * 0.30;
        var across = context.createLinearGradient(x - spikeLength, 0, x + spikeLength, 0);
        across.addColorStop(0, "rgba(" + colorText + ",0)");
        across.addColorStop(0.5, "rgba(" + colorText + "," + spikeAlpha + ")");
        across.addColorStop(1, "rgba(" + colorText + ",0)");
        context.fillStyle = across;
        context.fillRect(x - spikeLength, y - spikeWidth * 0.5, spikeLength * 2, spikeWidth);
        var down = context.createLinearGradient(0, y - spikeLength, 0, y + spikeLength);
        down.addColorStop(0, "rgba(" + colorText + ",0)");
        down.addColorStop(0.5, "rgba(" + colorText + "," + spikeAlpha + ")");
        down.addColorStop(1, "rgba(" + colorText + ",0)");
        context.fillStyle = down;
        context.fillRect(x - spikeWidth * 0.5, y - spikeLength, spikeWidth, spikeLength * 2);
        footprint = Math.ceil(spikeLength) + 2;
      }

      // The core is a hard block of whole texels. Anti-aliasing a sub-pixel
      // disc spreads every star over four grey pixels, which is what made
      // them all look the same size.
      context.fillStyle = "rgba(" + colorText + "," + Math.min(1, peak * 1.05) + ")";
      context.fillRect(
        Math.round(x - pointScale * 0.5), Math.round(y - pointScale * 0.5),
        pointScale, pointScale
      );

      phaseWrites.push(x, y, footprint, Math.floor(starHash(seed) * 254));
    }

    for (var index = 0; index < starCatalog.length; index += 4) {
      drawStar(
        starCatalog[index], starCatalog[index + 1], starCatalog[index + 2], starCatalog[index + 3],
        index * 0.37 + 3.1
      );
    }
    var faint = buildFaintCatalog();
    for (var faintIndex = 0; faintIndex < faint.length; faintIndex += 4) {
      drawStar(
        faint[faintIndex], faint[faintIndex + 1], faint[faintIndex + 2], faint[faintIndex + 3],
        faintIndex * 0.61 + 77.7
      );
    }

    // Bake a scintillation phase per star into the alpha channel. The shader
    // cannot derive one from screen position without tearing a star across a
    // cell edge, and stars in the same patch of sky must not flicker in step.
    var image = context.getImageData(0, 0, textureWidth, textureHeight);
    var data = image.data;
    var blockSize = 32;
    for (var blockY = 0; blockY < textureHeight; blockY += blockSize) {
      for (var blockX = 0; blockX < textureWidth; blockX += blockSize) {
        var blockPhase = Math.floor(starHash(blockX * 0.37 + blockY * 5.1) * 254);
        var blockMaxY = Math.min(textureHeight, blockY + blockSize);
        var blockMaxX = Math.min(textureWidth, blockX + blockSize);
        for (var blockRow = blockY; blockRow < blockMaxY; blockRow++) {
          var blockOffset = (blockRow * textureWidth + blockX) * 4 + 3;
          for (var blockColumn = blockX; blockColumn < blockMaxX; blockColumn++, blockOffset += 4) {
            data[blockOffset] = blockPhase;
          }
        }
      }
    }
    for (var write = 0; write < phaseWrites.length; write += 4) {
      var reach = phaseWrites[write + 2];
      var phaseValue = phaseWrites[write + 3];
      var startX = Math.max(0, Math.round(phaseWrites[write]) - reach);
      var endX = Math.min(textureWidth - 1, Math.round(phaseWrites[write]) + reach);
      var startY = Math.max(0, Math.round(phaseWrites[write + 1]) - reach);
      var endY = Math.min(textureHeight - 1, Math.round(phaseWrites[write + 1]) + reach);
      for (var boxY = startY; boxY <= endY; boxY++) {
        var boxOffset = (boxY * textureWidth + startX) * 4 + 3;
        for (var boxX = startX; boxX <= endX; boxX++, boxOffset += 4) data[boxOffset] = phaseValue;
      }
    }

    // Upload the raw array rather than the canvas: the canvas path would
    // unpremultiply the alpha channel and destroy the baked phases.
    var flipped = new Uint8Array(data.length);
    var rowBytes = textureWidth * 4;
    for (var sourceRow = 0; sourceRow < textureHeight; sourceRow++) {
      flipped.set(
        data.subarray(sourceRow * rowBytes, sourceRow * rowBytes + rowBytes),
        (textureHeight - 1 - sourceRow) * rowBytes
      );
    }
    gl.bindTexture(gl.TEXTURE_2D, starFieldTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, textureHeight, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, flipped
    );
  }

  // Value-noise LUT: 512px at two texels per noise unit, smoothstep
  // interpolation baked in, wrapping at a 256-unit period.
  var noiseTexture = gl.createTexture();
  (function buildNoiseTexture() {
    var size = 512;
    var data = new Uint8Array(size * size);
    function hash(x, y) {
      var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    }
    for (var py = 0; py < size; py++) {
      for (var px = 0; px < size; px++) {
        var x = px * 0.5;
        var y = py * 0.5;
        var ix = Math.floor(x) % 256;
        var iy = Math.floor(y) % 256;
        var fx = x - Math.floor(x);
        var fy = y - Math.floor(y);
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        var a = hash(ix, iy);
        var b = hash((ix + 1) % 256, iy);
        var c = hash(ix, (iy + 1) % 256);
        var d = hash((ix + 1) % 256, (iy + 1) % 256);
        var value = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
        data[py * size + px] = Math.max(0, Math.min(255, Math.round(value * 255)));
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  })();

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

  // Two device pixels per CSS pixel preserve Retina detail without paying
  // the 2.25x fragment cost of a 3x display. Adaptive quality can still step
  // down further on slower GPUs and recover once the renderer proves itself.
  var maxPixelRatio = 2;
  var renderScale = 1.0;
  var slowFrameCount = 0;
  var fastFrameCount = 0;
  // The slow-frame threshold must be calibrated to the display: a hard
  // 24ms budget reads a 30Hz monitor, or a Low Power Mode browser with
  // requestAnimationFrame pinned to 30fps, as "slow GPU" and permanently
  // downscales perfectly good hardware. A short burst of empty rAFs before
  // the render loop starts measures the real frame cadence.
  var frameBudget = 24;
  var settleUntil = 0;
  var calibrated = false;
  var calibrationStarted = false;
  var recoveryProbesLeft = 2;
  var probeDeadline = 0;

  function startCalibration() {
    if (calibrationStarted) return;
    calibrationStarted = true;
    var samples = [];
    var started = performance.now();
    function tick(timestamp) {
      samples.push(timestamp);
      if (samples.length < 13 && timestamp - started < 700) {
        window.requestAnimationFrame(tick);
        return;
      }
      var deltas = [];
      for (var index = 1; index < samples.length; index++) {
        deltas.push(samples[index] - samples[index - 1]);
      }
      deltas.sort(function (a, b) { return a - b; });
      if (deltas.length >= 6) {
        frameBudget = Math.min(50, Math.max(24, deltas[Math.floor(deltas.length / 2)] * 1.6));
      }
      calibrated = true;
      // Page-load jank (layout, image decode, the texture-load refresh
      // draws) must not count against the renderer.
      settleUntil = performance.now() + 1200;
      updateAnimationState(performance.now());
    }
    window.requestAnimationFrame(tick);
  }

  function resize() {
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    var renderWidth = Math.max(1, Math.round(width * pixelRatio * renderScale));
    var renderHeight = Math.max(1, Math.round(height * pixelRatio * renderScale));
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      rebuildStarField(renderWidth, renderHeight);
    }
  }

  function adaptQuality(now) {
    if (reducedMotion || now < settleUntil) return;
    var delta = now - lastFrame;
    // Sustained misses trigger a downscale. Severe misses count heavier so
    // a truly slow renderer converges in a few frames, while a single
    // tab-wake stall decays away against normal frames.
    if (delta > frameBudget) {
      slowFrameCount += delta > frameBudget * 4 ? 4 : 1;
      fastFrameCount = 0;
    } else {
      if (slowFrameCount > 0) slowFrameCount--;
      fastFrameCount++;
    }
    if (slowFrameCount >= 12 && renderScale > 0.67) {
      renderScale = renderScale > 0.9 ? 0.8 : 0.66;
      slowFrameCount = 0;
      fastFrameCount = 0;
      // A downscale soon after a recovery probe means the probe failed;
      // stop probing before the scale starts oscillating.
      if (now < probeDeadline) recoveryProbesLeft--;
      console.info("atmosphere: render scale reduced to " + renderScale + " to hold frame rate");
      resize();
    } else if (fastFrameCount >= 480 && renderScale < 0.99 && recoveryProbesLeft > 0) {
      // ~8 seconds of consistently on-budget frames earns one step back up.
      renderScale = renderScale < 0.7 ? 0.8 : 1.0;
      slowFrameCount = 0;
      fastFrameCount = 0;
      probeDeadline = now + 5000;
      console.info("atmosphere: render scale restored to " + renderScale);
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

  // The visible celestial body doubles as the theme toggle: the sun by day,
  // the moon by night. Positions mirror the shader's SUN_SCREEN_X/SUN_BASE_Y
  // and MOON_SCREEN_X/MOON_SCREEN_Y defines (including their aspect
  // corrections) and must move with them. The hit radius is tap-sized —
  // well past the discs, still far from where water clicks land.
  function celestialBodyAt(clientX, clientY, time) {
    var bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    var uvX = (clientX - bounds.left) / bounds.width;
    var uvY = 1 - (clientY - bounds.top) / bounds.height;
    var aspect = bounds.width / bounds.height;
    if (document.documentElement.dataset.theme === "dark") {
      return Math.hypot((uvX - 0.70) * aspect, uvY - 0.80) < 0.05;
    }
    var progress = Math.min(Math.max((time - 30) / 480, 0), 1);
    progress = progress * progress * (3 - 2 * progress);
    var sunY = 0.512 + 0.11 * progress;
    return Math.hypot((uvX - 0.075) * aspect / 1.6, uvY - sunY) < 0.05;
  }

  function sceneTimeForHit() {
    return reducedMotion ? 3 : currentSceneTime(performance.now());
  }

  var sceneSelector = ".site-header, .scene-hero, .tide-gate, .project-masthead--system, .work-masthead, .writing-masthead, .about-stage, .contact-stage, .article-hero, .site-footer";

  function isSceneSurfaceTarget(target) {
    return Boolean(target.closest(sceneSelector));
  }

  window.addEventListener("pointerdown", function (event) {
    if (!contextAvailable || event.target.closest("a, button, input, textarea, select, label")) return;
    var time = sceneTimeForHit();
    // The listener is window-wide because the canvas itself ignores pointer
    // events. Do not let opaque article or project content inherit the
    // celestial hotspot just because it crosses the same screen coordinates.
    if (isSceneSurfaceTarget(event.target) && celestialBodyAt(event.clientX, event.clientY, time)) {
      if (window.varyvodaTheme) window.varyvodaTheme.toggle();
      return;
    }
    if (!animationEligible()) return;
    var hit = screenToWater(event.clientX, event.clientY, time);
    if (!hit) return;
    ripples.push({ x: hit.x, z: hit.z, time: time, amplitude: 0.18 });
    if (ripples.length > maxRipples) ripples.shift();
  }, { passive: true });

  var celestialHover = false;

  window.addEventListener("pointermove", function (event) {
    if (!contextAvailable || event.pointerType !== "mouse") return;
    var over = isSceneSurfaceTarget(event.target) &&
      !event.target.closest("a, button, input, textarea, select, label") &&
      celestialBodyAt(event.clientX, event.clientY, sceneTimeForHit());
    if (over !== celestialHover) {
      celestialHover = over;
      document.documentElement.style.cursor = over ? "pointer" : "";
    }
  }, { passive: true });

  // First-visit hint pointing at the clickable sun/moon. Only rendered on the
  // homepage, and only until the visitor toggles the theme once — any toggle
  // (disc or footer control) writes varyvoda-theme, which retires it for good.
  // Percent coordinates mirror celestialBodyAt's centers; the sun holds its
  // base height until scene time 30s, long after the hint is gone.
  (function () {
    var hint = document.querySelector("[data-celestial-hint]");
    if (!hint) return;
    try {
      var stored = window.localStorage.getItem("varyvoda-theme");
      if (stored === "dark" || stored === "light") return;
    } catch (_) {}

    var hideTimer = null;

    function hideHint() {
      hint.classList.remove("celestial-hint--visible");
      window.clearTimeout(hideTimer);
      window.removeEventListener("varyvoda:themechange", hideHint);
    }

    function showHint() {
      var dark = document.documentElement.dataset.theme === "dark";
      hint.textContent = dark ? "Click the moon for daylight" : "Click the sun for nightfall";
      hint.classList.toggle("celestial-hint--moon", dark);
      hint.classList.toggle("celestial-hint--sun", !dark);
      hint.style.left = (dark ? 70 : 7.5) + "%";
      hint.style.top = ((1 - (dark ? 0.80 : 0.512)) * 100) + "%";
      hint.classList.add("celestial-hint--visible");
      window.addEventListener("varyvoda:themechange", hideHint);
      hideTimer = window.setTimeout(hideHint, 9000);
    }

    // Wait for the scene's first drawn frame before starting the countdown —
    // a hint pointing into a canvas that hasn't rendered yet is noise. Give
    // up quietly if the shader never comes up.
    var readyChecks = 0;
    var readyPoll = window.setInterval(function () {
      readyChecks += 1;
      if (canvas.classList.contains("shader-ready")) {
        window.clearInterval(readyPoll);
        window.setTimeout(showHint, 2500);
      } else if (readyChecks > 100) {
        window.clearInterval(readyPoll);
      }
    }, 300);
  })();

  function currentSceneTime(now) {
    return (activeElapsed + (activeSegmentStart === null ? 0 : now - activeSegmentStart)) * 0.001;
  }

  function animationEligible() {
    return calibrated && !reducedMotion && contextAvailable && !document.hidden &&
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
    adaptQuality(now);
    drawFrame(now, currentSceneTime(now), true);
    scheduleFrame();
  }

  function drawFrame(now, sceneTime, animateTheme) {
    if (!validateProgramOnce()) return;
    resize();
    var targetNight = document.documentElement.dataset.theme === "dark" ? 1 : 0;
    if (animateTheme) {
      nightBlend += (targetNight - nightBlend) * Math.min(1, (now - lastFrame) / 180);
    } else {
      nightBlend = targetNight;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(oceanProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
    gl.enableVertexAttribArray(oceanPosition);
    gl.vertexAttribPointer(oceanPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(oceanResolution, canvas.width, canvas.height);
    gl.uniform1f(oceanTime, sceneTime);
    gl.uniform1f(oceanNight, nightBlend);
    var riseT = Math.min(1, Math.max(0, (sceneTime - 30) / 480));
    var riseProgress = riseT * riseT * (3 - 2 * riseT);
    gl.uniform1f(oceanSunProgress, riseProgress);
    gl.uniform1f(oceanSunScreenY, 0.512 + 0.11 * riseProgress);
    gl.uniform1f(oceanNoiseScale, (window.devicePixelRatio || 1) < 1.5 ? 1.7 : 1.0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.uniform1i(oceanNoise, 0);
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
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, starFieldTexture);
    gl.uniform1i(oceanStarField, 5);
    gl.uniform2fv(oceanWaveDirections, waveDirections);
    gl.uniform4fv(oceanRipples, rippleUniforms());
    gl.uniform1i(oceanRippleCount, ripples.length);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

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
    // A page that loaded in a background tab gets no rAF ticks; calibrate
    // once it first becomes visible.
    if (!document.hidden && !reducedMotion) startCalibration();
    updateAnimationState(performance.now());
  });
  canvas.addEventListener("webglcontextlost", function (event) {
    event.preventDefault();
    contextAvailable = false;
    updateAnimationState(performance.now());
    canvas.classList.add("ambient-canvas-fallback");
  });

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
  if (reducedMotion) {
    calibrated = true;
    refreshFrame();
  } else if (!document.hidden) {
    startCalibration();
  }
})();
