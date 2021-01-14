module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getWindows: function (username, callback) {
        const user = {
            username: username.trim()
        };
        this.bdManagement.getWindows(user, function (windows) {
            if (windows == null) {
                callback(null);
            } else {
                callback(windows);
            }
        }.bind(this));
    },
    checkWindowExists: function(windowId, sessionId, username, callback){
        this.bdManagement.getWindows({windowId: windowId, sessionId: sessionId, username: username}, windows => {
            if (windows == null || windows.length === 0){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    createWindow: function(window, callback){
        this.bdManagement.addWindow(window, windowId => {
            callback(windowId);
        });
    }
};
