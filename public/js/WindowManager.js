class WindowManager {
  constructor(windowElement) {
    this.window = windowElement;
    this.appbar = this.window.querySelector('.window__appbar');
    
    // Variables de estado
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.initialLeft = 0;
    this.initialTop = 0;

    this.initDrag();
    this.initResize();
    this.initFocus();
  }

  // --- LÓGICA DE MOVIMIENTO ---
  initDrag() {
    if (!this.appbar) return;

    this.appbar.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('.appbar-options')) return;

      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      
      // SOLUCIÓN 1: Usar posiciones relativas al contenedor padre (.desktop)
      // para evitar saltos provocados por la barra superior o el launcher lateral.
      this.initialLeft = this.window.offsetLeft;
      this.initialTop = this.window.offsetTop;

      // SOLUCIÓN 2: Quitar animaciones CSS para lograr un anclaje instantáneo al ratón
      this.window.classList.add('is-interacting');

      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    });
  }

  onDrag = (e) => {
    if (!this.isDragging) return;
    
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    this.window.style.left = `${this.initialLeft + dx}px`;
    this.window.style.top = `${this.initialTop + dy}px`;
  }

  stopDrag = () => {
    this.isDragging = false;
    this.window.classList.remove('is-interacting'); // Restaurar transiciones
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }

  // --- LÓGICA DE REDIMENSIÓN ---
  initResize() {
    const resizer = document.createElement('div');
    resizer.style.width = '15px';
    resizer.style.height = '15px';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.cursor = 'se-resize';
    resizer.style.zIndex = '20';
    
    this.window.appendChild(resizer);

    let isResizing = false;
    let initialWidth = 0;
    let initialHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      
      // Para las dimensiones visuales (ancho/alto) sí es seguro usar getBoundingClientRect()
      const rect = this.window.getBoundingClientRect();
      initialWidth = rect.width;
      initialHeight = rect.height;

      // También desactivar transiciones al redimensionar
      this.window.classList.add('is-interacting');

      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    });

    const onResize = (e) => {
      if (!isResizing) return;
      const width = initialWidth + (e.clientX - this.startX);
      const height = initialHeight + (e.clientY - this.startY);
      
      if (width > 250) this.window.style.width = `${width}px`;
      if (height > 150) this.window.style.height = `${height}px`;
    }

    const stopResize = () => {
      isResizing = false;
      this.window.classList.remove('is-interacting');
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
    }
  }

  onDrag = (e) => {
    if (!this.isDragging) return;
    
    // Calcular cuánto se ha movido el ratón
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    // Aplicar la nueva posición
    this.window.style.left = `${this.initialLeft + dx}px`;
    this.window.style.top = `${this.initialTop + dy}px`;
  }

  stopDrag = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }

  // --- LÓGICA DE REDIMENSIÓN ---
  initResize() {
    // Crear un "manejador" invisible en la esquina inferior derecha
    const resizer = document.createElement('div');
    resizer.style.width = '15px';
    resizer.style.height = '15px';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.cursor = 'se-resize';
    resizer.style.zIndex = '20';
    
    this.window.appendChild(resizer);

    let isResizing = false;
    let initialWidth = 0;
    let initialHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      
      const rect = this.window.getBoundingClientRect();
      initialWidth = rect.width;
      initialHeight = rect.height;

      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    });

    const onResize = (e) => {
      if (!isResizing) return;
      const width = initialWidth + (e.clientX - this.startX);
      const height = initialHeight + (e.clientY - this.startY);
      
      // Establecer límites mínimos para que la ventana no colapse
      if (width > 250) this.window.style.width = `${width}px`;
      if (height > 150) this.window.style.height = `${height}px`;
    }

    const stopResize = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
    }
  }

  // --- LÓGICA DE FOCO (Z-INDEX) ---
  initFocus() {
    this.window.addEventListener('mousedown', () => {
      // Al hacer clic en cualquier parte de la ventana, traerla al frente
      document.querySelectorAll('.window').forEach(w => w.style.zIndex = 1);
      this.window.style.zIndex = 10;
    });
  }
}