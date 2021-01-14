//Pruebas Unitarias con Mocha y librería Chai
//Test unitarios sobre bookmarksService
//https://www.chaijs.com/api/bdd/

// PARA EJECUTAR EL TEST ESCRIBIR
// npm test
// EN LA LINEA DE COMANDOS

const chai = require('chai');
const expect = chai.expect;
const bookmarksService = require('../services/bookmarksService.js');
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
bookmarksService.init(app, bdManagement);


describe('bookmarksServiceTests', () => {
    describe('Obtener marcadores del usuario', () => {
        it('Existe el usuario', (done) => {
            var username ="daniela@gmail.com";
            bookmarksService.getBookmarks(username, bookmarks => {
                expect(bookmarks.length).to.be.greaterThan(0);
                done();
            });
        });
        it('No existe el usuario', (done) => {
            var username ="noexiste@gmail.com";
            bookmarksService.getBookmarks(username, bookmarks => {
                expect(bookmarks.length).to.equals(0);
                done();
            });
        });
    });
    describe('Comprobar si existe el marcador dado su id de MongoDB', () => {
        it('Bookmark existente', (done) => {
            var idObject ="5e92eebc1c9d440000f1f495";
            bookmarksService.existBookmark(idObject, (existValue, bookmark) => {
                expect(bookmark).to.be.an('object');
                expect(idObject.toString().length).to.equals(24);
                expect(existValue).to.equals(true);
                id=bookmark._id;
                done();
            });
        });
        it('Bookmark no existente', (done) => {
            var idObject ="5e88eebc1c9d440000cccccc";
            bookmarksService.existBookmark(idObject, (existValue) => {
                expect(idObject.toString().length).to.equals(24);
                expect(existValue).to.equals(false);
                done();
            });
        });
    });
    describe('Borrar bookmark', () => {
        it('Bookmark con id ya existente en la base de datos', (done) => {
            var id="5e92eebc1c9d440000f1f495";
            bookmarksService.removeBookmark(id, eraseResult => {
                expect(id.toString().length).to.equals(24);
                expect(eraseResult).to.equals(true);
                done();
            });
        });
        it('Bookmark con id no existente en la base de datos', (done) => {
            var id="5e88eebc1c9d440000f1f111";
            bookmarksService.removeBookmark(id, eraseResult => {
                expect(id.toString().length).to.equals(24);
                expect(eraseResult).to.equals(false);
                done();
            });
        });
    });
    describe('crear bookmark', () => {
        it('Crear bookmark existente ya en la base de datos y borrado anteriormente', (done) => {
            var bookmark ={
                _id : id,
                name : "Renfe",
                url : "https://www.renfe.com",
                username: "tests@email.com"
            };
            bookmarksService.createExistentBookmark(bookmark, bookmarkId => {
                expect(bookmarkId.toString().length).to.equals(24);
                expect(bookmark).to.be.an('object');
                done();
            });
        });
    });
    describe('Comprobar si existe el marcador dados todos los parámetros de los marcadores', () => {
        it('Bookmark existente', (done) => {
            bookmarksService.comprobarExisteBookmark("Renfe", "https://www.renfe.com", "tests@email.com", (existValue, bookmark) => {
                expect(bookmark).to.be.an('object');
                expect(existValue).to.equals(true);
                done();
            });
        });
        it('Bookmark no existente', (done) => {
            var idObject ="5e88eebc1c9d440000f1f111";
            bookmarksService.comprobarExisteBookmark("1234123asd", "http://asdasdasdasda.es", "noTests@email.com", (existValue, bookmark) => {
                expect(idObject.toString().length).to.equals(24);
                expect(existValue).to.equals(false);
                done();
            });
        });
    });

});
