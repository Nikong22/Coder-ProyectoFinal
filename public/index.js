const socket = io();

socket.on('listar', (productos) => {
    let divTabla = document.getElementById('tabla');
    divTabla.innerHTML = '';
    
    if(productos.length > 0){
        let bodyProductos = '';
        for (producto of productos) {
            bodyProductos += `
            <tr>
                <td>
                    ${producto.id}
                </td>
                <td>
                    ${producto.title}
                </td>
                <td>
                    ${producto.price}
                </td>
                <td>
                    <img src="${producto.thumbnail}" width= "35" alt="url"/>
                </td>
            </tr>
            `
        }

        divTabla.innerHTML = `
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <td>
                        Id
                    </td>
                    <td>
                        Título
                    </td>
                    <td>
                        Precio
                    </td>
                    <td>
                        Url
                    </td>
                </tr>
            </thead>
            <tbody>
                ${bodyProductos}
            </tbody>
        </table>
        `;
    }else{
        divTabla.innerHTML = 'No hay productos';
    }
})

function enviar() {
    socket.emit('notificacion', document.getElementById('title').value, document.getElementById('price').value, document.getElementById('thumbnail').value);
};


socket.on('mensajes', (data) => {
    render(data);
    traerMisMensajes()
});

socket.on('mis_mensajes', (data) => {
    render_mis_mensajes(data);
});

let render = (data) => {
    let html =
        data.map((m) => `
    <div class="fila">
        <strong style="color: blue;">${m.autor}</strong>
        <span style="color: brown;">[${m.fecha}]:</span>
        <em style="color: green;">${m.texto}</em>
    </div>
    `).join(' ');
    if(document.getElementById('mensajes') != undefined)
    document.getElementById('mensajes').innerHTML = html
}

let render_mis_mensajes = (data) => {
    let html =
        data.map((m) => `
    <div class="fila">
        <strong style="color: blue;">${m.autor}</strong>
        <span style="color: brown;">[${m.fecha}]:</span>
        <em style="color: green;">${m.texto}</em>
    </div>
    `).join(' ');
    if(document.getElementById('mis_mensajes') != undefined)
        document.getElementById('mis_mensajes').innerHTML = html
}

function getCookie(cname) {
    let name = cname + "=";
    let cookieValue = document.cookie
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }
    return "";
}

window.onload = function() {
    document.getElementById('username').value = getCookie('username')
    traerMisMensajes()
};

function envioMensaje() {
    const autor = document.getElementById('username').value
    let fecha = new Date();
    fecha = fecha.getUTCFullYear() + "-" + (fecha.getUTCMonth() + 1) + "-" + fecha.getUTCDate() + " " + fecha.getUTCHours() + ":" + fecha.getUTCMinutes() + ":" + fecha.getUTCSeconds();
    let texto = document.getElementById('mensaje').value;
    socket.emit('nuevo', { autor, fecha, texto });
    return false;
}

function traerMisMensajes() {
    const autor = document.getElementById('username').value
    socket.emit('mis_mensajes', { autor });
    return false;
}