"use client";

/**
 * The animated background.
 *
 * A gradient ground with a drifting light edge, a lens flare and a lens
 * distortion pass, composited on the GPU. It renders behind every layer of
 * the app; the chrome that sits on top of it rides on glass, because the
 * gradient runs from light to dark and no single text colour clears 4.5:1
 * across that whole range.
 *
 * Two cases fall back to the static gradient painted on `body`:
 *   - the browser has no WebGPU (Firefox and older Safari, among others),
 *     reported through the renderer's own `onUnavailable`;
 *   - the reader asked for reduced motion, in which case mounting an
 *     animated canvas would ignore a preference they set deliberately.
 */

import { useEffect, useState } from "react";
import {
  LensDistortion,
  LensFlare,
  LightEdge,
  LinearGradient,
  Shader,
  TimeTrail,
} from "shaders/react";

/** The shape the light edge traces. Hosted by the shader tool. */
const SHAPE_SDF_URL =
  "https://data.shaders.com/storage/v1/object/public/user-uploaded-images/user_33nh0FG48zZa0rIUZuK7vgwPfZe/cExW0bSwDfD4_sdf.bin";

export function ShaderBackground() {
  // Rendering nothing on the server keeps the markup identical on both
  // passes; the canvas is decorative, so it costs the first paint nothing.
  const [mounted, setMounted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [stillMotion, setStillMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStillMotion(query.matches);
    sync();
    setMounted(true);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!mounted || stillMotion || unavailable) {
    return <div className="shader-bg-fallback" aria-hidden />;
  }

  return (
    <div className="shader-bg" aria-hidden>
      <Shader
        toneMapping="neutral"
        onUnavailable={() => setUnavailable(true)}
        style={{ width: "100%", height: "100%" }}
      >
        <LinearGradient
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          stops={[
            { color: "#82b6ed", position: 0.3423 },
            { color: "#2f639e", position: 0.8848 },
          ]}
        />

        <TimeTrail
          motionThreshold={0.1}
          tint="#c5d9fa"
          tintMode="color"
          trailLength={0.21}
          trailSource="alpha"
          zoom={1.011}
        >
          <LightEdge
            bloom={0.34}
            colorSpace="oklab"
            intensity={0.44}
            scale={0.8}
            shapeSdfUrl={SHAPE_SDF_URL}
            smoke={0.27}
            softness={0.72}
            spots={4}
            spotSize={0.43}
            stops={[
              { color: "#f9f5ff", position: 0 },
              { color: "#dff0f5", position: 1 },
            ]}
            thickness={0.05}
          />
        </TimeTrail>

        <LensFlare
          blendMode="linearDodge"
          edgeFade={1}
          ghostChroma={0.26}
          ghostIntensity={0.26}
          ghostSpread={0.31}
          glareIntensity={0.4}
          haloChroma={0.27}
          haloIntensity={0.09}
          haloRadius={0.56}
          haloSoftness={0.05}
          intensity={0.73}
          lightPosition={{ x: 0.5, y: 0.5 }}
          speed={1.5}
          starburstIntensity={0}
          starburstPoints={9}
          streakIntensity={0.46}
          streakLength={0.58}
        />

        <LensDistortion
          angle={129}
          bias={-0.02}
          dispersionShift={-0.3}
          focusCenter={1}
          grainOverlay={0.03}
          noiseFrequency={0}
          perspective={0}
          swirl={0.1}
        />
      </Shader>
    </div>
  );
}
