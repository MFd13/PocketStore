const API_URL = 'https://jsonplaceholder.typicode.com/users';
const catalog = document.getElementById('catalog');
const statusEl = document.getElementById('status');

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.error('Error al registrar el SW:', err));
  });
}

// Indicador de conexión
function updateStatus() {
  const online = navigator.onLine;
  statusEl.textContent = online ? 'En línea' : 'Sin conexión';
  statusEl.classList.toggle('online', online);
}
window.addEventListener('online', () => { updateStatus(); loadCatalog(); });
window.addEventListener('offline', updateStatus);

// Contenido dinámico
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('');
}

function render(users) {
  catalog.innerHTML = users.map(u => `
    <article class="card">
      <div class="avatar">${initials(u.name)}</div>
      <div>
        <h2>${u.name}</h2>
        <p>${u.company.name}</p>
        <p>${u.email}</p>
        <p>${u.address.city}</p>
      </div>
    </article>`).join('');
}

async function loadCatalog() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    render(await res.json());
  } catch (err) {
    catalog.innerHTML = `
      <p class="empty">No se pudo cargar el catálogo y aún no hay datos guardados.<br>
      Conéctate a internet una vez para guardarlo.<br>
      <button id="retry">Reintentar</button></p>`;
    document.getElementById('retry').addEventListener('click', loadCatalog);
  }
}

updateStatus();
loadCatalog();
