const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongo = require('mongodb');
const moment = require('moment');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('tokenTime', 2700000); //45 minutos
app.set('reconnectTime', 300000); //5 minutos
app.set('jwt', jwt); //Para desencriptar y encriptar el token
app.set('crypto', crypto); //Para encriptar contraseñas en la bbdd
app.set('moment', moment); //Para manejar fechas
app.set('db', "mongodb+srv://admin:gps@gps-sszmk.mongodb.net/test?retryWrites=true&w=majority");
app.set('dbName', 'gps'); //Nombre de la base de datos
app.set('port', 8080); //Puerto utilizado
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

//Modulos
const bdManagement = require("./modules/bdManagement.js");
bdManagement.init(app, mongo);

//Servicios
const usersService= require("./services/usersService.js");
usersService.init(app, bdManagement);
const bookmarksService= require("./services/bookmarksService.js");
bookmarksService.init(app, bdManagement);
const historyService= require("./services/historyService.js");
historyService.init(app, bdManagement);
const appService= require("./services/appService.js");
appService.init(app, bdManagement);
const tabService= require("./services/tabService.js");
tabService.init(app, bdManagement);
const windowService= require("./services/windowService.js");
windowService.init(app, bdManagement);

// Enrutamiento de peticiones
//Router para comprobar token
const routerToken = express.Router();
routerToken.use(function(req, res, next) {
    const token = req.get('token') || req.body.token || req.query.token;
    if (token != null) {
        jwt.verify(token, app.get("tokenKey"), function (err, infoToken) {
            if (err || (app.get('currentTime')().valueOf() - infoToken.time) > app.get('tokenTime')) { //controlar los 45 minutos para que expire el token
                res.status(403); // Prohibido
                res.json({access: false, error: 'Token inválido o expirado'});
            } else {
                //Comprobar que el usuario existe
                appService.checkUserExists(infoToken.user, result => {
                    if (result){ //Si existe se deja seguir la petición
                        res.user = infoToken.user;
                        next();
                    } else{
                        res.status(403); // Prohibido
                        res.json({access: false, message: 'Token manipulado'});
                    }
                });
            }
        });
    } else {
        res.status(403); // Prohibido
        res.json({access: false, message: 'Token invalido'});
    }
});
app.use("/api/*", routerToken);

//Rutas
require("./routes/rUsers.js")(app, usersService);
require("./routes/rBookmarks.js")(app, bookmarksService);
require("./routes/rHistory.js")(app, historyService);
require("./routes/rTabs.js")(app, tabService);
require("./routes/rWindows.js")(app, windowService);

// Cuando no existe una url
app.use(function(req, res) {
    res.status(404);
    res.json({message: 'url not found'});
});

// Gestion de errores
app.use(function (err, req, res, next) {
    res.status(500);
    res.json({message: 'unexpected error'});
});

// Run server
app.listen(app.get('port'), () => {
    console.log("Servidor activo alcanzable en localhost:" + app.get('port'));
});
