//Pruebas Unitarias con Mocha y librería Chai
//Test unitarios sobre historyService
//https://www.chaijs.com/api/bdd/

// PARA EJECUTAR EL TEST ESCRIBIR
// npm test
// EN LA LINEA DE COMANDOS

const chai = require('chai');
const expect = chai.expect;
const historyService = require('../services/historyService.js');
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
historyService.init(app, bdManagement);

describe('historyServiceTests', () => {
    describe('Obtener historial del usuario', () => {
        it('Existiendo el usuario', (done) => {
            historyService.getHistory("correo1@gmail.com", history=>{
                expect(history.length).to.be.greaterThan(0);
                done();
            });
        });
        it('No existiendo el usuario', (done) => {
            historyService.getHistory("correoInventao@gmail.com", history=>{
                expect(history.length).to.equals(0);
                done();
            });
        });
    });

    describe('Comprobar si existe el historial dado su id de MongoDB', () => {
        it('Historial existente', (done) => {
            var idObject ="5e94892f0313e84500a5481b";
            historyService.existHistory(idObject, (existValue, history) => {
                expect(history).to.be.an('object');
                expect(idObject.toString().length).to.equals(24);
                expect(existValue).to.equals(true);
                done();
            });
        });
        it('Historial no existente', (done) => {
            var idObject ="5e88eebc1c9d440000f1f111";
            historyService.existHistory(idObject, (existValue) => {
                expect(idObject.toString().length).to.equals(24);
                expect(existValue).to.equals(false);
                done();
            });
        });
    });
    describe('Borrar una entrada del historial y crearla', () => {
        it('Historial con id ya existente en la base de datos', (done) => {
            var id="5e94892f0313e84500a5481b";
            const historyObj= {
                _id: historyService.getObjectIdHistory(id),
                addedTime: 1586792750.717005,
                url: "https://google.es",
                username: "correo1@gmail.com"
            };
            historyService.removePagHistory(id, eraseResult => {
                historyService.createHistoryValue(historyObj, historyId => {
                    expect(id.toString().length).to.equals(24);
                    expect(eraseResult).to.equals(true);
                    expect(historyId.toString()).to.equals(id);
                    done();
                });
            });
        });
        it('Historial con id no existente en la base de datos', (done) => {
            var id="5e88eebc1c9d440000cccccc";
            historyService.removePagHistory(id, eraseResult => {
                expect(id.toString().length).to.equals(24);
                expect(eraseResult).to.equals(false);
                done();
            });
        });
    });
    describe('Comprobar si existe el historial dado su url y username al que pertenece', () => {
        it('Historial existente', (done) => {
            historyService.checkHistoryValueExists("https://google.es", "correo1@gmail.com", existValue => {
                expect(existValue).to.equals(true);
                done();
            });
        });
        it('Historial no existente', (done) => {
            historyService.checkHistoryValueExists("https://google.google.google.asdasdasdsa.es", "correo1@gmail.com", (existValue) => {
                expect(existValue).to.equals(false);
                done();
            });
        });
    });
    //Se pueden poner más describe para probar otras funciones del servicio
});
