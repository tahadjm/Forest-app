import Joi from 'joi';
import mongoose, { isValidObjectId } from 'mongoose';
const ChangelogSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.object({
      description: Joi.string().required(),
      updates: Joi.array().items(Joi.string().required()).min(1), // List of updates
      images: Joi.array().items(
          Joi.object({
              src: Joi.string().uri().required(), // Ensures valid URL format
          })
      ).min(1) // At least one image required
  }).required()
});


const newsSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  image: Joi.string().uri().required(),
  categories: Joi.array().items(Joi.string().min(2)).required(),
  locations: Joi.array().items(Joi.string().min(2)).required(),
});


const SignupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must be at most 30 characters long.",
    "any.required": "Username is required."
  }),
  email: Joi.string().min(6).max(60).required().email({
    tlds: { allow: ['com', 'net'] }
  }),
  password: Joi.string()
  .required()
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{10,}$'))
  .messages({
    "string.pattern.base": "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
  })
});
const SigninSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] }
    }),
    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{10}$'))

});
const verificationcodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] }
    }),
    providedcode: Joi.number().required()
})
const changepswSchema = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{10,}$')),
        oldPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{10}$'))
        .messages({
          "string.pattern.base": "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
      })

});
const isCodeexpired = (senttime) =>{
    const currenttime = Date.now();
    const elapsedTime = currenttime - senttime;
    const expirationTime = 5 * 60 * 1000; 
    return elapsedTime > expirationTime;
}
const forgotpswSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] }
    }),
    providedcode: Joi.number().min(6).required(),
    newPassword: Joi.string()
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{10,}$'))
    .messages({
      "string.pattern.base": "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
  })
})



const aboutSectionSchema = Joi.object({
  heroSection: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required()
  }).required(),
  
  aboutSection: Joi.object({
    title: Joi.string().required(),
    content: Joi.object({
      paragraph: Joi.string().required(),
      history: Joi.string().required(),
      commitment: Joi.string().required()
    }).required(),
    mainImage: Joi.string().uri().required(),
    yearsExperience: Joi.number().min(0).required()
  }).required(),
  
  stats: Joi.array().items(
    Joi.object({
      value: Joi.string().required(),
      label: Joi.string().required()
    })
  ).min(1).required(),
  
  teamMembers: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required(),
      image: Joi.string().uri().required()
    })
  ).min(1).required(),
  
  values: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      icon: Joi.string().valid(
        'safety', 
        'nature', 
        'fun', 
        'shield-check',
        'leaf',
        'trekking-pole'
      ).required()
    })
  ).min(1).required(),
  
  seo: Joi.object({
    metaTitle: Joi.string().allow(''),
    metaDescription: Joi.string().allow(''),
    keywords: Joi.array().items(Joi.string())
  }).optional()
});

export const faqItemSchema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

export const faqPageSchema = Joi.object({
  heroSection: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required()
  }).required(),

  faqs: Joi.array().items(faqItemSchema).min(1).required(),

  contactSection: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required()
  }).required()
});


const activitySchema = Joi.object({
  parkId: Joi.string().required(),
  name: Joi.string()
  .trim()
  .min(1)
  .required()
  .messages({
    "string.empty": "Activity name cannot be empty!",
    "any.required": "Activity name is required!"
  }),  
  isParcours: Joi.boolean().required(),
  description: Joi.string().optional(),
  features: Joi.array().items(
    Joi.object({
      feature: Joi.string().required(),
      description: Joi.string().required(),
      available: Joi.boolean().default(false),
    })
  ),
  details: Joi.object({
    déroulement: Joi.string().required(),
    duration: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
  }).required(),
  difficulty: Joi.when("isParcours", {
    is: true,
    then: Joi.object({
      level: Joi.string().valid("easy", "medium", "hard").required(),
      description: Joi.string().optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  HeaderImage: Joi.string().uri().optional(), // Added HeaderImage field with URL validation
  HeaderVideo: Joi.string().uri().optional(), // Added HeaderImage field with URL validation
  images: Joi.array().items(Joi.string()),
  categories: Joi.when("isParcours", {
    is: false,
    then: Joi.array()
      .items(
        Joi.object({
          name: Joi.string()
            .required()
            .messages({ "any.required": "Category name is required!" }),
          ageRequirement: Joi.string().required(),
          heightRequirement: Joi.string().required(),
          durationEstimated: Joi.string().required(),
          descriptionofCategory: Joi.string().required(),
          images: Joi.array().items(Joi.string()),
          video: Joi.string().optional(),
        })
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
  subParcours: Joi.when("isParcours", {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          name: Joi.string()
            .required()
            .messages({ "any.required": "SubParcours name is required!" }),
          numberOfWorkshops: Joi.number().optional(),
          durationEstimated: Joi.string().required(),
          description: Joi.string().required(),
          tyroliennes: Joi.number().optional(),
          description: Joi.string().optional(),
          images: Joi.array().items(Joi.string()),
          video: Joi.string().optional(),
        })
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
});



const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


// Schema for creating/updating a park
const parkSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  imageUrl: Joi.string().required(), // Added imageUrl field with URL validation
  headerMedia: Joi.string().required(), // New field for storing park header media
  headerMediaType: Joi.string().valid("image", "video").required(), // New field for storing park header media type
  workingHours: Joi.object()
    .pattern(
      Joi.string().valid(...daysOfWeek),
      Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        closed: Joi.boolean().default(false)
      })
    )
    .default({}),
    
  maxBookingDays: Joi.number().default(30),
  description: Joi.string().optional(),
  galleryImages: Joi.array().items(Joi.string().uri()).default([]).messages({
    "array.includes": "Each gallery image must be a valid URL.",
  }),

  facilities: Joi.array().items(Joi.string()).required(),

  rules: Joi.array().items(
    Joi.object({
      ruleNumber: Joi.number().integer().positive().required(),
      description: Joi.string().min(5).required(),
    })
  ).required()

}).custom((value, helpers) => {
  // Automatically determine closedDays based on missing workingHours
  const definedDays = Object.keys(value.workingHours);
  value.closedDays = daysOfWeek.filter(day => !definedDays.includes(day));
  return value;
});

// Schema for updating a park
 const updateParkSchema = Joi.object({
  name: Joi.string().optional(),
  location: Joi.string().optional(),
  workingHours: Joi.object()
    .pattern(
      Joi.string().valid(...daysOfWeek),
      Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        closed: Joi.boolean().default(false)
      })
    )
    .optional(),
  maxBookingDays: Joi.number().optional(),
  description: Joi.string().optional()
}).custom((value, helpers) => {
  if (value.workingHours) {
    const definedDays = Object.keys(value.workingHours);
    value.closedDays = daysOfWeek.filter(day => !definedDays.includes(day));
  }
  return value;
});

// Schema for adding a working day
 const addWorkingDaySchema = Joi.object({
  day: Joi.string().valid(...daysOfWeek).required(),
  hours: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    closed: Joi.boolean().default(false)
  }).required()
});





const subParcoursValidator = Joi.object({
  name: Joi.string()
  .required()
  .min(4) // Ensures the name has a minimum length of 4 characters
  .regex(/^[A-Za-z]+$/) // Accepts only alphabetic characters
  .messages({
    'string.min': 'Name must have at least 4 characters.',
    'string.pattern.base': 'Name must only contain alphabetic characters.',
  }),
  description: Joi.string() // Change from array to string
    .min(10)
    .required()
    .messages({
      "string.min": "Description must be at least 10 characters long.",
      "any.required": "Description is required.",
    }),  image: Joi.string().uri().required(), // ✅ Ensure a valid URL for the image
  numberOfWorkshops: Joi.number()
    .required()
    .positive()
    .messages({ "number.positive": "Number of workshops must be a positive number" }), // Correction de `message` en `messages`

  tyroliennes: Joi.number()
    .required()
    .integer()
    .positive()
    .messages({ "number.positive": "Tyroliennes must be a positive integer" }), // Correction

  description: Joi.string()
    .required()
    .min(10)
    .messages({
      "string.min": "Description must be at least 10 characters long.",
    }),
});

const addnewParcoursSchema = Joi.object({
  parkId: Joi.string()
  .required(),
  name: Joi.string()
  .required()
  .min(4) // Ensures the name has a minimum length of 4 characters
  .regex(/^[A-Za-z]+$/) // Accepts only alphabetic characters
  .messages({
    'string.min': 'Name must have at least 4 characters.',
    'string.pattern.base': 'Name must only contain alphabetic characters.',
  }),

  difficulty: Joi.object({
  level: Joi.string()
    .valid("easy", "medium", "hard") // Allow only these 3 values
    .required()
    .messages({
      'any.only': "Difficulty level must be one of 'easy', 'medium', or 'hard'.",
    }),

  description: Joi.string()
    .required()
    .min(10) // Minimum length for description
    .messages({
      'string.min': 'Description must be at least 10 characters long.',
    }),
  }),

  ageRequirement: Joi.string()
  .required()
  .pattern(/^\d+(-\d+)?(\+)?$/) // Validate formats like '3-8', '9+', etc.
  .messages({
    'string.pattern.base': "Age requirement must be in the format '3-8', '9+', or similar.",
  }),
subParcours: Joi.array().items(subParcoursValidator), // Réutilisation du schéma
})

const updateParcoursSchema = Joi.object({
  parkId: Joi.string().required().messages({
    'any.required': 'Park ID is required.',
  }),
  name: Joi.string()
    .min(4)
    .regex(/^[A-Za-z]+$/)
    .optional()
    .messages({
      'string.min': 'Name must have at least 4 characters.',
      'string.pattern.base': 'Name must only contain alphabetic characters.',
    }),
  newname: Joi.string()
    .min(4)
    .regex(/^[A-Za-z]+$/)
    .optional()
    .messages({
      'string.min': 'New name must have at least 4 characters.',
      'string.pattern.base': 'New name must only contain alphabetic characters.',
    }),
  difficulty: Joi.object({
    level: Joi.string()
      .valid("easy", "medium", "hard")
      .optional()
      .messages({
        'any.only': "Difficulty level must be one of 'easy', 'medium', or 'hard'.",
      }),
    description: Joi.string()
      .min(10)
      .optional()
      .messages({
        'string.min': 'Difficulty description must be at least 10 characters long.',
      }),
  }).optional(),
  ageRequirement: Joi.string()
    .pattern(/^\d+(-\d+)?(\+)?$/)
    .optional()
    .messages({
      'string.pattern.base': "Age requirement must be in the format '3-8', '9+', or similar.",
    }),
  heightRequirement: Joi.string().optional(),
  duration: Joi.number().optional(),
  description: Joi.string()
    .min(10)
    .optional()
    .messages({
      'string.min': 'Description must be at least 10 characters long.',
    }),
    subParcours: Joi.array().items(subParcoursValidator), // Réutilisation du schéma
});
  
const pricingSchema = Joi.object({
    description: Joi.string() // Change from array to string
    .min(10)
    .required()
    .messages({
      "string.min": "Description must be at least 10 characters long.",
      "any.required": "Description is required.",
    }),
    image: Joi.string().uri().optional(), // Optional and must be a valid URL if provided

  name: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "Name is required",
      "string.base": "Name must be a string",
      "string.empty": "Name cannot be empty",
    }),

  price: Joi.number()
    .required()
    .messages({
      "any.required": "Price is required",
      "number.base": "Price must be a number",
    }),

  additionalCharge: Joi.number()
    .optional()
    .messages({
      "number.base": "Additional charge must be a number",
    }),
});

const reciptSchema = Joi.object({
  id: Joi.string(),
  paymentId: Joi.string().required(),
  createdAt: Joi.date().optional(),
  bookings: Joi.array().items(Joi.custom(isValidObjectId)).min(1).required(),
  totalAmount: Joi.number().positive().required(),
  customerEmail: Joi.string().email().optional(),
  customerName: Joi.string().optional(),
  paymentMethod: Joi.string().valid('Chargily', 'Cash', 'Card').optional(),
  status: Joi.string().valid('paid', 'pending', 'failed').required()
})

export const bookingValidation = Joi.object({
  user: Joi.string().required(), // User ID
  park: Joi.string().required(), // Park ID
  pricing: Joi.string().required(), // Pricing ID
  type: Joi.string().valid("parcours", "activity").required(), // Type of booking
  date: Joi.date().iso().required(), // Booking date
  quantity: Joi.number().integer().min(1).required(), // Number of tickets booked
  totalPrice: Joi.number().min(0).required(), // Total price
  status: Joi.string().valid("pending", "confirmed", "cancelled").default("pending"), // Booking status
  paymentStatus: Joi.string().valid("pending", "paid", "failed").default("pending"), // Payment status
  paymentId: Joi.string().optional(), // Chargily transaction ID (optional)
  paymentMethod: Joi.string().valid("edahabia", "cib").optional(), // Payment method (optional)
});


const timeSlotSchema = Joi.object({
  startDate: Joi.date()
    .required()
    .messages({
      "date.base": "Start date must be a valid date.",
      "any.required": "Start date is required.",
    }),
  endDate: Joi.date()
    .required()
    .messages({
      "date.base": "End date must be a valid date.",
      "any.required": "End date is required.",
    }),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) // Validate "HH:MM" format
    .required()
    .messages({
      "string.pattern.base": "Start time must be in 'HH:MM' format.",
      "any.required": "Start time is required.",
    }),
  endTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) // Validate "HH:MM" format
    .required()
    .messages({
      "string.pattern.base": "End time must be in 'HH:MM' format.",
      "any.required": "End time is required.",
    }),
  ticketLimit: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Ticket limit must be a number.",
      "number.integer": "Ticket limit must be an integer.",
      "number.min": "Ticket limit cannot be negative.",
      "any.required": "Ticket limit is required.",
    }),
    availableTickets: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Available tickets must be a number.",
      "number.integer": "Available tickets must be an integer.",
      "number.min": "Available tickets cannot be negative.",
      "any.required": "Available tickets is required.",
    }),
  priceAdjustment: Joi.number()
    .default(0)
    .messages({
      "number.base": "Price adjustment must be a number.",
    }),
});

const SecuritySectionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  iconName: Joi.string().valid('Shield', 'Clipboard', 'HardHat', 'Link', 'BookOpen', 'Siren', 'TreePine').required(),
  imageUrl: Joi.string().required(),

})


export  { reciptSchema, SecuritySectionSchema, aboutSectionSchema, activitySchema,newsSchema ,ChangelogSchema, addWorkingDaySchema, updateParkSchema, subParcoursValidator, timeSlotSchema, pricingSchema, updateParcoursSchema,addnewParcoursSchema,parkSchema,isCodeexpired,forgotpswSchema,changepswSchema,SignupSchema,SigninSchema,verificationcodeSchema};
