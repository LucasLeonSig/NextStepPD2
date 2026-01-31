document.addEventListener('DOMContentLoaded', () => {
    
  async function cargarMapa() {
    try {
        // Cargar GeoJSON y datos por separado
        const [geojsonResp, datosResp] = await Promise.all([
            fetch('geojson_zonas.json'),
            fetch('mapa_datos.json')
        ]);
        
        const geojson = await geojsonResp.json();
        const datos = await datosResp.json();
        
        // Crear el trace manualmente
        const trace = {
            type: 'choroplethmapbox',
            geojson: geojson,
            locations: datos.locations,
            z: datos.z,
            featureidkey: 'id',
            coloraxis: 'coloraxis',
            hovertext: datos.hover_names,
        };
        
        const layout = {
            ...datos.layout,
            coloraxis: {
                colorbar: {
                    title: { text: 'num_viajes', font: { color: 'white' } },
                    tickfont: { color: 'white' }
                },
                colorscale: 'Viridis'
            }
        };
        
        Plotly.newPlot('contenedor-mapa', [trace], layout, { responsive: true });
        
    } catch (error) {
        console.error("Error al cargar mapa:", error);
    }
}
    
    // Observer para lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                
                if (entry.target.id === 'contenedor-mapa') {
                    cargarMapa();
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.2 });
    
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    // Calculadora
    const slider = document.getElementById('hoursInput');
    const hoursDisplay = document.getElementById('hoursValue');
    const resultDisplay = document.getElementById('earningsResult');
    const EXTRA_PER_HOUR = 6.50; 
    const WORKING_DAYS = 22;
    
    function updateCalculator() {
        const hours = slider.value;
        hoursDisplay.textContent = `${hours} Horas`;
        const totalExtra = Math.round(hours * EXTRA_PER_HOUR * WORKING_DAYS);
        resultDisplay.textContent = `$${totalExtra.toLocaleString()}`;
    }
    
    slider.addEventListener('input', updateCalculator);
    updateCalculator();
});