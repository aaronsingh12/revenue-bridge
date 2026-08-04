import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['contact', 'book-call', 'work-with-us']
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 160 },
    role: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    message: { type: String, trim: true, maxlength: 4000 },
    preferredTime: { type: String, trim: true, maxlength: 200 },
    linkedin: { type: String, trim: true, maxlength: 300 },
    source: { type: String, trim: true, maxlength: 200, default: 'website' }
  },
  { timestamps: true }
)

export default mongoose.model('Lead', LeadSchema)
