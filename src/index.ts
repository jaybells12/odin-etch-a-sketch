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
  // if hue calculation comes out negative, circle around from 360
  if (hue < 0) {
    hue = 360 + hue;
  }

  let lightness: number = (cMax + cMin) / 2;
  let saturation: number = 100 * (delta / (1 - Math.abs(2 * lightness - 1)));

  return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(
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
  prevUnit: HTMLDivElement | null;
  mouseBtnHeld: boolean;
}

function initialize(): void {
  const options: OptionsObject = {
    color: "rgb(0,0,0)",
    bgColor: "rgb(255,255,255)",
    lighten: false,
    darken: false,
    rainbow: false,
    eraser: false,
    prevUnit: null,
    mouseBtnHeld: false,
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
  function resizeGrid(e: Event) {
    if (sizeInput instanceof HTMLInputElement) {
      e.preventDefault();
      removeGrid();
      createGrid(+sizeInput.value);
    } else {
      throw new Error("Size Input element not found");
    }
  }

  // ------------ Control Functions ------------
  // Refactor this
  function setColor(e: Event): void {
    if (e.target instanceof HTMLInputElement) {
      e.preventDefault();
      options.color = convertHexToRGB(e.target.value);
    } else {
      throw new Error("Pen Color Input element not found");
    }
  }
  function setBgColor(e: Event): void {
    if (e.target instanceof HTMLInputElement) {
      if (gridContainer instanceof HTMLDivElement) {
        e.preventDefault();
        options.bgColor = convertHexToRGB(e.target.value);
        gridContainer.style.backgroundColor = options.bgColor;
      } else {
        throw new Error("Grid Container element not found");
      }
    } else {
      throw new Error("Background Color Input element not found");
    }
  }
  function toggleRainbow(e: Event): void {
    e.preventDefault();
    options.eraser = false;
    options.darken = false;
    options.lighten = false;
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
    options.rainbow = false;
    options.lighten = !options.lighten;
    setButtonsStatus();
  }
  function toggleDarken(e: Event): void {
    e.preventDefault();
    options.eraser = false;
    options.lighten = false;
    options.rainbow = false;
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

  // ------------ Coloring Functions ------------
  function colorGridUnit(e: Event): void {
    // the following condition exits the function if the event fires over the same target sequentially, or if the mouse button isnt being held
    if (options.prevUnit === e.target || !options.mouseBtnHeld) return;

    if (e.target instanceof HTMLDivElement) {
      options.prevUnit = e.target;
      const rgbColor: string = e.target.style.backgroundColor;

      if (options.eraser) {
        e.target.style.backgroundColor = "";
        return;
      }

      if (options.rainbow) {
        e.target.style.backgroundColor = getRandomColor();
        return;
      }

      if (options.lighten) {
        if (rgbColor) {
          e.target.style.backgroundColor = lightenHSLColor(
            convertRGBtoHSL(rgbColor)
          );
        } else {
          e.target.style.backgroundColor = lightenHSLColor(
            convertRGBtoHSL(options.bgColor)
          );
        }
        return;
      }

      if (options.darken) {
        if (rgbColor) {
          e.target.style.backgroundColor = darkenHSLColor(
            convertRGBtoHSL(rgbColor)
          );
        } else {
          e.target.style.backgroundColor = darkenHSLColor(
            convertRGBtoHSL(options.bgColor)
          );
        }
        return;
      }

      e.target.style.backgroundColor = options.color;
    }
  }
  function getRandomColor(): string {
    const red: number = Math.floor(Math.random() * 256);
    const green: number = Math.floor(Math.random() * 256);
    const blue: number = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
  }
  function lightenHSLColor(inputColor: string): string {
    const colorValues: RegExpMatchArray | null = inputColor.match(/\d+/g);
    if (colorValues) {
      let lightValue: number = +colorValues[2];
      lightValue =
        lightValue >= 100
          ? 100
          : 3 + lightValue + Math.round((100 - lightValue) / 10);
      return `hsl(${colorValues[0]} ${colorValues[1]}% ${lightValue}%)`;
    } else {
      throw new Error("Color Values array is null");
    }
  }
  function darkenHSLColor(inputColor: string): string {
    const colorValues: RegExpMatchArray | null = inputColor.match(/\d+/g);
    if (colorValues) {
      let lightValue: number = +colorValues[2];
      lightValue =
        lightValue <= 0 ? 0 : lightValue - Math.round(lightValue / 10) - 3;
      return `hsl(${colorValues[0]}, ${colorValues[1]}%, ${lightValue}%)`;
    } else {
      throw new Error("Color Values array is null");
    }
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
  gridContainer.addEventListener("mousemove", colorGridUnit);
  gridContainer.addEventListener("mousedown", (e: MouseEvent) => {
    e.preventDefault();
    if (e.button === 0) {
      options.mouseBtnHeld = true;
    }
  });
  window.addEventListener("mouseup", (e: MouseEvent) => {
    e.preventDefault();
    if (e.button === 0) {
      options.mouseBtnHeld = false;
    }
  });
  penColorInput.addEventListener("change", setColor);
  bgColorInput.addEventListener("input", setBgColor);
  rainbowBtn.addEventListener("click", toggleRainbow);
  eraserBtn.addEventListener("click", toggleEraser);
  darkBtn.addEventListener("click", toggleDarken);
  lightBtn.addEventListener("click", toggleLighten);
  clearBtn.addEventListener("click", clearGrid);
  sizeInput.addEventListener("change", resizeGrid);

  //initial grid
  createGrid(50);
}

initialize();
