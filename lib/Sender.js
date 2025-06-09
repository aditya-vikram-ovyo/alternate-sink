const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

class Sender {
    constructor(logger) {
        this.logger = logger;
        this.client = new SQSClient({
            region: process.env.AWS_REGION,
            endpoint: process.env.SQS_ENDPOINT,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async send(event) {
        const params = {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify(event),
            MessageAttributes: {
                EventType: {
                    DataType: 'String',
                    StringValue: event.event
                },
                Timestamp: {
                    DataType: 'String',
                    StringValue: event.timestamp
                }
            }
        };

        try {
            const command = new SendMessageCommand(params);
            const result = await this.client.send(command);
            this.logger.info(`Event sent successfully: ${event.event}`, {
                messageId: result.MessageId,
                sessionId: event.sessionId,
                contentId: event.contentId
            });
            return result;
        } catch (error) {
            this.logger.error('Failed to send event:', {
                error: error.message,
                eventType: event.event,
                sessionId: event.sessionId
            });
            throw error;
        }
    }
}

module.exports = Sender;