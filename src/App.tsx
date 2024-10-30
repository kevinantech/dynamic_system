import { det, eigs } from "mathjs";
import { useState } from "react";
import Plot from "react-plotly.js";
import "./App.css";
import "./main.css";
import Input from "./components/Input/Input";

function App() {
  const [a1, setA1] = useState(0);
  const [b1, setB1] = useState(0);
  const [a2, setA2] = useState(0);
  const [b2, setB2] = useState(0);
  const [result, setResult] = useState<string>("");
  const [graphData, setGraphData] = useState(null);

  const analyze = () => {
    const A = [
      [a1, b1],
      [a2, b2],
    ];
    const eigen = eigs(A);
    const eigenvalues = eigen.values;
    const detA = det(A);

    // Verificación de estructura de los valores propios
    const realParts = eigenvalues.map((ev) =>
      typeof ev === "number" ? ev : ev?.re ?? 0
    ) as number[];
    const imaginaryParts = eigenvalues.map((ev) =>
      typeof ev === "number" ? 0 : ev?.im ?? 0
    ) as number[];

    let criticalPointType = "";
    let stability = "";

    // Determinación del tipo de punto crítico
    if (
      realParts[0] === realParts[1] &&
      imaginaryParts[0] === 0 &&
      imaginaryParts[1] === 0
    ) {
      criticalPointType = "Nodo estrella";
    } else if (
      realParts[0] * realParts[1] > 0 &&
      imaginaryParts[0] === 0 &&
      imaginaryParts[1] === 0
    ) {
      criticalPointType = "Nodo regular"; // Ambos valores propios son reales y de igual signo
    } else if (realParts.some((r) => r < 0) && realParts.some((r) => r > 0)) {
      criticalPointType = "Punto silla";
    } else if (
      realParts.every((r) => r === 0) &&
      imaginaryParts.some((i) => i !== 0)
    ) {
      criticalPointType = "Centro";
    } else if (imaginaryParts.some((i) => i !== 0)) {
      criticalPointType = "Foco o Espiral";
    } else {
      criticalPointType = "Linea de puntos";
    }

    // Determinación de la estabilidad
    if (realParts.every((r) => r < 0)) {
      stability = "Asintóticamente estable";
    } else if (
      realParts.every((r) => r === 0) &&
      imaginaryParts.some((i) => i !== 0)
    ) {
      stability = "Estable";
    } else {
      stability = "Inestable";
    }

    if (detA === 0 && realParts.every((re) => re < 1e-6)) {
      setResult(
        "Punto critico (0,0) no es unico, Tipo de punto critico: Linea de puntos"
      );
    } else {
      setResult(
        `Punto critico (0,0) unico, Tipo de punto crítico: ${criticalPointType}, Estabilidad: ${stability}`
      );
    }
    plotTrajectories(A);
  };

  const plotTrajectories = (A: number[][]) => {
    const xValues: number[] = [];
    const yValues: number[] = [];
    const dt = 0.1; // Paso de tiempo
    const tMax = 10; // Tiempo máximo
    const tSteps = Math.round(tMax / dt);

    // Inicializa condiciones iniciales variadas
    const initialConditions = [
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: 0.5 },
      { x: 0.5, y: -0.5 },
      { x: -0.5, y: -0.5 },
      { x: 0.1, y: 0.1 },
      { x: -0.1, y: 0.1 },
      { x: 0.1, y: -0.1 },
      { x: -0.1, y: -0.1 },
    ];

    initialConditions.forEach(({ x, y }) => {
      const trajX = [];
      const trajY = [];
      for (let t = 0; t < tSteps; t++) {
        trajX.push(x);
        trajY.push(y);
        const dx = A[0][0] * x + A[0][1] * y; // x' = a1x + b1y
        const dy = A[1][0] * x + A[1][1] * y; // y' = a2x + b2y
        x += dx * dt;
        y += dy * dt;
      }
      xValues.push(...trajX);
      yValues.push(...trajY);
    });

    const data = initialConditions.map(({ x, y }, index) => ({
      x: xValues.slice(index * tSteps, (index + 1) * tSteps),
      y: yValues.slice(index * tSteps, (index + 1) * tSteps),
      mode: "lines",
      line: { width: 2 },
      name: `Trayectoria desde (${x}, ${y})`,
    }));

    // Actualiza los datos para graficar
    setGraphData(data);
  };

  return (
    <>
      <main className="mt-16">
        <h2 className="pb-8">Analizar Sistema Dinámico Lineal</h2>
        <div className="w-max mx-auto mt-0 mb-12">
          <div className="flex items-center h-10 mb-4">
            <p className="mx-1 font-semibold text-white">X' =</p>
            <Input
              variable="x"
              onChange={(e) => setA1(parseFloat(e.target.value))}
            />
            <p className="mx-1 font-semibold text-white">+</p>
            <Input
              variable="y"
              onChange={(e) => setB1(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex items-center h-10">
            <p className="mx-1 font-semibold text-white">Y' =</p>
            <Input
              variable="x"
              onChange={(e) => setA2(parseFloat(e.target.value))}
            />
            <p className="mx-1 font-semibold text-white">+</p>
            <Input
              variable="y"
              onChange={(e) => setB2(parseFloat(e.target.value))}
            />
          </div>
          <button className="mt-8" onClick={analyze}>
            Analizar
          </button>
        </div>
        {!!result && (
          <p className="mb-4">
            {result}
            {"."}
          </p>
        )}
        {graphData && (
          <Plot
            data={graphData}
            layout={{
              title: "Diagrama de Fase",
              xaxis: { title: "x", range: [-100, 100] },
              yaxis: { title: "y", range: [-100, 100] },
              showlegend: true,
              autosize: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </main>
      <footer className="pt-16 pb-8">
        <p className="text-xs">
          ©2024 Boris Bello, Kevin Gomez, Juan Narvaez & Diogo Rodriguez
        </p>
      </footer>
    </>
  );
}

export default App;
