import React, { useEffect, useRef } from "react";

const Canvas: React.FunctionComponent = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas == null) {
      throw new Error("canvas not found");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("context not found");
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  return <canvas ref={ref} />;
};

export const App = () => {
  return (
    <>
      <h1>Hello world</h1>
      <Canvas />
    </>
  );
};
