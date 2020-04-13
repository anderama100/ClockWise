import React, { Component } from 'react';
import { render } from 'react-dom';
import moment from 'moment';
/*
  PrimeReact Components
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
        
        super();
        this.state = { token: 0, logged: false, usuarioLogin: '', passwordLogin: '', citas: [], dates: [], dateCalendar: null, newTareaTitulo: '', newTareaDescripcion: '', newTareaDate: null };
        // Link methods to main class.
        this.login = this.login.bind(this);
        this.generateToken = this.generateToken.bind(this);
        this.seleccionarDia = this.seleccionarDia.bind(this);
        this.cargarDias = this.cargarDias.bind(this);
        this.crearTarea = this.crearTarea.bind(this);
        this.cargarDiasMalla = this.cargarDiasMalla.bind(this);
        this.dateTemplate = this.dateTemplate.bind(this);
        this.eliminarRegistro = this.eliminarRegistro.bind(this);
    }

    /* Executed when component is initialized*/
    componentDidMount() {
        // Dialogs properties
        this.setState({ dialogVisible: false });
        this.setState({ dialogText: '' });
        this.setState({ dialogDetalleVisible: false });
    }

    /**
     * Auth method
     */
    login(e) {
        // Token Request /  Perform nested petition
        this.generateToken().then(res => res.json()).then(data => {
            // Auth called to WS Rest
            if (this.state.usuarioLogin !== '') {
                fetch('/portal/api/rest/users/' + this.state.usuarioLogin + '/' + this.state.passwordLogin, {
                    headers: {
                        'access-token': data.token
                    }
                }).then(res => res.json()).then(data => {
                    if (data.estado == 'OK') {
                        this.setState({ logged: true });
                        // reloading on DB, avoiding ReRender
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
                this.setState({ dialogText: 'set user & password' });
            }

        });

        e.preventDefault();
    }

    /**
     * Create new task
     */
    crearTarea(e) {
        // Token Request /  Perform nested petition
        this.generateToken().then(res => res.json()).then(data => {
            // Auth called to WS Rest 
            var dateFormated = moment(this.state.newTareaDate).format('DD-MM-YYYY');
            console.log("Format:" + dateFormated);
            // Calling creation Rest 
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
                    // User days updatating.
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
        // Dialog for events of the day
        this.setState({ dialogDetalleVisible: true });
    }
    /**
     * User days query.
     */
    cargarDias() {
        // Search user events agenda
        this.generateToken().then(res => res.json()).then(data => {
            // Auth called WS Rest.
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
     * 
     */
    cargarDiasMalla() {
        // 
        this.generateToken().then(res => res.json()).then(data => {
            // 
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
     * Task Deleting
     * @param {id registro} id 
     */
    eliminarRegistro(id){
        if (confirm('Are you sure you want to delete this task?')) {
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
                        // Hide events Dialog 
                        this.setState({ dialogDetalleVisible: false });
                    }

                    // reload elements in state and screen
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
     * Date Format
     * @param {Fecha a Formatear} strDate 
     */
    getParsedDate(date) {
        return moment(date).format('DD-MM-YYYY');
    }

    /**
     * Template for color on calendar
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
                {/* Login Container */}
                <div className="login-container" style={{ display: (this.state.logged ? 'none' : 'block') }}>
                    <form id="formLogin" onSubmit={this.login}>
                        <div>
                            Provide system credentials
                        </div>
                        <div>User</div>
                        <div>
                            <InputText value={this.state.usuarioLogin} onChange={(e) => this.setState({ usuarioLogin: e.target.value })} />
                        </div>
                        <div>Password</div>
                        <div>
                            <Password value={this.state.passwordLogin} onChange={(e) => this.setState({ passwordLogin: e.target.value })} />
                        </div>
                        <div>
                            <Button type="submit" label="Ingresar" tooltip="Press Here to Access" />
                        </div>
                    </form>
                </div>

                {/* App Container*/}
                <div className="agenda-container" style={{ display: (this.state.logged ? 'block' : 'none') }}>
                    <div className="logout-button" align="right">
                        <Button label="Exit" onClick={(e) => this.setState({ logged: false })} tooltip="Press Here to Exit" />
                    </div>
                    <div >
                        <TabView>
                            <TabPanel header="Agenda">
                                <div className="tab-container" align="center">
                                    <div className="title-text-div">
                                        Tasks for the following 3 months
                                    </div>
                                    <Calendar readOnlyInput={true} numberOfMonths={3} inline={true} value={this.state.dateCalendar} maxDateCount={40} onSelect={(e) => this.seleccionarDia(e)} dateTemplate={this.dateTemplate}></Calendar>
                                </div>
                            </TabPanel>
                            <TabPanel header="Create Task">
                                <div>
                                    <form id="formTark" onSubmit={this.crearTarea}>
                                        <div style={{ marginBottom: '4px' }}>
                                            Add Task Description
                                        </div>
                                        <div>Title</div>
                                        <div>
                                            <InputText value={this.state.newTareaTitulo} onChange={(e) => this.setState({ newTareaTitulo: e.target.value })} cols={60} />
                                        </div>
                                        <div>Description</div>
                                        <div>
                                            <InputTextarea rows={4} cols={60} value={this.state.newTareaDescripcion} onChange={(e) => this.setState({ newTareaDescripcion: e.target.value })} autoResize={true} />
                                        </div>
                                        <div>Date</div>
                                        <div>
                                            <Calendar dateFormat="dd/mm/yy" value={this.state.newTareaDate} onChange={(e) => this.setState({ newTareaDate: e.value })}></Calendar>
                                        </div>
                                        <div style={{ padding: '4px' }}>
                                            <Button label="Create Task" tooltip="Press here to create new task" type="submit" />
                                        </div>
                                    </form>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>

                {/* Message Dialog */}
                <Dialog header="Notification" visible={this.state.dialogVisible} style={{ width: '40vw' }} modal={true} onHide={() => this.setState({ dialogVisible: false })}>
                    {this.state.dialogText}
                </Dialog>

                {/* Dialog box for activities of the day*/}
                <Dialog header={"Following tasks have been found for " + this.state.fechaSeleccion} visible={this.state.dialogDetalleVisible} style={{ width: '50vw' }} modal={true} onHide={() => this.setState({ dialogDetalleVisible: false })}>
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
