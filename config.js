const getApiUrl = () => {
    const serverPort = window.process.argv.find(arg => arg.startsWith('--server-port=')).split('=')[1];
    return `http://localhost:${serverPort}`;
};

module.exports = { getApiUrl };