import App from "./App";

// start app
const app = new App();
app.init().then(() => {
    console.log('hello world');
    return app.start();
}).catch(e => {
    console.error(e);
    process.exit(e.code || 1);
});


