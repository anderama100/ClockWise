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
