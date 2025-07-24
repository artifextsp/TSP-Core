/**
 * TSP-CONNECTOR.JS v1.0
 * Thinking Skills Program - Librería Universal de Conexión a Supabase
 * 
 * Uso: Incluir en cualquier videojuego TSP para registro automático de puntajes
 * Autor: TSP Development Team
 * Fecha: Enero 2025
 */

// ============= CONFIGURACIÓN GLOBAL TSP =============
window.TSP_CONFIG = {
    // Credenciales Supabase (configurar una sola vez)
    supabase: {
        url: 'https://kryqjsncqsopjuwymhqd.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeXFqc25jcXNvcGp1d3ltaHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjM3MDEsImV4cCI6MjA2ODg5OTcwMX0.w5HiaFiqlFJ_3QbcprUrufsOXTDWFg1zUMl2J7kWD6Y'
    },
    
    // Niveles TSP estándar
    levels: {
        1: '🌟 Explorador',
        2: '⚡ Aprendiz', 
        3: '🎯 Cazador',
        4: '🚀 Aventurero',
        5: '⭐ Maestro',
        6: '🏆 Campeón',
        7: '💎 Experto',
        8: '🔥 Leyenda',
        9: '👑 Héroe',
        10: '🌈 Superestrella'
    },
    
    // Configuración UI
    ui: {
        showBestScore: true,
        showManualSave: true,
        showNotifications: true,
        autoSaveOnBest: true
    }
}

// ============= CLASE PRINCIPAL TSP CONNECTOR =============
class TSPConnector {
    constructor(gameConfig) {
        // Configuración del juego específico
        this.gameId = gameConfig.gameId
        this.gameName = gameConfig.gameName
        this.cognitiveSkill = gameConfig.cognitiveSkill
        this.targetElement = gameConfig.targetElement || 'body'
        
        // Estado del juego
        this.studentId = this.getStudentId()
        this.currentScore = 0
        this.currentLevel = 1
        this.todayBestScore = 0
        this.todayBestLevel = 1
        this.startTime = null
        this.gameActive = false
        
        // Callbacks del juego (opcionales)
        this.onScoreUpdate = gameConfig.onScoreUpdate || (() => {})
        this.onLevelComplete = gameConfig.onLevelComplete || (() => {})
        this.onGameEnd = gameConfig.onGameEnd || (() => {})
        
        this.initialize()
    }

    // ============= INICIALIZACIÓN =============
    async initialize() {
        try {
            // Verificar que Supabase esté disponible
            if (!window.supabase) {
                throw new Error('Supabase no está cargado. Incluir: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')
            }
            
            // Inicializar cliente Supabase
            this.supabase = window.supabase.createClient(
                window.TSP_CONFIG.supabase.url,
                window.TSP_CONFIG.supabase.key
            )
            
            // Cargar mejor puntaje del día
            await this.loadTodayBestScore()
            
            // Crear UI si está habilitada
            if (window.TSP_CONFIG.ui.showBestScore || window.TSP_CONFIG.ui.showManualSave) {
                this.createTSPUI()
            }
            
            console.log('🎯 TSP Connector inicializado para:', this.gameName)
            
        } catch (error) {
            console.error('❌ Error inicializando TSP Connector:', error)
            this.showNotification('Error de conexión TSP', 'error')
        }
    }

    getStudentId() {
        // Múltiples métodos para obtener ID del estudiante
        const urlParams = new URLSearchParams(window.location.search)
        const urlStudent = urlParams.get('student') || urlParams.get('estudiante')
        const localStudent = localStorage.getItem('tsp_student_id')
        const sessionStudent = sessionStorage.getItem('tsp_current_student')
        
        // Prioridad: URL → localStorage → sessionStorage → prompt
        return urlStudent || localStudent || sessionStudent || this.promptForStudentId()
    }

    promptForStudentId() {
        const studentId = prompt('TSP - Ingresa tu ID de estudiante:')
        if (studentId) {
            sessionStorage.setItem('tsp_current_student', studentId)
            return studentId
        }
        return `estudiante_${Date.now()}`
    }

    async loadTodayBestScore() {
        try {
            const today = new Date().toISOString().split('T')[0]
            
            const { data, error } = await this.supabase
                .from('puntajes_tsp')
                .select('puntaje, nivel_alcanzado')
                .eq('estudiante_id', this.studentId)
                .eq('juego_id', this.gameId)
                .eq('dia_juego', today)
                .order('puntaje', { ascending: false })
                .limit(1)

            if (data && data.length > 0) {
                this.todayBestScore = data[0].puntaje
                this.todayBestLevel = data[0].nivel_alcanzado
                this.updateBestScoreDisplay()
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar récord del día:', error)
        }
    }

    // ============= MÉTODOS PRINCIPALES DEL JUEGO =============
    
    startGame() {
        this.gameActive = true
        this.startTime = Date.now()
        this.currentScore = 0
        this.currentLevel = 1
        console.log('🚀 Juego TSP iniciado:', this.gameName)
    }

    updateScore(newScore, newLevel = null) {
        this.currentScore = newScore
        if (newLevel !== null) this.currentLevel = newLevel
        
        // Actualizar UI
        this.updateScoreDisplays()
        
        // Callback personalizado del juego
        this.onScoreUpdate(this.currentScore, this.currentLevel)
        
        // Verificar nuevo récord
        if (this.isNewBestScore()) {
            this.showNewRecordEffect()
        }
    }

    completeLevel() {
        this.onLevelComplete(this.currentLevel)
        
        // Auto-save en completar nivel si está habilitado
        if (window.TSP_CONFIG.ui.autoSaveOnBest && this.isNewBestScore()) {
            this.saveProgressAuto('level_completed')
        }
    }

    endGame(result = 'completed') {
        this.gameActive = false
        this.onGameEnd(result, this.currentScore, this.currentLevel)
        
        // Auto-save al terminar juego
        this.saveProgressAuto(result)
    }

    // ============= SISTEMA DE GUARDADO INTELIGENTE =============
    
    async saveProgressAuto(trigger) {
        // Solo guardar si es mejor puntaje O primer intento del día
        if (this.currentScore <= this.todayBestScore && this.todayBestScore > 0) {
            console.log(`📊 Puntaje ${this.currentScore} no supera récord ${this.todayBestScore}`)
            this.showNotification('📊 Puntaje no mejorado', 'info')
            return false
        }

        return await this.saveToSupabase(trigger, false)
    }

    async saveManually() {
        console.log('💾 Guardado manual solicitado')
        return await this.saveToSupabase('manual_save', true)
    }

    async saveToSupabase(trigger, forceUpdate = false) {
        const playTime = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0
        const today = new Date().toISOString().split('T')[0]
        
        const gameData = {
            estudiante_id: this.studentId,
            juego_id: this.gameId,
            juego_nombre: this.gameName,
            puntaje: this.currentScore,
            nivel_alcanzado: this.currentLevel,
            tiempo_jugado: playTime,
            completado: trigger === 'level_completed' || trigger === 'completed',
            habilidad_cognitiva: this.cognitiveSkill,
            categoria_tsp: this.getLevelName(this.currentLevel),
            fecha_hora: new Date().toISOString(),
            dia_juego: today
        }

        try {
            const { data, error } = await this.supabase
                .from('puntajes_tsp')
                .upsert(gameData, {
                    onConflict: 'estudiante_id,juego_id,dia_juego'
                })
                .select()

            if (error) throw error

            // Actualizar récords locales
            if (this.currentScore > this.todayBestScore || forceUpdate) {
                this.todayBestScore = this.currentScore
                this.todayBestLevel = this.currentLevel
                this.updateBestScoreDisplay()
            }

            const message = forceUpdate ? 
                '💾 Progreso guardado manualmente' : 
                '🏆 ¡Nuevo récord guardado!'
            
            this.showNotification(message, 'success')
            console.log('✅ Datos TSP guardados:', gameData)
            return true

        } catch (error) {
            console.error('❌ Error guardando en TSP:', error)
            this.showNotification(`⚠️ Error: ${error.message}`, 'error')
            return false
        }
    }

    // ============= MÉTODOS AUXILIARES =============
    
    isNewBestScore() {
        return this.currentScore > this.todayBestScore || 
               (this.currentScore === this.todayBestScore && this.currentLevel > this.todayBestLevel)
    }

    getLevelName(level) {
        return window.TSP_CONFIG.levels[Math.min(level, 10)] || '🌟 Explorador'
    }

    // ============= INTERFAZ DE USUARIO =============
    
    createTSPUI() {
        // Crear header TSP
        const headerHTML = `
            <div id="tsp-header" class="tsp-header">
                <div class="tsp-game-info">
                    <h2>🎯 ${this.gameName}</h2>
                    <p><strong>Habilidad:</strong> ${this.cognitiveSkill}</p>
                </div>
                
                <div class="tsp-progress">
                    <span>👤 <span id="tsp-student-name">${this.studentId}</span></span>
                    <span>🏆 Nivel: <span id="tsp-current-level">${this.currentLevel}</span></span>
                    <span>⭐ Puntaje: <span id="tsp-current-score">${this.currentScore}</span></span>
                </div>
                
                <div id="tsp-best-score" class="tsp-best-score" style="display: none;">
                    💎 Mejor del día: <span id="tsp-best-value">0</span> puntos (Nivel <span id="tsp-best-level">1</span>)
                </div>
            </div>
        `
        
        // Insertar en el elemento objetivo
        const target = document.querySelector(this.targetElement) || document.body
        target.insertAdjacentHTML('afterbegin', headerHTML)
        
        // Crear botón de guardado manual si está habilitado
        if (window.TSP_CONFIG.ui.showManualSave) {
            this.createManualSaveButton()
        }
        
        // Agregar estilos
        this.addTSPStyles()
    }

    createManualSaveButton() {
        const saveButtonHTML = `
            <button id="tsp-manual-save" class="tsp-save-btn">
                💾 Registrar Progreso
            </button>
        `
        
        // Buscar dónde insertar el botón
        const gameFooter = document.querySelector('.game-footer') || 
                         document.querySelector('.game-controls') ||
                         document.querySelector('#tsp-header')
        
        if (gameFooter) {
            gameFooter.insertAdjacentHTML('beforeend', saveButtonHTML)
            
            // Agregar event listener
            document.getElementById('tsp-manual-save').onclick = () => this.saveManually()
        }
    }

    updateScoreDisplays() {
        const currentScoreEl = document.getElementById('tsp-current-score')
        const currentLevelEl = document.getElementById('tsp-current-level')
        
        if (currentScoreEl) currentScoreEl.textContent = this.currentScore
        if (currentLevelEl) currentLevelEl.textContent = this.currentLevel
    }

    updateBestScoreDisplay() {
        if (!window.TSP_CONFIG.ui.showBestScore) return
        
        const bestScoreEl = document.getElementById('tsp-best-score')
        const bestValueEl = document.getElementById('tsp-best-value')
        const bestLevelEl = document.getElementById('tsp-best-level')
        
        if (bestScoreEl && this.todayBestScore > 0) {
            bestScoreEl.style.display = 'block'
            if (bestValueEl) bestValueEl.textContent = this.todayBestScore
            if (bestLevelEl) bestLevelEl.textContent = this.todayBestLevel
        }
    }

    showNewRecordEffect() {
        const header = document.getElementById('tsp-header')
        if (header) {
            header.classList.add('tsp-new-record')
            setTimeout(() => header.classList.remove('tsp-new-record'), 2000)
        }
    }

    showNotification(message, type = 'info') {
        if (!window.TSP_CONFIG.ui.showNotifications) return
        
        const notification = document.createElement('div')
        notification.className = `tsp-notification ${type}`
        notification.textContent = message
        document.body.appendChild(notification)
        
        setTimeout(() => notification.remove(), 4000)
    }

    addTSPStyles() {
        if (document.getElementById('tsp-styles')) return
        
        const styles = document.createElement('style')
        styles.id = 'tsp-styles'
        styles.textContent = `
            .tsp-header {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin: 10px;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            
            .tsp-game-info h2 {
                margin: 0 0 5px 0;
                font-size: 1.5em;
            }
            
            .tsp-game-info p {
                margin: 0;
                opacity: 0.9;
            }
            
            .tsp-progress {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                font-weight: bold;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .tsp-best-score {
                background: linear-gradient(135deg, #FF9800, #F57C00);
                padding: 12px;
                border-radius: 8px;
                margin-top: 15px;
                text-align: center;
                font-weight: bold;
            }
            
            .tsp-save-btn {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                margin: 10px;
                transition: transform 0.2s ease;
            }
            
            .tsp-save-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
            }
            
            .tsp-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: tspSlideIn 0.4s ease-out;
            }
            
            .tsp-notification.success {
                background: linear-gradient(135deg, #4CAF50, #45a049);
            }
            
            .tsp-notification.error {
                background: linear-gradient(135deg, #F44336, #e53935);
            }
            
            .tsp-notification.info {
                background: linear-gradient(135deg, #2196F3, #1976D2);
            }
            
            .tsp-new-record {
                animation: tspRecordPulse 2s ease-in-out;
            }
            
            @keyframes tspSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes tspRecordPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5); }
            }
            
            @media (max-width: 768px) {
                .tsp-progress {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .tsp-header {
                    margin: 5px;
                    padding: 15px;
                }
            }
        `
        document.head.appendChild(styles)
    }
}

// ============= MÉTODOS ESTÁTICOS ÚTILES =============
TSPConnector.createQuickGame = function(gameId, gameName, cognitiveSkill) {
    return new TSPConnector({
        gameId: gameId,
        gameName: gameName,
        cognitiveSkill: cognitiveSkill
    })
}

TSPConnector.configure = function(newConfig) {
    window.TSP_CONFIG = { ...window.TSP_CONFIG, ...newConfig }
}

// ============= INICIALIZACIÓN AUTOMÁTICA =============
window.TSPConnector = TSPConnector

// Exponer configuración global
window.TSP = {
    Connector: TSPConnector,
    config: window.TSP_CONFIG
}

console.log('📚 TSP-Connector.js v1.0 cargado exitosamente')

// ============= EVENTOS DE DOCUMENTOS =============
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 TSP System ready - Documenta available para integración')
})
