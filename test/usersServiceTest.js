//Pruebas Unitarias con Mocha y librería Chai
//Test unitarios sobre usersService
//https://www.chaijs.com/api/bdd/

// PARA EJECUTAR EL TEST ESCRIBIR
// npm test
// EN LA LINEA DE COMANDOS

const chai = require('chai');
const expect = chai.expect;
const usersService = require('../services/usersService.js');
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
usersService.init(app, bdManagement);
describe('usersServiceTests', () => {
    describe('Obtener nuevo token para el usuario', () => {
        it('Estando bien el usuario y la contraseña', (done) => {
            usersService.getUserToken("correo@gmail.com", "1234567a", token => {
                expect(token).not.to.null;
                expect(typeof token).to.equals("string");
                expect(token.length).to.equals(168);
                done();
            });
        });
        it('Estando bien el usuario pero no la contraseña', (done) => {
            usersService.getUserToken("correo@gmail.com", "1234567A", token => {
                expect(token).to.null;
                done();
            });
        });
        it('Estando mal el usuario y siendo una contraseña existente', (done) => {
            usersService.getUserToken("correo199992@gmail.com", "1234567a", token => {
                expect(token).to.null;
                done();
            });
        });
        it('Estando usuario y contraseña mal', (done) => {
            usersService.getUserToken("correo199992@gmail.com", "1234567A", token => {
                expect(token).to.null;
                done();
            });
        });
    });

    describe('Comprobar si un usuario existe o no', () => {
        it('Existiendo el usuario', (done) => {
            usersService.existUsername("correo@gmail.com", response => {
                expect(response).to.equal(true);
                done();
            });
        });
        it('No existiendo el usuario', (done) => {
            usersService.existUsername("correoNoExiste@gmail.com", response => {
                expect(response).to.equal(false);
                done();
            })
        });
    });

    describe('Obtener el usuario de la base de datos', () => {
        it('Existiendo el usuario', (done) => {
            usersService.getUser("correo@gmail.com", user => {
                expect(user).to.be.an('object');
                expect(user.username).to.equals("correo@gmail.com");
                expect(user.password.length).to.be.greaterThan(7);
                done();
            });
        });
        it('No existiendo el usuario', (done) => {
            usersService.getUser("correoNoExiste@gmail.com", user => {
                expect(user).to.null;
                done();
            })
        });
    });

    describe('Crear un usuario y borrarlo', () => {
        it('No existiendo el usuario', (done) => {
            usersService.createNewUser("correoCreadoEnTest@gmail.com", "1234567a", idObject => {
                expect(idObject.toString().length).to.equals(24);
                usersService.removeUser("correoCreadoEnTest@gmail.com", response => {
                    expect(response).to.equals(true);
                });
                done();
            });
        });
    });

    describe('Crear un usuario mediante uno ya creado', () => {
        it('Sin modificar atributos ni valores', (done) => {
            usersService.getUser("correo@gmail.com", user => {
                expect(user).to.be.an('object');
                expect(user.username).to.equals("correo@gmail.com");
                expect(user.password.length).to.be.greaterThan(7);
                usersService.removeUser(user.username, response => {
                    expect(response).to.equals(true);
                    usersService.createExistentUser(user, userId => {
                        expect(userId.toString().length).to.equals(24);
                        done();
                    });
                });

            });
        });

        it('Añadiendo un atributo', (done) => {
            usersService.getUser("correo1@gmail.com", user => {
                const cloneUser = {...user};
                user["nuevoAtributo"]= "TestAtributoNuevo";
                expect(user).to.be.an('object');
                expect(user.username).to.equals("correo1@gmail.com");
                expect(user.password.length).to.be.greaterThan(7);
                usersService.removeUser(user.username, response => {
                    expect(response).to.equals(true);
                    usersService.createExistentUser(user, userId => {
                        expect(userId.toString().length).to.equals(24);
                        usersService.getUser("correo1@gmail.com", user2 => {
                            expect(user2.nuevoAtributo).to.equals("TestAtributoNuevo");
                            //Para dejar la base de datos como estaba
                            usersService.removeUser(user.username, response => {
                                expect(response).to.equals(true);
                                usersService.createExistentUser(cloneUser, userId => {
                                    expect(userId.toString().length).to.equals(24);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        })

        it('Cambiando un valor', (done) => {
            usersService.getUser("correo1@gmail.com", user => {
                const cloneUser = {...user};
                user.password= "56789123456";
                expect(user).to.be.an('object');
                expect(user.username).to.equals("correo1@gmail.com");
                expect(user.password.length).to.be.greaterThan(7);
                usersService.removeUser(user.username, response => {
                    expect(response).to.equals(true);
                    usersService.createExistentUser(user, userId => {
                        expect(userId.toString().length).to.equals(24);
                        usersService.getUser("correo1@gmail.com", user2 => {
                            expect(user2.password).to.equals("56789123456");
                            //Para dejar la base de datos como estaba
                            usersService.removeUser(user.username, response => {
                                expect(response).to.equals(true);
                                usersService.createExistentUser(cloneUser, userId => {
                                    expect(userId.toString().length).to.equals(24);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        })
    });
});
