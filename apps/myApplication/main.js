/**
 * CONTRATO DE ENTRADA
 * @param {HTMLElement} gui - El div (.window__content) donde se ven los elemento de la app.
 * @param {Object} win - La instancia para que la app pueda cerrarse o redimensionarse sola.
 * @param {Object} core - Un objeto con funciones globales (como guardar archivos, obtener valores generales del sistema).
 */

// main.js de la aplicación "Contador"
export const init = async (gui, win, core) => {
    // --- La Interfaz (HTML) ---
    gui.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <h1 id="counter-display">0</h1>
            <button id="btn-add">Incrementar</button>
            <button id="btn-reset">Reset</button>
        </div>
    `;

    // --- Variables de Estado ---
    // Estas variables solo viven dentro de esta instancia de la app
    let count = 0;

    // --- Selección de Elementos ---
    // Muy importante: usa 'gui.querySelector' y no 'document.querySelector'
    // para no confundirte con otras ventanas abiertas.
    const display = gui.querySelector('#counter-display');
    const btnAdd = gui.querySelector('#btn-add');
    const btnReset = gui.querySelector('#btn-reset');

    display.style.color = "black"

    // --- La Lógica (Eventos y Funciones) ---
    const updateDisplay = () => {
        display.innerText = count;
        // Si el número es grande, cambiamos el color (lógica de la app)
        display.style.color = count > 10 ? 'orange' : 'black';
    };

    btnAdd.onclick = () => {
        count++;
        updateDisplay();
        console.log(`Contador de la ventana ${win.id}: ${count}`);
    };

    btnReset.onclick = () => {
        count = 0;
        updateDisplay();
    };

    // --- Uso del objeto 'win' ---
    // Podemos hacer que el título de la ventana cambie según el contador
    win.onresize = function(width, height) {
        console.log("La ventana se redimensionó a:", width, height);
    };
};
