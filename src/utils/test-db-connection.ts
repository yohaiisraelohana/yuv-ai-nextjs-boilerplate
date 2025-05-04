import { connectToDatabase } from '@/lib/mongodb';

/**
 * Tests the MongoDB connection
 * @returns {Promise<{ success: boolean, message: string }>} The result of the connection test
 */
export async function testMongoDbConnection() {
  try {
    const mongoose = await connectToDatabase();
    
    // Check connection state
    if (mongoose.connection.readyState === 1) {
      return {
        success: true,
        message: 'Successfully connected to MongoDB',
        details: {
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          models: Object.keys(mongoose.models),
          readyState: 'Connected'
        }
      };
    } else {
      const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
      return {
        success: false,
        message: 'Not connected to MongoDB',
        details: {
          readyState: states[mongoose.connection.readyState] || 'Unknown'
        }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to connect to MongoDB',
      error: error.message
    };
  }
} 