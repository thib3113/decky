import App from './App';
import { app as ElectronApp, dialog } from 'electron';
import { logger } from './global';

// start app
const app = new App();
app.init()
    .then(() => {
        return app.start();
    })
    .catch((e: Error & { code?: number }) => {
        if (ElectronApp.isReady()) {
            dialog.showMessageBoxSync({
                title: e.message,
                message: e.stack,
                type: 'error'
            });
        }
        try {
            logger.error(e);
        } catch (err) {}
        console.error(e);
        process.exit(e.code || 1);
    });
