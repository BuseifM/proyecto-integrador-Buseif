'use strict'
// Ejecuta la función principal al cargar completamente la página
window.onload = inicio;

function inicio() {
    // Referencias a los elementos del DOM obtenidas mediante sus identificadores
    const inputNombre = document.getElementById('nombre');
    const btnIntroducirNombre = document.getElementById('introducirNombre');
    const mensajeNombre = document.getElementById('mensajeNombre');
    const btnJugar = document.getElementById('jugar');
    const mensajeHeroe = document.getElementById('mensajeHeroe');
    const imagenDado = document.getElementById('imagenDado');
    const formularioDiv = document.getElementById('formulario');
    const juegoDiv = document.getElementById('juego');
    const boton = document.getElementById("boton");

    // Variables necesarias para controlar el estado del juego
    let nombre = '';
    let posicionHeroe = { x: 0, y: 0 };
    let numeroTiradas = 0;

    // Se recupera el récord almacenado en localStorage 
    let recordTiradas = localStorage.getItem('recordTiradas') ? parseInt(localStorage.getItem('recordTiradas')) : null;

    // Inicialización de valores auxiliares
    let dadoValor = 0;
    let tablero = [];
    let movimientosPosibles = [];

    // Función encargada de comprobar que el nombre sea válido
    function validarNombre(nom) {
        if (nom.length < 4) {
            return "El nombre debe tener 4 o más letras.";
        }
        if (/\d/.test(nom)) {
            return "Números no permitidos.";
        }
        return null;
    }
    // Se ejecuta al pulsar el botón para comenzar la partida
    function iniciarJuego() {
        const nom = inputNombre.value.trim();
        const error = validarNombre(nom);

        // Si hay un error se informa al usuario y se bloquea el botón de jugar hasta que corriga el error
        if (error) {
            mensajeNombre.textContent = error;
            btnJugar.disabled = true;
            return;
        }

        // Si todo es correcto se muestra el mensaje de bienvenida al partido
        nombre = nom;
        mensajeNombre.textContent = '';
        mensajeHeroe.textContent = `Bienvenido al partido: ${nombre}`;
        btnJugar.disabled = false;
    }
    // Genera el tablero 10x10 colocando los elementos iniciales
    function generarTablero() {
        tablero = Array.from({ length: 10 }, () => Array(10).fill('suelo'));

        tablero[0][0] = 'heroe';
        tablero[9][9] = 'cofre';
        posicionHeroe = { x: 0, y: 0 };

        // Recorre todas las celdas para asignar su contenido visual
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const celdaId = `${i}${j}`;
                const celda = document.getElementById(celdaId);

                // Limpia estilos y eventos previos
                celda.classList.remove('resaltado');
                celda.removeEventListener('click', moverHeroe);

                // Asigna la imagen correspondiente según la posición
                if (i === 0 && j === 0) {
                    celda.innerHTML = '<img src="./imagenes/balon.png" alt="Héroe">';
                } else if (i === 9 && j === 9) {
                    celda.innerHTML = '<img src="./imagenes/porteria.png" alt="Cofre">';
                } else {
                    celda.innerHTML = '<img src="./imagenes/sueloCesped.png" alt="Suelo">';
                }
            }
        }
        numeroTiradas = 0;
    }
    // Simula la tirada del dado y muestra los movimientos disponibles
    function tirarDado() {
        console.log("Se tira el dado");

        // Genera un número aleatorio entre 1 y 6
        dadoValor = Math.floor(Math.random() * 6) + 1;
        imagenDado.src = `./imagenes/dado${dadoValor}.png`;
        numeroTiradas++;

        // Elimina resaltados y eventos anteriores
        document.querySelectorAll('#tabla td').forEach(td => td.classList.remove('resaltado'));
        document.querySelectorAll('#tabla td').forEach(td => td.removeEventListener('click', moverHeroe));

        // Calcula y muestra las nuevas posiciones posibles
        calcularMovimientosPosibles();
        resaltarCeldas();
    }
    // Calcula todas las posiciones a las que el héroe puede desplazarse
    function calcularMovimientosPosibles() {
        movimientosPosibles = [];
        const { x, y } = posicionHeroe;

        for (let i = 1; i <= dadoValor; i++) {
            if (y + i < 10) movimientosPosibles.push({ x, y: y + i });
            if (y - i >= 0) movimientosPosibles.push({ x, y: y - i });
        }

        for (let i = 1; i <= dadoValor; i++) {
            if (x + i < 10) movimientosPosibles.push({ x: x + i, y });
            if (x - i >= 0) movimientosPosibles.push({ x: x - i, y });
        }
    }
    // Marca visualmente las celdas disponibles a las cuales podemos ir
    function resaltarCeldas() {
        movimientosPosibles.forEach(pos => {
            const celdaId = `${pos.x}${pos.y}`;
            const celda = document.getElementById(celdaId);
            if (celda) {
                celda.classList.add('resaltado');
                celda.addEventListener('click', moverHeroe);
            }
        });
    }
    // Gestiona el desplazamiento del héroe en el tablero
    function moverHeroe(event) {
        const celda = event.target.closest('td');
        if (!celda) return;

        const celdaId = celda.id;
        const nuevaX = parseInt(celdaId[0]);
        const nuevaY = parseInt(celdaId[1]);

        // Actualiza la celda anterior del héroe
        const celdaAnteriorId = `${posicionHeroe.x}${posicionHeroe.y}`;
        const celdaAnterior = document.getElementById(celdaAnteriorId);
        celdaAnterior.innerHTML = '<img src="./imagenes/sueloCesped.png" alt="Suelo">';
        tablero[posicionHeroe.x][posicionHeroe.y] = 'suelo';

        // Coloca el héroe en la nueva posición
        posicionHeroe = { x: nuevaX, y: nuevaY };
        celda.innerHTML = '<img src="./imagenes/balon.png" >';
        tablero[nuevaX][nuevaY] = 'heroe';

        // Limpia todos los resaltados activos
        document.querySelectorAll('#tabla td').forEach(td => {
            td.classList.remove('resaltado');
            td.removeEventListener('click', moverHeroe);
        });

        // Comprueba si se ha alcanzado la casilla final
        if (nuevaX === 9 && nuevaY === 9) {
            setTimeout(() => {
                let mensajeVictoria = `¡Felicidades, ${nombre}! Has marcado gol en ${numeroTiradas} tiradas.`;

                // Actualiza el récord si se ha mejorado
                if (recordTiradas === null || numeroTiradas < recordTiradas) {
                    recordTiradas = numeroTiradas;
                    localStorage.setItem('recordTiradas', recordTiradas);
                    mensajeVictoria += `\n¡NUEVO RÉCORD: ${recordTiradas}!`;
                } else {
                    mensajeVictoria += `\nRécord no superado, el record actual es ${recordTiradas}.`;
                }

                alert(mensajeVictoria);
                reiniciarPartida();
            }, 100);
        }
    }
    // Reinicia el tablero manteniendo el récord 
    function reiniciarPartida() {
        let celdaCofre = document.getElementById("99");
        celdaCofre.innerHTML = '<img src="./imagenes/porteria.png" alt="Cofre">';
        tablero[9][9] = 'cofre';

        let celdaInicio = document.getElementById("00");
        celdaInicio.innerHTML = '<img src="./imagenes/balon.png" alt="Héroe">';
        tablero[0][0] = 'heroe';

        posicionHeroe = { x: 0, y: 0 };
        numeroTiradas = 0;

        mensajeHeroe.textContent = `¡${nombre}! El récord actual es ${recordTiradas === null ? 'ninguno' : recordTiradas}.`;
    }
    // Evento para validar el nombre introducido
    btnIntroducirNombre.addEventListener('click', iniciarJuego);

    // Muestra la pantalla del juego y oculta el formulario inicial
    btnJugar.addEventListener('click', () => {
        juegoDiv.style.display = 'block';
        formularioDiv.style.display = 'none';
        generarTablero();

        if (recordTiradas !== null) {
            mensajeHeroe.textContent += ` (Récord: ${recordTiradas} tiradas).`;
        }
    });
    boton.addEventListener("click", tirarDado);
}
