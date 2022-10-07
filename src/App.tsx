import { type Component, createMemo, For } from 'solid-js';
import { arc, interpolateInferno, interpolateSinebow } from 'd3';

import { rawData, startFromFile } from './audioSource';

const arcBuilder = arc();
const RadialGraph: Component<{
  color: (value: number) => string;
  scale: number;
}> = ({ color, scale }) => {
  const computed = createMemo(() => {
    const data = rawData();

    const total = data.reduce((acc, val) => acc + val, 0);

    const highCount = data.reduce((acc, val) => (val > 32 ? acc + 1 : acc), 0);
    const intensity = highCount / data.length;

    const paths: {
      path: string;
      color: string;
    }[] = [];

    const range = 1 + intensity;
    const rangeInRadians = range * Math.PI;
    const startAngle = -rangeInRadians / 2;
    let currentAngle = startAngle;

    for (const d of data) {
      const angle = (d / total) * rangeInRadians;
      const path = arcBuilder({
        innerRadius: 50 - ((d + 10) / 255) * 35,
        outerRadius: 50 + ((d + 10) / 255) * 35,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      })!;

      paths.push({
        path,
        color: color(d / 255),
      });

      currentAngle += angle;
    }

    return { paths, intensity };
  });

  return (
    <g transform={`scale(${computed().intensity * scale + 1})`}>
      <For each={computed().paths}>
        {p => <path d={p.path} fill={p.color} />}
      </For>
    </g>
  );
};

const App: Component = () => {
  return (
    <div style="width: 100vw; height: 100vh;" onClick={startFromFile}>
      <svg
        width="100%"
        height="100%"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <RadialGraph color={interpolateSinebow} scale={2.5} />

        <RadialGraph color={interpolateInferno} scale={1.5} />
      </svg>
    </div>
  );
};

export default App;
