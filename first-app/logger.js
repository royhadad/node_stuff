let url = 'http://mylogger.io/log';
function log(message)
{
    //send an http request
    console.log(message);
}
module.exports.jim = ()=>console.log("jimmie");
exports.log = log;