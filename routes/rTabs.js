module.exports = function (app, tabService) {
    app.post("/api/anadirPestana", function (req, res) {
        const windowId = req.body.windowId;
        const url= req.body.url;
        const sessionId = req.body.sessionId;
        const index = req.body.index;
        if (windowId && url && sessionId && index && url.trim() !== ""){
            tabService.checkTabExists(windowId, sessionId, url, res.user, existValue => {
                if (existValue){
                    res.status(400);
                    res.json({access: false, message: 'Esa pestaña ya está almacenada'});
                } else{
                    //Guardar la pestaña
                    tabService. createTab({'windowId': windowId, 'url': url, 'sessionId': sessionId, 'index': index, 'username': res.user }, tabId => {
                        if (tabId != null){
                            res.status(200);
                            res.json({access: true, message: 'Pestaña guardada'});
                        } else{
                            res.status(500);
                            res.json({access: false, message: 'Error desconocido al guardar la pestaña'});
                        }
                    });
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.get("/api/obtenerPestanas", function (req, res) {
        const username = res.user;
        tabService.getTabs(username, tabs => {
            if (tabs != null) {
                res.status(200);
                res.json({ message: 'Pestañas almacenadas obtenidas',
                    tabbb: tabs});
            } else {
                res.status(500);
                res.json({
                    message: 'Error en el servidor'
                });
            }
        });
    });
};
