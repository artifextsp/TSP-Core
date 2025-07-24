🎯 TSP-Core - Thinking Skills Program
Mostrar imagen
Mostrar imagen
Mostrar imagen
Sistema de videojuegos educativos con registro automático de progreso estudiantil
TSP-Core es una librería JavaScript que permite crear videojuegos educativos con integración automática a base de datos, sistema de puntajes inteligente y UI consistente para el programa Thinking Skills Program.
✨ Características

🎮 Desarrollo Rápido: Videojuegos funcionales en 15-30 minutos
📊 Registro Automático: Puntajes y progreso en tiempo real
🧠 Habilidades Cognitivas: Memoria, Atención, Lógica, Espacial, etc.
📈 Analytics Educativo: Datos estructurados para profesores
🎯 Sistema de Niveles: 10 niveles de dificultad (Explorador a Superestrella)
🔄 Escalable: Un archivo, infinitos videojuegos
📱 Responsive: Compatible con móviles y tablets

🚀 Quick Start
1. Incluir Librería
html<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- TSP-Core Library -->
<script src="https://artifextsp.github.io/TSP-Core/tsp-connector.js"></script>
2. Configurar Videojuego
javascriptconst tspGame = new TSPConnector({
    gameId: 'memory-cards',
    gameName: 'Memory Cards TSP',
    cognitiveSkill: 'Memoria'
});
3. Conectar Eventos
javascript// Al iniciar juego
tspGame.startGame();

// Al actualizar puntaje  
tspGame.updateScore(newScore, newLevel);

// Al terminar juego
tspGame.endGame('completed');
¡Listo! Tu videojuego ya tiene registro automático de puntajes y UI completa.
📚 Ejemplos

🎯 Ejemplo Básico - Plantilla minimalista
🧠 Juego de Memoria - Secuencias y patrones
🧩 Juego de Lógica - Razonamiento y patrones

📁 Estructura del Proyecto
TSP-Core/
├── index.html              # Documentación principal
├── tsp-connector.js         # Librería TSP  
├── examples/               # Videojuegos de ejemplo
│   ├── basic-game.html
│   ├── memory-game.html
│   └── logic-game.html
├── templates/              # Plantillas para desarrollo
│   └── game-template.html
└── README.md              # Este archivo
🎮 Tipos de Videojuegos Soportados
Habilidad CognitivaEjemplos de JuegosCaracterísticas🧠 MemoriaSecuencias, Parejas, RepeticiónRetención y recuperación👁️ AtenciónClasificación, Focus, BúsquedaConcentración sostenida🧩 LógicaPatrones, Secuencias, DeduccionesRazonamiento analítico📐 EspacialRotación, Orientación, VisualizaciónProcesamiento espacial⚡ VelocidadCálculo rápido, ReaccionesProcesamiento veloz🎯 EjecutivasPlanificación, InhibiciónControl cognitivo
🔧 API Reference
TSPConnector
javascriptconst tspGame = new TSPConnector(config);
Configuración
javascript{
    gameId: 'string',           // ID único del videojuego
    gameName: 'string',         // Nombre descriptivo  
    cognitiveSkill: 'string',   // Habilidad que ejercita
    targetElement: 'string'     // Selector CSS (opcional)
}
Métodos Principales
javascripttspGame.startGame()                    // Iniciar tracking
tspGame.updateScore(score, level)      // Actualizar progreso
tspGame.completeLevel()                // Completar nivel
tspGame.endGame(result)                // Finalizar juego
tspGame.saveManually()                 // Guardado manual
Sistema de Niveles TSP
NivelNombreEmojiDescripción1Explorador🌟Habilidades básicas2Aprendiz⚡Procesamiento inicial3Cazador🎯Atención focalizada4Aventurero🚀Pensamiento flexible5Maestro⭐Dominio cognitivo6Campeón🏆Excelencia mental7Experto💎Maestría avanzada8Leyenda🔥Rendimiento élite9Héroe👑Superdotación10Superestrella🌈Genialidad cognitiva
📊 Base de Datos
Estructura de Datos
sqlCREATE TABLE puntajes_tsp (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id TEXT NOT NULL,
    juego_id TEXT NOT NULL,
    juego_nombre TEXT NOT NULL,
    puntaje INTEGER NOT NULL,
    nivel_alcanzado INTEGER NOT NULL,
    tiempo_jugado INTEGER NOT NULL,
    completado BOOLEAN DEFAULT FALSE,
    habilidad_cognitiva TEXT NOT NULL,
    categoria_tsp TEXT NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dia_juego DATE DEFAULT CURRENT_DATE
);
Consultas Ejemplo
sql-- Progreso por estudiante
SELECT estudiante_id, AVG(puntaje) as promedio, MAX(nivel_alcanzado) as mejor_nivel
FROM puntajes_tsp 
GROUP BY estudiante_id;

-- Ranking por habilidad
SELECT habilidad_cognitiva, estudiante_id, SUM(puntaje) as total
FROM puntajes_tsp 
GROUP BY habilidad_cognitiva, estudiante_id
ORDER BY total DESC;
🛠️ Desarrollo
Requisitos

Navegador web moderno
Conexión a internet (para CDN)
Cuenta Supabase (gratuita)

Setup Local
bash# Clonar repositorio
git clone https://github.com/artifextsp/TSP-Core.git

# Abrir en servidor local
cd TSP-Core
python -m http.server 8000
# O usar Live Server en VS Code
Crear Nuevo Videojuego

Copiar templates/game-template.html
Personalizar configuración TSP
Implementar lógica del juego
Probar con estudiante test
Publicar en GitHub Pages

📈 Analytics y Reportes
Dashboard para Profesores
javascript// Obtener progreso de estudiante
const progress = await TSPAnalytics.getStudentProgress('estudiante_001');

// Estadísticas de clase
const classStats = await TSPAnalytics.getClassStats('clase_5a');

// Exportar datos
await TSPAnalytics.exportToCSV({ dateFrom: '2025-01-01' });
Métricas Disponibles

📊 Puntaje promedio por habilidad
📈 Progresión temporal del estudiante
🎯 Niveles completados por juego
⏱️ Tiempo promedio de sesión
🏆 Récords y logros alcanzados

🔐 Configuración
Variables de Entorno
javascript// En tsp-connector.js configurar:
const SUPABASE_CONFIG = {
    url: 'tu-proyecto-supabase-url',
    key: 'tu-anon-key'
};
Personalización UI
javascriptTSPConnector.configure({
    ui: {
        showBestScore: true,     // Mostrar récord del día
        showManualSave: true,    // Botón guardado manual  
        showNotifications: true, // Notificaciones popup
        autoSaveOnBest: true     // Auto-guardar récords
    }
});
🤝 Contribuir

Fork del repositorio
Crear branch para feature (git checkout -b feature/nueva-funcionalidad)
Commit de cambios (git commit -am 'Agregar nueva funcionalidad')
Push al branch (git push origin feature/nueva-funcionalidad)
Crear Pull Request

📝 Licencia
Este proyecto está bajo la Licencia MIT - ver LICENSE para detalles.
👥 Equipo
TSP Development Team

Desarrollo de videojuegos educativos
Sistemas de evaluación cognitiva
Analytics educativo

📞 Soporte

📧 Email: tsp@example.com
📚 Documentación: TSP-Core Docs
🐛 Issues: GitHub Issues
💬 Discusiones: GitHub Discussions


🎯 TSP-Core - Transformando la educación a través de videojuegos inteligentes
