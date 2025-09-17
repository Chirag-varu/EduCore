import Newsletter from "../../models/Newsletter.js";
import NewsletterSubscription from "../../models/NewsletterSubscription.js";
// import { sendBulkEmails } from "../../helpers/emailService.js";

// Create a new newsletter
const createNewsletter = async (req, res) => {
  try {
    const { title, subject, body, scheduledDate, topic = "general" } = req.body;
    const createdBy = req.user._id;
    
    // Basic validation
    if (!title || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, and body are required",
      });
    }
    
    let status = "draft";
    if (scheduledDate && new Date(scheduledDate) > new Date()) {
      status = "scheduled";
    }
    
    const newsletter = new Newsletter({
      title,
      subject,
      body,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      status,
      topic,
      createdBy,
    });
    
    const savedNewsletter = await newsletter.save();
    
    res.status(201).json({
      success: true,
      message: "Newsletter created successfully",
      data: savedNewsletter,
    });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create newsletter",
    });
  }
};

// Get all newsletters (for admin)
const getNewsletters = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const newsletters = await Newsletter.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "userName userEmail");
    
    res.status(200).json({
      success: true,
      data: newsletters,
    });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch newsletters",
    });
  }
};

// Get a single newsletter by ID
const getNewsletterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findById(id)
      .populate("createdBy", "userName userEmail");
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: newsletter,
    });
  } catch (error) {
    console.error("Error fetching newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter",
    });
  }
};

// Update a newsletter
const updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, body, scheduledDate, topic, status } = req.body;
    
    const newsletter = await Newsletter.findById(id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found",
      });
    }
    
    // Cannot edit newsletters that have already been sent
    if (newsletter.status === "sent" || newsletter.status === "sending") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a newsletter that has already been sent or is in the process of being sent",
      });
    }
    
    if (title) newsletter.title = title;
    if (subject) newsletter.subject = subject;
    if (body) newsletter.body = body;
    if (scheduledDate) newsletter.scheduledDate = new Date(scheduledDate);
    if (topic) newsletter.topic = topic;
    if (status) newsletter.status = status;
    
    // Update status if scheduled date has changed
    if (scheduledDate) {
      newsletter.status = new Date(scheduledDate) > new Date() ? "scheduled" : "draft";
    }
    
    const updatedNewsletter = await newsletter.save();
    
    res.status(200).json({
      success: true,
      message: "Newsletter updated successfully",
      data: updatedNewsletter,
    });
  } catch (error) {
    console.error("Error updating newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update newsletter",
    });
  }
};

// Send a newsletter now
const sendNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findById(id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found",
      });
    }
    
    // Cannot send newsletters that have already been sent
    if (newsletter.status === "sent") {
      return res.status(400).json({
        success: false,
        message: "This newsletter has already been sent",
      });
    }
    
    // Get active subscribers who are subscribed to this topic
    const subscribers = await NewsletterSubscription.find({ 
      isActive: true, 
      isConfirmed: true,
      subscribedTopics: { $in: [newsletter.topic] } 
    });
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active subscribers found for this topic",
      });
    }
    
    newsletter.status = "sending";
    newsletter.sendDate = new Date();
    newsletter.recipientCount = subscribers.length;
    await newsletter.save();
    
    /* 
    // Send emails in the background (this would use a proper email service)
    // This is commented out as it requires a proper email service setup
    try {
      const recipientEmails = subscribers.map(sub => sub.email);
      
      // Example of sending bulk emails (implementation depends on your email service)
      await sendBulkEmails({
        recipients: recipientEmails,
        subject: newsletter.subject,
        html: newsletter.body,
        trackingData: {
          newsletterId: newsletter._id
        }
      });
      
      // Update newsletter status
      newsletter.status = "sent";
      await newsletter.save();
    } catch (emailError) {
      console.error("Error sending newsletter emails:", emailError);
      newsletter.status = "failed";
      await newsletter.save();
      
      return res.status(500).json({
        success: false,
        message: "Failed to send newsletter emails",
      });
    }
    */
    
    // Simulate sending emails for development purposes
    setTimeout(async () => {
      newsletter.status = "sent";
      await newsletter.save();
    }, 3000);
    
    res.status(200).json({
      success: true,
      message: "Newsletter is being sent to " + subscribers.length + " subscribers",
      data: newsletter,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send newsletter",
    });
  }
};

// Delete a newsletter
const deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findById(id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found",
      });
    }
    
    // Cannot delete newsletters that have already been sent
    if (newsletter.status === "sent" || newsletter.status === "sending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a newsletter that has already been sent or is in the process of being sent",
      });
    }
    
    await newsletter.remove();
    
    res.status(200).json({
      success: true,
      message: "Newsletter deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete newsletter",
    });
  }
};

export default {
  createNewsletter,
  getNewsletters,
  getNewsletterById,
  updateNewsletter,
  sendNewsletter,
  deleteNewsletter,
};