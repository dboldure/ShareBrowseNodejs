module.exports = {
    app: null,
    mongoPure: null,
    init: function (app, mongo) {
        this.app = app;
        this.mongoPure = mongo;
    },
    getMongoClientObject: function(){
        return new this.mongoPure.MongoClient(this.app.get('db'), { useNewUrlParser: true, useUnifiedTopology: true });
    },
    getValuesFromCollection: function (criteria, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.find(criteria).toArray(function (err, collectionValues) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(collectionValues);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    addSomeValuesToCollection: function (collectionValues, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.insertMany(collectionValues, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedCount);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    deleteValueFromCollection: function (criteria, collectionName, cascadeDeleteCallbackFunction, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.deleteMany(criteria, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        cascadeDeleteCallbackFunction(callbackFunction, result);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    addValueToCollection: function (collectionValue, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.insertOne(collectionValue, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    getUser: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'users', callbackFunction);
    },
    addUser: function (user, callbackFunction) {
        this.addValueToCollection(user, 'users', callbackFunction);
    },
    addSomeUsers: function (users, callbackFunction) {
        this.addSomeValuesToCollection(users, 'users', callbackFunction);
    },
    addBookmark: function (bookmarkValue, callbackFunction) {
        this.addValueToCollection(bookmarkValue, 'bookmarks', callbackFunction);
    },
    addHistory: function (historyValue, callbackFunction) {
        this.addValueToCollection(historyValue, 'historyValues', callbackFunction);
    },
    addWindow: function (window, callbackFunction) {
        this.addValueToCollection(window, 'windows', callbackFunction);
    },
    addTab: function (tab, callbackFunction) {
        this.addValueToCollection(tab, 'tabs', callbackFunction);
    },
    deleteBookmark: function (bookmarkCriteria, callbackFunction) {
        this.deleteValueFromCollection(bookmarkCriteria, 'bookmarks', (cbFunction, result) => {
            cbFunction(result.result.n);
        }, callbackFunction);
    },
    deleteUser: function (userCriteria, callbackFunction) {
        this.deleteValueFromCollection(userCriteria, 'users', (cbFunction, result) => {
            cbFunction(result.result.n);
        }, callbackFunction);
    },
    deleteHistoryValue: function (historyValueCriteria, callbackFunction) {
        this.deleteValueFromCollection(historyValueCriteria, 'historyValues', (cbFunction, result) => {
            cbFunction(result.result.n);
        }, callbackFunction);
    },
    getBookmarks: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'bookmarks', callbackFunction);
    },
    getHistory: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'historyValues', callbackFunction);
    },
    getWindows: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'windows', callbackFunction);
    },
    getTabs: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'tabs', callbackFunction);
    }
};
