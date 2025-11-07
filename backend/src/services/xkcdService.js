const axios = require('axios');
const User = require('../models/User');
const emailService = require('./emailService');
const cron = require('node-cron');
const crypto = require('crypto');

class XKCDService {
  constructor() {
    // XKCD has about 2800+ comics, so we'll fetch from 1 to 3000
    this.maxComicId = 3000;
    this.scheduledJobs = new Map(); // Map to store scheduled jobs per time slot
    this.lastKnownPreferences = new Set(); // Track last known preferences for change detection
  }

  async getRandomComic(maxRetries = 10) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Get a random comic ID
        const randomId = Math.floor(Math.random() * this.maxComicId) + 1;
        const response = await axios.get(`https://xkcd.com/${randomId}/info.0.json`);
        
        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed to fetch XKCD comic:`, error.message);
      }
    }
    
    // After max retries, return a default comic
    console.warn(`Failed to fetch XKCD comic after ${maxRetries} attempts`);
    return {
      title: 'XKCD Comic',
      img: 'https://imgs.xkcd.com/static/comic_info.png',
      alt: 'XKCD Comic Image',
      transcript: 'Unable to fetch XKCD comic at this time.',
      num: 0,
      year: '2023',
      month: '1',
      day: '1'
    };
  }

  async sendXKCDToSubscribersForTime(preferredTime = '09:00') {
    try {
      const batchSize = 100; // Process users in smaller batches
      let skip = 0;
      let totalProcessed = 0;
      
      while (true) {
        // Fetch a batch of users instead of all users
        const users = await User.find({
          isVerified: true,
          unsubscribed: false,
          preferredTime: preferredTime
        })
        .select('_id email') // Only fetch required fields
        .skip(skip)
        .limit(batchSize);
        
        if (users.length === 0) {
          break; // No more users to process
        }
        
        // Get a random XKCD comic for this batch
        const comic = await this.getRandomComic();
        
        // Generate unsubscribe tokens and prepare bulk operations for this batch
        const bulkOps = users.map(user => {
          const token = crypto.randomBytes(32).toString('hex');
          const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
          
          return {
            updateOne: {
              filter: { _id: user._id },
              update: { 
                $set: { 
                  unsubscribeToken: token,
                  unsubscribeTokenExpires: expires
                }
              }
            }
          };
        });
        
        // Bulk update tokens for this batch
        if (bulkOps.length > 0) {
          await User.bulkWrite(bulkOps);
        }
        
        // Send emails for this batch in parallel
        const emailPromises = users.map(user => {
          // Find the corresponding token for this user
          const userToken = bulkOps.find(op => 
            op.updateOne.filter._id.toString() === user._id.toString()
          ).updateOne.update.$set.unsubscribeToken;
          
          return emailService.sendXKCDComicEmail(user.email, comic, userToken);
        });
        
        const results = await Promise.allSettled(emailPromises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Processed batch starting at ${skip}: ${successful} successful, ${failed} failed`);
        
        totalProcessed += users.length;
        skip += batchSize;
        
        // Optional: Add a small delay between batches to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`Total users processed for time ${preferredTime}: ${totalProcessed}`);
    } catch (error) {
      console.error('Error in sendXKCDToSubscribersForTime:', error);
    }
  }

  setsAreEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  // Schedule jobs based on unique time preferences with change detection
  async scheduleDynamicXKCD() {
    try {
      // Get current unique preferred times
      const currentPreferences = await User.distinct('preferredTime', {
        isVerified: true,
        unsubscribed: false
      });
      
      // Convert to Set for easy comparison
      const currentPreferencesSet = new Set(currentPreferences);
      
      // Check if preferences actually changed
      const preferencesChanged = !this.setsAreEqual(
        this.lastKnownPreferences, 
        currentPreferencesSet
      );
      
      if (!preferencesChanged) {
        console.log('No preference changes detected, skipping rescheduling');
        return;
      }
      
      // Update stored preferences
      this.lastKnownPreferences = currentPreferencesSet;
      
      // Clear existing jobs
      for (const [time, job] of this.scheduledJobs) {
        job.stop();
      }
      this.scheduledJobs.clear();

      // Schedule a job for each unique time preference
      for (const preferredTime of currentPreferences) {
        const [hour, minute] = preferredTime.split(':');
        // Schedule for all days of the week
        const cronExpression = `${minute || '0'} ${hour || '9'} * * *`;
        
        const job = cron.schedule(cronExpression, async () => {
          console.log(`Sending daily XKCD comics at ${preferredTime}`, new Date());
          await this.sendXKCDToSubscribersForTime(preferredTime);
        });
        
        this.scheduledJobs.set(preferredTime, job);
        console.log(`Scheduled XKCD delivery at ${preferredTime} with cron: ${cronExpression}`);
      }

      console.log(`Rescheduled ${currentPreferences.length} XKCD delivery jobs`);
    } catch (error) {
      console.error('Error scheduling XKCD jobs:', error);
    }
  }

  // Schedule XKCD delivery jobs (without the 10-minute re-scheduling)
  async scheduleDailyXKCD() {
    console.log('XKCD scheduler started with change detection');
    
    // Run the initial scheduling
    await this.scheduleDynamicXKCD();
  }
}

module.exports = new XKCDService();