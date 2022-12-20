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
      newRow.appendChild(newDiv);
    }
    container.appendChild(newRow);
  }
}

createSquareGrid(16);
