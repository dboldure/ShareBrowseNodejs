//Pruebas Unitarias con Mocha y librería Chai
//Test unitarios sobre appService
//https://www.chaijs.com/api/bdd/

// PARA EJECUTAR EL TEST ESCRIBIR
// npm test
// EN LA LINEA DE COMANDOS

const chai = require('chai');
const expect = chai.expect;
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
const appService = require('../services/appService.js');
appService.init(app, bdManagement);

describe('appServiceTests', () => {
    describe('Comprobar si un usuario existe o no', () => {
        it('Existiendo el usuario', (done) => {
            appService.checkUserExists("correo@gmail.com", response => {expect(response).to.equal(true); done();});
        });
        it('No existiendo el usuario', (done) => {
            appService.checkUserExists("correoNoExiste@gmail.com", response => {expect(response).to.equal(false); done();})
        });
    });
});
