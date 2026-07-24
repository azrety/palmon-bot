let session = null;


function createSession(data){

    session = data;

}


function getSession(){

    return session;

}


function updateSession(data){

    session = {
        ...session,
        ...data
    };

}


function clearSession(){

    session = null;

}


module.exports = {
    createSession,
    getSession,
    updateSession,
    clearSession
};