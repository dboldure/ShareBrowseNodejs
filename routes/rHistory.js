module.exports = function (app, historyService) {
    app.post("/api/anadirHistorial", function (req, res) {
        const lastVisitTime = req.body.lastVisitTime;
        const url= req.body.url.trim();
        if (lastVisitTime !== "" && url !== "" && url.indexOf("chrome-extension://") === -1){
            historyService.createHistoryValue({'addedTime': lastVisitTime, 'url': url, 'username': res.user}, historyId => {
                if (historyId != null){
                    res.status(200);
                    res.json({access: true, message: 'Historial guardado'});
                } else{
                    res.status(500);
                    res.json({access: false, message: 'Error desconocido al crear el historial'});
                }
            });
        } else{
            if (url.indexOf("chrome-extension://") !== -1){
                res.status(200);
                res.json({access: true, message: 'Historial no guardado por pertenecer a una extensión'});
            } else {
                res.status(400);
                res.json({access: false, message: 'Formato de datos inválido'});
            }
        }
    });

    app.get("/api/obtenerHistorial", function (req, res) {
        const username =res.user;
        historyService.getHistory(username, history => {
            res.status(200);
            res.json({message: 'Historial obtenido', historyy: history});
        });
    });

    app.post("/api/borrarEntradaConcretaHistorial", function (req, res) {
        const id= req.body.id;
        if (id !== "" && id.length >= 0){
            historyService.existHistory(id, (existValue) => {
                if (existValue) {
                    historyService.removePagHistory(id, eraseResult => {
                        if (eraseResult) {
                            res.status(200);
                            res.json({ message: 'Pagina del historial eliminada'});
                        } else {
                            res.status(500);
                            res.json({message: 'Error desconocido al borrar el historial'});
                        }
                    });
                } else{
                    res.status(500);
                    res.json({message: 'Error desconocido al borrar el historial'});
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });

    app.post("/api/borrarTodoHistorial", function (req, res) {
        const username =res.user;
        historyService.removeHistory(username, eraseResult => {
            if (eraseResult) {
                res.status(200);
                res.json({ message: 'Historial eliminado'});
            } else {
                res.status(500);
                res.json({message: 'Error desconocido al borrar el historial'});
            }
        });
    });

    app.post("/api/borrarEntradaHistorialSeleccionada", function (req, res) {
        const arrayID= req.body.listIDS;
        if (arrayID != null && arrayID.length > 0){
            historyService.removeSomePagsHistory(arrayID, eraseResult => {
                if (eraseResult) {
                    res.status(200);
                    res.json({ message: 'Paginas del historial eliminadas'});
                } else {
                    res.status(500);
                    res.json({message: 'Error desconocido al borrar el historial'});
                }
            });
        } else{
            res.status(400);
            res.json({access: false, message: 'Formato de datos inválido'});
        }
    });
};
