class WindowManager {
	constructor() {
		this.windows = [];
		this.windowCount = 0;
		this.activeWindow = null;
		this.draggedWindow = null;
		this.dragOffset = { x: 0, y: 0 };
		this.zIndexCounter = 100;
        this.status = [];
        this.stateConfig = {};
		this.windowsContainer = document.getElementById('desktop');
		
		this.initEventListeners();
	}

	initEventListeners() {
		// Event listeners globales
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.onDragEnd());
	}

	createNewWindow(titleApp, config = {}) {
        this.windowCount++;
        const windowId = `window-${this.windowCount}`;
        const windowTitle = `Ventana ${this.windowCount}`;
        
        // Crear elemento de ventana
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.id = windowId;
        windowEl.style.width = "400px";
        windowEl.style.height = "240px";
        windowEl.style.top = `${50}px`;
        windowEl.style.left = `${30}px`;
        windowEl.style.animation = 'popup .3s cubic-bezier(0.25, 1, 0.5, 1)'
        windowEl.style.zIndex = ++this.zIndexCounter;
        
        // Contenido de la ventana
        windowEl.innerHTML = `
          <header class="window__appbar">
            <div class="appbar-title">
              <img src="${config.path + config.icon}" height="20" alt="...">
              <h3>${titleApp}</h3>
            </div>
            <div class="appbar-options">
              <button class="btn-window-minimize">
              </button>
              <button class="btn-window-size">
              </button>
              <button class="btn-window-close">
              </button>
            </div>
          </header>
          <div class="window__content"></div>

          <div class='resizer top-left'></div>
          <div class='resizer top-right'></div>
          <div class='resizer bottom-left'></div>
          <div class='resizer bottom-right'></div>  
        `;

        // Agregar eventos de arrastre
        const header = windowEl.querySelector('.window__appbar');
        header.addEventListener('mousedown', (e) => this.onDragStart(e, windowId));
        header.addEventListener('click', (e) => this.toggleMaximize(e, windowId));

        // Agregar eventos a botones
        const btnMaximize = windowEl.querySelector('.btn-window-size');
        btnMaximize.addEventListener('click', () => this.maximize(windowId));
        const btnClose = windowEl.querySelector('.btn-window-close');
        btnClose.addEventListener('click', () => this.close(windowId));
        const btnMinimize = windowEl.querySelector('.btn-window-minimize');
        btnMinimize.addEventListener('click', () => this.minimize(windowId));

        // Agregar al contenedor
        this.windowsContainer.appendChild(windowEl);

        makeResizableDiv("#"+windowEl.id)
        
        // Crear item en la barra de tareas
        //this.createTaskbarItem(windowId, windowTitle);
        
        // Guardar referencia
        this.windows.push({
            id: windowId,
            element: windowEl,
            title: windowTitle,
            isMaximized: false,
            isMinimized: false
        });
        
        this.activateWindow(windowId);

        return windowEl;
    }

    activateWindow(windowId) {
        // Desactivar ventana anterior
        if (this.activeWindow) {
            this.activeWindow.classList.remove('active');
            const prevTaskbarItem = document.getElementById(`taskbar-${this.activeWindow.id}`);
            if (prevTaskbarItem) {
                prevTaskbarItem.classList.remove('active');
            }
        }
        
        // Activar nueva ventana
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.classList.add('active');
            window.element.style.zIndex = ++this.zIndexCounter;
            this.activeWindow = window.element;
            
            const taskbarItem = document.getElementById(`taskbar-${windowId}`);
            if (taskbarItem) {
                taskbarItem.classList.add('active');
            }
        }
    }

    onDragStart(e, windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (!window || window.isMaximized) return;
        
        this.draggedWindow = window;
        const rect = window.element.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        window.element.style.cursor = 'grabbing';
        this.activateWindow(windowId);

        e.preventDefault();
    }

    onDrag(e) {
        if (!this.draggedWindow) return;

        this.draggedWindow.element.classList.add("dragging");

        document.body.classList.add("dragging");
        
        const newX = e.clientX - this.dragOffset.x - this.windowsContainer.offsetLeft;
        const newY = e.clientY - this.dragOffset.y - this.windowsContainer.offsetTop;
        
        // Limitar al área visible
        const maxX = window.innerWidth - this.draggedWindow.element.offsetWidth;
        const maxY = window.innerHeight - this.draggedWindow.element.offsetHeight - 50;
        
        this.draggedWindow.element.style.left = newX + "px";
        this.draggedWindow.element.style.top = newY + "px";

        /* Por los momentos no es necesario limites
        this.draggedWindow.element.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        this.draggedWindow.element.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;*/
    }

    onDragEnd() {
        if (this.draggedWindow) {
            this.draggedWindow.element.style.cursor = 'default';
            this.draggedWindow.element.classList.remove("dragging");
            document.body.classList.remove("dragging");

            this.draggedWindow = null;
        }
    }

    restore(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        window.element.classList.remove("window--maximized");
        window.isMaximized = false;
    }

    maximize(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window.isMaximized) {
            this.restore(windowId);
            return;
        }

        window.element.classList.add("window--maximized");
        window.isMaximized = true;
    }

    toggleMaximize(e, windowId) {
        const window = this.windows.find(w => w.id === windowId);

        if (e.detail % 2 === 0) {
        
            if (window.isMaximized) {
                this.restore(windowId);
                return;
            }

            window.element.classList.add("window--maximized");
            window.isMaximized = true;

        }
    }

    close(windowId) {
        // Buscar el índice de la ventana a cerrar
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index === -1) return; // Ventana no encontrada
        
        const window = this.windows[index];

        window.element.classList.add("hidden");
        
        // Eliminar la ventana del array
        this.windows.splice(index, 1);
        
        // Limpiar referencia si era la ventana activa
        if (this.activeWindow && this.activeWindow.id === windowId) {
            this.activeWindow = null;
        }
        
        // Activar la última ventana abierta si existe
        if (this.windows.length > 0) {
            const lastWindow = this.windows[this.windows.length - 1];
            this.activateWindow(lastWindow.id);
        }
        
        // Eliminar el item de la barra de tareas
        const taskbarItem = document.getElementById(`taskbar-${windowId}`);
        if (taskbarItem) {
            taskbarItem.remove();
        }
        
        // Disparar evento de cierre (útil para limpieza de recursos)
        this.onWindowClosed(window);
    }

    minimize(windowId) {
        // Buscar el índice de la ventana a cerrar
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index === -1) return; // Ventana no encontrada
        
        const window = this.windows[index];
        window.element.classList.toggle('hidden');
    }

    // Método opcional para manejar el cierre
    onWindowClosed(window) {
        // Aquí puedes agregar lógica adicional
        console.log(`Ventana ${window.title} cerrada`);
    }
}

function makeResizableDiv(div) {
  const element = document.querySelector(div);
  const resizers = document.querySelectorAll(div + ' .resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;
  for (let i = 0;i < resizers.length; i++) {
    const currentResizer = resizers[i];
    var desktop = document.getElementById("desktop");
    var rect_x = desktop.getBoundingClientRect().left;
    var rect_y = desktop.getBoundingClientRect().top;

    currentResizer.addEventListener('mousedown', function(e) {
      e.preventDefault()
      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    })
    
    function resize(e) {
        element.classList.add("dragging");
      if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      }
      else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) - rect_x + 'px'
        }
      }
      else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) - rect_y + 'px'
        }
      }
      else {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) - rect_x + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) - rect_y + 'px'
        }
      }
    }
    
    function stopResize() {
        element.classList.remove("dragging");
      window.removeEventListener('mousemove', resize)
    }
  }
}

