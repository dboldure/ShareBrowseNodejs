module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    comprobarExisteBookmark: function(name, url, username, callback){
        const bookmark = {
            name: name,
            url: url,
            username: username
        };
        this.bdManagement.getBookmarks(bookmark, function (bookmarks) {
            if (bookmarks == null || bookmarks.length === 0) {
                callback(false);
            } else {
                callback(true,bookmarks[0]);
            }
        }.bind(this));
    },
    createExistentBookmark: function(bookmark, callback){
        this.bdManagement.addBookmark(bookmark, bookmarkId => {
            callback(bookmarkId);
        });
    },
    getBookmarks: function (username, callback) {
        const user = {
            username: username.trim()
        };
        this.bdManagement.getBookmarks(user, function (bookmarks) {
            if (bookmarks == null) {
                callback(null);
            } else {
                callback(bookmarks);
            }
        }.bind(this));
    },
    existBookmark: function(stringMongoID, callback){
        const bookmark = {
            _id: this.bdManagement.mongoPure.ObjectID(stringMongoID)
        };
        this.bdManagement.getBookmarks(bookmark, function (bookmarks) {
            if (bookmarks == null || bookmarks.length === 0) {
                callback(false);
            } else {
                callback(true,bookmarks[0]);
            }
        }.bind(this));
    },
    removeBookmark: function(stringMongoID, callback){
        const bookmark = {
            _id: this.bdManagement.mongoPure.ObjectID(stringMongoID)
        };
        this.bdManagement.deleteBookmark(bookmark, numberOfDeletions => {
            if (numberOfDeletions !== 1){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    removeBookmarkRemoved: function(name, url, callback){
        const bookmark = {
            name: name,
            url: url
        };
        this.bdManagement.deleteBookmark(bookmark, numberOfDeletions => {
            if (numberOfDeletions <= 0){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    removeMultipleBookmark: function(listado,index,username, error, objectId,callback){
        var id= listado[index]._id.toString();
        var name = listado[index].name;
        var url = listado[index].url;
        if (error > 0 && error < 5){
            const bookmark={
                _id: objectId,
                name: name,
                url :url,
                username: username
            };
            this.createExistentBookmark(bookmark, bookmarkId => {
                if (bookmarkId != null) {
                    if (index<listado.length-1){
                        this.removeMultipleBookmark(listado,++index,username,0,null,callback);
                    } else {
                        callback(200, {access: false, message: 'Edicion realizada'});
                    }
                } else {
                    this.removeMultipleBookmark(listado,index,username,++error,bookmark._id,callback);
                }
            });

        }else if (error === 0){
            this.existBookmark(id, (existValue, bookmark) => {
                if (existValue) {
                    bookmark.name= name;
                    bookmark.url = url;
                    this.removeBookmark(id, eraseResult => {
                        if (eraseResult) {
                            this.createExistentBookmark(bookmark, bookmarkId => {
                                if (bookmarkId != null) {
                                    if (index<listado.length-1){
                                        this.removeMultipleBookmark(listado,++index,username,0,null,callback);
                                    } else {
                                        callback(200, {access: false, message: 'Edicion realizada'});
                                    }
                                } else {
                                    this.removeMultipleBookmark(listado,index,username,++error,bookmark._id,callback);
                                }
                            });
                        } else {
                            callback(500, {access: false, message: 'Error desconocido al editar marcador'});
                        }
                    });
                } else {
                    callback(400, {access: false, message: 'El marcador no existe'});
                }
            });
        }
        else {
            if (index<listado.length-1){
                this.removeMultipleBookmark(listado,++index,username,0,null,callback);
            } else {
                callback(200, {access: false, message: 'Edicion realizada'});
            }
        }
    }
};
