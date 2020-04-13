import React, { Component } from 'react';
import { render } from 'react-dom';
import moment from 'moment';
/*
  Componentes de PrimeReact
*/
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { ScrollPanel } from 'primereact/scrollpanel';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class App extends Component {

    constructor() {
        // llamar al Constructor de quien heredamos.
        super();
        this.state = { token: 0, logged: false, usuarioLogin: '', passwordLogin: '', citas: [], dates: [], dateCalendar: null, newTareaTitulo: '', newTareaDescripcion: '', newTareaDate: null };
        // Vincular metodos a la clase principal.
        this.login = this.login.bind(this);
        this.generateToken = this.generateToken.bind(this);
        this.seleccionarDia = this.seleccionarDia.bind(this);
        this.cargarDias = this.cargarDias.bind(this);
        this.crearTarea = this.crearTarea.bind(this);
        this.cargarDiasMalla = this.cargarDiasMalla.bind(this);
        this.dateTemplate = this.dateTemplate.bind(this);
        this.eliminarRegistro = this.eliminarRegistro.bind(this);
    }

    /* Se ejecuta una vez iniciado el componente*/
    componentDidMount() {
        // Propiedades para Dialogs
        this.setState({ dialogVisible: false });
        this.setState({ dialogText: '' });
        this.setState({ dialogDetalleVisible: false });
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

    /**
     * Crear nueva tarea
     */
    crearTarea(e) {
        // Generar token para la peticion y realizar peticion anidada
        this.generateToken().then(res => res.json()).then(data => {
            // Llamado a WS Rest de Creacion de Tarea 
            var dateFormated = moment(this.state.newTareaDate).format('DD-MM-YYYY');
            console.log("Format:" + dateFormated);
            // llamar rest de creacion
            fetch('/portal/api/rest/appointment/', {
                method: 'POST',
                body: JSON.stringify({ "login": this.state.usuarioLogin, "dateFormated": dateFormated, "date": this.state.newTareaDate, "title": this.state.newTareaTitulo, "description": this.state.newTareaDescripcion, "active": true, "color": "none" }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'access-token': data.token
                }
            }).then(res => res.json())
                .then(data => {
                    this.setState({ dialogVisible: true });
                    this.setState({ dialogText: data.mensaje });

                    if (data.estado === 'OK') {
                        this.setState({ newTareaDate: null, newTareaDescripcion: '', newTareaTitulo: '' });
                    }
                    // Refrescar los dias del usuario.
                    this.cargarDiasMalla();
                })
                .catch(err => console.error(err));
        });
        e.preventDefault();
    }

    seleccionarDia(e) {
        var formatDate = this.getParsedDate(e.value);
        this.setState({ fechaSeleccion: formatDate });

        this.cargarDias();
        // mostramos el Dialog con los eventos para ese dia
        this.setState({ dialogDetalleVisible: true });
    }
    /**
     * Consultar los dias del usuario.
     */
    cargarDias() {
        // consultar los dias que el usuario tiene agenda
        this.generateToken().then(res => res.json()).then(data => {
            // Llamado a WS Rest de Autenticacion.
            fetch('/portal/api/rest/appointment/' + this.state.usuarioLogin + '/' + this.state.fechaSeleccion, {
                headers: {
                    'access-token': data.token
                }
            }).then(res => res.json()).then(data => {
                this.setState({ citas: data });
            })
        });
    }

    /**
     * Consultar los dias del usuario.
     */
    cargarDiasMalla() {
        // consultar los dias que el usuario tiene agenda
        this.generateToken().then(res => res.json()).then(data => {
            // Llamado a WS Rest de Autenticacion.
            fetch('/portal/api/rest/appointment/' + this.state.usuarioLogin, {
                headers: {
                    'access-token': data.token
                }
            }).then(res => res.json()).then(data => {
                const items = [];
                for (const [index, value] of data.entries()) {
                    const { date } = value;
                    var text = String({ date }.date);
                    items.push(new Date(text));
                }
                this.setState({ dates: items });
            })
        });
    }

    /**
     * Borrado de Tarea
     * @param {id registro} id 
     */
    eliminarRegistro(id){
        if (confirm('Esta seguro de Eliminar esta Tarea?')) {
            fetch('/portal/api/rest/appointment/' + id, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
                .then(data => {
                    this.setState({ dialogVisible: true });
                    this.setState({ dialogText: data.mensaje });

                    if(data.estado==='OK'){
                        // ocultamos el Dialog con los eventos para ese dia
                        this.setState({ dialogDetalleVisible: false });
                    }

                    // recargar elementos en estado y en la pantalla
                    this.cargarDias();
                    this.cargarDiasMalla();
                });
        }
    }

    /**
     * Genera token para peticiones REST
     */
    async generateToken() {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ appModule: 'jsCJP' })
        }
        const data = await fetch('/portal/api/rest/secure/token', config)
        return data;
    }
    /**
     * Formateo de Fechas
     * @param {Fecha a Formatear} strDate 
     */
    getParsedDate(date) {
        return moment(date).format('DD-MM-YYYY');
    }

    /**
     * Plantilla para colores del calentario
     * @param {fecha} date 
     */
    dateTemplate(date) {
        var exists = false;
        const comparatorInput = ("0" + date.day).slice(-2) + "-" + ("0" + (date.month + 1)).slice(-2) + "-" + date.year;

        this.state.dates.map((date) => {
            var aDate = { date };
            var dated = new Date(aDate.date);
            var comparator = ("0" + dated.getDate()).slice(-2) + "-" + ("0" + (dated.getMonth() + 1)).slice(-2) + "-" + dated.getFullYear();
            if (comparatorInput === comparator) {
                exists = true;
                return;
            }
        });

        if (exists) {
            return (
                <div style={{ backgroundColor: '#1dcbb3', color: '#ffffff', fontWeight: 'bold', borderRadius: '50%', width: '2em', height: '2em', lineHeight: '2em', padding: 0 }}>{date.day}</div>
            );
        }
        else {
            return date.day;
        }
    }

    render() {
        return (
            <div>
                {/* Contenedor de Login */}
                <div className="login-container" style={{ display: (this.state.logged ? 'none' : 'block') }}>
                    <form id="formLogin" onSubmit={this.login}>
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
                            <Button type="submit" label="Ingresar" tooltip="Presione aqui para Ingresar al Sistema" />
                        </div>
                    </form>
                </div>

                {/* Contenedor de Aplicacion*/}
                <div className="agenda-container" style={{ display: (this.state.logged ? 'block' : 'none') }}>
                    <div className="logout-button" align="right">
                        <Button label="Salir" onClick={(e) => this.setState({ logged: false })} tooltip="Presione para Salir de Aplicacion" />
                    </div>
                    <div >
                        <TabView>
                            <TabPanel header="Agenda Actual">
                                <div className="tab-container" align="center">
                                    <div className="title-text-div">
                                        Las siguientes son las Actividades / Tareas para los proximos 3 Meses
                                    </div>
                                    <Calendar readOnlyInput={true} numberOfMonths={3} inline={true} value={this.state.dateCalendar} maxDateCount={40} onSelect={(e) => this.seleccionarDia(e)} dateTemplate={this.dateTemplate}></Calendar>
                                </div>
                            </TabPanel>
                            <TabPanel header="Crear Actividad">
                                <div>
                                    <form id="formTark" onSubmit={this.crearTarea}>
                                        <div style={{ marginBottom: '4px' }}>
                                            Por favor Ingrese la informacion de la Actividad
                                        </div>
                                        <div>Titulo</div>
                                        <div>
                                            <InputText value={this.state.newTareaTitulo} onChange={(e) => this.setState({ newTareaTitulo: e.target.value })} cols={60} />
                                        </div>
                                        <div>Descripcion</div>
                                        <div>
                                            <InputTextarea rows={4} cols={60} value={this.state.newTareaDescripcion} onChange={(e) => this.setState({ newTareaDescripcion: e.target.value })} autoResize={true} />
                                        </div>
                                        <div>Fecha</div>
                                        <div>
                                            <Calendar dateFormat="dd/mm/yy" value={this.state.newTareaDate} onChange={(e) => this.setState({ newTareaDate: e.value })}></Calendar>
                                        </div>
                                        <div style={{ padding: '4px' }}>
                                            <Button label="Crear Tarea" tooltip="Presione aqui para crear la nueva tarea ingresada" type="submit" />
                                        </div>
                                    </form>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>

                {/* Dialog para todos los mensajes*/}
                <Dialog header="Notificacion" visible={this.state.dialogVisible} style={{ width: '40vw' }} modal={true} onHide={() => this.setState({ dialogVisible: false })}>
                    {this.state.dialogText}
                </Dialog>

                {/* Dialog para Mostrar Activiades del dia*/}
                <Dialog header={"Se han encontrado las siguientes tareas para " + this.state.fechaSeleccion} visible={this.state.dialogDetalleVisible} style={{ width: '50vw' }} modal={true} onHide={() => this.setState({ dialogDetalleVisible: false })}>
                    <ScrollPanel style={{ width: '100%', height: '340px' }} className="custom">
                        <div>
                            {
                                this.state.citas.map(loopReg => {
                                    return (
                                        <div key={loopReg._id}>
                                            <table key={"date" + loopReg._id} style={{ width: '100%' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ width: '84px' }}><b>Titulo</b></td>
                                                        <td>{loopReg.title}</td>
                                                        <td style={{ width: '20px' }}></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: '84px' }}><b>Fecha</b></td>
                                                        <td>{loopReg.dateFormated}</td>
                                                        <td style={{ width: '20px' }}></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: '84px' }}><b>Descripcion</b></td>
                                                        <td>{loopReg.description}</td>
                                                        <td style={{ width: '20px' }}></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: '84px' }}><b>Estado</b></td>
                                                        <td>Activa</td>
                                                        <td style={{ width: '20px' }}>
                                                          <Button className="p-button-danger" icon="pi pi-calendar-times" style={{ width: '20px',height : '20px' }} tooltip="Presione para Eliminar Esta Tarea" onClick={() => this.eliminarRegistro(loopReg._id)}/>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <hr style={{ border: '1px solid silver' }}></hr>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </ScrollPanel>
                </Dialog>
            </div>
        )
    }

}

export default App;
