module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getTabs: function (username, callback) {
        const user = {
            username: username.trim()
        };
        this.bdManagement.getTabs(user, function (tabs) {
            if (tabs == null) {
                callback(null);
            } else {
                callback(tabs);
            }
        }.bind(this));
    },
    checkTabExists: function(windowId, sessionId, url, username, callback){
        this.bdManagement.getTabs({windowId: windowId, sessionId: sessionId, url: url, username: username}, tabs => {
            if (tabs == null || tabs.length === 0){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    createTab: function(tab, callback){
        this.bdManagement.addTab(tab, tabId => {
            callback(tabId);
        });
    }
};
