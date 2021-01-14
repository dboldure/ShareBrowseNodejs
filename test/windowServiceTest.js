//Pruebas Unitarias con Mocha y librería Chai
//Test unitarios sobre historyService
//https://www.chaijs.com/api/bdd/

// PARA EJECUTAR EL TEST ESCRIBIR
// npm test
// EN LA LINEA DE COMANDOS

const chai = require('chai');
const expect = chai.expect;
const windowService = require('../services/windowService.js');
const express = require('express');
const app = express();
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');
app.set('tokenTime', 2700000); //45 minutos
app.set('jwt', jwt); //Para desencriptar y encriptar el token
app.set('crypto', crypto); //Para encriptar contraseñas en la bbdd
app.set('moment', moment); //Para manejar fechas
app.set('currentTime', function(){ //Obtener hora actual sin segundos ni milisegundos en objeto Moment
    const currentTimeDate= new Date();
    return moment([currentTimeDate.getFullYear(), currentTimeDate.getMonth(), currentTimeDate.getDate(), currentTimeDate.getHours(), currentTimeDate.getMinutes()]);
});
app.set('currentTimeWithSeconds', function(){ //Obtener hora actual con segundos pero no milisegundos en objeto Moment
    const currentTimeDate= new Date();
    return moment([currentTimeDate.getFullYear(), currentTimeDate.getMonth(), currentTimeDate.getDate(), currentTimeDate.getHours(), currentTimeDate.getMinutes(), currentTimeDate.getSeconds()]);
});
app.set('tokenKey', '1e.4;33aB$)K1s.r;'); //Contraseña de encriptado del token
app.set('passKey', '1e.4;33aB$)K1s.r;'); //Contraseña de encriptado de contraseñas
const bdManagement = require('../modules/bdManagement.js');
windowService.init(app, bdManagement);

describe('windowServiceTests', () => {
    describe('Obtener ventanas del usuario', () => {
        it('Existiendo el usuario', (done) => {
            windowService.getWindows("correo1@gmail.com", windows=>{
                expect(windows.length).to.be.greaterThan(0);
                done();
            });
        });
        it('No existiendo el usuario', (done) => {
            windowService.getWindows("correoInventao@gmail.com", windows=>{
                expect(windows.length).to.equals(0);
                done();
            });
        });
    });

    describe('Comprobar si existe una ventana dado su sessionId, windowId y el username al que pertenece', () => {
        it('Ventana existente', (done) => {
            windowService.checkWindowExists("pruebaTestWindowId", "pruebaTestSessionId","correo1@gmail.com", existValue => {
                expect(existValue).to.equals(true);
                done();
            });
        });
        it('Ventana no existente', (done) => {
            windowService.checkWindowExists("pruebaTestWindowId2", "pruebaTestSessionId2", "correo1@gmail.com", (existValue) => {
                expect(existValue).to.equals(false);
                done();
            });
        });
    });
    //Se pueden poner más describe para probar otras funciones del servicio
});
