// src/DynamicSystem.js
import { det, eigs } from "mathjs";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const DynamicSystem = () => {
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(2);
  const [a2, setA2] = useState(-3);
  const [b2, setB2] = useState(4);
  const [result, setResult] = useState<string>("");
  const [graphData, setGraphData] = useState(null);

  const analizarEstabilidad = () => {
    const A = [
      [a1, b1],
      [a2, b2],
    ];
    const eigen = eigs(A);
    const eigenvalues = eigen.values;
    const detA = det(A);
    console.log("🚀 ~ analizarEstabilidad ~ eigen:", eigen);
    console.log("🚀 ~ analizarEstabilidad ~ detA:", detA);

    // Verificación de estructura de los valores propios
    const realParts = eigenvalues.map((ev) =>
      typeof ev === "number" ? ev : ev?.re ?? 0
    ) as number[];
    const imaginaryParts = eigenvalues.map((ev) =>
      typeof ev === "number" ? 0 : ev?.im ?? 0
    ) as number[];

    let tipoPuntoCritico = "";
    let estabilidad = "";

    // Determinación del tipo de punto crítico
    if (
      realParts[0] === realParts[1] &&
      imaginaryParts[0] === 0 &&
      imaginaryParts[1] === 0
    ) {
      tipoPuntoCritico = "Nodo estrella";
    } else if (
      realParts[0] * realParts[1] > 0 &&
      imaginaryParts[0] === 0 &&
      imaginaryParts[1] === 0
    ) {
      tipoPuntoCritico = "Nodo regular"; // Ambos valores propios son reales y de igual signo
    } else if (realParts.some((r) => r < 0) && realParts.some((r) => r > 0)) {
      tipoPuntoCritico = "Punto silla";
    } else if (
      realParts.every((r) => r === 0) &&
      imaginaryParts.some((i) => i !== 0)
    ) {
      tipoPuntoCritico = "Centro";
    } else if (imaginaryParts.some((i) => i !== 0)) {
      tipoPuntoCritico = "Foco o Espiral";
    } else {
      tipoPuntoCritico = "Linea de puntos";
    }

    // Determinación de la estabilidad
    if (realParts.every((r) => r < 0)) {
      estabilidad = "Asintóticamente estable";
    } else if (
      realParts.every((r) => r === 0) &&
      imaginaryParts.some((i) => i !== 0)
    ) {
      estabilidad = "Estable";
    } else {
      estabilidad = "Inestable";
    }

    if (detA === 0 && realParts.every((re) => re < 1e-6)) {
      setResult(
        "Punto critico (0,0) no es unico, Tipo de punto critico: Linea de puntos"
      );
    } else {
      setResult(
        `Punto critico (0,0) unico, Tipo de punto crítico: ${tipoPuntoCritico}, Estabilidad: ${estabilidad}`
      );
    }
    graficarTrayectorias(A);
  };

  const graficarTrayectorias = (A) => {
    const xValues = [];
    const yValues = [];
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

  useEffect(() => {
    if (result) console.log("🚀 ~ useEffect ~ stability:", result);
  }, [result]);

  return (
    <div>
      <h2>Sistema Dinámico en el Punto Crítico (0,0)</h2>
      <div>
        <label>
          a1:
          <input
            type="number"
            value={a1}
            onChange={(e) => setA1(parseFloat(e.target.value))}
          />
        </label>
        <label>
          b1:
          <input
            type="number"
            value={b1}
            onChange={(e) => setB1(parseFloat(e.target.value))}
          />
        </label>
        <label>
          a2:
          <input
            type="number"
            value={a2}
            onChange={(e) => setA2(parseFloat(e.target.value))}
          />
        </label>
        <label>
          b2:
          <input
            type="number"
            value={b2}
            onChange={(e) => setB2(parseFloat(e.target.value))}
          />
        </label>
        <button onClick={analizarEstabilidad}>Analizar Estabilidad</button>
      </div>
      <p>{result}</p>
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
    </div>
  );
};

export default DynamicSystem;
