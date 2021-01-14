module.exports = function (app, bookmarksService) {
    app.post("/api/anadirMarcador", function (req, res) {
        const nombre = req.body.name;
        const url= req.body.url;
        const regexURL= new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
        if (nombre !== "" && url !== "" && regexURL.test(url)){
            bookmarksService.comprobarExisteBookmark(nombre, url, res.user,  existValue => {
                if (existValue){
                    res.status(400);
                    res.json({access: false, message: 'El marcador ya existe'});
                } else{
                    //Crear el marcador
                    bookmarksService.createExistentBookmark({'name': nombre, 'url': url, 'username': res.user}, bookmarkId => {
                        if (bookmarkId != null){
                            res.status(200);
                            res.json({access: true, message: 'Marcador guardado'});
                        } else{
                            res.status(500);
                            res.json({access: false, message: 'Error desconocido al crear el marcador'});
                        }
                    });
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.post("/api/borrarMarcador", function (req, res) {
        const id= req.body.id.trim();
        if (id !== "" && id.length >= 0){
            bookmarksService.existBookmark(id, (existValue, bookmark) => {
                if (existValue) {
                    bookmarksService.removeBookmark(id, eraseResult => {
                        if (eraseResult) {
                            res.status(200);
                            res.json({ message: 'Marcador borrado'});
                        } else {
                            res.status(500);
                            res.json({message: 'Error al borrar marcador'});
                        }
                    });
                }
                else {
                    res.status(400);
                    res.json({access: false, message: 'No existe marcador'});
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.get("/api/borrarMarcador", function (req, res) {
        const username =res.user;
        bookmarksService.getBookmarks(username, bookmarks => {
            if (bookmarks != null) {
                res.status(200);
                res.json({
                    message: 'Marcador para editar cogidos',
                    bookmark: bookmarks
                });
            } else{
                res.status(500);
                res.json({
                    message: 'Error del servidor'
                });
            }
        });
    });

    app.get("/api/editarMarcador", function (req, res) {
        const username =res.user;
        bookmarksService.getBookmarks(username, bookmarks => {
            if (bookmarks != null) {
                res.status(200);
                res.json({message: 'Marcador para editar cogidos', bookmarkk: bookmarks});
            } else{
                res.status(500);
                res.json({
                    message: 'Error del servidor'
                });
            }
        });
    });

    app.post("/api/editarMarcador", function (req, res) {
        const name= req.body.name.trim();
        const id= req.body.id.trim();
        if (name !== "" && id !== "" && id.length >= 0 && name.length >= 0){
            bookmarksService.existBookmark(id, (existValue, bookmark) => {
                if (existValue) {
                    bookmark.name=name;
                    bookmarksService.removeBookmark(id, eraseResult => {
                        if (eraseResult) {
                            bookmarksService.createExistentBookmark(bookmark, bookmarkId => {
                                if (bookmarkId != null) {
                                    res.status(200);
                                    res.json({ message: 'Edicion realizada'});
                                } else {
                                    res.status(500);
                                    res.json({ message: 'Error desconocido al editar marcador'});
                                }
                            });
                        } else {
                            res.status(500);
                            res.json({message: 'Error desconocido al editar marcador'});
                        }
                    });
                } else{
                    res.status(400);
                    res.json({access: false, message: 'El marcador no existe'});
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.get("/api/obtenerMarcadores", function (req, res) {
        const username =res.user;
        bookmarksService.getBookmarks(username, bookmarks => {
            if (bookmarks != null) {
                res.status(200);
                res.json({
                    message: 'Marcadores obtenidos',
                    bookmarkk: bookmarks
                });
            } else{
                res.status(500);
                res.json({
                    message: 'Error del servidor'
                });
            }
        });
    });

    app.post("/api/editVariosMarcador", function (req, res) {
        const listado= req.body.listado;
        if (listado != null &&  listado.length > 0) {
            bookmarksService.removeMultipleBookmark(listado,0,res.user,0,null,(statusCode, jsonObj) =>{
                res.status(statusCode);
                res.json(jsonObj);
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.post("/api/borrarMarcadorDetectado", function (req, res) {
        const name = req.body.name;
        const url = req.body.url;
        bookmarksService.removeBookmarkRemoved(name, url, eraseResult => {
            if (eraseResult) {
                res.status(200);
                res.json({ message: 'Marcador borrado'});
            } else {
                res.status(200);
                res.json({message: 'No se ha encontrado el marcador'});
            }
        });
    });
};
