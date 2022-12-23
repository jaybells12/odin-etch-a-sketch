// Utility functions for converting color strings
function convertRGBtoHSL(rgbString: string): string {
  const colors: RegExpMatchArray | null = rgbString.match(/(\d+)/g);
  if (!colors) throw new Error("RGB to HSL: Colors array is null");

  let red: number = +colors[0] / 255;
  let green: number = +colors[1] / 255;
  let blue: number = +colors[2] / 255;
  let cMax: number = Math.max(red, green, blue);
  let cMin: number = Math.min(red, green, blue);
  let delta: number = cMax - cMin;

  if (delta === 0) {
    if (cMax === 0) {
      return `hsl(0, 0%, 0%)`;
    } else if (cMax === 1) {
      return `hsl(0, 0%, 100%)`;
    }
  }
  let hue: number = 0;

  delta &&
    (hue =
      cMax === red
        ? 60 * (((green - blue) / delta) % 6)
        : cMax === green
        ? 60 * ((blue - red) / delta + 2)
        : 60 * ((red - green) / delta + 4));

  let lightness: number = (cMax + cMin) / 2;
  let saturation: number = 100 * (delta / (1 - Math.abs(2 * lightness - 1)));

  return `hsl(${hue}, ${Math.round(saturation)}%, ${Math.round(
    lightness * 100
  )}%)`;
}

function convertHexToRGB(hexString: string): string {
  const colors: RegExpMatchArray | null = hexString.match(/\w{2}/g);
  if (!colors) throw new Error("Hex to RGB: Colors array is null");
  const red: number = parseInt(colors[0], 16);
  const green: number = parseInt(colors[1], 16);
  const blue: number = parseInt(colors[2], 16);

  return `rgb(${red}, ${green}, ${blue})`;
}

/*
 *
 *  Initialization
 *
 */

interface OptionsObject {
  color: string;
  bgColor: string;
  lighten: boolean;
  darken: boolean;
  rainbow: boolean;
  eraser: boolean;
}

function initialize(): void {
  const options: OptionsObject = {
    color: "rgb(0,0,0)",
    bgColor: "rgb(255,255,255)",
    lighten: false,
    darken: false,
    rainbow: false,
    eraser: false,
  };

  // ------------ Grid Functions ------------
  function createGrid(length: number): void {
    if (gridContainer instanceof HTMLDivElement) {
      for (let i = 0; i < length; i++) {
        const newRow: HTMLElement = document.createElement("div");
        newRow.classList.add("row");
        for (let j = 0; j < length; j++) {
          const newDiv: HTMLElement = document.createElement("div");
          newDiv.classList.add("unit");
          newRow.appendChild(newDiv);
        }
        gridContainer.appendChild(newRow);
      }
    }
  }
  function removeGrid(): void {
    if (gridContainer instanceof HTMLDivElement) {
      gridContainer.replaceChildren();
    }
  }

  // ------------ Control Functions ------------
  function setColor(e: Event, color: string): void {
    e.preventDefault();
    options.color = convertHexToRGB(color);
  }
  function setBgColor(e: Event, color: string): void {
    e.preventDefault();
    options.bgColor = convertHexToRGB(color);
  }
  function toggleRainbow(e: Event): void {
    e.preventDefault();
    options.eraser = false;
    options.rainbow = !options.rainbow;
    setButtonsStatus();
  }
  function toggleEraser(e: Event): void {
    e.preventDefault();
    options.rainbow = false;
    options.darken = false;
    options.lighten = false;
    options.eraser = !options.eraser;
    setButtonsStatus();
  }
  function toggleLighten(e: Event): void {
    e.preventDefault();
    options.eraser = false;
    options.darken = false;
    options.lighten = !options.lighten;
    setButtonsStatus();
  }
  function toggleDarken(e: Event): void {
    e.preventDefault();
    options.eraser = false;
    options.lighten = false;
    options.darken = !options.darken;
    setButtonsStatus();
  }
  function setButtonsStatus(): void {
    if (rainbowBtn && eraserBtn && lightBtn && darkBtn) {
      rainbowBtn.style.backgroundColor = options.rainbow ? "red" : "";
      eraserBtn.style.backgroundColor = options.eraser ? "red" : "";
      lightBtn.style.backgroundColor = options.lighten ? "red" : "";
      darkBtn.style.backgroundColor = options.darken ? "red" : "";
    }
  }

  function clearGrid(e: Event): void {
    e.preventDefault();
    // Had to assert type to HTMLDivElement here because I couldn't figure out how to access style property from type Element
    const units = document.getElementsByClassName(
      "unit"
    ) as HTMLCollectionOf<HTMLDivElement>;
    if (units) {
      for (let i = 0; i < units.length; i++) {
        units[i].style.backgroundColor = "";
      }
    }
  }
  function resizeGrid(e: Event, size: string) {
    e.preventDefault();
    removeGrid();
    createGrid(+size);
  }

  // ------------ Elements ------------

  const gridContainer: HTMLElement | null =
    document.getElementById("grid__container");
  if (!(gridContainer instanceof HTMLDivElement))
    throw new Error("Grid Container element not found");

  const penColorInput: HTMLElement | null =
    document.getElementById("pen-color__input");
  if (!(penColorInput instanceof HTMLInputElement))
    throw new Error("Pen Color Input element not found");

  const bgColorInput: HTMLElement | null =
    document.getElementById("bg-color__input");
  if (!(bgColorInput instanceof HTMLInputElement))
    throw new Error("Background Color Input element not found");

  const rainbowBtn: HTMLElement | null =
    document.getElementById("rainbow__btn");
  if (!(rainbowBtn instanceof HTMLButtonElement))
    throw new Error("Rainbow Button element not found");

  const eraserBtn: HTMLElement | null = document.getElementById("eraser__btn");
  if (!(eraserBtn instanceof HTMLButtonElement))
    throw new Error("Eraser Button element not found");

  const lightBtn: HTMLElement | null = document.getElementById("lighten__btn");
  if (!(lightBtn instanceof HTMLButtonElement))
    throw new Error("Lighten Button element not found");

  const darkBtn: HTMLElement | null = document.getElementById("darken__btn");
  if (!(darkBtn instanceof HTMLButtonElement))
    throw new Error("Darken Button element not found");

  const clearBtn: HTMLElement | null = document.getElementById("clear__btn");
  if (!(clearBtn instanceof HTMLButtonElement))
    throw new Error("Clear Button element not found");

  const sizeInput: HTMLElement | null =
    document.getElementById("grid-size__input");
  if (!(sizeInput instanceof HTMLInputElement))
    throw new Error("Size Input element not found");

  // ------------ Listeners ------------
  gridContainer.addEventListener("mousemove", (e: Event) => {
    if (e.target instanceof HTMLDivElement) {
      e.target.style.backgroundColor = "red";
    }
  });
  penColorInput.addEventListener("change", (e: Event) =>
    setColor(e, penColorInput.value)
  );
  bgColorInput.addEventListener("change", (e: Event) => {
    setBgColor(e, bgColorInput.value);
    gridContainer.style.backgroundColor = options.bgColor;
  });
  rainbowBtn.addEventListener("click", (e: Event) => toggleRainbow(e));
  eraserBtn.addEventListener("click", (e: Event) => toggleEraser(e));
  darkBtn.addEventListener("click", (e: Event) => toggleDarken(e));
  lightBtn.addEventListener("click", (e: Event) => toggleLighten(e));
  clearBtn.addEventListener("click", (e: Event) => clearGrid(e));
  sizeInput.addEventListener("change", (e: Event) =>
    resizeGrid(e, sizeInput.value)
  );

  //initial grid
  createGrid(50);
}

initialize();
