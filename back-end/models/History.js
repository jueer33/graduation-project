const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleType: {
    type: String,
    enum: ['text-to-design', 'image-to-design', 'design-to-code'],
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  userInput: {
    type: String,
    default: ''
  },
  designJson: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  generatedCode: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  framework: {
    type: String,
    enum: ['react', 'vue', 'html'],
    default: null
  },
  imagePaths: {
    type: [String],
    default: []
  },
  conversations: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);

