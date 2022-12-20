// The grid is created using JavaScript

function createSquareGrid(length: number): void {
  const container: HTMLElement | null =
    document.getElementById("grid__container");
  if (!container) throw new Error("Grid container element not found.");
  for (let i = 0; i < length; i++) {
    const newRow: HTMLElement = document.createElement("div");
    newRow.classList.add("row");
    for (let j = 0; j < length; j++) {
      const newDiv: HTMLElement = document.createElement("div");
      newDiv.classList.add("unit");
      newDiv.addEventListener("pointerenter", onHover);
      newRow.appendChild(newDiv);
    }
    container.appendChild(newRow);
  }
}

function onHover(e: Event): void {
  if (!e.target) throw new Error("Hover event has no target");
  if (!(e.target instanceof HTMLElement))
    throw new Error("Hover event target is not an HTML element");

  e.target.style.backgroundColor = "red";
}

createSquareGrid(16);
