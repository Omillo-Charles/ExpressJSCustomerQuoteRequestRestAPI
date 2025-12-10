import nodemailer from 'nodemailer';
import config from '../config/env.js';

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
            user: config.email.smtp.auth.user,
            pass: config.email.smtp.auth.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
export const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email configuration verified successfully');
        return true;
    } catch (error) {
        console.error('Email configuration verification failed:', error.message);
        return false;
    }
};

/**
 * Send email utility function
 * @param {Object} mailOptions - Email options
 * @returns {Promise<Object>}
 */
const sendEmail = async (mailOptions) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
    } catch (error) {
        console.error('Email sending failed:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Generate HTML template for quote request notification
 * @param {Object} quote - Quote data
 * @returns {string} HTML template
 */
const generateQuoteNotificationTemplate = (quote) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Quote Request</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .quote-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-bottom: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .service-specific { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Quote Request Received</h1>
            </div>
            
            <div class="content">
                <p>A new quote request has been submitted. Here are the details:</p>
                
                <div class="quote-details">
                    <h3>Contact Information</h3>
                    <div class="value"><span class="label">Name:</span> ${quote.name}</div>
                    <div class="value"><span class="label">Email:</span> ${quote.email}</div>
                    <div class="value"><span class="label">Phone:</span> ${quote.phone}</div>
                    ${quote.company ? `<div class="value"><span class="label">Company:</span> ${quote.company}</div>` : ''}
                </div>
                
                <div class="quote-details">
                    <h3>Project Details</h3>
                    <div class="value"><span class="label">Service:</span> ${quote.service}</div>
                    <div class="value"><span class="label">Timeline:</span> ${quote.timeline}</div>
                    <div class="value"><span class="label">Budget:</span> ${quote.currency} ${quote.budget.toLocaleString()}</div>
                    <div class="value"><span class="label">Description:</span> ${quote.description}</div>
                </div>
                
                ${generateServiceSpecificSection(quote)}
                
                <div class="quote-details">
                    <h3>System Information</h3>
                    <div class="value"><span class="label">Quote ID:</span> ${quote._id}</div>
                    <div class="value"><span class="label">Submitted:</span> ${new Date(quote.createdAt).toLocaleString()}</div>
                    <div class="value"><span class="label">Status:</span> ${quote.status}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated notification from Omytech Quote Request System</p>
                <p>Please do not reply to this email</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate service-specific section for email template
 * @param {Object} quote - Quote data
 * @returns {string} HTML section
 */
const generateServiceSpecificSection = (quote) => {
    let section = '';

    if (quote.service === 'Web Development' || quote.service === 'Mobile App Design') {
        section = `
        <div class="quote-details">
            <h3>Development Details</h3>
            ${quote.features && quote.features.length > 0 ? `<div class="value"><span class="label">Features:</span> ${quote.features.join(', ')}</div>` : ''}
            ${quote.hosting ? `<div class="value"><span class="label">Hosting:</span> ${quote.hosting}</div>` : ''}
            ${quote.domain ? `<div class="value"><span class="label">Domain:</span> ${quote.domain}</div>` : ''}
            ${quote.maintenance ? `<div class="value"><span class="label">Maintenance:</span> ${quote.maintenance}</div>` : ''}
        </div>
        `;
    }

    if (quote.service === 'UI/UX Design') {
        section = `
        <div class="quote-details">
            <h3>Design Details</h3>
            ${quote.designType && quote.designType.length > 0 ? `<div class="value"><span class="label">Design Type:</span> ${quote.designType.join(', ')}</div>` : ''}
            ${quote.platforms && quote.platforms.length > 0 ? `<div class="value"><span class="label">Platforms:</span> ${quote.platforms.join(', ')}</div>` : ''}
            ${quote.pages ? `<div class="value"><span class="label">Pages/Screens:</span> ${quote.pages}</div>` : ''}
        </div>
        `;
    }

    if (quote.service === 'Digital Marketing') {
        section = `
        <div class="quote-details">
            <h3>Marketing Details</h3>
            ${quote.marketingChannels && quote.marketingChannels.length > 0 ? `<div class="value"><span class="label">Marketing Channels:</span> ${quote.marketingChannels.join(', ')}</div>` : ''}
            ${quote.campaignDuration ? `<div class="value"><span class="label">Campaign Duration:</span> ${quote.campaignDuration}</div>` : ''}
            ${quote.targetAudience ? `<div class="value"><span class="label">Target Audience:</span> ${quote.targetAudience}</div>` : ''}
        </div>
        `;
    }

    return section;
};

/**
 * Generate HTML template for quote response to customer
 * @param {Object} quote - Quote data
 * @returns {string} HTML template
 */
const generateQuoteResponseTemplate = (quote) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Response</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .quote-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-bottom: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .quote-amount { background: #d4edda; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .quote-amount h2 { color: #155724; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Quote is Ready!</h1>
            </div>
            
            <div class="content">
                <p>Dear ${quote.name},</p>
                <p>Thank you for your interest in our services. We have reviewed your project requirements and prepared a quote for you.</p>
                
                <div class="quote-amount">
                    <h2>Quote Amount: ${quote.quotedCurrency} ${quote.quotedAmount.toLocaleString()}</h2>
                    ${priceBreakdown ? `<p><small>Complexity Level: ${priceBreakdown.complexity}</small></p>` : ''}
                </div>
                
                ${priceBreakdown && priceBreakdown.addons && priceBreakdown.addons.length > 0 ? `
                <div class="quote-details">
                    <h3>Included Services</h3>
                    <div class="value"><span class="label">Base Service:</span> ${quote.quotedCurrency} ${priceBreakdown.servicePrice.toLocaleString()}</div>
                    ${priceBreakdown.addons.map(addon =>
        `<div class="value"><span class="label">${addon.name}:</span> ${addon.currency} ${addon.price.toLocaleString()}</div>`
    ).join('')}
                </div>
                ` : ''}
                
                <div class="quote-details">
                    <h3>Project Summary</h3>
                    <div class="value"><span class="label">Service:</span> ${quote.service}</div>
                    <div class="value"><span class="label">Timeline:</span> ${quote.timeline}</div>
                    <div class="value"><span class="label">Your Budget:</span> ${quote.currency} ${quote.budget.toLocaleString()}</div>
                </div>
                
                ${quote.notes ? `
                <div class="quote-details">
                    <h3>Additional Notes</h3>
                    <p>${quote.notes}</p>
                </div>
                ` : ''}
                
                <div class="quote-details">
                    <h3>Next Steps</h3>
                    <p>If you're happy with this quote, please reply to this email or contact us at:</p>
                    <div class="value"><span class="label">Email:</span> ${config.email.from}</div>
                    <div class="value"><span class="label">Phone:</span> +254 XXX XXX XXX</div>
                </div>
                
                <p>This quote is valid for 30 days from the date of this email.</p>
                <p>We look forward to working with you!</p>
                
                <p>Best regards,<br>
                The OmyTech Team</p>
            </div>
            
            <div class="footer">
                <p>OmyTech - Professional Web Development & Digital Solutions</p>
                <p>Quote ID: ${quote._id}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Send quote request notification to admin
 * @param {Object} quote - Quote data
 * @returns {Promise<Object>}
 */
export const sendQuoteNotificationEmail = async (quote) => {
    const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `New Quote Request - ${quote.service} - ${quote.name}`,
        html: generateQuoteNotificationTemplate(quote),
        text: `
        New Quote Request Received
        
        Contact Information:
        Name: ${quote.name}
        Email: ${quote.email}
        Phone: ${quote.phone}
        ${quote.company ? `Company: ${quote.company}` : ''}
        
        Project Details:
        Service: ${quote.service}
        Timeline: ${quote.timeline}
        Budget: ${quote.currency} ${quote.budget.toLocaleString()}
        Description: ${quote.description}
        
        Quote ID: ${quote._id}
        Submitted: ${new Date(quote.createdAt).toLocaleString()}
        `
    };

    return await sendEmail(mailOptions);
};

/**
 * Send quote response to customer
 * @param {Object} quote - Quote data with quoted amount
 * @param {Object} priceBreakdown - Optional price breakdown details
 * @returns {Promise<Object>}
 */
export const sendQuoteResponseEmail = async (quote, priceBreakdown = null) => {
    const mailOptions = {
        from: config.email.from,
        to: quote.email,
        subject: `Your Quote is Ready - ${quote.service} Project`,
        html: generateQuoteResponseTemplate(quote),
        text: `
        Dear ${quote.name},
        
        Thank you for your interest in our services. We have reviewed your project requirements and prepared a quote for you.
        
        Quote Amount: ${quote.quotedCurrency} ${quote.quotedAmount.toLocaleString()}
        
        Project Summary:
        Service: ${quote.service}
        Timeline: ${quote.timeline}
        Your Budget: ${quote.currency} ${quote.budget.toLocaleString()}
        
        ${quote.notes ? `Additional Notes: ${quote.notes}` : ''}
        
        This quote is valid for 30 days from the date of this email.
        
        If you're happy with this quote, please reply to this email or contact us at ${config.email.from}
        
        We look forward to working with you!
        
        Best regards,
        The OmyTech Team
        
        Quote ID: ${quote._id}
        `
    };

    return await sendEmail(mailOptions);
};

/**
 * Send quote status update notification
 * @param {Object} quote - Quote data
 * @param {string} oldStatus - Previous status
 * @returns {Promise<Object>}
 */
export const sendStatusUpdateEmail = async (quote, oldStatus) => {
    const statusMessages = {
        pending: 'Your quote request is pending review',
        reviewed: 'Your quote request is being reviewed',
        quoted: 'Your quote is ready!',
        accepted: 'Thank you for accepting our quote',
        rejected: 'Quote was not accepted',
        completed: 'Your project has been completed'
    };

    const mailOptions = {
        from: config.email.from,
        to: quote.email,
        subject: `Quote Status Update - ${quote.service} Project`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Quote Status Update</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .status-update { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Quote Status Update</h1>
                </div>
                
                <div class="content">
                    <p>Dear ${quote.name},</p>
                    
                    <div class="status-update">
                        <h3>Status Changed: ${oldStatus} → ${quote.status}</h3>
                        <p>${statusMessages[quote.status]}</p>
                    </div>
                    
                    ${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
                    
                    <p>Quote ID: ${quote._id}</p>
                    <p>Service: ${quote.service}</p>
                    
                    <p>If you have any questions, please contact us at ${config.email.from}</p>
                    
                    <p>Best regards,<br>The OmyTech Team</p>
                </div>
                
                <div class="footer">
                    <p>OmyTech - Professional Web Development & Digital Solutions</p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: `
        Dear ${quote.name},
        
        Your quote status has been updated:
        Status: ${oldStatus} → ${quote.status}
        ${statusMessages[quote.status]}
        
        ${quote.notes ? `Notes: ${quote.notes}` : ''}
        
        Quote ID: ${quote._id}
        Service: ${quote.service}
        
        If you have any questions, please contact us at ${config.email.from}
        
        Best regards,
        The OmyTech Team
        `
    };

    return await sendEmail(mailOptions);
};

/**
 * Send test email to verify configuration
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>}
 */
export const sendTestEmail = async (testEmail = config.email.to) => {
    const mailOptions = {
        from: config.email.from,
        to: testEmail,
        subject: 'Test Email - OmyTech Quote System',
        html: `
        <h1>Email Configuration Test</h1>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>From: ${config.email.from}</p>
        `,
        text: `
        Email Configuration Test
        
        This is a test email to verify that the email configuration is working correctly.
        
        Sent at: ${new Date().toLocaleString()}
        From: ${config.email.from}
        `
    };

    return await sendEmail(mailOptions);
};