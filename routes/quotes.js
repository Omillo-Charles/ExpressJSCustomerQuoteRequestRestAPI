import express from 'express';

const router = express.Router();

// GET all quotes
router.get('/', (req, res) => {
    res.json({
        message: 'Get all quote requests',
        data: []
    });
});

// POST new quote request
router.post('/', (req, res) => {
    const { name, email, phone, service, message } = req.body;

    // Validation
    if (!name || !email || !service) {
        return res.status(400).json({
            error: 'Name, email, and service are required fields'
        });
    }

    // TODO: Save to database
    const quoteRequest = {
        id: Date.now(),
        name,
        email,
        phone,
        service,
        message,
        createdAt: new Date().toISOString()
    };

    res.status(201).json({
        message: 'Quote request submitted successfully',
        data: quoteRequest
    });
});

// GET specific quote by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    // TODO: Fetch from database
    res.json({
        message: `Get quote request ${id}`,
        data: { id }
    });
});

export default router;