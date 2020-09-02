import Initiator from "./objects/Initiator";

// start initiator

Initiator.init().then(() => {
    console.log('hello world');
}).catch(e => console.error(e));


