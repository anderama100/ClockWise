import React, { Component } from 'react';

/*
  Componentes de PrimeReact
*/
class App extends Component {

    constructor() {
        // llamar al Constructor de quien heredamos.
        super();
        this.state = { count: 0, logged: false, usuarioLogin: '', passwordLogin: '' };
        // Vincular metodos a la clase principal.
        this.login = this.login.bind(this);
    }

    /* Se ejecuta una vez iniciado el componente*/
    componentDidMount() {
        // Propiedades para Dialogs
        this.setState({ dialogVisible: false });
        this.setState({ dialogText: '' });
    }

    /**
     * Metodo de autenticacion
     */
    login(e) {
        // Generar token para la peticion y realizar peticion anidada
        this.generateToken().then(res => res.json()).then(data => {
            // Llamado a WS Rest de Autenticacion.
            if (this.state.usuarioLogin !== '') {
                fetch('/portal/api/rest/users/' + this.state.usuarioLogin + '/' + this.state.passwordLogin, {
                    headers: {
                        'access-token': data.token
                    }
                }).then(res => res.json()).then(data => {
                    if (data.estado == 'OK') {
                        this.setState({ logged: true });
                        // recargamos los en BD, para evitar ReRender
                        this.cargarDiasMalla();
                    }
                    else {
                        this.setState({ dialogVisible: true });
                        this.setState({ dialogText: data.mensaje });
                    }
                })
            }
            else {
                this.setState({ dialogVisible: true });
                this.setState({ dialogText: 'Por favor ingrese un usuario / contraseña' });
            }

        });

        e.preventDefault();
    }

    render() {
        return (
            <div>
                {/* Contenedor de Login */}
                <div className="login-container" style={{ display: (this.state.logged ? 'none' : 'block') }}>
                    <div>
                        Por favor Ingrese las credenciales del Sistema
                    </div>
                    <div>Usuario</div>
                    <div>
                        <InputText value={this.state.usuarioLogin} onChange={(e) => this.setState({ usuarioLogin: e.target.value })} />
                    </div>
                    <div>Contraseña</div>
                    <div>
                        <Password value={this.state.passwordLogin} onChange={(e) => this.setState({ passwordLogin: e.target.value })} />
                    </div>
                    <div>
                        <Button label="Ingresar" icon="pi pi-check" tooltip="Presione aqui para Ingresar al Sistema" onClick={this.login} />
                    </div>
                </div>

                {/* Contenedor de Aplicacion*/}

                {/* Dialog para todos los mensajes*/}
                <Dialog header="Notificacion" visible={this.state.dialogVisible} style={{ width: '40vw' }} modal={true} onHide={() => this.setState({ dialogVisible: false })}>
                    {this.state.dialogText}
                </Dialog>
            </div>
        )
    }

}

export default App;
