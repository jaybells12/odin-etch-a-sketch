"use strict";
function convertRGBtoHSL(rgbString) {
    const colors = rgbString.match(/(\d+)/g);
    if (!colors)
        throw new Error("RGB to HSL: Colors array is null");
    let red = +colors[0] / 255;
    let green = +colors[1] / 255;
    let blue = +colors[2] / 255;
    let cMax = Math.max(red, green, blue);
    let cMin = Math.min(red, green, blue);
    let delta = cMax - cMin;
    if (delta === 0) {
        if (cMax === 0) {
            return `hsl(0, 0%, 0%)`;
        }
        else if (cMax === 1) {
            return `hsl(0, 0%, 100%)`;
        }
    }
    let hue = 0;
    delta &&
        (hue =
            cMax === red
                ? 60 * (((green - blue) / delta) % 6)
                : cMax === green
                    ? 60 * ((blue - red) / delta + 2)
                    : 60 * ((red - green) / delta + 4));
    if (hue < 0) {
        hue = 360 + hue;
    }
    let lightness = (cMax + cMin) / 2;
    let saturation = 100 * (delta / (1 - Math.abs(2 * lightness - 1)));
    return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness * 100)}%)`;
}
function convertHexToRGB(hexString) {
    const colors = hexString.match(/\w{2}/g);
    if (!colors)
        throw new Error("Hex to RGB: Colors array is null");
    const red = parseInt(colors[0], 16);
    const green = parseInt(colors[1], 16);
    const blue = parseInt(colors[2], 16);
    return `rgb(${red}, ${green}, ${blue})`;
}
function initialize() {
    const options = {
        color: "rgb(0,0,0)",
        bgColor: "rgb(255,255,255)",
        lighten: false,
        darken: false,
        rainbow: false,
        eraser: false,
        prevUnit: null,
        mouseBtnHeld: false,
    };
    function createGrid(length) {
        if (gridContainer instanceof HTMLDivElement) {
            for (let i = 0; i < length; i++) {
                const newRow = document.createElement("div");
                newRow.classList.add("row");
                for (let j = 0; j < length; j++) {
                    const newDiv = document.createElement("div");
                    newDiv.classList.add("unit");
                    newRow.appendChild(newDiv);
                }
                gridContainer.appendChild(newRow);
            }
        }
    }
    function removeGrid() {
        if (gridContainer instanceof HTMLDivElement) {
            gridContainer.replaceChildren();
        }
    }
    function clearGrid(e) {
        e.preventDefault();
        const units = document.getElementsByClassName("unit");
        if (units) {
            for (let i = 0; i < units.length; i++) {
                units[i].style.backgroundColor = "";
            }
        }
    }
    function resizeGrid(e) {
        if (sizeInput instanceof HTMLInputElement) {
            e.preventDefault();
            removeGrid();
            createGrid(+sizeInput.value);
        }
        else {
            throw new Error("Size Input element not found");
        }
    }
    function setColor(e) {
        if (e.target instanceof HTMLInputElement) {
            e.preventDefault();
            options.color = convertHexToRGB(e.target.value);
        }
        else {
            throw new Error("Pen Color Input element not found");
        }
    }
    function setBgColor(e) {
        if (e.target instanceof HTMLInputElement) {
            if (gridContainer instanceof HTMLDivElement) {
                e.preventDefault();
                options.bgColor = convertHexToRGB(e.target.value);
                gridContainer.style.backgroundColor = options.bgColor;
            }
            else {
                throw new Error("Grid Container element not found");
            }
        }
        else {
            throw new Error("Background Color Input element not found");
        }
    }
    function toggleRainbow(e) {
        e.preventDefault();
        options.eraser = false;
        options.darken = false;
        options.lighten = false;
        options.rainbow = !options.rainbow;
        setButtonsStatus();
    }
    function toggleEraser(e) {
        e.preventDefault();
        options.rainbow = false;
        options.darken = false;
        options.lighten = false;
        options.eraser = !options.eraser;
        setButtonsStatus();
    }
    function toggleLighten(e) {
        e.preventDefault();
        options.eraser = false;
        options.darken = false;
        options.rainbow = false;
        options.lighten = !options.lighten;
        setButtonsStatus();
    }
    function toggleDarken(e) {
        e.preventDefault();
        options.eraser = false;
        options.lighten = false;
        options.rainbow = false;
        options.darken = !options.darken;
        setButtonsStatus();
    }
    function setButtonsStatus() {
        if (rainbowBtn && eraserBtn && lightBtn && darkBtn) {
            rainbowBtn.style.backgroundColor = options.rainbow ? "red" : "";
            eraserBtn.style.backgroundColor = options.eraser ? "red" : "";
            lightBtn.style.backgroundColor = options.lighten ? "red" : "";
            darkBtn.style.backgroundColor = options.darken ? "red" : "";
        }
    }
    function colorGridUnit(e) {
        if (options.prevUnit === e.target || !options.mouseBtnHeld)
            return;
        if (e.target instanceof HTMLDivElement) {
            options.prevUnit = e.target;
            const rgbColor = e.target.style.backgroundColor;
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
                    e.target.style.backgroundColor = lightenHSLColor(convertRGBtoHSL(rgbColor));
                }
                else {
                    e.target.style.backgroundColor = lightenHSLColor(convertRGBtoHSL(options.bgColor));
                }
                return;
            }
            if (options.darken) {
                if (rgbColor) {
                    e.target.style.backgroundColor = darkenHSLColor(convertRGBtoHSL(rgbColor));
                }
                else {
                    e.target.style.backgroundColor = darkenHSLColor(convertRGBtoHSL(options.bgColor));
                }
                return;
            }
            e.target.style.backgroundColor = options.color;
        }
    }
    function getRandomColor() {
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);
        return `rgb(${red}, ${green}, ${blue})`;
    }
    function lightenHSLColor(inputColor) {
        const colorValues = inputColor.match(/\d+/g);
        if (colorValues) {
            let lightValue = +colorValues[2];
            lightValue =
                lightValue >= 100
                    ? 100
                    : 3 + lightValue + Math.round((100 - lightValue) / 10);
            return `hsl(${colorValues[0]} ${colorValues[1]}% ${lightValue}%)`;
        }
        else {
            throw new Error("Color Values array is null");
        }
    }
    function darkenHSLColor(inputColor) {
        const colorValues = inputColor.match(/\d+/g);
        if (colorValues) {
            let lightValue = +colorValues[2];
            lightValue =
                lightValue <= 0 ? 0 : lightValue - Math.round(lightValue / 10) - 3;
            return `hsl(${colorValues[0]}, ${colorValues[1]}%, ${lightValue}%)`;
        }
        else {
            throw new Error("Color Values array is null");
        }
    }
    const gridContainer = document.getElementById("grid__container");
    if (!(gridContainer instanceof HTMLDivElement))
        throw new Error("Grid Container element not found");
    const penColorInput = document.getElementById("pen-color__input");
    if (!(penColorInput instanceof HTMLInputElement))
        throw new Error("Pen Color Input element not found");
    const bgColorInput = document.getElementById("bg-color__input");
    if (!(bgColorInput instanceof HTMLInputElement))
        throw new Error("Background Color Input element not found");
    const rainbowBtn = document.getElementById("rainbow__btn");
    if (!(rainbowBtn instanceof HTMLButtonElement))
        throw new Error("Rainbow Button element not found");
    const eraserBtn = document.getElementById("eraser__btn");
    if (!(eraserBtn instanceof HTMLButtonElement))
        throw new Error("Eraser Button element not found");
    const lightBtn = document.getElementById("lighten__btn");
    if (!(lightBtn instanceof HTMLButtonElement))
        throw new Error("Lighten Button element not found");
    const darkBtn = document.getElementById("darken__btn");
    if (!(darkBtn instanceof HTMLButtonElement))
        throw new Error("Darken Button element not found");
    const clearBtn = document.getElementById("clear__btn");
    if (!(clearBtn instanceof HTMLButtonElement))
        throw new Error("Clear Button element not found");
    const sizeInput = document.getElementById("grid-size__input");
    if (!(sizeInput instanceof HTMLInputElement))
        throw new Error("Size Input element not found");
    gridContainer.addEventListener("mousemove", colorGridUnit);
    gridContainer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (e.button === 0) {
            options.mouseBtnHeld = true;
        }
    });
    window.addEventListener("mouseup", (e) => {
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
    createGrid(50);
}
initialize();
