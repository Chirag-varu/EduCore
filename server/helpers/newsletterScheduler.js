import Newsletter from '../models/Newsletter.js';
import NewsletterSubscription from '../models/NewsletterSubscription.js';
// import { sendBulkEmails } from '../helpers/emailService.js';

/**
 * This job checks for scheduled newsletters and sends them when their time comes
 */
export const processScheduledNewsletters = async () => {
  try {
    console.log('Checking for scheduled newsletters...');
    
    // Find newsletters that are scheduled for sending and the scheduled time has passed
    const scheduledNewsletters = await Newsletter.find({
      status: 'scheduled',
      scheduledDate: { $lte: new Date() }
    });
    
    console.log(`Found ${scheduledNewsletters.length} scheduled newsletters to send`);
    
    if (scheduledNewsletters.length === 0) {
      return;
    }
    
    // Process each newsletter
    for (const newsletter of scheduledNewsletters) {
      try {
        console.log(`Processing newsletter: ${newsletter.title}`);
        
        // Update status to sending
        newsletter.status = 'sending';
        newsletter.sendDate = new Date();
        await newsletter.save();
        
        // Get active subscribers who are subscribed to this topic
        const subscribers = await NewsletterSubscription.find({ 
          isActive: true, 
          isConfirmed: true,
          subscribedTopics: { $in: [newsletter.topic] } 
        });
        
        if (subscribers.length === 0) {
          console.log('No active subscribers found for this topic');
          newsletter.status = 'sent';
          newsletter.recipientCount = 0;
          await newsletter.save();
          continue;
        }
        
        newsletter.recipientCount = subscribers.length;
        
        /* 
        // This would be the actual email sending in production
        try {
          const recipientEmails = subscribers.map(sub => sub.email);
          
          await sendBulkEmails({
            recipients: recipientEmails,
            subject: newsletter.subject,
            html: newsletter.body,
            trackingData: {
              newsletterId: newsletter._id
            }
          });
        } catch (emailError) {
          console.error('Error sending newsletter emails:', emailError);
          newsletter.status = 'failed';
          await newsletter.save();
          continue;
        }
        */
        
        // For development, just mark it as sent
        newsletter.status = 'sent';
        await newsletter.save();
        
        console.log(`Newsletter "${newsletter.title}" sent to ${subscribers.length} subscribers`);
      } catch (error) {
        console.error(`Error processing newsletter ${newsletter._id}:`, error);
        // Try to mark as failed if possible
        try {
          newsletter.status = 'failed';
          await newsletter.save();
        } catch (saveError) {
          console.error('Error updating newsletter status:', saveError);
        }
      }
    }
    
  } catch (error) {
    console.error('Error in processScheduledNewsletters job:', error);
  }
};

// For use in server startup
export const startNewsletterScheduler = () => {
  // Run immediately on startup
  processScheduledNewsletters();
  
  // Then check every 15 minutes
  const intervalMinutes = 15;
  const interval = intervalMinutes * 60 * 1000; // convert to milliseconds
  
  console.log(`Setting up newsletter scheduler to run every ${intervalMinutes} minutes`);
  
  setInterval(processScheduledNewsletters, interval);
};