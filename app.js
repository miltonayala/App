const http = require('http');
const os = require('os');

const PORT = 3000;

const page = () => `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Portal Estudiantil - Docker Lab</title>
    <style>
        :root {
            --azul: #0b3d91;
            --azul-oscuro: #072a66;
            --dorado: #f2b705;
            --fondo: #eef2f7;
            --texto: #1f2937;
            --gris: #6b7280;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--fondo);
            color: var(--texto);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            background: linear-gradient(90deg, var(--azul-oscuro), var(--azul));
            color: #fff;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 4px solid var(--dorado);
        }
        .marca { font-size: 1.25rem; font-weight: 700; letter-spacing: .5px; }
        .marca span { color: var(--dorado); }
        nav a {
            color: #dbe7ff;
            text-decoration: none;
            margin-left: 18px;
            font-size: .92rem;
        }
        nav a:hover { color: #fff; text-decoration: underline; }
        main {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1.4fr;
            gap: 24px;
            padding: 32px 24px;
            max-width: 1100px;
            width: 100%;
            margin: 0 auto;
        }
        .card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(11, 61, 145, .10);
            padding: 24px;
        }
        .card h2 {
            margin: 0 0 16px;
            font-size: 1.1rem;
            color: var(--azul);
            border-bottom: 2px solid var(--dorado);
            padding-bottom: 8px;
        }
        label { display: block; font-size: .85rem; color: var(--gris); margin-top: 12px; }
        input {
            width: 100%;
            padding: 10px;
            margin-top: 4px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: .95rem;
        }
        button {
            margin-top: 18px;
            width: 100%;
            padding: 11px;
            background: var(--azul);
            color: #fff;
            border: 0;
            border-radius: 4px;
            font-size: .95rem;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover { background: var(--azul-oscuro); }
        .ayuda { font-size: .8rem; color: var(--gris); margin-top: 12px; }
        .perfil p { margin: 6px 0; font-size: .92rem; }
        .perfil strong { color: var(--azul); }
        table { width: 100%; border-collapse: collapse; font-size: .9rem; }
        th, td { text-align: left; padding: 9px 8px; border-bottom: 1px solid #e5e7eb; }
        th { color: var(--azul); background: #f8fafc; }
        .estado {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: .75rem;
            background: #dcfce7;
            color: #166534;
        }
        .estado.pendiente { background: #fef9c3; color: #854d0e; }
        footer {
            text-align: center;
            font-size: .78rem;
            color: var(--gris);
            padding: 16px;
        }
        code { background: #e5e7eb; padding: 1px 5px; border-radius: 3px; }
        @media (max-width: 760px) {
            main { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <div class="marca">Portal <span>Estudiantil</span> &middot; Docker Lab</div>
        <nav>
            <a href="#">Inicio</a>
            <a href="#">Mis cursos</a>
            <a href="#">Notas</a>
            <a href="#">Salir</a>
        </nav>
    </header>

    <main>
        <section class="card">
            <h2>Ingreso al sistema</h2>
            <form onsubmit="event.preventDefault(); this.nextElementSibling.textContent = 'Demo: no hay autenticación en este laboratorio.';">
                <label for="carnet">Carnet</label>
                <input id="carnet" name="carnet" placeholder="Ej. 00-0000-2026" autocomplete="off">
                <label for="clave">Contraseña</label>
                <input id="clave" name="clave" type="password" placeholder="••••••••">
                <button type="submit">Entrar</button>
            </form>
            <p class="ayuda"></p>
        </section>

        <section class="card">
            <h2>Panel del estudiante</h2>
            <div class="perfil">
                <p><strong>Estudiante:</strong> Estudiante de Laboratorio</p>
                <p><strong>Carrera:</strong> Ingeniería en Sistemas</p>
                <p><strong>Ciclo:</strong> 2026</p>
                <p><strong>Contenedor:</strong> <code>${os.hostname()}</code></p>
            </div>
            <table>
                <thead>
                    <tr><th>Curso</th><th>Tema</th><th>Estado</th></tr>
                </thead>
                <tbody>
                    <tr><td>ASN20261</td><td>Docker: imágenes y contenedores</td><td><span class="estado">Activo</span></td></tr>
                    <tr><td>ASN20261</td><td>Dockerfile y capas</td><td><span class="estado">Activo</span></td></tr>
                    <tr><td>ASN20261</td><td>Redes y volúmenes</td><td><span class="estado pendiente">Pendiente</span></td></tr>
                </tbody>
            </table>
        </section>
    </main>

    <footer>
        Página de demostración para el laboratorio Docker Lab &middot; No es un sistema oficial &middot; 2026
    </footer>
</body>
</html>`;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', host: os.hostname() }) + '\n');
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page());
});

server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
