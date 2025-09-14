import NewsletterSubscription from "../../models/NewsletterSubscription.js";
import crypto from "crypto";
import { sendEmail } from "../../helpers/emailService.js";

// Subscribe to newsletter
const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name, topics = ["general"] } = req.body;
    let userId = req.user?._id; // May be undefined for non-logged in users

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if already subscribed
    const existingSubscription = await NewsletterSubscription.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: "Email is already subscribed to the newsletter",
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.unsubscriptionDate = undefined;
        if (name) existingSubscription.name = name;
        if (topics && topics.length) existingSubscription.subscribedTopics = topics;
        
        await existingSubscription.save();
        
        return res.status(200).json({
          success: true,
          message: "Your subscription has been reactivated!",
          data: existingSubscription,
        });
      }
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    
    // Create new subscription
    const newSubscription = new NewsletterSubscription({
      email,
      name,
      subscribedTopics: topics,
      confirmationToken,
      userId,
    });
    
    const savedSubscription = await newSubscription.save();

    // Send confirmation email (commented out for now)
    // Try to send a confirmation email (handle error gracefully if email service is not set up)
    /* 
    try {
      await sendEmail({
        to: email,
        subject: "Confirm Your Newsletter Subscription",
        html: `
          <h1>Confirm Your Subscription</h1>
          <p>Thank you for subscribing to our newsletter. Please click the link below to confirm your subscription:</p>
          <a href="${process.env.CLIENT_URL}/confirm-subscription/${confirmationToken}">Confirm Subscription</a>
          <p>If you did not request this subscription, you can ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue without throwing error, just log it
    }
    */
    
    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data: savedSubscription,
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe to newsletter",
    });
  }
};

// Unsubscribe from newsletter
const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    
    const subscription = await NewsletterSubscription.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }
    
    subscription.isActive = false;
    subscription.unsubscriptionDate = new Date();
    
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe from newsletter",
    });
  }
};

// Confirm subscription with token
const confirmSubscription = async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscription = await NewsletterSubscription.findOne({ confirmationToken: token });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired confirmation token",
      });
    }
    
    subscription.isConfirmed = true;
    subscription.confirmationToken = undefined;
    
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: "Email subscription confirmed!",
    });
  } catch (error) {
    console.error("Error confirming subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm subscription",
    });
  }
};

// Get all active subscriptions (admin only)
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await NewsletterSubscription.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    });
  }
};

export default {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  confirmSubscription,
  getSubscriptions
};