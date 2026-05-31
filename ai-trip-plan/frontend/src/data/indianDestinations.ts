// Indian States and Union Territories with their major cities
export interface Destination {
  name: string;
  type: 'state' | 'city' | 'ut';
  region?: string;
  country: string;
  parentState?: string; // For cities, the state they belong to
  hero_image: string;
  overview: string;
  highlights?: string[];
  rating?: number;
}

// Major Indian cities organized by state/region
const majorCities: Omit<Destination, 'hero_image' | 'overview'>[] = [
  // Andhra Pradesh
  { name: 'Visakhapatnam', type: 'city', region: 'South', country: 'India', parentState: 'Andhra Pradesh' },
  { name: 'Vijayawada', type: 'city', region: 'South', country: 'India', parentState: 'Andhra Pradesh' },
  { name: 'Tirupati', type: 'city', region: 'South', country: 'India', parentState: 'Andhra Pradesh' },
  { name: 'Guntur', type: 'city', region: 'South', country: 'India', parentState: 'Andhra Pradesh' },
  
  // Arunachal Pradesh
  { name: 'Itanagar', type: 'city', region: 'Northeast', country: 'India', parentState: 'Arunachal Pradesh' },
  { name: 'Tawang', type: 'city', region: 'Northeast', country: 'India', parentState: 'Arunachal Pradesh' },
  
  // Assam
  { name: 'Guwahati', type: 'city', region: 'Northeast', country: 'India', parentState: 'Assam' },
  { name: 'Silchar', type: 'city', region: 'Northeast', country: 'India', parentState: 'Assam' },
  { name: 'Kaziranga', type: 'city', region: 'Northeast', country: 'India', parentState: 'Assam' },
  
  // Bihar
  { name: 'Patna', type: 'city', region: 'East', country: 'India', parentState: 'Bihar' },
  { name: 'Gaya', type: 'city', region: 'East', country: 'India', parentState: 'Bihar' },
  { name: 'Bodh Gaya', type: 'city', region: 'East', country: 'India', parentState: 'Bihar' },
  { name: 'Nalanda', type: 'city', region: 'East', country: 'India', parentState: 'Bihar' },
  
  // Chhattisgarh
  { name: 'Raipur', type: 'city', region: 'Central', country: 'India', parentState: 'Chhattisgarh' },
  { name: 'Bastar', type: 'city', region: 'Central', country: 'India', parentState: 'Chhattisgarh' },
  
  // Delhi
  { name: 'New Delhi', type: 'city', region: 'North', country: 'India', parentState: 'Delhi' },
  { name: 'Old Delhi', type: 'city', region: 'North', country: 'India', parentState: 'Delhi' },
  { name: 'NCR', type: 'city', region: 'North', country: 'India', parentState: 'Delhi' },
  
  // Goa
  { name: 'Panaji', type: 'city', region: 'West', country: 'India', parentState: 'Goa' },
  { name: 'Margao', type: 'city', region: 'West', country: 'India', parentState: 'Goa' },
  { name: 'Baga', type: 'city', region: 'West', country: 'India', parentState: 'Goa' },
  { name: 'Calangute', type: 'city', region: 'West', country: 'India', parentState: 'Goa' },
  { name: 'Anjuna', type: 'city', region: 'West', country: 'India', parentState: 'Goa' },
  
  // Gujarat
  { name: 'Ahmedabad', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Surat', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Vadodara', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Rajkot', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Gandhinagar', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Dwarka', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Somnath', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Kutch', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  { name: 'Statue of Unity', type: 'city', region: 'West', country: 'India', parentState: 'Gujarat' },
  
  // Haryana
  { name: 'Gurugram', type: 'city', region: 'North', country: 'India', parentState: 'Haryana' },
  { name: 'Faridabad', type: 'city', region: 'North', country: 'India', parentState: 'Haryana' },
  { name: 'Kurukshetra', type: 'city', region: 'North', country: 'India', parentState: 'Haryana' },
  
  // Himachal Pradesh
  { name: 'Shimla', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Manali', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Dharamshala', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'McLeod Ganj', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Kullu', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Dalhousie', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Kasol', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  { name: 'Spiti', type: 'city', region: 'North', country: 'India', parentState: 'Himachal Pradesh' },
  
  // Jammu and Kashmir
  { name: 'Srinagar', type: 'city', region: 'North', country: 'India', parentState: 'Jammu and Kashmir' },
  { name: 'Jammu', type: 'city', region: 'North', country: 'India', parentState: 'Jammu and Kashmir' },
  { name: 'Leh', type: 'city', region: 'North', country: 'India', parentState: 'Ladakh' },
  { name: 'Gulmarg', type: 'city', region: 'North', country: 'India', parentState: 'Jammu and Kashmir' },
  { name: 'Pahalgam', type: 'city', region: 'North', country: 'India', parentState: 'Jammu and Kashmir' },
  
  // Jharkhand
  { name: 'Ranchi', type: 'city', region: 'East', country: 'India', parentState: 'Jharkhand' },
  { name: 'Jamshedpur', type: 'city', region: 'East', country: 'India', parentState: 'Jharkhand' },
  
  // Karnataka
  { name: 'Bengaluru', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Bangalore', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Mysore', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Mangalore', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Hubli', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Hampi', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Coorg', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Gokarna', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Chikmagalur', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  { name: 'Shimoga', type: 'city', region: 'South', country: 'India', parentState: 'Karnataka' },
  
  // Kerala
  { name: 'Thiruvananthapuram', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Kochi', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Kozhikode', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Alleppey', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Munnar', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Wayanad', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Varkala', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Kovalam', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Thekkady', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  { name: 'Bekal', type: 'city', region: 'South', country: 'India', parentState: 'Kerala' },
  
  // Madhya Pradesh
  { name: 'Bhopal', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Indore', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Gwalior', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Khajuraho', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Ujjain', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Sanchi', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Jabalpur', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Kanha', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  { name: 'Bandhavgarh', type: 'city', region: 'Central', country: 'India', parentState: 'Madhya Pradesh' },
  
  // Maharashtra
  { name: 'Mumbai', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Pune', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Nagpur', type: 'city', region: 'Central', country: 'India', parentState: 'Maharashtra' },
  { name: 'Nashik', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Aurangabad', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Ajanta', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Ellora', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Lonavala', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Mahabaleshwar', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Alibaug', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Shirdi', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  { name: 'Kolhapur', type: 'city', region: 'West', country: 'India', parentState: 'Maharashtra' },
  
  // Manipur
  { name: 'Imphal', type: 'city', region: 'Northeast', country: 'India', parentState: 'Manipur' },
  
  // Meghalaya
  { name: 'Shillong', type: 'city', region: 'Northeast', country: 'India', parentState: 'Meghalaya' },
  { name: 'Cherrapunji', type: 'city', region: 'Northeast', country: 'India', parentState: 'Meghalaya' },
  { name: 'Mawlynnong', type: 'city', region: 'Northeast', country: 'India', parentState: 'Meghalaya' },
  
  // Mizoram
  { name: 'Aizawl', type: 'city', region: 'Northeast', country: 'India', parentState: 'Mizoram' },
  
  // Nagaland
  { name: 'Kohima', type: 'city', region: 'Northeast', country: 'India', parentState: 'Nagaland' },
  { name: 'Dimapur', type: 'city', region: 'Northeast', country: 'India', parentState: 'Nagaland' },
  
  // Odisha
  { name: 'Bhubaneswar', type: 'city', region: 'East', country: 'India', parentState: 'Odisha' },
  { name: 'Puri', type: 'city', region: 'East', country: 'India', parentState: 'Odisha' },
  { name: 'Cuttack', type: 'city', region: 'East', country: 'India', parentState: 'Odisha' },
  { name: 'Konark', type: 'city', region: 'East', country: 'India', parentState: 'Odisha' },
  { name: 'Raghurajpur', type: 'city', region: 'East', country: 'India', parentState: 'Odisha' },
  
  // Punjab
  { name: 'Amritsar', type: 'city', region: 'North', country: 'India', parentState: 'Punjab' },
  { name: 'Chandigarh', type: 'city', region: 'North', country: 'India', parentState: 'Punjab' },
  { name: 'Ludhiana', type: 'city', region: 'North', country: 'India', parentState: 'Punjab' },
  { name: 'Jalandhar', type: 'city', region: 'North', country: 'India', parentState: 'Punjab' },
  { name: 'Patiala', type: 'city', region: 'North', country: 'India', parentState: 'Punjab' },
  
  // Rajasthan
  { name: 'Jaipur', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Udaipur', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Jodhpur', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Jaisalmer', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Ajmer', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Pushkar', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Mount Abu', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Ranthambore', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Bikaner', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Kota', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Bharatpur', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  { name: 'Alwar', type: 'city', region: 'North', country: 'India', parentState: 'Rajasthan' },
  
  // Sikkim
  { name: 'Gangtok', type: 'city', region: 'Northeast', country: 'India', parentState: 'Sikkim' },
  { name: 'Namchi', type: 'city', region: 'Northeast', country: 'India', parentState: 'Sikkim' },
  { name: 'Pelling', type: 'city', region: 'Northeast', country: 'India', parentState: 'Sikkim' },
  { name: 'Lachung', type: 'city', region: 'Northeast', country: 'India', parentState: 'Sikkim' },
  
  // Tamil Nadu
  { name: 'Chennai', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Coimbatore', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Madurai', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Ooty', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Kodaikanal', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Mahabalipuram', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Thanjavur', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Rameshwaram', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Kanyakumari', type: 'city', region: 'South', country: 'India', parentState: 'Tamil Nadu' },
  { name: 'Pondicherry', type: 'city', region: 'South', country: 'India', parentState: 'Puducherry' },
  
  // Telangana
  { name: 'Hyderabad', type: 'city', region: 'South', country: 'India', parentState: 'Telangana' },
  { name: 'Warangal', type: 'city', region: 'South', country: 'India', parentState: 'Telangana' },
  
  // Tripura
  { name: 'Agartala', type: 'city', region: 'Northeast', country: 'India', parentState: 'Tripura' },
  
  // Uttar Pradesh
  { name: 'Lucknow', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Agra', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Varanasi', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Prayagraj', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Kanpur', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Mathura', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Vrindavan', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Ayodhya', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Noida', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Greater Noida', type: 'city', region: 'North', country: 'India', parentState: 'Uttar Pradesh' },
  { name: 'Haridwar', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  
  // Uttarakhand
  { name: 'Dehradun', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Nainital', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Mussoorie', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Rishikesh', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Haridwar', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Almora', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Ranikhet', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Jim Corbett', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Valley of Flowers', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Badrinath', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  { name: 'Kedarnath', type: 'city', region: 'North', country: 'India', parentState: 'Uttarakhand' },
  
  // West Bengal
  { name: 'Kolkata', type: 'city', region: 'East', country: 'India', parentState: 'West Bengal' },
  { name: 'Darjeeling', type: 'city', region: 'East', country: 'India', parentState: 'West Bengal' },
  { name: 'Siliguri', type: 'city', region: 'East', country: 'India', parentState: 'West Bengal' },
  { name: 'Gangtok', type: 'city', region: 'East', country: 'India', parentState: 'Sikkim' },
  { name: 'Dooars', type: 'city', region: 'East', country: 'India', parentState: 'West Bengal' },
  { name: 'Sundarbans', type: 'city', region: 'East', country: 'India', parentState: 'West Bengal' },
  
  // Andaman and Nicobar
  { name: 'Port Blair', type: 'city', region: 'South', country: 'India', parentState: 'Andaman and Nicobar Islands' },
  { name: 'Havelock', type: 'city', region: 'South', country: 'India', parentState: 'Andaman and Nicobar Islands' },
  { name: 'Neil Island', type: 'city', region: 'South', country: 'India', parentState: 'Andaman and Nicobar Islands' },
  
  // Lakshadweep
  { name: 'Kavaratti', type: 'city', region: 'South', country: 'India', parentState: 'Lakshadweep' },
  { name: 'Agatti', type: 'city', region: 'South', country: 'India', parentState: 'Lakshadweep' },
  
  // Puducherry
  { name: 'Puducherry', type: 'city', region: 'South', country: 'India', parentState: 'Puducherry' },
];

// Default images for destinations
const defaultStateImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
const defaultCityImage = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80';

// State descriptions
const stateDescriptions: Record<string, string> = {
  'Andhra Pradesh': 'Known for its landmark temples and coastal beauty.',
  'Arunachal Pradesh': 'The Land of the Rising Sun with stunning Himalayan landscapes.',
  'Assam': 'Gateway to North-East India, famous for tea gardens and wildlife.',
  'Bihar': 'Center of ancient learning and Buddhist heritage.',
  'Chhattisgarh': 'Heart of India with rich forest cover and tribal culture.',
  'Delhi': 'A blend of history and modernity, India\'s capital.',
  'Goa': 'Beach capital of India with Portuguese heritage.',
  'Gujarat': 'Rich heritage, vibrant culture, and the Statue of Unity.',
  'Haryana': 'Land of diverse landscapes and ancient history.',
  'Himachal Pradesh': 'Devbhoomi - Land of the Gods in the Himalayas.',
  'Jammu and Kashmir': 'Paradise on Earth with breathtaking valleys.',
  'Jharkhand': 'Land of forests and mineral wealth.',
  'Karnataka': 'One state, many worlds - from tech hubs to ancient ruins.',
  'Kerala': 'God\'s Own Country with serene backwaters.',
  'Madhya Pradesh': 'The heart of India with wildlife and temples.',
  'Maharashtra': 'Land of diversity, caves, and Bollywood.',
  'Manipur': 'Jewel of India with unique culture and landscapes.',
  'Meghalaya': 'Abode of the clouds with living root bridges.',
  'Mizoram': 'Land of the hill people with pristine nature.',
  'Nagaland': 'Land of festivals and warrior tribes.',
  'Odisha': 'Soul of Incredible India with ancient temples.',
  'Punjab': 'Land of Five Rivers and the Golden Temple.',
  'Rajasthan': 'The Land of Kings with majestic forts and palaces.',
  'Sikkim': 'Himalayan Shangri-la with pristine beauty.',
  'Tamil Nadu': 'Land of ancient temples and rich traditions.',
  'Telangana': 'Seed of history with Charminar and biryani.',
  'Tripura': 'Hilly landscape and rich cultural heritage.',
  'Uttar Pradesh': 'Home to the Taj Mahal and sacred cities.',
  'Uttarakhand': 'Land of the gods with Himalayan pilgrimage sites.',
  'West Bengal': 'Cultural capital of India with colonial heritage.',
  'Andaman and Nicobar Islands': 'Tropical paradise with pristine beaches.',
  'Chandigarh': 'India\'s first planned city designed by Le Corbusier.',
  'Dadra and Nagar Haveli and Daman and Diu': 'Coastal charm and Portuguese heritage.',
  'Ladakh': 'The Land of High Passes with dramatic landscapes.',
  'Lakshadweep': 'Coral paradise of India with turquoise waters.',
  'Puducherry': 'The French Riviera of the East.',
};

// Create the complete destinations list
export const indianDestinations: Destination[] = [
  // States and UTs
  {
    name: 'Andhra Pradesh',
    type: 'state',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Andhra Pradesh'],
  },
  {
    name: 'Arunachal Pradesh',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1548482823-349cfef31109?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Arunachal Pradesh'],
  },
  {
    name: 'Assam',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Assam'],
  },
  {
    name: 'Bihar',
    type: 'state',
    region: 'East',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1622163614406-b1581297bad1?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Bihar'],
  },
  {
    name: 'Chhattisgarh',
    type: 'state',
    region: 'Central',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Chhattisgarh'],
  },
  {
    name: 'Delhi',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1587474260584-13657452c717?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Delhi'],
  },
  {
    name: 'Goa',
    type: 'state',
    region: 'West',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1512789170660-e01f1c626bc0?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Goa'],
  },
  {
    name: 'Gujarat',
    type: 'state',
    region: 'West',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Gujarat'],
  },
  {
    name: 'Haryana',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1620800000000-000000000000?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Haryana'],
  },
  {
    name: 'Himachal Pradesh',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Himachal Pradesh'],
  },
  {
    name: 'Jammu and Kashmir',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1566833925222-f6ae27063f69?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Jammu and Kashmir'],
  },
  {
    name: 'Jharkhand',
    type: 'state',
    region: 'East',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1622163614406-b1581297bad1?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Jharkhand'],
  },
  {
    name: 'Karnataka',
    type: 'state',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Karnataka'],
  },
  {
    name: 'Kerala',
    type: 'state',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Kerala'],
  },
  {
    name: 'Madhya Pradesh',
    type: 'state',
    region: 'Central',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1584271854089-9bb3e5168e32?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Madhya Pradesh'],
  },
  {
    name: 'Maharashtra',
    type: 'state',
    region: 'West',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1566550967313-583d09d444e0?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Maharashtra'],
  },
  {
    name: 'Manipur',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Manipur'],
  },
  {
    name: 'Meghalaya',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Meghalaya'],
  },
  {
    name: 'Mizoram',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Mizoram'],
  },
  {
    name: 'Nagaland',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1541014163451-419478f4604d?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Nagaland'],
  },
  {
    name: 'Odisha',
    type: 'state',
    region: 'East',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1588096383061-00d9226d7c7c?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Odisha'],
  },
  {
    name: 'Punjab',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1514222139-b576bb553ed7?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Punjab'],
  },
  {
    name: 'Rajasthan',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Rajasthan'],
  },
  {
    name: 'Sikkim',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1616190419596-e2839e7380d7?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Sikkim'],
  },
  {
    name: 'Tamil Nadu',
    type: 'state',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Tamil Nadu'],
  },
  {
    name: 'Telangana',
    type: 'state',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1610482200000-000000000000?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Telangana'],
  },
  {
    name: 'Tripura',
    type: 'state',
    region: 'Northeast',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Tripura'],
  },
  {
    name: 'Uttar Pradesh',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Uttar Pradesh'],
  },
  {
    name: 'Uttarakhand',
    type: 'state',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Uttarakhand'],
  },
  {
    name: 'West Bengal',
    type: 'state',
    region: 'East',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1558431382-27e39cbef4bc?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['West Bengal'],
  },
  {
    name: 'Andaman and Nicobar Islands',
    type: 'ut',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1589136140230-c720d11a4e94?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Andaman and Nicobar Islands'],
  },
  {
    name: 'Chandigarh',
    type: 'ut',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Chandigarh'],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'ut',
    region: 'West',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1597042055660-f9e013019865?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Dadra and Nagar Haveli and Daman and Diu'],
  },
  {
    name: 'Ladakh',
    type: 'ut',
    region: 'North',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1581793745862-99f579662e7b?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Ladakh'],
  },
  {
    name: 'Lakshadweep',
    type: 'ut',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1590523275443-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Lakshadweep'],
  },
  {
    name: 'Puducherry',
    type: 'ut',
    region: 'South',
    country: 'India',
    hero_image: 'https://images.unsplash.com/photo-1590050752117-23a9d7f66de9?auto=format&fit=crop&w=1200&q=80',
    overview: stateDescriptions['Puducherry'],
  },
  // Add cities with default images
  ...majorCities.map(city => ({
    ...city,
    hero_image: defaultCityImage,
    overview: `A major city in ${city.parentState || city.region || 'India'}.`,
  } as Destination)),
];

// Export just the names for quick access
export const allDestinationNames = indianDestinations.map(d => d.name);

// Search function with optimized filtering
export function searchDestinations(query: string, limit?: number): Destination[] {
  if (!query.trim()) {
    return limit ? indianDestinations.slice(0, limit) : indianDestinations;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Prioritize exact matches and startsWith matches
  const startsWith = indianDestinations.filter(d => 
    d.name.toLowerCase().startsWith(normalizedQuery)
  );
  
  const includes = indianDestinations.filter(d => 
    d.name.toLowerCase().includes(normalizedQuery) && 
    !d.name.toLowerCase().startsWith(normalizedQuery)
  );
  
  const results = [...startsWith, ...includes];
  
  // Remove duplicates based on name
  const unique = results.filter((d, index, self) => 
    index === self.findIndex(t => t.name === d.name)
  );
  
  return limit ? unique.slice(0, limit) : unique;
}

export default indianDestinations;