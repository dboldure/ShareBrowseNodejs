module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    checkUserExists: function(username, callback){
        const userCheck = {
            username: username
        };
        this.bdManagement.getUser(userCheck, function (users) {
            if (users == null || users.length === 0) {
                callback(false);
            } else{
                callback(true);
            }
        });
    },

};
