module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getHistory: function (username, callback) {
        const user = {
            username: username.trim()
        };
        this.bdManagement.getHistory(user, function (history) {
            if (history == null) {
                callback(null);
            } else {
                callback(history);
            }
        }.bind(this));
    },
    existHistory: function(stringMongoID, callback){
        const history = {
            _id: this.bdManagement.mongoPure.ObjectID(stringMongoID)
        };
        this.bdManagement.getHistory(history, function (history) {
            if (history == null || history.length === 0) {
                callback(false);
            } else {
                callback(true,history[0]);
            }
        }.bind(this));
    },
    removeSomePagsHistory: function(arrayStringID, callback){
        const arrayStringIDObject = [];
        for(let i = 0; i < arrayStringID.length; i++){
            arrayStringIDObject.push(this.bdManagement.mongoPure.ObjectID(arrayStringID[i]));
        }
        const history = {
            _id: {$in:arrayStringIDObject}
        };
        this.bdManagement.deleteHistoryValue(history, numberOfDeletions => {
            if (numberOfDeletions <= 0){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    removePagHistory: function(stringMongoID, callback){
        const history = {
            _id: this.bdManagement.mongoPure.ObjectID(stringMongoID)
        };
        this.bdManagement.deleteHistoryValue(history, numberOfDeletions => {
            if (numberOfDeletions !== 1){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    getObjectIdHistory: function(id){
        return this.bdManagement.mongoPure.ObjectID(id);
    },
    removeHistory: function (username,callback) {
        const history = {
            username: username
        };
        this.bdManagement.deleteHistoryValue(history, numberOfDeletions => {
            if (numberOfDeletions < 1){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    checkHistoryValueExists: function(url, username, callback){
        this.bdManagement.getHistory({url: url, username: username}, historyValues => {
            if (historyValues == null || historyValues.length === 0){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    createHistoryValue: function(history, callback){
        this.bdManagement.addHistory(history, historyId => {
            callback(historyId);
        });
    }
};
