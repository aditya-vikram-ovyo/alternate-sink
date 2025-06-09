class Validator {
    validateEvent(event) {
        if (!event) {
            return { isValid: false, error: 'Event object is required' };
        }

        // Required fields for all events
        const requiredFields = [
            'event', 'sessionId', 'timestamp', 'playerSource',
            'domain', 'contentId', 'contentTitle', 'videoDuration'
        ];

        // Check required fields
        for (const field of requiredFields) {
            if (!event[field]) {
                return { isValid: false, error: `Missing required field: ${field}` };
            }
        }

        // Validate field types
        const typeChecks = {
            event: 'string',
            sessionId: 'string',
            timestamp: 'string',
            playerSource: 'string',
            domain: 'string',
            contentId: 'number',
            contentTitle: 'string',
            videoDuration: 'number'
        };

        for (const [field, type] of Object.entries(typeChecks)) {
            if (typeof event[field] !== type) {
                return { isValid: false, error: `Field ${field} must be ${type}` };
            }
        }

        // Event-specific validations
        switch (event.event) {
            case 'metadata':
                if (!event.userId) {
                    return { isValid: false, error: 'userId is required for metadata events' };
                }
                break;

            case 'heartbeat':
                if (typeof event.duration !== 'number' || event.duration < 0) {
                    return { isValid: false, error: 'duration must be a positive number for heartbeat' };
                }
                break;

            case 'bitratechanged':
                if (typeof event.videoBitrate !== 'number' || event.videoBitrate <= 0) {
                    return { isValid: false, error: 'videoBitrate must be positive number' };
                }
                break;
        }

        // Timestamp format validation (ISO 8601)
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(event.timestamp)) {
            return { isValid: false, error: 'timestamp must be ISO 8601 format' };
        }

        return { isValid: true };
    }
}

module.exports = Validator;