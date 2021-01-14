module.exports = function (app, usersService) {
    app.post("/registro", function (req, res) {
        const username= req.body.username.trim().toLowerCase();
        const password= req.body.password.trim();
        const regexEmail= new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (username !== "" && password !== "" && password.length >= 8 && regexEmail.test(username)){
            usersService.existUsername(username, existValue => {
                if (existValue){
                    res.status(400);
                    res.json({access: false, message: 'El usuario ya existe'});
                } else{
                    //Crear el usuario e iniciar la sesión
                    usersService.createNewUser(username, password, userId => {
                        if (userId != null){
                            usersService.getUserToken(username, password, token => {
                                if (token != null){
                                    res.status(200);
                                    res.json({access: true, token: token, message: 'Usuario registrado y sesión iniciada'});
                                } else{
                                    res.status(500);
                                    res.json({access: false, message: 'Error desconocido al iniciar sesión'});
                                }
                            });
                        } else{
                            res.status(500);
                            res.json({access: false, message: 'Error desconocido al crear el usuario'});
                        }
                    });
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.post("/inicioSesion", function (req, res) {
        const username= req.body.username.trim().toLowerCase();
        const password= req.body.password.trim();
        const regexEmail= new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (username !== "" && password !== "" && password.length >= 8 && regexEmail.test(username)){
            usersService.getUserToken(username, password, (token, user) => {
                const currentTime= app.get("currentTimeWithSeconds")().valueOf();
                if (token == null && user != null && user.length === 0){
                    res.status(400);
                    res.json({
                        access: false,
                        message: 'El usuario no está registrado, regístrate si quieres usarlo'
                    });
                } else {
                    if (token != null && user != null && (!user.isConnected || currentTime - user.lastConnectionTime > app.get('reconnectTime'))) {
                        //Se actualiza la fecha de inicio de sesión
                        user.isConnected = true;
                        user.lastConnectionTime = app.get("currentTimeWithSeconds")().valueOf();
                        //Se elimina el usuario de la base de datos
                        usersService.removeUser(username, eraseResult => {
                            if (eraseResult) {
                                usersService.createExistentUser(user, userId => {
                                    if (userId != null) {
                                        res.status(200);
                                        res.json({
                                            access: true,
                                            token: token,
                                            message: 'Sesión iniciada'
                                        });
                                    } else {
                                        res.status(500);
                                        res.json({
                                            access: false,
                                            message: 'Error desconocido al iniciar sesión'
                                        });
                                    }
                                });
                            } else {
                                res.status(500);
                                res.json({
                                    access: false,
                                    message: 'Error desconocido al iniciar sesión'
                                });
                            }
                        });
                    } else {
                        res.status(400);
                        res.json({
                            access: false,
                            message: 'Datos de inicio de sesión incorrectos o ya tiene una sesión iniciada'
                        });
                    }
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.get("/api/cierreSesion", function (req, res) {
        const username= res.user;
        usersService.getUser(username, user => {
            if (user != null && user.isConnected){
                user.isConnected = false;
                usersService.removeUser(username, eraseResult => {
                    if (eraseResult){
                        usersService.createExistentUser(user, userId => {
                            if (userId != null){
                                res.status(200);
                                res.json({result: true, message: 'Sesión cerrada'});
                            } else{
                                res.status(500);
                                res.json({result: false, message: 'Error desconocido al cerrar sesión'});
                            }
                        });
                    } else{
                        res.status(500);
                        res.json({result: false, message: 'Error desconocido al cerrar sesión'});
                    }
                });
            } else{
                res.status(400);
                res.json({result: false, message: 'El usuario no ha iniciado sesión'});
            }
        });
    });

    app.get("/api/obtenerDatosUsuario", function (req, res) {
        res.status(200);
        res.json({message: 'Datos obtenidos'});
    });

    app.post("/api/borrarUsuario", function (req, res) {
        if (req.body.username !== "" && req.body.password.length >= 7){
            var name = req.body.username;
            var pass = req.body.password;
            usersService.getUserToken(name, pass, (token, user) => {
                if(user != null) {
                    usersService.removeUser(name, eraseResult => {
                        if (eraseResult) {
                            res.status(200);
                            res.json({message: 'Usuario borrado'});
                        } else {
                            res.status(500);
                            res.json({message: 'Error al borrar usuario'});
                        }
                    });
                }
                else{
                    res.status(400);
                    res.json({access: false, message: 'La contraseña introducida es incorrecta'});
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });
};
