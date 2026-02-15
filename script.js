/**
 * NextStep.ai - Enhanced JavaScript Module
 * Gestión mejorada de mapas, animaciones y funcionalidades interactivas
 */

class NextStepApp {
    constructor() {
        this.isLoading = false;
        this.loadedMaps = new Set();
        this.animationObserver = null;
        this.scrollTracker = null;
        this.init();
    }

    init() {
        this.setupScrollTracker();
        this.setupAnimationObserver();
        this.setupNavigation();
        this.setupCalculator();
        this.setupLoadingStates();
        this.setupErrorHandling();
        this.bootstrapCharts();
    }

    // =============================================
    // GESTIÓN DE SCROLL Y NAVEGACIÓN
    // =============================================
    setupScrollTracker() {
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Añadir clase 'scrolled' al navbar
            if (currentScrollY > 100) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            // Ocultar/mostrar navbar en scroll
            if (currentScrollY > 200) {
                if (currentScrollY > lastScrollY) {
                    navbar?.style.setProperty('transform', 'translateY(-100%)');
                } else {
                    navbar?.style.setProperty('transform', 'translateY(0)');
                }
            }
            
            lastScrollY = currentScrollY;
        };

        // Throttled scroll handler
        let ticking = false;
        this.scrollTracker = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', this.scrollTracker, { passive: true });
    }

    setupNavigation() {
        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Toggle menú móvil
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Cerrar menú al hacer click en un enlace
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
        }
    }

    // =============================================
    // GESTIÓN DE MAPAS MEJORADA
    // =============================================
    async renderMap(containerId, dataUrl, geojsonUrl, colorScale, options = {}) {
        const container = document.getElementById(containerId);
        if (!container || this.loadedMaps.has(containerId)) return;

        try {
            this.showLoadingState(containerId, 'Cargando mapa interactivo...');
            
            const [geojsonResp, datosResp] = await Promise.all([
                this.fetchWithRetry(geojsonUrl),
                this.fetchWithRetry(dataUrl)
            ]);
            
            if (!geojsonResp.ok || !datosResp.ok) {
                throw new Error('Error al cargar datos del mapa');
            }
            
            const geojson = await geojsonResp.json();
            const datos = await datosResp.json();
            
            const trace = {
                type: 'choroplethmapbox',
                geojson: geojson,
                locations: datos.locations,
                z: datos.z,
                featureidkey: 'id',
                colorscale: colorScale,
                hovertext: datos.hover_names,
                marker: { 
                    opacity: options.opacity || 0.8, 
                    line: { width: 0 } 
                },
                hovertemplate: '<b>%{hovertext}</b><br>Valor: %{z}<extra></extra>'
            };
            
            const layout = {
                ...datos.layout,
                margin: { t: 10, b: 10, l: 10, r: 10 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                mapbox: {
                    ...datos.layout.mapbox,
                    style: "carto-darkmatter",
                },
                coloraxis: { 
                    showscale: options.showScale || false,
                    colorbar: {
                        bgcolor: 'rgba(0,0,0,0.8)',
                        bordercolor: 'rgba(255,255,255,0.2)',
                        borderwidth: 1
                    }
                },
                dragmode: 'zoom',
                font: {
                    family: 'Space Grotesk, sans-serif',
                    color: '#F8FAFC'
                }
            };
            
            const config = { 
                responsive: true, 
                displayModeBar: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                displaylogo: false
            };
            
            await Plotly.newPlot(containerId, [trace], layout, config);
            this.loadedMaps.add(containerId);
            this.hideLoadingState(containerId);
            this.addMapSuccessAnimation(containerId);
            
        } catch (error) {
            console.error(`Error al cargar mapa en ${containerId}:`, error);
            this.showMapError(containerId, error.message);
        }
    }

    // =============================================
    // GRÁFICOS PLOTLY (Figuras exportadas en JSON)
    // =============================================
    bootstrapCharts() {
        if (typeof Plotly === 'undefined') return;

        const chartTargets = [
            { id: 'chart-taxis-mes', url: 'data/taxis_mes.json' },
            { id: 'chart-retencion-dia-taxis', url: 'data/retention_dia_taxis.json' },
            { id: 'chart-boxplot-lluvia', url: 'data/boxplot_pickups_lluvia.json', options: { forceXAxis: true, extraBottomMargin: 110 } },
            { id: 'chart-scatter-propinas', url: 'data/scatter_propinas.json' },
            { id: 'chart-hist-propinas', url: 'data/histograma_propinas.json' },
            { id: 'chart-figura-13', url: 'data/figura_13.json' },
            { id: 'chart-figura-14', url: 'data/figura_14.json' },
            { id: 'chart-figura-15', url: 'data/figura_15.json' },
            { id: 'chart-figura-16', url: 'data/figura_16.json' },
            { id: 'chart-figura-17', url: 'data/figura_17.json' },
            { id: 'chart-figura-18', url: 'data/figura_18.json' },
            { id: 'chart-figura-20', url: 'data/figura_20.json' },
            { id: 'chart-figura-21', url: 'data/figura_21.json' },
            { id: 'chart-figura-22', url: 'data/figura_22.json' }
        ];

        chartTargets.forEach(({ id, url, options }) => {
            const container = document.getElementById(id);
            if (container && !this.loadedMaps.has(id)) {
                this.renderFigure(id, url, options);
            }
        });
    }

    async renderFigure(containerId, figureUrl, options = {}) {
        const container = document.getElementById(containerId);
        if (!container || this.loadedMaps.has(containerId)) return;

        try {
            if (typeof Plotly === 'undefined') {
                throw new Error('Plotly no está disponible en esta página');
            }

            this.showLoadingState(containerId, 'Cargando gráfico...');

            const figResp = await this.fetchWithRetry(figureUrl);
            if (!figResp.ok) {
                throw new Error('Error al cargar datos del gráfico');
            }

            const figRaw = await figResp.json();
            const data = Array.isArray(figRaw.data)
                ? figRaw.data.map(trace => this.decodePlotlyBinaryArrays(trace))
                : [];

            const layout = this.applyDarkThemeToFigureLayout(figRaw.layout || {}, options);
            const config = {
                responsive: true,
                displayModeBar: false,
                displaylogo: false
            };

            await Plotly.newPlot(containerId, data, layout, config);
            Plotly.Plots.resize(containerId);
            this.loadedMaps.add(containerId);
            this.hideLoadingState(containerId);
            this.addMapSuccessAnimation(containerId);

        } catch (error) {
            console.error(`Error al cargar gráfico en ${containerId}:`, error);
            this.showChartError(containerId, error.message);
        }
    }

    decodePlotlyBinaryArrays(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.decodePlotlyBinaryArrays(v));
        }

        if (!value || typeof value !== 'object') {
            return value;
        }

        if (Object.prototype.hasOwnProperty.call(value, 'dtype') && Object.prototype.hasOwnProperty.call(value, 'bdata')) {
            const typed = this.decodeTypedArray(value.dtype, value.bdata);
            const shape = this.parsePlotlyShape(value.shape);

            if (shape && shape.length > 0) {
                return this.reshapeArray(Array.from(typed), shape);
            }

            return typed;
        }

        const decoded = {};
        for (const [key, val] of Object.entries(value)) {
            decoded[key] = this.decodePlotlyBinaryArrays(val);
        }
        return decoded;
    }

    decodeTypedArray(dtype, bdata) {
        const binaryString = atob(bdata);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const buffer = bytes.buffer;

        switch (dtype) {
            case 'i1': return new Int8Array(buffer);
            case 'i2': return new Int16Array(buffer);
            case 'i4': return new Int32Array(buffer);
            case 'u1': return new Uint8Array(buffer);
            case 'u2': return new Uint16Array(buffer);
            case 'u4': return new Uint32Array(buffer);
            case 'f4': return new Float32Array(buffer);
            case 'f8': return new Float64Array(buffer);
            default:
                // Fallback: devolver bytes si el tipo es desconocido
                return new Uint8Array(buffer);
        }
    }

    parsePlotlyShape(shape) {
        if (!shape) return null;

        if (Array.isArray(shape)) {
            const dims = shape.map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
            return dims.length ? dims : null;
        }

        if (typeof shape === 'string') {
            const dims = shape
                .split(',')
                .map(s => Number(s.trim()))
                .filter(n => Number.isFinite(n) && n > 0);
            return dims.length ? dims : null;
        }

        return null;
    }

    reshapeArray(flatArray, shape) {
        if (!shape || shape.length === 0) {
            return flatArray;
        }

        if (shape.length === 1) {
            return flatArray.slice(0, shape[0]);
        }

        const [rows, ...rest] = shape;
        const chunkSize = rest.reduce((acc, dim) => acc * dim, 1);
        const matrix = [];

        for (let i = 0; i < rows; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;
            matrix.push(this.reshapeArray(flatArray.slice(start, end), rest));
        }

        return matrix;
    }

    applyDarkThemeToFigureLayout(layout, options = {}) {
        const themed = { ...layout };
        delete themed.template;

        themed.margin = themed.margin || { t: 50, b: 45, l: 55, r: 20 };
        themed.paper_bgcolor = 'rgba(0,0,0,0)';
        themed.plot_bgcolor = 'rgba(0,0,0,0)';
        themed.autosize = true;
        delete themed.width;
        delete themed.height;
        themed.font = {
            ...(themed.font || {}),
            family: 'Space Grotesk, sans-serif',
            color: '#F8FAFC'
        };

        const axisBase = (axis) => ({
            ...(axis || {}),
            gridcolor: 'rgba(255,255,255,0.06)',
            zerolinecolor: 'rgba(255,255,255,0.12)',
            linecolor: 'rgba(255,255,255,0.12)',
            tickfont: { ...(axis?.tickfont || {}), color: '#CBD5E1' },
            title: axis?.title
                ? { ...(axis.title || {}), font: { ...(axis.title.font || {}), color: '#F8FAFC' } }
                : axis?.title
        });

        themed.xaxis = axisBase(themed.xaxis);
        themed.yaxis = axisBase(themed.yaxis);

        if (options.forceXAxis) {
            themed.xaxis = {
                ...(themed.xaxis || {}),
                showticklabels: true,
                ticks: 'outside',
                showline: true,
                tickfont: { ...(themed.xaxis?.tickfont || {}), size: 12, color: '#E2E8F0' }
            };
        }

        if (options.extraBottomMargin) {
            themed.margin = {
                ...(themed.margin || {}),
                b: Math.max(themed.margin?.b || 0, options.extraBottomMargin)
            };
        }

        if (options.title) {
            themed.title = { ...(themed.title || {}), text: options.title };
        }

        if (themed.title?.text) {
            themed.margin = {
                ...(themed.margin || {}),
                t: Math.max((themed.margin && themed.margin.t) || 0, 80)
            };
        }

        if (themed.legend) {
            themed.legend = {
                ...(themed.legend || {}),
                orientation: 'h',
                yanchor: 'top',
                y: -0.2,
                xanchor: 'center',
                x: 0.5
            };

            themed.margin = {
                ...(themed.margin || {}),
                b: Math.max((themed.margin && themed.margin.b) || 0, 95)
            };
        }

        return themed;
    }

    async fetchWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // =============================================
    // ESTADOS DE CARGA Y ERROR
    // =============================================
    showLoadingState(containerId, message = 'Cargando...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loader = document.createElement('div');
        loader.className = 'map-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>${message}</p>
        `;
        
        container.appendChild(loader);
        container.classList.add('loading');
    }

    hideLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loader = container.querySelector('.map-loader');
        if (loader) {
            loader.remove();
        }
        container.classList.remove('loading');
    }

    showMapError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.hideLoadingState(containerId);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'map-error';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h4>Error al cargar el mapa</h4>
            <p>${message}</p>
            <button class="btn-retry" onclick="app.retryMap('${containerId}')">
                Intentar de nuevo
            </button>
        `;
        
        container.appendChild(errorDiv);
    }

    showChartError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.hideLoadingState(containerId);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'map-error';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h4>Error al cargar el gráfico</h4>
            <p>${message}</p>
            <button class="btn-retry" onclick="app.retryChart('${containerId}')">
                Intentar de nuevo
            </button>
        `;

        container.appendChild(errorDiv);
    }

    async retryChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const errorDiv = container.querySelector('.map-error');
        if (errorDiv) errorDiv.remove();

        this.loadedMaps.delete(containerId);

        if (containerId === 'chart-taxis-mes') {
            await this.renderFigure('chart-taxis-mes', 'data/taxis_mes.json');
        } else if (containerId === 'chart-retencion-dia-taxis') {
            await this.renderFigure('chart-retencion-dia-taxis', 'data/retention_dia_taxis.json');
        } else if (containerId === 'chart-boxplot-lluvia') {
            await this.renderFigure('chart-boxplot-lluvia', 'data/boxplot_pickups_lluvia.json');
        } else if (containerId === 'chart-scatter-propinas') {
            await this.renderFigure('chart-scatter-propinas', 'data/scatter_propinas.json');
        } else if (containerId === 'chart-hist-propinas') {
            await this.renderFigure('chart-hist-propinas', 'data/histograma_propinas.json');
        } else if (containerId === 'chart-figura-13') {
            await this.renderFigure('chart-figura-13', 'data/figura_13.json');
        } else if (containerId === 'chart-figura-14') {
            await this.renderFigure('chart-figura-14', 'data/figura_14.json');
        } else if (containerId === 'chart-figura-15') {
            await this.renderFigure('chart-figura-15', 'data/figura_15.json');
        } else if (containerId === 'chart-figura-16') {
            await this.renderFigure('chart-figura-16', 'data/figura_16.json');
        } else if (containerId === 'chart-figura-17') {
            await this.renderFigure('chart-figura-17', 'data/figura_17.json');
        } else if (containerId === 'chart-figura-18') {
            await this.renderFigure('chart-figura-18', 'data/figura_18.json');
        } else if (containerId === 'chart-figura-20') {
            await this.renderFigure('chart-figura-20', 'data/figura_20.json');
        } else if (containerId === 'chart-figura-21') {
            await this.renderFigure('chart-figura-21', 'data/figura_21.json');
        } else if (containerId === 'chart-figura-22') {
            await this.renderFigure('chart-figura-22', 'data/figura_22.json');
        }
    }

    async retryMap(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const errorDiv = container.querySelector('.map-error');
        if (errorDiv) errorDiv.remove();

        this.loadedMaps.delete(containerId);
        
        // Recargar basado en el ID del contenedor
        if (containerId === 'mapa-taxi') {
            await this.renderMap('mapa-taxi', 'data/mapa_datos.json', 'data/geojson_zonas.json', 'Viridis');
        } else if (containerId === 'mapa-uber') {
            await this.renderMap('mapa-uber', 'data/mapa_datos.json', 'data/geojson_zonas_fhvhv.json', 'Plasma');
        }
    }

    addMapSuccessAnimation(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.classList.add('map-loaded');
        setTimeout(() => {
            container.classList.remove('map-loaded');
        }, 600);
    }

    // =============================================
    // INTERSECTION OBSERVER MEJORADO
    // =============================================
    setupAnimationObserver() {
        const observerOptions = {
            threshold: [0.01, 0.1],
            rootMargin: '0px 0px -5% 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    this.handleElementIntersection(entry.target);
                    this.animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos con animaciones
        document.querySelectorAll('.hidden').forEach(el => {
            if (this.isElementInViewport(el)) {
                this.handleElementIntersection(el);
            } else {
                this.animationObserver.observe(el);
            }
        });
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= viewportHeight * 0.95;
    }

    async handleElementIntersection(element) {
        // Mostrar de forma inmediata para una carga más fluida
        element.classList.add('show');
        
        // Cargar mapas cuando se hacen visibles
        const taxiMap = element.querySelector('#mapa-taxi');
        const uberMap = element.querySelector('#mapa-uber');
        
        if (taxiMap && !this.loadedMaps.has('mapa-taxi')) {
            this.renderMap('mapa-taxi', 'data/mapa_datos.json', 'data/geojson_zonas.json', 'Viridis', {
                showScale: false,
                opacity: 0.85
            });
        }
        
        if (uberMap && !this.loadedMaps.has('mapa-uber')) {
            this.renderMap('mapa-uber', 'data/mapa_datos_fhvhv.json', 'data/geojson_zonas_fhvhv.json', 'Plasma', {
                showScale: false,
                opacity: 0.85
            });
        }

        const taxisMes = element.querySelector('#chart-taxis-mes');
        const retencionDia = element.querySelector('#chart-retencion-dia-taxis');
        const boxplotLluvia = element.querySelector('#chart-boxplot-lluvia');
        const scatterPropinas = element.querySelector('#chart-scatter-propinas');
        const histPropinas = element.querySelector('#chart-hist-propinas');
        const figura13 = element.querySelector('#chart-figura-13');
        const figura14 = element.querySelector('#chart-figura-14');
        const figura15 = element.querySelector('#chart-figura-15');
        const figura16 = element.querySelector('#chart-figura-16');
        const figura17 = element.querySelector('#chart-figura-17');
        const figura18 = element.querySelector('#chart-figura-18');
        const figura20 = element.querySelector('#chart-figura-20');
        const figura21 = element.querySelector('#chart-figura-21');
        const figura22 = element.querySelector('#chart-figura-22');

        if (taxisMes && !this.loadedMaps.has('chart-taxis-mes')) {
            this.renderFigure('chart-taxis-mes', 'data/taxis_mes.json');
        }

        if (retencionDia && !this.loadedMaps.has('chart-retencion-dia-taxis')) {
            this.renderFigure('chart-retencion-dia-taxis', 'data/retention_dia_taxis.json');
        }

        if (boxplotLluvia && !this.loadedMaps.has('chart-boxplot-lluvia')) {
            this.renderFigure('chart-boxplot-lluvia', 'data/boxplot_pickups_lluvia.json', { forceXAxis: true });
        }

        if (scatterPropinas && !this.loadedMaps.has('chart-scatter-propinas')) {
            this.renderFigure('chart-scatter-propinas', 'data/scatter_propinas.json');
        }

        if (histPropinas && !this.loadedMaps.has('chart-hist-propinas')) {
            this.renderFigure('chart-hist-propinas', 'data/histograma_propinas.json');
        }

        if (figura13 && !this.loadedMaps.has('chart-figura-13')) {
            this.renderFigure('chart-figura-13', 'data/figura_13.json');
        }

        if (figura14 && !this.loadedMaps.has('chart-figura-14')) {
            this.renderFigure('chart-figura-14', 'data/figura_14.json');
        }

        if (figura15 && !this.loadedMaps.has('chart-figura-15')) {
            this.renderFigure('chart-figura-15', 'data/figura_15.json');
        }

        if (figura16 && !this.loadedMaps.has('chart-figura-16')) {
            this.renderFigure('chart-figura-16', 'data/figura_16.json');
        }

        if (figura17 && !this.loadedMaps.has('chart-figura-17')) {
            this.renderFigure('chart-figura-17', 'data/figura_17.json');
        }

        if (figura18 && !this.loadedMaps.has('chart-figura-18')) {
            this.renderFigure('chart-figura-18', 'data/figura_18.json');
        }

        if (figura20 && !this.loadedMaps.has('chart-figura-20')) {
            this.renderFigure('chart-figura-20', 'data/figura_20.json');
        }

        if (figura21 && !this.loadedMaps.has('chart-figura-21')) {
            this.renderFigure('chart-figura-21', 'data/figura_21.json');
        }

        if (figura22 && !this.loadedMaps.has('chart-figura-22')) {
            this.renderFigure('chart-figura-22', 'data/figura_22.json');
        }
    }

    // =============================================
    // CALCULADORA MEJORADA
    // =============================================
    setupCalculator() {
        const slider = document.getElementById('hoursInput');
        const hoursDisplay = document.getElementById('hoursValue');
        const resultDisplay = document.getElementById('earningsResult');
        const footnote = document.getElementById('calculatorFootnote');
        
        if (!slider || !hoursDisplay || !resultDisplay) return;

        const EXTRA_PER_HOUR = 6.50;
        const WORKING_DAYS = 22;
        const DRIVER_PRO_MONTHLY = 19.99;

        const updateCalculator = () => {
            const hours = parseInt(slider.value);
            const dailyExtra = hours * EXTRA_PER_HOUR;
            const monthlyExtra = dailyExtra * WORKING_DAYS;
            const annualExtra = monthlyExtra * 12;
            const monthlyNet = Math.max(monthlyExtra - DRIVER_PRO_MONTHLY, 0);

            // Actualizar displays con animación
            hoursDisplay.textContent = `${hours} Hora${hours !== 1 ? 's' : ''}/día`;
            
            this.animateNumber(resultDisplay, monthlyExtra, '$', 'monthly');

            if (footnote) {
                footnote.textContent = `*Supuesto conservador: +$${EXTRA_PER_HOUR.toFixed(2)}/hora durante ${WORKING_DAYS} días. Neto tras Driver Pro ($${DRIVER_PRO_MONTHLY.toFixed(2)}/mes): $${Math.round(monthlyNet).toLocaleString()}/mes.`;
            }
            
            // Mostrar desglose adicional
            this.updateCalculatorBreakdown(dailyExtra, monthlyExtra, annualExtra);
        };

        const throttledUpdate = this.throttle(updateCalculator, 100);
        slider.addEventListener('input', throttledUpdate);
        updateCalculator();
    }

    animateNumber(element, targetValue, prefix = '', type = '') {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = `${prefix}${currentValue.toLocaleString()}`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateCalculatorBreakdown(daily, monthly, annual) {
        const breakdownElement = document.getElementById('calculator-breakdown');
        if (!breakdownElement) return;

        breakdownElement.innerHTML = `
            <div class="breakdown-item">
                <span class="breakdown-label">Diario:</span>
                <span class="breakdown-value">$${daily.toLocaleString()}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Mensual:</span>
                <span class="breakdown-value highlight">$${monthly.toLocaleString()}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Anual:</span>
                <span class="breakdown-value">$${annual.toLocaleString()}</span>
            </div>
        `;
    }

    // =============================================
    // UTILIDADES
    // =============================================
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    setupLoadingStates() {
        // Añadir estilos para los estados de carga
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .map-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    background: var(--bg-glass);
                    border-radius: var(--radius-lg);
                    backdrop-filter: blur(10px);
                }
                
                .loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-subtle);
                    border-top: 3px solid var(--taxi-yellow);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                
                .map-error {
                    text-align: center;
                    padding: 2rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: var(--radius-lg);
                    color: var(--text-main);
                }
                
                .error-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                
                .btn-retry {
                    background: var(--gradient-primary);
                    color: var(--bg-dark);
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: all var(--transition-normal);
                }
                
                .btn-retry:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .map-loaded {
                    animation: mapLoadSuccess 0.6s ease-out;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes mapLoadSuccess {
                    0% { transform: scale(0.95); opacity: 0.7; }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                #calculator-breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--bg-glass);
                    border-radius: var(--radius-md);
                    backdrop-filter: blur(10px);
                }
                
                .breakdown-item {
                    text-align: center;
                }
                
                .breakdown-label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }
                
                .breakdown-value {
                    display: block;
                    font-weight: 600;
                    color: var(--text-main);
                }
                
                .breakdown-value.highlight {
                    color: var(--taxi-yellow);
                    font-size: 1.1em;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupErrorHandling() {
        // Manejo global de errores
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rechazada:', e.reason);
            e.preventDefault();
        });
    }

    // Método para limpiar recursos al salir de la página
    cleanup() {
        if (this.scrollTracker) {
            window.removeEventListener('scroll', this.scrollTracker);
        }
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NextStepApp();
});

// Limpiar recursos antes de salir
window.addEventListener('beforeunload', () => {
    app?.cleanup();
});