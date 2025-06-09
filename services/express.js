const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sender = require('../lib/Sender');
const Validator = require('../lib/Validator');
const logger = require('../logging/logger');

const app = express();
const validator = new Validator();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/', (req, res) => {
    const validation = validator.validateEvent(req.body);
    if (!validation.isValid) {
        logger.warn(`Validation failed: ${validation.error}`);
        return res.status(400).json({
            status: 'error',
            message: validation.error
        });
    }

    const sender = new Sender(logger);
    sender.send(req.body)
        .then(response => {
            res.status(200).json({
                status: 'success',
                data: response
            });
        })
        .catch(error => {
            logger.error('Sending failed:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to process event'
            });
        });
});

app.options('/', (req, res) => {
    res.status(200).end();
});

// Start server
const start = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
    });
};

module.exports = { start };