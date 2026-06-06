export interface TripItinerary {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
  meal_recommendations: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export interface Activity {
  time: string;
  activity: string;
  duration: string;
  cost_estimate?: string;
  tips?: string;
}

export interface HotelRecommendation {
  name: string;
  location: string;
  price_per_night: string;
  rating: number;
  amenities: string[];
  description: string;
  image_url: string;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  price_range: string;
  speciality: string;
  image_url: string;
}

export interface TripResponse {
  destination: string;
  duration_days: number;
  budget: string;
  travelers: number;
  interests: string[];
  itinerary: TripItinerary[];
  hotel_recommendations: HotelRecommendation[];
  restaurant_recommendations: RestaurantRecommendation[];
  total_estimated_cost: string;
  best_time_to_visit: string;
  visa_requirements: string;
  transportation_tips: string;
}

const mockTrips: { [key: string]: TripResponse } = {
  "bali": {
    destination: "Bali, Indonesia",
    duration_days: 5,
    budget: "Medium",
    travelers: 2,
    interests: ["beaches", "culture", "food"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Ubud Exploration",
        description: "Arrive at Ngurah Rai Airport, transfer to Ubud. Relax and explore the town.",
        activities: [
          {
            time: "10:00 AM",
            activity: "Arrive at Bali Airport",
            duration: "2 hours",
            tips: "Have USD handy for visa on arrival"
          },
          {
            time: "1:00 PM",
            activity: "Transfer to Ubud Resort",
            duration: "1.5 hours",
            cost_estimate: "$25-40"
          },
          {
            time: "3:00 PM",
            activity: "Ubud Art Market Walk",
            duration: "2 hours",
            tips: "Great for souvenirs, negotiate prices"
          },
          {
            time: "7:00 PM",
            activity: "Traditional Balinese Dinner",
            duration: "2 hours",
            cost_estimate: "$15-25"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Warung Pulau Kelapa (local Balinese)",
          dinner: "Sayan House (fine dining)"
        }
      },
      {
        day: 2,
        title: "Ubud Heritage & Nature",
        description: "Visit temples, rice paddies, and experience local culture.",
        activities: [
          {
            time: "9:00 AM",
            activity: "Tegallalang Rice Terraces",
            duration: "2 hours",
            cost_estimate: "$5"
          },
          {
            time: "11:30 AM",
            activity: "Monkey Forest Sanctuary",
            duration: "2 hours",
            tips: "Don't carry bags with zippers, monkeys love them"
          },
          {
            time: "2:00 PM",
            activity: "Lunch Break",
            duration: "1.5 hours",
            cost_estimate: "$10-15"
          },
          {
            time: "4:00 PM",
            activity: "Goa Gajah Temple (Elephant Cave)",
            duration: "1.5 hours",
            cost_estimate: "$3"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Nasi Campur at local warung",
          dinner: "Mozaic Beach Club (Michelin-starred)"
        }
      },
      {
        day: 3,
        title: "Bali South & Beaches",
        description: "Travel south to experience pristine beaches and water activities.",
        activities: [
          {
            time: "8:00 AM",
            activity: "Transfer to South Bali",
            duration: "2 hours",
            cost_estimate: "$30"
          },
          {
            time: "10:30 AM",
            activity: "Nusa Dua Beach",
            duration: "3 hours",
            tips: "Calm waters, perfect for swimming"
          },
          {
            time: "2:00 PM",
            activity: "Beach Club Lunch",
            duration: "2 hours",
            cost_estimate: "$20-30"
          },
          {
            time: "5:00 PM",
            activity: "Sunset at Seminyak Beach",
            duration: "1.5 hours",
            tips: "Pack a camera for stunning golden hour shots"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Single Fin Beach Club",
          dinner: "Bali Hai Cliff Restaurant (sunset views)"
        }
      },
      {
        day: 4,
        title: "Water Sports & Relaxation",
        description: "Try exciting water activities or relax at spa treatments.",
        activities: [
          {
            time: "9:00 AM",
            activity: "Surfing Lesson at Uluwatu",
            duration: "2 hours",
            cost_estimate: "$40",
            tips: "Intermediate and beginner lessons available"
          },
          {
            time: "12:00 PM",
            activity: "Beach Club Lunch",
            duration: "1.5 hours",
            cost_estimate: "$15-20"
          },
          {
            time: "3:00 PM",
            activity: "Traditional Balinese Spa",
            duration: "2 hours",
            cost_estimate: "$25-35",
            tips: "Book in advance for best timings"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Warung near Uluwatu Beach",
          dinner: "Jimbaran Beach Seafood Dinner"
        }
      },
      {
        day: 5,
        title: "Departure Day",
        description: "Last-minute shopping and departure.",
        activities: [
          {
            time: "10:00 AM",
            activity: "Last-minute shopping at Seminyak",
            duration: "2 hours",
            cost_estimate: "$50"
          },
          {
            time: "12:00 PM",
            activity: "Lunch",
            duration: "1.5 hours",
            cost_estimate: "$10-15"
          },
          {
            time: "2:00 PM",
            activity: "Transfer to Airport",
            duration: "1.5 hours",
            cost_estimate: "$30-40"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Airport restaurant before departure"
        }
      }
    ],
    hotel_recommendations: [
      {
        name: "The Oberoi, Bali",
        location: "Seminyak Beach",
        price_per_night: "$180-220",
        rating: 8.5,
        amenities: ["Pool", "Spa", "Fine Dining", "Beach Access", "WiFi"],
        description: "Luxury beachfront resort with world-class amenities and service.",
        image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
      },
      {
        name: "The Ritz-Carlton Bali",
        location: "Uluwatu",
        price_per_night: "$250-350",
        rating: 9.2,
        amenities: ["Clifftop Location", "9 Pools", "Spa", "5 Restaurants", "Premium Service"],
        description: "Ultra-luxury clifftop resort overlooking the Indian Ocean.",
        image_url: "https://images.unsplash.com/photo-1570129477492-45ea003588af?w=500&h=300&fit=crop"
      },
      {
        name: "Ubud Palace Resort",
        location: "Ubud",
        price_per_night: "$80-120",
        rating: 8.0,
        amenities: ["Cultural Setting", "Pool", "Yoga Classes", "Restaurant", "WiFi"],
        description: "Charming resort near Ubud Palace, blends local culture with modern comfort.",
        image_url: "https://images.unsplash.com/photo-1551632640-e3c7588c5e47?w=500&h=300&fit=crop"
      }
    ],
    restaurant_recommendations: [
      {
        name: "Mozaic Beach Club",
        cuisine: "Fine Dining Indonesian",
        location: "Seminyak",
        rating: 8.9,
        price_range: "$$$$",
        speciality: "Michelin-starred Indonesian cuisine with oceanfront views",
        image_url: "https://images.unsplash.com/photo-1504674900152-b8d16e6f7a96?w=500&h=300&fit=crop"
      },
      {
        name: "Sayan House",
        cuisine: "Modern Indonesian",
        location: "Ubud",
        rating: 8.5,
        price_range: "$$$",
        speciality: "Contemporary take on traditional Balinese dishes",
        image_url: "https://images.unsplash.com/photo-1517987859830-1bd0f073c5b8?w=500&h=300&fit=crop"
      },
      {
        name: "Warung Pulau Kelapa",
        cuisine: "Traditional Balinese",
        location: "Ubud",
        rating: 8.2,
        price_range: "$",
        speciality: "Authentic local food at budget-friendly prices",
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop"
      }
    ],
    total_estimated_cost: "$1200-1800",
    best_time_to_visit: "April to October (Dry Season)",
    visa_requirements: "Visa on Arrival available for most nationalities ($25-35)",
    transportation_tips: "Use Grab app for taxis, rent scooter for exploring (use helmet)"
  },
  "paris": {
    destination: "Paris, France",
    duration_days: 4,
    budget: "Premium",
    travelers: 2,
    interests: ["art", "culture", "food"],
    itinerary: [
      {
        day: 1,
        title: "Parisian Classics",
        description: "Experience iconic Paris attractions.",
        activities: [
          {
            time: "10:00 AM",
            activity: "Eiffel Tower",
            duration: "3 hours",
            cost_estimate: "$15-20"
          },
          {
            time: "1:30 PM",
            activity: "Lunch at Seine Riverside",
            duration: "1.5 hours",
            cost_estimate: "$25-40"
          },
          {
            time: "3:30 PM",
            activity: "Arc de Triomphe",
            duration: "1.5 hours",
            cost_estimate: "$10"
          }
        ],
        meal_recommendations: {
          breakfast: "Croissant at local café",
          lunch: "Café Flore",
          dinner: "Le Petit Pontoise"
        }
      },
      {
        day: 2,
        title: "Museum & Art",
        description: "Explore world-class museums and galleries.",
        activities: [
          {
            time: "9:00 AM",
            activity: "Louvre Museum",
            duration: "4 hours",
            cost_estimate: "$17",
            tips: "Book tickets online to skip lines"
          },
          {
            time: "2:00 PM",
            activity: "Lunch Break",
            duration: "1.5 hours",
            cost_estimate: "$20-30"
          }
        ],
        meal_recommendations: {
          breakfast: "Hotel breakfast",
          lunch: "Musée du Louvre Café",
          dinner: "Le Jules Verne (Michelin-starred at Eiffel Tower)"
        }
      }
    ],
    hotel_recommendations: [
      {
        name: "Plaza Athénée",
        location: "Champs-Élysées",
        price_per_night: "$400-600",
        rating: 9.3,
        amenities: ["Michelin-starred Restaurant", "Spa", "Concierge", "Luxury Suites"],
        description: "Iconic luxury hotel on famous avenue.",
        image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=300&fit=crop"
      }
    ],
    restaurant_recommendations: [
      {
        name: "L'Astrance",
        cuisine: "French Fine Dining",
        location: "Passy",
        rating: 8.8,
        price_range: "$$$$",
        speciality: "Three Michelin stars, contemporary French cuisine",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop"
      }
    ],
    total_estimated_cost: "$2500-4000",
    best_time_to_visit: "May to September",
    visa_requirements: "Schengen visa required for most non-EU nationals",
    transportation_tips: "Use Paris Métro for quick travel, get a Navigo weekly pass"
  }
};

export function getMockTripData(destination: string): TripResponse {
  const key = destination.split(",")[0].toLowerCase().trim();
  return (
    mockTrips[key] || {
      destination,
      duration_days: 5,
      budget: "Medium",
      travelers: 2,
      interests: ["sightseeing"],
      itinerary: generateBasicItinerary(destination),
      hotel_recommendations: generateBasicHotels(destination),
      restaurant_recommendations: generateBasicRestaurants(destination),
      total_estimated_cost: "$1500-2500",
      best_time_to_visit: "Year-round",
      visa_requirements: "Check with local embassy",
      transportation_tips: "Explore public transportation options"
    }
  );
}

function generateBasicItinerary(destination: string): TripItinerary[] {
  return Array.from({ length: 5 }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${destination}`,
    description: `Explore the best attractions and experiences on day ${i + 1}`,
    activities: [
      {
        time: "9:00 AM",
        activity: "Breakfast and relaxation",
        duration: "2 hours"
      },
      {
        time: "11:00 AM",
        activity: "Main attractions exploration",
        duration: "3 hours"
      },
      {
        time: "2:00 PM",
        activity: "Lunch",
        duration: "1.5 hours"
      },
      {
        time: "3:30 PM",
        activity: "Local experiences",
        duration: "3 hours"
      }
    ],
    meal_recommendations: {
      breakfast: "Hotel breakfast or local café",
      lunch: "Local restaurant",
      dinner: "Fine dining experience"
    }
  }));
}

function generateBasicHotels(destination: string): HotelRecommendation[] {
  return [
    {
      name: `Premier Hotel in ${destination}`,
      location: destination,
      price_per_night: "$100-150",
      rating: 8.5,
      amenities: ["WiFi", "Restaurant", "24-hour Service", "Fitness Center"],
      description: "Modern hotel with excellent service and comfortable rooms.",
      image_url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop"
    }
  ];
}

function generateBasicRestaurants(destination: string): RestaurantRecommendation[] {
  return [
    {
      name: `Local Cuisine at ${destination}`,
      cuisine: "Regional",
      location: destination,
      rating: 8.2,
      price_range: "$$",
      speciality: "Traditional local dishes",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop"
    }
  ];
}
