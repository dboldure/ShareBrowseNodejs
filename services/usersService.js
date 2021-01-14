module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getUserToken: function(username, password, callback){
        let user = null;
        const secure = this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
            .update(password.trim()).digest('hex');
        user = {
            username: username.trim(),
            password: secure
        };
        this.bdManagement.getUser(user, function (users) {
            if (users == null) {
                callback(null);
            } else {
                if (users.length === 0){
                    this.bdManagement.getUser({username: username.trim()}, function (users2) {
                        if (users2.length === 0){
                            callback(null, users2);
                        } else{
                            callback(null);
                        }
                    });
                } else{
                    const token = this.app.get('jwt').sign({
                        user: user.username.trim(),
                        time: this.app.get("currentTimeWithSeconds")().valueOf()
                    }, this.app.get('tokenKey'));
                    callback(token, users[0]);
                }
            }
        }.bind(this));
    },
    existUsername: function(username, callback){
        const user = {
            username: username.trim()
        };
        this.bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0) {
                callback(false);
            } else {
                callback(true);
            }
        }.bind(this));
    },
    getUser: function(username, callback){
        const user = {
            username: username.trim()
        };
        this.bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0) {
                callback(null);
            } else {
                callback(users[0]);
            }
        }.bind(this));
    },
    createNewUser: function(username, password, callback){
        const secure = this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
            .update(password.trim()).digest('hex');
        const user = {
            username: username.trim(),
            password: secure,
            lastConnectionTime: this.app.get("currentTimeWithSeconds")().valueOf(),
            isConnected: true
        };
        this.bdManagement.addUser(user, userId => {
            callback(userId);
        });
    },
    removeUser: function(username, callback){
        const user = {
            username: username.trim()
        };
        this.bdManagement.deleteUser(user, numberOfDeletions => {
            if (numberOfDeletions !== 1){
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    createExistentUser: function(user, callback){
        this.bdManagement.addUser(user, userId => {
            callback(userId);
        });
    }
};
