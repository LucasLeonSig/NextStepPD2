document.addEventListener('DOMContentLoaded', () => {
    
    // Función Genérica para cargar un mapa
    // containerId: ID del div donde va el mapa
    // dataUrl: URL del JSON de datos
    // colorScale: Escala de color para diferenciar visualmente
    async function renderMap(containerId, dataUrl, colorScale) {
        try {
            const [geojsonResp, datosResp] = await Promise.all([
                fetch('geojson_zonas.json'), 
                fetch(dataUrl)
            ]);
            
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
                marker: { opacity: 0.8, line: { width: 0 } } 
            };
            
            const layout = {
                ...datos.layout,
                margin: { t: 0, b: 0, l: 0, r: 0 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                mapbox: {
                    ...datos.layout.mapbox,
                    style: "carto-darkmatter",
                },
                coloraxis: { showscale: false },
                dragmode: 'zoom'
            };
            
            const config = { responsive: true, displayModeBar: false };
            
            Plotly.newPlot(containerId, [trace], layout, config);
            
        } catch (error) {
            console.error(`Error al cargar mapa en ${containerId}:`, error);
        }
    }
      
    // Observer para lazy loading y animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                
                // Cargar Mapa TAXI (Amarillo/Verde)
                if (entry.target.querySelector('#mapa-taxi')) {
                    renderMap('mapa-taxi', 'mapa_datos.json', 'Viridis');
                }
                
                // Cargar Mapa UBER (Morado/Plasma)
                if (entry.target.querySelector('#mapa-uber')) {
                    renderMap('mapa-uber', 'mapa_datos.json', 'Plasma');
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    // Calculadora
    const slider = document.getElementById('hoursInput');
    const hoursDisplay = document.getElementById('hoursValue');
    const resultDisplay = document.getElementById('earningsResult');
    const EXTRA_PER_HOUR = 6.50; 
    const WORKING_DAYS = 22;
    
    function updateCalculator() {
        if(!slider) return;
        const hours = slider.value;
        hoursDisplay.textContent = `${hours} Horas/día`;
        const totalExtra = Math.round(hours * EXTRA_PER_HOUR * WORKING_DAYS);
        resultDisplay.textContent = `$${totalExtra.toLocaleString()}`;
    }
    
    if(slider) {
        slider.addEventListener('input', updateCalculator);
        updateCalculator();
    }
});