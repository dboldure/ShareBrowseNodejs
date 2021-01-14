module.exports = function (app, windowService) {
    app.post("/api/anadirVentana", function (req, res) {
        const windowId = req.body.windowId;
        const sessionId = req.body.sessionId;
        const date = req.body.date;
        const numberOfTabs = req.body.nTabs;
        if (windowId && sessionId && date && numberOfTabs && !isNaN(windowId) && !isNaN(numberOfTabs) && !isNaN(date) ){
            windowService.checkWindowExists(windowId, sessionId,  res.user, existValue => {
                if (existValue){
                    res.status(400);
                    res.json({access: false, message: 'Esa venta ya está almacenada'});
                } else{
                    //Guardar la pestaña
                    windowService.createWindow({'windowId': windowId,  'sessionId': sessionId, 'username': res.user, 'date': date ,'numberOfTabs': numberOfTabs  }, resultId => {
                        if (resultId != null){
                            res.status(200);
                            res.json({access: true, message: 'Ventana guardada'});
                        } else{
                            res.status(500);
                            res.json({access: false, message: 'Error desconocido al guardar la ventana'});
                        }
                    });
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.get("/api/obtenerVentanas", function (req, res) {
        const username =res.user;
        windowService.getWindows(username, windows => {
            res.status(200);
            res.json({message: 'Ventanas obtenidas', windowss: windows});
        });
    });
};
